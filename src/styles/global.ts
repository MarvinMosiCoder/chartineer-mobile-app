import { StyleSheet } from "react-native";

export const colors = {
  primary: "#159575",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  border: "#CBD5E1",
};

export const spacing = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const fonts = {
  regular: "Poppins_400Regular",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
  extraBold: "Poppins_800ExtraBold",
};

export const globalStyles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 54,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    fontFamily: fonts.regular,
    marginBottom: 20,
  },
  button: {
    minHeight: 52,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: fonts.semibold,
    color: colors.surface,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
});