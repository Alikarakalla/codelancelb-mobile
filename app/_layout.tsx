import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Image, Platform } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { WishlistProvider } from '@/hooks/use-wishlist-context';
import { CartProvider } from '@/hooks/use-cart-context';
import { AuthProvider } from '@/hooks/use-auth-context';
import { CurrencyProvider } from '@/hooks/use-currency-context';
import { CartAnimationProvider } from '@/components/cart/CartAnimationProvider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useState, useEffect } from 'react';
import { api } from '@/services/apiClient';
import 'react-native-reanimated';
import SplashScreen from '@/components/ui/SplashScreen';
import { FilterProvider } from '@/context/FilterContext';

ExpoSplashScreen.preventAutoHideAsync();

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
        const imagesToPrefetch = slides.flatMap(s => [s.image_mobile, s.image_desktop]).filter((url): url is string => typeof url === 'string' && url.startsWith('http'));
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
      <StatusBar style="auto" />
      <AuthProvider>
        <CurrencyProvider>
          <WishlistProvider>
            <CartProvider>
              <CartAnimationProvider>
                <FilterProvider>
                  <BottomSheetModalProvider>
                    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
                                sheetAllowedDetents: [1.0],
                                sheetGrabberVisible: true,
                                sheetCornerRadius: 24,
                              }
                            })
                          }}
                        />
                      </Stack>
                    </ThemeProvider>
                  </BottomSheetModalProvider>
                </FilterProvider>
              </CartAnimationProvider>
            </CartProvider>
          </WishlistProvider>
        </CurrencyProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
