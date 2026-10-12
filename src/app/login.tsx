import { useAuth } from "@/providers/auth-provider";
import { fonts, spacing } from "@/styles/global";
import { loginThemes, type LoginTheme } from "@/styles/login-theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
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

export default function LoginScreen() {
  const { signIn } = useAuth();
  const colorScheme = useColorScheme();
  const mode = colorScheme === "dark" ? "dark" : "light";
  const theme = loginThemes[mode];
  const styles = themedStyles[mode];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const submitting = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(mode === "dark" ? "light" : "dark");

      return () => {
        setStatusBarStyle("dark");
      };
    }, [mode]),
  );

  async function handleLogin() {
    if (submitting.current) return;

    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Enter your email and password.");
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      setPassword("");
      setShowPassword(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Login failed. Try again.",
      );
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
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
        >
          <View style={styles.form}>
            <Image
              source={require("@/assets/images/system-logo/system-logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />

            <View style={styles.wordmark}>
              <Text
                style={styles.wordmarkText}
                accessibilityLabel="Chartineer"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Chart<Text style={styles.wordmarkAccent}>ineer</Text>
              </Text>
            </View>

            <Link href="/" dismissTo asChild>
              <Pressable
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Back to homepage"
                disabled={isSubmitting}
                accessibilityState={{ disabled: isSubmitting }}
              >
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color={theme.text}
                  accessible={false}
                />
                <Text style={styles.backButtonText}>Back to home</Text>
              </Pressable>
            </Link>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Ionicons
                name="mail-outline"
                size={22}
                color={theme.muted}
                accessible={false}
              />

              <TextInput
                style={styles.inputText}
                accessibilityLabel="Email"
                placeholder="you@example.com"
                placeholderTextColor={theme.muted}
                selectionColor={theme.primary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!isSubmitting}
                underlineColorAndroid="transparent"
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={theme.muted}
                accessible={false}
              />

              <TextInput
                style={styles.inputText}
                accessibilityLabel="Password"
                placeholder="Enter your password"
                placeholderTextColor={theme.muted}
                selectionColor={theme.primary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                editable={!isSubmitting}
                underlineColorAndroid="transparent"
              />

              <Pressable
                onPress={() => setShowPassword((value) => !value)}
                style={styles.eyeButton}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
                accessibilityState={{ disabled: isSubmitting }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={theme.muted}
                  accessible={false}
                />
              </Pressable>
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
              onPress={handleLogin}
              style={[styles.submit, isSubmitting && styles.disabled]}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Submit login"
              accessibilityState={{
                disabled: isSubmitting,
                busy: isSubmitting,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.onPrimary} />
              ) : (
                <Text style={styles.submitText}>Log in</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme: LoginTheme) {
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
    logoImage: {
      width: 120,
      height: 120,
      alignSelf: "center",
    },
    wordmark: {
      width: "100%",
      paddingHorizontal: 12,
      paddingVertical: 14,
      marginBottom: 32,
    },
    wordmarkText: {
      fontFamily: fonts.semibold,
      fontSize: 44,
      letterSpacing: -1,
      color: theme.text,
      textAlign: "center",
    },
    wordmarkAccent: {
      color: theme.accent,
    },
    backButton: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 8,
      paddingHorizontal: 8,
      marginBottom: 16,
    },
    backButtonText: {
      color: theme.text,
      fontFamily: fonts.regular,
      fontSize: 14,
    },
    label: {
      color: theme.text,
      fontFamily: fonts.regular,
      fontSize: 14,
      marginBottom: spacing.sm,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 54,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: spacing.md,
      marginBottom: 20,
    },
    inputText: {
      flex: 1,
      minWidth: 0,
      minHeight: 54,
      paddingHorizontal: 12,
      paddingVertical: 14,
      fontSize: 16,
      fontFamily: fonts.regular,
      color: theme.text,
    },
    eyeButton: {
      width: 48,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    submit: {
      minHeight: 52,
      backgroundColor: theme.primary,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.sm,
    },
    submitText: {
      color: theme.onPrimary,
      fontFamily: fonts.semibold,
      fontSize: 16,
    },
    disabled: {
      opacity: 0.6,
    },
    errorText: {
      color: theme.error,
      fontFamily: fonts.regular,
      fontSize: 14,
      marginBottom: spacing.md,
    },
  });
}

const themedStyles = {
  light: createStyles(loginThemes.light),
  dark: createStyles(loginThemes.dark),
};