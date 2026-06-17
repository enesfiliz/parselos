/** Demo/sample data is opt-in only — never show as real product data in production. */
export function isDemoDataEnabled(): boolean {
  return process.env.PARSELOS_DEMO_DATA === "1";
}

/** Client components — mirrors server flag when exposed in preview builds. */
export function isDemoDataEnabledClient(): boolean {
  return (
    process.env.NEXT_PUBLIC_PARSELOS_DEMO_DATA === "1" ||
    process.env.PARSELOS_DEMO_DATA === "1"
  );
}
