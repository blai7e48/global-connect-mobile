import { View, Text, TextInput as RNTextInput, type TextInputProps as RNTextInputProps } from "react-native";
import { cn } from "@/lib/utils";
import { useColors } from "@/hooks/use-colors";

type TextInputProps = RNTextInputProps & {
  label?: string;
  error?: string;
  containerClassName?: string;
};

export function TextInput({ label, error, containerClassName, className, ...props }: TextInputProps) {
  const colors = useColors();

  return (
    <View className={cn("gap-1.5", containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-foreground">{label}</Text>
      )}
      <RNTextInput
        placeholderTextColor={colors.muted}
        className={cn(
          "bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground",
          error && "border-error",
          className,
        )}
        {...props}
      />
      {error && (
        <Text className="text-xs text-error">{error}</Text>
      )}
    </View>
  );
}
