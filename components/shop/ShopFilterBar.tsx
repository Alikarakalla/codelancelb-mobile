import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MenuView } from '@react-native-menu/menu';
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';

export interface FilterChip {
    id: string;
    label: string;
    type: 'category' | 'color' | 'price' | 'brand' | 'size' | 'search' | 'sort';
}

interface ShopFilterBarProps {
    activeFilters: FilterChip[];
    onFilterPress: () => void;
    currentSort?: string;
    onSortSelect: (sort: 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc') => void;
    onRemoveFilter: (filterId: string) => void;
}

const SORT_OPTIONS: { value: 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A to Z' },
    { value: 'name_desc', label: 'Name: Z to A' },
];

export function ShopFilterBar({
    activeFilters,
    onFilterPress,
    currentSort = 'newest',
    onSortSelect,
    onRemoveFilter
}: ShopFilterBarProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const sortSheetRef = React.useRef<BottomSheetModal>(null);
    const sortSnapPoints = React.useMemo(() => ['44%'], []);

    const openAndroidSortPicker = () => {
        sortSheetRef.current?.present();
    };

    const handleAndroidSortSelect = (sort: 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc') => {
        onSortSelect(sort);
        sortSheetRef.current?.dismiss();
    };

    const renderBackdrop = React.useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                pressBehavior="close"
                opacity={0.35}
            />
        ),
        []
    );

    const sortButtonContent = (
        <>
            <MaterialIcons name="swap-vert" size={20} color={isDark ? '#fff' : '#000'} />
            <Text style={[styles.buttonText, isDark && { color: '#fff' }]}>SORT</Text>
        </>
    );

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

                {Platform.OS === 'ios' ? (
                    <MenuView
                        style={{ flex: 1 }}
                        shouldOpenOnLongPress={false}
                        title="Sort Products"
                        actions={SORT_OPTIONS.map(option => ({
                            id: option.value,
                            title: option.label,
                            state: currentSort === option.value ? 'on' : 'off',
                        }))}
                        onPressAction={({ nativeEvent }) => {
                            const selectedSort = nativeEvent.event as 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
                            onSortSelect(selectedSort);
                        }}
                    >
                        <Pressable style={[styles.actionButton, isDark && { backgroundColor: '#222', borderColor: '#333' }]}>
                            {sortButtonContent}
                        </Pressable>
                    </MenuView>
                ) : (
                    <Pressable
                        style={[styles.actionButton, isDark && { backgroundColor: '#222', borderColor: '#333' }]}
                        onPress={openAndroidSortPicker}
                    >
                        {sortButtonContent}
                    </Pressable>
                )}
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

            {Platform.OS === 'android' && (
                <BottomSheetModal
                    ref={sortSheetRef}
                    snapPoints={sortSnapPoints}
                    index={0}
                    enablePanDownToClose
                    backdropComponent={renderBackdrop}
                    handleIndicatorStyle={[styles.sheetHandle, isDark && { backgroundColor: '#555' }]}
                    backgroundStyle={[styles.sheetBackground, isDark && { backgroundColor: '#141414' }]}
                >
                    <BottomSheetView style={styles.sheetContent}>
                        <Text style={[styles.sheetTitle, isDark && { color: '#fff' }]}>Sort Products</Text>
                        <Text style={[styles.sheetSubtitle, isDark && { color: '#94A3B8' }]}>Choose a sorting option</Text>

                        <View style={styles.sortOptionList}>
                            {SORT_OPTIONS.map((option) => {
                                const isSelected = currentSort === option.value;
                                return (
                                    <Pressable
                                        key={option.value}
                                        style={[
                                            styles.sortOptionRow,
                                            isDark && { borderColor: '#252525', backgroundColor: '#0f0f10' },
                                            isSelected && styles.sortOptionRowSelected,
                                            isSelected && isDark && styles.sortOptionRowSelectedDark,
                                        ]}
                                        onPress={() => handleAndroidSortSelect(option.value)}
                                    >
                                        <Text
                                            style={[
                                                styles.sortOptionText,
                                                isDark && { color: '#e5e7eb' },
                                                isSelected && styles.sortOptionTextSelected,
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                        {isSelected && (
                                            <MaterialIcons name="check-circle" size={20} color={isDark ? '#fff' : '#0f172a'} />
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    </BottomSheetView>
                </BottomSheetModal>
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
    sheetBackground: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    sheetHandle: {
        backgroundColor: '#d1d5db',
        width: 40,
    },
    sheetContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a',
    },
    sheetSubtitle: {
        marginTop: 4,
        marginBottom: 16,
        fontSize: 13,
        fontWeight: '500',
        color: '#64748b',
    },
    sortOptionList: {
        gap: 10,
    },
    sortOptionRow: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        backgroundColor: '#fff',
        paddingHorizontal: 14,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sortOptionRowSelected: {
        borderColor: '#0f172a',
        backgroundColor: '#f8fafc',
    },
    sortOptionRowSelectedDark: {
        borderColor: '#fff',
        backgroundColor: '#1f2937',
    },
    sortOptionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
    },
    sortOptionTextSelected: {
        fontWeight: '900',
    },
});
