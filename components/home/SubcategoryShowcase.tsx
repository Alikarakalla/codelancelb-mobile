import React, { useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { Category } from '@/types/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Matches the web SubcategoryShowcase exactly:
 *   resources/js/components/storefront/home/SubcategoryShowcase.jsx
 *
 * Mobile layout (web's <768px breakpoint):
 *   - Single section heading (the eyebrow); no subtitle line
 *   - Image-only square cards (1:1), no text overlay
 *   - 3.15 cards visible per row, ~14px gap
 *   - Skinny progress bar at the bottom (web uses Swiper scrollbar)
 */

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 12; // web mobile uses padding: 0 12px on container
const GAP = 14;
const SLIDES_PER_VIEW = 3.15;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GAP * Math.floor(SLIDES_PER_VIEW)) / SLIDES_PER_VIEW;

interface SubcategoryShowcaseProps {
    items?: Category[];
    /** Section heading — e.g. "World Cup 2026". Falls back to the first item's parent name. */
    title?: string;
}

export function SubcategoryShowcase({ items = [], title }: SubcategoryShowcaseProps) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const validItems = useMemo(
        () => items.filter((item) => !!(item.image || item.thumbnail)),
        [items]
    );

    const scrollRef = useRef<FlatList>(null);
    const [scrollProgress, setScrollProgress] = useState(0); // 0..1

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const maxScroll = Math.max(contentSize.width - layoutMeasurement.width, 1);
        const next = Math.min(1, Math.max(0, contentOffset.x / maxScroll));
        setScrollProgress(next);
    };

    if (validItems.length === 0) return null;

    const headingText = title || validItems[0]?.parentName || 'Shop by Collection';

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <View style={styles.header}>
                <Text style={[styles.heading, isDark && styles.headingDark]}>{headingText}</Text>
            </View>

            <FlatList
                ref={scrollRef}
                horizontal
                data={validItems}
                keyExtractor={item => String(item.id)}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
                ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                renderItem={({ item }) => {
                    const imageUrl = item.image || item.thumbnail || undefined;
                    return (
                        <Pressable
                            style={[styles.card, isDark && styles.cardDark]}
                            onPress={() => {
                                router.push({
                                    pathname: '/shop',
                                    params: { sub_category_id: item.id, category: item.slug }
                                });
                            }}
                        >
                            {imageUrl ? (
                                <Image
                                    source={{ uri: imageUrl }}
                                    style={styles.image}
                                    contentFit="cover"
                                />
                            ) : null}
                        </Pressable>
                    );
                }}
            />

            {/* Mini scroll progress bar — mirrors web's swiper-scrollbar at 60% width / 2px height */}
            <View style={[styles.scrollbarTrack, isDark && styles.scrollbarTrackDark]}>
                <View
                    style={[
                        styles.scrollbarThumb,
                        isDark && styles.scrollbarThumbDark,
                        // Thumb width relative to visible portion (max 30%), positioned by progress.
                        { left: `${scrollProgress * 70}%` },
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 20,
        paddingBottom: 12,
        backgroundColor: '#fff',
    },
    containerDark: {
        backgroundColor: '#000',
    },
    header: {
        paddingHorizontal: HORIZONTAL_PADDING,
        marginBottom: 2,
    },
    heading: {
        color: '#0F0F0E',
        // Matches `home-section-title` weight/size used by other web sections.
        fontSize: 27,
        fontWeight: '700',
        letterSpacing: 0,
        paddingBottom: 10,
    },
    headingDark: {
        color: '#F8FAFC',
    },
    list: {
        paddingHorizontal: HORIZONTAL_PADDING,
    },
    card: {
        width: CARD_WIDTH,
        aspectRatio: 1,
        backgroundColor: '#F4F4F4',
        overflow: 'hidden',
        // No borderRadius — web's .stc-image-link sets border-radius: 0
    },
    cardDark: {
        backgroundColor: '#111827',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    scrollbarTrack: {
        marginTop: 18,
        alignSelf: 'center',
        width: '60%',
        height: 2,
        backgroundColor: '#E5E5E5',
        borderRadius: 999,
        overflow: 'hidden',
        position: 'relative',
    },
    scrollbarTrackDark: {
        backgroundColor: '#1F2937',
    },
    scrollbarThumb: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '30%',
        backgroundColor: '#000',
        borderRadius: 999,
    },
    scrollbarThumbDark: {
        backgroundColor: '#F8FAFC',
    },
});
