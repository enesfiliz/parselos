const required = [
  "DATABASE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
];

const recommended = [
  "GEMINI_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GROQ_API_KEY",
];

let hasError = false;

console.log("Parselos — lokal ortam kontrolü\n");

for (const key of required) {
  if (!process.env[key]?.trim()) {
    console.error(`✗ Zorunlu eksik: ${key}`);
    hasError = true;
  } else {
    console.log(`✓ ${key}`);
  }
}

for (const key of recommended) {
  if (!process.env[key]?.trim()) {
    console.warn(`⚠ Önerilen eksik: ${key} (ilgili modül çalışmayabilir)`);
  } else {
    console.log(`✓ ${key}`);
  }
}

if (hasError) {
  console.error("\n.env.local dosyanızı .env.example şablonuna göre doldurun.");
  process.exit(1);
}

console.log("\nLokal ortam temel gereksinimleri karşılanıyor.");
