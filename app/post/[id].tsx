import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { timeAgo } from "@/lib/format";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const [answerText, setAnswerText] = useState("");

  const postId = parseInt(id || "0");
  const postQuery = trpc.community.getPost.useQuery({ id: postId });
  const createAnswer = trpc.community.createAnswer.useMutation();
  const upvotePost = trpc.community.upvotePost.useMutation();
  const upvoteAnswer = trpc.community.upvoteAnswer.useMutation();
  const utils = trpc.useUtils();

  const post = postQuery.data as any;

  const handleUpvotePost = async () => {
    try {
      await upvotePost.mutateAsync({ id: postId });
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      utils.community.getPost.invalidate({ id: postId });
    } catch (err) {
      // silent
    }
  };

  const handleUpvoteAnswer = async (answerId: number) => {
    try {
      await upvoteAnswer.mutateAsync({ id: answerId });
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      utils.community.getPost.invalidate({ id: postId });
    } catch (err) {
      // silent
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) return;
    try {
      await createAnswer.mutateAsync({ postId, content: answerText });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAnswerText("");
      utils.community.getPost.invalidate({ id: postId });
    } catch (err) {
      Alert.alert("Error", "Failed to post answer.");
    }
  };

  if (!post && !postQuery.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-muted">Post not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="ghost" className="mt-4" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Back */}
          <View className="px-5 pt-3">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="flex-row items-center">
              <IconSymbol name="chevron.left" size={22} color={colors.primary} />
              <Text className="text-base text-primary ml-1">Back</Text>
            </TouchableOpacity>
          </View>

          {/* Post */}
          <View className="px-5 pt-4">
            <Text className="text-2xl font-bold text-foreground">{post?.title}</Text>

            <View className="flex-row items-center mt-3 gap-2">
              <Avatar name={post?.author?.fullName} url={post?.author?.avatarUrl} size={28} />
              <Text className="text-sm text-muted">{post?.author?.fullName || "Unknown"}</Text>
              <Text className="text-xs text-muted">· {timeAgo(post?.createdAt)}</Text>
            </View>

            {post?.tags && post.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mt-3">
                {post.tags.map((tag: string) => (
                  <Badge key={tag} label={tag} />
                ))}
              </View>
            )}

            <Text className="text-base text-foreground mt-4 leading-6">{post?.content}</Text>

            {/* Upvote */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleUpvotePost}
              className="flex-row items-center mt-4 py-2"
            >
              <IconSymbol name="hand.thumbsup.fill" size={18} color={colors.primary} />
              <Text className="text-sm text-primary font-medium ml-1">{post?.upvotes || 0} upvotes</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="h-px bg-border mx-5 my-4" />

          {/* Answers */}
          <View className="px-5">
            <Text className="text-lg font-bold text-foreground mb-3">
              {post?.answers?.length || 0} Answers
            </Text>

            {post?.answers?.map((answer: any) => (
              <Card key={answer.id} className="mb-3">
                <View className="flex-row items-center mb-2">
                  <Avatar name={answer.author?.fullName} url={answer.author?.avatarUrl} size={28} />
                  <Text className="text-sm font-medium text-foreground ml-2">
                    {answer.author?.fullName || "Unknown"}
                  </Text>
                  <Text className="text-xs text-muted ml-2">{timeAgo(answer.createdAt)}</Text>
                  {answer.isAccepted && (
                    <Badge label="Accepted" variant="success" className="ml-auto" />
                  )}
                </View>
                <Text className="text-sm text-foreground leading-5">{answer.content}</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleUpvoteAnswer(answer.id)}
                  className="flex-row items-center mt-2"
                >
                  <IconSymbol name="hand.thumbsup.fill" size={14} color={colors.muted} />
                  <Text className="text-xs text-muted ml-1">{answer.upvotes}</Text>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        </ScrollView>

        {/* Answer Input */}
        <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-5 py-3 pb-8">
          <View className="flex-row items-end gap-2">
            <View className="flex-1">
              <TextInput
                value={answerText}
                onChangeText={setAnswerText}
                placeholder="Write an answer..."
                multiline
              />
            </View>
            <Button
              title="Post"
              onPress={handleSubmitAnswer}
              loading={createAnswer.isPending}
              disabled={!answerText.trim()}
              size="sm"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
