import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function SecuritySettings() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Security</Text>

            <View style={styles.card}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>CURRENT PASSWORD</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value="password123"
                            secureTextEntry={!showCurrent}
                        />
                        <Pressable
                            onPress={() => setShowCurrent(!showCurrent)}
                            style={styles.eyeIcon}
                        >
                            <MaterialIcons
                                name={showCurrent ? "visibility" : "visibility-off"}
                                size={20}
                                color={isDark ? '#9ca3af' : '#616f89'}
                            />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>NEW PASSWORD</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                            secureTextEntry={!showNew}
                        />
                        <Pressable
                            onPress={() => setShowNew(!showNew)}
                            style={styles.eyeIcon}
                        >
                            <MaterialIcons
                                name={showNew ? "visibility" : "visibility"}
                                size={20}
                                color={isDark ? '#9ca3af' : '#616f89'}
                            />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                            secureTextEntry={true}
                        />
                    </View>
                </View>

                <Pressable style={styles.updateButton}>
                    <Text style={styles.buttonText}>Update Password</Text>
                </Pressable>
            </View>
        </View>
    );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        gap: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: isDark ? '#fff' : '#111318',
        paddingHorizontal: 4,
    },
    card: {
        backgroundColor: isDark ? '#1a2230' : '#ffffff',
        borderRadius: 16,
        padding: 16,
        gap: 16,
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#f3f4f6',
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: isDark ? '#9ca3af' : '#616f89',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#e5e7eb',
        backgroundColor: isDark ? '#111827' : '#ffffff',
        color: isDark ? '#fff' : '#111318',
        paddingHorizontal: 16,
        paddingRight: 48,
        fontSize: 15,
    },
    eyeIcon: {
        position: 'absolute',
        right: 0,
        padding: 14,
    },
    divider: {
        height: 1,
        backgroundColor: isDark ? '#374151' : '#f3f4f6',
    },
    updateButton: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#e5e7eb',
        backgroundColor: isDark ? '#1f2937' : '#f9fafb',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: isDark ? '#fff' : '#111318',
    },
});
