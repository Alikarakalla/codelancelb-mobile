import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Platform, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { LuxeHeader } from '@/components/home/LuxeHeader';

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);

    const [form, setForm] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        // Simulate login
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        router.back(); // Or navigate to home
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#101622' : '#f6f6f8' }]}>
            <LuxeHeader
                title="Login"
                showBackButton={true}
            />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: 60 + insets.top }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>


                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
                                    value={form.email}
                                    onChangeText={(t) => setForm({ ...form, email: t })}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <View style={styles.inputIcon}>
                                    <MaterialIcons name="mail" size={20} color="#9ca3af" />
                                </View>
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={[styles.input, { paddingRight: 48 }]}
                                    placeholder="Enter your password"
                                    placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
                                    value={form.password}
                                    onChangeText={(t) => setForm({ ...form, password: t })}
                                    secureTextEntry={!showPassword}
                                />
                                <Pressable
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <MaterialIcons
                                        name={showPassword ? "visibility" : "visibility-off"}
                                        size={20}
                                        color="#9ca3af"
                                    />
                                </Pressable>
                            </View>
                        </View>

                        {/* Forgot Password */}
                        <View style={styles.forgotRow}>
                            <Pressable>
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </Pressable>
                        </View>

                        {/* Login Button */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.loginButton,
                                pressed && styles.loginButtonPressed
                            ]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <Text style={styles.loginButtonText}>Logging in...</Text>
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>Log In</Text>
                                    <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                                </>
                            )}
                        </Pressable>

                        {/* Divider */}
                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <View style={styles.dividerTextWrapper}>
                                <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                            </View>
                        </View>

                        {/* Social Buttons */}
                        <View style={styles.socialRow}>
                            <Pressable style={styles.socialButton}>
                                {/* Google Icon */}
                                <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={{ width: 24, height: 24 }} />
                                <Text style={styles.socialButtonText}>Google</Text>
                            </Pressable>
                            <Pressable style={styles.socialButton}>
                                {/* Facebook Icon */}
                                <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/733/733547.png' }} style={{ width: 24, height: 24 }} />
                                <Text style={styles.socialButtonText}>Facebook</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account?</Text>
                        <Pressable onPress={() => router.push('/signup')}>
                            <Text style={styles.signUpText}>Sign Up</Text>
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
        backgroundColor: 'rgba(17, 82, 212, 0.1)',
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
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: isDark ? '#fff' : '#111318',
    },
    inputWrapper: {
        position: 'relative',
    },
    input: {
        height: 56,
        backgroundColor: isDark ? '#101622' : '#ffffff',
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#dbdfe6',
        borderRadius: 12,
        paddingLeft: 16,
        paddingRight: 16, // adjusted dynamically for password
        fontSize: 16,
        color: isDark ? '#fff' : '#111318',
    },
    inputIcon: {
        position: 'absolute',
        right: 16,
        top: 18,
    },
    eyeIcon: {
        position: 'absolute',
        right: 0,
        top: 0,
        height: 56,
        width: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    forgotRow: {
        alignItems: 'flex-end',
    },
    forgotText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1152d4',
    },
    loginButton: {
        height: 56,
        backgroundColor: '#1152d4',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#1152d4',
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
    loginButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    dividerRow: {
        position: 'relative',
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 4,
    },
    dividerLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: isDark ? '#374151' : '#e5e7eb',
    },
    dividerTextWrapper: {
        backgroundColor: isDark ? '#1a2230' : '#ffffff',
        paddingHorizontal: 16,
    },
    dividerText: {
        fontSize: 12,
        fontWeight: '500',
        color: isDark ? '#9ca3af' : '#616f89',
        letterSpacing: 1,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 16,
    },
    socialButton: {
        flex: 1,
        height: 56,
        backgroundColor: isDark ? '#101622' : '#ffffff',
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    socialButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: isDark ? '#fff' : '#111318',
    },
    footer: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 4,
        borderTopWidth: 1,
        borderTopColor: isDark ? '#2a3441' : '#f3f4f6',
    },
    footerText: {
        fontSize: 14,
        fontWeight: '500',
        color: isDark ? '#9ca3af' : '#616f89',
    },
    signUpText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1152d4',
    },
});
