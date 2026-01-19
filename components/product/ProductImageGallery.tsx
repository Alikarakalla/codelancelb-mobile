import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Pressable, FlatList, ViewToken } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import ImageView from "react-native-image-viewing";
import { useColorScheme } from '@/hooks/use-color-scheme';
import Animated from 'react-native-reanimated';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const { width } = Dimensions.get('window');
const IMAGE_ASPECT_RATIO = 1; // Square 1:1

interface ProductImageGalleryProps {
    images: string[];
    selectedImage?: string | null;
    productId?: number;
}

export function ProductImageGallery({ images, selectedImage, productId }: ProductImageGalleryProps) {
    const [visible, setVisible] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

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

    const formattedImages = images.map(img => ({ uri: img }));

    // Scroll to selected image when it updates
    React.useEffect(() => {
        if (selectedImage) {
            const index = images.findIndex(img => img === selectedImage);
            if (index !== -1 && index !== activeIndex) {
                scrollToIndex(index);
            }
        }
    }, [selectedImage, images]);

    const isManualScrolling = useRef(false);

    // Handle scroll for pagination
    const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && !isManualScrolling.current) {
            setActiveIndex(viewableItems[0].index || 0);
        }
    });
    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

    const scrollToIndex = (index: number) => {
        if (index >= 0 && index < images.length) {
            isManualScrolling.current = true;
            flatListRef.current?.scrollToIndex({ index, animated: true });
            setActiveIndex(index);

            // Safety timeout to reset in case scroll doesn't fire momentum events (e.g. adjacent item)
            setTimeout(() => {
                isManualScrolling.current = false;
            }, 600);
        }
    };

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
                                sharedTransitionTag={productId && index === 0 ? `product-image-${productId}` : undefined}
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
                <Pressable style={styles.expandButton} onPress={() => setVisible(true)}>
                    <Ionicons name="resize" size={20} color="#fff" />
                </Pressable>
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

            {/* Full Screen Viewer */}
            <ImageView
                images={formattedImages}
                imageIndex={activeIndex}
                visible={visible}
                onRequestClose={() => setVisible(false)}
            />
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
        bottom: 24,
        right: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
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
