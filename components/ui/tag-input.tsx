import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { cn } from "@/lib/utils";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "./icon-symbol";

type TagInputProps = {
  label?: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
};

export function TagInput({ label, tags, onTagsChange, placeholder = "Add tag...", className }: TagInputProps) {
  const [text, setText] = useState("");
  const colors = useColors();

  const addTag = () => {
    const trimmed = text.trim();
    if (trimmed && !tags.includes(trimmed)) {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTagsChange([...tags, trimmed]);
      setText("");
    }
  };

  const removeTag = (tag: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTagsChange(tags.filter((t) => t !== tag));
  };

  return (
    <View className={cn("gap-1.5", className)}>
      {label && <Text className="text-sm font-medium text-foreground">{label}</Text>}
      <View className="flex-row flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <View key={tag} className="flex-row items-center bg-primary/15 rounded-full px-3 py-1.5">
            <Text className="text-sm text-primary mr-1">{tag}</Text>
            <TouchableOpacity onPress={() => removeTag(tag)} activeOpacity={0.6}>
              <IconSymbol name="xmark" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        onSubmitEditing={addTag}
        returnKeyType="done"
        className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
      />
    </View>
  );
}
