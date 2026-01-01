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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_HEIGHT = SCREEN_WIDTH * 1.3;

export const SLIDES = [
    {
        id: '1',
        title: 'DISCOVER YOUR\nSIGNATURE SCENT',
        subtitle: 'NEW ARRIVALS 2024',
        image: 'https://images.unsplash.com/photo-1594125354139-3f7315ff9f3c?q=80&w=1000&auto=format&fit=crop',
        cta: 'SHOP COLLECTION'
    },
    {
        id: '2',
        title: 'ELEGANCE IN\nEVERY DETAIL',
        subtitle: 'LIMITED EDITION',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
        cta: 'EXPLORE NOW'
    },
    {
        id: '3',
        title: 'MODERN CLASSICS\nREIMAGINED',
        subtitle: 'SUMMER ESSENTIALS',
        image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=1000&auto=format&fit=crop',
        cta: 'VIEW ALL'
    }
];

interface SlideItemProps {
    item: typeof SLIDES[0];
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

    return (
        <View style={styles.slide}>
            <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={[StyleSheet.absoluteFill, styles.overlay]} />
            </Animated.View>

            <View style={styles.content}>
                <Animated.Text
                    entering={FadeInUp.delay(200).duration(1000)}
                    style={styles.subtitle}
                >
                    {item.subtitle}
                </Animated.Text>
                <Animated.Text
                    entering={FadeInUp.delay(400).duration(1000)}
                    style={styles.title}
                >
                    {item.title}
                </Animated.Text>

                <Animated.View entering={FadeInUp.delay(600).duration(1000)}>
                    <Pressable style={styles.button}>
                        <Text style={styles.buttonText}>{item.cta}</Text>
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
};

interface HeroSliderProps {
    onIndexChange?: (index: number) => void;
}

export function HeroSlider({ onIndexChange }: HeroSliderProps) {
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

    return (
        <View style={styles.container}>
            <FlatList
                data={SLIDES}
                renderItem={({ item, index }) => (
                    <SlideItem item={item} index={index} scrollX={scrollX} />
                )}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                keyExtractor={(item) => item.id}
            />

            <View style={styles.navContainer}>
                <View style={styles.progressRow}>
                    <Text style={styles.navIndex}>0{activeIndex + 1}</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${((activeIndex + 1) / SLIDES.length) * 100}%` }]} />
                    </View>
                    <Text style={styles.navTotal}>0{SLIDES.length}</Text>
                </View>
                <Text style={styles.nextText}>NEXT: {SLIDES[(activeIndex + 1) % SLIDES.length].subtitle}</Text>
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
