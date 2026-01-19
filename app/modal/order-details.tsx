import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Platform, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { api } from '@/services/apiClient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function OrderDetailsModal() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadOrderDetails();
        }
    }, [id]);

    const loadOrderDetails = async () => {
        try {
            const rawId = Array.isArray(id) ? id[0] : id;
            const orderId = parseInt(rawId);

            if (isNaN(orderId)) {
                console.error('Invalid order ID:', id);
                setLoading(false);
                return;
            }

            const data = await api.getOrderDetails(orderId);
            setOrder(data);
        } catch (error) {
            console.error('Failed to load order details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fixUrl = (url?: string) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `https://sadekabdelsater.com/storage/${url}`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
            case 'completed':
                return { bg: '#dcfce7', text: '#15803d', icon: 'check-circle' };
            case 'shipped':
            case 'processing':
                return { bg: '#ffedd5', text: '#c2410c', icon: 'local-shipping' };
            case 'cancelled':
                return { bg: '#fee2e2', text: '#dc2626', icon: 'cancel' };
            default:
                return { bg: '#f3f4f6', text: '#4b5563', icon: 'schedule' };
        }
    };


    if (loading) {
        return (
            <View style={[styles.container, isDark && { backgroundColor: '#000' }]}>
                <Stack.Screen options={{ headerTitle: 'Loading Order...' }} />
                <View style={[styles.loadingContainer, isDark && { backgroundColor: '#000' }]}>
                    <ActivityIndicator size="large" color="#1152d4" />
                </View>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={[styles.container, isDark && { backgroundColor: '#000' }]}>
                <Stack.Screen options={{ headerTitle: 'Error' }} />
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                    <Text style={[styles.errorText, isDark && { color: '#fff' }]}>Failed to load order details</Text>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280', marginTop: 8 }}>Please try again later</Text>
                </View>
            </View>
        );
    }

    const statusInfo = order ? getStatusColor(order.status) : null;
    const shippingAddress = order?.shipping_address || order?.address;

    return (
        <View style={[styles.container, isDark && { backgroundColor: '#000' }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: order ? `Order #${order.id}` : 'Order Details',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: isDark ? '#000' : '#ffffff' },
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
                    headerBackVisible: false,
                    ...Platform.select({
                        ios: {
                            headerTransparent: true,
                            headerBlurEffect: isDark ? 'dark' : 'regular',
                        }
                    })
                }}
            />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingTop: Platform.OS === 'ios' ? insets.top + (order ? 60 : 100) : 80,
                    paddingBottom: 100,
                    paddingHorizontal: 20
                }}
                showsVerticalScrollIndicator={false}
            >
                {order && (
                    <>
                        {/* Status Card */}
                        <View style={[styles.card, isDark && { backgroundColor: '#111', borderColor: '#333' }]}>
                            <View style={styles.statusHeader}>
                                <View style={[styles.iconBox, { backgroundColor: isDark ? '#222' : statusInfo?.bg }]}>
                                    <MaterialIcons name={statusInfo?.icon as any} size={24} color={statusInfo?.text} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.statusTitle, isDark && { color: '#fff' }]}>Order {order.status}</Text>
                                    <Text style={styles.statusDate}>{formatDate(order.created_at)}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Items */}
                        <Text style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Items</Text>
                        <View style={[styles.card, isDark && { backgroundColor: '#111', borderColor: '#333' }, { padding: 0 }]}>
                            {order.items?.map((item: any, index: number) => {
                                const imageUrl = fixUrl(item.product?.main_image || item.image);
                                return (
                                    <View key={index} style={[styles.itemRow, index !== order.items.length - 1 && styles.borderBottom, isDark && { borderColor: '#333' }]}>
                                        <View style={styles.itemImageContainer}>
                                            {imageUrl ? (
                                                <Image
                                                    source={{ uri: imageUrl }}
                                                    style={styles.itemImage}
                                                />
                                            ) : (
                                                <View style={[styles.itemImage, { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }]}>
                                                    <Ionicons name="image-outline" size={20} color="#9ca3af" />
                                                </View>
                                            )}
                                        </View>
                                        <View style={{ flex: 1, gap: 4 }}>
                                            <Text style={[styles.itemName, isDark && { color: '#fff' }]} numberOfLines={2}>
                                                {item.product_name || item.name || 'Product'}
                                            </Text>
                                            <Text style={styles.itemVariant}>
                                                Qty: {item.quantity} {item.options ? `• ${Object.values(item.options).join(', ')}` : ''}
                                            </Text>
                                            <Text style={[styles.itemPrice, isDark && { color: '#fff' }]}>
                                                ${parseFloat(item.price).toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Summary */}
                        <Text style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Order Summary</Text>
                        <View style={[styles.card, isDark && { backgroundColor: '#111', borderColor: '#333' }]}>
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, isDark && { color: '#9ca3af' }]}>Subtotal</Text>
                                <Text style={[styles.summaryValue, isDark && { color: '#fff' }]}>${parseFloat(order.subtotal || order.total_amount).toFixed(2)}</Text>
                            </View>
                            {order.discount_amount > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={[styles.summaryLabel, isDark && { color: '#9ca3af' }]}>Discount</Text>
                                    <Text style={[styles.summaryValue, { color: '#ef4444' }]}>-${parseFloat(order.discount_amount).toFixed(2)}</Text>
                                </View>
                            )}
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, isDark && { color: '#9ca3af' }]}>Shipping</Text>
                                <Text style={[styles.summaryValue, isDark && { color: '#fff' }]}>
                                    {parseFloat(order.shipping_cost) > 0 ? `$${parseFloat(order.shipping_cost).toFixed(2)}` : 'Free'}
                                </Text>
                            </View>
                            <View style={[styles.divider, isDark && { backgroundColor: '#333' }]} />
                            <View style={styles.summaryRow}>
                                <Text style={[styles.totalLabel, isDark && { color: '#fff' }]}>Total</Text>
                                <Text style={[styles.totalValue, isDark && { color: '#fff' }]}>${parseFloat(order.total_amount).toFixed(2)}</Text>
                            </View>
                        </View>

                        {/* Shipping Address */}
                        {shippingAddress ? (
                            <>
                                <Text style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Shipping Address</Text>
                                <View style={[styles.card, isDark && { backgroundColor: '#111', borderColor: '#333' }]}>
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <Ionicons name="location-outline" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.addressName, isDark && { color: '#fff' }]}>
                                                {shippingAddress.first_name} {shippingAddress.last_name}
                                            </Text>
                                            <Text style={[styles.addressText, isDark && { color: '#9ca3af' }]}>
                                                {shippingAddress.address_line_1}
                                            </Text>
                                            {shippingAddress.address_line_2 && (
                                                <Text style={[styles.addressText, isDark && { color: '#9ca3af' }]}>
                                                    {shippingAddress.address_line_2}
                                                </Text>
                                            )}
                                            <Text style={[styles.addressText, isDark && { color: '#9ca3af' }]}>
                                                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
                                            </Text>
                                            <Text style={[styles.addressText, isDark && { color: '#9ca3af' }]}>
                                                {shippingAddress.phone}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Shipping Address</Text>
                                <View style={[styles.card, isDark && { backgroundColor: '#111', borderColor: '#333' }]}>
                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>No shipping address provided.</Text>
                                </View>
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginTop: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        textTransform: 'capitalize',
    },
    statusDate: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    itemRow: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    itemImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        backgroundColor: '#f9fafb',
    },
    itemImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    itemVariant: {
        fontSize: 13,
        color: '#6b7280',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        marginTop: 4,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    addressName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
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
