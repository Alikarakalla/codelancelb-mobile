import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { FavouriteIcon, ShoppingBag01Icon } from '@/components/ui/icons';
import { useWishlist } from '@/hooks/use-wishlist-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { wishlist } = useWishlist();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: 88,
          },
          default: {
            backgroundColor: theme.background,
            borderTopColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
            height: 60,
          },
        }),
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={100}
              tint={colorScheme === 'dark' ? 'dark' : 'light'}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: colorScheme === 'dark'
                  ? 'rgba(28, 28, 30, 0.72)'
                  : 'rgba(255, 255, 255, 0.72)',
              }}
            />
          ) : null,
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
          tabBarIcon: ({ color }) => <HugeiconsIcon icon={ShoppingBag01Icon} size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color }) => <HugeiconsIcon icon={FavouriteIcon} size={24} color={color} />,
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
        name="explore"
        options={{
          href: null,
          headerShown: false,
        }}
      />


    </Tabs>
  );
}
