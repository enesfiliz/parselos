import { dark } from "@clerk/themes";

const darkVariables = {
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

const lightVariables = {
  colorPrimary: "#547236",
  colorBackground: "#ffffff",
  colorText: "#18181b",
  colorTextSecondary: "#71717a",
  colorInputBackground: "#f4f4f5",
  colorInputText: "#18181b",
  colorNeutral: "#18181b",
  colorMuted: "#71717a",
  colorTextOnPrimaryBackground: "#ffffff",
  borderRadius: "0.5rem",
} as const;

const sharedLayout = {
  socialButtonsPlacement: "bottom" as const,
};

const sharedElements = {
  logoBox: "hidden",
  logoImage: "hidden",
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
