import { View, Text, TouchableOpacity } from "react-native";

interface MyGovButtonProps {
  onPress: () => void;
  label?: string;
}

/**
 * Placeholder for "Login with MyGov". In production, wire to OAuth/backend proxy.
 */
export function MyGovButton({ onPress, label = "Login with MyGov" }: MyGovButtonProps) {
  return (
    <View className="my-2">
      <View className="my-3 flex flex-row items-center">
        <View className="h-px flex-1 bg-slate-300 dark:bg-slate-600" />
        <Text className="mx-2 text-sm text-slate-500 dark:text-slate-400">or</Text>
        <View className="h-px flex-1 bg-slate-300 dark:bg-slate-600" />
      </View>
      <TouchableOpacity
        onPress={onPress}
        className="flex flex-row items-center justify-center rounded-xl border-2 border-amber-500 bg-amber-50 py-3 dark:border-amber-400 dark:bg-amber-900/30"
        activeOpacity={0.8}
      >
        <Text className="mr-2 text-lg">🇮🇳</Text>
        <Text className="text-base font-semibold text-amber-800 dark:text-amber-200">
          {label}
        </Text>
      </TouchableOpacity>
      <Text className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
        Government single sign-on (configure OAuth)
      </Text>
    </View>
  );
}
