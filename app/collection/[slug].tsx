import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ShopProductCard } from '@/components/shop/ShopProductCard';
import { ShopSkeletonGrid } from '@/components/shop/ShopCardSkeleton';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/apiClient';
import { Product } from '@/types/schema';

/**
 * Matches web product-collection-page.blade.php exactly:
 *   - Hero banner: 450px tall on desktop / ~340px on mobile with title + subtitle bottom-left,
 *     dark gradient overlay.
 *   - Product grid: 2-col mobile, ShopProductCard.
 *
 * Data flow:
 *   - When opened from the home banner row, the whole collection object is passed via
 *     params (JSON-stringified) for instant paint.
 *   - On refresh or deep link with only slug, we fall back to the home endpoint to find
 *     the matching collection by slug.
 */

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = Math.round(SCREEN_WIDTH * 0.92);

interface CollectionData {
    id?: number | string;
    slug?: string;
    title?: string;
    subtitle?: string;
    image?: string;
    image_mobile?: string;
    products?: Product[];
}

export default function CollectionPage() {
    const router = useRouter();
    const params = useLocalSearchParams<{ slug?: string; data?: string }>();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const initial = useMemo<CollectionData | null>(() => {
        if (typeof params.data !== 'string') return null;
        try {
            return JSON.parse(params.data) as CollectionData;
        } catch {
            return null;
        }
    }, [params.data]);

    const slug = typeof params.slug === 'string' ? params.slug : '';
    const [collection, setCollection] = useState<CollectionData | null>(initial);
    const [loading, setLoading] = useState(!initial);

    // Always fetch the full collection (banner + products) by slug from the dedicated
    // endpoint. The `initial` payload from the home banner row only contains metadata —
    // products live behind /v1/product-collections/{slug}.
    useEffect(() => {
        if (!slug) return;
        let cancelled = false;
        const fetchCollection = async () => {
            setLoading(true);
            try {
                const data = await api.getProductCollection(slug);
                if (!cancelled) setCollection(data as CollectionData);
            } catch (err) {
                console.warn('Failed to load collection by slug:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchCollection();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    const products = collection?.products || [];
    const heroImage = collection?.image_mobile || collection?.image || null;
    const title = collection?.title || (slug ? slug.replace(/-/g, ' ') : 'Collection');
    const subtitle = collection?.subtitle || null;

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <StatusBar style="light" />

            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTransparent: true,
                    headerTitle: '',
                    headerLeft: () => (
                        <Pressable
                            onPress={() => router.back()}
                            style={styles.backWrapper}
                        >
                            <IconSymbol name="chevron.left" color="#fff" size={24} weight="medium" />
                        </Pressable>
                    ),
                    ...(Platform.OS === 'ios' ? {
                        unstable_nativeHeaderOptions: {
                            headerBackground: { material: 'glass' },
                        },
                    } : {}),
                } as any}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                {/* Hero banner — matches .mufc-hero-banner on web */}
                <View style={styles.hero}>
                    {heroImage ? (
                        <Image
                            source={{ uri: heroImage }}
                            style={StyleSheet.absoluteFill}
                            contentFit="cover"
                            transition={250}
                        />
                    ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1F2937' }]} />
                    )}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
                        style={StyleSheet.absoluteFill}
                        pointerEvents="none"
                    />
                    <View style={styles.heroCopy}>
                        <Text style={styles.heroTitle} numberOfLines={3}>
                            {title}
                        </Text>
                        {subtitle ? (
                            <Text style={styles.heroSubtitle} numberOfLines={3}>
                                {subtitle}
                            </Text>
                        ) : null}
                    </View>
                </View>

                {/* Product grid — matches the React grid block on web */}
                <View style={styles.gridSection}>
                    {loading && products.length === 0 ? (
                        <ShopSkeletonGrid count={6} />
                    ) : products.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                                No products available.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {products.map((item, idx) => (
                                <Animated.View
                                    key={item.id}
                                    entering={FadeInDown.delay(Math.min(idx, 8) * 40).duration(380)}
                                    style={{ width: '48%' }}
                                >
                                    <ShopProductCard product={item} />
                                </Animated.View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    containerDark: {
        backgroundColor: '#000',
    },
    backWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Platform.OS === 'android' ? 'rgba(0,0,0,0.35)' : 'transparent',
        marginLeft: 4,
    },
    hero: {
        width: '100%',
        height: HERO_HEIGHT,
        backgroundColor: '#111',
        justifyContent: 'flex-end',
    },
    heroCopy: {
        paddingHorizontal: 24,
        paddingBottom: 28,
        zIndex: 2,
    },
    heroTitle: {
        color: '#fff',
        fontSize: 38,
        lineHeight: 42,
        fontWeight: '800',
        letterSpacing: -1,
        marginBottom: 10,
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.92)',
        fontSize: 15,
        lineHeight: 21,
        fontWeight: '400',
    },
    gridSection: {
        paddingHorizontal: 20,
        paddingTop: 28,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    emptyBox: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#64748B',
    },
    emptyTextDark: {
        color: '#94A3B8',
    },
});
