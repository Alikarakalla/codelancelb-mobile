import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProductDescriptionProps {
    description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={styles.container}>
            <Text style={[styles.heading, isDark && { color: '#fff' }]}>Description</Text>
            <Text style={[styles.body, isDark && { color: '#94A3B8' }]}>
                {description}
                <Text style={styles.readMore}> Read more</Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    heading: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 8,
    },
    body: {
        fontSize: 14,
        color: '#64748B', // slate-500
        lineHeight: 24,
    },
    readMore: {
        color: '#1152d4',
        fontWeight: '700',
    },
});
