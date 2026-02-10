// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
type IconMapping = Record<string, MaterialIconName>;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house': 'home',
  'house.fill': 'home',
  'paperplane': 'explore',
  'paperplane.fill': 'explore',
  'bag': 'shopping-bag',
  'bag.fill': 'shopping-bag',
  'heart': 'favorite-border',
  'heart.fill': 'favorite',
  'person': 'person',
  'person.fill': 'person',
  'person.circle': 'account-circle',
  'apple.logo': 'apple',
  'bell.fill': 'notifications',
  'bell.slash': 'notifications-off',
  'gift.fill': 'card-giftcard',
  'lock.fill': 'lock',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'arrow-back',
  'square.and.arrow.up': 'share',
  'xmark': 'close',
} satisfies IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const resolvedName = (MAPPING[name] || 'help-outline') as MaterialIconName;
  return <MaterialIcons color={color} size={size} name={resolvedName} style={style} />;
}
