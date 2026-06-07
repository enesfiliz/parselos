export type DealDocumentKind = "pdf" | "image" | "word" | "other";

export type DealDocument = {
  id: string;
  dealId: string;
  name: string;
  sizeBytes: number;
  kind: DealDocumentKind;
  tags: string[];
  uploadedAt: string;
};

const MOCK_BY_DEAL: Record<string, DealDocument[]> = {
  "mock-deal-001": [
    {
      id: "doc-001-1",
      dealId: "mock-deal-001",
      name: "Tapu_Senedi_Gölcük.pdf",
      sizeBytes: 2_450_000,
      kind: "pdf",
      tags: ["Tapu Senedi"],
      uploadedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    },
    {
      id: "doc-001-2",
      dealId: "mock-deal-001",
      name: "Yer_Gosterimi_Formu.pdf",
      sizeBytes: 840_000,
      kind: "pdf",
      tags: ["Yer Gösterme Belgesi"],
      uploadedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    },
  ],
  "mock-deal-002": [
    {
      id: "doc-002-1",
      dealId: "mock-deal-002",
      name: "Kimlik_Fotokopisi.jpg",
      sizeBytes: 1_120_000,
      kind: "image",
      tags: ["Kimlik"],
      uploadedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    },
  ],
  "mock-deal-003": [
    {
      id: "doc-003-1",
      dealId: "mock-deal-003",
      name: "Sozlesme_Taslagi.docx",
      sizeBytes: 520_000,
      kind: "word",
      tags: ["Sözleşme"],
      uploadedAt: new Date(Date.now() - 1 * 86_400_000).toISOString(),
    },
    {
      id: "doc-003-2",
      dealId: "mock-deal-003",
      name: "Parsel_Krokisi.pdf",
      sizeBytes: 3_100_000,
      kind: "pdf",
      tags: ["Tapu Senedi", "Parsel"],
      uploadedAt: new Date(Date.now() - 4 * 86_400_000).toISOString(),
    },
  ],
};

export function getInitialDealDocuments(dealId: string): DealDocument[] {
  return MOCK_BY_DEAL[dealId] ? [...MOCK_BY_DEAL[dealId]] : [];
}

export function inferDocumentKind(filename: string): DealDocumentKind {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (/\.(png|jpe?g|webp|gif|heic)$/.test(lower)) return "image";
  if (/\.(doc|docx)$/.test(lower)) return "word";
  return "other";
}

export function inferDocumentTags(filename: string): string[] {
  const lower = filename.toLowerCase();
  if (lower.includes("tapu")) return ["Tapu Senedi"];
  if (lower.includes("kimlik")) return ["Kimlik"];
  if (lower.includes("gosterim") || lower.includes("gösterim") || lower.includes("yer_"))
    return ["Yer Gösterme Belgesi"];
  if (lower.includes("sozlesme") || lower.includes("sözleşme"))
    return ["Sözleşme"];
  return ["Evrak"];
}

export function formatDocumentSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function createDocumentFromFile(file: File, dealId: string): DealDocument {
  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    dealId,
    name: file.name,
    sizeBytes: file.size,
    kind: inferDocumentKind(file.name),
    tags: inferDocumentTags(file.name),
    uploadedAt: new Date().toISOString(),
  };
}
