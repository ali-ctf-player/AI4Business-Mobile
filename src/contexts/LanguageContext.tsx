import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "az" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Tərcümə sözlüyü
const translations: Record<Language, Record<string, string>> = {
  az: {
    // Login
    "login.title": "Giriş",
    "login.email": "Email",
    "login.password": "Parol",
    "login.emailPassword": "Email və Parol ilə Giriş",
    "login.myGov": "Asan Login ilə Giriş",
    "login.guest": "Qonaq kimi davam et",
    "login.or": "və ya",
    "login.submit": "Giriş",
    // Chat
    "chat.title": "Chat",
    "chat.placeholder": "Sual verin...",
    "chat.send": "Göndər",
    "chat.greeting": "Salam! Mən SES innovasiya ekosistem köməkçisiyəm. Hackathonlar, iştirakçılar, investorlar və tərəfdaşlıq imkanları haqqında sual-cavab verə biləm.",
    // Map
    "map.title": "Xəritə",
    "map.ecosystem": "Ekosistem Xəritəsi",
    "map.hackathons": "Hackathonlar",
    "map.itHubs": "IT Mərkəzləri",
    // Profile Selection
    "profile.select": "Profil növünü seç",
    "profile.startup": "İştirakçı",
    "profile.investor": "İnvestor",
    "profile.itCompany": "İT Şirkət",
    "profile.incubator": "İnkubator/Təşkilatçı",
    "profile.admin": "Admin",
    // Common
    "common.loading": "Yüklənir...",
    "common.error": "Xəta",
    "common.ok": "OK",
  },
  en: {
    // Login
    "login.title": "Login",
    "login.email": "Email",
    "login.password": "Password",
    "login.emailPassword": "Login with Email and Password",
    "login.myGov": "Login with Asan Login",
    "login.guest": "Continue as Guest",
    "login.or": "or",
    "login.submit": "Login",
    // Chat
    "chat.title": "Chat",
    "chat.placeholder": "Ask a question...",
    "chat.send": "Send",
    "chat.greeting": "Hi! I'm the SES innovation ecosystem assistant. I can help you with questions about hackathons, participants, investors, and partnership opportunities.",
    // Map
    "map.title": "Map",
    "map.ecosystem": "Ecosystem Map",
    "map.hackathons": "Hackathons",
    "map.itHubs": "IT Hubs",
    // Profile Selection
    "profile.select": "Select Profile Type",
    "profile.startup": "Participant",
    "profile.investor": "Investor",
    "profile.itCompany": "IT Company",
    "profile.incubator": "Incubator/Organizer",
    "profile.admin": "Admin",
    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.ok": "OK",
  },
};

const STORAGE_KEY = "@app_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("az");

  // Dil seçimini yüklə (localStorage simulyasiyası - production-da AsyncStorage istifadə et)
  useEffect(() => {
    // Expo-də localStorage yoxdur, amma development üçün bu kifayətdir
    // Production-da @react-native-async-storage/async-storage paketini əlavə edin
    try {
      const savedLang = localStorage?.getItem(STORAGE_KEY);
      if (savedLang === "az" || savedLang === "en") {
        setLanguageState(savedLang);
      }
    } catch {
      // localStorage mövcud deyil (React Native)
    }
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage?.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage mövcud deyil
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
