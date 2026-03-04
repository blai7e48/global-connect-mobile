import { Text, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { BackButton } from "@/components/ui/back-button";
import { startOAuthLogin } from "@/constants/oauth";
import { useEffect } from "react";

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const colors = useColors();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/");
    }
  }, [loading, isAuthenticated]);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-6 justify-center items-center">
      <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-8">
        <IconSymbol name="person.2.fill" size={32} color="#fff" />
      </View>

      <Text className="text-2xl font-bold text-foreground text-center">
        Sign in to Global Connect
      </Text>
      <Text className="text-base text-muted text-center mt-2 mb-8">
        Use your account to access mentoring, sessions, and the community.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <View className="w-full gap-3">
          <Button
            title="Sign In"
            onPress={() => startOAuthLogin()}
            size="lg"
          />
          <View className="items-center mt-2">
            <BackButton label="Back to Welcome" />
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
