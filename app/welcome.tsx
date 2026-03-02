import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function WelcomeScreen() {
  const router = useRouter();
  const colors = useColors();

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-6 justify-between">
      <View className="flex-1 justify-center">
        <Animated.View entering={FadeInDown.duration(400).delay(100)} className="items-center">
          <View
            style={{ width: 80, height: 80, borderRadius: 24 }}
            className="bg-primary items-center justify-center mb-5"
          >
            <IconSymbol name="person.2.fill" size={40} color="#fff" />
          </View>
          <Text className="text-4xl font-bold text-foreground text-center">
            Global Connect
          </Text>
          <Text className="text-base text-muted text-center mt-3 leading-6 px-4">
            Connect with industry mentors, book sessions, and grow your career with a global community of professionals.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)} className="mt-10 gap-5 self-center w-full" style={{ maxWidth: 340 }}>
          <FeatureRow icon="person.2.fill" title="Find Mentors" description="Browse verified industry professionals" />
          <FeatureRow icon="calendar" title="Book Sessions" description="Schedule one-on-one mentoring sessions" />
          <FeatureRow icon="bubble.left.and.bubble.right.fill" title="Community Q&A" description="Ask questions and share knowledge" />
          <FeatureRow icon="bolt.fill" title="AI Matching" description="Get matched with the right mentor for you" />
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.duration(400).delay(500)} className="pb-8 gap-3">
        <Button
          title="Get Started"
          onPress={() => router.push("/login" as any)}
          size="lg"
        />
        <Text className="text-xs text-muted text-center mt-2">
          By continuing, you agree to our Terms of Service
        </Text>
      </Animated.View>
    </ScreenContainer>
  );
}

function FeatureRow({ icon, title, description }: { icon: any; title: string; description: string }) {
  const colors = useColors();
  return (
    <View className="flex-row items-center">
      <View style={{ width: 40, height: 40, borderRadius: 12 }} className="bg-primary/10 items-center justify-center">
        <IconSymbol name={icon} size={20} color={colors.primary} />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        <Text className="text-sm text-muted">{description}</Text>
      </View>
    </View>
  );
}
