import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Image, StyleSheet, SafeAreaView, Switch, Platform, KeyboardAvoidingView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlobalHeader } from '@/components/ui/GlobalHeader';
import { Address, Coupon } from '@/types/schema';
import { useCart } from '@/hooks/use-cart-context';
import { api } from '@/services/apiClient';

// Mock Addresses
const MOCK_ADDRESSES: Address[] = [
    {
        id: 1,
        user_id: 1,
        label: 'Home',
        first_name: 'John',
        last_name: 'Doe',
        address_line_1: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip_code: '10001',
        country: 'United States',
        phone: '+1 234 567 8900',
        is_default: true,
    },
    {
        id: 2,
        user_id: 1,
        label: 'Office',
        first_name: 'John',
        last_name: 'Doe',
        address_line_1: '456 Corporate Blvd',
        address_line_2: 'Suite 200',
        city: 'Seattle',
        state: 'WA',
        zip_code: '98101',
        country: 'United States',
        phone: '+1 987 654 3210',
        is_default: false,
    }
];

export default function CheckoutScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();
    const { items, cartTotal } = useCart();

    const [paymentMethod, setPaymentMethod] = useState<'cod'>('cod');
    const [isSummaryOpen, setIsSummaryOpen] = useState(false); // Collapsed by default like Shopify mobile
    const [isUsingSavedAddress, setIsUsingSavedAddress] = useState(true);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(1);

    // Discount Logic
    const [discountCode, setDiscountCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    const handleApplyCoupon = async () => {
        if (!discountCode.trim()) return;
        setIsValidatingCoupon(true);
        try {
            const coupon = await api.validateCoupon(discountCode);
            setAppliedCoupon(coupon);
            setDiscountCode(''); // Clear input on success
            Alert.alert('Success', `Coupon "${coupon.code}" applied!`);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Invalid coupon code');
            setAppliedCoupon(null);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
    };

    // Calculations
    const subtotal = cartTotal;

    // Calculate Discount Amount
    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percentage') {
            discountAmount = (subtotal * appliedCoupon.value) / 100;
        } else if (appliedCoupon.type === 'fixed') {
            discountAmount = appliedCoupon.value;
        } else if (appliedCoupon.type === 'free_shipping') {
            discountAmount = 0; // handled in shipping cost logic
        }
    }

    const shippingCost = (appliedCoupon?.type === 'free_shipping') ? 0 : (subtotal > 300 ? 0 : 10); // Mock shipping rule
    const taxes = Math.max(0, (subtotal - discountAmount) * 0.05); // Mock 5% tax
    const total = Math.max(0, subtotal - discountAmount + shippingCost + taxes);

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <GlobalHeader
                title="CHECKOUT"
                showBack
                alwaysShowTitle
                showWishlist={false}
                showShare={false}
                showCart={false}
            />

            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingTop: 60 + insets.top,
                        paddingBottom: 100
                    }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Order Summary (Top) */}
                < View style={[styles.summarySection, isDark && styles.summarySectionDark]} >
                    <Pressable onPress={() => setIsSummaryOpen(!isSummaryOpen)} style={styles.summaryHeader}>
                        <View style={styles.flexRow}>
                            <Text style={[styles.summaryTitle, isDark && styles.textDark]}>
                                {isSummaryOpen ? 'Hide order summary' : 'Show order summary'}
                            </Text>
                            <MaterialIcons
                                name={isSummaryOpen ? "expand-less" : "expand-more"}
                                size={20}
                                color={isDark ? "#94A3B8" : "#64748B"}
                            />
                        </View>
                        <Text style={[styles.summaryTotal, isDark && styles.textDark]}>${total.toFixed(2)}</Text>
                    </Pressable>

                    {isSummaryOpen && (
                        <View style={{ marginTop: 16 }}>
                            <View style={styles.cartItems}>
                                {items.map((item) => {
                                    // Find variant details for display
                                    const variant = item.product?.variants?.find(v => v.slug === item.variant_key);
                                    const image = variant?.image_path || item.product?.main_image || '';
                                    let details = '';
                                    if (variant) {
                                        details = [variant.color, variant.size].filter(Boolean).join(' / ');
                                    } else if (item.options) {
                                        // Fallback if options stored directly
                                        details = Object.values(item.options).join(' / ');
                                    }

                                    return (
                                        <View key={item.id} style={styles.cartItem}>
                                            <View style={[styles.itemImageWrapper, isDark && styles.itemImageWrapperDark]}>
                                                <Image source={{ uri: image }} style={styles.itemImage} />
                                                <View style={styles.qtyBadge}>
                                                    <Text style={styles.qtyText}>{item.qty}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.itemDetails}>
                                                <Text style={[styles.itemTitle, isDark && styles.textDark]} numberOfLines={1}>
                                                    {item.product?.name_en || item.product?.name}
                                                </Text>
                                                <Text style={[styles.itemVariant, isDark && styles.textGrayDark]}>{details}</Text>
                                            </View>
                                            <Text style={[styles.itemPrice, isDark && styles.textDark]}>
                                                ${(item.price * item.qty).toFixed(2)}
                                            </Text>
                                        </View>
                                    )
                                })}
                            </View>

                            <View style={styles.codeRow}>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark, { flex: 1, marginBottom: 0 }]}
                                    placeholder="Discount code"
                                    placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                                    value={discountCode}
                                    onChangeText={setDiscountCode}
                                    autoCapitalize="none"
                                />
                                <Pressable
                                    style={[styles.applyButton, isDark && styles.applyButtonDark, (isValidatingCoupon || !discountCode) && { opacity: 0.5 }]}
                                    onPress={handleApplyCoupon}
                                    disabled={isValidatingCoupon || !discountCode}
                                >
                                    {isValidatingCoupon ? (
                                        <ActivityIndicator color={isDark ? "#fff" : "#000"} size="small" />
                                    ) : (
                                        <Text style={[styles.applyButtonText, isDark && styles.textGrayDark]}>Apply</Text>
                                    )}
                                </Pressable>
                            </View>

                            {/* Applied Coupon Chip */}
                            {appliedCoupon && (
                                <View style={styles.couponChip}>
                                    <MaterialIcons name="local-offer" size={16} color="#000" />
                                    <Text style={styles.couponText}>{appliedCoupon.code} Applied</Text>
                                    <Pressable onPress={handleRemoveCoupon}>
                                        <MaterialIcons name="close" size={16} color="#64748B" />
                                    </Pressable>
                                </View>
                            )}

                            <View style={[styles.costBreakdown, isDark && styles.costBreakdownDark]}>
                                <View style={styles.costRow}>
                                    <Text style={[styles.costLabel, isDark && styles.textGrayDark]}>Subtotal</Text>
                                    <Text style={[styles.costValue, isDark && styles.textDark]}>${subtotal.toFixed(2)}</Text>
                                </View>
                                {discountAmount > 0 && (
                                    <View style={styles.costRow}>
                                        <Text style={[styles.costLabel, isDark && styles.textGrayDark]}>Discount</Text>
                                        <Text style={[styles.costValue, { color: '#ef4444' }]}>-${discountAmount.toFixed(2)}</Text>
                                    </View>
                                )}
                                <View style={styles.costRow}>
                                    <View style={styles.flexRow}>
                                        <Text style={[styles.costLabel, isDark && styles.textGrayDark]}>Shipping</Text>
                                    </View>
                                    <Text style={[styles.costValue, isDark && styles.textDark]}>
                                        {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                                    </Text>
                                </View>
                                <View style={styles.costRow}>
                                    <Text style={[styles.costLabel, isDark && styles.textGrayDark]}>Estimated Taxes</Text>
                                    <Text style={[styles.costValue, isDark && styles.textDark]}>${taxes.toFixed(2)}</Text>
                                </View>
                            </View>

                            <View style={[styles.totalRow, isDark && styles.totalRowDark]}>
                                <Text style={[styles.totalLabel, isDark && styles.textDark]}>Total</Text>
                                <View style={styles.flexRow}>
                                    <Text style={[styles.currency, isDark && styles.textGrayDark]}>USD</Text>
                                    <Text style={[styles.totalValue, isDark && styles.textDark]}>${total.toFixed(2)}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Contact Info */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Contact</Text>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, isDark && styles.labelDark]}>Email or mobile phone number</Text>
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            placeholder="email@example.com"
                            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                        />
                    </View>
                </View>

                {/* Shipping Address */}
                < View style={styles.section} >
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Shipping address</Text>
                        {MOCK_ADDRESSES.length > 0 && (
                            <Pressable onPress={() => setIsUsingSavedAddress(!isUsingSavedAddress)}>
                                <Text style={styles.linkButton}>
                                    {isUsingSavedAddress ? 'Enter new address' : 'Select saved address'}
                                </Text>
                            </Pressable>
                        )}
                    </View>

                    {
                        isUsingSavedAddress && MOCK_ADDRESSES.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.addressList}>
                                {MOCK_ADDRESSES.map((addr) => {
                                    const isSelected = selectedAddressId === addr.id;
                                    return (
                                        <Pressable
                                            key={addr.id}
                                            onPress={() => setSelectedAddressId(addr.id)}
                                            style={[
                                                styles.addressCard,
                                                isDark && styles.addressCardDark,
                                                isSelected && styles.addressCardSelected
                                            ]}
                                        >
                                            <View style={styles.addressHeader}>
                                                <MaterialIcons
                                                    name={addr.label === 'Home' ? 'home' : 'work'}
                                                    size={20}
                                                    color={isSelected ? '#000' : (isDark ? '#94A3B8' : '#64748B')}
                                                />
                                                <Text style={[styles.addressLabel, isDark && styles.textDark, isSelected && styles.textPrimary]}>
                                                    {addr.label}
                                                </Text>
                                                {isSelected && (
                                                    <View style={styles.checkCircle}>
                                                        <MaterialIcons name="check" size={14} color="#fff" />
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={[styles.addressText, isDark && styles.textGrayDark]}>
                                                {addr.first_name} {addr.last_name}
                                            </Text>
                                            <Text style={[styles.addressText, isDark && styles.textGrayDark]} numberOfLines={2}>
                                                {addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ''}
                                            </Text>
                                            <Text style={[styles.addressText, isDark && styles.textGrayDark]}>
                                                {addr.city}, {addr.zip_code}
                                            </Text>
                                            <Text style={[styles.addressText, isDark && styles.textGrayDark]}>
                                                {addr.phone}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        ) : (
                            <View>
                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, isDark && styles.labelDark]}>First name</Text>
                                        <TextInput
                                            style={[styles.input, isDark && styles.inputDark]}
                                            placeholder="John"
                                            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, isDark && styles.labelDark]}>Last name</Text>
                                        <TextInput
                                            style={[styles.input, isDark && styles.inputDark]}
                                            placeholder="Doe"
                                            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                                        />
                                    </View>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, isDark && styles.labelDark]}>Address</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={[styles.input, isDark && styles.inputDark, { paddingLeft: 40 }]}
                                            placeholder="Address"
                                            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                                        />
                                        <MaterialIcons name="search" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                    </View>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, isDark && styles.labelDark]}>Apartment, suite, etc. (optional)</Text>
                                    <TextInput
                                        style={[styles.input, isDark && styles.inputDark]}
                                        placeholder="Apt 101"
                                        placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                                    />
                                </View>
                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, isDark && styles.labelDark]}>City</Text>
                                        <TextInput
                                            style={[styles.input, isDark && styles.inputDark]}
                                            placeholder="New York"
                                            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { width: 100 }]}>
                                        <Text style={[styles.label, isDark && styles.labelDark]}>Zip code</Text>
                                        <TextInput
                                            style={[styles.input, isDark && styles.inputDark]}
                                            placeholder="10001"
                                            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                                        />
                                    </View>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, isDark && styles.labelDark]}>Country/Region</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={[styles.input, isDark && styles.inputDark]}
                                            value="United States"
                                            editable={false}
                                        />
                                        <MaterialIcons name="expand-more" size={20} color="#9CA3AF" style={[styles.inputIcon, { left: undefined, right: 12 }]} />
                                    </View>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, isDark && styles.labelDark]}>Phone</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={[styles.input, isDark && styles.inputDark, { paddingLeft: 40 }]}
                                            placeholder="(555) 555-5555"
                                            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                                            keyboardType="phone-pad"
                                        />
                                        <MaterialIcons name="call" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                    </View>
                                </View>
                            </View>
                        )
                    }
                </View >

                {/* Payment */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Payment</Text>
                        <View style={styles.secureBadge}>
                            <MaterialIcons name="lock" size={14} color="#9CA3AF" />
                            <Text style={styles.secureText}>SECURE</Text>
                        </View>
                    </View>

                    <View style={[styles.radioGroup, isDark && styles.radioGroupDark, { marginBottom: 16 }]}>
                        {/* COD (Cash on Delivery) - ONLY OPTION */}
                        <Pressable
                            style={[styles.radioItem, styles.radioActive]}
                            onPress={() => setPaymentMethod('cod')}
                        >
                            <View style={styles.radioRow}>
                                <View style={styles.flexRow}>
                                    <View style={[styles.radioCircle, paymentMethod === 'cod' && styles.radioCircleSelected]} />
                                    <Text style={[styles.radioLabel, isDark && styles.textDark]}>Cash on Delivery (COD)</Text>
                                </View>
                                <Text style={[styles.radioSubLabel, isDark && styles.textGrayDark, { fontSize: 12 }]}>Pay when you receive</Text>
                            </View>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Footer */}
            <View style={[styles.footer, isDark && styles.footerDark, { paddingBottom: insets.bottom || 20 }]}>
                <Pressable
                    onPress={() => alert('Order Placed!')}
                    style={({ pressed }) => [styles.payButton, pressed && styles.pressed]}
                >
                    <Text style={styles.payButtonText}>Place Order</Text>
                    <Text style={styles.payButtonTotal}>· ${total.toFixed(2)}</Text>
                </Pressable>
                <View style={styles.secureFooter}>
                    <MaterialIcons name="lock" size={14} color="#9CA3AF" />
                    <Text style={styles.secureFooterText}>Payments are secure and encrypted</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    containerDark: {
        backgroundColor: '#101622',
    },
    content: {
    },
    section: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
        gap: 6,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    labelDark: {
        color: '#CBD5E1',
    },
    input: {
        height: 48,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#0F172A',
    },
    inputDark: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        color: '#F8FAFC',
    },
    inputWrapper: {
        justifyContent: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: 12,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 4,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    checkboxText: {
        fontSize: 14,
        color: '#475569',
    },
    textGrayDark: {
        color: '#94A3B8',
    },
    textDark: {
        color: '#fff',
    },
    textPrimary: {
        color: '#000',
    },
    radioGroup: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    radioGroupDark: {
        borderColor: '#374151',
        backgroundColor: 'rgba(31, 41, 55, 0.5)',
    },
    radioItem: {
        padding: 16,
    },
    radioRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    radioBorderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    radioBorderBottomDark: {
        borderBottomColor: '#374151',
    },
    radioActive: {
        backgroundColor: '#fff',
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleSelected: {
        borderColor: '#000',
        backgroundColor: '#fff',
        borderWidth: 6,
    },
    radioLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    radioSubLabel: {
        fontSize: 12,
        color: '#64748B',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    secureText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9CA3AF',
        letterSpacing: 0.5,
    },
    linkButton: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    cardIcons: {
        flexDirection: 'row',
        gap: 8,
        opacity: 0.7,
    },
    cardIcon: {
        width: 32,
        height: 20,
        borderRadius: 4,
    },
    cardFields: {
        padding: 16,
        paddingTop: 0,
        backgroundColor: '#fff',
    },
    cardFieldsDark: {
        backgroundColor: '#101622',
        paddingTop: 16,
    },
    paymentHeader: {
        backgroundColor: '#F9FAFB',
    },
    summarySection: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        padding: 20,
    },
    summarySectionDark: {
        backgroundColor: 'rgba(31, 41, 55, 0.3)',
        borderBottomColor: '#1F2937',
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    summaryTotal: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    cartItems: {
        gap: 16,
        marginBottom: 24,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    itemImageWrapper: {
        width: 64,
        height: 64,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#fff',
        position: 'relative',
    },
    itemImageWrapperDark: {
        borderColor: '#374151',
        backgroundColor: '#1F2937',
    },
    itemImage: {
        width: '100%',
        height: '100%',
        borderRadius: 7,
    },
    qtyBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#64748B',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    qtyText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    itemDetails: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    itemVariant: {
        fontSize: 12,
        color: '#64748B',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    codeRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    applyButton: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    applyButtonDark: {
        backgroundColor: '#374151',
    },
    applyButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    costBreakdown: {
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 16,
        gap: 12,
    },
    costBreakdownDark: {
        borderTopColor: '#374151',
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    costLabel: {
        fontSize: 14,
        color: '#475569',
    },
    costValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        marginTop: 16,
        paddingTop: 16,
    },
    totalRowDark: {
        borderTopColor: '#374151',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    currency: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
        marginRight: 4,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    footerDark: {
        backgroundColor: '#101622',
        borderTopColor: '#1F2937',
    },
    payButton: {
        backgroundColor: '#000',
        borderRadius: 12,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
    },
    pressed: {
        opacity: 0.9,
    },
    payButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    payButtonTotal: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '500',
    },
    secureFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    secureFooterText: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    addressList: {
        paddingRight: 20,
        marginBottom: 8,
    },
    addressCard: {
        width: 280,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#fff',
        marginRight: 12,
    },
    addressCardDark: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
    },
    addressCardSelected: {
        borderColor: '#000',
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    checkCircle: {
        marginLeft: 'auto',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    addressText: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 4,
    },
    couponChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F8FAFC',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    couponText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    }
});

