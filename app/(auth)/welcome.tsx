import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuthContext } from "@/contexts/AuthContext";

/**
 * Welcome screen - Sign In, Sign Up və Guest seçimi
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { enterAsGuest } = useAuthContext();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
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
            {language === "az" ? "Startup Ecosystem Support" : "Startup Ecosystem Support"}
          </Text>
          <Text style={styles.tagline}>
            {language === "az"
              ? "İnnovasiya ekosistemini birləşdiririk"
              : "Connecting the innovation ecosystem"}
          </Text>
        </View>

        {/* Sign In, Sign Up və Guest düymələri */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.signInButtonText}>
              {language === "az" ? "Giriş Et" : "Sign In"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => router.push("/(auth)/register")}
            activeOpacity={0.8}
          >
            <Text style={styles.signUpButtonText}>
              {language === "az" ? "Qeydiyyatdan Keç" : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={async () => {
              await enterAsGuest();
              router.replace("/(tabs)");
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.guestButtonText}>
              {language === "az" ? "Guest kimi davam et" : "Continue as Guest"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>SES v1.0.0</Text>
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
    justifyContent: "space-between",
    padding: 24,
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
    marginTop: 60,
  },
  logoText: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 8,
  },
  subText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#546E7A",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#90A4AE",
    textAlign: "center",
    marginTop: 8,
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  signInButton: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  signUpButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#2196F3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpButtonText: {
    color: "#2196F3",
    fontSize: 18,
    fontWeight: "600",
  },
  guestButton: {
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#90A4AE",
  },
  guestButtonText: {
    color: "#90A4AE",
    fontSize: 16,
    fontWeight: "500",
  },
  footerText: {
    textAlign: "center",
    color: "#B0BEC5",
    fontSize: 12,
  },
});
