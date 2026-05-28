import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Platform,
    Pressable,
    StyleSheet,
    View,
    ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import Animated from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAIN_ASPECT_RATIO = 4 / 5; // matches web's mobile breakpoint fallback
const MAIN_HEIGHT = Math.round(SCREEN_WIDTH / MAIN_ASPECT_RATIO);
const THUMB_SIZE = 86;
const THUMB_GAP = 8;

interface ProductImageGalleryProps {
    images: string[];
    selectedImage?: string | null;
    productId?: number;
}

export function ProductImageGallery({ images, selectedImage, productId }: ProductImageGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const flatListRef = useRef<FlatList>(null);
    const thumbListRef = useRef<FlatList>(null);
    const isManualScrolling = useRef(false);
    const iosMajorVersion = Platform.OS === 'ios'
        ? Number(String(Platform.Version).split('.')[0] || 0)
        : 0;
    const supportsAppleZoomTransition = Platform.OS === 'ios' && iosMajorVersion >= 18;

    React.useEffect(() => {
        if (images.length > 0 && activeIndex >= 0 && activeIndex < images.length) {
            thumbListRef.current?.scrollToIndex({
                index: activeIndex,
                animated: true,
                viewPosition: 0.5,
            });
        }
    }, [activeIndex, images.length]);

    const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && !isManualScrolling.current) {
            setActiveIndex(viewableItems[0].index || 0);
        }
    });
    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

    const scrollToIndex = useCallback(
        (index: number) => {
            if (index >= 0 && index < images.length) {
                isManualScrolling.current = true;
                flatListRef.current?.scrollToIndex({ index, animated: true });
                setActiveIndex(index);
                setTimeout(() => {
                    isManualScrolling.current = false;
                }, 600);
            }
        },
        [images.length]
    );

    // Only sync to selectedImage when it actually changes from outside (e.g. variant selection).
    // Listening to activeIndex here would fight the user's swipe and snap back to the variant image.
    const lastAppliedSelectedImage = useRef<string | null | undefined>(undefined);
    React.useEffect(() => {
        if (lastAppliedSelectedImage.current === selectedImage) return;
        lastAppliedSelectedImage.current = selectedImage;
        if (!selectedImage) return;
        const index = images.findIndex((img) => img === selectedImage);
        if (index !== -1) {
            scrollToIndex(index);
        }
    }, [selectedImage, images, scrollToIndex]);

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
            <View style={[styles.mainWrapper, isDark && styles.mainWrapperDark]}>
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
                        length: SCREEN_WIDTH,
                        offset: SCREEN_WIDTH * index,
                        index,
                    })}
                    onMomentumScrollEnd={() => {
                        isManualScrolling.current = false;
                    }}
                    onScrollToIndexFailed={(info) => {
                        setTimeout(() => {
                            if (flatListRef.current) {
                                flatListRef.current.scrollToIndex({ index: info.index, animated: false });
                            }
                        }, 100);
                    }}
                    renderItem={({ item, index }) => (
                        <Link href={viewerHref} asChild>
                            <Pressable style={styles.slide}>
                                {supportsAppleZoomTransition && index === activeIndex ? (
                                    <Link.AppleZoom>
                                        <View pointerEvents="none" style={styles.appleZoomSourceProxy}>
                                            <Image
                                                source={{ uri: item }}
                                                style={styles.appleZoomSourceImage}
                                                contentFit="contain"
                                            />
                                        </View>
                                    </Link.AppleZoom>
                                ) : null}
                                <AnimatedImage
                                    source={{ uri: item }}
                                    style={styles.image}
                                    contentFit="contain"
                                    {...(productId && index === 0
                                        ? ({ sharedTransitionTag: `product-${productId}` } as any)
                                        : {})}
                                />
                            </Pressable>
                        </Link>
                    )}
                />

                {images.length > 1 && (
                    <View style={styles.indicatorShell} pointerEvents="none">
                        <View style={styles.indicatorPill}>
                            {images.map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.indicatorDot,
                                        i === activeIndex && styles.indicatorDotActive,
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                )}
            </View>

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
                            setTimeout(() => {
                                thumbListRef.current?.scrollToIndex({
                                    index: info.index,
                                    animated: true,
                                    viewPosition: 0.5,
                                });
                            }, 500);
                        }}
                        renderItem={({ item, index }) => {
                            const isActive = activeIndex === index;
                            return (
                                <Pressable
                                    onPress={() => scrollToIndex(index)}
                                    style={[
                                        styles.thumbCard,
                                        isDark && styles.thumbCardDark,
                                        isActive && (isDark ? styles.thumbCardActiveDark : styles.thumbCardActive),
                                    ]}
                                >
                                    <Image
                                        source={{ uri: item }}
                                        style={styles.thumbImage}
                                        contentFit="cover"
                                    />
                                </Pressable>
                            );
                        }}
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
    mainWrapper: {
        width: SCREEN_WIDTH,
        height: MAIN_HEIGHT,
        position: 'relative',
        backgroundColor: '#ffffff',
    },
    mainWrapperDark: {
        backgroundColor: '#0B0B0B',
    },
    slide: {
        width: SCREEN_WIDTH,
        height: MAIN_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    appleZoomSourceProxy: {
        position: 'absolute',
        inset: 0,
        opacity: 0.001,
    },
    appleZoomSourceImage: {
        width: '100%',
        height: '100%',
    },
    indicatorShell: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 20,
    },
    indicatorPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        minHeight: 18,
        paddingHorizontal: 7,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: 'rgba(17, 17, 17, 0.36)',
    },
    indicatorDot: {
        width: 6,
        height: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(255, 255, 255, 0.55)',
    },
    indicatorDotActive: {
        width: 18,
        backgroundColor: '#FFFFFF',
    },
    thumbnailsContainer: {
        marginTop: 12,
    },
    thumbnailsContent: {
        paddingHorizontal: 12,
        gap: THUMB_GAP,
    },
    thumbCard: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: '#ffffff',
    },
    thumbCardDark: {
        backgroundColor: '#0B0B0B',
    },
    thumbCardActive: {
        borderColor: '#111',
    },
    thumbCardActiveDark: {
        borderColor: '#fff',
    },
    thumbImage: {
        width: '100%',
        height: '100%',
        borderRadius: 6,
    },
});
