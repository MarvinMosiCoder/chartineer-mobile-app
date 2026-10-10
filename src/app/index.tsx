import { signIn } from "@/lib/auth";
import { colors, fonts, globalStyles, spacing } from "@/styles/global";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useRef, useState } from "react";
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
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setShowPassword(false);
      router.replace("/dashboard");
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
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Ionicons
                name="mail-outline"
                size={22}
                color={colors.muted}
                accessible={false}
              />
              <TextInput
                style={styles.inputText}
                accessibilityLabel="Email"
                placeholder="you@example.com"
                placeholderTextColor={colors.muted}
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
                color={colors.muted}
                accessible={false}
              />
              <TextInput
                style={styles.inputText}
                accessibilityLabel="Password"
                placeholder="Enter your password"
                placeholderTextColor={colors.muted}
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
                  color={colors.muted}
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
  logoImage: {
    width: 120,
    height: 120,
    alignSelf: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 54,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
  },
  eyeButton: {
    width: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  submit: {
    ...globalStyles.button,
    marginTop: spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
  errorText: {
    color: "#B91C1C",
    fontFamily: fonts.regular,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  submitText: globalStyles.buttonText,
    wordmark: {
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 40,
  },
  wordmarkText: {
    fontFamily: fonts.semibold,
    fontSize: 44,
    letterSpacing: -1,
    color: "#F2F0EA",
    textAlign: "center",
  },
  wordmarkAccent: {
    color: "#57CCA7",
  },
});