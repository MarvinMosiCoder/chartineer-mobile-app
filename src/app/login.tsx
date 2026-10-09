import { colors, fonts, globalStyles, spacing } from "@/styles/global";
import { useHeaderHeight } from "@react-navigation/elements";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const headerHeight = useHeaderHeight();

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight}
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
            />

            {/* Connect authentication before enabling these controls. */}
            <Pressable
              style={styles.submit}
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              disabled
            >
              <Text style={styles.submitText}>Submit</Text>
            </Pressable>

            <Pressable
              style={styles.forgotButton}
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              disabled
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
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
    opacity: 0.6,
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