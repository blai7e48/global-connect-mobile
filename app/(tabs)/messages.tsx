import { FlatList, Text, View, RefreshControl, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useCallback, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/format";
import * as Haptics from "expo-haptics";

export default function MessagesScreen() {
  const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  const { data: conversations = [], refetch, isLoading } = trpc.messaging.listConversations.useQuery();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleConversationPress = (conversationId: number, otherUserId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/conversation/[id]",
      params: { id: conversationId, otherUserId },
    });
  };

  const renderConversation = ({ item }: any) => {
    const otherUser = item.otherUser;
    const lastMsg = item.lastMessage;

    return (
      <Pressable
        onPress={() => handleConversationPress(item.id, item.otherUser?.userId)}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.7 : 1,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomColor: colors.border,
            borderBottomWidth: 0.5,
          },
        ]}
      >
        <View className="flex-row items-center gap-3">
          <Avatar
            url={otherUser?.avatarUrl}
            name={otherUser?.fullName || "User"}
            size={48}
          />
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">
              {otherUser?.fullName || "Unknown User"}
            </Text>
            <Text
              className="text-sm text-muted mt-1"
              numberOfLines={1}
            >
              {lastMsg?.content || "No messages yet"}
            </Text>
          </View>
          {lastMsg && (
            <Text className="text-xs text-muted">
              {timeAgo(new Date(lastMsg.createdAt))}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer className="p-0">
      <View className="flex-row items-center justify-between px-6 py-4">
        <Text className="text-2xl font-bold text-foreground">Messages</Text>
      </View>

      {conversations.length === 0 && !isLoading ? (
        <EmptyState
          icon="bubble.left.and.bubble.right.fill"
          title="No conversations yet"
          message="Start a conversation with a mentor or student"
        />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </ScreenContainer>
  );
}
