import { fonts } from "@/styles/global";
import { Poppins_400Regular } from "@expo-google-fonts/poppins/400Regular";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins/600SemiBold";
import { Poppins_700Bold } from "@expo-google-fonts/poppins/700Bold";
import { Poppins_800ExtraBold } from "@expo-google-fonts/poppins/800ExtraBold";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }

    if (error) {
      throw error;
    }
  }, [loaded, error]);

  if (!loaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerTitleStyle: {
          fontFamily: fonts.semibold,
          fontWeight: "normal",
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: "Sign in" }} />
    </Stack>
  );
}
