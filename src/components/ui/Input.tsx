import { View, Text, TextInput, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <View className="mb-3">
      <Text className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </Text>
      <TextInput
        className={`rounded-xl border bg-white px-4 py-3 text-slate-900 dark:bg-slate-800 dark:text-white ${
          error ? "border-red-500" : "border-slate-300 dark:border-slate-600"
        } ${className}`}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      {error ? (
        <Text className="mt-1 text-xs text-red-500">{error}</Text>
      ) : null}
    </View>
  );
}
