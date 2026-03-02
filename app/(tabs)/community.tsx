import { useState, useCallback } from "react";
import { Text, View, FlatList, TouchableOpacity, RefreshControl, TextInput, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/ui/empty-state";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { timeAgo } from "@/lib/format";

export default function CommunityScreen() {
  const router = useRouter();
  const colors = useColors();
  const [sortIndex, setSortIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const sort = sortIndex === 0 ? "new" : "popular";
  const postsQuery = trpc.community.posts.useQuery({ sort, search: search || undefined });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await postsQuery.refetch();
    setRefreshing(false);
  }, []);

  const renderPost = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/post/${item.id}` as any)}
      className="px-5 mb-3"
    >
      <Card>
        <View className="flex-row items-start">
          <Avatar name={item.author?.fullName} url={item.author?.avatarUrl} size={36} />
          <View className="flex-1 ml-3">
            <Text className="text-base font-semibold text-foreground" numberOfLines={2}>
              {item.title}
            </Text>
            <Text className="text-sm text-muted mt-1" numberOfLines={2}>
              {item.content}
            </Text>
            <View className="flex-row items-center mt-2.5 gap-3 flex-wrap">
              <View className="flex-row items-center">
                <IconSymbol name="hand.thumbsup.fill" size={14} color={colors.muted} />
                <Text className="text-xs text-muted ml-1">{item.upvotes}</Text>
              </View>
              <View className="flex-row items-center">
                <IconSymbol name="bubble.left.and.bubble.right.fill" size={14} color={colors.muted} />
                <Text className="text-xs text-muted ml-1">{item.answerCount} answers</Text>
              </View>
              <Text className="text-xs text-muted">{timeAgo(item.createdAt)}</Text>
              {item.tags?.slice(0, 2).map((tag: string) => (
                <Badge key={tag} label={tag} variant="muted" />
              ))}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  ), [colors, router]);

  return (
    <ScreenContainer>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-3xl font-bold text-foreground">Community</Text>
      </View>

      {/* Search */}
      <View className="px-5 mt-2">
        <View className="flex-row items-center bg-surface border border-border rounded-xl px-3">
          <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search questions..."
            placeholderTextColor={colors.muted}
            className="flex-1 py-3 px-2 text-base text-foreground"
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Sort */}
      <View className="px-5 mt-3 mb-3">
        <SegmentedControl
          segments={["New", "Popular"]}
          selectedIndex={sortIndex}
          onSelect={setSortIndex}
        />
      </View>

      <FlatList
        data={(postsQuery.data as any[]) || []}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPost}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          !postsQuery.isLoading ? (
            <EmptyState
              icon="bubble.left.and.bubble.right.fill"
              title="No posts yet"
              message="Be the first to ask a question!"
            />
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
      />

      {/* FAB */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/create-post" as any);
        }}
        className="absolute bottom-24 right-5 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
        style={{ elevation: 6 }}
      >
        <IconSymbol name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </ScreenContainer>
  );
}
