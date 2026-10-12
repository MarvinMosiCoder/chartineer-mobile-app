import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { colors, fonts, globalStyles } from "@/styles/global";
import { Poppins_400Regular } from "@expo-google-fonts/poppins/400Regular";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins/600SemiBold";
import { Poppins_700Bold } from "@expo-google-fonts/poppins/700Bold";
import { Poppins_800ExtraBold } from "@expo-google-fonts/poppins/800ExtraBold";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  useEffect(() => {
    if (fontError) {
      void SplashScreen.hideAsync();
      throw fontError;
    }
  }, [fontError]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { user, isLoading, error, refreshSession } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      void SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.statusScreen}>
        <ActivityIndicator
          color={colors.primary}
          accessibilityLabel="Checking your session"
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.statusScreen}>
        <Text
          style={styles.errorText}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>

        <Pressable
          style={globalStyles.button}
          accessibilityRole="button"
          accessibilityLabel="Retry session check"
          onPress={() => void refreshSession()}
        >
          <Text style={globalStyles.buttonText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <Stack
      initialRouteName="(tabs)"
      screenOptions={{
        headerShown: false,
        headerTitleStyle: {
          fontFamily: fonts.semibold,
          fontWeight: "normal",
        },
      }}
    >
      <Stack.Screen name="(tabs)" />

      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  statusScreen: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 24,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    textAlign: "center",
    marginBottom: 24,
  },
});
