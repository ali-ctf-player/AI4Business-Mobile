import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { getRoleIdBySlug, updateProfileRole } from "@/services/data.service";
import type { RoleSlug } from "@/types/database.types";

type ProfileType = {
  slug: RoleSlug;
  labelAz: string;
  labelEn: string;
  descriptionAz: string;
  descriptionEn: string;
  color: string;
};

const PROFILES: ProfileType[] = [
  {
    slug: "startup",
    labelAz: "İştirakçı",
    labelEn: "Participant",
    descriptionAz: "Yeni ideyalarınızı həyata keçirin",
    descriptionEn: "Bring your new ideas to life",
    color: "#2196F3",
  },
  {
    slug: "investor",
    labelAz: "İnvestor",
    labelEn: "Investor",
    descriptionAz: "Perspektivli startapları tapın",
    descriptionEn: "Find promising startups",
    color: "#4CAF50",
  },
  {
    slug: "it_company",
    labelAz: "İT Şirkət",
    labelEn: "IT Company",
    descriptionAz: "Texnologiya həlləri təklif edin",
    descriptionEn: "Offer technology solutions",
    color: "#FF9800",
  },
  {
    slug: "organizer",
    labelAz: "Təşkilatçı",
    labelEn: "Organizer",
    descriptionAz: "İnnovasiya təşəbbüsləri təşkil edin",
    descriptionEn: "Organize innovation initiatives",
    color: "#9C27B0",
  },
  {
    slug: "super_admin",
    labelAz: "Admin",
    labelEn: "Admin",
    descriptionAz: "Platformanı idarə edin",
    descriptionEn: "Manage the platform",
    color: "#607D8B",
  },
];

export default function ProfileSelectScreen() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { user, refreshSession } = useAuthContext();
  const [selectedProfile, setSelectedProfile] = useState<RoleSlug | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleProfileSelect(profileSlug: RoleSlug) {
    if (!user) {
      router.replace("/(auth)/login");
      return;
    }

    setSelectedProfile(profileSlug);
    setLoading(true);

    try {
      const roleId = await getRoleIdBySlug(profileSlug);
      if (roleId) {
        await updateProfileRole(user.id, roleId);
        await refreshSession();
      }
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Profil seçimi xətası:", error);
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Dil dəyişmə düyməsi */}
        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[styles.languageButton, language === "az" && styles.languageButtonActive]}
            onPress={() => setLanguage("az")}
          >
            <Text style={[styles.languageText, language === "az" && styles.languageTextActive]}>
              AZ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.languageButton, language === "en" && styles.languageButtonActive]}
            onPress={() => setLanguage("en")}
          >
            <Text style={[styles.languageText, language === "en" && styles.languageTextActive]}>
              EN
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{t("profile.select")}</Text>
          <Text style={styles.subtitle}>
            {language === "az"
              ? "Tətbiqdə istifadə edəcəyiniz profil növünü seçin"
              : "Select the profile type you will use in the app"}
          </Text>

          <View style={styles.profilesContainer}>
            {PROFILES.map((profile) => {
              const label = language === "az" ? profile.labelAz : profile.labelEn;
              const description = language === "az" ? profile.descriptionAz : profile.descriptionEn;
              const isSelected = selectedProfile === profile.slug;

              return (
                <TouchableOpacity
                  key={profile.slug}
                  style={[
                    styles.profileCard,
                    isSelected && { borderColor: profile.color, backgroundColor: `${profile.color}15` },
                    loading && styles.profileCardDisabled,
                  ]}
                  onPress={() => handleProfileSelect(profile.slug)}
                  disabled={loading}
                >
                  <View style={styles.profileCardContent}>
                    <View style={[styles.profileIconContainer, { backgroundColor: `${profile.color}20` }]}>
                      <View style={[styles.profileIconCircle, { backgroundColor: profile.color }]} />
                    </View>
                    <View style={styles.profileTextContainer}>
                      <Text style={[styles.profileLabel, isSelected && { color: profile.color }]}>
                        {label}
                      </Text>
                      <Text style={styles.profileDescription}>{description}</Text>
                    </View>
                    {loading && isSelected && (
                      <ActivityIndicator size="small" color={profile.color} style={styles.loader} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollContent: {
    flexGrow: 1,
  },
  languageContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    paddingTop: 8,
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  languageButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  languageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#90A4AE",
  },
  languageTextActive: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#37474F",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#90A4AE",
    marginBottom: 32,
    textAlign: "center",
  },
  profilesContainer: {
    gap: 16,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileCardDisabled: {
    opacity: 0.6,
  },
  profileCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  profileIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  profileTextContainer: {
    flex: 1,
  },
  profileLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#37474F",
    marginBottom: 4,
  },
  profileDescription: {
    fontSize: 14,
    color: "#90A4AE",
  },
  loader: {
    marginLeft: 8,
  },
});
