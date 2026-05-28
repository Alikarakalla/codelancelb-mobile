import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking } from 'react-native';
import { CarouselSlide } from '@/types/schema';
import { resolveInternalUrl } from '@/utils/resolveInternalUrl';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AUTOPLAY_DELAY = 5000;
const HERO_HEIGHT = Math.max(560, Math.min(720, SCREEN_HEIGHT * 0.8));

type NormalizedSlide = {
    id: string;
    title: string;
    subtitle: string;
    eyebrowLogo?: string | null;
    eyebrowText?: string | null;
    imageDesktop?: string | null;
    imageMobile?: string | null;
    ctaText: string;
    ctaUrl?: string | null;
    overlayStyle: string;
};

const getFirst = (...values: Array<string | null | undefined>) =>
    values.find(value => typeof value === 'string' && value.trim().length > 0)?.trim() || '';

const normalizeSlides = (slides: CarouselSlide[] = []): NormalizedSlide[] =>
    slides
        .map((slide, index) => ({
            id: String(slide.id || `carousel-2-${index}`),
            title: getFirst(slide.title, slide.title_en),
            subtitle: getFirst(slide.subtitle, slide.subtitle_en),
            eyebrowLogo: getFirst(slide.eyebrowLogo, slide.logo, slide.logo_url, slide.brand_logo) || null,
            eyebrowText: getFirst(slide.eyebrowText),
            imageDesktop: getFirst(slide.image_desktop),
            imageMobile: getFirst(slide.image_mobile, slide.image_desktop),
            ctaText: getFirst(slide.cta_text, slide.cta_text_en, 'Shop now'),
            ctaUrl: getFirst(slide.cta_url) || null,
            overlayStyle: getFirst(slide.overlay_style) || 'gradient',
        }))
        .filter(slide => slide.imageMobile || slide.imageDesktop);

interface Carousel2HeroProps {
    slides: CarouselSlide[];
}

export function Carousel2Hero({ slides }: Carousel2HeroProps) {
    const router = useRouter();
    const flatListRef = useRef<FlatList<NormalizedSlide>>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const items = useMemo(() => normalizeSlides(slides), [slides]);

    useEffect(() => {
        if (paused || items.length <= 1) return;

        const timer = setTimeout(() => {
            const nextIndex = (activeIndex + 1) % items.length;
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setActiveIndex(nextIndex);
        }, AUTOPLAY_DELAY);

        return () => clearTimeout(timer);
    }, [activeIndex, items.length, paused]);

    const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        setActiveIndex(Math.max(0, Math.min(nextIndex, items.length - 1)));
    }, [items.length]);

    const handleCtaPress = (url?: string | null) => {
        if (!url || url === '#') {
            router.push('/shop');
            return;
        }

        const resolved = resolveInternalUrl(url);
        if (resolved) {
            router.push({ pathname: resolved.pathname as any, params: resolved.params });
            return;
        }

        // True external URL — open in the system browser (only when explicitly off-domain).
        Linking.openURL(url).catch(() => {
            router.push('/shop');
        });
    };

    if (!items.length) return null;

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={items}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                onMomentumScrollEnd={handleScrollEnd}
                renderItem={({ item, index }) => {
                    const imageUrl = item.imageMobile || item.imageDesktop || '';

                    return (
                        <View style={styles.slide}>
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.image}
                                contentFit="cover"
                                priority={index === 0 ? 'high' : 'normal'}
                            />
                            {item.overlayStyle === 'solid' ? (
                                <View style={styles.solidOverlay} />
                            ) : (
                                <LinearGradient
                                    colors={['rgba(0,0,0,0.14)', 'rgba(0,0,0,0.02)', 'rgba(0,0,0,0.34)']}
                                    locations={[0, 0.48, 1]}
                                    style={StyleSheet.absoluteFill}
                                />
                            )}

                            {(item.eyebrowLogo || item.eyebrowText) && (
                                <View style={styles.eyebrow}>
                                    {item.eyebrowLogo ? (
                                        <Image source={{ uri: item.eyebrowLogo }} style={styles.eyebrowLogo} contentFit="contain" />
                                    ) : (
                                        <Text style={styles.eyebrowText}>{item.eyebrowText}</Text>
                                    )}
                                </View>
                            )}

                            <View style={styles.copy}>
                                {items.length > 1 && (
                                    <View style={styles.controls}>
                                        <View style={styles.dots}>
                                            {items.map((dot, dotIndex) => (
                                                <Pressable
                                                    key={dot.id}
                                                    accessibilityRole="button"
                                                    accessibilityLabel={`Go to slide ${dotIndex + 1}`}
                                                    onPress={() => {
                                                        flatListRef.current?.scrollToIndex({ index: dotIndex, animated: true });
                                                        setActiveIndex(dotIndex);
                                                    }}
                                                    style={[styles.dot, dotIndex === activeIndex && styles.dotActive]}
                                                />
                                            ))}
                                        </View>
                                        <View style={styles.divider} />
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel={paused ? 'Play carousel' : 'Pause carousel'}
                                            onPress={() => setPaused(value => !value)}
                                            style={styles.pauseButton}
                                        >
                                            <MaterialIcons name={paused ? 'play-arrow' : 'pause'} size={14} color="#fff" />
                                        </Pressable>
                                    </View>
                                )}

                                {item.title ? <Text style={styles.title}>{item.title}</Text> : null}
                                {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}

                                {item.ctaText ? (
                                    <Pressable onPress={() => handleCtaPress(item.ctaUrl)} style={styles.cta}>
                                        <Text style={styles.ctaText}>{item.ctaText}</Text>
                                    </Pressable>
                                ) : null}
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: HERO_HEIGHT,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    slide: {
        width: SCREEN_WIDTH,
        height: HERO_HEIGHT,
        backgroundColor: '#111',
    },
    image: {
        ...StyleSheet.absoluteFillObject,
    },
    solidOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.18)',
    },
    eyebrow: {
        position: 'absolute',
        top: 34,
        left: 20,
        right: 20,
    },
    eyebrowLogo: {
        width: 180,
        height: 24,
    },
    eyebrowText: {
        color: 'rgba(255,255,255,0.78)',
        fontSize: 22,
        fontWeight: '700',
        fontStyle: 'italic',
        textTransform: 'uppercase',
    },
    copy: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 34,
        maxWidth: 520,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    dots: {
        flexDirection: 'row',
        gap: 10,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1.3,
        borderColor: 'rgba(255,255,255,0.48)',
    },
    dotActive: {
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.88)',
    },
    divider: {
        width: 1,
        height: 16,
        backgroundColor: 'rgba(255,255,255,0.24)',
    },
    pauseButton: {
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 27,
    },
    subtitle: {
        marginTop: 5,
        color: 'rgba(255,255,255,0.95)',
        fontSize: 14,
        lineHeight: 18,
    },
    cta: {
        alignSelf: 'flex-start',
        minHeight: 34,
        paddingHorizontal: 14,
        marginTop: 22,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.30)',
    },
    ctaText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },
});
