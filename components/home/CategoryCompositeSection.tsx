import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    cancelAnimation,
    runOnJS
} from 'react-native-reanimated';
import { Product } from '@/types/schema';
import { HorizontalProductSlider } from './HorizontalProductSlider';

const { width } = Dimensions.get('window');
const AUTO_PLAY_DURATION = 5000;

interface CategorySlide {
    title: string;
    subtitle: string;
    cta_text: string;
    cta_url: string;
    image_desktop?: string;
    image_mobile: string;
}

export interface CategorySectionData {
    id: number;
    title: string;
    subtitle: string;
    category_name: string;
    category_slug: string;
    slides: CategorySlide[];
    products: Product[];
}

interface CategoryCompositeSectionProps {
    data: CategorySectionData;
    onProductPress?: (product: Product) => void;
}

export function CategoryCompositeSection({ data, onProductPress }: CategoryCompositeSectionProps) {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const progress = useSharedValue(0);

    // Filter out sections where products are missing (if required, though typical API behaviour)
    // Here we just return null if data is missing
    if (!data) return null;
    if (!data.products || data.products.length === 0) {
        return null;
    }

    const showBanners = data.slides && data.slides.length > 0;

    // Auto-Play Logic
    useEffect(() => {
        if (!showBanners) return;

        // Reset progress
        progress.value = 0;
        // Start animation
        progress.value = withTiming(1, {
            duration: AUTO_PLAY_DURATION,
            easing: Easing.linear,
        }, (finished) => {
            if (finished) {
                runOnJS(handleNextSlide)();
            }
        });

        return () => {
            cancelAnimation(progress);
        };
    }, [activeIndex, showBanners]);

    const handleNextSlide = () => {
        if (!data.slides || data.slides.length === 0) return;
        const nextIndex = (activeIndex + 1) % data.slides.length;
        scrollToIndex(nextIndex);
    };

    const scrollToIndex = (index: number) => {
        setActiveIndex(index);
        flatListRef.current?.scrollToIndex({
            index,
            animated: true,
        });
    };

    const handleMomentumScrollEnd = (event: any) => {
        const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        if (newIndex !== activeIndex) {
            setActiveIndex(newIndex);
        }
    };

    const handlePressBanner = (url: string) => {
        if (url) {
            if (url.startsWith('http')) {
                router.push(url as any);
            } else {
                router.push(url as any);
            }
        }
    };

    const handleViewAll = () => {
        router.push({
            pathname: '/shop',
            params: { category: data.category_slug }
        });
    };

    const renderBanner = ({ item }: { item: CategorySlide }) => (
        <Pressable onPress={() => handlePressBanner(item.cta_url)} style={styles.bannerItem}>
            <Image source={{ uri: item.image_mobile }} style={styles.bannerImage} resizeMode="cover" />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.gradientOverlay}
            />
            <View style={styles.bannerContent}>
                <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <View style={styles.ctaButton}>
                    <Text style={styles.ctaText}>{item.cta_text || 'SHOP NOW'}</Text>
                </View>
            </View>
        </Pressable>
    );

    // Pagination Indicators
    const Pagination = () => {
        return (
            <View style={styles.paginationContainer}>
                {data.slides.map((_, index) => {
                    const isActive = index === activeIndex;

                    if (isActive) {
                        // animated style for progress bar width inside pill
                        // We animate width from 0% to 100% of the container (e.g. 24px)
                        // Actually, easier to scaleX a view inside
                        const animatedProgressStyle = useAnimatedStyle(() => {
                            return {
                                width: `${progress.value * 100}%`
                            };
                        });

                        return (
                            <View key={index} style={styles.activeDotContainer}>
                                <Animated.View style={[styles.activeDotFill, animatedProgressStyle]} />
                            </View>
                        );
                    } else {
                        return <View key={index} style={styles.inactiveDot} />;
                    }
                })}
            </View>
        );
    };


    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.title}>{data.title}</Text>
                    {data.subtitle ? <Text style={styles.subtitle}>{data.subtitle}</Text> : null}
                </View>
                <Pressable onPress={handleViewAll} hitSlop={10}>
                    <Text style={styles.viewAllText}>View All</Text>
                </Pressable>
            </View>

            {/* Banners */}
            {showBanners && (
                <View style={styles.bannerContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={data.slides}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        renderItem={renderBanner}
                        keyExtractor={(item, index) => index.toString()}
                        snapToInterval={width}
                        decelerationRate="fast"
                        onMomentumScrollEnd={handleMomentumScrollEnd}
                    // Pause auto-play on drag could be added here but simple reset on scroll end is usually enough
                    />

                    {/* Custom Pagination Overlay */}
                    <Pagination />
                </View>
            )}

            {/* Products */}
            <View style={styles.productsContainer}>
                <HorizontalProductSlider
                    products={data.products}
                    onProductPress={onProductPress || ((product) => {
                        router.push({
                            pathname: '/product/[id]',
                            params: { id: product.id, initialImage: product.main_image || '' }
                        });
                    })}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 40,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1a1a1a',
        letterSpacing: 0.5,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    viewAllText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000',
        textDecorationLine: 'underline',
        letterSpacing: 1,
        marginBottom: 4,
    },
    bannerContainer: {
        marginBottom: 24,
        width: width,
        height: width * 0.56, // 16:9 Aspect Ratio
        position: 'relative',
    },
    bannerItem: {
        width: width,
        height: '100%',
        position: 'relative',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#eee',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    bannerContent: {
        position: 'absolute',
        bottom: 40, // More space for pagination
        left: 24,
        right: 24,
        alignItems: 'flex-start',
    },
    bannerTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    bannerSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    ctaButton: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 2,
    },
    ctaText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    productsContainer: {
        // HorizontalProductSlider handles its own internal padding logic
    },

    // Pagination Styles
    paginationContainer: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    inactiveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    activeDotContainer: {
        width: 32,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)',
        overflow: 'hidden',
    },
    activeDotFill: {
        height: '100%',
        backgroundColor: '#fff',
    }
});
