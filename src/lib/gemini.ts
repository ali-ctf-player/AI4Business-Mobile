/**
 * Google Gemini API client (axios ilə – React Native-də fetch əvəzinə daha stabil).
 * .env faylında EXPO_PUBLIC_GEMINI_API_KEY təyin olunmalıdır.
 */
import axios, { type AxiosError } from "axios";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "";
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
] as const;
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

if (typeof __DEV__ !== "undefined" && __DEV__) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === "") {
    console.error(
      "[Gemini] EXPO_PUBLIC_GEMINI_API_KEY boşdur. .env faylında EXPO_PUBLIC_GEMINI_API_KEY təyin edin və npx expo start -c ilə yenidən başladın."
    );
  }
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface ChatResponse {
  content: string;
  error?: string;
}

/**
 * Google Gemini-dan chat completion sorğusu göndərir.
 */
export async function chatWithGemini(
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<ChatResponse> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === "") {
    const errorMsg = "Gemini API key təyin olunmayıb. .env faylında EXPO_PUBLIC_GEMINI_API_KEY əlavə edin.";
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.error("[Gemini]", errorMsg);
    }
    return {
      content: "",
      error: errorMsg,
    };
  }

  try {
    // Son user mesajını götür
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    if (!lastUserMessage) {
      return { content: "", error: "Mesaj tapılmadı." };
    }

    // Gemini API formatı
    const requestBody: any = {
      contents: [
        {
          parts: [{ text: lastUserMessage.content }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500,
      },
    };

    // Sistem təlimatı varsa əlavə et
    if (systemPrompt) {
      requestBody.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    // Modelləri sıra ilə yoxla; axios React Native-də fetch-dən daha stabil ola bilər
    let lastError = "";
    for (const model of GEMINI_MODELS) {
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`;

      try {
        const response = await axios.post(url, requestBody, {
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        });
        const data = response.data;
        const content =
          data?.candidates?.[0]?.content?.parts?.[0]?.text || "Cavab alına bilmədi.";
        return { content };
      } catch (err) {
        const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
        const status = axiosErr.response?.status;
        const errorData = axiosErr.response?.data;
        const errMsg = errorData?.error?.message || (axiosErr.message ?? `API xətası: ${status ?? "unknown"}`);

        const isNotFound =
          errMsg.toLowerCase().includes("not found") ||
          errMsg.toLowerCase().includes("is not supported") ||
          status === 404;
        const isQuotaExceeded =
          errMsg.toLowerCase().includes("quota") ||
          errMsg.toLowerCase().includes("exceeded") ||
          status === 429;

        if (isQuotaExceeded) {
          return {
            content: "",
            error:
              "Gemini API limiti aşılıb. Zəhmət olmasa Google AI Studio-da billing və quota-nı yoxlayın: https://aistudio.google.com/",
          };
        }
        if (isNotFound && GEMINI_MODELS.indexOf(model) < GEMINI_MODELS.length - 1) {
          lastError = errMsg;
          continue;
        }
        if (axiosErr.code === "ECONNABORTED" || axiosErr.message?.includes("timeout")) {
          return { content: "", error: "Sorğu vaxtı bitdi. İnternet əlaqəsini yoxlayın." };
        }
        if (
          axiosErr.message?.includes("Network Error") ||
          axiosErr.code === "ERR_NETWORK"
        ) {
          return {
            content: "",
            error: "Şəbəkə xətası. İnternet əlaqəsini yoxlayın.",
          };
        }
        lastError = errMsg;
      }
    }

    return {
      content: "",
      error: lastError || "Heç bir model işləmədi. API açarını və Google AI Studio dəstəyini yoxlayın.",
    };
  } catch (error: unknown) {
    let errMsg = "Naməlum xəta baş verdi.";
    const e = error as { name?: string; message?: string };
    if (e?.name === "AbortError" || e?.message?.includes("timeout")) {
      errMsg = "Sorğu vaxtı bitdi. İnternet əlaqəsini yoxlayın.";
    } else if (
      e?.message?.includes("Network request failed") ||
      e?.message?.includes("Failed to fetch") ||
      e?.message?.includes("Network Error")
    ) {
      errMsg = "Şəbəkə xətası. İnternet əlaqəsini yoxlayın.";
    } else if (e?.message) {
      errMsg = e.message;
    }
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.error("[Gemini] Xəta:", errMsg, error);
    }
    return { content: "", error: errMsg };
  }
}
