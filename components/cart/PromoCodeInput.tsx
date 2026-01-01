import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';

export function PromoCodeInput() {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Promo Code</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter code"
                    placeholderTextColor="#94A3B8"
                />
                <Pressable style={styles.applyBtn}>
                    <Text style={styles.applyText}>Apply</Text>
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
        paddingRight: 80, // Space for button
        fontSize: 14,
        color: '#0F172A',
    },
    applyBtn: {
        position: 'absolute',
        right: 8,
        backgroundColor: '#F1F5F9', // background-light
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },
    applyText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1152d4',
    },
});
