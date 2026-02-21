import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { chatWithGemini, type ChatMessage } from "@/lib/gemini";
import { useLanguage } from "@/contexts/LanguageContext";

const SYSTEM_PROMPT_AZ = `Sən SES (Startup Ecosystem Support) tətbiqinin köməkçisisən. 

SƏN:
- SES tətbiqinin rəsmi asistanısən
- İnnovation ekosistemində işləmə haqqında bilgi ver
- Hackathonlar, startuplar, investisiya və tərəfdaşlıq haqqında sual-cavablar
- Tətbiq xüsusiyyətləri haqqında sual-cavablar

QAYDALAR:
- Bütün cavabı tam ver, yarıda qatma
- Cavabı məntiqlə bitir
- Sualsız cavab vermə
- SES tətbiqinə aidiyyatı olmayan suallara "Üzr istəyirəm, mən sadəcə SES ekosistemində köməkçiyəm" de
- Möhtəviyyat: Hackathonlar, startuplar, investisiya, tərəfdaşlıq, müsabiqəsi, mükafatlar

BİT ETMƏ:
Cavabını "✓ Başqa nəsi bilmək istəyirsən?" ilə başa çıxart.`;

const SYSTEM_PROMPT_EN = `You are the assistant for the SES (Startup Ecosystem Support) app.

YOU ARE:
- The official assistant of the SES app
- Provide information about working in the innovation ecosystem
- Answer questions about hackathons, startups, investments, and partnerships
- Help with app features

RULES:
- Always provide complete answers - never cut off responses mid-sentence
- End responses with a logical conclusion
- Don't provide answers without context
- For questions unrelated to SES: "I'm sorry, I only assist with the SES ecosystem"
- Topics: Hackathons, startups, investments, partnerships, competitions, awards

END:
Always finish your response with "✓ What else would you like to know?"`;


export default function ChatScreen() {
  const { t, language } = useLanguage();
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "";

  useEffect(() => {
    if (!apiKey || apiKey.trim() === "") {
      console.error(
        "[Chat] EXPO_PUBLIC_GEMINI_API_KEY boşdur. .env faylında EXPO_PUBLIC_GEMINI_API_KEY təyin edin və npx expo start -c ilə yenidən başladın."
      );
    }
  }, [apiKey]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      content: t("chat.greeting"),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      if (!apiKey || apiKey.trim() === "") {
        console.error("[Chat] Gemini API key olmadan sorğu göndərilmədi.");
        setMessages((m) => [
          ...m,
          {
            role: "model",
            content: language === "az"
              ? "Gemini API açarı təyin olunmayıb. .env faylında EXPO_PUBLIC_GEMINI_API_KEY əlavə edin."
              : "Gemini API key is not set. Add EXPO_PUBLIC_GEMINI_API_KEY in .env file.",
          },
        ]);
        setLoading(false);
        return;
      }
      const systemPrompt = language === "az" ? SYSTEM_PROMPT_AZ : SYSTEM_PROMPT_EN;
      const response = await chatWithGemini([...messages, userMsg], systemPrompt);

      if (response.error) {
        setMessages((m) => [
          ...m,
          {
            role: "model",
            content: `${language === "az" ? "Xəta" : "Error"}: ${response.error}`,
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: "model",
            content: response.content,
          },
        ]);
      }
    } catch (error) {
      setMessages((m) => [
        ...m,
        {
          role: "model",
          content: error instanceof Error ? error.message : language === "az" ? "Xəta baş verdi." : "An error occurred.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item, index) => `${item.role}-${index}`}
          contentContainerStyle={styles.messagesContainer}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.role === "user" ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.role === "user" ? styles.userText : styles.assistantText,
                ]}
              >
                {item.content}
              </Text>
            </View>
          )}
          ListFooterComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#2196F3" />
              </View>
            ) : null
          }
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("chat.placeholder")}
            placeholderTextColor="#B0BEC5"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
            onSubmitEditing={send}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={send}
            disabled={loading}
          >
            <Text style={styles.sendButtonText}>{t("chat.send")}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA", // Açıq boz fon
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: "85%",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#2196F3", // Açıq göy
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: "#FFFFFF",
  },
  assistantText: {
    color: "#37474F",
  },
  loadingContainer: {
    paddingVertical: 8,
    alignItems: "flex-start",
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E1E8ED",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E1E8ED",
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#37474F",
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#2196F3", // Açıq göy
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 70,
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
