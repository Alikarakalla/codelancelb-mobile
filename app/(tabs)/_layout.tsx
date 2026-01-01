import { Tabs } from 'expo-router';
import React from 'react';

import { LiquidTabBar } from '@/components/ui/liquid-tab-bar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <LiquidTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          // Pass icon string as a custom option if we wanted, or just rely on the component mapping.
          // But to satisfy the current component check if I didn't change it:
          tabBarIcon: () => null, // Just to ensure it's defined if I kept old logic.
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => null,
        }}
      />
    </Tabs>
  );
}
