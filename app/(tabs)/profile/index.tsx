import React, { useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlobalHeader } from '@/components/ui/GlobalHeader';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/hooks/use-auth-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useNavigation } from '@react-navigation/native';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { PersonalDetails } from '@/components/profile/PersonalDetails';
import { RecentOrders } from '@/components/profile/RecentOrders';
import { SavedAddresses } from '@/components/profile/SavedAddresses';
import { LoyaltyCard } from '@/components/profile/LoyaltyCard';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import { ReferralCard } from '@/components/profile/ReferralCard';
import { SignOutButton } from '@/components/profile/SignOutButton';
import { LoyaltyRewards } from '@/components/profile/LoyaltyRewards';
import { LoyaltyHistory } from '@/components/profile/LoyaltyHistory';
import { NotificationsList } from '@/components/profile/NotificationsList';

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [activeTab, setActiveTab] = useState('Details');
    const { isAuthenticated } = useAuth();
    const scrollViewRef = useRef<ScrollView>(null);
    const iosMajorVersion = Platform.OS === 'ios'
        ? Number(String(Platform.Version).split('.')[0] || 0)
        : 0;
    const usesNativeToolbarHeader =
        Platform.OS === 'ios' &&
        iosMajorVersion >= 26 &&
        navigation?.getState?.()?.type === 'stack';
    const topPadding = usesNativeToolbarHeader ? 8 : 60 + insets.top;

    return (
        <View collapsable={false} style={[styles.container, { backgroundColor: isDark ? '#000000' : '#fff' }]}>
            <GlobalHeader title="LUXE" />

            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={{ paddingTop: topPadding, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={isAuthenticated ? [1] : []}
                automaticallyAdjustContentInsets={false}
                contentInsetAdjustmentBehavior="never"
            >
                {/* 0: Profile Header */}
                <ProfileHeader />

                {isAuthenticated && (
                    <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
                )}

                {isAuthenticated && (
                    <View style={styles.content}>
                        {activeTab === 'Details' && <PersonalDetails />}

                        {activeTab === 'Orders' && <RecentOrders />}

                        {activeTab === 'Addresses' && <SavedAddresses />}

                        {activeTab === 'Notifications' && <NotificationsList />}

                        {activeTab === 'Loyalty' && (
                            <View style={{ gap: 24 }}>
                                <LoyaltyCard />
                                <LoyaltyRewards />
                                <LoyaltyHistory />
                                <ReferralCard />
                            </View>
                        )}

                        {activeTab === 'Security' && (
                            <View style={{ gap: 24 }}>
                                <SecuritySettings />
                                <SignOutButton />
                            </View>
                        )}
                    </View>
                )}

                {!isAuthenticated && (
                    <View style={{ marginTop: 16, position: 'relative' }}>
                        <View style={{ opacity: 0.3 }}>
                            <ProfileTabs activeTab="Details" onTabChange={() => { }} />
                            <View style={{ padding: 16, gap: 16 }}>
                                <View style={{ height: 50, borderRadius: 12, backgroundColor: isDark ? '#333' : '#f3f4f6', width: '100%' }} />
                                <View style={{ height: 50, borderRadius: 12, backgroundColor: isDark ? '#333' : '#f3f4f6', width: '100%' }} />
                                <View style={{ height: 50, borderRadius: 12, backgroundColor: isDark ? '#333' : '#f3f4f6', width: '100%' }} />
                                <View style={{ height: 200, borderRadius: 16, backgroundColor: isDark ? '#333' : '#f3f4f6', width: '100%' }} />
                            </View>
                        </View>

                        <BlurView
                            intensity={25}
                            style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', zIndex: 10 }]}
                            tint={isDark ? 'dark' : 'light'}
                        >
                            <View style={{
                                paddingHorizontal: 24,
                                paddingVertical: 14,
                                backgroundColor: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.8)',
                                borderRadius: 30,
                                alignItems: 'center',
                                gap: 8,
                                flexDirection: 'row',
                                borderWidth: 1,
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 12
                            }}>
                                <IconSymbol name="lock.fill" size={18} color={isDark ? '#fff' : '#000'} />
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: isDark ? '#fff' : '#000'
                                }}>
                                    Sign in to access profile details
                                </Text>
                            </View>
                        </BlurView>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        gap: 24,
        minHeight: 400, // Ensure there's some height to scroll if needed
    },
});
