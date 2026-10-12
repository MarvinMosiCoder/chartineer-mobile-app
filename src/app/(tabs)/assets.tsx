import { useAuth } from "@/providers/auth-provider";
import { fonts } from "@/styles/global";
import { Redirect, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback } from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AssetsScreen() {
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      setStatusBarStyle("light");

      return () => {
        setStatusBarStyle("dark");
      };
    }, [user]),
  );

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right"]}
    >
      <Text style={styles.title}>Assets</Text>
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