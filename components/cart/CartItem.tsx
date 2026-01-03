import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '@/hooks/use-currency-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CartItemProps {
    id: number;
    name: string;
    details: string;
    price: number;
    originalPrice?: number;
    discountPercent?: number;
    image: string;
    quantity: number;
    onRemove?: () => void;
    onUpdateQuantity?: (quantity: number) => void;
}

export function CartItem(props: CartItemProps) {
    const { formatPrice } = useCurrency();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <Image source={{ uri: props.image }} style={styles.image} resizeMode="cover" />

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.name, isDark && styles.nameDark]} numberOfLines={2}>{props.name}</Text>
                        <Text style={[styles.details, isDark && styles.detailsDark]}>{props.details}</Text>
                    </View>
                    <Pressable style={styles.deleteBtn} onPress={props.onRemove}>
                        <Ionicons name="trash-outline" size={20} color={isDark ? "#64748B" : "#94A3B8"} />
                    </Pressable>
                </View>

                <View style={styles.footer}>
                    <View style={styles.priceContainer}>
                        {props.originalPrice && props.originalPrice > props.price ? (
                            <>
                                <Text style={[styles.originalPriceText, isDark && styles.originalPriceTextDark]}>
                                    {String(formatPrice(props.originalPrice) || `$${props.originalPrice?.toFixed(2)}`)}
                                </Text>
                                <Text style={[styles.price, styles.discountPrice, isDark && styles.priceDark]}>
                                    {String(formatPrice(props.price) || `$${props.price?.toFixed(2) || '0.00'}`)}
                                </Text>
                            </>
                        ) : (
                            <Text style={[styles.price, isDark && styles.priceDark]}>
                                {String(formatPrice(props.price) || `$${props.price?.toFixed(2) || '0.00'}`)}
                            </Text>
                        )}
                    </View>

                    <View style={[styles.counter, isDark && styles.counterDark]}>
                        <Pressable
                            style={[styles.counterBtn, isDark && styles.counterBtnDark]}
                            onPress={() => props.onUpdateQuantity?.(props.quantity - 1)}
                        >
                            <Ionicons name="remove" size={16} color={isDark ? "#F1F5F9" : "#0F172A"} />
                        </Pressable>
                        <Text style={[styles.countText, isDark && styles.countTextDark]}>{props.quantity}</Text>
                        <Pressable
                            style={[styles.counterBtn, styles.counterBtnAdd]}
                            onPress={() => props.onUpdateQuantity?.(props.quantity + 1)}
                        >
                            <Ionicons name="add" size={16} color="#fff" />
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        gap: 12,
        marginBottom: 16,
    },
    containerDark: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
    },
    image: {
        width: 96,
        height: 96,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    nameDark: {
        color: '#F8FAFC',
    },
    details: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748B',
    },
    detailsDark: {
        color: '#94A3B8',
    },
    deleteBtn: {
        padding: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceContainer: {
        flexDirection: 'column',
        gap: 4,
        flex: 1,
    },
    discountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    priceDark: {
        color: '#F8FAFC',
    },
    originalPriceText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#94A3B8',
        textDecorationLine: 'line-through',
    },
    originalPriceTextDark: {
        color: '#64748B',
    },
    discountPrice: {
        fontSize: 18,
        color: '#EF4444',
    },
    discountBadge: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    counter: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    counterDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
    },
    counterBtn: {
        width: 28,
        height: 28,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    counterBtnDark: {
        backgroundColor: '#4B5563',
    },
    counterBtnAdd: {
        backgroundColor: '#000',
    },
    countText: {
        width: 32,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
    },
    countTextDark: {
        color: '#F8FAFC',
    },
});
