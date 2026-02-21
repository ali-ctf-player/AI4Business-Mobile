import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useRole } from "@/hooks/useRole";
import { canManageHackathons, canManageUsers, canCreateHackathon } from "@/utils/rbac";

export default function AdminDashboard() {
  const router = useRouter();
  const { roleSlug } = useRole();
  const showHackathons = canManageHackathons(roleSlug);
  const showUsers = canManageUsers(roleSlug);
  const showCreateHackathon = canCreateHackathon(roleSlug);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900 p-6">
      <Text className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-6">
        İdarəetmə paneli
      </Text>
      {showCreateHackathon && (
        <TouchableOpacity
          onPress={() => router.push("/admin/hackathon/edit/new")}
          className="mb-4 rounded-xl bg-primary p-4"
        >
          <Text className="text-white font-semibold">Hackathon yarat</Text>
          <Text className="text-white/80 text-sm mt-1">
            Xəritədə yer seçib, bio əlavə edin (Təşkilatçı / Superadmin)
          </Text>
        </TouchableOpacity>
      )}
      {showHackathons && (
        <TouchableOpacity
          onPress={() => router.push("/admin/hackathons")}
          className="mb-4 rounded-xl bg-slate-800 dark:bg-slate-700 p-4"
        >
          <Text className="text-white font-semibold">Hackathonlar</Text>
          <Text className="text-slate-300 text-sm mt-1">
            {roleSlug === "admin" ? "Yalnız hackathon adlarını redaktə edin" : "Hackathonları redaktə et, sil, vaxtı dəyiş"}
          </Text>
        </TouchableOpacity>
      )}
      {showUsers && (
        <TouchableOpacity
          onPress={() => router.push("/admin/users")}
          className="mb-4 rounded-xl bg-slate-800 dark:bg-slate-700 p-4"
        >
          <Text className="text-white font-semibold">İstifadəçilər</Text>
          <Text className="text-slate-300 text-sm mt-1">
            Bütün hesabları idarə et, rol təyin et
          </Text>
        </TouchableOpacity>
      )}
      {!showHackathons && !showUsers && (
        <Text className="text-slate-500">Bu panellə giriş icazəniz yoxdur.</Text>
      )}
    </View>
  );
}
