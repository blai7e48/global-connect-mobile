import { useState, useCallback } from "react";
import { Text, View, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppContext } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { formatDateTime, getStatusInfo } from "@/lib/format";

const SEGMENTS = ["Upcoming", "Pending", "Past"];

export default function SessionsScreen() {
  const router = useRouter();
  const { role } = useAppContext();
  const colors = useColors();
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const sessionsQuery = trpc.sessions.list.useQuery();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await sessionsQuery.refetch();
    setRefreshing(false);
  }, []);

  const allSessions = (sessionsQuery.data || []) as any[];

  const filteredSessions = allSessions.filter((s) => {
    if (segmentIndex === 0) return s.status === "accepted";
    if (segmentIndex === 1) return s.status === "pending";
    return s.status === "declined" || s.status === "cancelled";
  });

  const renderSession = useCallback(({ item }: { item: any }) => {
    const other = role === "student" ? item.mentor : item.student;
    const statusInfo = getStatusInfo(item.status);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/session/${item.id}` as any)}
        className="px-5 mb-3"
      >
        <Card>
          <View className="flex-row items-start">
            <Avatar name={other?.fullName} url={other?.avatarUrl} size={48} />
            <View className="flex-1 ml-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-foreground flex-1 mr-2" numberOfLines={1}>
                  {item.title || "Session"}
                </Text>
                <Badge label={statusInfo.label} variant={statusInfo.variant} />
              </View>
              <Text className="text-sm text-muted mt-1" numberOfLines={1}>
                with {other?.fullName || "Unknown"}
              </Text>
              {item.scheduledAt && (
                <Text className="text-sm text-muted mt-1">
                  {formatDateTime(item.scheduledAt)}
                </Text>
              )}
              {item.description && (
                <Text className="text-sm text-muted mt-1" numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }, [role, router]);

  return (
    <ScreenContainer>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-3xl font-bold text-foreground">Sessions</Text>
      </View>

      <View className="px-5 mt-2 mb-3">
        <SegmentedControl
          segments={SEGMENTS}
          selectedIndex={segmentIndex}
          onSelect={setSegmentIndex}
        />
      </View>

      <FlatList
        data={filteredSessions}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderSession}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          !sessionsQuery.isLoading ? (
            <EmptyState
              icon="calendar"
              title="No sessions"
              message={
                segmentIndex === 0
                  ? "Your upcoming sessions will appear here"
                  : segmentIndex === 1
                  ? "No pending session requests"
                  : "No past sessions"
              }
            />
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
      />
    </ScreenContainer>
  );
}
