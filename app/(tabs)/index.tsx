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
import { getHackathons, getStartups } from "@/services/data.service";
import { useRole } from "@/hooks/useRole";
import { canManageHackathons, canManageUsers, canCreateHackathon } from "@/utils/rbac";
import type { Hackathon } from "@/types/models";
import type { Startup } from "@/types/models";

type TabKind = "hackathons" | "startups";

export default function HomeScreen() {
  const router = useRouter();
  const { roleSlug } = useRole();
  const [tab, setTab] = useState<TabKind>("hackathons");
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const showAdmin = canManageHackathons(roleSlug) || canManageUsers(roleSlug) || canCreateHackathon(roleSlug);

  async function load() {
    const [h, s] = await Promise.all([getHackathons(), getStartups()]);
    setHackathons(h);
    setStartups(s);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    load();
  }, []);

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
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-semibold text-slate-900 dark:text-white">
              Programs & Hackathons
            </Text>
            <Text className="text-sm text-slate-600 dark:text-slate-400">
              {tab === "hackathons" ? "Hackathonları seçin" : "Startap adları"}
            </Text>
          </View>
          {showAdmin && (
            <TouchableOpacity
              onPress={() => router.push("/admin")}
              className="rounded-xl bg-slate-700 px-4 py-2 dark:bg-slate-600"
            >
              <Text className="font-medium text-white">İdarəetmə</Text>
            </TouchableOpacity>
          )}
        </View>
        <View className="mt-3 flex-row rounded-xl bg-slate-200 dark:bg-slate-700 p-1">
          <TouchableOpacity
            onPress={() => setTab("hackathons")}
            className={`flex-1 rounded-lg py-2 ${tab === "hackathons" ? "bg-white dark:bg-slate-600 shadow" : ""}`}
          >
            <Text className={`text-center font-medium ${tab === "hackathons" ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
              Hackathonlar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab("startups")}
            className={`flex-1 rounded-lg py-2 ${tab === "startups" ? "bg-white dark:bg-slate-600 shadow" : ""}`}
          >
            <Text className={`text-center font-medium ${tab === "startups" ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
              Startaplar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {tab === "hackathons" ? (
        <FlatList
          data={hackathons}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/hackathon/${item.id}`)}
              className="mb-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              activeOpacity={0.8}
            >
              <View className="flex-row items-start">
                {item.icon_url ? (
                  <Text className="mr-3 text-2xl">{item.icon_url}</Text>
                ) : null}
                <View className="flex-1">
                  <Text className="text-base font-semibold text-slate-900 dark:text-white">
                    Hackathon
                  </Text>
                  {item.location ? (
                    <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      📍 {item.location}
                    </Text>
                  ) : null}
                  <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(item.start_date).toLocaleDateString()} –{" "}
                    {new Date(item.end_date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text className="py-8 text-center text-slate-500 dark:text-slate-400">
              Hackathon yoxdur.
            </Text>
          }
        />
      ) : (
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
              {item.description ? (
                <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400" numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text className="py-8 text-center text-slate-500 dark:text-slate-400">
              Startap yoxdur.
            </Text>
          }
        />
      )}
    </View>
  );
}
