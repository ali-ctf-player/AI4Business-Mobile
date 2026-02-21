import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  getTeamById,
  getTeamMembersWithProfiles,
  insertTeamJoinRequest,
  getTeamJoinRequests,
  getTeamLeadUserId,
  isUserInTeam,
  getJoinRequestStatus,
  acceptTeamJoinRequest,
  rejectTeamJoinRequest,
} from "@/services/data.service";
import { useAuth } from "@/hooks/useAuth";
import type { Team } from "@/types/models";
import type { TeamJoinRequestRow } from "@/services/data.service";

type MemberRow = {
  id: string;
  user_id: string;
  role: string;
  full_name: string | null;
  email: string | null;
};

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [joinStatus, setJoinStatus] = useState<"none" | "pending" | "accepted" | "rejected">("none");
  const [isMember, setIsMember] = useState(false);
  const [isLead, setIsLead] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<TeamJoinRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);

  async function load() {
    if (!id) return;
    const t = await getTeamById(id);
    if (t) setTeam(t);
    const memberRows = await getTeamMembersWithProfiles(id);
    setMembers(memberRows.map((r) => ({ ...r, email: null })));
    if (user) {
      const [inTeam, status, leadId, requests] = await Promise.all([
        isUserInTeam(id, user.id),
        getJoinRequestStatus(id, user.id),
        getTeamLeadUserId(id),
        getTeamJoinRequests(id),
      ]);
      setIsMember(inTeam);
      setJoinStatus(status);
      setIsLead(leadId === user.id);
      setPendingRequests(requests);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id, user?.id]);

  async function handleJoinTeam() {
    if (!id || !user) return;
    setJoinLoading(true);
    try {
      await insertTeamJoinRequest(id, user.id);
      setJoinStatus("pending");
    } catch (e) {
      console.warn(e);
    }
    setJoinLoading(false);
  }

  async function handleAccept(reqId: string) {
    await acceptTeamJoinRequest(reqId);
    load();
  }

  async function handleReject(reqId: string) {
    Alert.alert("Rədd et", "Sorğunu rədd etmək istədiyinizə əminsiniz?", [
      { text: "Ləğv et", style: "cancel" },
      { text: "Rədd et", style: "destructive", onPress: async () => {
        await rejectTeamJoinRequest(reqId);
        load();
      }},
    ]);
  }

  if (loading || !team) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const showJoinButton = user && !isMember && joinStatus === "none";

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">
          {team.team_role ? `${team.team_role} · ${team.name}` : team.name}
        </Text>
        {team.description ? (
          <Text className="mt-1 text-sm text-slate-600 dark:text-slate-400">{team.description}</Text>
        ) : null}

        {isMember && (
          <View className="mt-4 rounded-xl bg-green-100 dark:bg-green-900/30 py-3 px-4">
            <Text className="text-center font-medium text-green-800 dark:text-green-200">Siz artıq üzvüsünüz</Text>
          </View>
        )}
        {user && !isMember && joinStatus === "pending" && (
          <View className="mt-4 rounded-xl bg-amber-100 dark:bg-amber-900/30 py-3 px-4">
            <Text className="text-center font-medium text-amber-800 dark:text-amber-200">Sorğu göndərildi – Team lead təsdiq edəcək</Text>
          </View>
        )}
        {showJoinButton && (
          <TouchableOpacity
            onPress={handleJoinTeam}
            disabled={joinLoading}
            className="mt-4 rounded-xl bg-primary py-3"
          >
            <Text className="text-center font-semibold text-white">
              {joinLoading ? "Göndərilir..." : "Komandaya qatıl (Team lead təsdiq edəcək)"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLead && pendingRequests.length > 0 && (
        <View className="mx-4 mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <Text className="font-semibold text-slate-900 dark:text-white">Qatılma sorğuları</Text>
          {pendingRequests.map((req) => (
            <View key={req.id} className="mt-3 flex-row items-center justify-between rounded-lg bg-slate-100 dark:bg-slate-700 p-3">
              <View>
                <Text className="font-medium text-slate-900 dark:text-white">{req.full_name || req.email || "İstifadəçi"}</Text>
                {req.email ? <Text className="text-xs text-slate-500">{req.email}</Text> : null}
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => handleAccept(req.id)} className="rounded-lg bg-green-600 px-3 py-2">
                  <Text className="text-sm font-medium text-white">Qəbul et</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleReject(req.id)} className="rounded-lg bg-red-600 px-3 py-2">
                  <Text className="text-sm font-medium text-white">Rədd et</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View className="px-4 py-2">
        <Text className="text-base font-semibold text-slate-900 dark:text-white">Üzvlər</Text>
      </View>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        renderItem={({ item }) => (
          <View className="mb-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
            <Text className="font-medium text-slate-900 dark:text-white">
              {item.full_name || "Üzv"}
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">{item.role}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text className="py-6 text-center text-slate-500 dark:text-slate-400">Üzv yoxdur.</Text>
        }
      />
    </View>
  );
}
