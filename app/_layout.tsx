import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Image, Platform } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { WishlistProvider } from '@/hooks/use-wishlist-context';
import { CartProvider } from '@/hooks/use-cart-context';
import { AuthProvider } from '@/hooks/use-auth-context';
import { CurrencyProvider } from '@/hooks/use-currency-context';
import { DrawerProvider, useDrawer } from '@/hooks/use-drawer-context';
import { CartAnimationProvider } from '@/components/cart/CartAnimationProvider';
import { SideDrawer } from '@/components/ui/SideDrawer';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useState, useEffect } from 'react';
import { api } from '@/services/apiClient';
import 'react-native-reanimated';
import SplashScreen from '@/components/ui/SplashScreen';
import { FilterProvider } from '@/context/FilterContext';

ExpoSplashScreen.preventAutoHideAsync();

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
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    preloadAppData();
  }, []);

  const preloadAppData = async () => {
    try {
      // Preload essential data
      const [settings, slides] = await Promise.all([
        api.getStoreSettings(),
        api.getCarouselSlides(),
      ]);

      // Prefetch slide images if available
      if (slides && slides.length > 0) {
        // Use Image.prefetch from react-native (standard) or just rely on them being in cache from the previous fetch request?
        // Note: api.getCarouselSlides returns objects with URLs.
        // We can try to prefetch them.
        const imagesToPrefetch = slides.flatMap(s => [s.image_mobile, s.image_desktop]).filter((url): url is string => typeof url === 'string' && url.startsWith('http'));
        // We won't block exclusively on image prefetching to avoid too long wait, but we can start it.
        // If we want to wait, we can await Promise.all
        // Let's await to ensure "slider loaded" feel
        await Promise.all(imagesToPrefetch.map(url => Image.prefetch(url)));
      }

    } catch (error) {
      console.error('Error preloading data:', error);
    } finally {
      setIsAppReady(true);
      // Hide native splash immediately so our custom one shows
      await ExpoSplashScreen.hideAsync();
    }
  };

  if (showSplash) {
    return <SplashScreen isReady={isAppReady} onFinish={() => setShowSplash(false)} />;
  }

  if (!isAppReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <CurrencyProvider>
          <WishlistProvider>
            <CartProvider>
              <CartAnimationProvider>
                <FilterProvider>
                  <DrawerProvider>
                    <BottomSheetModalProvider>
                      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                        <DrawerWrappedRoot>
                          <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                            <Stack.Screen name="product" options={{ presentation: 'card', headerShown: false }} />
                            <Stack.Screen name="cart" options={{ presentation: 'card', headerShown: false }} />
                            <Stack.Screen name="checkout" options={{ presentation: 'card', headerShown: false }} />
                            <Stack.Screen
                              name="modal"
                              options={{
                                presentation: 'formSheet',
                                headerShown: false,
                                ...Platform.select({
                                  ios: {
                                    sheetAllowedDetents: [0.5, 1.0],
                                    sheetGrabberVisible: true,
                                    sheetCornerRadius: 38,
                                    headerTransparent: true,
                                    contentStyle: { backgroundColor: 'transparent' },
                                    nativeHeaderOptions: {
                                      sheetBackground: {
                                        material: 'glass'
                                      }
                                    }
                                  }
                                })
                              }}
                            />
                          </Stack>
                        </DrawerWrappedRoot>
                      </ThemeProvider>
                    </BottomSheetModalProvider>
                  </DrawerProvider>
                </FilterProvider>
              </CartAnimationProvider>
            </CartProvider>
          </WishlistProvider>
        </CurrencyProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
