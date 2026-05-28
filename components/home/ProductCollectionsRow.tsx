import React, { useMemo } from 'react';
import {
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Matches web ProductCollections.jsx exactly:
 *   resources/js/components/storefront/home/ProductCollections.jsx
 *
 * Mobile breakpoint (web <768px) renders each card as a 355×474 banner with:
 *   - Full-bleed cover image
 *   - Dark gradient overlay across the bottom
 *   - Title (20px bold white), subtitle (14px white) bottom-left
 *   - "Shop Now" uppercase link with underline
 */

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDE_PADDING = 15;
// Web mobile card is 355×474 in a 375pt viewport. Scale proportionally so iPad/large
// phones don't end up with a card that's awkwardly small.
const CARD_WIDTH = Math.min(355, SCREEN_WIDTH - SIDE_PADDING * 2);
const CARD_HEIGHT = Math.round(CARD_WIDTH * (474 / 355));

export interface CollectionItem {
    id?: number | string;
    slug?: string;
    title?: string;
    subtitle?: string;
    image?: string;
    image_mobile?: string;
    products?: any[];
}

interface ProductCollectionsRowProps {
    collections?: CollectionItem[];
    heading?: string;
}

export function ProductCollectionsRow({ collections = [], heading }: ProductCollectionsRowProps) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const items = useMemo(
        () => collections.filter((c) => !!(c && (c.image || c.image_mobile))),
        [collections]
    );

    if (items.length === 0) return null;

    const headingText = heading || 'Shop by Collection';

    const handlePress = (collection: CollectionItem) => {
        // Send the collection through navigation so the collection page can render the banner
        // immediately without an extra round-trip. Mirrors the web getUrl() helper which sends
        // the user to /collection/{slug}.
        const slug = collection.slug || (collection.id ? String(collection.id) : '');
        if (!slug) return;
        try {
            const payload = JSON.stringify({
                id: collection.id,
                slug: collection.slug,
                title: collection.title,
                subtitle: collection.subtitle,
                image: collection.image,
                image_mobile: collection.image_mobile,
                products: collection.products || [],
            });
            router.push({
                pathname: '/collection/[slug]' as any,
                params: { slug, data: payload },
            });
        } catch {
            router.push({ pathname: '/collection/[slug]' as any, params: { slug } });
        }
    };

    return (
        <View style={[styles.section, isDark && styles.sectionDark]}>
            <View style={styles.header}>
                <Text style={[styles.heading, isDark && styles.headingDark]}>{headingText}</Text>
            </View>

            <FlatList
                horizontal
                data={items}
                keyExtractor={(item, idx) => String(item.id || item.slug || idx)}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
                ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
                snapToInterval={CARD_WIDTH + 15}
                decelerationRate="fast"
                renderItem={({ item, index }) => {
                    const imageUrl = item.image_mobile || item.image;
                    return (
                        <Pressable
                            onPress={() => handlePress(item)}
                            style={({ pressed }) => [
                                styles.card,
                                pressed && { opacity: 0.94 },
                            ]}
                        >
                            {imageUrl ? (
                                <Image
                                    source={{ uri: imageUrl }}
                                    style={StyleSheet.absoluteFill}
                                    contentFit="cover"
                                    transition={250}
                                    priority={index === 0 ? 'high' : 'normal'}
                                />
                            ) : null}

                            <LinearGradient
                                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
                                locations={[0.7543, 1]}
                                style={StyleSheet.absoluteFill}
                                pointerEvents="none"
                            />

                            <View style={styles.cardCopy}>
                                <View style={styles.textBlock}>
                                    <Text style={styles.cardTitle} numberOfLines={2}>
                                        {item.title || ''}
                                    </Text>
                                    {item.subtitle ? (
                                        <Text style={styles.cardSubtitle} numberOfLines={2}>
                                            {item.subtitle}
                                        </Text>
                                    ) : null}
                                </View>
                                <View style={styles.shopNowRow}>
                                    <Text style={styles.shopNow}>Shop Now</Text>
                                    <View style={styles.shopNowUnderline} />
                                </View>
                            </View>
                        </Pressable>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        paddingTop: 16,
        paddingBottom: 24,
        backgroundColor: '#fff',
    },
    sectionDark: {
        backgroundColor: '#000',
    },
    header: {
        paddingHorizontal: SIDE_PADDING,
        marginBottom: 16,
    },
    heading: {
        color: '#111',
        fontSize: 27,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    headingDark: {
        color: '#F8FAFC',
    },
    list: {
        paddingLeft: SIDE_PADDING,
        paddingRight: SIDE_PADDING,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: '#000',
        justifyContent: 'flex-end',
    },
    cardCopy: {
        paddingHorizontal: 24,
        paddingBottom: 16,
        gap: 20,
        zIndex: 2,
    },
    textBlock: {
        gap: 8,
    },
    cardTitle: {
        margin: 0,
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 24,
    },
    cardSubtitle: {
        margin: 0,
        color: '#fff',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 18,
    },
    shopNowRow: {
        alignSelf: 'flex-start',
    },
    shopNow: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        lineHeight: 22,
    },
    shopNowUnderline: {
        height: 1,
        backgroundColor: '#fff',
        width: '100%',
    },
});
