import { Platform, StyleSheet, View, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const pathname = usePathname();

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

  const inactiveTint = isDark ? 'rgba(255,255,255,0.72)' : 'rgba(17,24,39,0.7)';
  const highlightedTint = isDark ? '#5eb1ff' : '#0A84FF';

  const renderTabIcon = (icon: keyof typeof MaterialIcons.glyphMap, color: string, focused: boolean) => (
    <View
      style={[
        styles.androidIconWrap,
        focused && (isDark ? styles.androidIconWrapActiveDark : styles.androidIconWrapActiveLight),
      ]}
    >
      <MaterialIcons name={icon} size={22} color={color} />
    </View>
  );

  const isSearchActive = pathname === '/search' || pathname.startsWith('/search/');

  return (
    <View style={{ flex: 1 }}>
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: highlightedTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarLabelStyle: styles.androidTabLabel,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: [
          styles.androidTabBar,
          isDark ? styles.androidTabBarDark : styles.androidTabBarLight,
        ],
        tabBarItemStyle: styles.androidTabItem,
          tabBarBackground: () => (
            <View style={[styles.androidTabBarBg, isDark ? styles.androidTabBarBgDark : styles.androidTabBarBgLight]}>
              <BlurView
                intensity={85}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
                experimentalBlurMethod="dimezisBlurView"
              />
              <View style={[styles.androidTabBarOverlay, isDark ? styles.androidTabBarOverlayDark : styles.androidTabBarOverlayLight]} />
            </View>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => renderTabIcon('home', color, focused),
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            title: 'Shop',
            tabBarIcon: ({ color, focused }) => renderTabIcon('shopping-bag', color, focused),
          }}
        />
        <Tabs.Screen
          name="wishlist"
          options={{
            title: 'Wishlist',
            tabBarIcon: ({ color, focused }) => renderTabIcon('favorite', color, focused),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => renderTabIcon('person', color, focused),
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

      <Pressable
        onPress={() => router.push('/(tabs)/search')}
        style={[
          styles.androidSearchFab,
          isDark ? styles.androidSearchFabDark : styles.androidSearchFabLight,
          isSearchActive && (isDark ? styles.androidSearchFabActiveDark : styles.androidSearchFabActiveLight),
        ]}
      >
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
          experimentalBlurMethod="dimezisBlurView"
        />
        <View style={[styles.androidSearchFabOverlay, isDark ? styles.androidSearchFabOverlayDark : styles.androidSearchFabOverlayLight]} />
        <MaterialIcons
          name="search"
          size={24}
          color={isSearchActive ? highlightedTint : inactiveTint}
          style={{ zIndex: 2 }}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  androidTabBar: {
    position: 'absolute',
    left: 14,
    right: 86,
    bottom: 14,
    height: 64,
    borderRadius: 32,
    borderTopWidth: 0,
    elevation: 0,
    overflow: 'hidden',
    paddingHorizontal: 6,
  },
  androidTabBarLight: {
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.14)',
    backgroundColor: 'transparent',
  },
  androidTabBarDark: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'transparent',
  },
  androidTabBarBg: {
    flex: 1,
  },
  androidTabBarBgLight: {
    backgroundColor: 'rgba(248,250,252,0.72)',
  },
  androidTabBarBgDark: {
    backgroundColor: 'rgba(15,23,42,0.65)',
  },
  androidTabBarOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  androidTabBarOverlayLight: {
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  androidTabBarOverlayDark: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  androidTabItem: {
    paddingTop: 4,
    paddingBottom: 3,
  },
  androidTabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  androidIconWrap: {
    minWidth: 36,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  androidIconWrapActiveLight: {
    backgroundColor: 'rgba(10,132,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(10,132,255,0.34)',
  },
  androidIconWrapActiveDark: {
    backgroundColor: 'rgba(94,177,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(94,177,255,0.45)',
  },
  androidSearchFab: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  androidSearchFabLight: {
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.18)',
    backgroundColor: 'rgba(248,250,252,0.72)',
  },
  androidSearchFabDark: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(15,23,42,0.62)',
  },
  androidSearchFabActiveLight: {
    borderColor: 'rgba(15,23,42,0.3)',
    backgroundColor: 'rgba(255,255,255,0.86)',
  },
  androidSearchFabActiveDark: {
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  androidSearchFabOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  androidSearchFabOverlayLight: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  androidSearchFabOverlayDark: {
    backgroundColor: 'rgba(0,0,0,0.16)',
  },
});
