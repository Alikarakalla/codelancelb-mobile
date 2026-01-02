import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { SideDrawer } from '@/components/ui/SideDrawer';
import { DrawerProvider, useDrawer } from '@/hooks/use-drawer-context';
import { useWishlist } from '@/hooks/use-wishlist-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function DrawerWrappedTabs() {
  const { isOpen, closeDrawer } = useDrawer();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { wishlist } = useWishlist();

  return (
    <SideDrawer isOpen={isOpen} onClose={closeDrawer}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.tabIconDefault,
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
            height: Platform.OS === 'ios' ? 88 : 60,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <MaterialIcons name="home" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            title: 'Shop',
            tabBarIcon: ({ color }) => <MaterialIcons name="shopping-bag" size={28} color={color} />,
          }}
        />

        <Tabs.Screen
          name="wishlist"
          options={{
            title: 'Wishlist',
            tabBarIcon: ({ color }) => <MaterialIcons name="favorite-border" size={28} color={color} />,
            tabBarBadge: wishlist.length > 0 ? wishlist.length : undefined,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <MaterialIcons name="person" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="login"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="signup"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="product/[id]"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="product/reviews"
          options={{
            href: null,
            headerShown: false,
          }}
        />
      </Tabs>
    </SideDrawer>
  );
}

export default function TabLayout() {
  return (
    <DrawerProvider>
      <DrawerWrappedTabs />
    </DrawerProvider>
  );
}
