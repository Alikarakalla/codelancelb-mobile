import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface FilterChip {
    id: string;
    label: string;
    type: 'category' | 'color' | 'price' | 'brand' | 'size' | 'search' | 'sort';
}

interface ShopFilterBarProps {
    activeFilters: FilterChip[];
    onFilterPress: () => void;
    onSortPress: () => void;
    onRemoveFilter: (filterId: string) => void;
}

export function ShopFilterBar({
    activeFilters,
    onFilterPress,
    onSortPress,
    onRemoveFilter
}: ShopFilterBarProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.container, isDark && { backgroundColor: '#111', borderBottomColor: '#222' }]}>
            {/* Top Row: Filter and Sort Buttons */}
            <View style={styles.buttonRow}>
                <Pressable
                    style={[styles.actionButton, isDark && { backgroundColor: '#222', borderColor: '#333' }]}
                    onPress={onFilterPress}
                >
                    <MaterialIcons name="tune" size={20} color={isDark ? '#fff' : '#000'} />
                    <Text style={[styles.buttonText, isDark && { color: '#fff' }]}>FILTER</Text>
                    {activeFilters.length > 0 && (
                        <View style={[styles.badge, isDark && { backgroundColor: '#fff' }]}>
                            <Text style={[styles.badgeText, isDark && { color: '#000' }]}>{activeFilters.length}</Text>
                        </View>
                    )}
                </Pressable>

                <Pressable
                    style={[styles.actionButton, isDark && { backgroundColor: '#222', borderColor: '#333' }]}
                    onPress={onSortPress}
                >
                    <MaterialIcons name="swap-vert" size={20} color={isDark ? '#fff' : '#000'} />
                    <Text style={[styles.buttonText, isDark && { color: '#fff' }]}>SORT</Text>
                </Pressable>
            </View>

            {/* Bottom Row: Active Filter Chips */}
            {activeFilters.length > 0 && (
                <View style={styles.chipRow}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {activeFilters.map((filter) => (
                            <Pressable
                                key={filter.id}
                                style={[styles.chip, isDark && { backgroundColor: '#222', borderColor: '#333' }]}
                                onPress={() => onRemoveFilter(filter.id)}
                            >
                                <Text style={[styles.chipText, isDark && { color: '#e5e5e5' }]}>{filter.label}</Text>
                                <MaterialIcons name="close" size={16} color={isDark ? '#94A3B8' : '#94a3b8'} />
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingVertical: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 16, // 1rem gap (approx 16px)
        width: '100%',
    },
    actionButton: {
        flex: 1, // 50% width each (after gap)
        height: 44,
        borderRadius: 8,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    buttonText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#000',
        letterSpacing: 1,
    },
    chipRow: {
        marginTop: 12,
    },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 8,
    },
    badge: {
        backgroundColor: '#000',
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    chip: {
        height: 32,
        paddingLeft: 12,
        paddingRight: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334155',
    },
});
