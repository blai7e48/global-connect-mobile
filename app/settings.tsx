import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert, Switch, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BackButton } from "@/components/ui/back-button";
import { useAuth } from "@/hooks/use-auth";
import { useAppContext } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile, role, refreshProfile } = useAppContext();
  const colors = useColors();

  const [openToStudents, setOpenToStudents] = useState(profile?.openToStudents ?? true);
  const upsertProfile = trpc.profile.upsert.useMutation();

  const handleToggleAvailability = async (value: boolean) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOpenToStudents(value);
    if (role) {
      try {
        await upsertProfile.mutateAsync({
          appRole: role,
          openToStudents: value,
          onboardingCompleted: true,
        });
        refreshProfile();
      } catch (err) {
        setOpenToStudents(!value);
      }
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/welcome" as any);
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="px-5 pt-2">
          <BackButton />
        </View>

        <View className="px-5 pt-4 pb-4">
          <Text className="text-3xl font-bold text-foreground">Settings</Text>
        </View>

        {/* Account Section */}
        <View className="px-5 mb-6">
          <Text className="text-sm font-medium text-muted uppercase mb-2 px-1">Account</Text>
          <Card className="gap-0 p-0 overflow-hidden">
            <SettingRow label="Name" value={user?.name || "—"} />
            <View className="h-px bg-border mx-4" />
            <SettingRow label="Email" value={user?.email || "—"} />
            <View className="h-px bg-border mx-4" />
            <SettingRow label="Role" value={role === "mentor" ? "Mentor" : "Student"} />
          </Card>
        </View>

        {/* Mentor Settings */}
        {role === "mentor" && (
          <View className="px-5 mb-6">
            <Text className="text-sm font-medium text-muted uppercase mb-2 px-1">Mentor Settings</Text>
            <Card className="gap-0 p-0 overflow-hidden">
              <View className="flex-row items-center justify-between px-4 py-3.5">
                <Text className="text-base text-foreground">Open to Students</Text>
                <Switch
                  value={openToStudents}
                  onValueChange={handleToggleAvailability}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            </Card>
          </View>
        )}

        {/* About */}
        <View className="px-5 mb-6">
          <Text className="text-sm font-medium text-muted uppercase mb-2 px-1">About</Text>
          <Card className="gap-0 p-0 overflow-hidden">
            <SettingRow label="Version" value="1.0.0" />
          </Card>
        </View>

        {/* Sign Out */}
        <View className="px-5">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogout}
            className="bg-error/10 rounded-2xl py-4 items-center"
          >
            <Text className="text-base font-semibold text-error">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3.5">
      <Text className="text-base text-foreground">{label}</Text>
      <Text className="text-base text-muted">{value}</Text>
    </View>
  );
}
