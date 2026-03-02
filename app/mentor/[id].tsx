import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert, Platform, Modal, KeyboardAvoidingView } from "react-native";
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

export default function MentorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");

  const mentorId = parseInt(id || "0");
  const profileQuery = trpc.profile.getById.useQuery({ userId: mentorId });
  const matchQuery = trpc.mentors.matchScore.useQuery({ mentorUserId: mentorId });
  const createSession = trpc.sessions.create.useMutation();

  const mentor = profileQuery.data as any;
  const match = matchQuery.data as any;

  const handleRequestSession = async () => {
    if (!sessionTitle.trim()) {
      Alert.alert("Error", "Please enter a session title");
      return;
    }
    try {
      await createSession.mutateAsync({
        mentorId,
        title: sessionTitle,
        description: sessionDescription || undefined,
      });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setShowRequestModal(false);
      setSessionTitle("");
      setSessionDescription("");
      Alert.alert("Success", "Session request sent! The mentor will review it shortly.");
    } catch (err) {
      Alert.alert("Error", "Failed to send request. Please try again.");
    }
  };

  if (!mentor && !profileQuery.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-muted">Mentor not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="ghost" className="mt-4" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Back Button */}
        <View className="px-5 pt-3">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="flex-row items-center">
            <IconSymbol name="chevron.left" size={22} color={colors.primary} />
            <Text className="text-base text-primary ml-1">Back</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View className="items-center pt-4 pb-6 px-5">
          <Avatar name={mentor?.fullName} url={mentor?.avatarUrl} size={96} />
          <View className="flex-row items-center mt-4 gap-2">
            <Text className="text-2xl font-bold text-foreground">{mentor?.fullName || "Loading..."}</Text>
            {mentor?.isVerified && <IconSymbol name="shield.fill" size={20} color={colors.primary} />}
          </View>
          {mentor?.jobTitle && (
            <Text className="text-base text-muted mt-1">
              {mentor.jobTitle}{mentor.company ? ` at ${mentor.company}` : ""}
            </Text>
          )}
          {mentor?.bio && (
            <Text className="text-sm text-muted text-center mt-3 px-4 leading-5">{mentor.bio}</Text>
          )}
        </View>

        {/* AI Match Score */}
        {match && match.score > 0 && (
          <View className="px-5 mb-4">
            <Card className="bg-primary/5 border-primary/20">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
                  <Text className="text-lg font-bold text-background">{match.score}%</Text>
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-base font-semibold text-foreground">AI Match Score</Text>
                  {match.reasons?.map((reason: string, i: number) => (
                    <Text key={i} className="text-sm text-muted mt-0.5">• {reason}</Text>
                  ))}
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Details */}
        <View className="px-5 gap-4">
          <Card className="gap-3">
            {mentor?.industry && (
              <DetailRow icon="tag.fill" label="Industry" value={mentor.industry} />
            )}
            {mentor?.location && (
              <DetailRow icon="mappin.and.ellipse" label="Location" value={mentor.location} />
            )}
            {mentor?.yearsExperience && (
              <DetailRow icon="clock.fill" label="Experience" value={`${mentor.yearsExperience} years`} />
            )}
            {mentor?.availabilityPreference && (
              <DetailRow icon="calendar" label="Availability" value={mentor.availabilityPreference} />
            )}
          </Card>

          {mentor?.mentoringAreas && mentor.mentoringAreas.length > 0 && (
            <View>
              <Text className="text-lg font-bold text-foreground mb-2">Mentoring Areas</Text>
              <View className="flex-row flex-wrap gap-2">
                {mentor.mentoringAreas.map((area: string) => (
                  <Badge key={area} label={area} />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-5 py-4 pb-8">
        <Button
          title="Request Session"
          onPress={() => setShowRequestModal(true)}
          size="lg"
        />
      </View>

      {/* Request Session Modal */}
      <Modal visible={showRequestModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5">
            <View className="flex-row items-center justify-between pt-4 mb-6">
              <Text className="text-2xl font-bold text-foreground">Request Session</Text>
              <TouchableOpacity onPress={() => setShowRequestModal(false)} activeOpacity={0.7}>
                <IconSymbol name="xmark" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <TextInput
                label="Session Title"
                value={sessionTitle}
                onChangeText={setSessionTitle}
                placeholder="e.g., Career advice for software engineering"
              />
              <TextInput
                label="Description (optional)"
                value={sessionDescription}
                onChangeText={setSessionDescription}
                placeholder="What would you like to discuss?"
                multiline
                numberOfLines={4}
              />
            </View>

            <View className="mt-6">
              <Button
                title="Send Request"
                onPress={handleRequestSession}
                loading={createSession.isPending}
                disabled={!sessionTitle.trim()}
                size="lg"
              />
            </View>
          </ScreenContainer>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenContainer>
  );
}

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  const colors = useColors();
  return (
    <View className="flex-row items-start">
      <IconSymbol name={icon} size={18} color={colors.muted} style={{ marginTop: 2 }} />
      <View className="flex-1 ml-3">
        <Text className="text-xs text-muted">{label}</Text>
        <Text className="text-sm text-foreground mt-0.5">{value}</Text>
      </View>
    </View>
  );
}
