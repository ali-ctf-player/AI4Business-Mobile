import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, Link } from "expo-router";
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
    // #region agent log
    fetch('http://127.0.0.1:7608/ingest/dc845c4d-7102-4711-a8f1-555bb84dada4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b5ff6e'},body:JSON.stringify({sessionId:'b5ff6e',location:'index.tsx:load:entry',message:'load started',data:{},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const [h, s] = await Promise.all([getHackathons(), getStartups()]);
      // #region agent log
      fetch('http://127.0.0.1:7608/ingest/dc845c4d-7102-4711-a8f1-555bb84dada4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b5ff6e'},body:JSON.stringify({sessionId:'b5ff6e',location:'index.tsx:load:afterFetch',message:'startups loaded',data:{startupsLength:s?.length??-1,firstId:s?.[0]?.id??'none',firstName:s?.[0]?.name??'none'},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setHackathons(h);
      setStartups(s);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7608/ingest/dc845c4d-7102-4711-a8f1-555bb84dada4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b5ff6e'},body:JSON.stringify({sessionId:'b5ff6e',location:'index.tsx:load:catch',message:'load error',data:{err: String(err)},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setLoading(false);
      setRefreshing(false);
      throw err;
    }
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

  const roleHint =
    roleSlug === "startup"
      ? "Hackathonlara qatılın, komanda qurun, startap yaradın"
      : roleSlug === "investor"
        ? "Hub-da startapları qiymətləndirin"
        : roleSlug === "it_company"
          ? "Hub-da startaplar və tərəfdaşlıq imkanları"
          : roleSlug === "organizer"
            ? "Hackathon yaradın – İdarəetmə panelindən"
            : null;

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
        {roleHint ? (
          <View className="mt-2 rounded-xl bg-primary/10 border border-primary/30 px-3 py-2">
            <Text className="text-sm text-slate-700 dark:text-slate-200">{roleHint}</Text>
          </View>
        ) : null}
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
            <Link href={`/startup/${item.id}`} asChild>
              <TouchableOpacity
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
            </Link>
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
