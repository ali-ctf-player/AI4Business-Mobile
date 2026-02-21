import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getHackathonById, createHackathon, updateHackathon } from "@/services/data.service";
import { useRole } from "@/hooks/useRole";
import { canManageHackathons, canCreateHackathon, canOnlyEditHackathonName } from "@/utils/rbac";
import type { Hackathon } from "@/types/models";

function toInputDateTime(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function fromISO(s: string): Date {
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

export default function AdminHackathonEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { roleSlug } = useRole();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(toInputDateTime(new Date()));
  const [endDate, setEndDate] = useState(toInputDateTime(new Date(Date.now() + 3 * 86400000)));
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const nameOnlyEdit = canOnlyEditHackathonName(roleSlug);

  useEffect(() => {
    if (isNew && !canCreateHackathon(roleSlug)) {
      router.replace("/(tabs)");
      return;
    }
    if (!canManageHackathons(roleSlug) && !canCreateHackathon(roleSlug)) {
      router.replace("/(tabs)");
      return;
    }
    if (isNew) {
      setLoading(false);
      return;
    }
    (async () => {
      const h = await getHackathonById(id!);
      if (h) {
        setName(h.name);
        setDescription(h.description ?? "");
        setLocation(h.location ?? "");
        setStartDate(toInputDateTime(fromISO(h.start_date)));
        setEndDate(toInputDateTime(fromISO(h.end_date)));
        setLatitude(h.latitude != null ? String(h.latitude) : "");
        setLongitude(h.longitude != null ? String(h.longitude) : "");
        setIconUrl(h.icon_url ?? "");
      }
      setLoading(false);
    })();
  }, [id, isNew, roleSlug]);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Xəta", "Ad daxil edin.");
      return;
    }
    if (nameOnlyEdit && !isNew) {
      setSaving(true);
      try {
        await updateHackathon(id!, { name: name.trim() });
        router.back();
      } catch (e) {
        Alert.alert("Xəta", String(e));
      }
      setSaving(false);
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      Alert.alert("Xəta", "Başlanğıc və bitmə tarixi düzgün daxil edin.");
      return;
    }
    const startStr = start.toISOString().slice(0, 19);
    const endStr = end.toISOString().slice(0, 19);
    const lat = latitude ? parseFloat(latitude) : null;
    const lng = longitude ? parseFloat(longitude) : null;

    setSaving(true);
    try {
      if (isNew) {
        await createHackathon({
          name: name.trim(),
          description: description.trim() || null,
          start_date: startStr,
          end_date: endStr,
          location: location.trim() || null,
          latitude: lat,
          longitude: lng,
          icon_url: iconUrl.trim() || null,
        });
      } else {
        await updateHackathon(id!, {
          name: name.trim(),
          description: description.trim() || null,
          start_date: startStr,
          end_date: endStr,
          location: location.trim() || null,
          latitude: lat,
          longitude: lng,
          icon_url: iconUrl.trim() || null,
        });
      }
      router.back();
    } catch (e) {
      Alert.alert("Xəta", String(e));
    }
    setSaving(false);
  }

  if (!canManageHackathons(roleSlug) && !canCreateHackathon(roleSlug)) return null;
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900" contentContainerStyle={{ padding: 16 }}>
      <Text className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">Ad</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Hackathon adı"
        className="mb-4 rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        placeholderTextColor="#94a3b8"
      />

      {!nameOnlyEdit && (
        <>
          <Text className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">Təsvir / Bio</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Təsvir"
            multiline
            className="mb-4 rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholderTextColor="#94a3b8"
          />

          <Text className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">Yer</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Məs: Bakı, Azərbaycan"
            className="mb-4 rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholderTextColor="#94a3b8"
          />

          <Text className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">Başlanğıc vaxtı</Text>
          <TextInput
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DDTHH:mm"
            className="mb-4 rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholderTextColor="#94a3b8"
          />

          <Text className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">Bitmə vaxtı</Text>
          <TextInput
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DDTHH:mm"
            className="mb-4 rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholderTextColor="#94a3b8"
          />

          <Text className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">Enlik (xəritədə yer)</Text>
          <TextInput
            value={latitude}
            onChangeText={setLatitude}
            placeholder="40.4093"
            keyboardType="decimal-pad"
            className="mb-4 rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholderTextColor="#94a3b8"
          />

          <Text className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">Uzunluq (xəritədə yer)</Text>
          <TextInput
            value={longitude}
            onChangeText={setLongitude}
            placeholder="49.8671"
            keyboardType="decimal-pad"
            className="mb-4 rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholderTextColor="#94a3b8"
          />

          <Text className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">İkon (emoji və ya URL)</Text>
          <TextInput
            value={iconUrl}
            onChangeText={setIconUrl}
            placeholder="🏆"
            className="mb-6 rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholderTextColor="#94a3b8"
          />
        </>
      )}

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        className="rounded-xl bg-primary py-4"
      >
        <Text className="text-center font-semibold text-white">
          {saving ? "Saxlanılır..." : isNew ? "Yarat" : "Saxla"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
