import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert, Platform, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BackButton } from "@/components/ui/back-button";
import { useAppContext } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { formatDateTime, getStatusInfo } from "@/lib/format";

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { role } = useAppContext();
  const colors = useColors();
  const [meetingLink, setMeetingLink] = useState("");

  const sessionId = parseInt(id || "0");
  const sessionQuery = trpc.sessions.getById.useQuery({ id: sessionId });
  const updateSession = trpc.sessions.update.useMutation();
  const utils = trpc.useUtils();

  const session = sessionQuery.data as any;
  const other = role === "student" ? session?.mentor : session?.student;
  const statusInfo = session ? getStatusInfo(session.status) : null;

  const handleAction = async (status: "accepted" | "declined" | "cancelled") => {
    try {
      const data: any = { id: sessionId, status };
      if (status === "accepted" && meetingLink.trim()) {
        data.meetingLink = meetingLink;
      }
      await updateSession.mutateAsync(data);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          status === "accepted"
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Warning,
        );
      }
      utils.sessions.list.invalidate();
      utils.sessions.getById.invalidate({ id: sessionId });
      Alert.alert("Success", `Session ${status}!`);
    } catch (err) {
      Alert.alert("Error", "Failed to update session.");
    }
  };

  if (!session && !sessionQuery.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-muted">Session not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="ghost" className="mt-4" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Back */}
        <View className="px-5 pt-2">
          <BackButton />
        </View>

        {/* Header */}
        <View className="px-5 pt-4 pb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground flex-1 mr-3" numberOfLines={2}>
              {session?.title || "Session"}
            </Text>
            {statusInfo && <Badge label={statusInfo.label} variant={statusInfo.variant} />}
          </View>
          {session?.scheduledAt && (
            <Text className="text-base text-muted mt-2">
              {formatDateTime(session.scheduledAt)}
            </Text>
          )}
        </View>

        {/* Participant */}
        <View className="px-5 mb-4">
          <Card>
            <View className="flex-row items-center">
              <Avatar name={other?.fullName} url={other?.avatarUrl} size={48} />
              <View className="flex-1 ml-3">
                <Text className="text-base font-semibold text-foreground">{other?.fullName || "Unknown"}</Text>
                <Text className="text-sm text-muted">
                  {role === "student" ? "Mentor" : "Student"}
                  {other?.jobTitle ? ` · ${other.jobTitle}` : ""}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Description */}
        {session?.description && (
          <View className="px-5 mb-4">
            <Text className="text-lg font-bold text-foreground mb-2">Description</Text>
            <Card>
              <Text className="text-sm text-foreground leading-5">{session.description}</Text>
            </Card>
          </View>
        )}

        {/* Meeting Link */}
        {session?.meetingLink && (
          <View className="px-5 mb-4">
            <Text className="text-lg font-bold text-foreground mb-2">Meeting Link</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Linking.openURL(session.meetingLink)}
            >
              <Card className="flex-row items-center">
                <IconSymbol name="link" size={18} color={colors.primary} />
                <Text className="text-sm text-primary ml-2 flex-1" numberOfLines={1}>
                  {session.meetingLink}
                </Text>
              </Card>
            </TouchableOpacity>
          </View>
        )}

        {/* Notes */}
        {session?.notes && (
          <View className="px-5 mb-4">
            <Text className="text-lg font-bold text-foreground mb-2">Notes</Text>
            <Card>
              <Text className="text-sm text-foreground leading-5">{session.notes}</Text>
            </Card>
          </View>
        )}

        {/* Mentor: Add meeting link when accepting */}
        {role === "mentor" && session?.status === "pending" && (
          <View className="px-5 mb-4">
            <TextInput
              label="Meeting Link (optional)"
              value={meetingLink}
              onChangeText={setMeetingLink}
              placeholder="https://zoom.us/j/..."
            />
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {session?.status === "pending" && (
        <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-5 py-4 pb-8">
          {role === "mentor" ? (
            <View className="flex-row gap-3">
              <Button
                title="Decline"
                onPress={() => handleAction("declined")}
                variant="outline"
                className="flex-1"
                loading={updateSession.isPending}
              />
              <Button
                title="Accept"
                onPress={() => handleAction("accepted")}
                className="flex-1"
                loading={updateSession.isPending}
              />
            </View>
          ) : (
            <Button
              title="Cancel Request"
              onPress={() => handleAction("cancelled")}
              variant="destructive"
              loading={updateSession.isPending}
            />
          )}
        </View>
      )}
    </ScreenContainer>
  );
}
