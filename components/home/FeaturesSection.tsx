import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CMSFeature } from '@/types/schema';
import { Image as ExpoImage } from 'expo-image';

const MOCK_FEATURES: CMSFeature[] = [
    {
        id: 1,
        store_id: 1,
        icon: 'bus-outline',
        title_en: 'SAME DAY DELIVERY',
        title_ar: 'توصيل في نفس اليوم',
        description_en: 'Available In Lebanon On Weekdays.',
        description_ar: 'متوفر في لبنان خلال أيام الأسبوع.',
        sort_order: 1,
        is_active: true
    },
    {
        id: 2,
        store_id: 1,
        icon: 'gift-outline',
        title_en: 'FREE SHIPPING',
        title_ar: 'شحن مجاني',
        description_en: 'For Orders Above $100.',
        description_ar: 'للطلبات التي تزيد عن 100 دولار.',
        sort_order: 2,
        is_active: true
    },
    {
        id: 3,
        store_id: 1,
        icon: 'location-outline',
        title_en: 'CLICK & COLLECT',
        title_ar: 'اختر واستلم',
        description_en: 'Choose Pickup From The Stores.',
        description_ar: 'اختر الاستلام من المتاجر.',
        sort_order: 3,
        is_active: true
    },
    {
        id: 4,
        store_id: 1,
        icon: 'refresh-outline',
        title_en: '7 DAYS RETURN',
        title_ar: '7 أيام للإرجاع',
        description_en: 'Available In Stores Within 7 Days.',
        description_ar: 'متوفر في المتاجر خلال 7 أيام.',
        sort_order: 4,
        is_active: true
    }
];

interface Props {
    features?: CMSFeature[];
}

export function FeaturesSection({ features }: Props) {
    const displayFeatures = (features && features.length > 0) ? features : MOCK_FEATURES;

    return (
        <View style={styles.container}>
            {displayFeatures.map((item) => (
                <View key={item.id} style={styles.item}>
                    <View style={styles.iconContainer}>
                        {item.image ? (
                            <ExpoImage source={{ uri: item.image }} style={{ width: 28, height: 28 }} contentFit="contain" />
                        ) : (
                            <Ionicons name={(item.icon || 'star-outline') as any} size={28} color="#18181B" />
                        )}
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{item.title_en}</Text>
                        <Text style={styles.desc}>{item.description_en}</Text>
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
