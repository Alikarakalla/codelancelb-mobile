import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function ProfileHeader() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#1a2230' : '#ffffff' }]}>
            <View style={styles.avatarWrapper}>
                <Image
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_Q_ksyb8HoLCaS0okS7HJaioYo7KP3YJZZpddrsdZvAhRmrbzNFUcJ0Nf8WX-Z7s9N6EPi_zeszi6y7v2afqlsRL3LOkDvxYR85M-CrJkwWjJ4B4HnRT5fwPQ76rVQBIxMinmwxXA9MNp_WNssVr3YbfNtmnTfPRDWl03aUb4eoj6Wn-XiL846QQFxD-E-6_1qT8TazJQUIxOlySkFD9iekvh68IuG_2ONYcxGmP4gIF_Dgf8P22MuNJ4mvkK9-rWTfqcGjQrcTL6' }}
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
                <Text style={[styles.name, { color: isDark ? '#fff' : '#111318' }]}>Jane Doe</Text>
                <View style={styles.badgeContainer}>
                    <MaterialIcons name="verified" size={18} color="#f59e0b" />
                    <Text style={[styles.badgeText, { color: isDark ? '#9ca3af' : '#616f89' }]}>Gold Member</Text>
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
