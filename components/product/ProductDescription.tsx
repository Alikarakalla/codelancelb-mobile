import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface ProductDescriptionProps {
    description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Description</Text>
            <Text style={styles.body}>
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
