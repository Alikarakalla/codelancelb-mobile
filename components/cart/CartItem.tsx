import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CartItemProps {
    id: number;
    name: string;
    details: string; // e.g. "Size: 10 • Color: Red"
    price: number;
    image: string;
    quantity: number;
    onRemove?: () => void;
    onUpdateQuantity?: (quantity: number) => void;
}

export function CartItem(props: CartItemProps) {
    return (
        <View style={styles.container}>
            <Image source={{ uri: props.image }} style={styles.image} resizeMode="cover" />

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.name} numberOfLines={2}>{props.name}</Text>
                        <Text style={styles.details}>{props.details}</Text>
                    </View>
                    <Pressable style={styles.deleteBtn} onPress={props.onRemove}>
                        <Ionicons name="trash-outline" size={20} color="#94A3B8" />
                    </Pressable>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.price}>${props.price.toFixed(2)}</Text>

                    <View style={styles.counter}>
                        <Pressable
                            style={styles.counterBtn}
                            onPress={() => props.onUpdateQuantity?.(props.quantity - 1)}
                        >
                            <Ionicons name="remove" size={16} color="#0F172A" />
                        </Pressable>
                        <Text style={styles.countText}>{props.quantity}</Text>
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
        borderColor: '#F1F5F9', // gray-100
        gap: 12,
        marginBottom: 16,
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
        color: '#0F172A', // slate-900
        marginBottom: 4,
    },
    details: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748B', // gray-500
    },
    deleteBtn: {
        padding: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    counter: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC', // gray-50
        borderRadius: 8,
        padding: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0', // gray-200
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
    counterBtnAdd: {
        backgroundColor: '#000', // primary (black)
    },
    countText: {
        width: 32,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
    },
});
