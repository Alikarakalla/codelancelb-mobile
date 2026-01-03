import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function PromoCodeInput() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={styles.container}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Promo Code</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    placeholder="Enter code"
                    placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                />
                <Pressable style={[styles.applyBtn, isDark && styles.applyBtnDark]}>
                    <Text style={[styles.applyText, isDark && styles.applyTextDark]}>Apply</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0F172A',
        marginBottom: 8,
        marginLeft: 4,
    },
    labelDark: {
        color: '#F8FAFC',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        height: 48,
        paddingLeft: 16,
        paddingRight: 80,
        fontSize: 14,
        color: '#0F172A',
    },
    inputDark: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        color: '#F8FAFC',
    },
    applyBtn: {
        position: 'absolute',
        right: 8,
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },
    applyBtnDark: {
        backgroundColor: '#374151',
    },
    applyText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    applyTextDark: {
        color: '#F8FAFC',
    },
});
