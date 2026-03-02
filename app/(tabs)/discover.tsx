import { useState, useCallback } from "react";
import { Text, View, FlatList, TouchableOpacity, RefreshControl, TextInput, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppContext } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Education", "Design", "Marketing", "Engineering"];

export default function DiscoverScreen() {
  const router = useRouter();
  const { role } = useAppContext();
  const colors = useColors();
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string | undefined>();
  const [refreshing, setRefreshing] = useState(false);

  const mentorsQuery = trpc.mentors.list.useQuery(
    { search: search || undefined, industry: selectedIndustry },
    { enabled: role === "student" },
  );

  const studentsQuery = trpc.mentors.students.useQuery(undefined, {
    enabled: role === "mentor",
  });

  const data = role === "student" ? mentorsQuery.data : studentsQuery.data;
  const isLoading = role === "student" ? mentorsQuery.isLoading : studentsQuery.isLoading;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (role === "student") await mentorsQuery.refetch();
    else await studentsQuery.refetch();
    setRefreshing(false);
  }, [role]);

  const renderMentorCard = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/mentor/${item.userId}` as any)}
      className="px-5 mb-3"
    >
      <Card>
        <View className="flex-row">
          <Avatar name={item.fullName} url={item.avatarUrl} size={56} />
          <View className="flex-1 ml-3">
            <View className="flex-row items-center">
              <Text className="text-base font-semibold text-foreground flex-1" numberOfLines={1}>
                {item.fullName || "Unknown"}
              </Text>
              {item.isVerified && (
                <IconSymbol name="shield.fill" size={16} color={colors.primary} />
              )}
            </View>
            {item.jobTitle && (
              <Text className="text-sm text-muted mt-0.5" numberOfLines={1}>
                {item.jobTitle}{item.company ? ` at ${item.company}` : ""}
              </Text>
            )}
            <View className="flex-row items-center mt-2 gap-2 flex-wrap">
              {item.industry && <Badge label={item.industry} />}
              {item.location && (
                <View className="flex-row items-center">
                  <IconSymbol name="mappin.and.ellipse" size={12} color={colors.muted} />
                  <Text className="text-xs text-muted ml-1">{item.location}</Text>
                </View>
              )}
              {item.yearsExperience && (
                <Text className="text-xs text-muted">{item.yearsExperience}y exp</Text>
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  ), [colors, router]);

  const renderStudentCard = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity activeOpacity={0.7} className="px-5 mb-3">
      <Card>
        <View className="flex-row items-center">
          <Avatar name={item.fullName} url={item.avatarUrl} size={48} />
          <View className="flex-1 ml-3">
            <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
              {item.fullName || "Unknown"}
            </Text>
            {item.fieldOfInterest && (
              <Text className="text-sm text-muted" numberOfLines={1}>
                Interested in {item.fieldOfInterest}
              </Text>
            )}
          </View>
          <IconSymbol name="chevron.right" size={18} color={colors.muted} />
        </View>
      </Card>
    </TouchableOpacity>
  ), [colors]);

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-3xl font-bold text-foreground">
          {role === "student" ? "Discover Mentors" : "Students"}
        </Text>
      </View>

      {/* Search Bar */}
      {role === "student" && (
        <View className="px-5 mt-2">
          <View className="flex-row items-center bg-surface border border-border rounded-xl px-3">
            <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name, title, or company..."
              placeholderTextColor={colors.muted}
              className="flex-1 py-3 px-2 text-base text-foreground"
              returnKeyType="search"
            />
          </View>
        </View>
      )}

      {/* Industry Filters */}
      {role === "student" && (
        <FlatList
          horizontal
          data={INDUSTRIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectedIndustry(selectedIndustry === item ? undefined : item)}
              className={`px-3.5 py-2 rounded-full border ${
                selectedIndustry === item
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedIndustry === item ? "text-background" : "text-foreground"
                }`}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Results */}
      <FlatList
        data={(data as any[]) || []}
        keyExtractor={(item) => String(item.id)}
        renderItem={role === "student" ? renderMentorCard : renderStudentCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="person.2.fill"
              title={role === "student" ? "No mentors found" : "No students yet"}
              message={role === "student" ? "Try adjusting your search or filters" : "Students will appear here when they sign up"}
            />
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
      />
    </ScreenContainer>
  );
}
