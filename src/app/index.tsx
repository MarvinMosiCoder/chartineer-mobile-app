import { signIn } from "@/lib/auth";
import { colors, fonts, globalStyles, spacing } from "@/styles/global";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const submitting = useRef(false);

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
      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed. Try again.");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["bottom", "left", "right"]}
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
            <Text style={styles.logo}>Chartineer</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="Email"
              placeholder="you@example.com"
              placeholderTextColor="#64748B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!isSubmitting}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="Password"
              placeholder="Enter your password"
              placeholderTextColor="#64748B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              editable={!isSubmitting}
            />

           {errorMessage ? (
              <Text style={styles.errorText} accessibilityLiveRegion="polite">
                {errorMessage}
              </Text>
            ) : null}

            <Pressable
              onPress={handleLogin}
              style={[styles.submit, isSubmitting && styles.disabled]}
              accessibilityRole="button"
              accessibilityLabel="Submit login"
              accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.submitText}>Submit</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ...globalStyles,

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
  logo: {
    fontSize: 34,
    fontFamily: fonts.extraBold,
    color: colors.primary,
    textAlign: "center",
    marginBottom: 40,
  },
  submit: {
    ...globalStyles.button,
    marginTop: spacing.sm,
  },
  disabled: { opacity: 0.6 },
  errorText: {
    color: "#B91C1C",
    fontFamily: fonts.regular,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  submitText: globalStyles.buttonText,
  forgotButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    opacity: 0.6,
  },
  forgotText: globalStyles.linkText,
});