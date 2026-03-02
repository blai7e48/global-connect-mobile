import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { TagInput } from "@/components/ui/tag-input";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function CreatePostScreen() {
  const router = useRouter();
  const colors = useColors();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const createPost = trpc.community.createPost.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Please fill in both title and content.");
      return;
    }
    try {
      await createPost.mutateAsync({
        title,
        content,
        tags: tags.length > 0 ? tags : undefined,
      });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      utils.community.posts.invalidate();
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to create post. Please try again.");
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <IconSymbol name="xmark" size={24} color={colors.muted} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">New Question</Text>
          <View style={{ width: 24 }} />
        </View>

        <View className="gap-4">
          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="What's your question?"
          />
          <TextInput
            label="Content"
            value={content}
            onChangeText={setContent}
            placeholder="Provide more details about your question..."
            multiline
            numberOfLines={6}
            className="min-h-[120px]"
          />
          <TagInput
            label="Tags (optional)"
            tags={tags}
            onTagsChange={setTags}
            placeholder="Add a tag..."
          />
        </View>

        <View className="mt-8">
          <Button
            title="Post Question"
            onPress={handleSubmit}
            loading={createPost.isPending}
            disabled={!title.trim() || !content.trim()}
            size="lg"
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
