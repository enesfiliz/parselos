import { dark } from "@clerk/themes";

const darkVariables = {
  colorPrimary: "#7a9f45",
  colorBackground: "#09090b",
  colorText: "#f4f4f5",
  colorTextSecondary: "#a1a1aa",
  colorInputBackground: "#18181b",
  colorInputText: "#f4f4f5",
  colorNeutral: "#f4f4f5",
  colorMuted: "#a1a1aa",
  colorTextOnPrimaryBackground: "#ffffff",
  colorDanger: "#ef4444",
  borderRadius: "0.625rem",
  fontFamily: "var(--font-inter), system-ui, sans-serif",
  fontFamilyButtons: "var(--font-inter), system-ui, sans-serif",
} as const;

const lightVariables = {
  colorPrimary: "#4a6b2f",
  colorBackground: "#ffffff",
  colorText: "#111113",
  colorTextSecondary: "#4b4b52",
  colorInputBackground: "#f8f8f6",
  colorInputText: "#111113",
  colorNeutral: "#111113",
  colorMuted: "#4b4b52",
  colorTextOnPrimaryBackground: "#ffffff",
  colorDanger: "#dc2626",
  borderRadius: "0.625rem",
  fontFamily: "var(--font-inter), system-ui, sans-serif",
  fontFamilyButtons: "var(--font-inter), system-ui, sans-serif",
} as const;

const sharedLayout = {
  socialButtonsPlacement: "bottom" as const,
};

const sharedElements = {
  logoBox: "hidden",
  logoImage: "hidden",
  card: "shadow-lg border border-border/60 bg-card",
  navbar: "border-r border-border bg-muted/40",
  navbarButton: "text-muted-foreground hover:text-foreground",
  pageScrollBox: "bg-card",
  profileSection: "border-border",
  profileSectionTitle: "font-outfit font-semibold",
  formButtonPrimary:
    "font-semibold shadow-sm hover:opacity-90 transition-opacity",
  formFieldInput: "font-medium bg-card border-border",
  footerActionLink: "font-semibold text-primary",
  userButtonPopoverCard: "border border-border bg-card shadow-lg",
  userButtonPopoverActionButton: "text-foreground hover:bg-accent",
};

export function getClerkAppearance(theme: string | undefined) {
  const isLight = theme === "light";

  return {
    baseTheme: isLight ? undefined : dark,
    variables: isLight ? lightVariables : darkVariables,
    layout: sharedLayout,
    elements: sharedElements,
  };
}

/** @deprecated — ThemeProvider içinde getClerkAppearance kullanılır */
export const parselClerkAppearance = getClerkAppearance("dark");

/** @deprecated — doğrudan getClerkAppearance kullanın */
export const parselUserButtonAppearance = parselClerkAppearance;
