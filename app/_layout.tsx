import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { WishlistProvider } from '@/hooks/use-wishlist-context';
import { CartProvider } from '@/hooks/use-cart-context';
import { WishlistAnimationProvider } from '@/components/wishlist/WishlistAnimationProvider';
import { CartAnimationProvider } from '@/components/cart/CartAnimationProvider';
import { DrawerProvider, useDrawer } from '@/hooks/use-drawer-context';
import { SideDrawer } from '@/components/ui/SideDrawer';
import { useColorScheme } from '@/hooks/use-color-scheme';
import 'react-native-reanimated';

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
                      <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="product" options={{ presentation: 'card', headerShown: false }} />
                        <Stack.Screen name="cart" options={{ presentation: 'card', headerShown: false }} />
                        <Stack.Screen name="checkout" options={{ presentation: 'card', headerShown: false }} />
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
