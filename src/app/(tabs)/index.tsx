import { useAuth } from "@/providers/auth-provider";
import { colors } from "@/styles/global";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const categories = [{
  title: "Semiconductors",
  symbol: "NVDA",
  change: "+0.31%"
}, {
  title: "ARK Holdings",
  symbol: "TSLA",
  change: "+0.65%"
}, {
  title: "AI",
  symbol: "GOOG",
  change: "+0.43%"
}, {
  title: "Crypto",
  symbol: "BTC",
  change: "+0.85%"
}];
const markets = [{
  symbol: "BTC",
  name: "Bitcoin",
  badge: "₿",
  badgeClassName: "bg-[#FF9500]",
  price: "83,658.30",
  change: "+0.85%"
}, {
  symbol: "ETH",
  name: "Ethereum",
  badge: "Ξ",
  badgeClassName: "bg-[#627EEA]",
  price: "2,544.20",
  change: "+1.49%"
}, {
  symbol: "SOL",
  name: "Solana",
  badge: "S",
  badgeClassName: "bg-[#9945FF]",
  price: "142.80",
  change: "+2.18%"
}];
export default function HomeScreen() {
  const {
    user
  } = useAuth();
  const [search, setSearch] = useState("");
  const searchInput = useRef<TextInput>(null);
  useFocusEffect(useCallback(() => {
    setStatusBarStyle("light");
    return () => {
      setStatusBarStyle("dark");
    };
  }, []));
  console.log("user", user);
  const query = search.trim().toLowerCase();
  const visibleMarkets = markets.filter(market => `${market.symbol} ${market.name} USDT`.toLowerCase().includes(query));
  return <SafeAreaView className="flex-1 bg-[#000000]" edges={["top", "left", "right"]}>
      <ScrollView contentContainerClassName="p-[16px] pb-[32px] w-[100%] max-w-[600px] self-center" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-[12px]">
          <Link href={user ? "/dashboard" : "/login"} asChild>
            <Pressable className="w-[44px] h-[44px] rounded-[22px] bg-[#292B30] items-center justify-center" accessibilityRole="button" accessibilityLabel={user ? "Open dashboard" : "Open login"}>
              <Ionicons name="person-outline" size={22} color="#FFFFFF" />
            </Pressable>
          </Link>

          <View className="flex-1 min-h-[44px] flex-row items-center gap-[8px] px-[12px] rounded-[24px] bg-[#202126]">
            <Ionicons name="search-outline" size={18} color="#A1A1AA" accessible={false} />
            <TextInput ref={searchInput} className="flex-1 min-w-[0px] min-h-[44px] text-[#FFFFFF] font-poppins text-[13px]" placeholder="Search markets" placeholderTextColor="#A1A1AA" accessibilityLabel="Search markets" value={search} onChangeText={setSearch} autoCapitalize="none" autoCorrect={false} returnKeyType="search" />
          </View>

          <Text className="text-[#159575] font-poppins-bold text-[24px]">C.</Text>
        </View>

        <View className="items-center pt-[32px] pb-[24px]">
          <View className="w-[120px] h-[120px] rounded-[60px] bg-[#312718] items-center justify-center mb-[20px]">
            <Ionicons name={user ? "stats-chart" : "stats-chart"} size={68} color={colors.primary} accessible={false} />
          </View>

          <Text className="text-[#FFFFFF] font-poppins-semibold text-[22px] text-center">
            {user ? "Welcome back" : "Welcome to Chartineer"}
          </Text>

          <Text className="text-[#A1A1AA] font-poppins text-[13px] text-center mt-[8px]">
            Discover markets. Find your next opportunity.
          </Text>

          <View className="w-[100%] flex-row flex-wrap gap-[12px] mt-[24px]">
            <Link href={user ? "/dashboard" : "/login"} asChild>
              <Pressable className="grow-[1] basis-[130px] min-h-[48px] px-[16px] rounded-[28px] bg-[#159575] items-center justify-center" accessibilityRole="button">
                <Text className="text-[#FFFFFF] font-poppins-semibold text-[14px]">
                  {user ? "Dashboard" : "Log in"}
                </Text>
              </Pressable>
            </Link>
            <Link href="/signup" asChild>
              <Pressable className="grow-[1] basis-[130px] min-h-[48px] px-[16px] rounded-[28px] border-[1px] border-[#34363B] items-center justify-center" accessibilityRole="button" accessibilityLabel="Search the market previews" onPress={() => searchInput.current?.focus()}>
                <Text className="text-[#FFFFFF] font-poppins-semibold text-[14px]">
                  Sign up
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-[10px]">
          {categories.map(category => <View key={category.title} className="grow-[1] basis-[45%] bg-[#141518] rounded-[14px] p-[14px] gap-[16px]">
              <Text className="text-[#FFFFFF] font-poppins-semibold text-[12px]">
                {category.title}
              </Text>

              <View className="flex-row flex-wrap items-center justify-between gap-[8px]">
                <Text className="text-[#D4D4D8] font-poppins text-[12px]">
                  {category.symbol}
                </Text>
                <Text className="text-[#00C879] font-poppins-semibold text-[11px]">
                  {category.change}
                </Text>
              </View>
            </View>)}
        </View>

        <View className="mt-[24px] p-[16px] rounded-[18px] bg-[#141518]">
          <View className="flex-row flex-wrap justify-between items-center gap-[8px]">
            <Text className="text-[#FFFFFF] font-poppins-semibold text-[16px]">Hot markets</Text>
            <Text className="text-[#A1A1AA] font-poppins text-[11px]">Sample data</Text>
          </View>

          <View className="flex-row justify-between mt-[20px] mb-[4px]">
            <Text className="text-[#A1A1AA] font-poppins text-[11px]">Name</Text>
            <Text className="text-[#A1A1AA] font-poppins text-[11px]">Price / Change</Text>
          </View>

          {visibleMarkets.map(market => <View key={market.symbol} className="flex-row items-center gap-[10px] py-[16px] border-b-[1px] border-b-[#25262B]">
              <View className={`w-[30px] h-[30px] rounded-[15px] items-center justify-center ${market.badgeClassName}`}>
                <Text className="text-[#FFFFFF] text-[19px] font-bold">
                  {market.badge}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="text-[#FFFFFF] font-poppins-semibold text-[13px]">
                  {market.symbol}
                  <Text className="text-[#A1A1AA] font-poppins text-[10px]"> / USDT</Text>
                </Text>
                <Text className="text-[#A1A1AA] font-poppins text-[11px] mt-[4px]">{market.name}</Text>
              </View>

              <View className="items-end gap-[6px]">
                <Text className="text-[#FFFFFF] font-poppins-semibold text-[13px]">{market.price}</Text>
                <View className="bg-[#00B86B] px-[10px] py-[4px] rounded-[20px]">
                  <Text className="text-[#FFFFFF] font-poppins-semibold text-[11px]">
                    {market.change}
                  </Text>
                </View>
              </View>
            </View>)}

          {visibleMarkets.length === 0 ? <Text className="text-[#A1A1AA] font-poppins text-center py-[24px]">
              No matching markets.
            </Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>;
}
