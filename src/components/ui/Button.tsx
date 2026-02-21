import { Text, TouchableOpacity, ActivityIndicator } from "react-native";

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  onPress,
  title,
  variant = "primary",
  loading,
  disabled,
  className = "",
}: ButtonProps) {
  const base = "rounded-xl py-3 px-4 items-center justify-center";
  const variants = {
    primary: "bg-primary active:bg-primary-dark",
    secondary: "bg-slate-600 active:bg-slate-700 dark:bg-slate-500 dark:active:bg-slate-600",
    outline: "border-2 border-primary bg-transparent",
  };
  const textVariants = {
    primary: "text-white font-semibold",
    secondary: "text-white font-semibold",
    outline: "text-primary font-semibold dark:text-primary",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${disabled ? "opacity-50" : ""} ${className}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#3b82f6" : "#fff"} />
      ) : (
        <Text className={textVariants[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
