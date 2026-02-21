import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { signIn } from "@/services/auth.service";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Login ekranı - Sign In seçildikdən sonra:
 * 1. ASAN İmza
 * 2. MyGov
 * 3. Mail və Parol
 */
export default function LoginScreen() {
  const router = useRouter();
  const { user, enterAsGuest, refreshSession } = useAuthContext();
  const { t, language, setLanguage } = useLanguage();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [myGovLoading, setMyGovLoading] = useState(false);
  const [asanLoading, setAsanLoading] = useState(false);

  // Əgər artıq giriş edilibsə, tabs-a yönləndir
  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user, router]);

  // Email/Nömrə və Parol ilə giriş
  async function handleEmailPasswordLogin() {
    if (!emailOrPhone.trim() || !password.trim()) {
      Alert.alert(
        language === "az" ? "Xəta" : "Error",
        language === "az"
          ? "Zəhmət olmasa email/nömrə və parol daxil edin."
          : "Please enter email/phone and password."
      );
      return;
    }

    setLoading(true);
    try {
      await signIn({
        email: emailOrPhone.trim(),
        password: password.trim(),
      });
      await refreshSession();
      router.replace("/(tabs)");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : (language === "az" ? "Giriş zamanı xəta baş verdi" : "An error occurred during login");
      Alert.alert(
        language === "az" ? "Giriş xətası" : "Login Error",
        message
      );
    } finally {
      setLoading(false);
    }
  }

  // MyGov ilə giriş
  async function handleMyGovLogin() {
    setMyGovLoading(true);
    try {
      Alert.alert(
        language === "az" ? "MyGov Giriş" : "MyGov Login",
        language === "az"
          ? "MyGov OAuth konfiqurasiyası hazırlanır. Tezliklə aktiv olacaq."
          : "MyGov OAuth configuration is being prepared. It will be active soon.",
        [
          {
            text: "OK",
            onPress: () => {
              // Demo üçün: MyGov login-i simulyasiya edirik
              // router.replace("/(tabs)");
            },
          },
        ]
      );
    } catch (error: unknown) {
      Alert.alert(
        language === "az" ? "Xəta" : "Error",
        error instanceof Error ? error.message : language === "az" ? "MyGov girişi zamanı xəta baş verdi" : "An error occurred during MyGov login"
      );
    } finally {
      setMyGovLoading(false);
    }
  }

  // ASAN İmza ilə giriş
  async function handleAsanLogin() {
    setAsanLoading(true);
    try {
      Alert.alert(
        language === "az" ? "ASAN İmza Giriş" : "ASAN İmza Login",
        language === "az"
          ? "ASAN İmza OAuth konfiqurasiyası hazırlanır. Tezliklə aktiv olacaq."
          : "ASAN İmza OAuth configuration is being prepared. It will be active soon.",
        [
          {
            text: "OK",
            onPress: () => {
              // Demo üçün: ASAN İmza login-i simulyasiya edirik
              // router.replace("/(tabs)");
            },
          },
        ]
      );
    } catch (error: unknown) {
      Alert.alert(
        language === "az" ? "Xəta" : "Error",
        error instanceof Error ? error.message : language === "az" ? "ASAN İmza girişi zamanı xəta baş verdi" : "An error occurred during ASAN İmza login"
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
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
              {language === "az" ? "Giriş Et" : "Sign In"}
            </Text>
          </View>

          {/* 1. ASAN İmza Düyməsi */}
          <TouchableOpacity
            style={[styles.asanButton, asanLoading && styles.buttonDisabled]}
            onPress={handleAsanLogin}
            disabled={asanLoading}
          >
            {asanLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.asanButtonText}>
                {language === "az" ? "ASAN İmza ilə Giriş" : "Login with ASAN İmza"}
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
            onPress={handleMyGovLogin}
            disabled={myGovLoading}
          >
            {myGovLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.myGovButtonText}>
                {language === "az" ? "MyGov ilə Giriş" : "Login with MyGov"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Ayırıcı */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{language === "az" ? "və ya" : "or"}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 3. Email/Nömrə və Parol Girişi */}
          <View style={styles.emailPasswordSection}>
            <Text style={styles.sectionTitle}>
              {language === "az" ? "Email/Nömrə və Parol ilə Giriş" : "Login with Email/Phone and Password"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={language === "az" ? "Email və ya telefon nömrəsi" : "Email or phone number"}
              placeholderTextColor="#B0BEC5"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              keyboardType="default"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder={language === "az" ? "Parol" : "Password"}
              placeholderTextColor="#B0BEC5"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.emailPasswordButton, loading && styles.buttonDisabled]}
              onPress={handleEmailPasswordLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.emailPasswordButtonText}>
                  {language === "az" ? "Giriş" : "Login"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={async () => {
                await enterAsGuest();
                router.replace("/(tabs)");
              }}
              disabled={loading}
            >
              <Text style={styles.guestButtonText}>
                {language === "az" ? "Guest kimi davam et" : "Continue as Guest"}
              </Text>
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
    marginBottom: 48,
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
  guestButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  guestButtonText: {
    color: "#90A4AE",
    fontSize: 15,
    fontWeight: "500",
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
  emailPasswordButton: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  emailPasswordButtonText: {
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
  footerText: {
    textAlign: "center",
    color: "#B0BEC5",
    fontSize: 12,
    marginTop: "auto",
  },
});
