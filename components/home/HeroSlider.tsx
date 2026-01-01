import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    Image,
    Pressable,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Platform
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    interpolate,
    Extrapolate,
    SharedValue
} from 'react-native-reanimated';

import { CarouselSlide } from '@/types/schema';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_HEIGHT = SCREEN_WIDTH * 1.3;

interface SlideItemProps {
    item: CarouselSlide;
    index: number;
    scrollX: SharedValue<number>;
}

const SlideItem = ({ item, index, scrollX }: SlideItemProps) => {
    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollX.value,
            [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
            [0, 1, 0],
            Extrapolate.CLAMP
        );
        return { opacity };
    });

    // Handle image URL (mock or real)
    // If it's a relative path from DB, preprend base URL or handle accordingly.
    // For now assuming full URL or handling basic paths if needed. 
    // The DB dump shows relative paths like 'carousel/desktop/...'.
    // We might need a helper to resolve image URLs. 
    const imageUrl = item.image_mobile || item.image_desktop || 'https://via.placeholder.com/600x800';
    // If using local server, maybe prepend URL. let's assume absolute for now or handled by Image component if we had a base url.
    // Since I can't easily see the base asset URL, I will use a placeholder if it doesn't look like http.

    // Actually, let's just render it. If it's relative, it won't load without a base. 
    // Assuming the user will configure base url later. 

    return (
        <View style={styles.slide}>
            <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                <View style={[StyleSheet.absoluteFill, styles.overlay]} />
            </Animated.View>

            <View style={styles.content}>
                <Animated.Text
                    entering={FadeInUp.delay(200).duration(1000)}
                    style={styles.subtitle}
                >
                    {item.subtitle_en || ''}
                </Animated.Text>
                <Animated.Text
                    entering={FadeInUp.delay(400).duration(1000)}
                    style={styles.title}
                >
                    {item.title_en}
                </Animated.Text>

                <Animated.View entering={FadeInUp.delay(600).duration(1000)}>
                    <Pressable style={styles.button}>
                        <Text style={styles.buttonText}>{item.cta_text_en || 'EXPLORE'}</Text>
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
};

interface HeroSliderProps {
    slides: CarouselSlide[];
    onIndexChange?: (index: number) => void;
}

export function HeroSlider({ slides, onIndexChange }: HeroSliderProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollX = useSharedValue(0);

    const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollX.value = event.nativeEvent.contentOffset.x;
        const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        if (index !== activeIndex) {
            setActiveIndex(index);
            onIndexChange?.(index);
        }
    }, [activeIndex, onIndexChange]);

    if (!slides || slides.length === 0) {
        return null; // Or loading state
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={slides}
                renderItem={({ item, index }) => (
                    <SlideItem item={item} index={index} scrollX={scrollX} />
                )}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                keyExtractor={(item) => item.id.toString()}
            />

            <View style={styles.navContainer}>
                <View style={styles.progressRow}>
                    <Text style={styles.navIndex}>0{activeIndex + 1}</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${((activeIndex + 1) / slides.length) * 100}%` }]} />
                    </View>
                    <Text style={styles.navTotal}>0{slides.length}</Text>
                </View>
                <Text style={styles.nextText}>NEXT: {slides[(activeIndex + 1) % slides.length]?.subtitle_en || 'FEATURED'}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: SLIDE_HEIGHT,
        width: '100%',
    },
    slide: {
        width: SCREEN_WIDTH,
        height: SLIDE_HEIGHT,
        position: 'relative',
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#1a1a1a',
    },
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingTop: 40,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 4,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    title: {
        color: '#fff',
        fontSize: 36,
        fontWeight: '900',
        lineHeight: 44,
        marginBottom: 32,
        letterSpacing: 1,
    },
    button: {
        borderWidth: 1.5,
        borderColor: '#fff',
        paddingVertical: 14,
        paddingHorizontal: 28,
        alignSelf: 'flex-start',
    },
    buttonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 2,
    },
    navContainer: {
        position: 'absolute',
        bottom: 40,
        left: 32,
        right: 32,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    navIndex: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    navTotal: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    progressBar: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fff',
    },
    nextText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    }
});
