import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable, FlatList, ViewToken, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Animated from 'react-native-reanimated';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const { width } = Dimensions.get('window');
const EXPAND_BUTTON_OFFSET = 24;
interface ProductImageGalleryProps {
    images: string[];
    selectedImage?: string | null;
    productId?: number;
}

export function ProductImageGallery({ images, selectedImage, productId }: ProductImageGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const iosMajorVersion = Platform.OS === 'ios'
        ? Number(String(Platform.Version).split('.')[0] || 0)
        : 0;
    const supportsAppleZoomTransition = Platform.OS === 'ios' && iosMajorVersion >= 18;

    const thumbListRef = useRef<FlatList>(null);

    // Sync thumbnails with active index
    React.useEffect(() => {
        if (images.length > 0 && activeIndex >= 0 && activeIndex < images.length) {
            thumbListRef.current?.scrollToIndex({
                index: activeIndex,
                animated: true,
                viewPosition: 0.5
            });
        }
    }, [activeIndex, images.length]);

    const isManualScrolling = useRef(false);

    // Handle scroll for pagination
    const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && !isManualScrolling.current) {
            setActiveIndex(viewableItems[0].index || 0);
        }
    });
    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

    const scrollToIndex = useCallback((index: number) => {
        if (index >= 0 && index < images.length) {
            isManualScrolling.current = true;
            flatListRef.current?.scrollToIndex({ index, animated: true });
            setActiveIndex(index);

            // Safety timeout to reset in case scroll doesn't fire momentum events (e.g. adjacent item)
            setTimeout(() => {
                isManualScrolling.current = false;
            }, 600);
        }
    }, [images.length]);

    // Scroll to selected image when it updates
    React.useEffect(() => {
        if (selectedImage) {
            const index = images.findIndex(img => img === selectedImage);
            if (index !== -1 && index !== activeIndex) {
                scrollToIndex(index);
            }
        }
    }, [selectedImage, images, activeIndex, scrollToIndex]);

    const activeImage = images[activeIndex] || images[0];
    const viewerHref = useMemo(
        () => ({
            pathname: '/product/image-viewer' as const,
            params: {
                images: JSON.stringify(images),
                index: String(activeIndex),
                image: activeImage,
            },
        }),
        [activeImage, activeIndex, images]
    );

    if (!images || images.length === 0) return null;

    return (
        <View style={styles.container}>
            {/* Main Swiper */}
            <View style={styles.swiperContainer}>
                <FlatList
                    ref={flatListRef}
                    data={images}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewRef.current}
                    viewabilityConfig={viewConfigRef.current}
                    keyExtractor={(_, index) => index.toString()}
                    getItemLayout={(_, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                    onMomentumScrollEnd={() => {
                        isManualScrolling.current = false;
                    }}
                    onScrollToIndexFailed={(info) => {
                        // Retry once
                        setTimeout(() => {
                            if (flatListRef.current) {
                                flatListRef.current.scrollToIndex({ index: info.index, animated: false });
                            }
                        }, 100);
                    }}

                    renderItem={({ item, index }) => (
                        <View style={styles.slide}>
                            <AnimatedImage
                                source={{ uri: item }}
                                style={styles.image}
                                contentFit="contain"
                                {...(productId && index === 0 ? ({ sharedTransitionTag: `product-${productId}` } as any) : {})}
                            />
                        </View>
                    )}
                />

                {/* Pagination Dots (Optional overlay) */}
                <View style={styles.pagination}>
                    {images.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                i === activeIndex ?
                                    (isDark ? styles.activeDot : { ...styles.activeDot, backgroundColor: '#1F2937' }) :
                                    (isDark ? styles.inactiveDot : { ...styles.inactiveDot, backgroundColor: 'rgba(0,0,0,0.2)' })
                            ]}
                        />
                    ))}
                </View>

                {/* Expand Button */}
                <Link href={viewerHref} asChild>
                    <Pressable style={styles.expandButton}>
                        {supportsAppleZoomTransition && activeImage ? (
                            <Link.AppleZoom>
                                <View pointerEvents="none" style={styles.appleZoomSourceProxy}>
                                    <Image
                                        source={{ uri: activeImage }}
                                        style={styles.appleZoomSourceImage}
                                        contentFit="contain"
                                    />
                                </View>
                            </Link.AppleZoom>
                        ) : null}
                        <Ionicons name="resize" size={20} color="#fff" />
                    </Pressable>
                </Link>
            </View>

            {/* Thumbnails */}
            {images.length > 1 && (
                <View style={styles.thumbnailsContainer}>
                    <FlatList
                        ref={thumbListRef}
                        data={images}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.thumbnailsContent}
                        keyExtractor={(_, index) => index.toString()}
                        onScrollToIndexFailed={(info) => {
                            // Wait for layout
                            setTimeout(() => {
                                thumbListRef.current?.scrollToIndex({
                                    index: info.index,
                                    animated: true,
                                    viewPosition: 0.5
                                });
                            }, 500);
                        }}
                        renderItem={({ item, index }) => (
                            <Pressable
                                onPress={() => scrollToIndex(index)}
                                style={[
                                    styles.thumbnailWrapper,
                                    isDark && { backgroundColor: '#222' },
                                    activeIndex === index && { borderColor: isDark ? '#fff' : '#000' }
                                ]}
                            >
                                <Image
                                    source={{ uri: item }}
                                    style={styles.thumbnailImage}
                                    resizeMode="cover"
                                />
                            </Pressable>
                        )}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    swiperContainer: {
        width: width,
        height: width, // Square container
        position: 'relative',
    },
    slide: {
        width: width,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: width,
        height: width,
    },
    pagination: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        paddingBottom: 16,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    inactiveDot: {
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    expandButton: {
        position: 'absolute',
        bottom: EXPAND_BUTTON_OFFSET,
        right: EXPAND_BUTTON_OFFSET,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    appleZoomSourceProxy: {
        position: 'absolute',
        width,
        height: width,
        right: -EXPAND_BUTTON_OFFSET,
        bottom: -EXPAND_BUTTON_OFFSET,
        opacity: 0.001,
    },
    appleZoomSourceImage: {
        width: '100%',
        height: '100%',
    },
    thumbnailsContainer: {
        marginTop: 16,
    },
    thumbnailsContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    thumbnailWrapper: {
        width: 64,
        height: 64,
        borderRadius: 4,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        backgroundColor: '#f1f5f9',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    }
});
