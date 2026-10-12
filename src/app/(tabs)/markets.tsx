import { fonts } from "@/styles/global";
import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback } from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MarketsScreen() {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");

      return () => {
        setStatusBarStyle("dark");
      };
    }, []),
  );

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right"]}
    >
      <Text style={styles.title}>Markets</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
    padding: 24,
  },
  title: {
    color: "#FFFFFF",
    fontFamily: fonts.semibold,
    fontSize: 28,
  },
});