import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/apiClient';
import { Category } from '@/types/schema';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type DiscountLevel = 'category' | 'sub_category' | 'sub_sub_category';

interface CategoryDiscountEntry {
  id: number;
  name: string;
  amount: number;
  type: 'fixed' | 'percent' | null | undefined;
  level: DiscountLevel;
}

function hasActiveCategoryDiscount(category: Category, nowMs: number): boolean {
  const amount = Number(category.discount_amount ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return false;

  const startMs = category.discount_start_date ? new Date(category.discount_start_date).getTime() : null;
  const endMs = category.discount_end_date ? new Date(category.discount_end_date).getTime() : null;

  if (startMs && nowMs < startMs) return false;
  if (endMs && nowMs > endMs) return false;
  return true;
}

function collectCategoryDiscounts(categories: Category[]): CategoryDiscountEntry[] {
  const nowMs = Date.now();
  const entries = new Map<number, CategoryDiscountEntry>();

  const walk = (category: Category, level: DiscountLevel) => {
    if (hasActiveCategoryDiscount(category, nowMs)) {
      entries.set(category.id, {
        id: category.id,
        name: category.name_en || category.name || 'Category',
        amount: Number(category.discount_amount ?? 0),
        type: category.discount_type,
        level,
      });
    }

    const subCategories = category.sub_categories ?? category.subCategories ?? [];
    subCategories.forEach((sub) => walk(sub, level === 'category' ? 'sub_category' : 'sub_sub_category'));

    const subSubCategories = category.sub_sub_categories ?? category.subSubCategories ?? [];
    subSubCategories.forEach((subSub) => walk(subSub, 'sub_sub_category'));
  };

  categories.forEach((category) => walk(category, 'category'));
  return Array.from(entries.values());
}

function formatDiscountMessage(entries: CategoryDiscountEntry[]): string | null {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort((a, b) => b.amount - a.amount);
  const top = sorted[0];
  const amountLabel = Number.isInteger(top.amount)
    ? String(top.amount)
    : top.amount.toFixed(2).replace(/\.00$/, '');
  const discountLabel = top.type === 'percent' ? `${amountLabel}%` : amountLabel;
  return `${discountLabel} Discount on ${top.name}`;
}

function HomeDiscountAccessory({
  isDark,
  message,
  onPress,
}: {
  isDark: boolean;
  message: string;
  onPress: () => void;
}) {
  const placement = NativeTabs.BottomAccessory.usePlacement();
  const isInline = placement === 'inline';
  const marqueeTranslateX = useMemo(() => new Animated.Value(0), []);
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const marqueeGap = 40;
  const shouldMarquee = textWidth > containerWidth && containerWidth > 0;

  useEffect(() => {
    if (!shouldMarquee) {
      marqueeTranslateX.stopAnimation();
      marqueeTranslateX.setValue(0);
      return;
    }

    const distance = textWidth + marqueeGap;
    const duration = Math.max(6000, Math.round(distance * 32));
    const loop = Animated.loop(
      Animated.timing(marqueeTranslateX, {
        toValue: -distance,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    marqueeTranslateX.setValue(0);
    loop.start();
    return () => {
      loop.stop();
      marqueeTranslateX.stopAnimation();
    };
  }, [marqueeGap, marqueeTranslateX, shouldMarquee, textWidth]);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.accessoryWrap,
        isInline ? styles.accessoryWrapInline : styles.accessoryWrapRegular,
      ]}
    >
      <View
        style={styles.accessoryTickerViewport}
        onLayout={(event) => setContainerWidth(Math.round(event.nativeEvent.layout.width))}
      >
        {shouldMarquee ? (
          <Animated.View style={[styles.accessoryTickerTrack, { transform: [{ translateX: marqueeTranslateX }] }]}>
            <Text
              onLayout={(event) => setTextWidth(Math.round(event.nativeEvent.layout.width))}
              style={[
                styles.accessoryText,
                isInline ? styles.accessoryTextInline : styles.accessoryTextRegular,
                isDark ? styles.accessoryTextDark : styles.accessoryTextLight,
              ]}
            >
              {message}
            </Text>
            <View style={{ width: marqueeGap }} />
            <Text
              style={[
                styles.accessoryText,
                isInline ? styles.accessoryTextInline : styles.accessoryTextRegular,
                isDark ? styles.accessoryTextDark : styles.accessoryTextLight,
              ]}
            >
              {message}
            </Text>
          </Animated.View>
        ) : (
          <Text
            numberOfLines={1}
            onLayout={(event) => setTextWidth(Math.round(event.nativeEvent.layout.width))}
            style={[
              styles.accessoryText,
              styles.accessoryTextCentered,
              isInline ? styles.accessoryTextInline : styles.accessoryTextRegular,
              isDark ? styles.accessoryTextDark : styles.accessoryTextLight,
            ]}
          >
            {message}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const pathname = usePathname();
  const iosMajorVersion = Platform.OS === 'ios'
    ? Number(String(Platform.Version).split('.')[0] || 0)
    : 0;
  const supportsIos26TabAccessory = Platform.OS === 'ios' && iosMajorVersion >= 26;
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supportsIos26TabAccessory) return;

    let isMounted = true;

    const loadCategoryDiscounts = async () => {
      try {
        const categories = await api.getCategories();
        const discounts = collectCategoryDiscounts(categories);
        if (!isMounted) return;
        setDiscountMessage(formatDiscountMessage(discounts));
      } catch (error) {
        console.warn('Failed to load category discounts for tab accessory:', error);
        if (isMounted) setDiscountMessage(null);
      }
    };

    loadCategoryDiscounts();
    return () => {
      isMounted = false;
    };
  }, [supportsIos26TabAccessory]);

  const isHomeTab = useMemo(
    () =>
      pathname === '/' ||
      pathname === '/index' ||
      pathname === '/(tabs)' ||
      pathname.startsWith('/(tabs)/index'),
    [pathname]
  );

  if (Platform.OS === 'ios') {
    return (
      <NativeTabs
        backBehavior="history"
        minimizeBehavior="onScrollDown"
      >
        {supportsIos26TabAccessory && isHomeTab && !!discountMessage && (
          <NativeTabs.BottomAccessory>
            <HomeDiscountAccessory
              isDark={isDark}
              message={discountMessage}
              onPress={() => router.push('/shop')}
            />
          </NativeTabs.BottomAccessory>
        )}

        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="house.fill" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="shop">
          <NativeTabs.Trigger.Label>Shop</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="bag.fill" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="wishlist">
          <NativeTabs.Trigger.Label>Wishlist</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="heart.fill" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="person.fill" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="search" role="search">
          <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="magnifyingglass" />
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
  accessoryWrap: {
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessoryWrapRegular: {
    marginBottom: 6,
    paddingHorizontal: 12,
    minHeight: 45,
    justifyContent: 'center',
  },
  accessoryWrapInline: {
    marginBottom: 0,
    paddingHorizontal: 10,
    minHeight: 45,
    justifyContent: 'center',
  },
  accessoryText: {
    fontWeight: '700',
    textAlignVertical: 'center',
  },
  accessoryTextCentered: {
    textAlign: 'center',
    width: '100%',
  },
  accessoryTextRegular: {
    fontSize: 15,
  },
  accessoryTextInline: {
    fontSize: 12,
  },
  accessoryTextLight: {
    color: '#0F172A',
  },
  accessoryTextDark: {
    color: '#F8FAFC',
  },
  accessoryTickerViewport: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  accessoryTickerTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
