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

  const showHub = canSeeInvestorHub(roleSlug);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!showHub) {
    return (
      <View className="flex-1 justify-center bg-slate-50 px-6 dark:bg-slate-900">
        <Text className="text-center text-slate-600 dark:text-slate-400">
          Startap/İnvestisiya Hub-a yalnız İnvestor, Təşkilatçı və Admin rolları daxil ola bilər.
        </Text>
        <Text className="mt-4 text-center text-sm text-slate-500 dark:text-slate-500">
          Startap və İT Şirkət rolları üçün Home və Map, komandaya qatılma və startap yaratma funksiyaları aktivdir.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="px-4 pt-2 pb-4">
        <Text className="text-lg font-semibold text-slate-900 dark:text-white">
          Startup / Investment Hub
        </Text>
        <Text className="text-sm text-slate-600 dark:text-slate-400">
          Browse startups by Startup ID
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
