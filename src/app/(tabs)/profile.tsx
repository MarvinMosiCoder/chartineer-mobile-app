import { useAuth } from "@/providers/auth-provider";
import { Redirect } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function profileScreen() {
  const {
    user,
    signOut
  } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const logoutPending = useRef(false);
  async function handleLogout() {
    if (logoutPending.current) return;
    logoutPending.current = true;
    setLoggingOut(true);
    setErrorMessage("");
    try {
      await signOut();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Logout failed. Try again.");
    } finally {
      logoutPending.current = false;
      setLoggingOut(false);
    }
  }
  if (!user) {
    return <Redirect href="/login" />;
  }
  return <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={["top", "bottom", "left", "right"]}>
      <View className="flex-row items-center justify-between px-[24px] py-[12px]">
        <Text className="text-[22px] font-bold text-[#2563EB]">Chartineer</Text>
      </View>

      <ScrollView contentContainerClassName="p-[24px] w-[100%] max-w-[600px] self-center">
        <Text className="text-[30px] font-bold text-[#0F172A] mt-[24px]">Welcome to Chartineer</Text>
        <Text className="text-[16px] leading-[24px] text-[#475569] mt-[12px]">
          Your next discovery starts here.
        </Text>

        <View className="mt-[32px] p-[24px] bg-[#FFFFFF] rounded-[20px] border-[1px] border-[#E2E8F0]">
          <Text className="text-[20px] font-semibold text-[#0F172A]">You are signed in</Text>
          <Text className="text-[16px] leading-[24px] text-[#475569] mt-[8px]">{user.email}</Text>

          {errorMessage ? <Text className="text-[16px] leading-[24px] text-[#475569] mt-[8px]" accessibilityLiveRegion="polite">
              {errorMessage}
            </Text> : null}

          <Pressable onPress={handleLogout} disabled={loggingOut} accessibilityRole="button" accessibilityState={{
          disabled: loggingOut,
          busy: loggingOut
        }} className={`min-h-[48px] mt-[24px] bg-[#2563EB] rounded-[12px] items-center justify-center ${loggingOut ? "opacity-[0.7]" : ""}`}>
            <Text className="text-[#FFFFFF] text-[16px] font-semibold">
              {loggingOut ? "Signing out…" : "Log out"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>;
}
