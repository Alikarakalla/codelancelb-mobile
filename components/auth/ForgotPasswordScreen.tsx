import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, Stack } from 'expo-router';
import { useForm } from 'react-hook-form';
import { FormInput } from '@/components/ui/FormInput';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { api } from '@/services/apiClient';

export default function ForgotPasswordScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: '',
        }
    });

    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: { email: string }) => {
        setLoading(true);
        try {
            const response = await api.forgotPassword(data.email);
            if (response.message) {
                Alert.alert(
                    'Email Sent',
                    'Check your email for the reset token/link. Then enter it on the next screen.',
                    [
                        {
                            text: 'Go to Reset',
                            onPress: () => router.push({ pathname: '/reset-password', params: { email: data.email } })
                        }
                    ]
                );
            } else {
                Alert.alert('Error', 'Could not send reset link.');
            }
        } catch (error: any) {
            console.error('Forgot Password Error:', error);
            let errorMessage = error.message?.includes('422') || error.message?.includes('404')
                ? 'We could not find a user with that email address.'
                : 'Something went wrong. Please try again.';

            // Heuristic for Laravel 500 Error on Forgot Password (usually SMTP)
            if (error.message?.includes('500') || error.message?.includes('Server Error')) {
                errorMessage = 'Server Error. The backend may have an issue sending emails (Check SMTP config).';
            }

            Alert.alert('Request Failed', errorMessage);
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
                            <MaterialIcons name="lock-reset" size={32} color="#000" />
                        </View>
                        <Text style={styles.title}>Forgot Password</Text>
                        <Text style={styles.subtitle}>Enter your email to receive a reset token</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <FormInput
                            control={control}
                            name="email"
                            label="Email Address"
                            placeholder="Enter your email"
                            icon="mail-outline"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            rules={{
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
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
                                    <Text style={styles.loginButtonText}>Send Reset Link</Text>
                                    <MaterialIcons name="send" size={20} color="#fff" />
                                </>
                            )}
                        </Pressable>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Remember your password?</Text>
                        <Pressable onPress={() => router.back()}>
                            <Text style={styles.signUpText}>Log In</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Option to skip to reset if they already have a token */}
                <Pressable onPress={() => router.push('/reset-password')} style={{ marginTop: 20 }}>
                    <Text style={{ color: isDark ? '#60a5fa' : '#3b82f6', fontSize: 14, fontWeight: '600' }}>
                        Already have a token? Click here
                    </Text>
                </Pressable>

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
    footer: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 4,
        borderTopWidth: 1,
        borderTopColor: isDark ? '#2a3441' : '#f3f4f6',
        backgroundColor: isDark ? '#151b26' : '#f9fafb',
    },
    footerText: {
        fontSize: 14,
        fontWeight: '500',
        color: isDark ? '#9ca3af' : '#616f89',
    },
    signUpText: {
        fontSize: 14,
        fontWeight: '700',
        color: isDark ? '#fff' : '#000',
    },
});
