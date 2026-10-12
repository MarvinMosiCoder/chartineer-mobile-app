export const loginThemes = {
  light: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#0F172A",
    muted: "#64748B",
    border: "#CBD5E1",
    primary: "#0F7058",
    onPrimary: "#FFFFFF",
    accent: "#0F7058",
    error: "#B91C1C",
  },
  dark: {
    background: "#0B0D10",
    surface: "#171A20",
    text: "#F2F0EA",
    muted: "#A1A7B3",
    border: "#404650",
    primary: "#57CCA7",
    onPrimary: "#071B14",
    accent: "#57CCA7",
    error: "#FDA4AF",
  },
};

export type LoginTheme = typeof loginThemes.light;