import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { WishlistProvider } from '@/hooks/use-wishlist-context';
import { CartProvider } from '@/hooks/use-cart-context';
import { WishlistAnimationProvider } from '@/components/wishlist/WishlistAnimationProvider';
import { CartAnimationProvider } from '@/components/cart/CartAnimationProvider';

/* ... */

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <WishlistProvider>
          <CartProvider>
            <WishlistAnimationProvider>
              <CartAnimationProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                  </Stack>
                </ThemeProvider>
              </CartAnimationProvider>
            </WishlistAnimationProvider>
          </CartProvider>
        </WishlistProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
