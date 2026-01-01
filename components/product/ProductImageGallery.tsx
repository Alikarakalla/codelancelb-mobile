import React, { useState, useRef, useCallback } from 'react';
import { View, Image, StyleSheet, Dimensions, Pressable, FlatList, ViewToken } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImageView from "react-native-image-viewing";

const { width } = Dimensions.get('window');
const IMAGE_ASPECT_RATIO = 1; // Square 1:1

interface ProductImageGalleryProps {
    images: string[];
}

export function ProductImageGallery({ images }: ProductImageGalleryProps) {
    const [visible, setVisible] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const formattedImages = images.map(img => ({ uri: img }));

    // Handle scroll for pagination
    const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index || 0);
        }
    });
    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

    const scrollToIndex = (index: number) => {
        flatListRef.current?.scrollToIndex({ index, animated: true });
        setActiveIndex(index);
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
                    renderItem={({ item }) => (
                        <View style={styles.slide}>
                            <Image
                                source={{ uri: item }}
                                style={styles.image}
                                resizeMode="cover" // Cover usually looks more premium, user sees full in modal
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
                                i === activeIndex ? styles.activeDot : styles.inactiveDot
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
                                    activeIndex === index && styles.activeThumbnail
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
        height: width * IMAGE_ASPECT_RATIO, // e.g. 300 * 1.33 = 400
        position: 'relative',
    },
    slide: {
        width: width,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    pagination: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
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
        bottom: 16,
        right: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
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
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        backgroundColor: '#f1f5f9',
    },
    activeThumbnail: {
        borderColor: '#1152d4',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    }
});
