import { getCurrentUser, signOut, type AuthUser } from "@/lib/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [retry, setRetry] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setErrorMessage("");
    void getCurrentUser().then((account) => {
      if (active) setUser(account);
    }).catch((error: unknown) => {
      if (active) setErrorMessage(error instanceof Error ? error.message : "Could not load your account.");
    }).finally(() => {
      if (active) setLoading(false);
    });
   return () => { active = false; };

    // Changing retry reruns the account request when Retry is tapped.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retry]));

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setErrorMessage("");
    try {
      await signOut();
      setUser(null);
      router.replace("/");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Logout failed. Try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.brand}>Chartineer</Text>
        {!loading && !user ? (
          <Link href="/" asChild>
            <Pressable accessibilityRole="button" accessibilityLabel="Open login" style={styles.loginButton}>
              <Ionicons name="person-outline" size={24} color="#2563EB" />
            </Pressable>
          </Link>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Welcome to Chartineer</Text>
        <Text style={styles.subtitle}>Your next discovery starts here.</Text>
        <View style={styles.card}>
          {loading ? <ActivityIndicator color="#2563EB" /> : user ? (
            <>
              <Text style={styles.cardTitle}>You are signed in</Text>
              <Text style={styles.cardDescription}>{user.email}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={handleLogout}
                disabled={loggingOut}
                accessibilityState={{ disabled: loggingOut, busy: loggingOut }}
                style={[styles.signInButton, loggingOut && styles.pressed]}
              >
                <Text style={styles.signInText}>{loggingOut ? "Signing out…" : "Log out"}</Text>
              </Pressable>
            </>
          ) : !errorMessage ? (
            <>
              <Text style={styles.cardTitle}>Get started</Text>
              <Text style={styles.cardDescription}>Sign in to access your account.</Text>
              <Link href="/" asChild>
                <Pressable accessibilityRole="button" style={styles.signInButton}>
                  <Text style={styles.signInText}>Sign in</Text>
                </Pressable>
              </Link>
            </>
          ) : null}
          {errorMessage ? (
            <>
              <Text style={styles.cardDescription} accessibilityLiveRegion="polite">{errorMessage}</Text>
              <Pressable accessibilityRole="button" style={styles.signInButton} onPress={() => setRetry((value) => value + 1)}>
                <Text style={styles.signInText}>Retry</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  brand: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563EB",
  },
  loginButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 24,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#475569",
    marginTop: 12,
  },
  card: {
    marginTop: 32,
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0F172A",
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "#475569",
    marginTop: 8,
  },
  signInButton: {
    minHeight: 48,
    marginTop: 24,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});