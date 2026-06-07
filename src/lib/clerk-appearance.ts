import { dark } from "@clerk/themes";

const variables = {
  colorPrimary: "#7A9F45",
  colorBackground: "#09090b",
  colorText: "#fafafa",
  colorTextSecondary: "#a1a1aa",
  colorInputBackground: "#18181b",
  colorInputText: "#fafafa",
  colorNeutral: "#fafafa",
  colorMuted: "#a1a1aa",
  colorTextOnPrimaryBackground: "#ffffff",
  borderRadius: "0.5rem",
} as const;

/** Tek kaynak — SignIn, UserButton, UserProfile hepsi bunu kullanmalı */
export const parselClerkAppearance = {
  baseTheme: dark,
  variables,
  layout: {
    socialButtonsPlacement: "bottom" as const,
  },
  elements: {
    logoBox: "hidden",
    logoImage: "hidden",
  },
} as const;

/** @deprecated — doğrudan parselClerkAppearance kullanın */
export const parselUserButtonAppearance = parselClerkAppearance;
