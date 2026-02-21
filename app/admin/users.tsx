import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useRole } from "@/hooks/useRole";
import {
  getAllProfiles,
  getAllRoles,
  updateProfileRole,
  deleteProfile,
} from "@/services/data.service";
import { canManageUsers } from "@/utils/rbac";
import { ROLE_DISPLAY_NAMES } from "@/constants/roles";
import type { RoleSlug } from "@/types/database.types";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role_slug: RoleSlug;
  role_id: string;
};

export default function AdminUsersScreen() {
  const router = useRouter();
  const { roleSlug } = useRole();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<Array<{ id: string; slug: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  useEffect(() => {
    if (!canManageUsers(roleSlug)) {
      router.replace("/(tabs)");
      return;
    }
    load();
  }, [roleSlug]);

  async function load() {
    const [profList, roleList] = await Promise.all([getAllProfiles(), getAllRoles()]);
    setProfiles(profList.map((p) => ({ ...p, role_id: p.role_id })));
    setRoles(roleList);
    setLoading(false);
    setRefreshing(false);
  }

  const uniqueProfiles = profiles.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);

  function openEdit(p: ProfileRow) {
    setEditingId(p.id);
    const currentRole = roles.find((r) => r.slug === p.role_slug);
    setSelectedRoleId(currentRole?.id ?? roles[0]?.id ?? "");
  }

  async function saveRole() {
    if (!editingId || !selectedRoleId) return;
    await updateProfileRole(editingId, selectedRoleId);
    setEditingId(null);
    load();
  }

  function handleDelete(p: ProfileRow) {
    Alert.alert(
      "İstifadəçini sil",
      `"${p.full_name || p.email || p.id}" silinsin? Bu geri alına bilməz.`,
      [
        { text: "Ləğv et", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            await deleteProfile(p.id);
            load();
          },
        },
      ]
    );
  }

  if (!canManageUsers(roleSlug)) return null;
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
        renderItem={({ item }) => (
          <View className="mb-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <Text className="font-semibold text-slate-900 dark:text-white">
              {item.email || "—"}
            </Text>
            {item.full_name ? (
              <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.full_name}</Text>
            ) : null}
            <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Rol: {ROLE_DISPLAY_NAMES[item.role_slug] ?? item.role_slug}
            </Text>
            <View className="mt-3 flex-row gap-2">
              <TouchableOpacity
                onPress={() => openEdit(item)}
                className="flex-1 rounded-lg bg-slate-600 py-2"
              >
                <Text className="text-center text-sm font-medium text-white">Rolu dəyiş</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                className="rounded-lg bg-red-600 px-4 py-2"
              >
                <Text className="text-center text-sm font-medium text-white">Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text className="py-8 text-center text-slate-500 dark:text-slate-400">İstifadəçi yoxdur.</Text>
        }
      />

      <Modal visible={!!editingId} transparent animationType="fade">
        <View className="flex-1 justify-center bg-black/50 p-6">
          <View className="rounded-2xl bg-white p-6 dark:bg-slate-800">
            <Text className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Rolu seç</Text>
            {roles.map((r) => (
              <TouchableOpacity
                key={r.id}
                onPress={() => setSelectedRoleId(r.id)}
                className={`mb-2 rounded-lg border p-3 ${
                  selectedRoleId === r.id
                    ? "border-primary bg-primary/10"
                    : "border-slate-200 dark:border-slate-600"
                }`}
              >
                <Text className="text-slate-900 dark:text-white">{r.name}</Text>
              </TouchableOpacity>
            ))}
            <View className="mt-4 flex-row gap-2">
              <TouchableOpacity
                onPress={() => setEditingId(null)}
                className="flex-1 rounded-lg bg-slate-500 py-3"
              >
                <Text className="text-center font-medium text-white">Ləğv et</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveRole} className="flex-1 rounded-lg bg-primary py-3">
                <Text className="text-center font-medium text-white">Saxla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
