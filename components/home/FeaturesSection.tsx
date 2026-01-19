import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CMSFeature } from '@/types/schema';
import { Image as ExpoImage } from 'expo-image';

interface Props {
    features?: CMSFeature[];
}

export function FeaturesSection({ features }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const displayFeatures = features || [];

    return (
        <View style={[styles.container, isDark && { backgroundColor: '#111' }]}>
            {displayFeatures.map((item) => (
                <View key={item.id} style={styles.item}>
                    <View style={styles.iconContainer}>
                        {item.image ? (
                            <ExpoImage source={{ uri: item.image }} style={{ width: 28, height: 28 }} contentFit="contain" />
                        ) : (
                            <Ionicons name={(item.icon || 'star-outline') as any} size={28} color={isDark ? '#fff' : '#18181B'} />
                        )}
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, isDark && { color: '#fff' }]}>{item.title_en}</Text>
                        <Text style={[styles.desc, isDark && { color: '#94A3B8' }]}>{item.description_en}</Text>
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
