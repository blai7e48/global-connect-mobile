import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "error" | "muted";

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: "bg-primary/15", text: "text-primary" },
  success: { bg: "bg-success/15", text: "text-success" },
  warning: { bg: "bg-warning/15", text: "text-warning" },
  error: { bg: "bg-error/15", text: "text-error" },
  muted: { bg: "bg-muted/15", text: "text-muted" },
};

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  className?: string;
};

export function Badge({ label, variant = "default", className }: BadgeProps) {
  const styles = variantStyles[variant];
  return (
    <View className={cn("px-2.5 py-1 rounded-full self-start", styles.bg, className)}>
      <Text className={cn("text-xs font-medium", styles.text)}>{label}</Text>
    </View>
  );
}
