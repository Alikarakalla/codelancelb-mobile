import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

const CATEGORIES = ['All', 'Women', 'Men', 'Accessories', 'Shoes'];

export function CategoryChips() {
    const [selected, setSelected] = React.useState('All');

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {CATEGORIES.map((cat) => {
                    const isSelected = selected === cat;
                    return (
                        <Pressable
                            key={cat}
                            onPress={() => setSelected(cat)}
                            style={({ pressed }) => [
                                styles.chip,
                                isSelected ? styles.chipSelected : styles.chipUnselected,
                                pressed && styles.pressed
                            ]}
                        >
                            <Text style={[
                                styles.text,
                                isSelected ? styles.textSelected : styles.textUnselected
                            ]}>
                                {cat}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    chip: {
        height: 40,
        paddingHorizontal: 24,
        borderRadius: 20, // full
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    chipSelected: {
        backgroundColor: '#1152d4', // primary
        borderColor: '#1152d4',
        shadowColor: '#1152d4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, // shadow-primary/20
        shadowRadius: 8,
        elevation: 4,
    },
    chipUnselected: {
        backgroundColor: '#fff',
        borderColor: '#F1F5F9', // slate-100
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    text: {
        fontSize: 14,
        fontWeight: '700', // bold/semibold
    },
    textSelected: {
        color: '#fff',
    },
    textUnselected: {
        color: '#334155', // slate-700
    },
});
