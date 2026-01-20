import React from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import RenderHtml, { MixedStyleDeclaration } from 'react-native-render-html';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProductDescriptionProps {
    description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
    const { width } = useWindowDimensions();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [expanded, setExpanded] = React.useState(false);

    const tagsStyles: Readonly<Record<string, MixedStyleDeclaration>> = {
        body: {
            color: isDark ? '#94A3B8' : '#64748B',
            fontSize: 14,
            lineHeight: 24,
        },
        p: {
            marginBottom: 10,
            marginTop: 0,
        },
        strong: {
            color: isDark ? '#fff' : '#0F172A',
            fontWeight: '700',
        },
        b: {
            color: isDark ? '#fff' : '#0F172A',
            fontWeight: '700',
        },
        li: {
            marginBottom: 4,
        },
        ul: {
            marginBottom: 10,
        }
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.heading, isDark && { color: '#fff' }]}>Description</Text>

            <View style={[styles.contentContainer, !expanded && styles.collapsed]}>
                <RenderHtml
                    contentWidth={width - 40}
                    source={{ html: description }}
                    tagsStyles={tagsStyles}
                    enableExperimentalMarginCollapsing={true}
                />


            </View>

            <Pressable
                onPress={() => setExpanded(!expanded)}
                style={styles.readMoreButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Text style={styles.readMoreText}>
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
    contentContainer: {
        overflow: 'hidden',
    },
    collapsed: {
        maxHeight: 120,
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    readMoreButton: {
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    readMoreText: {
        color: '#1152d4',
        fontWeight: '700',
        fontSize: 14,
    },
});
