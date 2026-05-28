import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrency } from '@/hooks/use-currency-context';
import { api } from '@/services/apiClient';
import { Product } from '@/types/schema';
import { calculateProductListingPricing } from '@/utils/pricing';

interface CompleteCollectionRailProps {
    currentProductId: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.58);
const CARD_GAP = 16;
const HORIZONTAL_PADDING = 20;

function resolveImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `https://lebazone.shop/storage/${path.replace(/^\/+/, '')}`;
}

function pickProductImage(product: Product): string | null {
    const candidates: (string | null | undefined)[] = [
        (product as any).listing_image,
        product.main_image,
        (product as any).image,
        (product as any).cover_image,
        (product as any).thumbnail,
    ];
    for (const candidate of candidates) {
        if (candidate) return resolveImageUrl(candidate);
    }
    const firstGalleryImage = product.images?.[0];
    if (firstGalleryImage?.path) return resolveImageUrl(firstGalleryImage.path);
    const defaultVariant = product.variants?.find(v => v.is_default) || product.variants?.[0];
    if (defaultVariant?.image_path) return resolveImageUrl(defaultVariant.image_path);
    return null;
}

interface RailCardProps {
    product: Product;
    onPress: (product: Product, image: string | null) => void;
}

function RailCard({ product, onPress }: RailCardProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { formatPrice } = useCurrency();

    const image = pickProductImage(product);
    const pricing = useMemo(
        () => calculateProductListingPricing(product, { selectedVariant: null }),
        [product]
    );
    const brand = product.brand?.name || 'Lebazone';
    const badge = pricing.discountPercent > 0 ? `${pricing.discountPercent}% OFF` : null;
    const showCompare = pricing.hasDiscount && pricing.originalPrice && pricing.originalPrice > pricing.finalPrice;

    return (
        <Pressable
            onPress={() => onPress(product, image)}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
        >
            <View style={[styles.imageWrap, isDark && styles.imageWrapDark]}>
                {image ? (
                    <Image
                        source={{ uri: image }}
                        style={styles.image}
                        contentFit="contain"
                        transition={150}
                    />
                ) : (
                    <View style={styles.imagePlaceholder} />
                )}
                {badge && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                )}
            </View>

            <View style={styles.cardBody}>
                <Text style={[styles.brand, isDark && styles.brandDark]} numberOfLines={1}>
                    {brand.toUpperCase()}
                </Text>
                <Text style={[styles.title, isDark && styles.titleDark]} numberOfLines={1}>
                    {product.name_en || product.name}
                </Text>
                <View style={styles.priceRow}>
                    <Text style={styles.salePrice}>{formatPrice(pricing.finalPrice)}</Text>
                    {showCompare && (
                        <Text style={[styles.comparePrice, isDark && styles.comparePriceDark]}>
                            {formatPrice(pricing.originalPrice as number)}
                        </Text>
                    )}
                </View>
            </View>
        </Pressable>
    );
}

export function CompleteCollectionRail({ currentProductId }: CompleteCollectionRailProps) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [items, setItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<ScrollView>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [pageCount, setPageCount] = useState(1);

    useEffect(() => {
        let cancelled = false;
        const fetchItems = async () => {
            try {
                const data = await api.getRelatedProducts(currentProductId);
                if (!cancelled) setItems(data);
            } catch (err) {
                console.warn('Failed to load collection products:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchItems();
        return () => {
            cancelled = true;
        };
    }, [currentProductId]);

    useEffect(() => {
        if (!items.length) {
            setPageCount(1);
            return;
        }
        const itemFullWidth = CARD_WIDTH + CARD_GAP;
        const totalContentWidth = items.length * itemFullWidth + HORIZONTAL_PADDING * 2;
        const viewportWidth = SCREEN_WIDTH;
        if (totalContentWidth <= viewportWidth) {
            setPageCount(1);
        } else {
            setPageCount(Math.max(2, Math.ceil(totalContentWidth / viewportWidth)));
        }
    }, [items.length]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (pageCount <= 1) return;
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const maxScroll = Math.max(contentSize.width - layoutMeasurement.width, 1);
        const progress = Math.min(1, Math.max(0, contentOffset.x / maxScroll));
        const next = Math.min(pageCount - 1, Math.round(progress * (pageCount - 1)));
        if (next !== activeIndex) setActiveIndex(next);
    };

    const handleCardPress = (product: Product, image: string | null) => {
        router.push({
            pathname: '/product/[id]',
            params: { id: product.id.toString(), initialImage: image || '' },
        } as any);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={isDark ? '#fff' : '#000'} />
            </View>
        );
    }

    if (!items.length) return null;

    return (
        <Animated.View entering={FadeIn.duration(300)} style={styles.root}>
            <View style={[styles.divider, isDark && styles.dividerDark]} />

            <View style={styles.header}>
                <Text style={[styles.eyebrow, isDark && styles.eyebrowDark]}>MATCHED TO THIS PRODUCT</Text>
                <Text style={[styles.heading, isDark && styles.headingDark]}>Complete the Collection</Text>
            </View>

            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={CARD_WIDTH + CARD_GAP}
                snapToAlignment="start"
            >
                {items.map((product) => (
                    <RailCard key={product.id} product={product} onPress={handleCardPress} />
                ))}
            </ScrollView>

            {pageCount > 1 && (
                <View style={styles.dotsRow}>
                    {Array.from({ length: pageCount }).map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                isDark && styles.dotDark,
                                activeIndex === index && styles.dotActive,
                                activeIndex === index && isDark && styles.dotActiveDark,
                            ]}
                        />
                    ))}
                </View>
            )}

            <View style={[styles.divider, isDark && styles.dividerDark, styles.dividerBottom]} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    root: {
        marginTop: 20,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#E5E5E5',
        marginHorizontal: HORIZONTAL_PADDING,
    },
    dividerDark: {
        backgroundColor: '#1F2937',
    },
    dividerBottom: {
        marginTop: 12,
    },
    header: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 16,
        paddingBottom: 12,
    },
    eyebrow: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1.5,
        color: '#999',
        marginBottom: 4,
    },
    eyebrowDark: {
        color: '#94A3B8',
    },
    heading: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
        letterSpacing: -0.2,
    },
    headingDark: {
        color: '#F8FAFC',
    },
    scrollContent: {
        paddingHorizontal: HORIZONTAL_PADDING,
        gap: CARD_GAP,
        paddingBottom: 4,
    },
    card: {
        width: CARD_WIDTH,
    },
    imageWrap: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    imageWrapDark: {
        backgroundColor: '#1A1A1A',
        borderColor: '#1F2937',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#000',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    cardBody: {
        paddingTop: 10,
        paddingHorizontal: 2,
    },
    brand: {
        fontSize: 10,
        fontWeight: '600',
        color: '#888',
        letterSpacing: 0.8,
        marginBottom: 3,
    },
    brandDark: {
        color: '#94A3B8',
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111',
        lineHeight: 17,
        marginBottom: 6,
    },
    titleDark: {
        color: '#F8FAFC',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    salePrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#D32F2F',
    },
    comparePrice: {
        fontSize: 12,
        fontWeight: '400',
        color: '#AAA',
        textDecorationLine: 'line-through',
    },
    comparePriceDark: {
        color: '#64748B',
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 5,
        paddingTop: 12,
        paddingBottom: 4,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#D0D0D0',
    },
    dotDark: {
        backgroundColor: '#374151',
    },
    dotActive: {
        width: 14,
        backgroundColor: '#111',
    },
    dotActiveDark: {
        backgroundColor: '#F8FAFC',
    },
});
