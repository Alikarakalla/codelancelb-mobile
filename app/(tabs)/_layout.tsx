import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { SideDrawer } from '@/components/ui/SideDrawer';
import { DrawerProvider, useDrawer } from '@/hooks/use-drawer-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function DrawerWrappedTabs() {
  const { isOpen, closeDrawer } = useDrawer();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

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
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <MaterialIcons name="explore" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="wishlist"
          options={{
            title: 'Wishlist',
            tabBarIcon: ({ color }) => <MaterialIcons name="favorite-border" size={28} color={color} />,
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
