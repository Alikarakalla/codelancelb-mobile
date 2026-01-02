import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  if (Platform.OS === 'ios') {
    return (
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
    );
  }

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#000' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color }) => <MaterialIcons name="shopping-bag" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color }) => <MaterialIcons name="favorite" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
