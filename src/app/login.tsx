import { useAuth } from "@/providers/auth-provider";
import { loginThemes } from "@/styles/login-theme";
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const submitting = useRef(false);

  const [notice, setNotice] = useState("");
  function handleSocialLogin(provider: "Google" | "Apple") {
    setErrorMessage("");
    setNotice(
      `${provider} login is not available yet. Use your email and password.`,
    );
  }

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
      className="flex-1 bg-[#F8FAFC] dark:bg-[#0B0D10]"
      edges={["top", "bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerClassName="grow justify-center p-[24px]"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-[420px] self-center">
            <Image
              source={require("@/assets/images/system-logo/system-logo.png")}
              className="h-[120px] w-[120px] self-center"
              resizeMode="contain"
            />

            <View className="mb-[10px] w-full px-[12px] py-[14px]">
              <Text
                className="text-center font-poppins-semibold text-[44px] tracking-[-1px] text-[#0F172A] dark:text-[#F2F0EA]"
                accessibilityLabel="Chartineer"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Chart<Text className="text-[#0F7058] dark:text-[#57CCA7]">ineer</Text>
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Link href="/" dismissTo asChild>
                <Pressable
                  className="mb-[5px] min-h-[48px] flex-row items-center self-start"
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
                </Pressable>
              </Link>
              <Text className="font-poppins-semibold text-[#0F7058] dark:text-[#57CCA7]">Sign up</Text>
            </View>

            <Text className="mb-[8px] font-poppins-semibold text-[13px] text-[#0F172A] dark:text-[#F2F0EA]">Email</Text>
            <View className="mb-[10px] min-h-[35px] flex-row items-center rounded-[14px] border border-[#CBD5E1] bg-white px-[14px] dark:border-[#404650] dark:bg-[#171A20]">
              <Ionicons
                name="mail-outline"
                size={22}
                color={theme.muted}
                accessible={false}
              />

              <TextInput
                className="min-h-[35px] min-w-0 flex-1 px-[10px] py-[10px] font-poppins text-[16px] text-[#0F172A] dark:text-[#F2F0EA]"
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

            <Text className="mb-[8px] font-poppins-semibold text-[13px] text-[#0F172A] dark:text-[#F2F0EA]">Password</Text>
            <View className="mb-[10px] min-h-[35px] flex-row items-center rounded-[14px] border border-[#CBD5E1] bg-white px-[14px] dark:border-[#404650] dark:bg-[#171A20]">
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={theme.muted}
                accessible={false}
              />

              <TextInput
                className="min-h-[35px] min-w-0 flex-1 px-[10px] py-[10px] font-poppins text-[16px] text-[#0F172A] dark:text-[#F2F0EA]"
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
                className="min-h-[48px] w-[48px] items-center justify-center"
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
                className="mb-[16px] font-poppins text-[14px] text-[#B91C1C] dark:text-[#FDA4AF]"
                accessibilityLiveRegion="polite"
              >
                {errorMessage}
              </Text>
            ) : null}

            <Pressable
              onPress={handleLogin}
              className={`mt-[8px] min-h-[52px] items-center justify-center rounded-[12px] bg-[#0F7058] dark:bg-[#57CCA7] ${isSubmitting ? "opacity-60" : ""}`}
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
                <Text className="font-poppins-semibold text-[16px] text-white dark:text-[#071B14]">Log in</Text>
              )}
            </Pressable>

            <View className="my-[24px] flex-row items-center gap-[12px]">
              <View className="h-[1px] flex-1 bg-[#CBD5E1] dark:bg-[#404650]" />
              <Text className="font-poppins text-[12px] text-[#64748B] dark:text-[#A1A7B3]">Or continue with</Text>
              <View className="h-[1px] flex-1 bg-[#CBD5E1] dark:bg-[#404650]" />
            </View>

            <View className="flex-row gap-[12px]">
                <Pressable
                  className="min-h-[30px] flex-1 flex-row items-center justify-center gap-[12px] rounded-[12px] border border-[#CBD5E1] bg-white px-[10px] py-[10px] active:opacity-70 dark:border-[#404650]"
                  onPress={() => handleSocialLogin("Google")}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isSubmitting }}
                >
                  <Image
                    source={{
                      uri: "https://developers.google.com/static/identity/images/g-logo.png",
                    }}
                    className="h-[20px] w-[20px]"
                    resizeMode="contain"
                    accessible={false}
                  />
                  <Text className="shrink text-center text-[14px] font-medium text-[#0F172A]">
                  Google
                  </Text>
                </Pressable>

                <Pressable
                  className="min-h-[30px] flex-1 flex-row items-center justify-center gap-[12px] rounded-[12px] border border-[#CBD5E1] bg-black px-[10px] py-[10px] active:opacity-70 dark:border-[#404650]"
                  onPress={() => handleSocialLogin("Apple")}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isSubmitting }}
                >
                  <Ionicons
                    name="logo-apple"
                    size={24}
                    color="#FFFFFF"
                    accessible={false}
                  />
                  <Text className="shrink text-center text-[14px] font-medium text-white">
                    Apple
                  </Text>
                </Pressable>
            </View>

            {notice ? (
              <Text className="mt-[12px] text-center font-poppins text-[13px] leading-[20px] text-[#64748B] dark:text-[#A1A7B3]" accessibilityLiveRegion="polite">
                {notice}
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
