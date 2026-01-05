import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth-context';
import { useRouter } from 'expo-router';
import { api } from '@/services/apiClient';
import { OrderSkeleton } from '@/components/profile/skeletons/OrderSkeleton';

export function RecentOrders() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders(1, true);
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchOrders = async (pageNum: number, isReset: boolean = false) => {
        try {
            if (!isReset) setLoadingMore(true);
            const response = await api.getOrders(pageNum);

            const newOrders = Array.isArray(response) ? response : (response.data || []);
            const lastPage = response.last_page || 1;

            setOrders(prev => isReset ? newOrders : [...prev, ...newOrders]);
            setHasMore(pageNum < lastPage);
            setPage(pageNum);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!hasMore || loadingMore) return;
        fetchOrders(page + 1);
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
            case 'completed':
                return {
                    bg: isDark ? 'rgba(21, 128, 61, 0.3)' : '#dcfce7',
                    text: isDark ? '#4ade80' : '#15803d',
                    icon: 'check-circle'
                };
            case 'shipped':
            case 'processing':
                return {
                    bg: isDark ? 'rgba(194, 65, 12, 0.3)' : '#ffedd5',
                    text: isDark ? '#fb923c' : '#c2410c',
                    icon: 'local-shipping'
                };
            case 'pending':
                return {
                    bg: isDark ? 'rgba(147, 51, 234, 0.3)' : '#f3e8ff',
                    text: isDark ? '#c084fc' : '#7e22ce',
                    icon: 'schedule'
                };
            case 'cancelled':
                return {
                    bg: isDark ? 'rgba(220, 38, 38, 0.3)' : '#fee2e2',
                    text: isDark ? '#f87171' : '#dc2626',
                    icon: 'cancel'
                };
            default:
                return {
                    bg: isDark ? 'rgba(107, 114, 128, 0.3)' : '#f3f4f6',
                    text: isDark ? '#9ca3af' : '#6b7280',
                    icon: 'info'
                };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (!isAuthenticated || !user) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={{ alignItems: 'center', padding: 24 }}>
                        <MaterialIcons name="receipt-long" size={48} color={isDark ? '#9ca3af' : '#616f89'} />
                        <Text style={[styles.title, { marginTop: 16, textAlign: 'center' }]}>Sign in to view your orders</Text>
                        <Pressable
                            style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#1152d4', borderRadius: 12 }}
                            onPress={() => router.push('/login')}
                        >
                            <Text style={{ color: '#fff', fontWeight: '700' }}>Sign In</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Recent Orders</Text>
                </View>
                <View style={styles.list}>
                    <OrderSkeleton />
                    <OrderSkeleton />
                    <OrderSkeleton />
                </View>
            </View>
        );
    }

    if (orders.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Recent Orders</Text>
                </View>
                <View style={styles.card}>
                    <View style={{ alignItems: 'center', padding: 24 }}>
                        <MaterialIcons name="shopping-bag" size={48} color={isDark ? '#9ca3af' : '#616f89'} />
                        <Text style={[styles.orderDate, { marginTop: 16, textAlign: 'center' }]}>No orders yet</Text>
                    </View>
                </View>
            </View>
        );
    }

    const renderOrder = ({ item }: { item: any }) => {
        const statusInfo = getStatusColor(item.status);
        const itemCount = item.items?.length || 0;
        const totalAmount = parseFloat(item.total_amount || 0);

        return (
            <Pressable
                style={styles.card}
                onPress={() => router.push({ pathname: '/modal/order-details', params: { id: item.id } })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.orderInfo}>
                        <View style={styles.iconBox}>
                            <MaterialIcons name={statusInfo.icon as any} size={24} color={statusInfo.text} />
                        </View>
                        <View>
                            <Text style={styles.orderNumber}>Order #{item.id}</Text>
                            <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                        <Text style={[styles.statusText, { color: statusInfo.text }]}>{item.status}</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.cardFooter}>
                    <Text style={styles.itemCount}>{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>${totalAmount.toFixed(2)}</Text>
                        <View style={styles.chevron}>
                            <MaterialIcons name="chevron-right" size={20} color={isDark ? '#9ca3af' : '#616f89'} />
                        </View>
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Recent Orders</Text>

            </View>

            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.list}
                ListFooterComponent={
                    <View style={{ marginTop: 8 }}>
                        {loadingMore ? (
                            <OrderSkeleton />
                        ) : hasMore ? (
                            <Pressable
                                onPress={handleLoadMore}
                                style={({ pressed }) => ({
                                    backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                                    padding: 12,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    opacity: pressed ? 0.7 : 1
                                })}
                            >
                                <Text style={{
                                    color: isDark ? '#fff' : '#111827',
                                    fontWeight: '600'
                                }}>Load Older Orders</Text>
                            </Pressable>
                        ) : null}
                    </View>
                }
            />
        </View>
    );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        gap: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: isDark ? '#fff' : '#111318',
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1152d4',
    },
    list: {
        gap: 12,
    },
    card: {
        backgroundColor: isDark ? '#1a2230' : '#ffffff',
        borderRadius: 16,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#f3f4f6',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    orderInfo: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: isDark ? '#fff' : '#111318',
    },
    orderDate: {
        fontSize: 14,
        color: isDark ? '#9ca3af' : '#616f89',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 99,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    divider: {
        height: 1,
        backgroundColor: isDark ? '#374151' : '#f3f4f6',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemCount: {
        fontSize: 14,
        fontWeight: '500',
        color: isDark ? '#9ca3af' : '#616f89',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: isDark ? '#fff' : '#111318',
    },
    chevron: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
    },
});
