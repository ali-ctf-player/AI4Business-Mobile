import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Geri",
        headerStyle: { backgroundColor: "#0f172a" },
        headerTintColor: "#f8fafc",
      }}
    >
      <Stack.Screen name="index" options={{ title: "İdarəetmə" }} />
      <Stack.Screen name="hackathons" options={{ title: "Hackathonlar" }} />
      <Stack.Screen name="users" options={{ title: "İstifadəçilər" }} />
      <Stack.Screen name="hackathon/edit/[id]" options={{ title: "Hackathon" }} />
    </Stack>
  );
}
