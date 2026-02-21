import { View, ActivityIndicator, Text } from "react-native";
import { Redirect } from "expo-router";
import { useAuthContext } from "@/contexts/AuthContext";

/**
 * Entry: session yoxlanır, (auth)/login və ya profil seçimi/(tabs)-a yönləndirilir.
 */
export default function Index() {
  const { user, profile, loading, isGuest } = useAuthContext();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 12, color: "#64748b" }}>Yüklənir...</Text>
      </View>
    );
  }

  // Guest rejimi – şəbəkə xətası olsa belə sayta daxil olmaq üçün
  if (isGuest) return <Redirect href="/(tabs)" />;

  if (!user) return <Redirect href="/(auth)/welcome" />;

  // Əgər user var amma profil seçilməyibsə, profil seçimi ekranına yönləndir
  if (user && (!profile || !profile.role_id)) {
    return <Redirect href="/profile-select" />;
  }

  return <Redirect href="/(tabs)" />;
}
