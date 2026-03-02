import { View, Text, TouchableOpacity, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { cn } from "@/lib/utils";

type SegmentedControlProps = {
  segments: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  className?: string;
};

export function SegmentedControl({ segments, selectedIndex, onSelect, className }: SegmentedControlProps) {
  const handleSelect = (index: number) => {
    if (index !== selectedIndex) {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(index);
    }
  };

  return (
    <View className={cn("flex-row bg-surface rounded-xl p-1", className)}>
      {segments.map((segment, index) => (
        <TouchableOpacity
          key={segment}
          onPress={() => handleSelect(index)}
          activeOpacity={0.8}
          className={cn(
            "flex-1 py-2 rounded-lg items-center justify-center",
            selectedIndex === index && "bg-background shadow-sm",
          )}
        >
          <Text
            className={cn(
              "text-sm font-medium",
              selectedIndex === index ? "text-foreground" : "text-muted",
            )}
          >
            {segment}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
