import { fonts, spacing } from "@/styles/global";
import { loginThemes, type LoginTheme } from "@/styles/login-theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Linking from "expo-linking";
import { Link, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Replace null with your published HTTPS URLs later.
const TERMS_URL: string | null = null;
const PRIVACY_URL: string | null = null;

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const mode = colorScheme === "dark" ? "dark" : "light";
  const theme = loginThemes[mode];
  const styles = themedStyles[mode];

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(mode === "dark" ? "light" : "dark");

      return () => {
        setStatusBarStyle("dark");
      };
    }, [mode]),
  );

  function handleEmailSignup() {
    setErrorMessage("");
    setNotice("");

    if (!email.trim()) {
      setErrorMessage("Enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    // Connect your email registration flow here.
    setNotice("Email sign-up is not available yet.");
  }

  function handleSocialSignup(provider: "Google" | "Apple") {
    setErrorMessage("");
    setNotice("");

    if (!acceptedPolicies) {
        setErrorMessage(
        "Please agree to the Terms of Service and acknowledge the Privacy Policy.",
        );
        return;
    }

    // Connect the provider's authentication flow here.
    setNotice(`${provider} sign-up is not available yet.`);
}

  async function openPolicy(title: string, url: string | null) {
    setErrorMessage("");
    setNotice("");

    if (!url) {
      setNotice(`${title} has not been published yet.`);
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      setNotice("Could not open this page. Please try again.");
    }
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <Link href="/" replace asChild>
              <Pressable
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Back to homepage"
              >
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color={theme.text}
                  accessible={false}
                />
                <Text style={styles.backText}>Back to home</Text>
              </Pressable>
            </Link>

            <Text
              style={styles.wordmark}
              accessibilityLabel="Chartineer"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Chart<Text style={styles.wordmarkAccent}>ineer</Text>
            </Text>

            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Choose how you would like to get started.
            </Text>

            <Pressable
                style={styles.consentRow}
                accessibilityRole="checkbox"
                accessibilityLabel="I agree to the Terms of Service and acknowledge the Privacy Policy"
                accessibilityState={{ checked: acceptedPolicies }}
                onPress={() => {
                    setAcceptedPolicies((previous) => !previous);
                    setErrorMessage("");
                    setNotice("");
                }}
            >
                <Ionicons
                    name={acceptedPolicies ? "checkbox" : "square-outline"}
                    size={24}
                    color={acceptedPolicies ? theme.primary : theme.muted}
                    accessible={false}
                />

                <Text style={styles.consentText}>
                    I agree to the Terms of Service and acknowledge the Privacy Policy.
                </Text>
            </Pressable>

            <View style={styles.socialButtons}>
              <Pressable
                style={({ pressed }) => [
                    styles.socialButton,
                    !acceptedPolicies && styles.disabled,
                    pressed && styles.pressed,
                ]}
                disabled={!acceptedPolicies}
                accessibilityRole="button"
                accessibilityLabel="Continue with Google"
                accessibilityState={{ disabled: !acceptedPolicies }}
                onPress={() => handleSocialSignup("Google")}
             >
                <View style={styles.googleIconBackground}>
                  <Image
                    source={{
                      uri: "https://developers.google.com/static/identity/images/g-logo.png",
                    }}
                    style={styles.googleIcon}
                    resizeMode="contain"
                    accessible={false}
                  />
                </View>
                <Text style={styles.googleButtonText}>
                  Continue with Google
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                    styles.socialButton,
                    styles.appleButton,
                    !acceptedPolicies && styles.disabled,
                    pressed && styles.pressed,
                ]}
                disabled={!acceptedPolicies}
                accessibilityRole="button"
                accessibilityLabel="Continue with Apple"
                accessibilityState={{ disabled: !acceptedPolicies }}
                onPress={() => handleSocialSignup("Apple")}
              >
                <Ionicons
                  name="logo-apple"
                  size={24}
                  color={mode === "dark" ? "#000000" : "#FFFFFF"}
                  accessible={false}
                />
                <Text style={styles.appleButtonText}>
                  Continue with Apple
                </Text>
              </Pressable>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or use email</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputRow}>
              <Ionicons
                name="mail-outline"
                size={22}
                color={theme.muted}
                accessible={false}
              />
              <TextInput
                style={styles.input}
                accessibilityLabel="Email address"
                placeholder="you@example.com"
                placeholderTextColor={theme.muted}
                selectionColor={theme.primary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setErrorMessage("");
                  setNotice("");
                }}
                underlineColorAndroid="transparent"
              />
            </View>

            {errorMessage ? (
              <Text
                style={styles.errorText}
                accessibilityLiveRegion="polite"
              >
                {errorMessage}
              </Text>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.signupButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Sign up with email"
              onPress={handleEmailSignup}
            >
              <Text style={styles.signupButtonText}>Sign up</Text>
            </Pressable>

            <Text style={styles.policyDescription}>
              Please review our Terms of Service and Privacy Policy.
            </Text>

            <View style={styles.policyLinks}>
              <Pressable
                style={styles.textButton}
                accessibilityRole="link"
                accessibilityLabel="Open Terms of Service"
                onPress={() => void openPolicy("Terms of Service", TERMS_URL)}
              >
                <Text style={styles.linkText}>Terms of Service</Text>
              </Pressable>

              <Pressable
                style={styles.textButton}
                accessibilityRole="link"
                accessibilityLabel="Open Privacy Policy"
                onPress={() => void openPolicy("Privacy Policy", PRIVACY_URL)}
              >
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Pressable>
            </View>

            {notice ? (
              <Text
                style={styles.notice}
                accessibilityLiveRegion="polite"
              >
                {notice}
              </Text>
            ) : null}

            <View style={styles.loginRow}>
              <Text style={styles.loginDescription}>
                Already have an account?
              </Text>

              <Link href="/login" replace asChild>
                <Pressable
                  style={styles.textButton}
                  accessibilityRole="button"
                  accessibilityLabel="Open login"
                >
                  <Text style={styles.linkText}>Log in</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme: LoginTheme, isDark: boolean) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    flex: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      justifyContent: "center",
      padding: spacing.lg,
    },
    form: {
      width: "100%",
      maxWidth: 420,
      alignSelf: "center",
    },
    backButton: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 8,
      marginBottom: 24,
    },
    backText: {
      color: theme.text,
      fontFamily: fonts.regular,
      fontSize: 14,
    },
    wordmark: {
      color: theme.text,
      fontFamily: fonts.semibold,
      fontSize: 40,
      letterSpacing: -1,
      textAlign: "center",
      marginBottom: 24,
    },
    wordmarkAccent: {
      color: theme.accent,
    },
    title: {
      color: theme.text,
      fontFamily: fonts.semibold,
      fontSize: 26,
      textAlign: "center",
    },
    subtitle: {
      color: theme.muted,
      fontFamily: fonts.regular,
      fontSize: 14,
      lineHeight: 22,
      textAlign: "center",
      marginTop: 8,
      marginBottom: 28,
    },
    socialButtons: {
      gap: 12,
    },
    socialButton: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
    },
    googleIconBackground: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
      borderRadius: 4,
    },
    googleIcon: {
      width: 20,
      height: 20,
    },
    googleButtonText: {
      flexShrink: 1,
      color: theme.text,
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
    },
    appleButton: {
      backgroundColor: isDark ? "#FFFFFF" : "#000000",
      borderColor: isDark ? "#FFFFFF" : "#000000",
    },
    appleButtonText: {
      flexShrink: 1,
      color: isDark ? "#000000" : "#FFFFFF",
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.border,
    },
    dividerText: {
      color: theme.muted,
      fontFamily: fonts.regular,
      fontSize: 12,
    },
    label: {
      color: theme.text,
      fontFamily: fonts.regular,
      fontSize: 14,
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 54,
      paddingHorizontal: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
    },
    input: {
      flex: 1,
      minWidth: 0,
      minHeight: 54,
      paddingHorizontal: 12,
      paddingVertical: 14,
      color: theme.text,
      fontFamily: fonts.regular,
      fontSize: 16,
    },
    errorText: {
      color: theme.error,
      fontFamily: fonts.regular,
      fontSize: 13,
      marginTop: 8,
    },
    signupButton: {
      minHeight: 52,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginTop: 20,
      backgroundColor: theme.primary,
      borderRadius: 12,
    },
    signupButtonText: {
      color: theme.onPrimary,
      fontFamily: fonts.semibold,
      fontSize: 16,
    },
    policyDescription: {
      color: theme.muted,
      fontFamily: fonts.regular,
      fontSize: 12,
      lineHeight: 20,
      textAlign: "center",
      marginTop: 20,
    },
    policyLinks: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      columnGap: 16,
    },
    textButton: {
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    linkText: {
      color: theme.accent,
      fontFamily: fonts.semibold,
      fontSize: 13,
    },
    notice: {
      color: theme.muted,
      fontFamily: fonts.regular,
      fontSize: 13,
      lineHeight: 20,
      textAlign: "center",
      marginTop: 12,
    },
    loginRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 16,
    },
    loginDescription: {
      color: theme.muted,
      fontFamily: fonts.regular,
      fontSize: 13,
    },
    pressed: {
      opacity: 0.7,
    },
    consentRow: {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
    },
    consentText: {
        flex: 1,
        color: theme.text,
        fontFamily: fonts.regular,
        fontSize: 13,
        lineHeight: 20,
    },
    disabled: {
     opacity: 0.45,
    },
  });
}

const themedStyles = {
  light: createStyles(loginThemes.light, false),
  dark: createStyles(loginThemes.dark, true),
};