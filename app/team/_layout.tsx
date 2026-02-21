import { Stack } from "expo-router";

export default function TeamLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: "#0f172a" },
        headerTintColor: "#f8fafc",
      }}
    />
  );
}
