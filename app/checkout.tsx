import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Image, StyleSheet, SafeAreaView, Switch, Platform, KeyboardAvoidingView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Address, Coupon } from '@/types/schema';
import { useCart } from '@/hooks/use-cart-context';
import { useAuth } from '@/hooks/use-auth-context';
import { useCurrency } from '@/hooks/use-currency-context';
import { api } from '@/services/apiClient';
import PhoneInput from 'react-native-phone-input';
import { parsePhoneNumber } from 'libphonenumber-js';

export default function CheckoutScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();
    const { items, cartTotal, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const { formatPrice, currency } = useCurrency();

    const [paymentMethod, setPaymentMethod] = useState<'cod'>('cod');
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [isUsingSavedAddress, setIsUsingSavedAddress] = useState(true);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const phoneRef = useRef<PhoneInput>(null);

    // User Data
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [phoneCountry, setPhoneCountry] = useState<any>();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // Addresses
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    // Discount Logic
    const [discountCode, setDiscountCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [notes, setNotes] = useState('');

    // Loyalty Rewards Logic
    const [myRewards, setMyRewards] = useState<any[]>([]);
    const [appliedReward, setAppliedReward] = useState<any>(null);

    // Dynamic Store Settings
    const [storeSettings, setStoreSettings] = useState<any>(null);
    const [loadingSettings, setLoadingSettings] = useState(true);

    // Load store settings on mount
    useEffect(() => {
        loadStoreSettings();
    }, []);

    // Load user data and addresses on mount
    useEffect(() => {
        if (isAuthenticated && user) {
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            loadAddresses();
            loadMyRewards();
        }
    }, [isAuthenticated, user]);

    // Sync phone number with selected address
    useEffect(() => {
        if (isUsingSavedAddress && selectedAddressId && addresses.length > 0) {
            const selectedAddr = addresses.find(a => a.id === selectedAddressId);
            if (selectedAddr && selectedAddr.phone) {
                setPhone(selectedAddr.phone);
            }
        }
    }, [selectedAddressId, addresses, isUsingSavedAddress]);

    // Keep PhoneInput component in sync with phone state
    useEffect(() => {
        if (phone && phoneRef.current) {
            // Using a small delay to ensure ref is ready if needed, 
            // though usually it's fine
            phoneRef.current.setValue(phone);
        }
    }, [phone]);

    const loadMyRewards = async () => {
        try {
            const history = await api.getLoyaltyHistory();
            const list = Array.isArray(history) ? history : (history.data || []);

            // Filter using 'source' instead of 'type'
            // Based on logs, it can be REWARD_REDEMPTION or redemption
            const redemptions = list.filter((item: any) =>
                ['REWARD_REDEMPTION', 'redemption'].includes(item.source)
            );

            setMyRewards(redemptions);
        } catch (e) {
            console.log('Failed to load rewards', e);
        }
    };

    const loadStoreSettings = async () => {
        setLoadingSettings(true);
        try {
            const settings = await api.getStoreSettings();
            setStoreSettings(settings);
        } catch (error) {
            console.error('Failed to load store settings:', error);
            // Fallback to defaults
            setStoreSettings({
                shipping: { free_threshold: 250, flat_fee: 4 },
                tax: { rate_percent: 0 },
                currency: { code: 'USD', symbol: '$' }
            });
        } finally {
            setLoadingSettings(false);
        }
    };

    const loadAddresses = async () => {
        setLoadingAddresses(true);
        try {
            const data = await api.getAddresses();
            setAddresses(data || []);

            // Auto-select default or first address
            const defaultAddr = data.find((addr: any) => addr.is_default);
            const firstAddr = defaultAddr || data[0];
            if (firstAddr) {
                setSelectedAddressId(firstAddr.id);
            }
        } catch (error) {
            console.error('Failed to load addresses:', error);
        } finally {
            setLoadingAddresses(false);
        }
    };

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

    // Calculations - Calculate subtotal with discounts applied
    const subtotal = items.reduce((sum, item) => {
        const variant = item.product?.variants?.find(v => v.slug === item.variant_key);
        const sourceDiscount = variant || item.product;
        const hasDiscount = sourceDiscount?.discount_amount && sourceDiscount?.discount_type;
        let itemPrice = item.price;

        if (hasDiscount && sourceDiscount.discount_amount) {
            const discountAmount = parseFloat(String(sourceDiscount.discount_amount));
            if (sourceDiscount.discount_type === 'percent') {
                itemPrice = item.price * (1 - discountAmount / 100);
            } else if (sourceDiscount.discount_type === 'fixed') {
                itemPrice = item.price - discountAmount;
            }
        }

        return sum + (itemPrice * item.qty);
    }, 0);

    // Calculate Discount Amount (from coupon)
    let discountAmount = 0;
    if (appliedCoupon) {
        // Backend might return 'discount_amount' (calculated) or 'value' (definition)
        discountAmount = parseFloat(appliedCoupon.discount_amount || appliedCoupon.value || 0);
    }

    // Calculate Reward Discount
    let rewardDiscount = 0;
    if (appliedReward) {
        // Optimistic parsing: Try to determine value from description or reward data
        // Example descs: "Redeemed reward: Discount 20%", "Redeemed reward: 5%"
        // We lack context on WHAT it applies to (total or item). Assuming Total Percentage or Fixed Value is ambiguous.
        // However, if it says "Discount 20%", is it 20% off total?

        const data = appliedReward.reward_data || {};
        const desc = appliedReward.description || data.description || '';
        const name = data.name || appliedReward.name || '';
        const textToSearch = (name + " " + desc).toLowerCase();

        // Check for percentage
        const percentMatch = textToSearch.match(/(\d+)%/);
        const moneyMatch = textToSearch.match(/\$(\d+)/); // $10 or similar
        // Also checks for just numbers if it says "Discount 20" (ambiguous, assume money if no %?)
        // Let's rely on explicit symbols first.

        if (percentMatch) {
            const percent = parseFloat(percentMatch[1]);
            // Apply percentage to subtotal
            rewardDiscount = subtotal * (percent / 100);
        } else if (moneyMatch) {
            rewardDiscount = parseFloat(moneyMatch[1]);
        } else {
            // Fallback: Check for "Discount 20" -> assume fixed if no % sign?
            // "Discount 20%" was in log.
            // If it says "Redeemed reward: Discount 20%", it matched percent logic above.
            // If "Redeemed: 5%", it matched percent logic.
        }
    }
    // Calculate shipping (dynamic from backend)
    const freeShippingThreshold = storeSettings?.shipping?.free_threshold ?? 250;
    const shippingFee = storeSettings?.shipping?.flat_fee ?? 15;

    let shippingCost = subtotal >= freeShippingThreshold ? 0 : shippingFee;
    if (appliedCoupon?.free_shipping || (user?.loyaltyTier as any)?.free_shipping) {
        shippingCost = 0;
    }

    // Calculate tax (dynamic from backend)
    // Use nullish coalescing (??) because 0 is a valid rate, but || treats it as falsy
    const taxRatePercent = storeSettings?.tax?.rate_percent ?? 0;
    const taxes = Math.max(0, subtotal * (taxRatePercent / 100));
    const total = Math.max(0, subtotal - discountAmount - rewardDiscount + shippingCost + taxes);

    const handlePlaceOrder = async () => {
        // Validation
        if (!isAuthenticated || !user) {
            Alert.alert('Error', 'Please log in to place an order');
            router.push('/login');
            return;
        }

        if (items.length === 0) {
            Alert.alert('Error', 'Your cart is empty');
            return;
        }

        const selectedAddress = addresses.find(a => a.id === selectedAddressId);
        if (!selectedAddress && isUsingSavedAddress) {
            Alert.alert('Error', 'Please select a shipping address');
            return;
        }

        if (!email || !phone || !firstName || !lastName) {
            Alert.alert('Error', 'Please fill in all contact information');
            return;
        }

        if (phoneRef.current && !phoneRef.current.isValidNumber()) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }

        setPlacingOrder(true);
        try {
            const selectedAddr = addresses.find(a => a.id === selectedAddressId);

            // Ensure we have valid address data
            if (!selectedAddr && isUsingSavedAddress) {
                Alert.alert('Error', 'Please select a valid shipping address');
                return;
            }

            // Append reward info to notes
            let finalNotes = notes || '';
            if (appliedReward) {
                const rewardName = appliedReward.reward_data?.name || 'Loyalty Reward';
                finalNotes += ` [Redeemed Reward Applied: ${rewardName} (ID: ${appliedReward.id})]`;
            }

            const orderData = {
                first_name: firstName || 'Guest',
                last_name: lastName || 'User',
                email: email || 'guest@example.com',
                phone: phone || '',

                // Shipping address fields (flat structure for backend)
                shipping_address: selectedAddr?.address_line_1 || 'N/A',
                shipping_address_2: selectedAddr?.address_line_2 || '',
                shipping_city: selectedAddr?.city || 'N/A',
                shipping_state: selectedAddr?.state || 'N/A',
                shipping_zip: selectedAddr?.postal_code || '00000',
                shipping_country: selectedAddr?.country || 'N/A',

                // Billing address (same as shipping for now)
                billing_address: selectedAddr?.address_line_1 || 'N/A',
                billing_address_2: selectedAddr?.address_line_2 || '',
                billing_city: selectedAddr?.city || 'N/A',
                billing_state: selectedAddr?.state || 'N/A',
                billing_zip: selectedAddr?.postal_code || '00000',
                billing_country: selectedAddr?.country || 'N/A',

                // Also send IDs for reference (can be null if new address)
                billing_address_id: selectedAddressId || null,
                shipping_address_id: selectedAddressId || null,

                items: items.map(item => {
                    // Find the variant by slug to get its numeric ID
                    const variant = item.product?.variants?.find(v => v.slug === item.variant_key);

                    // Calculate discounted price for this item
                    const sourceDiscount = variant || item.product;
                    const hasDiscount = sourceDiscount?.discount_amount && sourceDiscount?.discount_type;
                    let itemPrice = item.price;

                    if (hasDiscount && sourceDiscount.discount_amount) {
                        const discountAmount = parseFloat(String(sourceDiscount.discount_amount));
                        if (sourceDiscount.discount_type === 'percent') {
                            itemPrice = item.price * (1 - discountAmount / 100);
                        } else if (sourceDiscount.discount_type === 'fixed') {
                            itemPrice = item.price - discountAmount;
                        }
                    }

                    // Simplify options - especially for bundle products
                    let simplifiedOptions: Record<string, any> | null = null;
                    if (item.options) {
                        // Check if this is a bundle product with bundle_selections
                        if (item.options.bundle_selections) {
                            // Convert full variant objects to just IDs
                            const bundleSelections: Record<string, number> = {};
                            Object.entries(item.options.bundle_selections).forEach(([productId, variantData]: [string, any]) => {
                                // Extract just the variant ID
                                bundleSelections[productId] = variantData.id || variantData;
                            });
                            simplifiedOptions = { bundle_selections: bundleSelections };
                        } else {
                            // For regular products, keep color/size options but simplify them
                            simplifiedOptions = {};
                            Object.entries(item.options).forEach(([key, value]: [string, any]) => {
                                if (value && typeof value === 'object' && 'id' in value) {
                                    // Convert {id: 123, name: "Red", ...} to just "Red" or id
                                    simplifiedOptions![key] = value.name || value.id;
                                } else {
                                    simplifiedOptions![key] = value;
                                }
                            });
                        }
                    }

                    return {
                        product_id: item.product_id || item.id,
                        variant_id: variant?.id || null,
                        quantity: item.qty,
                        price: parseFloat(itemPrice.toFixed(2)),
                        options: simplifiedOptions,
                    };
                }),
                subtotal: parseFloat(subtotal.toFixed(2)),
                tax_amount: parseFloat(taxes.toFixed(2)),
                shipping_amount: parseFloat(shippingCost.toFixed(2)),
                discount_amount: parseFloat((discountAmount + rewardDiscount).toFixed(2)),
                total_amount: parseFloat(total.toFixed(2)),
                payment_method: 'cod',  // Changed from paymentMethod to 'cod' for backend compatibility
                notes: finalNotes,
                coupon_code: appliedCoupon?.code || null,
                currency_code: 'USD',
            };

            console.log('📦 Order Data Being Sent:', JSON.stringify(orderData, null, 2));

            const response = await api.placeOrder(orderData);

            console.log('📬 Backend Response:', JSON.stringify(response, null, 2));

            if (response.success) {
                clearCart();
                Alert.alert(
                    'Order Placed!',
                    `Your order #${response.order_number} has been placed successfully.`,
                    [{
                        text: 'OK',
                        onPress: () => router.push('/profile')
                    }]
                );
            } else {
                console.error('❌ Backend rejected order:', response);
                Alert.alert('Error', response.message || 'Failed to place order');
            }
        } catch (error: any) {
            console.error('❌ Place order error:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.status,
                response: error.response
            });

            // More detailed error message
            let errorMsg = 'Failed to place order. ';
            if (error.message?.includes('500')) {
                errorMsg += 'Server error - please contact support.';
            } else if (error.message?.includes('401')) {
                errorMsg += 'Please log in again.';
            } else if (error.message?.includes('400')) {
                errorMsg += 'Invalid order data.';
            } else {
                errorMsg += error.message || 'Please try again.';
            }

            Alert.alert('Error', errorMsg);
        } finally {
            setPlacingOrder(false);
        }
    };

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTransparent: true,
                    headerTitle: () => (
                        <Text style={{
                            fontSize: 17,
                            fontWeight: '600',
                            color: isDark ? '#fff' : '#000',
                            letterSpacing: -0.4,
                        }}>
                            Checkout
                        </Text>
                    ),
                    headerTitleAlign: 'center',
                    ...Platform.select({
                        ios: {
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
                            unstable_nativeHeaderOptions: {
                                headerBackground: {
                                    material: 'glass',
                                },
                            }
                        },
                        android: {
                            headerLeft: () => (
                                <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
                                    <IconSymbol name="chevron.left" color={isDark ? '#fff' : '#000'} size={24} />
                                </Pressable>
                            ),
                        }
                    })
                } as any}
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
                        <Text style={[styles.summaryTotal, isDark && styles.textDark]}>{formatPrice(total)}</Text>
                    </Pressable>

                    {isSummaryOpen && (
                        <View style={{ marginTop: 16 }}>
                            <View style={styles.cartItems}>
                                {items.map((item) => {
                                    // Find variant details for display
                                    const variant = item.product?.variants?.find(v => v.slug === item.variant_key);

                                    // Use variant gallery first for image
                                    const image = variant?.gallery?.[0] || variant?.image_path || item.product?.main_image || '';

                                    let details = '';
                                    if (variant) {
                                        details = [variant.color, variant.size].filter(Boolean).join(' / ');
                                    } else if (item.options) {
                                        details = Object.values(item.options).join(' / ');
                                    }

                                    // Calculate discount - same logic as cart
                                    const sourceDiscount = variant || item.product;
                                    const hasDiscount = sourceDiscount?.discount_amount && sourceDiscount?.discount_type;
                                    let displayPrice = item.price;

                                    if (hasDiscount && sourceDiscount.discount_amount) {
                                        const discountAmount = parseFloat(String(sourceDiscount.discount_amount));
                                        if (sourceDiscount.discount_type === 'percent') {
                                            displayPrice = item.price * (1 - discountAmount / 100);
                                        } else if (sourceDiscount.discount_type === 'fixed') {
                                            displayPrice = item.price - discountAmount;
                                        }
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
                                                {formatPrice(displayPrice * item.qty)}
                                            </Text>
                                        </View>
                                    )
                                })}
                            </View>

                            <View style={[styles.costBreakdown, isDark && styles.costBreakdownDark]}>
                                <View style={styles.costRow}>
                                    <Text style={[styles.costLabel, isDark && styles.textGrayDark]}>Subtotal</Text>
                                    <Text style={[styles.costValue, isDark && styles.textDark]}>{formatPrice(subtotal)}</Text>
                                </View>
                                {discountAmount > 0 && (
                                    <View style={styles.costRow}>
                                        <Text style={[styles.costLabel, isDark && styles.textGrayDark]}>Coupon Discount</Text>
                                        <Text style={[styles.costValue, { color: '#ef4444' }]}>-{formatPrice(discountAmount)}</Text>
                                    </View>
                                )}
                                {rewardDiscount > 0 && (
                                    <View style={styles.costRow}>
                                        <View>
                                            <Text style={[styles.costLabel, isDark && styles.textGrayDark, { fontWeight: '600', color: isDark ? '#fff' : '#000' }]}>Loyalty Reward</Text>
                                            {appliedReward && (
                                                <Text style={{ fontSize: 11, color: isDark ? '#9ca3af' : '#4b5563', marginTop: 2, fontWeight: '500' }}>
                                                    {appliedReward.reward_data?.name || appliedReward.description?.replace('Redeemed reward: ', '').replace('Redeemed: ', '') || 'Applied'}
                                                </Text>
                                            )}
                                        </View>
                                        <Text style={[styles.costValue, { color: isDark ? '#fff' : '#000', fontWeight: '600' }]}>-{formatPrice(rewardDiscount)}</Text>
                                    </View>
                                )}
                                <View style={styles.costRow}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={[styles.costLabel, isDark && styles.textGrayDark]}>Shipping</Text>
                                        {shippingCost === 0 && (user?.loyaltyTier as any)?.free_shipping && (
                                            <View style={{
                                                backgroundColor: isDark ? '#0f172a' : '#eff6ff',
                                                paddingHorizontal: 8,
                                                paddingVertical: 2,
                                                borderRadius: 12,
                                                marginLeft: 8,
                                                borderWidth: 1,
                                                borderColor: isDark ? '#1e293b' : '#dbeafe'
                                            }}>
                                                <Text style={{ fontSize: 10, color: '#2563eb', fontWeight: '600' }}>
                                                    {user?.loyaltyTier?.name || 'Loyalty'} Benefit
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[
                                        styles.costValue,
                                        isDark && styles.textDark,
                                        shippingCost === 0 && { color: '#16a34a', fontWeight: '600' }
                                    ]}>
                                        {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                                    </Text>
                                </View>
                                <View style={styles.costRow}>
                                    <Text style={[styles.costLabel, isDark && styles.textGrayDark]}>Estimated Taxes</Text>
                                    <Text style={[styles.costValue, isDark && styles.textDark]}>{formatPrice(taxes)}</Text>
                                </View>
                            </View>

                            <View style={[styles.totalRow, isDark && styles.totalRowDark]}>
                                <Text style={[styles.totalLabel, isDark && styles.textDark]}>Total</Text>
                                <View style={styles.flexRow}>
                                    <Text style={[styles.currency, isDark && styles.textGrayDark]}>USD</Text>
                                    <Text style={[styles.totalValue, isDark && styles.textDark]}>{formatPrice(total)}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Discounts & Rewards Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Discounts & Rewards</Text>

                    {/* Loyalty Rewards List */}
                    {myRewards.length > 0 ? (
                        <View style={{ marginBottom: 24 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Your Rewards ({myRewards.length})
                                </Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
                                {myRewards.map((rewardItem) => {
                                    const isSelected = appliedReward?.id === rewardItem.id;
                                    const rData = rewardItem.reward_data || {};
                                    // Use description from item directly if name is missing, stripping prefix if possible
                                    let displayName = rData.name || rewardItem.description || 'Reward';

                                    // Clean up "Redeemed reward: " prefix
                                    displayName = displayName.replace('Redeemed reward: ', '').replace('Redeemed: ', '');

                                    return (
                                        <Pressable
                                            key={rewardItem.id}
                                            onPress={() => setAppliedReward(isSelected ? null : rewardItem)}
                                            style={[
                                                styles.rewardCard,
                                                isDark && styles.rewardCardDark,
                                                isSelected && styles.rewardCardSelected
                                            ]}
                                        >
                                            {isSelected && (
                                                <LinearGradient
                                                    colors={isDark ? ['#000000', '#18181b'] : ['#0f172a', '#1e293b']}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 1 }}
                                                    style={StyleSheet.absoluteFillObject}
                                                />
                                            )}

                                            <View style={styles.rewardCardContent}>
                                                <View style={[styles.rewardIconContainer, isSelected && { backgroundColor: 'rgba(255,255,255,0.2)' }, !isSelected && { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                                                    <MaterialIcons
                                                        name={isSelected ? "check" : "loyalty"}
                                                        size={20}
                                                        color={isSelected ? "#fff" : (isDark ? "#94a3b8" : "#0f172a")}
                                                    />
                                                </View>
                                                <View>
                                                    <Text style={[styles.rewardCardTitle, isSelected && { color: '#fff' }, isDark && !isSelected && { color: '#f1f5f9' }]}>
                                                        {displayName}
                                                    </Text>
                                                    <Text style={[styles.rewardCardSubtitle, isSelected && { color: 'rgba(255,255,255,0.8)' }, isDark && !isSelected && { color: '#94a3b8' }]}>
                                                        Tap to {isSelected ? 'remove' : 'apply'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    ) : (
                        <Text style={{ color: isDark ? '#64748b' : '#94a3b8', marginBottom: 16, fontSize: 13 }}>
                            No active rewards found. Redeem points in your profile!
                        </Text>
                    )}

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
                </View>

                {/* Contact Info */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Contact</Text>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, isDark && styles.labelDark]}>Email</Text>
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            placeholder="email@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, isDark && styles.labelDark]}>Phone</Text>
                        <PhoneInput
                            ref={phoneRef}
                            initialCountry="lb"
                            onChangePhoneNumber={(number) => setPhone(number)}
                            style={{
                                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                borderWidth: 1,
                                borderColor: isDark ? '#334155' : '#e5e7eb',
                                borderRadius: 12,
                                height: 56,
                                paddingHorizontal: 16,
                            }}
                            textStyle={{
                                color: isDark ? '#fff' : '#111318',
                                fontSize: 15,
                            }}
                            flagStyle={{
                                width: 30,
                                height: 20,
                                borderWidth: 0,
                            }}
                        />
                    </View>
                </View>

                {/* Shipping Address */}
                < View style={styles.section} >
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Shipping address</Text>
                        {addresses.length > 0 && (
                            <Pressable onPress={() => setIsUsingSavedAddress(!isUsingSavedAddress)}>
                                <Text style={styles.linkButton}>
                                    {isUsingSavedAddress ? 'Enter new address' : 'Select saved address'}
                                </Text>
                            </Pressable>
                        )}
                    </View>

                    {
                        loadingAddresses ? (
                            <ActivityIndicator color="#000" style={{ marginVertical: 20 }} />
                        ) : isUsingSavedAddress && addresses.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.addressList}>
                                {addresses.map((addr) => {
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
                                            <Text style={[styles.addressText, isDark && styles.textGrayDark]} numberOfLines={2}>
                                                {addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ''}
                                            </Text>
                                            <Text style={[styles.addressText, isDark && styles.textGrayDark]}>
                                                {addr.city}, {addr.state} {addr.postal_code}
                                            </Text>
                                            <Text style={[styles.addressText, isDark && styles.textGrayDark]}>
                                                {addr.country}
                                            </Text>
                                            {addr.phone && (
                                                <Text style={[styles.addressText, isDark && styles.textGrayDark]}>
                                                    {addr.phone}
                                                </Text>
                                            )}
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
                                            value={firstName}
                                            onChangeText={setFirstName}
                                            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, isDark && styles.labelDark]}>Last name</Text>
                                        <TextInput
                                            style={[styles.input, isDark && styles.inputDark]}
                                            placeholder="Doe"
                                            value={lastName}
                                            onChangeText={setLastName}
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
                    onPress={handlePlaceOrder}
                    disabled={placingOrder}
                    style={({ pressed }) => [styles.payButton, pressed && styles.pressed, placingOrder && { opacity: 0.7 }]}
                >
                    {placingOrder ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.payButtonText}>Place Order</Text>
                            <Text style={styles.payButtonTotal}>· {formatPrice(total)}</Text>
                        </>
                    )}
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
    nativeGlassWrapper: {
        width: 20,
        height: 20,
        borderRadius: 50,
        backgroundColor: 'transparent', // Important: Let the system provide the glass
        justifyContent: 'center',
        alignItems: 'center',
        // On iOS 26, the system wraps this Pressable in a glass bubble automatically
        // if it's inside a native header and has a fixed width/height.
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
    // Rewards Modern UI
    rewardCard: {
        minWidth: 150,
        maxWidth: 280,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
    },
    rewardCardDark: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
    },
    rewardCardSelected: {
        borderColor: '#0f172a',
        borderWidth: 0,
    },
    rewardCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
        zIndex: 1,
    },
    rewardIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e0e7ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rewardCardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    rewardCardSubtitle: {
        fontSize: 11,
        color: '#64748b',
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

