import { Tabs } from 'expo-router';
import React from 'react';
import { LiquidTabBar } from '@/components/ui/liquid-tab-bar';
import { SideDrawer } from '@/components/ui/SideDrawer';
import { DrawerProvider, useDrawer } from '@/hooks/use-drawer-context';

function DrawerWrappedTabs() {
  const { isOpen, closeDrawer } = useDrawer();

  return (
    <SideDrawer isOpen={isOpen} onClose={closeDrawer}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: () => null,
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
