import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth-context';
import { useRouter } from 'expo-router';
import { api } from '@/services/apiClient';

export function SecuritySettings() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async () => {
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('Error', 'New password must be at least 8 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await api.updatePassword({
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });

            Alert.alert('Success', 'Password updated successfully', [
                {
                    text: 'OK',
                    onPress: () => {
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                    }
                }
            ]);
        } catch (error: any) {
            console.error('Password update error:', error);
            const errorMessage = error.message?.includes('422')
                ? 'Current password is incorrect or new password is invalid.'
                : 'Failed to update password. Please try again.';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated || !user) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Security</Text>
                <View style={styles.card}>
                    <View style={{ alignItems: 'center', padding: 24 }}>
                        <MaterialIcons name="lock-outline" size={48} color={isDark ? '#9ca3af' : '#616f89'} />
                        <Text style={[styles.label, { marginTop: 16, textAlign: 'center', fontSize: 14 }]}>Sign in to manage security settings</Text>
                        <Pressable
                            style={[styles.updateButton, { marginTop: 16, backgroundColor: '#1152d4', borderColor: '#1152d4' }]}
                            onPress={() => router.push('/login')}
                        >
                            <Text style={[styles.buttonText, { color: '#fff' }]}>Sign In</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Security</Text>

            <View style={styles.card}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>CURRENT PASSWORD</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry={!showCurrent}
                            placeholder="Enter current password"
                            placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
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
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Enter new password (min. 8 characters)"
                            placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                            secureTextEntry={!showNew}
                        />
                        <Pressable
                            onPress={() => setShowNew(!showNew)}
                            style={styles.eyeIcon}
                        >
                            <MaterialIcons
                                name={showNew ? "visibility" : "visibility-off"}
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
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Re-enter new password"
                            placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                            secureTextEntry={!showConfirm}
                        />
                        <Pressable
                            onPress={() => setShowConfirm(!showConfirm)}
                            style={styles.eyeIcon}
                        >
                            <MaterialIcons
                                name={showConfirm ? "visibility" : "visibility-off"}
                                size={20}
                                color={isDark ? '#9ca3af' : '#616f89'}
                            />
                        </Pressable>
                    </View>
                </View>

                <Pressable
                    style={[
                        styles.updateButton,
                        {
                            backgroundColor: '#1152d4',
                            borderColor: '#1152d4',
                            opacity: loading ? 0.7 : 1,
                        }
                    ]}
                    onPress={handleUpdatePassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={[styles.buttonText, { color: '#fff' }]}>Update Password</Text>
                    )}
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
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
