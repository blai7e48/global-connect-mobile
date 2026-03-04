import { Text, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { BackButton } from "@/components/ui/back-button";
import { startOAuthLogin } from "@/constants/oauth";
import { useEffect, useState } from "react";
import * as Auth from "@/lib/_core/auth";

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated, loading, refresh } = useAuth();
  const colors = useColors();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      // Create a demo user and save it
      const demoUser: Auth.User = {
        id: 1,
        openId: "demo-student-001",
        name: "Alex Johnson",
        email: "alex@example.com",
        loginMethod: "demo",
        lastSignedIn: new Date(),
      };
      
      await Auth.setUserInfo(demoUser);
      console.log("[Demo Login] User set, refreshing auth state...");
      
      // Refresh auth state to trigger navigation
      await refresh();
    } catch (err) {
      console.error("[Demo Login] Error:", err);
    } finally {
      setDemoLoading(false);
    }
  };

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
            disabled={demoLoading}
          />
          <Button
            title="Demo Login (Test Account)"
            onPress={handleDemoLogin}
            size="lg"
            variant="secondary"
            disabled={demoLoading}
          />
          <View className="items-center mt-2">
            <BackButton label="Back to Welcome" />
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
