import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { WishlistProvider } from '@/hooks/use-wishlist-context';
import { CartProvider } from '@/hooks/use-cart-context';
import { WishlistAnimationProvider } from '@/components/wishlist/WishlistAnimationProvider';
import { CartAnimationProvider } from '@/components/cart/CartAnimationProvider';
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
                      <NativeTabs backBehavior="history">
                        <NativeTabs.Trigger name="index">
                          <Label>Home</Label>
                          <Icon sf="house.fill" />
                        </NativeTabs.Trigger>

                        <NativeTabs.Trigger name="shop">
                          <Label>Shop</Label>
                          <Icon sf="bag.fill" />
                        </NativeTabs.Trigger>

                        <NativeTabs.Trigger name="wishlist">
                          <Label>Wishlist</Label>
                          <Icon sf="heart.fill" />
                        </NativeTabs.Trigger>

                        <NativeTabs.Trigger name="profile">
                          <Label>Profile</Label>
                          <Icon sf="person.fill" />
                        </NativeTabs.Trigger>

                        <NativeTabs.Trigger name="search" role="search">
                          <Label>Search</Label>
                          <Icon sf="magnifyingglass" />
                        </NativeTabs.Trigger>
                      </NativeTabs>
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
