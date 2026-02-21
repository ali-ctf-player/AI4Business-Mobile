import { View, Text, TextInput } from "react-native";

/**
 * Placeholder for 2FA (TOTP/SMS). Replace with real 2FA flow when backend supports it.
 */
export function TwoFactorPlaceholder() {
  return (
    <View className="rounded-xl border border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800">
      <Text className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        2FA Code (placeholder)
      </Text>
      <TextInput
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        placeholder="Enter 6-digit code"
        placeholderTextColor="#94a3b8"
        keyboardType="number-pad"
        maxLength={6}
        editable={false}
      />
      <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        İstehsalda 2FA üçün backend inteqrasiyası əlavə edin.
      </Text>
    </View>
  );
}
