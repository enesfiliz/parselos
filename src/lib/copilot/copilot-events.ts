export const PARSEL_COPILOT_OPEN_EVENT = "parsel-copilot:open";

export function openParselCopilot() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PARSEL_COPILOT_OPEN_EVENT));
}
