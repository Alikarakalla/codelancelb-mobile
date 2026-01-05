import React, { useRef, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlobalHeader } from '@/components/ui/GlobalHeader';
import { useDrawer } from '@/hooks/use-drawer-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

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

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const { openDrawer } = useDrawer();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [activeTab, setActiveTab] = useState('Details');
    const scrollViewRef = useRef<ScrollView>(null);

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#101622' : '#fff' }]}>
            <GlobalHeader title="LUXE" />

            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={{ paddingTop: 60 + insets.top, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[1]} // Keep tabs sticky if the user scrolls the header out of view
            >
                {/* 0: Profile Header */}
                <ProfileHeader />

                {/* 1: Sticky Tabs */}
                <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Content Sections */}
                <View style={styles.content}>
                    {activeTab === 'Details' && <PersonalDetails />}

                    {activeTab === 'Orders' && <RecentOrders />}

                    {activeTab === 'Addresses' && <SavedAddresses />}

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
