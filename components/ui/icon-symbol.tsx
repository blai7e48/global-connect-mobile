// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Material Icons mappings.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "person.2.fill": "people",
  "calendar": "event",
  "bubble.left.and.bubble.right.fill": "forum",
  "person.circle.fill": "account-circle",
  "magnifyingglass": "search",
  "gearshape.fill": "settings",
  "arrow.right.square": "logout",
  "plus": "add",
  "xmark": "close",
  "chevron.left": "chevron-left",
  "star.fill": "star",
  "hand.thumbsup.fill": "thumb-up",
  "checkmark.circle.fill": "check-circle",
  "clock.fill": "schedule",
  "mappin.and.ellipse": "location-on",
  "briefcase.fill": "work",
  "building.2.fill": "business",
  "person.fill": "person",
  "bell.fill": "notifications",
  "pencil": "edit",
  "arrow.up.circle.fill": "arrow-upward",
  "link": "link",
  "ellipsis": "more-horiz",
  "tag.fill": "label",
  "bolt.fill": "flash-on",
  "heart.fill": "favorite",
  "exclamationmark.triangle.fill": "warning",
  "info.circle.fill": "info",
  "shield.fill": "verified-user",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
