import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/styles/global";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const categories = [
  { title: "Semiconductors", symbol: "NVDA", change: "+0.31%" },
  { title: "ARK Holdings", symbol: "TSLA", change: "+0.65%" },
  { title: "AI", symbol: "GOOG", change: "+0.43%" },
  { title: "Crypto", symbol: "BTC", change: "+0.85%" },
];

const markets = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    badge: "₿",
    color: "#FF9500",
    price: "83,658.30",
    change: "+0.85%",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    badge: "Ξ",
    color: "#627EEA",
    price: "2,544.20",
    change: "+1.49%",
  },
  {
    symbol: "SOL",
    name: "Solana",
    badge: "S",
    color: "#9945FF",
    price: "142.80",
    change: "+2.18%",
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const searchInput = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
        setStatusBarStyle("light");

        return () => {
        setStatusBarStyle("dark");
        };
    }, []),
  );

  const query = search.trim().toLowerCase();
  const visibleMarkets = markets.filter((market) =>
    `${market.symbol} ${market.name} USDT`.toLowerCase().includes(query),
  );

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Link href={user ? "/dashboard" : "/login"} asChild>
            <Pressable
              style={styles.avatar}
              accessibilityRole="button"
              accessibilityLabel={user ? "Open dashboard" : "Open login"}
            >
              <Ionicons
                name="person-outline"
                size={22}
                color="#FFFFFF"
              />
            </Pressable>
          </Link>

          <View style={styles.search}>
            <Ionicons
              name="search-outline"
              size={18}
              color="#A1A1AA"
              accessible={false}
            />
            <TextInput
              ref={searchInput}
              style={styles.searchInput}
              placeholder="Search markets"
              placeholderTextColor="#A1A1AA"
              accessibilityLabel="Search markets"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>

          <Text style={styles.brand}>C.</Text>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons
              name={user ? "stats-chart" : "stats-chart"}
              size={68}
              color={colors.primary}
              accessible={false}
            />
          </View>

          <Text style={styles.heroTitle}>
            {user ? "Welcome back" : "Welcome to Chartineer"}
          </Text>

          <Text style={styles.heroDescription}>
            Discover markets. Find your next opportunity.
          </Text>

          <View style={styles.actions}>
            <Link href={user ? "/dashboard" : "/login"} asChild>
              <Pressable
                style={styles.primaryButton}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>
                  {user ? "Dashboard" : "Log in"}
                </Text>
              </Pressable>
            </Link>
            <Link href="/signup" asChild>
              <Pressable
                style={styles.secondaryButton}
                accessibilityRole="button"
                accessibilityLabel="Search the market previews"
                onPress={() => searchInput.current?.focus()}
              >
                <Text style={styles.secondaryButtonText}>
                  Sign up
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <View key={category.title} style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>
                {category.title}
              </Text>

              <View style={styles.categoryDetails}>
                <Text style={styles.categorySymbol}>
                  {category.symbol}
                </Text>
                <Text style={styles.categoryChange}>
                  {category.change}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.marketPanel}>
          <View style={styles.marketHeading}>
            <Text style={styles.sectionTitle}>Hot markets</Text>
            <Text style={styles.sampleLabel}>Sample data</Text>
          </View>

          <View style={styles.columnLabels}>
            <Text style={styles.mutedText}>Name</Text>
            <Text style={styles.mutedText}>Price / Change</Text>
          </View>

          {visibleMarkets.map((market) => (
            <View key={market.symbol} style={styles.marketRow}>
              <View
                style={[
                  styles.coinBadge,
                  { backgroundColor: market.color },
                ]}
              >
                <Text style={styles.coinBadgeText}>
                  {market.badge}
                </Text>
              </View>

              <View style={styles.coinDetails}>
                <Text style={styles.coinSymbol}>
                  {market.symbol}
                  <Text style={styles.coinPair}> / USDT</Text>
                </Text>
                <Text style={styles.coinName}>{market.name}</Text>
              </View>

              <View style={styles.priceDetails}>
                <Text style={styles.price}>{market.price}</Text>
                <View style={styles.changeBadge}>
                  <Text style={styles.changeText}>
                    {market.change}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {visibleMarkets.length === 0 ? (
            <Text style={styles.emptyText}>
              No matching markets.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#292B30",
    alignItems: "center",
    justifyContent: "center",
  },
  search: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 24,
    backgroundColor: "#202126",
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    color: "#FFFFFF",
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  brand: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 24,
  },
  hero: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
  },
  heroIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#312718",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontFamily: fonts.semibold,
    fontSize: 22,
    textAlign: "center",
  },
  heroDescription: {
    color: "#A1A1AA",
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  actions: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    flexGrow: 1,
    flexBasis: 130,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  secondaryButton: {
    flexGrow: 1,
    flexBasis: 130,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#34363B",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryCard: {
    flexGrow: 1,
    flexBasis: "45%",
    backgroundColor: "#141518",
    borderRadius: 14,
    padding: 14,
    gap: 16,
  },
  categoryTitle: {
    color: "#FFFFFF",
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  categoryDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  categorySymbol: {
    color: "#D4D4D8",
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  categoryChange: {
    color: "#00C879",
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
  marketPanel: {
    marginTop: 24,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#141518",
  },
  marketHeading: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  sampleLabel: {
    color: "#A1A1AA",
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  columnLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 4,
  },
  mutedText: {
    color: "#A1A1AA",
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  marketRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#25262B",
  },
  coinBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  coinBadgeText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },
  coinDetails: {
    flex: 1,
  },
  coinSymbol: {
    color: "#FFFFFF",
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  coinPair: {
    color: "#A1A1AA",
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  coinName: {
    color: "#A1A1AA",
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 4,
  },
  priceDetails: {
    alignItems: "flex-end",
    gap: 6,
  },
  price: {
    color: "#FFFFFF",
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  changeBadge: {
    backgroundColor: "#00B86B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  changeText: {
    color: "#FFFFFF",
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
  emptyText: {
    color: "#A1A1AA",
    fontFamily: fonts.regular,
    textAlign: "center",
    paddingVertical: 24,
  },
});