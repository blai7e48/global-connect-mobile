import { useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { useAppContext } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { formatDateTime, getStatusInfo } from "@/lib/format";
import { useState } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { profile, isProfileLoading, role, isOnboarded } = useAppContext();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  const sessionsQuery = trpc.sessions.list.useQuery(undefined, {
    enabled: isAuthenticated && isOnboarded,
  });

  const postsQuery = trpc.community.posts.useQuery({ sort: "new" }, {
    enabled: isAuthenticated && isOnboarded,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/welcome");
    } else if (!authLoading && isAuthenticated && !isProfileLoading && !isOnboarded) {
      router.replace("/onboarding");
    }
  }, [authLoading, isAuthenticated, isProfileLoading, isOnboarded]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([sessionsQuery.refetch(), postsQuery.refetch()]);
    setRefreshing(false);
  };

  if (authLoading || isProfileLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated || !isOnboarded) return null;

  const upcomingSessions = (sessionsQuery.data || [])
    .filter((s: any) => s.status === "accepted")
    .slice(0, 3);
  const pendingSessions = (sessionsQuery.data || [])
    .filter((s: any) => s.status === "pending")
    .slice(0, 3);
  const recentPosts = (postsQuery.data || []).slice(0, 3);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-sm text-muted">{greeting()}</Text>
          <Text className="text-3xl font-bold text-foreground mt-1">
            {profile?.fullName || user?.name || "Welcome"}
          </Text>
          <Badge
            label={role === "mentor" ? "Mentor" : "Student"}
            variant={role === "mentor" ? "success" : "default"}
            className="mt-2"
          />
        </View>

        {/* Quick Stats */}
        <View className="flex-row px-5 mt-4 gap-3">
          <Card className="flex-1 items-center py-5">
            <Text className="text-2xl font-bold text-primary">{pendingSessions.length}</Text>
            <Text className="text-xs text-muted mt-1">Pending</Text>
          </Card>
          <Card className="flex-1 items-center py-5">
            <Text className="text-2xl font-bold text-success">{upcomingSessions.length}</Text>
            <Text className="text-xs text-muted mt-1">Upcoming</Text>
          </Card>
          <Card className="flex-1 items-center py-5">
            <Text className="text-2xl font-bold text-foreground">{recentPosts.length}</Text>
            <Text className="text-xs text-muted mt-1">Posts</Text>
          </Card>
        </View>

        {/* CTA */}
        {role === "student" && (
          <View className="px-5 mt-5">
            <Button
              title="Find a Mentor"
              onPress={() => router.push("/(tabs)/discover")}
              size="lg"
              icon={<IconSymbol name="magnifyingglass" size={20} color={colors.background} />}
            />
          </View>
        )}

        {/* Upcoming Sessions */}
        <View className="px-5 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xl font-bold text-foreground">Upcoming Sessions</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/sessions")} activeOpacity={0.7}>
              <Text className="text-sm text-primary font-medium">See All</Text>
            </TouchableOpacity>
          </View>
          {upcomingSessions.length === 0 ? (
            <Card>
              <Text className="text-sm text-muted text-center py-4">No upcoming sessions</Text>
            </Card>
          ) : (
            upcomingSessions.map((session: any) => {
              const other = role === "student" ? session.mentor : session.student;
              const statusInfo = getStatusInfo(session.status);
              return (
                <TouchableOpacity
                  key={session.id}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/session/${session.id}`)}
                >
                  <Card className="mb-2">
                    <View className="flex-row items-center">
                      <Avatar name={other?.fullName} size={40} />
                      <View className="flex-1 ml-3">
                        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                          {session.title || "Session"}
                        </Text>
                        <Text className="text-sm text-muted" numberOfLines={1}>
                          {other?.fullName || "Unknown"} {session.scheduledAt ? `· ${formatDateTime(session.scheduledAt)}` : ""}
                        </Text>
                      </View>
                      <Badge label={statusInfo.label} variant={statusInfo.variant} />
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Recent Community Posts */}
        <View className="px-5 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xl font-bold text-foreground">Community</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/community")} activeOpacity={0.7}>
              <Text className="text-sm text-primary font-medium">See All</Text>
            </TouchableOpacity>
          </View>
          {recentPosts.length === 0 ? (
            <Card>
              <Text className="text-sm text-muted text-center py-4">No posts yet</Text>
            </Card>
          ) : (
            recentPosts.map((post: any) => (
              <TouchableOpacity
                key={post.id}
                activeOpacity={0.7}
                onPress={() => router.push(`/post/${post.id}`)}
              >
                <Card className="mb-2">
                  <Text className="text-base font-semibold text-foreground" numberOfLines={2}>
                    {post.title}
                  </Text>
                  <View className="flex-row items-center mt-2 gap-3">
                    <View className="flex-row items-center">
                      <IconSymbol name="hand.thumbsup.fill" size={14} color={colors.muted} />
                      <Text className="text-xs text-muted ml-1">{post.upvotes}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <IconSymbol name="bubble.left.and.bubble.right.fill" size={14} color={colors.muted} />
                      <Text className="text-xs text-muted ml-1">{post.answerCount}</Text>
                    </View>
                    {post.tags?.slice(0, 2).map((tag: string) => (
                      <Badge key={tag} label={tag} variant="muted" />
                    ))}
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
