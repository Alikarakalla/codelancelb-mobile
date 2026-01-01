import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

const FEATURES = [
    {
        icon: 'bus-outline',
        title: 'SAME DAY DELIVERY',
        desc: 'Available In Lebanon On Weekdays.',
    },
    {
        icon: 'gift-outline',
        title: 'FREE SHIPPING',
        desc: 'For Orders Above $100.',
    },
    {
        icon: 'location-outline',
        title: 'CLICK & COLLECT',
        desc: 'Choose Pickup From The Stores.',
    },
    {
        icon: 'refresh-outline',
        title: '7 DAYS RETURN',
        desc: 'Available In Stores Within 7 Days.',
    }
];

export function FeaturesSection() {
    return (
        <View style={styles.container}>
            {FEATURES.map((item, index) => (
                <View key={index} style={styles.item}>
                    <View style={styles.iconContainer}>
                        <Ionicons name={item.icon as any} size={28} color="#18181B" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.desc}>{item.desc}</Text>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 40,
        backgroundColor: '#F8FAFC',
        gap: 32,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 12,
        fontWeight: '800',
        color: '#18181B',
        letterSpacing: 2,
        marginBottom: 4,
    },
    desc: {
        fontSize: 10,
        color: '#6B7280',
        lineHeight: 14,
        fontWeight: '500',
    }
});
