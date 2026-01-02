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

import { SideDrawer } from '@/components/ui/SideDrawer';
import { DrawerProvider, useDrawer } from '@/hooks/use-drawer-context';

function DrawerWrappedRoot({ children }: { children: React.ReactNode }) {
  const { isOpen, closeDrawer } = useDrawer();
  return (
    <SideDrawer isOpen={isOpen} onClose={closeDrawer}>
      {children}
    </SideDrawer>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <WishlistProvider>
          <CartProvider>
            <WishlistAnimationProvider>
              <CartAnimationProvider>
                <DrawerProvider>
                  <DrawerWrappedRoot>
                    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                      <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                        <Stack.Screen name="product/[id]" options={{ headerShown: false, animation: 'fade' }} />
                        <Stack.Screen name="product/reviews" options={{ headerShown: false }} />
                      </Stack>
                    </ThemeProvider>
                  </DrawerWrappedRoot>
                </DrawerProvider>
              </CartAnimationProvider>
            </WishlistAnimationProvider>
          </CartProvider>
        </WishlistProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
