import { View, Text } from "react-native";
import { Image } from "expo-image";
import { cn } from "@/lib/utils";

type AvatarProps = {
  url?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
};

export function Avatar({ url, name, size = 44, className }: AvatarProps) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className={cn("bg-surface", className)}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={cn("bg-primary items-center justify-center", className)}
    >
      <Text
        style={{ fontSize: size * 0.38 }}
        className="font-semibold text-background"
      >
        {initials}
      </Text>
    </View>
  );
}
