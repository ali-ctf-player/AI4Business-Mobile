import { useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Text } from "react-native";
import { useAuthContext } from "@/contexts/AuthContext";

export default function TabsLayout() {
  const { signOut, isGuest } = useAuthContext();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    const wasGuest = isGuest;
    await signOut();
    setSigningOut(false);
    router.replace(wasGuest ? "/(auth)/welcome" : "/(auth)/login");
  }

  const iconSize = 24;
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0f172a" },
        headerTintColor: "#f8fafc",
        tabBarStyle: { backgroundColor: "#0f172a" },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
        headerRight: () => (
          <TouchableOpacity onPress={handleSignOut} disabled={signingOut} className="mr-3">
            <Text className="text-sm text-slate-300">{signingOut ? "..." : "Sign out"}</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="hub"
        options={{
          title: "Hub",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "business" : "business-outline"} size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "map" : "map-outline"} size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "chatbubbles" : "chatbubble-outline"} size={iconSize} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
