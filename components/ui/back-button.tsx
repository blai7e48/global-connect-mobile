import { TouchableOpacity, Text, View, Platform } from "react-native";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

type BackButtonProps = {
  label?: string;
  onPress?: () => void;
};

/**
 * iOS-style back button with chevron and optional label.
 * Place at the top-left of any sub-screen for consistent navigation.
 */
export function BackButton({ label = "Back", onPress }: BackButtonProps) {
  const router = useRouter();
  const colors = useColors();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.6}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}
    >
      <IconSymbol name="chevron.left" size={22} color={colors.primary} />
      <Text
        style={{
          color: colors.primary,
          fontSize: 17,
          fontWeight: "400",
          marginLeft: 2,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
