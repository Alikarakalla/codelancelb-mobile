import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { LuxeHeader } from '@/components/home/LuxeHeader';
import { HeroSlider, SLIDES } from '@/components/home/HeroSlider';
import { HeroCarouselSummary } from '@/components/home/HeroCarouselSummary';
import { PremiumCategoryGrid } from '@/components/home/PremiumCategoryGrid';
import { HomeQuickTabs } from '@/components/home/HomeQuickTabs';
import { HorizontalProductSlider } from '@/components/home/HorizontalProductSlider';
import { PromoBanner } from '@/components/home/PromoBanner';
import { BrandSlider } from '@/components/home/BrandSlider';
import { StorefrontBanner } from '@/components/home/StorefrontBanner';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { MOCK_PRODUCTS } from '@/constants/mockData';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Product } from '@/types/schema';
import { ProductQuickViewModal } from '@/components/product/ProductQuickViewModal';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedScrollHandler
} from 'react-native-reanimated';
import { RevealingSection } from '@/components/home/RevealingSection';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Featured');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const featuredProducts = MOCK_PRODUCTS.filter(p => p.is_featured);
  const latestProducts = [...MOCK_PRODUCTS].reverse().slice(0, 4);

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
    <View style={styles.container}>
      <LuxeHeader title="Codelancelb" />

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
          <HeroSlider onIndexChange={setCurrentHeroIndex} />
        </RevealingSection>

        <RevealingSection scrollY={scrollY} index={0.5} animationType="reveal">
          <HeroCarouselSummary slides={SLIDES} activeIndex={currentHeroIndex} />
        </RevealingSection>

        <RevealingSection scrollY={scrollY} index={1} animationType="reveal" style={{ marginTop: 20 }}>
          <PremiumCategoryGrid scrollY={scrollY} />
        </RevealingSection>

        <RevealingSection scrollY={scrollY} index={2} animationType="none" style={styles.promoSection}>
          {(progress) => <PromoBanner progress={progress} />}
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
            products={activeTab === 'Featured' ? featuredProducts : latestProducts}
            onProductPress={handleProductPress}
          />
        </RevealingSection>

        <RevealingSection scrollY={scrollY} index={4} animationType="slide-right">
          <BrandSlider scrollY={scrollY} />
        </RevealingSection>

        <RevealingSection scrollY={scrollY} index={5} animationType="fade-up">
          <StorefrontBanner scrollY={scrollY} />
        </RevealingSection>

        <RevealingSection scrollY={scrollY} index={6} animationType="reveal">
          <FeaturesSection />
        </RevealingSection>

        <RevealingSection scrollY={scrollY} index={7} animationType="fade-up">
          <View style={styles.footer}>
            <Pressable
              onPress={() => router.push('/shop')}
              style={({ pressed }) => [styles.shopAllButton, pressed && styles.pressed]}
            >
              <Text style={styles.shopAllText}>EXPLORE SHOP</Text>
            </Pressable>
            <Text style={styles.copyright}>© 2024 SADEK ABDELSATER. ALL RIGHTS RESERVED.</Text>
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
