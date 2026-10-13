import { loginThemes } from "@/styles/login-theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Linking from "expo-linking";
import { Link, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Replace null with your published HTTPS URLs later.
const TERMS_URL: string | null = null;
const PRIVACY_URL: string | null = null;
export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const mode = colorScheme === "dark" ? "dark" : "light";
  const theme = loginThemes[mode];
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  useFocusEffect(useCallback(() => {
    setStatusBarStyle(mode === "dark" ? "light" : "dark");
    return () => {
      setStatusBarStyle("dark");
    };
  }, [mode]));
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
      setErrorMessage("Please agree to the Terms of Service and acknowledge the Privacy Policy.");
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
  return <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0B0D10]" edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerClassName="grow-[1] justify-center p-[24px]" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="w-[100%] max-w-[420px] self-center">
            <Link href="/" replace asChild>
              <Pressable className="min-h-[48px] flex-row items-center self-start gap-[8px] mb-[24px]" accessibilityRole="button" accessibilityLabel="Back to homepage">
                <Ionicons name="arrow-back" size={22} color={theme.text} accessible={false} />
                <Text className="text-[#0F172A] dark:text-[#F2F0EA] font-poppins text-[14px]">Back to home</Text>
              </Pressable>
            </Link>

            <Text className="text-[#0F172A] dark:text-[#F2F0EA] font-poppins-semibold text-[40px] tracking-[-1px] text-center mb-[24px]" accessibilityLabel="Chartineer" numberOfLines={1} adjustsFontSizeToFit>
              Chart<Text className="text-[#0F7058] dark:text-[#57CCA7]">ineer</Text>
            </Text>

            <Text className="text-[#0F172A] dark:text-[#F2F0EA] font-poppins-semibold text-[26px] text-center">Create your account</Text>
            <Text className="text-[#64748B] dark:text-[#A1A7B3] font-poppins text-[14px] leading-[22px] text-center mt-[8px] mb-[28px]">
              Choose how you would like to get started.
            </Text>

            <Pressable className="min-h-[48px] flex-row items-center gap-[12px] mb-[16px]" accessibilityRole="checkbox" accessibilityLabel="I agree to the Terms of Service and acknowledge the Privacy Policy" accessibilityState={{
            checked: acceptedPolicies
          }} onPress={() => {
            setAcceptedPolicies(previous => !previous);
            setErrorMessage("");
            setNotice("");
          }}>
                <Ionicons name={acceptedPolicies ? "checkbox" : "square-outline"} size={24} color={acceptedPolicies ? theme.primary : theme.muted} accessible={false} />

                <Text className="flex-1 text-[#0F172A] dark:text-[#F2F0EA] font-poppins text-[13px] leading-[20px]">
                    I agree to the Terms of Service and acknowledge the Privacy Policy.
                </Text>
            </Pressable>

            <View className="gap-[12px]">
              <Pressable className={`min-h-[52px] flex-row items-center justify-center gap-[12px] px-[16px] py-[12px] bg-[#FFFFFF] dark:bg-[#171A20] border-[1px] border-[#CBD5E1] dark:border-[#404650] rounded-[12px] active:opacity-[0.7] ${!acceptedPolicies ? "opacity-[0.45]" : ""}`} disabled={!acceptedPolicies} accessibilityRole="button" accessibilityLabel="Continue with Google" accessibilityState={{
              disabled: !acceptedPolicies
            }} onPress={() => handleSocialSignup("Google")}>
                <View className="w-[24px] h-[24px] items-center justify-center bg-[#FFFFFF] rounded-[4px]">
                  <Image source={{
                  uri: "https://developers.google.com/static/identity/images/g-logo.png"
                }} className="w-[20px] h-[20px]" resizeMode="contain" accessible={false} />
                </View>
                <Text className="shrink-[1] text-[#0F172A] dark:text-[#F2F0EA] text-[14px] font-medium text-center">
                  Continue with Google
                </Text>
              </Pressable>

              <Pressable className={`min-h-[52px] flex-row items-center justify-center gap-[12px] px-[16px] py-[12px] border-[1px] rounded-[12px] bg-[#000000] dark:bg-[#FFFFFF] border-[#000000] dark:border-[#FFFFFF] active:opacity-[0.7] ${!acceptedPolicies ? "opacity-[0.45]" : ""}`} disabled={!acceptedPolicies} accessibilityRole="button" accessibilityLabel="Continue with Apple" accessibilityState={{
              disabled: !acceptedPolicies
            }} onPress={() => handleSocialSignup("Apple")}>
                <Ionicons name="logo-apple" size={24} color={mode === "dark" ? "#000000" : "#FFFFFF"} accessible={false} />
                <Text className="shrink-[1] text-[#FFFFFF] dark:text-[#000000] text-[14px] font-medium text-center">
                  Continue with Apple
                </Text>
              </Pressable>
            </View>

            <View className="flex-row items-center gap-[12px] my-[24px]">
              <View className="flex-1 h-[1px] bg-[#CBD5E1] dark:bg-[#404650]" />
              <Text className="text-[#64748B] dark:text-[#A1A7B3] font-poppins text-[12px]">or use email</Text>
              <View className="flex-1 h-[1px] bg-[#CBD5E1] dark:bg-[#404650]" />
            </View>

            <Text className="text-[#0F172A] dark:text-[#F2F0EA] font-poppins text-[14px] mb-[8px]">Email address</Text>
            <View className="flex-row items-center min-h-[54px] px-[16px] bg-[#FFFFFF] dark:bg-[#171A20] border-[1px] border-[#CBD5E1] dark:border-[#404650] rounded-[12px]">
              <Ionicons name="mail-outline" size={22} color={theme.muted} accessible={false} />
              <TextInput className="flex-1 min-w-[0px] min-h-[54px] px-[12px] py-[14px] text-[#0F172A] dark:text-[#F2F0EA] font-poppins text-[16px]" accessibilityLabel="Email address" placeholder="you@example.com" placeholderTextColor={theme.muted} selectionColor={theme.primary} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" value={email} onChangeText={value => {
              setEmail(value);
              setErrorMessage("");
              setNotice("");
            }} underlineColorAndroid="transparent" />
            </View>

            {errorMessage ? <Text className="text-[#B91C1C] dark:text-[#FDA4AF] font-poppins text-[13px] mt-[8px]" accessibilityLiveRegion="polite">
                {errorMessage}
              </Text> : null}

            <Pressable className="min-h-[52px] items-center justify-center px-[16px] py-[12px] mt-[20px] bg-[#0F7058] dark:bg-[#57CCA7] rounded-[12px] active:opacity-[0.7]" accessibilityRole="button" accessibilityLabel="Sign up with email" onPress={handleEmailSignup}>
              <Text className="text-[#FFFFFF] dark:text-[#071B14] font-poppins-semibold text-[16px]">Sign up</Text>
            </Pressable>

            <Text className="text-[#64748B] dark:text-[#A1A7B3] font-poppins text-[12px] leading-[20px] text-center mt-[20px]">
              Please review our Terms of Service and Privacy Policy.
            </Text>

            <View className="flex-row flex-wrap items-center justify-center gap-x-[16px]">
              <Pressable className="min-h-[48px] items-center justify-center px-[4px]" accessibilityRole="link" accessibilityLabel="Open Terms of Service" onPress={() => void openPolicy("Terms of Service", TERMS_URL)}>
                <Text className="text-[#0F7058] dark:text-[#57CCA7] font-poppins-semibold text-[13px]">Terms of Service</Text>
              </Pressable>

              <Pressable className="min-h-[48px] items-center justify-center px-[4px]" accessibilityRole="link" accessibilityLabel="Open Privacy Policy" onPress={() => void openPolicy("Privacy Policy", PRIVACY_URL)}>
                <Text className="text-[#0F7058] dark:text-[#57CCA7] font-poppins-semibold text-[13px]">Privacy Policy</Text>
              </Pressable>
            </View>

            {notice ? <Text className="text-[#64748B] dark:text-[#A1A7B3] font-poppins text-[13px] leading-[20px] text-center mt-[12px]" accessibilityLiveRegion="polite">
                {notice}
              </Text> : null}

            <View className="flex-row flex-wrap items-center justify-center gap-[8px] mt-[16px]">
              <Text className="text-[#64748B] dark:text-[#A1A7B3] font-poppins text-[13px]">
                Already have an account?
              </Text>

              <Link href="/login" replace asChild>
                <Pressable className="min-h-[48px] items-center justify-center px-[4px]" accessibilityRole="button" accessibilityLabel="Open login">
                  <Text className="text-[#0F7058] dark:text-[#57CCA7] font-poppins-semibold text-[13px]">Log in</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>;
}
