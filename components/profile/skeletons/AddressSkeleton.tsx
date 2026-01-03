import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Skeleton } from '@/components/ui/SkeletonLoader';

export function AddressSkeleton() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.card, {
            backgroundColor: isDark ? '#1a2230' : '#ffffff',
            borderColor: isDark ? '#374151' : '#f3f4f6',
        }]}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <View style={styles.info}>
                <Skeleton width={80} height={16} borderRadius={6} />
                <View style={{ height: 8 }} />
                <Skeleton width="100%" height={14} borderRadius={4} />
                <View style={{ height: 4 }} />
                <Skeleton width="70%" height={12} borderRadius={4} />
            </View>
            <View style={styles.actions}>
                <Skeleton width={28} height={28} borderRadius={14} />
                <Skeleton width={28} height={28} borderRadius={14} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
    },
    info: {
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
});
