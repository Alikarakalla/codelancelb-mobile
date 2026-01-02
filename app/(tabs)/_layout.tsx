import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
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

      {/* Wishlist Tab */}
      <NativeTabs.Trigger name="wishlist">
        <Label>Wishlist</Label>
        <Icon sf="heart.fill" />
      </NativeTabs.Trigger>

      {/* Profile Tab */}
      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        <Icon sf="person.fill" />
      </NativeTabs.Trigger>

      {/* Search Tab */}
      <NativeTabs.Trigger name="search" role="search">
        <Label>Search</Label>
        <Icon sf="magnifyingglass" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
