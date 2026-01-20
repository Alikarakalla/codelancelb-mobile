import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth-context';
import { useRouter } from 'expo-router';
import { api } from '@/services/apiClient';
import * as ImagePicker from 'expo-image-picker';

export function ProfileHeader() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user, isAuthenticated, reloadUser } = useAuth();
    const router = useRouter();

    const [tier, setTier] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchTier();
        }
    }, [isAuthenticated, user?.loyalty_points_balance]);

    // Reset error when avatar changes
    useEffect(() => {
        setImageError(false);
    }, [user?.avatar]);

    const fetchTier = async () => {
        try {
            const tiers = await api.getLoyaltyTiers();
            if (tiers && Array.isArray(tiers)) {
                // Determine tier based on points
                const points = user?.loyalty_points_balance || 0;
                const sorted = [...tiers].sort((a: any, b: any) => a.min_points - b.min_points);
                let current = null;
                for (let i = sorted.length - 1; i >= 0; i--) {
                    if (points >= sorted[i].min_points) {
                        current = sorted[i];
                        break;
                    }
                }
                setTier(current);
            }
        } catch (e) {
            // silent fail
        }
    };

    const handleAvatarPress = () => {
        Alert.alert(
            "Update Profile Photo",
            "Choose an option",
            [
                { text: "Camera", onPress: openCamera },
                { text: "Gallery", onPress: openGallery },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const openCamera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.granted === false) {
            Alert.alert("Permission Required", "Please allow camera access to take photos.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadAvatar(result.assets[0]);
        }
    };

    const openGallery = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.granted === false) {
            Alert.alert("Permission Required", "Please allow photo library access.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadAvatar(result.assets[0]);
        }
    };

    const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
        if (!asset.uri) return;

        setUploading(true);
        try {
            const formData = new FormData();

            // Infer type
            const filename = asset.uri.split('/').pop() || 'profile.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('avatar', { uri: asset.uri, name: filename, type } as any);

            await api.uploadAvatar(formData);
            await reloadUser();
            Alert.alert("Success", "Profile photo updated successfully.");
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to upload profile photo.");
        } finally {
            setUploading(false);
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const getSafeIconName = (iconName: string) => {
        const map: Record<string, any> = {
            'award': 'workspace-premium',
            'trophy': 'emoji-events',
            'star': 'star',
            'shield': 'security',
            'crown': 'emoji-events'
        };
        // If the icon exists in map, return it. Otherwise return the original if it might be valid, or verified as fallback
        return map[iconName] || iconName || 'verified';
    };

    const getUserAvatarSource = () => {
        if (user?.avatar &&
            typeof user.avatar === 'string' &&
            user.avatar !== 'null' &&
            user.avatar !== 'undefined' &&
            user.avatar.trim() !== '' &&
            !user.avatar.includes('default.png') &&
            !user.avatar.includes('placeholder')
        ) {
            if (user.avatar.startsWith('http')) return { uri: user.avatar };
            return { uri: `https://codelanclb.com/storage/${user.avatar}` };
        }
        return null;
    };

    const rawIcon = tier?.icon || (user?.loyaltyTier as any)?.icon || (user as any)?.loyalty_tier?.icon || 'verified';
    const tierIcon = getSafeIconName(rawIcon);
    const tierName = tier?.name || (user?.loyaltyTier as any)?.name || (user as any)?.loyalty_tier?.name || 'Member';
    const tierColor = tier?.color || (user?.loyaltyTier as any)?.color || (user as any)?.loyalty_tier?.color || '#f59e0b';

    if (!isAuthenticated || !user) {
        return (
            <Pressable onPress={() => router.push('/login')} style={[styles.header, { backgroundColor: isDark ? '#1a2230' : '#ffffff' }]}>
                <View style={styles.avatarContainer}>
                    <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#333' : '#e2e8f0' }]}>
                        <MaterialIcons name="person" size={32} color={isDark ? '#fff' : '#64748b'} />
                    </View>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={[styles.name, { color: isDark ? '#fff' : '#111318' }]}>Sign In / Sign Up</Text>
                    <Text style={[styles.email, { color: isDark ? '#9ca3af' : '#64748b' }]}>Join our loyalty program</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={isDark ? '#64748b' : '#94a3b8'} />
            </Pressable>
        );
    }

    const avatarSource = getUserAvatarSource();

    return (
        <View style={[styles.header, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
            <View style={styles.avatarContainer}>
                {(avatarSource && !imageError) ? (
                    <Image
                        source={avatarSource}
                        style={styles.avatar}
                        contentFit="cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <LinearGradient
                        colors={['#18181b', '#000000']}
                        style={styles.avatarPlaceholder}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.initialsText}>{getInitials(user.name)}</Text>
                    </LinearGradient>
                )}

                {uploading && (
                    <View style={[styles.avatar, { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }]}>
                        <ActivityIndicator color="#fff" />
                    </View>
                )}

                <Pressable
                    style={[styles.cameraButton, {
                        backgroundColor: '#18181b',
                        borderColor: isDark ? '#1a2230' : '#ffffff',
                    }]}
                    onPress={handleAvatarPress}
                >
                    <MaterialIcons name="photo-camera" size={18} color="#fff" />
                </Pressable>
            </View>
            <View style={styles.infoContainer}>
                <Text style={[styles.name, { color: isDark ? '#fff' : '#111318' }]}>{user.name}</Text>
                <View style={styles.badgeContainer}>
                    <MaterialIcons
                        name={tierIcon as any}
                        size={18}
                        color={tierColor}
                    />
                    <Text style={[styles.badgeText, { color: isDark ? '#9ca3af' : '#616f89' }]}>{tierName}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12, // Increased padding
        gap: 16, // Increased gap
        borderRadius: 16,
        marginBottom: 8,
    },
    avatarContainer: {
        width: 64, // Larger avatar
        height: 64,
        borderRadius: 32,
        position: 'relative',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialsText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    name: {
        fontSize: 20, // Larger name
        fontWeight: '700',
    },
    email: {
        fontSize: 14,
        fontWeight: '500',
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.05)', // Subtle background for badge
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 2,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
