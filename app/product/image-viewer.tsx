import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MIN_ZOOM_SCALE = 1;
const MAX_ZOOM_SCALE = 3;
const ZOOM_STEP = 0.25;

function firstParam(param?: string | string[]) {
    return Array.isArray(param) ? param[0] : param;
}

function getIosMajorVersion() {
    if (Platform.OS !== 'ios') return 0;
    return Number(String(Platform.Version).split('.')[0] || 0);
}

export default function ProductImageViewerScreen() {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams<{
        images?: string | string[];
        image?: string | string[];
        index?: string | string[];
    }>();

    const supportsAppleZoomTransition = Platform.OS === 'ios' && getIosMajorVersion() >= 18;

    const images = useMemo(() => {
        const rawImages = firstParam(params.images);
        const fallbackImage = firstParam(params.image);

        if (rawImages) {
            try {
                const parsed = JSON.parse(rawImages);
                if (Array.isArray(parsed)) {
                    const valid = parsed.filter((item): item is string => typeof item === 'string' && item.length > 0);
                    if (valid.length > 0) {
                        return valid;
                    }
                }
            } catch {
                // Ignore malformed params and use fallback image.
            }
        }

        return fallbackImage ? [fallbackImage] : [];
    }, [params.image, params.images]);

    const initialIndex = useMemo(() => {
        const parsed = Number(firstParam(params.index) ?? 0);
        if (!Number.isFinite(parsed)) return 0;
        if (images.length === 0) return 0;
        return Math.max(0, Math.min(images.length - 1, parsed));
    }, [images.length, params.index]);

    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [zoomScale, setZoomScale] = useState(MIN_ZOOM_SCALE);
    const flatListRef = useRef<FlatList<string>>(null);
    const hasInitializedRef = useRef(false);
    const activeImage = images[activeIndex] || images[0] || null;

    React.useEffect(() => {
        if (hasInitializedRef.current) return;
        if (images.length === 0) return;

        hasInitializedRef.current = true;
        setActiveIndex(initialIndex);
        requestAnimationFrame(() => {
            flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
        });
    }, [images.length, initialIndex]);

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!width) return;
        const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        if (Number.isFinite(nextIndex) && nextIndex >= 0 && nextIndex < images.length) {
            setActiveIndex(nextIndex);
            setZoomScale(MIN_ZOOM_SCALE);
        }
    };

    const canZoomOut = zoomScale > MIN_ZOOM_SCALE;
    const canZoomIn = zoomScale < MAX_ZOOM_SCALE;
    const isImageSwipeEnabled = zoomScale <= MIN_ZOOM_SCALE + 0.001;

    const handleZoomIn = () => {
        setZoomScale((prev) => Math.min(MAX_ZOOM_SCALE, Number((prev + ZOOM_STEP).toFixed(2))));
    };

    const handleZoomOut = () => {
        setZoomScale((prev) => Math.max(MIN_ZOOM_SCALE, Number((prev - ZOOM_STEP).toFixed(2))));
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: false,
                    presentation: 'fullScreenModal',
                    gestureEnabled: true,
                    fullScreenGestureEnabled: true,
                    animationMatchesGesture: supportsAppleZoomTransition,
                    animation: supportsAppleZoomTransition ? 'default' : 'fade_from_bottom',
                }}
            />

            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <Pressable onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#fff" />
                </Pressable>
            </View>

            {images.length > 0 ? (
                <FlatList
                    ref={flatListRef}
                    data={images}
                    horizontal
                    pagingEnabled
                    scrollEnabled={isImageSwipeEnabled}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    onMomentumScrollEnd={handleMomentumScrollEnd}
                    getItemLayout={(_, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                    onScrollToIndexFailed={(info) => {
                        setTimeout(() => {
                            flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
                        }, 100);
                    }}
                    renderItem={({ item, index }) => (
                        <View style={[styles.slide, { width, height }]}>
                            <View
                                style={[
                                    styles.imageZoomContainer,
                                    {
                                        transform: [{ scale: index === activeIndex ? zoomScale : MIN_ZOOM_SCALE }],
                                    },
                                ]}
                            >
                                <Image
                                    source={{ uri: item }}
                                    style={[styles.image, { width, height }]}
                                    contentFit="contain"
                                />
                            </View>
                        </View>
                    )}
                />
            ) : null}

            {supportsAppleZoomTransition && activeImage ? (
                <View pointerEvents="none" style={styles.appleZoomTargetProxy}>
                    <Link.AppleZoomTarget>
                        <Image
                            source={{ uri: activeImage }}
                            style={[styles.appleZoomTargetImage, { width, height }]}
                            contentFit="contain"
                        />
                    </Link.AppleZoomTarget>
                </View>
            ) : null}

            {images.length > 0 ? (
                <View style={[styles.zoomControls, { bottom: Math.max(insets.bottom, 20) + 24 }]}>
                    <Pressable
                        onPress={handleZoomOut}
                        disabled={!canZoomOut}
                        style={[styles.zoomButton, !canZoomOut && styles.zoomButtonDisabled]}
                    >
                        <Ionicons name="remove" size={20} color="#fff" />
                    </Pressable>

                    <Pressable
                        onPress={handleZoomIn}
                        disabled={!canZoomIn}
                        style={[styles.zoomButton, !canZoomIn && styles.zoomButtonDisabled]}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                    </Pressable>
                </View>
            ) : null}

            {images.length > 1 ? (
                <View style={[styles.pagination, { bottom: Math.max(insets.bottom, 20) }]}>
                    {images.map((_, index) => (
                        <View
                            key={index}
                            style={[styles.dot, index === activeIndex ? styles.activeDot : styles.inactiveDot]}
                        />
                    ))}
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        alignItems: 'flex-end',
        paddingHorizontal: 16,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    slide: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageZoomContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    appleZoomTargetProxy: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0,
    },
    appleZoomTargetImage: {
        width: '100%',
        height: '100%',
    },
    zoomControls: {
        position: 'absolute',
        right: 16,
        flexDirection: 'row',
        gap: 10,
        zIndex: 20,
    },
    zoomButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    zoomButtonDisabled: {
        opacity: 0.4,
    },
    pagination: {
        position: 'absolute',
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
    },
    inactiveDot: {
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
});
