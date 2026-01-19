import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
    ScrollView,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Drawer } from 'react-native-drawer-layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 320);

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function SideDrawer({ isOpen, onClose, children }: SideDrawerProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const { isAuthenticated, user, logout } = useAuth();
    const isLoggedIn = isAuthenticated;

    const renderDrawerContent = useCallback(() => {
        const NavItem = ({ icon, label, badge, active = false }: any) => (
            <Pressable
                style={[
                    styles.navItem,
                    active && styles.navItemActive,
                    active && { backgroundColor: isDark ? 'rgba(17, 82, 212, 0.2)' : 'rgba(17, 82, 212, 0.1)' }
                ]}
            >
                <MaterialIcons
                    name={icon}
                    size={22}
                    color={active ? '#1152d4' : (isDark ? '#94a3b8' : '#475569')}
                />
                <Text style={[
                    styles.navLabel,
                    active && styles.navLabelActive,
                    { color: active ? '#1152d4' : (isDark ? '#cbd5e1' : '#1e293b') }
                ]}>
                    {label}
                </Text>
                {badge && (
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                )}
            </Pressable>
        );

        return (
            <View style={[styles.drawerContainer, { backgroundColor: isDark ? '#101622' : '#fff', paddingTop: insets.top }]}>
                {/* Header Gradient Blob Mockup */}
                <View style={[styles.glow, { backgroundColor: '#1152d4', opacity: 0.05 }]} />

                {/* Close Button */}
                <Pressable onPress={onClose} style={styles.closeButton}>
                    <MaterialIcons name="close" size={24} color={isDark ? '#94a3b8' : '#64748b'} />
                </Pressable>

                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatar, { backgroundColor: isLoggedIn ? '#1152d4' : (isDark ? '#374151' : '#e2e8f0') }]}>
                            {isLoggedIn ? (
                                <Text style={styles.avatarText}>{user?.name?.[0] || user?.email?.[0] || 'U'}</Text>
                            ) : (
                                <MaterialIcons name="person" size={32} color={isDark ? '#9ca3af' : '#64748b'} />
                            )}
                        </View>
                        {isLoggedIn && <View style={styles.onlineBadge} />}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={[styles.userName, { color: isDark ? '#fff' : '#0f172a' }]}>
                            {isLoggedIn ? (user?.name || 'User') : 'Welcome!'}
                        </Text>
                        <Pressable
                            style={styles.viewProfile}
                            onPress={() => {
                                onClose();
                                router.push(isLoggedIn ? '/(tabs)/profile' : '/login');
                            }}
                        >
                            <Text style={styles.viewProfileText}>
                                {isLoggedIn ? 'View Profile' : 'Log In / Sign Up'}
                            </Text>
                            <MaterialIcons name="arrow-forward" size={14} color="#1152d4" />
                        </Pressable>
                    </View>
                </View>

                {/* Navigation */}
                <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
                    <NavItem icon="home" label="Home" active />
                    <NavItem icon="diamond" label="New Arrivals" badge="NEW" />
                    <NavItem icon="grid-view" label="Categories" />
                    <NavItem icon="local-mall" label="My Orders" />
                    <NavItem icon="favorite" label="Wishlist" badge="12" />

                    <View style={[styles.divider, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]} />

                    <NavItem icon="settings" label="Settings" />
                    <NavItem icon="vpn-key" label="API Keys" />
                    <NavItem icon="help" label="Help Center" />
                </ScrollView>

                {/* Footer */}
                {isLoggedIn && (
                    <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                        <Pressable style={styles.signOutButton} onPress={() => {
                            logout();
                            onClose();
                        }}>
                            <MaterialIcons name="logout" size={22} color="#64748b" />
                            <Text style={styles.signOutText}>Sign Out</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        );
    }, [isDark, insets, onClose, isLoggedIn, user, logout, router]);

    return (
        <Drawer
            open={isOpen}
            onOpen={() => { }} // No-op, managed by state
            onClose={onClose}
            renderDrawerContent={renderDrawerContent}
            drawerPosition="left"
            drawerType="front"
            drawerStyle={{ width: DRAWER_WIDTH }}
            overlayStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}
        >
            {children}
        </Drawer>
    );
}

const styles = StyleSheet.create({
    drawerContainer: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    glow: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 16,
        zIndex: 10,
        padding: 8,
    },
    profileSection: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: 'rgba(17, 82, 212, 0.1)',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: '#fff',
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    viewProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    viewProfileText: {
        color: '#1152d4',
        fontSize: 12,
        fontWeight: '600',
    },
    navList: {
        flex: 1,
        paddingHorizontal: 12,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        marginBottom: 4,
        gap: 16,
    },
    navItemActive: {
        // Background color handled dynamically
    },
    navLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    navLabelActive: {
        fontWeight: '700',
    },
    badgeContainer: {
        marginLeft: 'auto',
        backgroundColor: '#1152d4',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
        marginVertical: 16,
    },
    footer: {
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 16,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
    },
    signOutText: {
        color: '#64748b',
        fontSize: 15,
        fontWeight: '600',
    }
});
