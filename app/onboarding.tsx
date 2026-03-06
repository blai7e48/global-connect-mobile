import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Platform, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { TagInput } from "@/components/ui/tag-input";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BackButton } from "@/components/ui/back-button";
import { useAuth } from "@/hooks/use-auth";
import { useAppContext } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

type AppRole = "student" | "mentor";

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshProfile } = useAppContext();
  const colors = useColors();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState<AppRole | null>(null);
  const [fullName, setFullName] = useState(user?.name || "");
  const [bio, setBio] = useState("");

  // Student fields
  const [fieldOfInterest, setFieldOfInterest] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [careerGoals, setCareerGoals] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [educationStatus, setEducationStatus] = useState("");

  // Mentor fields
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [mentoringAreas, setMentoringAreas] = useState<string[]>([]);
  const [availabilityPreference, setAvailabilityPreference] = useState("");

  const upsertProfile = trpc.profile.upsert.useMutation();

  const handleSkipDemo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refreshProfile();
    router.replace("/");
  };

  const handleComplete = async () => {
    if (!role) return;
    try {
      const payload = {
        appRole: role,
        fullName: fullName || undefined,
        bio: bio || undefined,
        onboardingCompleted: true,
      } as any;

      if (role === "student") {
        payload.fieldOfInterest = fieldOfInterest || undefined;
        payload.skills = skills.length > 0 ? skills : undefined;
        payload.careerGoals = careerGoals || undefined;
        payload.graduationYear = graduationYear ? parseInt(graduationYear) : undefined;
        payload.educationStatus = educationStatus || undefined;
      } else {
        payload.jobTitle = jobTitle || undefined;
        payload.company = company || undefined;
        payload.industry = industry || undefined;
        payload.location = location || undefined;
        payload.yearsExperience = yearsExperience ? parseInt(yearsExperience) : undefined;
        payload.mentoringAreas = mentoringAreas.length > 0 ? mentoringAreas : undefined;
        payload.availabilityPreference = availabilityPreference || undefined;
        payload.openToStudents = true;
      }

      await upsertProfile.mutateAsync(payload);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      refreshProfile();
      router.replace("/");
    } catch (err: any) {
      console.error("Onboarding error:", err);
      Alert.alert("Error", err?.message || "Failed to save profile. Please try again.");
    }
  };

  // Step 0: Role selection
  if (step === 0) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-6 justify-center">
        <Text className="text-3xl font-bold text-foreground text-center">
          Welcome to Global Connect
        </Text>
        <Text className="text-base text-muted text-center mt-2 mb-8">
          Tell us about yourself to get started
        </Text>

        <View className="gap-3">
          <RoleCard
            icon="person.fill"
            title="I'm a Student"
            description="Looking for mentors to guide my career"
            selected={role === "student"}
            onPress={() => {
              setRole("student");
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
          <RoleCard
            icon="briefcase.fill"
            title="I'm a Mentor"
            description="Ready to share my industry experience"
            selected={role === "mentor"}
            onPress={() => {
              setRole("mentor");
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
        </View>

        <View className="mt-8">
          <Button
            title="Continue"
            onPress={() => role && setStep(1)}
            disabled={!role}
            size="lg"
          />
        </View>
      </ScreenContainer>
    );
  }

  // Step 1: Profile details
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View className="flex-row justify-between items-center px-6 py-3 border-b border-border">
        <BackButton onPress={() => setStep(0)} />
        <TouchableOpacity onPress={handleSkipDemo}>
          <Text className="text-sm font-semibold text-primary">Skip</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>

        <Text className="text-3xl font-bold text-foreground">
          {role === "student" ? "Student Profile" : "Mentor Profile"}
        </Text>
        <Text className="text-base text-muted mt-1 mb-6">
          Fill in your details to complete setup
        </Text>

        <View className="gap-4">
          <TextInput label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Your full name" />
          <TextInput label="Bio" value={bio} onChangeText={setBio} placeholder="Tell us about yourself..." multiline numberOfLines={3} />

          {role === "student" && (
            <>
              <TextInput label="Field of Interest" value={fieldOfInterest} onChangeText={setFieldOfInterest} placeholder="e.g., Software Engineering" />
              <TagInput label="Skills" tags={skills} onTagsChange={setSkills} placeholder="Add a skill..." />
              <TextInput label="Career Goals" value={careerGoals} onChangeText={setCareerGoals} placeholder="What are your career goals?" multiline numberOfLines={3} />
              <TextInput label="Graduation Year" value={graduationYear} onChangeText={setGraduationYear} placeholder="e.g., 2026" keyboardType="number-pad" />
              <TextInput label="Education Status" value={educationStatus} onChangeText={setEducationStatus} placeholder="e.g., Junior, Senior, Graduate" />
            </>
          )}

          {role === "mentor" && (
            <>
              <TextInput label="Job Title" value={jobTitle} onChangeText={setJobTitle} placeholder="e.g., Senior Software Engineer" />
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
            title={upsertProfile.isPending ? "Saving..." : "Complete Setup"}
            onPress={handleComplete}
            disabled={!fullName.trim() || upsertProfile.isPending}
            size="lg"
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function RoleCard({ icon, title, description, selected, onPress }: {
  icon: any; title: string; description: string; selected: boolean; onPress: () => void;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`flex-row items-center p-4 rounded-2xl border-2 ${
        selected ? "border-primary bg-primary/5" : "border-border bg-surface"
      }`}
    >
      <View className={`w-12 h-12 rounded-xl items-center justify-center ${selected ? "bg-primary" : "bg-muted/20"}`}>
        <IconSymbol name={icon} size={24} color={selected ? "#fff" : colors.muted} />
      </View>
      <View className="flex-1 ml-3">
        <Text className={`text-lg font-semibold ${selected ? "text-primary" : "text-foreground"}`}>{title}</Text>
        <Text className="text-sm text-muted">{description}</Text>
      </View>
      {selected && <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />}
    </TouchableOpacity>
  );
}
