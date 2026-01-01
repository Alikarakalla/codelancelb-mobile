import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export interface FilterChip {
    id: string;
    label: string;
    type: 'category' | 'color' | 'price' | 'brand' | 'size';
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
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Tune / Filter Button */}
                <Pressable
                    style={styles.filterButton}
                    onPress={onFilterPress}
                >
                    <MaterialIcons name="tune" size={20} color="#1152d4" />
                    {activeFilters.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{activeFilters.length}</Text>
                        </View>
                    )}
                </Pressable>

                <View style={styles.divider} />

                {/* Active Filter Chips */}
                {activeFilters.map((filter) => (
                    <Pressable
                        key={filter.id}
                        style={styles.chip}
                        onPress={() => onRemoveFilter(filter.id)}
                    >
                        <Text style={styles.chipText}>{filter.label}</Text>
                        <MaterialIcons name="close" size={16} color="#94a3b8" />
                    </Pressable>
                ))}

                {/* Sort Button at the end of scroll if there's space, 
                    OR we can make it sticky at the end if preferred.
                    The HTML has it at the end of the scroll but with 'ml-auto'.
                */}
                <Pressable style={styles.sortButton} onPress={onSortPress}>
                    <MaterialIcons name="swap-vert" size={22} color="#64748b" />
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        height: 60,
        justifyContent: 'center',
    },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 8,
    },
    filterButton: {
        height: 36,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(17, 82, 212, 0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(17, 82, 212, 0.2)',
    },
    badge: {
        backgroundColor: '#1152d4',
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
    divider: {
        width: 1,
        height: 20,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 4,
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
        // Shadow for premium look
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
    sortButton: {
        height: 36,
        width: 36,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    }
});
