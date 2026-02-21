import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

/**
 * Root layout – Expo Router standart strukturu.
 * Stack naviqasiyası həmişə mount qalır, "prevent remove context" xətası aradan qalxır.
 * index səhifəsi əsas giriş, (auth)/login giriş ekranı kimi işləyir.
 */
export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="profile-select" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="hackathon" />
          <Stack.Screen name="team" />
          <Stack.Screen name="startup" />
          <Stack.Screen name="admin" />
        </Stack>
      </AuthProvider>
    </LanguageProvider>
  );
}
