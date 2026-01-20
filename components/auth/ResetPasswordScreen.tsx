import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { FormInput } from '@/components/ui/FormInput';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { api } from '@/services/apiClient';

export default function ResetPasswordScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams();

    // Provide a fallback if email is not in params or if it's an array
    const initialEmail = typeof params.email === 'string' ? params.email : (Array.isArray(params.email) ? params.email[0] : '');
    const initialToken = typeof params.token === 'string' ? params.token : (Array.isArray(params.token) ? params.token[0] : '');

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);

    const { control, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            email: initialEmail,
            token: initialToken,
            password: '',
            confirmPassword: '',
        }
    });

    useEffect(() => {
        if (initialEmail) setValue('email', initialEmail);
        if (initialToken) setValue('token', initialToken);
    }, [initialEmail, initialToken, setValue]);

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const pwd = watch('password');

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const response = await api.resetPassword({
                email: data.email,
                token: data.token,
                password: data.password,
                password_confirmation: data.confirmPassword,
            });

            if (response.message === 'Your password has been reset!' || response.message?.toLowerCase().includes('reset')) {
                Alert.alert('Success', 'Your password has been reset successfully!', [
                    { text: 'Login', onPress: () => router.dismissAll() } // Or navigate to login
                ]);
            } else {
                Alert.alert('Error', response.message || 'Failed to reset password.');
            }
        } catch (error: any) {
            console.error('Reset Password Error:', error);
            const errorMessage = error.message?.includes('422')
                ? 'Invalid token or passwords do not match.'
                : 'Something went wrong. Please check your token and try again.';
            Alert.alert('Reset Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#101622' : '#ffffff' }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTransparent: true,
                    headerTitle: '',
                    headerLeft: () => (
                        <Pressable
                            onPress={() => router.back()}
                            style={styles.nativeGlassWrapper}
                        >
                            <IconSymbol
                                name="chevron.left"
                                color={isDark ? '#fff' : '#000'}
                                size={24}
                                weight="medium"
                            />
                        </Pressable>
                    ),
                } as any}
            />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: 60 + insets.top }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconBox}>
                            <MaterialIcons name="lock-open" size={32} color="#000" />
                        </View>
                        <Text style={styles.title}>Reset Password</Text>
                        <Text style={styles.subtitle}>Enter the code from your email and a new password.</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <FormInput
                            control={control}
                            name="email"
                            label="Email Address"
                            placeholder="Confirm your email"
                            icon="mail-outline"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            rules={{ required: 'Email is required' }}
                        />

                        <FormInput
                            control={control}
                            name="token"
                            label="Reset Token"
                            placeholder="Paste token here"
                            icon="vpn-key"
                            autoCapitalize="none"
                            rules={{ required: 'Token is required' }}
                        />

                        <FormInput
                            control={control}
                            name="password"
                            label="New Password"
                            placeholder="Enter new password"
                            icon="lock-outline"
                            secureTextEntry={!showPassword}
                            rules={{
                                required: 'Password is required',
                                minLength: { value: 8, message: 'Must be at least 8 characters' }
                            }}
                            rightElement={
                                <Pressable onPress={() => setShowPassword(!showPassword)}>
                                    <MaterialIcons
                                        name={showPassword ? "visibility" : "visibility-off"}
                                        size={20}
                                        color="#9ca3af"
                                    />
                                </Pressable>
                            }
                        />

                        <FormInput
                            control={control}
                            name="confirmPassword"
                            label="Confirm Password"
                            placeholder="Re-enter new password"
                            icon="lock-outline"
                            secureTextEntry={!showPassword}
                            rules={{
                                required: 'Please confirm password',
                                validate: value => value === pwd || 'Passwords do not match'
                            }}
                        />


                        {/* Submit Button */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.loginButton,
                                pressed && styles.loginButtonPressed
                            ]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>Reset Password</Text>
                                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                                </>
                            )}
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
        alignItems: 'center',
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: isDark ? '#1a2230' : '#ffffff',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: isDark ? '#2a3441' : '#e5e7eb',
        overflow: 'hidden',
        marginTop: 20,
    },
    header: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: isDark ? '#fff' : '#111318',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: isDark ? '#9ca3af' : '#616f89',
        textAlign: 'center',
    },
    form: {
        padding: 24,
        gap: 20,
        paddingBottom: 40,
    },
    loginButton: {
        height: 56,
        backgroundColor: '#000',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 8,
    },
    loginButtonPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    nativeGlassWrapper: {
        width: 32,
        height: 32,
        borderRadius: 50,
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
});
