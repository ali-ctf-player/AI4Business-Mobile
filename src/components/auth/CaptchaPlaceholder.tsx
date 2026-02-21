import { View, Text, TouchableOpacity } from "react-native";

/**
 * Placeholder for Captcha (reCAPTCHA / hCaptcha). Replace with real widget when backend requires it.
 */
export function CaptchaPlaceholder() {
  return (
    <View className="rounded-xl border border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800">
      <Text className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        Captcha (placeholder)
      </Text>
      <TouchableOpacity
        className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-400 bg-slate-100 py-6 dark:border-slate-500 dark:bg-slate-700"
        disabled
      >
        <Text className="text-slate-500 dark:text-slate-400">[ Captcha widget ]</Text>
      </TouchableOpacity>
      <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Add reCAPTCHA or hCaptcha for production.
      </Text>
    </View>
  );
}
