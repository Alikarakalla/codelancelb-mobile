import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProductDescriptionProps {
    description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [expanded, setExpanded] = React.useState(false);

    return (
        <View style={styles.container}>
            <Text style={[styles.heading, isDark && { color: '#fff' }]}>Description</Text>
            <Pressable onPress={() => setExpanded(!expanded)}>
                <Text
                    style={[styles.body, isDark && { color: '#94A3B8' }]}
                    numberOfLines={expanded ? undefined : 3}
                >
                    {description}
                </Text>
                <Text style={[styles.readMore, { marginTop: 4 }]}>
                    {expanded ? 'Read less' : 'Read more'}
                </Text>
            </Pressable>
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
