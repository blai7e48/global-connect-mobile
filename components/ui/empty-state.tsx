import { View, Text } from "react-native";
import { IconSymbol } from "./icon-symbol";
import { useColors } from "@/hooks/use-colors";

type EmptyStateProps = {
  icon?: any;
  title: string;
  message?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon = "info.circle.fill", title, message, action }: EmptyStateProps) {
  const colors = useColors();
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <IconSymbol name={icon} size={48} color={colors.muted} />
      <Text className="text-lg font-semibold text-foreground mt-4 text-center">{title}</Text>
      {message && (
        <Text className="text-sm text-muted mt-2 text-center leading-5">{message}</Text>
      )}
      {action && <View className="mt-6">{action}</View>}
    </View>
  );
}
