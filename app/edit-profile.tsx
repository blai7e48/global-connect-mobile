import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { TagInput } from "@/components/ui/tag-input";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BackButton } from "@/components/ui/back-button";
import { useAppContext } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, role, refreshProfile } = useAppContext();
  const colors = useColors();

  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [bio, setBio] = useState(profile?.bio || "");

  // Student fields
  const [fieldOfInterest, setFieldOfInterest] = useState(profile?.fieldOfInterest || "");
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [careerGoals, setCareerGoals] = useState(profile?.careerGoals || "");
  const [graduationYear, setGraduationYear] = useState(profile?.graduationYear?.toString() || "");
  const [educationStatus, setEducationStatus] = useState(profile?.educationStatus || "");

  // Mentor fields
  const [jobTitle, setJobTitle] = useState(profile?.jobTitle || "");
  const [company, setCompany] = useState(profile?.company || "");
  const [industry, setIndustry] = useState(profile?.industry || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [yearsExperience, setYearsExperience] = useState(profile?.yearsExperience?.toString() || "");
  const [mentoringAreas, setMentoringAreas] = useState<string[]>(profile?.mentoringAreas || []);
  const [availabilityPreference, setAvailabilityPreference] = useState(profile?.availabilityPreference || "");

  const upsertProfile = trpc.profile.upsert.useMutation();

  const handleSave = async () => {
    if (!role) return;
    try {
      await upsertProfile.mutateAsync({
        appRole: role,
        fullName: fullName || undefined,
        bio: bio || undefined,
        ...(role === "student" ? {
          fieldOfInterest: fieldOfInterest || undefined,
          skills: skills.length > 0 ? skills : undefined,
          careerGoals: careerGoals || undefined,
          graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
          educationStatus: educationStatus || undefined,
        } : {
          jobTitle: jobTitle || undefined,
          company: company || undefined,
          industry: industry || undefined,
          location: location || undefined,
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
          mentoringAreas: mentoringAreas.length > 0 ? mentoringAreas : undefined,
          availabilityPreference: availabilityPreference || undefined,
        }),
        onboardingCompleted: true,
      });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      refreshProfile();
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to save profile.");
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <BackButton />
          <Text className="text-xl font-bold text-foreground">Edit Profile</Text>
          <View style={{ width: 60 }} />
        </View>

        <View className="gap-4">
          <TextInput label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Your full name" />
          <TextInput label="Bio" value={bio} onChangeText={setBio} placeholder="About you..." multiline numberOfLines={3} />

          {role === "student" && (
            <>
              <TextInput label="Field of Interest" value={fieldOfInterest} onChangeText={setFieldOfInterest} placeholder="e.g., Software Engineering" />
              <TagInput label="Skills" tags={skills} onTagsChange={setSkills} placeholder="Add a skill..." />
              <TextInput label="Career Goals" value={careerGoals} onChangeText={setCareerGoals} placeholder="Your career goals" multiline numberOfLines={3} />
              <TextInput label="Graduation Year" value={graduationYear} onChangeText={setGraduationYear} placeholder="e.g., 2026" keyboardType="number-pad" />
              <TextInput label="Education Status" value={educationStatus} onChangeText={setEducationStatus} placeholder="e.g., Junior, Senior" />
            </>
          )}

          {role === "mentor" && (
            <>
              <TextInput label="Job Title" value={jobTitle} onChangeText={setJobTitle} placeholder="e.g., Senior Engineer" />
              <TextInput label="Company" value={company} onChangeText={setCompany} placeholder="e.g., Google" />
              <TextInput label="Industry" value={industry} onChangeText={setIndustry} placeholder="e.g., Technology" />
              <TextInput label="Location" value={location} onChangeText={setLocation} placeholder="e.g., San Francisco, CA" />
              <TextInput label="Years of Experience" value={yearsExperience} onChangeText={setYearsExperience} placeholder="e.g., 10" keyboardType="number-pad" />
              <TagInput label="Mentoring Areas" tags={mentoringAreas} onTagsChange={setMentoringAreas} placeholder="Add an area..." />
              <TextInput label="Availability" value={availabilityPreference} onChangeText={setAvailabilityPreference} placeholder="e.g., Weekday evenings" />
            </>
          )}
        </View>

        <View className="mt-8">
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={upsertProfile.isPending}
            disabled={!fullName.trim()}
            size="lg"
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
