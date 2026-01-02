import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
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
import { MOCK_PRODUCTS } from '@/constants/mockData';
import { Product, CarouselSlide, Category, HighlightSection, Brand, Banner, CMSFeature } from '@/types/schema';
import { ProductQuickViewModal } from '@/components/product/ProductQuickViewModal';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler
} from 'react-native-reanimated';
import { RevealingSection } from '@/components/home/RevealingSection';
import { useDrawer } from '@/hooks/use-drawer-context';
import { api } from '@/services/apiClient';

// Mock slides for initial render / API fallback
const MOCK_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    title_en: 'ELEGANCE IN\nEVERY DETAIL',
    title_ar: 'الأناقة في كل التفاصيل',
    subtitle_en: 'LIMITED EDITION',
    image_desktop: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
    image_mobile: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
    cta_text_en: 'EXPLORE NOW',
    is_active: true,
    sort_order: 1
  },
  {
    id: 2,
    title_en: 'MODERN CLASSICS\nREIMAGINED',
    title_ar: 'كلاسيكيات حديثة',
    subtitle_en: 'SUMMER ESSENTIALS',
    image_desktop: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=1000&auto=format&fit=crop',
    image_mobile: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=1000&auto=format&fit=crop',
    cta_text_en: 'VIEW ALL',
    is_active: true,
    sort_order: 2
  }
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Featured');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const { openDrawer } = useDrawer();
  const [slides, setSlides] = useState<CarouselSlide[]>(MOCK_SLIDES);
  const [categories, setCategories] = useState<Category[]>([]);
  const [highlights, setHighlights] = useState<HighlightSection[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [features, setFeatures] = useState<CMSFeature[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Load data from API
    const loadData = async () => {
      try {
        const [apiSlides, apiCategories, apiHighlights, apiBrands, apiBanners, apiFeatures, apiFeatured, apiLatest] = await Promise.all([
          api.getCarouselSlides().catch(() => MOCK_SLIDES),
          api.getCategories(),
          api.getHighlightSections(),
          api.getBrands(),
          api.getBanners(),
          api.getCMSFeatures(),
          api.getProducts({ is_featured: true, limit: 10 }),
          api.getProducts({ limit: 10 }) // latest
        ]);

        if (apiSlides && apiSlides.length > 0) setSlides(apiSlides);
        if (apiCategories && apiCategories.length > 0) setCategories(apiCategories as any);
        if (apiHighlights && apiHighlights.length > 0) setHighlights(apiHighlights as any);
        if (apiBrands && apiBrands.length > 0) setBrands(apiBrands as any);
        if (apiBanners && apiBanners.length > 0) setBanners(apiBanners as any);
        if (apiFeatures && apiFeatures.length > 0) setFeatures(apiFeatures as any);
        if (apiFeatured && apiFeatured.length > 0) setFeaturedProducts(apiFeatured);
        if (apiLatest && apiLatest.length > 0) setLatestProducts(apiLatest);
      } catch (error) {
        console.error('Failed to load home data', error);
      }
    };
    loadData();
  }, []);

  // Fallback to mock data if API results are empty (using MOCK_PRODUCTS for now until API is connected)
  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : MOCK_PRODUCTS.filter(p => p.is_featured);
  const displayLatest = latestProducts.length > 0 ? latestProducts : [...MOCK_PRODUCTS].reverse().slice(0, 4);

  const handleProductPress = (product: Product) => {
    // router.push(`/product/${product.slug}`);
    console.log('Navigating to:', product.name);
  };

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

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
        <RevealingSection scrollY={scrollY} index={0} animationType="fade-up">
          <HeroSlider slides={slides} onIndexChange={setCurrentHeroIndex} />
        </RevealingSection>

        <RevealingSection scrollY={scrollY} index={0.5} animationType="reveal">
          <HeroCarouselSummary slides={slides} activeIndex={currentHeroIndex} />
        </RevealingSection>

        <RevealingSection scrollY={scrollY} index={1} animationType="reveal" style={{ marginTop: 20 }}>
          <PremiumCategoryGrid scrollY={scrollY} categories={categories} />
        </RevealingSection>

        <RevealingSection scrollY={scrollY} index={2} animationType="none" style={styles.promoSection}>
          {(progress) => <PromoBanner progress={progress} section={highlights.length > 0 ? highlights[0] : undefined} />}
        </RevealingSection>

        <RevealingSection scrollY={scrollY} index={3} animationType="zoom-in">
          <HomeQuickTabs
            tabs={['JUST LANDED', 'FEATURED']}
            activeTab={activeTab === 'Latest' ? 'JUST LANDED' : (activeTab === 'Featured' ? 'FEATURED' : activeTab)}
            onChange={(tab) => {
              if (tab === 'JUST LANDED') setActiveTab('Latest');
              else if (tab === 'FEATURED') setActiveTab('Featured');
              else setActiveTab(tab);
            }}
          />
          <HorizontalProductSlider
            products={activeTab === 'Featured' ? displayFeatured : displayLatest}
            onProductPress={handleProductPress}
          />
        </RevealingSection>

        <RevealingSection scrollY={scrollY} index={4} animationType="slide-right">
          <BrandSlider scrollY={scrollY} brands={brands} />
        </RevealingSection>

        <RevealingSection scrollY={scrollY} index={5} animationType="fade-up">
          <StorefrontBanner scrollY={scrollY} banner={banners.length > 0 ? banners[0] : undefined} />
        </RevealingSection>

        <RevealingSection scrollY={scrollY} index={6} animationType="reveal">
          <FeaturesSection features={features} />
        </RevealingSection>

        <RevealingSection scrollY={scrollY} index={7} animationType="fade-up">
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

      {/* Quick View Sync */}
      <ProductQuickViewModal
        visible={!!quickViewProduct}
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(params) => console.log('Add to cart from Home:', params)}
        onViewDetails={(product) => handleProductPress(product)}
      />
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
