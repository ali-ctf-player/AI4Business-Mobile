import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getStartupById } from "@/services/data.service";
import type { Startup } from "@/types/models";

export default function StartupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getStartupById(id).then((data) => {
      setStartup(data);
      setLoading(false);
    });
  }, [id]);

  if (loading || !startup) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">{startup.name}</Text>
        <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">Startup ID: {startup.id}</Text>
        {startup.stage ? (
          <View className="mt-2 self-start rounded-full bg-primary/20 px-3 py-1">
            <Text className="text-sm font-medium text-primary">{startup.stage}</Text>
          </View>
        ) : null}
      </View>
      <View className="p-4">
        {startup.description ? (
          <>
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">About</Text>
            <Text className="mt-1 text-slate-600 dark:text-slate-400">{startup.description}</Text>
          </>
        ) : null}
        {startup.website ? (
          <Text
            className="mt-4 text-primary"
            onPress={() => Linking.openURL(startup.website!.startsWith("http") ? startup.website! : `https://${startup.website}`)}
          >
            Visit website
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}
