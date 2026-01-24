import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
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
                    'EMAIL SENT',
                    'CHECK YOUR EMAIL FOR THE RESET TOKEN.',
                    [
                        {
                            text: 'PROCEED TO RESET',
                            onPress: () => router.push({ pathname: '/reset-password', params: { email: data.email } })
                        }
                    ]
                );
            } else {
                Alert.alert('ERROR', 'COULD NOT SEND RESET LINK.');
            }
        } catch (error: any) {
            console.error('Forgot Password Error:', error);
            let errorMessage = error.message?.includes('422') || error.message?.includes('404')
                ? 'WE COULD NOT FIND A USER WITH THAT EMAIL ADDRESS.'
                : 'SOMETHING WENT WRONG. PLEASE TRY AGAIN.';

            if (error.message?.includes('500') || error.message?.includes('Server Error')) {
                errorMessage = 'SERVER ERROR. PLEASE TRY AGAIN LATER.';
            }

            Alert.alert('REQUEST FAILED', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        headerShown: true,
                        headerTransparent: true,
                        headerTitle: '',
                        headerLeft: () => (
                            <Pressable
                                onPress={() => router.back()}
                                style={styles.backButton}
                            >
                                <IconSymbol
                                    name="chevron.left"
                                    color={isDark ? '#fff' : '#000'}
                                    size={24}
                                />
                            </Pressable>
                        )
                    }}
                />

                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 80 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.content}>
                        {/* Minimalist Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>FORGOT</Text>
                            <Text style={styles.titleBold}>PASSWORD</Text>
                            <View style={styles.titleUnderline} />
                            <Text style={styles.subtitle}>ENTER YOUR EMAIL TO RECEIVE A RESET TOKEN</Text>
                        </View>

                        {/* Form Section */}
                        <View style={styles.form}>
                            <FormInput
                                control={control}
                                name="email"
                                label="EMAIL"
                                placeholder="YOUR@EMAIL.COM"
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

                            <Pressable
                                style={({ pressed }) => [
                                    styles.submitButton,
                                    pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] }
                                ]}
                                onPress={handleSubmit(onSubmit)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={isDark ? '#000' : '#fff'} />
                                ) : (
                                    <View style={styles.buttonContent}>
                                        <Text style={styles.submitButtonText}>SEND RESET LINK</Text>
                                        <MaterialIcons name="arrow-forward" size={20} color={isDark ? '#000' : '#fff'} />
                                    </View>
                                )}
                            </Pressable>
                        </View>

                        {/* Secondary Options */}
                        <View style={styles.options}>
                            <Pressable onPress={() => router.push('/reset-password')} style={styles.optionItem}>
                                <Text style={styles.optionText}>ALREADY HAVE A TOKEN?</Text>
                            </Pressable>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>REMEMBERED IT?</Text>
                            <Pressable onPress={() => router.back()}>
                                <Text style={styles.loginLinkText}>LOG IN</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDark ? '#000' : '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        marginBottom: 32,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 36,
        fontWeight: '300',
        color: isDark ? '#fff' : '#000',
        letterSpacing: -1,
    },
    titleBold: {
        fontSize: 42,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
        letterSpacing: -1,
        marginTop: -10,
    },
    titleUnderline: {
        width: 40,
        height: 6,
        backgroundColor: isDark ? '#fff' : '#000',
        marginTop: 4,
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 10,
        fontWeight: '700',
        color: isDark ? '#fff' : '#000',
        opacity: 0.5,
        letterSpacing: 1,
    },
    form: {
        gap: 12,
    },
    submitButton: {
        height: 64,
        backgroundColor: isDark ? '#fff' : '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        borderRadius: 8,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '900',
        color: isDark ? '#000' : '#fff',
        letterSpacing: 2,
    },
    options: {
        marginTop: 24,
        alignItems: 'center',
    },
    optionItem: {
        paddingVertical: 8,
    },
    optionText: {
        fontSize: 12,
        fontWeight: '800',
        color: isDark ? '#fff' : '#000',
        textDecorationLine: 'underline',
        opacity: 0.6,
    },
    footer: {
        marginTop: 64,
        alignItems: 'center',
        gap: 8,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '700',
        color: isDark ? '#fff' : '#000',
        opacity: 0.4,
        letterSpacing: 1,
    },
    loginLinkText: {
        fontSize: 14,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
        textTransform: 'uppercase',
        textDecorationLine: 'underline',
    },
});
