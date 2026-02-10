import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { GlobalHeader } from '@/components/ui/GlobalHeader';
import { HeroSlider } from '@/components/home/HeroSlider';
import { HeroCarouselSummary } from '@/components/home/HeroCarouselSummary';
import { PremiumCategoryGrid } from '@/components/home/PremiumCategoryGrid';
import { HomeQuickTabs } from '@/components/home/HomeQuickTabs';
import { HorizontalProductSlider } from '@/components/home/HorizontalProductSlider';
import { PromoBanner } from '@/components/home/PromoBanner';
import { BrandSlider } from '@/components/home/BrandSlider';
import { StorefrontBanner } from '@/components/home/StorefrontBanner';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { CategoryCompositeSection } from '@/components/home/CategoryCompositeSection';
import { Product, HomeSection } from '@/types/schema';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler
} from 'react-native-reanimated';
import { RevealingSection } from '@/components/home/RevealingSection';
import { api } from '@/services/apiClient';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<HomeSection[]>([]);

  // Tabbed Section State (Local to the screen for now, could be in the component)
  const [activeTabMap, setActiveTabMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.getHomeData();
        if (response && response.sections) {
          setSections(response.sections);
        }
      } catch (error) {
        console.error('Failed to load home config', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id, initialImage: product.main_image || '' }
    });
  };

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const renderSection = (section: HomeSection, index: number) => {
    // Animation type can be varied based on index or type
    const animType = index === 0 ? 'fade-up' : 'reveal';

    // Helper to wrap components in RevealingSection
    const Wrapper = ({ children, style }: { children: React.ReactNode, style?: any }) => (
      <RevealingSection key={section.id} scrollY={scrollY} index={index} animationType={animType} style={style}>
        {children}
      </RevealingSection>
    );

    switch (section.type) {
      case 'hero':
        return (
          <React.Fragment key={section.id}>
            <Wrapper>
              <HeroSlider slides={section.data} onIndexChange={setCurrentHeroIndex} />
            </Wrapper>
            {/* Summary is coupled to Hero, usually rendered right after. 
                            If API sends them together, great. If not, we might need to assume it goes here.
                            For now, assuming section.data is the slides array. 
                        */}
            <RevealingSection scrollY={scrollY} index={index + 0.5} animationType="reveal">
              <HeroCarouselSummary slides={section.data} activeIndex={currentHeroIndex} />
            </RevealingSection>
          </React.Fragment>
        );

      case 'categories':
        return (
          <Wrapper key={section.id} style={{ marginTop: 20 }}>
            <PremiumCategoryGrid scrollY={scrollY} categories={section.data} />
          </Wrapper>
        );

      case 'highlights':
        // Assuming data is array, we take the first one or map all?
        // Existing code took the first one `highlights[0]`.
        // Let's support mapping if multiple, or just one.
        const highlights = Array.isArray(section.data) ? section.data : [section.data];
        return (
          <React.Fragment key={section.id}>
            {highlights.map((h: any, i: number) => (
              <RevealingSection key={`${section.id}-${i}`} scrollY={scrollY} index={index} animationType="none" style={styles.promoSection}>
                {(progress) => <PromoBanner progress={progress} section={h} />}
              </RevealingSection>
            ))}
          </React.Fragment>
        );

      case 'featured_new':
        // This section expects an object { featured: Product[], new_arrivals: Product[] }
        // or generic tabs.
        // Adapting HomeQuickTabs logic:
        const tabs = ['JUST LANDED', 'FEATURED'];
        const currentTab = activeTabMap[section.id] || 'JUST LANDED';

        // section.data might look like { featured: [...], new_arrivals: [...] }
        // We map 'JUST LANDED' -> new_arrivals, 'FEATURED' -> featured
        const products = currentTab === 'JUST LANDED'
          ? (section.data.new_arrivals || [])
          : (section.data.featured || []);

        return (
          <Wrapper key={section.id}>
            <HomeQuickTabs
              tabs={tabs}
              activeTab={currentTab}
              onChange={(tab) => {
                // Map UI tab names to internal state keys if needed, 
                // or just store the UI string.
                setActiveTabMap(prev => ({ ...prev, [section.id]: tab }));
              }}
            />
            <HorizontalProductSlider
              products={products}
              onProductPress={handleProductPress}
            />
          </Wrapper>
        );

      case 'must_have_brands':
        return (
          <Wrapper key={section.id}>
            <BrandSlider scrollY={scrollY} brands={section.data} />
          </Wrapper>
        );

      case 'banners':
        // Full width banner
        const banners = Array.isArray(section.data) ? section.data : [section.data];
        return (
          <React.Fragment key={section.id}>
            {banners.map((b: any, i: number) => (
              <Wrapper key={`${section.id}-${i}`}>
                <StorefrontBanner scrollY={scrollY} banner={b} />
              </Wrapper>
            ))}
          </React.Fragment>
        );

      // NEW CASES (Mapped to existing components loosely)
      case 'makeup':
      case 'fragrances':
      case 'product_strip':
        // Horizontal list with a title
        return (
          <Wrapper key={section.id} style={{ marginVertical: 20 }}>
            {section.title && (
              <View style={{ paddingHorizontal: 24, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {/* Optional: View All link */}
              </View>
            )}
            <HorizontalProductSlider
              products={section.data}
              onProductPress={handleProductPress}
            />
          </Wrapper>
        );

      // case 'flash_sales': 
      //    return <FlashSaleSection ... /> (Not yet implemented, skipping or using placeholder)

      case 'category_carousels':
        const catSections = Array.isArray(section.data) ? section.data : [section.data];
        return (
          <React.Fragment key={section.id}>
            {catSections.map((catData: any, i: number) => (
              <Wrapper key={catData.id ? `cat-${catData.id}` : `${section.id}-${i}`} style={{ marginVertical: 12 }}>
                <CategoryCompositeSection
                  data={catData}
                  onProductPress={handleProductPress}
                />
              </Wrapper>
            ))}
          </React.Fragment>
        );

      default:
        // If it helps, we can render FeaturesSection at the end if strict mapping isn't found
        // or if it matches a specific type.
        if (section.type === 'features' || section.id === 'features') { // Assuming type might differ
          return (
            <Wrapper key={section.id}>
              <FeaturesSection features={section.data} />
            </Wrapper>
          )
        }
        return null;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#000' }]}>
      <GlobalHeader title="LUXE" />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 60 + insets.top, paddingBottom: 60 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Dynamically Render Sections */}
        {sections.map((section, index) => renderSection(section, index))}

        {/* Always show Footer at the bottom */}
        <RevealingSection scrollY={scrollY} index={sections.length + 1} animationType="fade-up">
          <View style={[styles.footer, isDark && { backgroundColor: '#111' }]}>
            <Pressable
              onPress={() => router.push('/shop')}
              style={({ pressed }) => [
                styles.shopAllButton,
                isDark && { backgroundColor: '#fff' },
                pressed && styles.pressed
              ]}
            >
              <Text style={[styles.shopAllText, isDark && { color: '#000' }]}>EXPLORE SHOP</Text>
            </Pressable>
            <Text style={[styles.copyright, isDark && { color: '#64748B' }]}>
              © 2024 SADEK ABDELSATER. ALL RIGHTS RESERVED.
            </Text>
          </View>
        </RevealingSection>
      </Animated.ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
  },
  promoSection: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 20,
    backgroundColor: '#f8fafc',
  },
  shopAllButton: {
    width: '100%',
    height: 52,
    borderRadius: 2,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
  },
  pressed: {
    opacity: 0.8,
  },
  copyright: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  }
});
