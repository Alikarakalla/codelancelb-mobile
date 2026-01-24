import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, Stack } from 'expo-router';
import { useForm } from 'react-hook-form';
import { FormInput } from '@/components/ui/FormInput';
import { useAuth } from '@/hooks/use-auth-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const { login, loginWithGoogle, isAuthenticated } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        redirectUri: makeRedirectUri({
            scheme: 'codelanclbmobile'
        }),
    });

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                handleGoogleLogin(authentication.accessToken);
            }
        }
    }, [response]);

    const handleGoogleLogin = async (token: string) => {
        setLoading(true);
        try {
            await loginWithGoogle(token);
            router.back();
        } catch (error: any) {
            console.error(error);
            Alert.alert(
                'Google Login Failed',
                'Something went wrong with Google Login. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            await login(data);
            router.back();
        } catch (error: any) {
            console.error(error);
            Alert.alert(
                'Login Failed',
                error.message.includes('422')
                    ? 'The provided credentials are incorrect.'
                    : 'Something went wrong. Please try again.'
            );
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
                            <Text style={styles.title}>SIGN IN</Text>
                            <View style={styles.titleUnderline} />
                        </View>

                        {/* Form Section */}
                        <View style={styles.form}>
                            <FormInput
                                control={control}
                                name="email"
                                label="EMAIL"
                                placeholder="your@email.com"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                rules={{
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                }}
                                containerStyle={styles.inputContainer}
                            />

                            <FormInput
                                control={control}
                                name="password"
                                label="PASSWORD"
                                placeholder="********"
                                secureTextEntry={!showPassword}
                                rules={{ required: 'Password is required' }}
                                containerStyle={styles.inputContainer}
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

                            <View style={styles.forgotRow}>
                                <Pressable onPress={() => router.push('/forgot-password')}>
                                    <Text style={styles.forgotText}>Forgot Password?</Text>
                                </Pressable>
                            </View>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.loginButton,
                                    pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] }
                                ]}
                                onPress={handleSubmit(onSubmit)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Text style={styles.loginButtonText}>AUTHENTICATING...</Text>
                                ) : (
                                    <Text style={styles.loginButtonText}>LOGIN</Text>
                                )}
                            </Pressable>

                            <View style={styles.dividerRow}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>SECURE LOGIN</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <View style={styles.socialRow}>
                                <Pressable
                                    style={styles.socialButton}
                                    onPress={() => promptAsync()}
                                    disabled={!request}
                                >
                                    <IconSymbol name="person.circle" size={20} color={isDark ? "#fff" : "#000"} />
                                    <Text style={styles.socialButtonText}>GOOGLE</Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>NEW HERE?</Text>
                            <Pressable onPress={() => router.push('/signup')}>
                                <Text style={styles.signUpText}>CREATE ACCOUNT</Text>
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
        backgroundColor: isDark ? '#000000' : '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    backButton: {
        width: 20,
        height: 20,
        borderRadius: 50,
        backgroundColor: 'transparent', // Important: Let the system provide the glass
        justifyContent: 'center',
        alignItems: 'center',
        // On iOS 26, the system wraps this Pressable in a glass bubble automatically
        // if it's inside a native header and has a fixed width/height.
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
        fontSize: 42,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
        letterSpacing: -1,
    },
    titleUnderline: {
        width: 40,
        height: 6,
        backgroundColor: isDark ? '#fff' : '#000',
        marginTop: 4,
    },
    form: {
        gap: 12,
    },
    inputContainer: {
        marginBottom: 4,
    },
    forgotRow: {
        alignItems: 'flex-end',
        marginTop: -4,
    },
    forgotText: {
        fontSize: 12,
        fontWeight: '700',
        color: isDark ? '#fff' : '#000',
        textTransform: 'uppercase',
        opacity: 0.6,
    },
    loginButton: {
        height: 64,
        backgroundColor: isDark ? '#fff' : '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        borderRadius: 8,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '900',
        color: isDark ? '#000' : '#fff',
        letterSpacing: 2,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginVertical: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    dividerText: {
        fontSize: 10,
        fontWeight: '800',
        color: isDark ? '#fff' : '#000',
        opacity: 0.3,
        letterSpacing: 1,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 12,
    },
    socialButton: {
        flex: 1,
        height: 56,
        borderWidth: 2,
        borderColor: isDark ? '#fff' : '#000',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: isDark ? '#fff' : '#000',
        letterSpacing: 1,
    },
    footer: {
        marginTop: 40,
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
    signUpText: {
        fontSize: 14,
        fontWeight: '900',
        color: isDark ? '#fff' : '#000',
        textTransform: 'uppercase',
        textDecorationLine: 'underline',
    },
});
