import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getHackathonById, getTeamsByHackathonId } from "@/services/data.service";
import type { Hackathon } from "@/types/models";
import type { Team } from "@/types/models";

export default function HackathonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const h = await getHackathonById(id);
      if (h) setHackathon(h);
      const t = await getTeamsByHackathonId(id);
      setTeams(t);
      setLoading(false);
    })();
  }, [id]);

  if (loading || !hackathon) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">{hackathon.name}</Text>
        {hackathon.location && (
          <Text className="mt-1 text-slate-600 dark:text-slate-400">📍 {hackathon.location}</Text>
        )}
        <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {new Date(hackathon.start_date).toLocaleDateString()} –{" "}
          {new Date(hackathon.end_date).toLocaleDateString()}
        </Text>
        {hackathon.description ? (
          <Text className="mt-2 text-sm text-slate-700 dark:text-slate-300">{hackathon.description}</Text>
        ) : null}
      </View>
      <View className="px-4 py-2">
        <Text className="text-base font-semibold text-slate-900 dark:text-white">Teams</Text>
      </View>
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/team/${item.id}`)}
            className="mb-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            activeOpacity={0.8}
          >
            <Text className="font-semibold text-slate-900 dark:text-white">
              {item.team_role ? `${item.team_role} · ${item.name}` : item.name}
            </Text>
            {item.description ? (
              <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.description}</Text>
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text className="py-6 text-center text-slate-500 dark:text-slate-400">No teams yet.</Text>
        }
      />
    </View>
  );
}
