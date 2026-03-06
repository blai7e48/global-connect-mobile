import { FlatList, Text, View, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useCallback, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";

export default function ConversationScreen() {
  const router = useRouter();
  const colors = useColors();
  const { id, otherUserId } = useLocalSearchParams();
  const conversationId = parseInt(id as string);
  const otherUserIdNum = parseInt(otherUserId as string);

  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const { data: messages = [], refetch: refetchMessages } = trpc.messaging.getMessages.useQuery({
    conversationId,
    limit: 100,
  });

  const { data: otherUserProfile } = trpc.profile.getById.useQuery({
    userId: otherUserIdNum,
  });

  const sendMessageMutation = trpc.messaging.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    setSending(true);
    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        content: messageText,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: any) => {
    const isOwn = item.senderId === 1; // Demo user ID
    return (
      <View
        className={`flex-row ${isOwn ? "justify-end" : "justify-start"} px-4 py-2`}
      >
        <View
          className={`max-w-xs px-3 py-2 rounded-2xl ${
            isOwn
              ? "bg-primary"
              : "bg-surface border border-border"
          }`}
        >
          <Text
            className={`text-sm ${
              isOwn ? "text-background" : "text-foreground"
            }`}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScreenContainer edges={["top", "left", "right"]} className="p-0 flex-1">
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 py-3 border-b border-border">
          <BackButton />
          {otherUserProfile && (
            <>
          <Avatar
            url={otherUserProfile.avatarUrl}
            name={otherUserProfile.fullName || "User"}
            size={40}
          />
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  {otherUserProfile.fullName || "User"}
                </Text>
                <Text className="text-xs text-muted">
                  {otherUserProfile.appRole === "mentor" ? "Mentor" : "Student"}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          inverted
          scrollEnabled={true}
          className="flex-1"
        />

        {/* Input */}
        <View className="flex-row items-center gap-2 px-4 py-3 border-t border-border">
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor={colors.muted}
            value={messageText}
            onChangeText={setMessageText}
            editable={!sending}
            className="flex-1 px-3 py-2 rounded-full border border-border text-foreground"
            style={{ color: colors.foreground }}
          />
          <Pressable
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sending}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
                padding: 8,
              },
            ]}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <IconSymbol
                name="paperplane.fill"
                size={20}
                color={messageText.trim() ? colors.primary : colors.muted}
              />
            )}
          </Pressable>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
