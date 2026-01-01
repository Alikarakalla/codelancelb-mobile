import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FILTERS = ['All Reviews', 'With Photos', '5 Stars', 'Newest'];

export function ReviewFilters() {
    const [selected, setSelected] = React.useState('All Reviews');

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {FILTERS.map((f) => {
                const isSelected = selected === f;
                return (
                    <Pressable
                        key={f}
                        onPress={() => setSelected(f)}
                        style={[
                            styles.chip,
                            isSelected ? styles.chipSelected : styles.chipDefault
                        ]}
                    >
                        {f === '5 Stars' && (
                            <Ionicons name="star" size={14} color={isSelected ? '#FBBF24' : '#FBBF24'} style={{ marginRight: 4 }} />
                        )}
                        <Text style={[styles.text, isSelected ? styles.textSelected : styles.textDefault]}>
                            {f === '5 Stars' ? '5' : f}
                        </Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        gap: 10,
        paddingVertical: 4, // for shadow clipping if needed
    },
    chip: {
        height: 36,
        paddingHorizontal: 20,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    chipDefault: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    chipSelected: {
        backgroundColor: '#0F172A',
        borderWidth: 1,
        borderColor: '#0F172A',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
    },
    textDefault: {
        color: '#475569',
    },
    textSelected: {
        color: '#fff',
    },
});
