import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { signUp } from "@/services/auth.service";
import { useAuthContext } from "@/contexts/AuthContext";
import type { RoleSlug } from "@/types/database.types";
import { useLanguage } from "@/contexts/LanguageContext";

const ROLE_NAMES: Record<RoleSlug, { az: string; en: string }> = {
  startup: { az: "Startap", en: "Startup" },
  investor: { az: "İnvestor", en: "Investor" },
  it_company: { az: "İT Şirkət", en: "IT Company" },
  organizer: { az: "Təşkilatçı", en: "Organizer" },
  admin: { az: "Admin", en: "Admin" },
  super_admin: { az: "Super Admin", en: "Super Admin" },
};

// Qeydiyyat üçün mövcud rollar
const REGISTER_ROLES: RoleSlug[] = ["startup", "investor", "it_company", "organizer"];

export default function RegisterScreen() {
  const router = useRouter();
  const { refreshSession } = useAuthContext();
  const { language, setLanguage } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [roleSlug, setRoleSlug] = useState<RoleSlug>("startup");
  const [loading, setLoading] = useState(false);
  const [myGovLoading, setMyGovLoading] = useState(false);
  const [asanLoading, setAsanLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setError(null);
    if (!email.trim() || !password || !fullName.trim()) {
      setError(language === "az" ? "Email, parol və ad soyad tələb olunur." : "Email, password, and full name are required.");
      return;
    }
    if (password.length < 6) {
      setError(language === "az" ? "Parol ən azı 6 simvol olmalıdır." : "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await signUp({ email: email.trim(), password, fullName: fullName.trim(), roleSlug });
      await refreshSession();
      router.replace("/(tabs)");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : language === "az" ? "Qeydiyyat zamanı xəta baş verdi." : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMyGov() {
    setMyGovLoading(true);
    try {
      Alert.alert(
        language === "az" ? "MyGov Qeydiyyat" : "MyGov Registration",
        language === "az"
          ? "MyGov OAuth konfiqurasiyası hazırlanır. Tezliklə aktiv olacaq."
          : "MyGov OAuth configuration is being prepared. It will be active soon.",
        [{ text: "OK" }]
      );
    } catch (e: unknown) {
      Alert.alert(
        language === "az" ? "Xəta" : "Error",
        e instanceof Error ? e.message : language === "az" ? "MyGov qeydiyyatı zamanı xəta baş verdi." : "An error occurred during MyGov registration."
      );
    } finally {
      setMyGovLoading(false);
    }
  }

  async function handleAsan() {
    setAsanLoading(true);
    try {
      Alert.alert(
        language === "az" ? "ASAN İmza Qeydiyyat" : "ASAN İmza Registration",
        language === "az"
          ? "ASAN İmza OAuth konfiqurasiyası hazırlanır. Tezliklə aktiv olacaq."
          : "ASAN İmza OAuth configuration is being prepared. It will be active soon.",
        [{ text: "OK" }]
      );
    } catch (e: unknown) {
      Alert.alert(
        language === "az" ? "Xəta" : "Error",
        e instanceof Error ? e.message : language === "az" ? "ASAN İmza qeydiyyatı zamanı xəta baş verdi." : "An error occurred during ASAN İmza registration."
      );
    } finally {
      setAsanLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Geri düyməsi */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(auth)/welcome")}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← {language === "az" ? "Geri" : "Back"}</Text>
          </TouchableOpacity>

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

          {/* Loqo və başlıq */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>SES</Text>
            <Text style={styles.subText}>
              {language === "az" ? "Qeydiyyatdan Keç" : "Sign Up"}
            </Text>
          </View>

          {/* 1. ASAN İmza Düyməsi */}
          <TouchableOpacity
            style={[styles.asanButton, asanLoading && styles.buttonDisabled]}
            onPress={handleAsan}
            disabled={asanLoading}
          >
            {asanLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.asanButtonText}>
                {language === "az" ? "ASAN İmza ilə Qeydiyyat" : "Register with ASAN İmza"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Ayırıcı */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{language === "az" ? "və ya" : "or"}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 2. MyGov Düyməsi */}
          <TouchableOpacity
            style={[styles.myGovButton, myGovLoading && styles.buttonDisabled]}
            onPress={handleMyGov}
            disabled={myGovLoading}
          >
            {myGovLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.myGovButtonText}>
                {language === "az" ? "MyGov ilə Qeydiyyat" : "Register with MyGov"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Ayırıcı */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{language === "az" ? "və ya" : "or"}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 3. Email və Parol ilə Qeydiyyat */}
          <View style={styles.emailPasswordSection}>
            <Text style={styles.sectionTitle}>
              {language === "az" ? "Email və Parol ilə Qeydiyyat" : "Register with Email and Password"}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder={language === "az" ? "Ad Soyad" : "Full Name"}
              placeholderTextColor="#B0BEC5"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder={language === "az" ? "Email" : "Email"}
              placeholderTextColor="#B0BEC5"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder={language === "az" ? "Parol (min 6 simvol)" : "Password (min 6 characters)"}
              placeholderTextColor="#B0BEC5"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              editable={!loading}
            />

            {/* Rol seçimi */}
            <Text style={styles.roleTitle}>
              {language === "az" ? "Nə cür hesab açmaq istəyirsiniz?" : "What type of account do you want to create?"}
            </Text>
            <View style={styles.rolesContainer}>
              {REGISTER_ROLES.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRoleSlug(r)}
                  style={[
                    styles.roleButton,
                    roleSlug === r && styles.roleButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      roleSlug === r && styles.roleButtonTextActive,
                    ]}
                  >
                    {ROLE_NAMES[r][language]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>
                  {language === "az" ? "Qeydiyyatdan Keç" : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>SES v1.0.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#2196F3",
    fontWeight: "500",
  },
  languageContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
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
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  languageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#90A4AE",
  },
  languageTextActive: {
    color: "#FFFFFF",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 8,
  },
  subText: {
    fontSize: 18,
    color: "#546E7A",
    fontWeight: "600",
  },
  emailPasswordSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#546E7A",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#37474F",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#546E7A",
    marginTop: 8,
    marginBottom: 12,
  },
  rolesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#E1E8ED",
    borderWidth: 1,
    borderColor: "#CFD8DC",
  },
  roleButtonActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#546E7A",
  },
  roleButtonTextActive: {
    color: "#FFFFFF",
  },
  registerButton: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E1E8ED",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#90A4AE",
  },
  myGovButton: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  myGovButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  asanButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  asanButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: "#EF5350",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  footerText: {
    textAlign: "center",
    color: "#B0BEC5",
    fontSize: 12,
    marginTop: "auto",
  },
});
