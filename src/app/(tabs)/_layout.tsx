import { useAuth } from "@/providers/auth-provider";
import { fonts } from "@/styles/global";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const { user } = useAuth();

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
          borderTopColor: "#25262B",
          paddingTop: 5,
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
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={18}
            />
          ),
        }}
      />

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

      <Tabs.Protected guard={!!user}>
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                color={color}
                size={18}
              />
            ),
          }}
        />
      </Tabs.Protected>
    </Tabs>
  );
}