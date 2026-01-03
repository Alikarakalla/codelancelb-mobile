import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth-context';
import { useRouter } from 'expo-router';

export function ProfileHeader() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const getTierName = () => {
        if (!user?.loyaltyTier) return 'Member';
        return user.loyaltyTier.name || 'Member';
    };

    const getUserAvatar = () => {
        if (user?.avatar) return user.avatar;
        return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'Guest') + '&size=256&background=1152d4&color=fff';
    };

    if (!isAuthenticated || !user) {
        return (
            <View style={[styles.container, { backgroundColor: isDark ? '#1a2230' : '#ffffff' }]}>
                <View style={styles.avatarWrapper}>
                    <Image
                        source={{ uri: 'https://ui-avatars.com/api/?name=Guest&size=256&background=9ca3af&color=fff' }}
                        style={styles.avatar}
                        contentFit="cover"
                    />
                </View>

                <View style={styles.infoContainer}>
                    <Text style={[styles.name, { color: isDark ? '#fff' : '#111318' }]}>Guest</Text>
                    <Pressable onPress={() => router.push('/login')}>
                        <Text style={[styles.badgeText, { color: '#1152d4', fontWeight: '600' }]}>Sign In</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#1a2230' : '#ffffff' }]}>
            <View style={styles.avatarWrapper}>
                <Image
                    source={{ uri: getUserAvatar() }}
                    style={styles.avatar}
                    contentFit="cover"
                />
                <Pressable style={[styles.cameraButton, {
                    backgroundColor: '#1152d4',
                    borderColor: isDark ? '#1a2230' : '#ffffff',
                }]}>
                    <MaterialIcons name="photo-camera" size={18} color="#fff" />
                </Pressable>
            </View>

            <View style={styles.infoContainer}>
                <Text style={[styles.name, { color: isDark ? '#fff' : '#111318' }]}>{user.name}</Text>
                <View style={styles.badgeContainer}>
                    <MaterialIcons name="verified" size={18} color="#f59e0b" />
                    <Text style={[styles.badgeText, { color: isDark ? '#9ca3af' : '#616f89' }]}>{getTierName()}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 24,
        paddingBottom: 32,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 112,
        height: 112,
        borderRadius: 56,
        backgroundColor: '#e5e7eb',
        borderWidth: 4,
        borderColor: '#ffffff',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    infoContainer: {
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
