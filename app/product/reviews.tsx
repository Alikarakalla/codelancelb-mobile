import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { GlobalHeader } from '@/components/ui/GlobalHeader'; 
import { useDrawer } from '@/hooks/use-drawer-context';
import { RatingSummary } from '@/components/reviews/RatingSummary';
import { ReviewFilters } from '@/components/reviews/ReviewFilters';
import { ReviewItem } from '@/components/reviews/ReviewItem';
import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { api } from '@/services/apiClient';
import { Product, ProductReview } from '@/types/schema';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Skeleton Component
function ReviewsSkeleton() {
    return (
        <View style={{ padding: 20 }}>
            {/* Summary Skeleton */}
            <View style={{ flexDirection: 'row', gap: 20, marginBottom: 30 }}>
                <View style={{ width: 100, height: 100, borderRadius: 12, backgroundColor: '#F1F5F9' }} />
                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <View key={i} style={{ width: '100%', height: 8, borderRadius: 4, backgroundColor: '#F1F5F9' }} />
                    ))}
                </View>
            </View>

            {/* Filters Skeleton */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 30 }}>
                {[1, 2, 3].map(i => (
                    <View key={i} style={{ width: 80, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9' }} />
                ))}
            </View>

            {/* Reviews List Skeleton */}
            {[1, 2, 3].map(i => (
                <View key={i} style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9' }} />
                            <View style={{ gap: 6 }}>
                                <View style={{ width: 120, height: 14, borderRadius: 4, backgroundColor: '#F1F5F9' }} />
                                <View style={{ width: 80, height: 12, borderRadius: 4, backgroundColor: '#F1F5F9' }} />
                            </View>
                        </View>
                        <View style={{ width: 60, height: 12, borderRadius: 4, backgroundColor: '#F1F5F9' }} />
                    </View>
                    <View style={{ gap: 8 }}>
                        <View style={{ width: '100%', height: 14, borderRadius: 4, backgroundColor: '#F1F5F9' }} />
                        <View style={{ width: '80%', height: 14, borderRadius: 4, backgroundColor: '#F1F5F9' }} />
                    </View>
                </View>
            ))}
        </View>
    );
}

export default function ProductReviewsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { openDrawer } = useDrawer();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [product, setProduct] = React.useState<Product | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (id) {
            const fetchProductData = async () => {
                setLoading(true);
                try {
                    const productId = Array.isArray(id) ? id[0] : id;
                    const data = await api.getProduct(productId);
                    setProduct(data);
                } catch (error) {
                    console.error('Failed to load product reviews:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProductData();
        }
    }, [id]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Calculate dynamic stats
    const stats = React.useMemo(() => {
        const reviews = product?.reviews || [];
        if (!reviews.length) return { average: 0, count: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        const average = total / reviews.length;
        const distribution = reviews.reduce((acc, r) => {
            acc[r.rating] = (acc[r.rating] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return { average, count: reviews.length, distribution };
    }, [product]);

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: product?.name_en || product?.name || '', // Empty fallback to avoid "Reviews" flicker
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: isDark ? '#000' : '#fff' },
                    headerTitleStyle: { color: isDark ? '#fff' : '#000', fontSize: 16, fontWeight: '600' },
                    headerLeft: () => (
                        <Pressable
                            onPress={() => router.back()}
                            style={styles.nativeGlassWrapper}
                        >
                            <IconSymbol
                                name="chevron.left"
                                color={isDark ? '#fff' : '#000'}
                                size={24}
                                weight="medium"
                            />
                        </Pressable>
                    ),
                    headerBackVisible: false, // Hide default back button
                    // iOS Native Glass Header BG
                    ...Platform.select({
                        ios: {
                            headerTransparent: true,
                            headerBlurEffect: isDark ? 'dark' : 'regular',
                        }
                    })
                }}
            />

            <ScrollView contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: 100 }}>
                {loading ? (
                    <ReviewsSkeleton />
                ) : (
                    <>
                        <RatingSummary
                            rating={stats.average}
                            reviewCount={stats.count}
                            distribution={stats.distribution as any}
                        />

                        <View style={{ height: 24 }} />
                        {/* Filters might arguably be fake for now if API doesn't support them */}
                        <ReviewFilters />

                        <View style={styles.list}>
                            {(product?.reviews?.length || 0) === 0 ? (
                                <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>No reviews yet.</Text>
                            ) : (
                                product!.reviews!.map((r) => (
                                    <ReviewItem
                                        key={r.id}
                                        author={r.user?.name || 'Anonymous'}
                                        initials={r.user?.name ? r.user.name.substring(0, 2).toUpperCase() : 'AN'}
                                        date={formatDate(r.created_at)}
                                        rating={r.rating}
                                        text={r.review}
                                        helpfulCount={0} // Not in API yet
                                        colorClass="#DBEAFE" // Random or fixed
                                    />
                                ))
                            )}
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Write Review Footer */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <Pressable style={styles.writeButton}>
                    <Ionicons name="create-outline" size={20} color="#fff" />
                    <Text style={styles.writeText}>Write a Review</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    productSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748B',
        textAlign: 'center',
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    list: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingHorizontal: 20,
        paddingTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10,
    },
    writeButton: {
        height: 56,
        backgroundColor: '#1152d4',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#1152d4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    writeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    nativeGlassWrapper: {
        width: 20,
        height: 20,
        borderRadius: 50,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: 'transparent',
                marginHorizontal: 8,
            },
            android: {
                backgroundColor: 'rgba(0,0,0,0.05)',
                marginHorizontal: 8,
            }
        })
    },
});
