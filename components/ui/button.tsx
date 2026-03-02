import { Text, ActivityIndicator, Platform, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: { container: "bg-primary", text: "text-background font-semibold" },
  secondary: { container: "bg-surface border border-border", text: "text-foreground font-semibold" },
  outline: { container: "border border-primary bg-transparent", text: "text-primary font-semibold" },
  ghost: { container: "bg-transparent", text: "text-primary font-medium" },
  destructive: { container: "bg-error", text: "text-background font-semibold" },
};

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  className,
  textClassName,
  size = "md",
  icon,
}: ButtonProps) {
  const styles = variantStyles[variant];
  const sizeStyles = {
    sm: "px-3 py-2 rounded-lg",
    md: "px-5 py-3 rounded-xl",
    lg: "px-6 py-4 rounded-2xl",
  };
  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const handlePress = () => {
    if (disabled || loading) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled || loading}
      className={cn(
        "flex-row items-center justify-center",
        sizeStyles[size],
        styles.container,
        (disabled || loading) && "opacity-50",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "primary" || variant === "destructive" ? "#fff" : undefined} />
      ) : (
        <>
          {icon}
          <Text className={cn(textSizes[size], styles.text, icon ? "ml-2" : "", textClassName)}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
