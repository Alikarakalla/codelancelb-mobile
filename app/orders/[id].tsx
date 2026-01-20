import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Platform, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { api } from '@/services/apiClient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ProductGridItem } from '@/components/product/ProductGridItem';

export default function OrderDetailsPage() {
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

    const resolveAddress = (o: any) => {
        let addr = o.shipping_address || o.address || o.billing_address;

        // Fix: Parse if it's a JSON string
        if (typeof addr === 'string') {
            try {
                addr = JSON.parse(addr);
            } catch (e) {
                console.warn('Failed to parse address JSON', e);
                // Return as an object with just one field if plain string
                return { address: addr };
            }
        }
        return addr;
    };

    const getShippingCost = (o: any) => {
        const val = o.shipping_amount || o.shipping_cost || o.shipping_fee || o.delivery_fee || 0;
        return parseFloat(String(val));
    };

    const shippingAddress = order ? resolveAddress(order) : null;
    const shippingCost = order ? getShippingCost(order) : 0;
    const orderItems = order?.items || order?.order_items || [];
    const statusInfo = order ? getStatusColor(order.status) : null;

    // Helper to safely get address fields
    const getAddrField = (addr: any, ...keys: string[]) => {
        if (!addr) return '';
        for (const key of keys) {
            if (addr[key]) return addr[key];
        }
        return '';
    };

    // Updated Mapping based on JSON: address, city, state, zip, country
    const addrName = shippingAddress ? (
        shippingAddress.first_name
            ? `${getAddrField(shippingAddress, 'first_name')} ${getAddrField(shippingAddress, 'last_name')}`
            : order.user?.name || order.email // Fallback to user name/email if address name is missing
    ) : '';

    const addrLine1 = getAddrField(shippingAddress, 'address', 'address_line_1', 'street');
    const addrLine2 = getAddrField(shippingAddress, 'address_line_2', 'address2', 'apartment');
    const addrCity = getAddrField(shippingAddress, 'city');
    const addrState = getAddrField(shippingAddress, 'state', 'province');
    const addrZip = getAddrField(shippingAddress, 'zip', 'postal_code', 'zip_code');
    const addrPhone = getAddrField(shippingAddress, 'phone') || order.phone; // Fallback to order phone

    return (
        <View style={[styles.container, isDark && { backgroundColor: '#000' }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <Stack.Screen
                options={{
                    headerShown: true,

                    headerTitle: order ? `Order #${order.order_number || order.id}` : 'Order Details',
                    headerShadowVisible: false,
                    headerTransparent: true,
                    headerStyle: { backgroundColor: isDark ? 'transparent' : 'transparent' },
                    headerTitleStyle: { color: isDark ? '#fff' : '#000', fontSize: 16, fontWeight: '600' },
                    headerLeft: () => (
                        <Pressable
                            onPress={() => router.back()}
                            style={{ padding: 4 }}
                        >
                            <IconSymbol
                                name="chevron.left"
                                color={isDark ? '#fff' : '#000'}
                                size={28}
                                weight="medium"
                            />
                        </Pressable>
                    ),
                    headerBackVisible: false,
                    headerBlurEffect: isDark ? 'dark' : 'regular', // Added blur effect for premium look with transparent header
                }}
            />

            <ScrollView
                style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}
                contentContainerStyle={{
                    flexGrow: 1,
                    padding: 20,
                    paddingTop: Platform.OS === 'ios' ? 120 : 100, // Add padding to clear transparent header
                    paddingBottom: 100,
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
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                            style={{ marginHorizontal: -20, marginBottom: 24 }}
                        >
                            {orderItems.length > 0 ? (
                                orderItems.map((item: any, index: number) => {

                                    // Logic to find variant info
                                    let variantInfo = [];

                                    // 1. Check direct fields on item
                                    if (item.size) variantInfo.push(`Size: ${item.size}`);
                                    if (item.color) variantInfo.push(`Color: ${item.color}`);

                                    // 2. Check options object (if parsed)
                                    if (item.product_options) {
                                        try {
                                            const opts = typeof item.product_options === 'string' ? JSON.parse(item.product_options) : item.product_options;
                                            Object.values(opts).forEach(v => { if (v) variantInfo.push(String(v)) });
                                        } catch (e) { }
                                    }

                                    // 3. Smart Fallback: If product has only ONE variant, assume that's it
                                    if (variantInfo.length === 0 && item.product?.variants?.length === 1) {
                                        const v = item.product.variants[0];
                                        if (v.size) variantInfo.push(`Size: ${v.size}`);
                                        if (v.color) variantInfo.push(`Color: ${v.color}`);
                                    }

                                    const fixedProduct = item.product ? {
                                        ...item.product,
                                        main_image: fixUrl(item.product.main_image)
                                    } : null;

                                    return (
                                        <View key={index} style={{ marginBottom: 16 }}>
                                            {fixedProduct ? (
                                                <ProductGridItem
                                                    product={fixedProduct}
                                                    onPress={() => router.push(`/(tabs)/shop/product/${item.product.id}` as any)}
                                                    hideActions={true}
                                                />
                                            ) : (
                                                <View style={{ width: 160, height: 200, backgroundColor: '#f0f0f0', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
                                                    <Text>Product Unavailable</Text>
                                                </View>
                                            )}

                                            {/* Order Specific Info Below Card */}
                                            <View style={{ marginTop: 4, width: 165, paddingHorizontal: 4 }}>
                                                <Text style={{ fontSize: 13, color: isDark ? '#ccc' : '#666', fontWeight: '500' }}>
                                                    Qty: {item.quantity} {variantInfo.length > 0 ? `• ${variantInfo.join(' • ')}` : ''}
                                                </Text>
                                                <Text style={{ fontSize: 13, color: isDark ? '#fff' : '#000', fontWeight: '700', marginTop: 2 }}>
                                                    Paid: ${parseFloat(item.price || 0).toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })
                            ) : (
                                <View style={{ padding: 16, width: 300 }}>
                                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>No items found in this order.</Text>
                                </View>
                            )}
                        </ScrollView>

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
                                    {shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Free'}
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
                                                {addrName}
                                            </Text>
                                            <Text style={[styles.addressText, isDark && { color: '#9ca3af' }]}>
                                                {addrLine1}
                                            </Text>
                                            {addrLine2 ? (
                                                <Text style={[styles.addressText, isDark && { color: '#9ca3af' }]}>
                                                    {addrLine2}
                                                </Text>
                                            ) : null}
                                            <Text style={[styles.addressText, isDark && { color: '#9ca3af' }]}>
                                                {addrCity}{addrState ? `, ${addrState}` : ''} {addrZip}
                                            </Text>
                                            {addrPhone ? (
                                                <Text style={[styles.addressText, isDark && { color: '#9ca3af' }]}>
                                                    {addrPhone}
                                                </Text>
                                            ) : null}
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
});
