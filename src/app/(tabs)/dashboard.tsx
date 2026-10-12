import { useAuth } from "@/providers/auth-provider";
import { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
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
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Logout failed. Try again.",
      );
    } finally {
      logoutPending.current = false;
      setLoggingOut(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "bottom", "left", "right"]}
    >
      <View style={styles.header}>
        <Text style={styles.brand}>Chartineer</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Welcome to Chartineer</Text>
        <Text style={styles.subtitle}>
          Your next discovery starts here.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>You are signed in</Text>
          <Text style={styles.cardDescription}>{user.email}</Text>

          {errorMessage ? (
            <Text
              style={styles.cardDescription}
              accessibilityLiveRegion="polite"
            >
              {errorMessage}
            </Text>
          ) : null}

          <Pressable
            onPress={handleLogout}
            disabled={loggingOut}
            accessibilityRole="button"
            accessibilityState={{
              disabled: loggingOut,
              busy: loggingOut,
            }}
            style={[
              styles.signInButton,
              loggingOut && styles.pressed,
            ]}
          >
            <Text style={styles.signInText}>
              {loggingOut ? "Signing out…" : "Log out"}
            </Text>
          </Pressable>
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