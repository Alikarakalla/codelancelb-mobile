import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { WishlistProvider } from '@/hooks/use-wishlist-context';
import { CartProvider } from '@/hooks/use-cart-context';
import { AuthProvider } from '@/hooks/use-auth-context';
import { CurrencyProvider } from '@/hooks/use-currency-context';

import { CartAnimationProvider } from '@/components/cart/CartAnimationProvider';
import { DrawerProvider, useDrawer } from '@/hooks/use-drawer-context';
import { SideDrawer } from '@/components/ui/SideDrawer';
import { useColorScheme } from '@/hooks/use-color-scheme';
import SplashScreen from '@/components/ui/SplashScreen';
import { useState, useEffect } from 'react';
import { api } from '@/services/apiClient';
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
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    preloadAppData();
  }, []);

  const preloadAppData = async () => {
    try {
      // Preload essential data
      const promises = [
        api.getStoreSettings(), // Load store settings
        // Add other essential API calls here
      ];

      await Promise.all(promises);

      // Minimum splash duration for smooth UX
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Error preloading data:', error);
    } finally {
      setIsAppReady(true);
    }
  };

  if (!isAppReady) {
    return <SplashScreen onFinish={() => setIsAppReady(true)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AuthProvider>
          <CurrencyProvider>
            <WishlistProvider>
              <CartProvider>

                <CartAnimationProvider>
                  <DrawerProvider>
                    <DrawerWrappedRoot>
                      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                        <Stack screenOptions={{ headerShown: false }}>
                          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                          <Stack.Screen name="product" options={{ presentation: 'card', headerShown: false }} />
                          <Stack.Screen name="cart" options={{ presentation: 'card', headerShown: false }} />
                          <Stack.Screen name="checkout" options={{ presentation: 'card', headerShown: false }} />
                          <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
                        </Stack>
                      </ThemeProvider>
                    </DrawerWrappedRoot>
                  </DrawerProvider>
                </CartAnimationProvider>

              </CartProvider>
            </WishlistProvider>
          </CurrencyProvider>
        </AuthProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
