import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildAssignmentNotificationDedupeKey,
  filterTenantAgentIds,
  isGlobalOrphanAgentId,
  isOfficeManagerRole,
  isTenantAssignableDeal,
} from "../src/lib/account/tenant-assignment.ts";
import {
  imarRadarScopedKey,
  imarRadarStorageScope,
} from "../src/lib/radar/imar-radar-storage-scope.ts";
import {
  isAllowlistedOfficialHost,
  isSafeRadarHealthUrl,
} from "../src/lib/radar/source-health.ts";
import { buildVoiceClientIdempotencyKey } from "../src/lib/voice-crm/idempotency-keys.ts";
import {
  isVoiceProcessingStale,
  resolveVoiceClaimDecision,
  VOICE_PROCESSING_STALE_MS,
} from "../src/lib/voice-crm/voice-processing-policy.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function readTracked(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function assertGitTracked(relativePath) {
  try {
    execSync(`git ls-files --error-unmatch -- "${relativePath.replace(/\\/g, "/")}"`, {
      cwd: root,
      stdio: "pipe",
    });
  } catch {
    assert.fail(`${relativePath} is not tracked in git index`);
  }
}

function gitOthersExcludingStandard() {
  return execSync("git ls-files --others --exclude-standard", {
    cwd: root,
    encoding: "utf8",
  })
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

const CRITICAL_TRACKED_PATHS = [
  "prisma/migrations/20260617200000_voice_crm_applied_action/migration.sql",
  "scripts/setup-voice-applied-action-table.mjs",
  "src/components/features/account/OfficeAssignmentPanel.tsx",
  "src/lib/account/tenant-assignment.ts",
  "src/lib/voice-crm/idempotency-keys.ts",
  "src/lib/voice-crm/reconcile-voice-log.ts",
  "src/lib/voice-crm/voice-applied-action-ledger.ts",
  "src/lib/voice-crm/voice-processing-policy.ts",
  "src/lib/voice-crm/voice-log-idempotency.ts",
];

const IMPORT_GRAPH_ROOTS = [
  "src/components/features/account/AccountSettingsView.tsx",
  "src/lib/voice-crm/apply-actions.ts",
  "src/lib/voice-crm/voice-log-store.ts",
];

function collectRelativeImports(filePath, seen = new Set()) {
  const normalized = filePath.replace(/\\/g, "/");
  if (seen.has(normalized)) return [];
  seen.add(normalized);

  const absolute = join(root, normalized);
  if (!existsSync(absolute)) return [];

  const source = readFileSync(absolute, "utf8");
  const imports = [];
  const importPattern = /from\s+["']@\/([^"']+)["']/g;
  let match = importPattern.exec(source);
  while (match) {
    const targetBase = `src/${match[1]}`;
    const candidates = [
      targetBase,
      `${targetBase}.ts`,
      `${targetBase}.tsx`,
      `${targetBase}/index.ts`,
      `${targetBase}/index.tsx`,
    ];
    const resolved = candidates.find((candidate) => existsSync(join(root, candidate)));
    if (resolved) {
      imports.push(resolved);
      imports.push(...collectRelativeImports(resolved, seen));
    }
    match = importPattern.exec(source);
  }
  return imports;
}

// ── Voice stale processing policy ───────────────────────────────────────────

test("fresh Supabase processing blocks new claim attempts", () => {
  const now = Date.parse("2026-06-17T12:00:00.000Z");
  const decision = resolveVoiceClaimDecision({
    status: "processing",
    clientId: null,
    updatedAt: "2026-06-17T11:59:30.000Z",
    nowMs: now,
  });
  assert.equal(decision, "in_progress");
});

test("stale Supabase processing without ledger can resume", () => {
  const now = Date.parse("2026-06-17T12:00:00.000Z");
  const decision = resolveVoiceClaimDecision({
    status: "processing",
    clientId: null,
    updatedAt: new Date(now - VOICE_PROCESSING_STALE_MS - 1).toISOString(),
    nowMs: now,
  });
  assert.equal(decision, "resume_stale");
});

test("stale processing with completed ledger path is already_linked via client_id", () => {
  const decision = resolveVoiceClaimDecision({
    status: "processing",
    clientId: "client-123",
    updatedAt: "2020-01-01T00:00:00.000Z",
  });
  assert.equal(decision, "already_linked");
});

test("stale timeout uses central constant", () => {
  const now = Date.parse("2026-06-17T12:00:00.000Z");
  const fresh = new Date(now - VOICE_PROCESSING_STALE_MS + 1000).toISOString();
  const stale = new Date(now - VOICE_PROCESSING_STALE_MS - 1000).toISOString();
  assert.equal(isVoiceProcessingStale(fresh, now), false);
  assert.equal(isVoiceProcessingStale(stale, now), true);
});

test("pending logs are claimable", () => {
  assert.equal(
    resolveVoiceClaimDecision({ status: "pending", clientId: null }),
    "claim_pending",
  );
});

test("foreign agent cannot resolve claim decision on linked client", () => {
  assert.equal(
    resolveVoiceClaimDecision({ status: "pending", clientId: "c1" }),
    "already_linked",
  );
});

// ── Voice idempotency keys ────────────────────────────────────────────────────

test("voice client idempotency key is deterministic and agent-scoped", () => {
  const a = buildVoiceClientIdempotencyKey("agent-a", "log-1");
  const b = buildVoiceClientIdempotencyKey("agent-a", "log-1");
  const c = buildVoiceClientIdempotencyKey("agent-b", "log-1");
  assert.equal(a, b);
  assert.notEqual(a, c);
});

test("parallel create_client shares one ledger key per voice log", () => {
  const first = buildVoiceClientIdempotencyKey("agent-1", "voice-log-99");
  const second = buildVoiceClientIdempotencyKey("agent-1", "voice-log-99");
  assert.equal(first, second);
});

// ── Assignment tenant isolation ─────────────────────────────────────────────

test("global orphan agentId is never tenant-assignable", () => {
  assert.equal(isGlobalOrphanAgentId(null), true);
  assert.equal(isTenantAssignableDeal({ agentId: null }, ["a1"]), false);
});

test("assignment list service excludes global agentId null queries", () => {
  const source = readTracked("src/lib/account/assignment-service.ts");
  assert.doesNotMatch(source, /agentId:\s*null/);
  assert.doesNotMatch(source, /\{\s*agentId:\s*null\s*\}/);
  assert.match(source, /isGlobalOrphanAgentId/);
  assert.match(source, /isTenantAssignableDeal/);
});

test("foreign tenant deal is rejected by tenant filter", () => {
  assert.equal(
    isTenantAssignableDeal({ agentId: "foreign" }, ["tenant-a"]),
    false,
  );
});

test("office manager roles include OWNER and MANAGER", () => {
  assert.equal(isOfficeManagerRole("OWNER"), true);
  assert.equal(isOfficeManagerRole("MANAGER"), true);
  assert.equal(isOfficeManagerRole("MEMBER"), false);
});

test("assignment notification dedupe is stable per audit id", () => {
  const key = buildAssignmentNotificationDedupeKey({
    resourceType: "deal",
    resourceId: "deal-1",
    assigneeAgentId: "agent-2",
    auditId: "audit-1",
  });
  assert.equal(key, "assign:deal:deal-1:agent-2:audit-1");
});

test("tenant agent id list drops empty ids", () => {
  assert.deepEqual(filterTenantAgentIds(["a", "", "b"]), ["a", "b"]);
});

// ── Notifications policy ─────────────────────────────────────────────────────

test("notification dedupe keys include assignee and audit", () => {
  const key = buildAssignmentNotificationDedupeKey({
    resourceType: "client",
    resourceId: "c1",
    assigneeAgentId: "agent-1",
    auditId: "audit-xyz",
  });
  assert.ok(key.includes("agent-1"));
  assert.ok(key.includes("audit-xyz"));
});

// ── Git / deploy candidate checks ─────────────────────────────────────────────

for (const path of CRITICAL_TRACKED_PATHS) {
  test(`critical file is git-tracked: ${path}`, () => {
    assert.equal(existsSync(join(root, path)), true);
    assertGitTracked(path);
  });
}

test("import graph from hotfix roots has no untracked local modules", () => {
  const imported = new Set();
  for (const rootFile of IMPORT_GRAPH_ROOTS) {
    for (const dep of collectRelativeImports(rootFile)) {
      imported.add(dep.replace(/\\/g, "/"));
    }
  }

  const untracked = new Set(gitOthersExcludingStandard());
  const blockers = [...imported].filter((dep) => untracked.has(dep));
  assert.deepEqual(
    blockers,
    [],
    `Untracked modules imported by hotfix roots: ${blockers.join(", ")}`,
  );
});

test("docs verification SQL uses updated_at not processed_at column", () => {
  const docs = readTracked("docs/DEPLOY-VERCEL.md");
  const sqlBlocks = [...docs.matchAll(/```sql([\s\S]*?)```/g)].map((match) => match[1]);
  assert.ok(sqlBlocks.length > 0);
  for (const block of sqlBlocks) {
    assert.doesNotMatch(block, /processed_at/);
  }
  assert.match(docs, /updated_at/);
});

test("voice log store implements stale claim resume", () => {
  const source = readTracked("src/lib/voice-crm/voice-log-store.ts");
  assert.match(source, /resumeStaleProcessingClaim/);
  assert.match(source, /staleProcessingCutoffIso/);
  assert.match(source, /applied_action:\s*"create_client"/);
});

test("apply-actions reconciles ledger before abandoning claim", () => {
  const source = readTracked("src/lib/voice-crm/apply-actions.ts");
  assert.match(source, /hasVoiceLedgerProgress/);
  assert.match(source, /claim\.kind === "in_progress"/);
});

// ── Schema regression ─────────────────────────────────────────────────────────

test("prisma schema includes VoiceCrmAppliedAction model", () => {
  const schema = readTracked("prisma/schema.prisma");
  assert.match(schema, /model VoiceCrmAppliedAction/);
});

// ── Radar regression ──────────────────────────────────────────────────────────

test("radar storage keys are user scoped", () => {
  assert.notEqual(
    imarRadarScopedKey("user_a", "x"),
    imarRadarScopedKey("user_b", "x"),
  );
  assert.equal(imarRadarStorageScope(null), "anonymous");
});

test("unsafe radar health URLs are rejected", () => {
  assert.equal(isSafeRadarHealthUrl("http://localhost/duyuru"), false);
  assert.equal(isAllowlistedOfficialHost("www.sogut.bel.tr"), true);
});
