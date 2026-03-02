import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppContext } from "@/lib/app-context";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, role } = useAppContext();
  const colors = useColors();

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="items-center pt-6 pb-4 px-5">
          <Avatar name={profile?.fullName || user?.name} url={profile?.avatarUrl} size={88} />
          <Text className="text-2xl font-bold text-foreground mt-4">
            {profile?.fullName || user?.name || "User"}
          </Text>
          <View className="flex-row items-center mt-2 gap-2">
            <Badge
              label={role === "mentor" ? "Mentor" : "Student"}
              variant={role === "mentor" ? "success" : "default"}
            />
            {profile?.isVerified && <Badge label="Verified" variant="success" />}
          </View>
          {profile?.bio && (
            <Text className="text-sm text-muted text-center mt-3 px-4 leading-5">
              {profile.bio}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View className="flex-row px-5 gap-3 mt-2">
          <Button
            title="Edit Profile"
            onPress={() => router.push("/edit-profile" as any)}
            variant="secondary"
            size="md"
            className="flex-1"
            icon={<IconSymbol name="pencil" size={16} color={colors.foreground} />}
          />
          <Button
            title="Settings"
            onPress={() => router.push("/settings" as any)}
            variant="secondary"
            size="md"
            className="flex-1"
            icon={<IconSymbol name="gearshape.fill" size={16} color={colors.foreground} />}
          />
        </View>

        {/* Profile Details */}
        <View className="px-5 mt-6">
          {role === "student" && (
            <>
              <Text className="text-lg font-bold text-foreground mb-3">Student Info</Text>
              <Card className="gap-3">
                {profile?.fieldOfInterest && (
                  <DetailRow icon="briefcase.fill" label="Field of Interest" value={profile.fieldOfInterest} />
                )}
                {profile?.educationStatus && (
                  <DetailRow icon="building.2.fill" label="Education" value={profile.educationStatus} />
                )}
                {profile?.graduationYear && (
                  <DetailRow icon="calendar" label="Graduation Year" value={String(profile.graduationYear)} />
                )}
                {profile?.careerGoals && (
                  <DetailRow icon="star.fill" label="Career Goals" value={profile.careerGoals} />
                )}
              </Card>

              {profile?.skills && profile.skills.length > 0 && (
                <View className="mt-4">
                  <Text className="text-lg font-bold text-foreground mb-3">Skills</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} label={skill} />
                    ))}
                  </View>
                </View>
              )}
            </>
          )}

          {role === "mentor" && (
            <>
              <Text className="text-lg font-bold text-foreground mb-3">Professional Info</Text>
              <Card className="gap-3">
                {profile?.jobTitle && (
                  <DetailRow icon="briefcase.fill" label="Job Title" value={profile.jobTitle} />
                )}
                {profile?.company && (
                  <DetailRow icon="building.2.fill" label="Company" value={profile.company} />
                )}
                {profile?.industry && (
                  <DetailRow icon="tag.fill" label="Industry" value={profile.industry} />
                )}
                {profile?.location && (
                  <DetailRow icon="mappin.and.ellipse" label="Location" value={profile.location} />
                )}
                {profile?.yearsExperience && (
                  <DetailRow icon="clock.fill" label="Experience" value={`${profile.yearsExperience} years`} />
                )}
                {profile?.availabilityPreference && (
                  <DetailRow icon="calendar" label="Availability" value={profile.availabilityPreference} />
                )}
              </Card>

              {profile?.mentoringAreas && profile.mentoringAreas.length > 0 && (
                <View className="mt-4">
                  <Text className="text-lg font-bold text-foreground mb-3">Mentoring Areas</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {profile.mentoringAreas.map((area) => (
                      <Badge key={area} label={area} />
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
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
