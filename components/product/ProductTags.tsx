import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tag } from '@/types/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProductTagsProps {
    tags: Tag[];
}

// Preset color mappings based on API documentation
const PRESET_COLORS: Record<string, { bg: string; bgDark: string; text: string; textDark: string; border: string; borderDark: string }> = {
    slate: {
        bg: '#F1F5F9',
        bgDark: '#1E293B',
        text: '#475569',
        textDark: '#CBD5E1',
        border: '#E2E8F0',
        borderDark: '#334155'
    },
    red: {
        bg: '#FEE2E2',
        bgDark: '#7F1D1D',
        text: '#991B1B',
        textDark: '#FCA5A5',
        border: '#FECACA',
        borderDark: '#991B1B'
    },
    orange: {
        bg: '#FFEDD5',
        bgDark: '#7C2D12',
        text: '#C2410C',
        textDark: '#FED7AA',
        border: '#FED7AA',
        borderDark: '#C2410C'
    },
    amber: {
        bg: '#FEF3C7',
        bgDark: '#78350F',
        text: '#B45309',
        textDark: '#FDE68A',
        border: '#FDE68A',
        borderDark: '#B45309'
    },
    yellow: {
        bg: '#FEF9C3',
        bgDark: '#713F12',
        text: '#A16207',
        textDark: '#FEF08A',
        border: '#FEF08A',
        borderDark: '#A16207'
    },
    lime: {
        bg: '#ECFCCB',
        bgDark: '#3F6212',
        text: '#4D7C0F',
        textDark: '#D9F99D',
        border: '#D9F99D',
        borderDark: '#4D7C0F'
    },
    green: {
        bg: '#D1FAE5',
        bgDark: '#064E3B',
        text: '#047857',
        textDark: '#6EE7B7',
        border: '#A7F3D0',
        borderDark: '#047857'
    },
    emerald: {
        bg: '#D1FAE5',
        bgDark: '#064E3B',
        text: '#059669',
        textDark: '#6EE7B7',
        border: '#A7F3D0',
        borderDark: '#059669'
    },
    teal: {
        bg: '#CCFBF1',
        bgDark: '#134E4A',
        text: '#0F766E',
        textDark: '#5EEAD4',
        border: '#99F6E4',
        borderDark: '#0F766E'
    },
    cyan: {
        bg: '#CFFAFE',
        bgDark: '#164E63',
        text: '#0E7490',
        textDark: '#67E8F9',
        border: '#A5F3FC',
        borderDark: '#0E7490'
    },
    sky: {
        bg: '#E0F2FE',
        bgDark: '#0C4A6E',
        text: '#0369A1',
        textDark: '#7DD3FC',
        border: '#BAE6FD',
        borderDark: '#0369A1'
    },
    blue: {
        bg: '#DBEAFE',
        bgDark: '#1E3A8A',
        text: '#1D4ED8',
        textDark: '#93C5FD',
        border: '#BFDBFE',
        borderDark: '#1D4ED8'
    },
    indigo: {
        bg: '#E0E7FF',
        bgDark: '#312E81',
        text: '#4338CA',
        textDark: '#A5B4FC',
        border: '#C7D2FE',
        borderDark: '#4338CA'
    },
    violet: {
        bg: '#EDE9FE',
        bgDark: '#4C1D95',
        text: '#6D28D9',
        textDark: '#C4B5FD',
        border: '#DDD6FE',
        borderDark: '#6D28D9'
    },
    purple: {
        bg: '#F3E8FF',
        bgDark: '#581C87',
        text: '#7E22CE',
        textDark: '#D8B4FE',
        border: '#E9D5FF',
        borderDark: '#7E22CE'
    },
    fuchsia: {
        bg: '#FAE8FF',
        bgDark: '#701A75',
        text: '#A21CAF',
        textDark: '#F0ABFC',
        border: '#F5D0FE',
        borderDark: '#A21CAF'
    },
    pink: {
        bg: '#FCE7F3',
        bgDark: '#831843',
        text: '#BE185D',
        textDark: '#F9A8D4',
        border: '#FBCFE8',
        borderDark: '#BE185D'
    },
    rose: {
        bg: '#FFE4E6',
        bgDark: '#881337',
        text: '#BE123C',
        textDark: '#FDA4AF',
        border: '#FECDD3',
        borderDark: '#BE123C'
    }
};

export function ProductTags({ tags }: ProductTagsProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    if (!tags || tags.length === 0) return null;

    const getTagStyles = (color: string | null | undefined) => {
        // Handle null/undefined colors
        if (!color) {
            const fallback = PRESET_COLORS.slate;
            return {
                backgroundColor: isDark ? fallback.bgDark : fallback.bg,
                color: isDark ? fallback.textDark : fallback.text,
                borderColor: isDark ? fallback.borderDark : fallback.border
            };
        }

        // Check if it's a custom HEX color
        if (color.startsWith('#')) {
            return {
                backgroundColor: color,
                color: '#ffffff',
                borderColor: 'rgba(0,0,0,0.1)'
            };
        }

        // Use preset color
        const preset = PRESET_COLORS[color.toLowerCase()];
        if (preset) {
            return {
                backgroundColor: isDark ? preset.bgDark : preset.bg,
                color: isDark ? preset.textDark : preset.text,
                borderColor: isDark ? preset.borderDark : preset.border
            };
        }

        // Fallback to slate if color not found
        const fallback = PRESET_COLORS.slate;
        return {
            backgroundColor: isDark ? fallback.bgDark : fallback.bg,
            color: isDark ? fallback.textDark : fallback.text,
            borderColor: isDark ? fallback.borderDark : fallback.border
        };
    };

    return (
        <View style={styles.container}>
            {tags.map((tag) => {
                const tagStyles = getTagStyles(tag.color);
                return (
                    <View
                        key={tag.id}
                        style={[
                            styles.tag,
                            {
                                backgroundColor: tagStyles.backgroundColor,
                                borderColor: tagStyles.borderColor
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.tagText,
                                { color: tagStyles.color }
                            ]}
                        >
                            {tag.name}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 20,
        marginTop: 12,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    }
});
