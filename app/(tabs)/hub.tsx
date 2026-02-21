import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { getStartups } from "@/services/data.service";
import { useRole } from "@/hooks/useRole";
import { canSeeInvestorHub } from "@/utils/rbac";
import type { Startup } from "@/types/models";

export default function HubScreen() {
  const router = useRouter();
  const { roleSlug } = useRole();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const data = await getStartups();
    setStartups(data);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    load();
  }, []);

  const hubTitle =
    roleSlug === "startup"
      ? "Hub – Startaplar"
      : roleSlug === "investor"
        ? "İnvestisiya Hub – Startaplar"
        : roleSlug === "it_company"
          ? "Hub – Startaplar və tərəfdaşlıq"
          : roleSlug === "organizer"
            ? "Hub – Startaplar və təşkilat"
            : "Startup / Investment Hub";
  const hubSubtitle =
    roleSlug === "startup"
      ? "Startapları baxın və öz startapınızı yarada bilərsiniz"
      : roleSlug === "investor"
        ? "Startapları qiymətləndirin və investisiya imkanlarını görün"
        : roleSlug === "it_company"
          ? "Startaplar və tərəfdaşlıq imkanları"
          : "Startaplar siyahısı";

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="px-4 pt-2 pb-4">
        <Text className="text-lg font-semibold text-slate-900 dark:text-white">
          {hubTitle}
        </Text>
        <Text className="text-sm text-slate-600 dark:text-slate-400">
          {hubSubtitle}
        </Text>
      </View>
      <FlatList
        data={startups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/startup/${item.id}`)}
            className="mb-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            activeOpacity={0.8}
          >
            <Text className="text-base font-semibold text-slate-900 dark:text-white">
              {item.name}
            </Text>
            <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Startup ID: {item.id.slice(0, 8)}…
            </Text>
            {item.stage ? (
              <Text className="mt-1 text-sm text-primary">{item.stage}</Text>
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text className="py-8 text-center text-slate-500 dark:text-slate-400">
            No startup profiles yet.
          </Text>
        }
      />
    </View>
  );
}
