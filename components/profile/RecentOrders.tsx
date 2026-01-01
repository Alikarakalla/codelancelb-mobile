import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function RecentOrders() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Recent Orders</Text>
                <Pressable>
                    <Text style={styles.viewAll}>View All</Text>
                </Pressable>
            </View>

            <View style={styles.list}>
                {/* Order 1 */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.orderInfo}>
                            <View style={styles.iconBox}>
                                <MaterialIcons name="inventory-2" size={24} color="#1152d4" />
                            </View>
                            <View>
                                <Text style={styles.orderNumber}>Order #24589</Text>
                                <Text style={styles.orderDate}>Oct 24, 2023</Text>
                            </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: isDark ? 'rgba(21, 128, 61, 0.3)' : '#dcfce7' }]}>
                            <Text style={[styles.statusText, { color: isDark ? '#4ade80' : '#15803d' }]}>Delivered</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.cardFooter}>
                        <Text style={styles.itemCount}>3 Items</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.price}>$124.50</Text>
                            <View style={styles.chevron}>
                                <MaterialIcons name="chevron-right" size={20} color={isDark ? '#9ca3af' : '#616f89'} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Order 2 */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.orderInfo}>
                            <View style={styles.iconBox}>
                                <MaterialIcons name="local-shipping" size={24} color="#f97316" />
                            </View>
                            <View>
                                <Text style={styles.orderNumber}>Order #24601</Text>
                                <Text style={styles.orderDate}>Nov 02, 2023</Text>
                            </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: isDark ? 'rgba(194, 65, 12, 0.3)' : '#ffedd5' }]}>
                            <Text style={[styles.statusText, { color: isDark ? '#fb923c' : '#c2410c' }]}>Shipped</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.cardFooter}>
                        <Text style={styles.itemCount}>1 Item</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.price}>$45.00</Text>
                            <View style={styles.chevron}>
                                <MaterialIcons name="chevron-right" size={20} color={isDark ? '#9ca3af' : '#616f89'} />
                            </View>
                        </View>
                    </View>
                </View>
            </View>
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
