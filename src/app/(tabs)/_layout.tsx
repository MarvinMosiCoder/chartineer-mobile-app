import { useAuth } from "@/providers/auth-provider";
import { fonts } from "@/styles/global";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PlatformPressable } from "@react-navigation/elements";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function TabsLayout() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#8E9098",
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopWidth: 0,
          height: 96,
          paddingTop: 3,
          paddingBottom: insets.bottom,
        },
        tabBarBackground: () => (
          <View
            pointerEvents="none"
            className="absolute top-[32px] bottom-0 left-0 right-0 bg-[#15171C] border-t-[1px] border-[#25262B]"
          />
        ),
        tabBarLabelPosition: "below-icon",
        tabBarItemStyle: {
          paddingTop: 32,
        },
        tabBarIconStyle: {
          width: 24,
          height: 24,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.regular,
          fontSize: 11,
        },
        sceneStyle: {
          backgroundColor: "#000000",
        },
      }}
    >
      
      <Tabs.Screen
        name="markets"
        options={{
          title: "Markets",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              color={color}
              size={18}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="workspace"
        options={{
          title: "Workspace",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              color={color}
              size={18}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarAccessibilityLabel: "Home",
          tabBarItemStyle: { paddingTop: 0 },
          tabBarButton: (props) => (
            <PlatformPressable
              {...props}
              style={[
                props.style,
                {
                  padding: 0,
                  alignItems: "center",
                  justifyContent: "flex-start",
                },
              ]}
            >
              <View className="w-[64px] h-[64px] rounded-full bg-[#159575] border-[6px] border-[#000000] items-center justify-center">
                <Ionicons name="home" color="#FFFFFF" size={26} />
              </View>
            </PlatformPressable>
          ),
        }}
      />
  
      <Tabs.Screen
        name="assets"
        options={{
          title: "Assets",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              color={color} 
              size={18}
            />
          ),
        }}
      />

      <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                color={color} 
                size={18}
              />
            ),
          }}
        />

      <Tabs.Protected guard={!!user}>
        
      </Tabs.Protected>
    </Tabs>
  );
}