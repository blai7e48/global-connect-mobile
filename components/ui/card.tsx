import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

type CardProps = ViewProps & {
  className?: string;
};

export function Card({ className, children, ...props }: CardProps) {
  return (
    <View
      className={cn(
        "bg-surface rounded-2xl border border-border p-4",
        className,
      )}
      {...props}
    >
      {children}
    </View>
  );
}
