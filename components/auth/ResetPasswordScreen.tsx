import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
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
            otp: initialToken, // Using otp field
            password: '',
            confirmPassword: '',
        }
    });

    useEffect(() => {
        if (initialEmail) setValue('email', initialEmail);
        if (initialToken) setValue('otp', initialToken);
    }, [initialEmail, initialToken, setValue]);

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const pwd = watch('password');
    const otpValue = watch('otp');

    const otpInputRef = useRef<TextInput>(null);

    const onSubmit = async (data: any) => {
        if (data.otp.length !== 6) {
            Alert.alert('INVALID CODE', 'PLEASE ENTER THE 6-DIGIT CODE SENT TO YOUR EMAIL.');
            return;
        }

        setLoading(true);
        try {
            // Updated to send as 'otp' as per user backend changes
            // Note: api.resetPassword might need update if it specifically looks for 'token'
            const response = await api.resetPassword({
                email: data.email,
                otp: data.otp,
                password: data.password,
                password_confirmation: data.confirmPassword,
            });

            if (response.message === 'Your password has been reset!' || response.message?.toLowerCase().includes('reset')) {
                Alert.alert('SUCCESS', 'YOUR PASSWORD HAS BEEN RESET SUCCESSFULLY!', [
                    { text: 'LOGIN', onPress: () => router.dismissAll() }
                ]);
            } else {
                Alert.alert('ERROR', response.message || 'FAILED TO RESET PASSWORD.');
            }
        } catch (error: any) {
            console.error('Reset Password Error:', error);
            const errorMessage = error.message?.includes('422')
                ? 'INVALID CODE OR PASSWORDS DO NOT MATCH.'
                : 'SOMETHING WENT WRONG. PLEASE CHECK YOUR CODE AND TRY AGAIN.';
            Alert.alert('RESET FAILED', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderOtpBoxes = () => {
        const boxes = [];
        for (let i = 0; i < 6; i++) {
            const digit = otpValue?.[i] || '';
            const isFocused = otpValue?.length === i || (i === 5 && otpValue?.length === 6);
            boxes.push(
                <View
                    key={i}
                    style={[
                        styles.otpBox,
                        digit !== '' && styles.otpBoxFilled,
                        isFocused && styles.otpBoxFocused
                    ]}
                >
                    <Text style={[styles.otpText, isFocused && styles.otpTextFocused]}>
                        {digit}
                    </Text>
                </View>
            );
        }
        return boxes;
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
                            <Text style={styles.title}>VERIFY</Text>
                            <Text style={styles.titleBold}>ACCOUNT</Text>
                            <View style={styles.titleUnderline} />
                            <Text style={styles.subtitle}>PLEASE ENTER THE 6-DIGIT CODE SENT TO YOUR EMAIL</Text>
                        </View>

                        {/* Form Section */}
                        <View style={styles.form}>
                            <FormInput
                                control={control}
                                name="email"
                                label="CONFIRM EMAIL"
                                placeholder="YOUR@EMAIL.COM"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                rules={{ required: 'Email is required' }}
                            />

                            <View style={styles.otpContainer}>
                                <View style={styles.labelRow}>
                                    <Text style={styles.label}>6-DIGIT CODE</Text>
                                    <Pressable onPress={() => {
                                        Alert.alert('CODE RESENT', 'WE HAVE SENT A NEW CODE TO YOUR EMAIL.');
                                        // Logic to call api.forgotPassword(email) again
                                        api.forgotPassword(watch('email')).catch(e => console.log('Resend failed', e));
                                    }}>
                                        <Text style={styles.resendText}>RESEND CODE</Text>
                                    </Pressable>
                                </View>
                                <View style={styles.inputWrapper}>
                                    <Pressable
                                        style={styles.otpBoxesWrapper}
                                        onPress={() => otpInputRef.current?.focus()}
                                    >
                                        {renderOtpBoxes()}
                                    </Pressable>

                                    <Controller
                                        control={control}
                                        name="otp"
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput
                                                ref={otpInputRef}
                                                value={value}
                                                onChangeText={(text) => {
                                                    const numericValue = text.replace(/[^0-9]/g, '');
                                                    if (numericValue.length <= 6) onChange(numericValue);
                                                }}
                                                keyboardType="number-pad"
                                                textContentType="oneTimeCode"
                                                autoComplete="one-time-code"
                                                style={styles.hiddenInput}
                                                maxLength={6}
                                                caretHidden={true}
                                                selectionColor="transparent"
                                            />
                                        )}
                                    />
                                </View>
                            </View>

                            <FormInput
                                control={control}
                                name="password"
                                label="NEW PASSWORD"
                                placeholder="••••••••"
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
                                            color={isDark ? "#fff" : "#000"}
                                        />
                                    </Pressable>
                                }
                            />

                            <FormInput
                                control={control}
                                name="confirmPassword"
                                label="CONFIRM PASSWORD"
                                placeholder="••••••••"
                                secureTextEntry={!showPassword}
                                rules={{
                                    required: 'Please confirm password',
                                    validate: value => value === pwd || 'Passwords do not match'
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
                                        <Text style={styles.submitButtonText}>RESET PASSWORD</Text>
                                        <MaterialIcons name="check-circle" size={20} color={isDark ? '#000' : '#fff'} />
                                    </View>
                                )}
                            </Pressable>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>NEVER MIND?</Text>
                            <Pressable onPress={() => router.replace('/login')}>
                                <Text style={styles.loginLinkText}>BACK TO LOGIN</Text>
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
        width: 20,
        height: 20,
        borderRadius: 50,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: 'transparent',
                marginHorizontal: 8,
            },
            android: {
                backgroundColor: 'rgba(0,0,0,0.05)',
                marginHorizontal: 8,
            }
        })
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
    label: {
        fontSize: 12,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
        marginBottom: 8,
        letterSpacing: 1,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    resendText: {
        fontSize: 10,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
        textDecorationLine: 'underline',
        opacity: 0.8,
    },
    otpContainer: {
        marginBottom: 16,
    },
    otpBoxesWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    otpBox: {
        flex: 1,
        height: 64,
        borderWidth: 2,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDark ? '#000' : '#fff',
    },
    otpBoxFilled: {
        borderColor: isDark ? '#fff' : '#000',
        backgroundColor: isDark ? '#111' : '#f9f9f9',
    },
    otpBoxFocused: {
        borderColor: isDark ? '#fff' : '#000',
        borderWidth: 3,
        transform: [{ scale: 1.05 }],
    },
    otpText: {
        fontSize: 26,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
    },
    otpTextFocused: {
        opacity: 0.3,
    },
    inputWrapper: {
        position: 'relative',
        height: 64, // Same as otpBox height
    },
    hiddenInput: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.01,
        color: 'transparent',
        fontSize: 1,
        backgroundColor: 'transparent',
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
