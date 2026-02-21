import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useRole } from "@/hooks/useRole";
import { getHackathons, deleteHackathon } from "@/services/data.service";
import { canManageHackathons, canDeleteHackathons, canCreateHackathon } from "@/utils/rbac";
import type { Hackathon } from "@/types/models";

export default function AdminHackathonsScreen() {
  const router = useRouter();
  const { roleSlug } = useRole();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const canEdit = canManageHackathons(roleSlug);
  const canDelete = canDeleteHackathons(roleSlug);
  const canCreate = canCreateHackathon(roleSlug);

  async function load() {
    const data = await getHackathons();
    setHackathons(data);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    if (!canEdit) {
      router.replace("/(tabs)");
      return;
    }
    load();
  }, [canEdit]);

  function handleDelete(h: Hackathon) {
    Alert.alert(
      "Hackathonu sil",
      `"${h.name}" silinsin?`,
      [
        { text: "Ləğv et", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            await deleteHackathon(h.id);
            load();
          },
        },
      ]
    );
  }

  if (!canEdit) return null;
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {canCreate && (
        <TouchableOpacity
          onPress={() => router.push("/admin/hackathon/edit/new")}
          className="mx-4 mt-4 mb-2 rounded-xl bg-primary py-3"
        >
          <Text className="text-center font-semibold text-white">+ Yeni hackathon</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={hackathons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
        renderItem={({ item }) => (
          <View className="mb-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <Text className="font-semibold text-slate-900 dark:text-white">{item.name}</Text>
            {item.location ? (
              <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">📍 {item.location}</Text>
            ) : null}
            <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {new Date(item.start_date).toLocaleDateString()} – {new Date(item.end_date).toLocaleDateString()}
            </Text>
            <View className="mt-3 flex-row gap-2">
              <TouchableOpacity
                onPress={() => router.push(`/admin/hackathon/edit/${item.id}`)}
                className="flex-1 rounded-lg bg-slate-600 py-2"
              >
                <Text className="text-center text-sm font-medium text-white">Redaktə</Text>
              </TouchableOpacity>
              {canDelete && (
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  className="rounded-lg bg-red-600 px-4 py-2"
                >
                  <Text className="text-center text-sm font-medium text-white">Sil</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text className="py-8 text-center text-slate-500 dark:text-slate-400">Hackathon yoxdur.</Text>
        }
      />
    </View>
  );
}
