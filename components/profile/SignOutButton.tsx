import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function SignOutButton() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={styles.container}>
            <Pressable
                style={[
                    styles.button,
                    {
                        backgroundColor: isDark ? 'rgba(127, 29, 29, 0.1)' : '#fef2f2',
                        borderColor: isDark ? 'rgba(127, 29, 29, 0.5)' : '#fecaca'
                    }
                ]}
            >
                <MaterialIcons name="logout" size={20} color={isDark ? '#f87171' : '#dc2626'} />
                <Text style={[styles.text, { color: isDark ? '#f87171' : '#dc2626' }]}>Sign Out</Text>
            </Pressable>

            <Text style={[styles.version, { color: isDark ? '#6b7280' : '#9ca3af' }]}>
                App Version 2.4.0 (Build 1045)
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        marginBottom: 40,
        gap: 16,
    },
    button: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
    },
});
