import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function MarketsScreen() {
  useFocusEffect(useCallback(() => {
    setStatusBarStyle("light");
    return () => {
      setStatusBarStyle("dark");
    };
  }, []));
  return <SafeAreaView className="flex-1 bg-[#000000] p-[24px]" edges={["top", "left", "right"]}>
      <Text className="text-[#FFFFFF] font-poppins-semibold text-[28px]">Markets</Text>
    </SafeAreaView>;
}
