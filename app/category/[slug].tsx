import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/apiClient';
import { Category } from '@/types/schema';

/**
 * Category landing page — when a top-level category has subcategories, this page
 * shows them as cards (so the user picks which subcategory to drill into). When
 * the category has no subcategories, we redirect to /shop with the category filter.
 *
 * Same visual idiom as the SubcategoryShowcase carousel on home, but rendered as
 * a grid because the user explicitly opened this category.
 */

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GAP) / 2;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.05);

export default function CategoryPage() {
    const router = useRouter();
    const params = useLocalSearchParams<{ slug?: string; id?: string }>();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const slug = typeof params.slug === 'string' ? params.slug : '';
    const idParam = typeof params.id === 'string' ? Number(params.id) : null;

    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [redirected, setRedirected] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const cats = await api.getCategories();
                if (!cancelled) setAllCategories(cats);
            } catch (err) {
                console.warn('Failed to load categories for category page:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    type Level = 'top' | 'sub' | 'subsub';

    // Walk the full tree and find the matching entity at any depth, returning
    // both the entity and which level it sits at so we can pick the right shop
    // filter (category_id / sub_category_id / sub_sub_category_id).
    const found = useMemo<{ entity: Category; level: Level } | null>(() => {
        if (!allCategories.length) return null;
        const matchSlug = (c: any) => slug && String(c.slug || '').toLowerCase() === slug.toLowerCase();
        const matchId = (c: any) => idParam != null && c.id === idParam;
        for (const cat of allCategories) {
            if (matchId(cat) || matchSlug(cat)) return { entity: cat, level: 'top' };
            for (const sub of cat.sub_categories || []) {
                if (matchId(sub) || matchSlug(sub)) return { entity: sub, level: 'sub' };
                for (const subsub of sub.sub_categories || sub.sub_sub_categories || []) {
                    if (matchId(subsub) || matchSlug(subsub)) return { entity: subsub, level: 'subsub' };
                }
            }
        }
        return null;
    }, [allCategories, slug, idParam]);

    const category = found?.entity || null;
    const level = found?.level || null;

    // Next-level children. For a top-level category these are sub_categories;
    // for a sub these are sub_sub_categories (which on this API are also surfaced
    // via the `sub_categories` field on the sub entity).
    const childCategories = useMemo<Category[]>(() => {
        if (!category) return [];
        const direct = category.sub_categories || [];
        const subsub = (category as any).sub_sub_categories || [];
        const all = [...direct, ...subsub];
        // Dedupe by id in case both arrays are populated.
        const seen = new Set<number>();
        return all.filter((c) => {
            if (!c?.id || seen.has(c.id)) return false;
            seen.add(c.id);
            return true;
        });
    }, [category]);

    // Pick the shop filter param matching the entity's level (so the user lands on
    // the right filtered grid when they reach a leaf with no deeper children).
    const shopFilterParams = useMemo(() => {
        if (!category) return {};
        if (level === 'top') return { category_id: String(category.id) };
        if (level === 'sub') return { sub_category_id: String(category.id) };
        if (level === 'subsub') return { sub_sub_category_id: String(category.id) };
        return { category_id: String(category.id) };
    }, [category, level]);

    // If the category has no children, drop the user straight onto a filtered shop view.
    useEffect(() => {
        if (loading || redirected) return;
        if (!category) return;
        if (childCategories.length > 0) return;
        setRedirected(true);
        router.replace({
            pathname: '/shop' as any,
            params: shopFilterParams,
        });
    }, [loading, category, childCategories.length, redirected, router, shopFilterParams]);

    const handleChildPress = (child: Category) => {
        // If this child has its own children, drill into another category page.
        // Otherwise route straight to the shop filtered by the right level.
        const childKids = [
            ...(child.sub_categories || []),
            ...((child as any).sub_sub_categories || []),
        ];
        if (childKids.length > 0) {
            router.push({
                pathname: '/category/[slug]' as any,
                params: {
                    slug: child.slug || String(child.id),
                    id: String(child.id),
                },
            });
            return;
        }
        // Leaf — go to shop with the child's own level filter.
        const childLevel: Level =
            level === 'top' ? 'sub' :
                level === 'sub' ? 'subsub' :
                    'subsub';
        const filter: Record<string, string> =
            childLevel === 'sub' ? { sub_category_id: String(child.id) } :
                { sub_sub_category_id: String(child.id) };
        router.push({
            pathname: '/shop' as any,
            params: { ...filter, category: child.slug || '' },
        });
    };

    const headerTitle = category?.name_en || category?.name || 'Category';

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTransparent: false,
                    headerTitle: () => (
                        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]} numberOfLines={1}>
                            {headerTitle}
                        </Text>
                    ),
                    headerTitleAlign: 'center',
                    headerStyle: { backgroundColor: isDark ? '#000' : '#fff' } as any,
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <Pressable
                            onPress={() => router.back()}
                            style={styles.backWrapper}
                        >
                            <IconSymbol name="chevron.left" color={isDark ? '#fff' : '#000'} size={24} weight="medium" />
                        </Pressable>
                    ),
                } as any}
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
                </View>
            ) : !category ? (
                <View style={styles.emptyBox}>
                    <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                        Category not found.
                    </Text>
                </View>
            ) : childCategories.length === 0 ? (
                // Briefly visible while the redirect effect fires.
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={isDark ? '#fff' : '#000'} />
                </View>
            ) : (
                <FlatList
                    data={childCategories}
                    keyExtractor={item => String(item.id)}
                    numColumns={2}
                    columnWrapperStyle={{ gap: GAP }}
                    contentContainerStyle={styles.gridContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View style={styles.intro}>
                            <Text style={[styles.title, isDark && styles.titleDark]}>{headerTitle}</Text>
                            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                                {level === 'sub'
                                    ? 'Choose a sub-category to browse'
                                    : 'Choose a subcategory to browse'}
                            </Text>
                        </View>
                    }
                    renderItem={({ item, index }) => {
                        const imageUrl = item.image || item.thumbnail || undefined;
                        return (
                            <Animated.View
                                entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(360)}
                                style={{ marginBottom: GAP }}
                            >
                                <Pressable
                                    onPress={() => handleChildPress(item)}
                                    style={[styles.card, isDark && styles.cardDark]}
                                >
                                    {imageUrl ? (
                                        <Image
                                            source={{ uri: imageUrl }}
                                            style={StyleSheet.absoluteFill}
                                            contentFit="cover"
                                            transition={250}
                                        />
                                    ) : null}
                                    <View style={styles.cardOverlay} />
                                    <View style={styles.cardCopy}>
                                        <Text style={styles.cardTitle} numberOfLines={2}>
                                            {item.name_en || item.name}
                                        </Text>
                                    </View>
                                </Pressable>
                            </Animated.View>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    containerDark: {
        backgroundColor: '#000',
    },
    backWrapper: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.3,
    },
    headerTitleDark: {
        color: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 14,
        color: '#64748B',
    },
    emptyTextDark: {
        color: '#94A3B8',
    },
    intro: {
        paddingHorizontal: 4,
        paddingTop: 8,
        paddingBottom: 18,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.5,
        lineHeight: 32,
        marginBottom: 6,
    },
    titleDark: {
        color: '#F8FAFC',
    },
    subtitle: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    subtitleDark: {
        color: '#94A3B8',
    },
    gridContent: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 12,
        paddingBottom: 32,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F4F4F4',
        justifyContent: 'flex-end',
    },
    cardDark: {
        backgroundColor: '#1F2937',
    },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.18)',
    },
    cardCopy: {
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: 12,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        lineHeight: 18,
    },
});
