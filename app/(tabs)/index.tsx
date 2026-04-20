import '@/global.css';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import dayjs from 'dayjs';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { useUser } from '@clerk/clerk-expo';
import images from '@/constants/images';
import {
  HOME_BALANCE,
  UPCOMING_SUBSCRIPTIONS,
} from '@/constants/data';
import { icons } from '@/constants/icons';
import { formatCurrency } from '@/lib/utils';
import ListHeading from '@/components/ListHeading';
import UpcomingSubscriptionCard from '@/components/UpcomingSubscriptionCard';
import SubscriptionCard from '@/components/SubscriptionCard';
import CreateSubscriptionModal from '@/components/CreateSubscriptionModal';
import { useEffect, useMemo, useState } from 'react';
import { useSubscriptions } from '@/lib/subscriptionsContext';
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { subscriptions, addSubscription } = useSubscriptions();
  const { user } = useUser();

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [user?.imageUrl]);

  const displayName = useMemo(() => {
    if (!user) return 'Welcome';
    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    return (
      fullName ||
      user.username ||
      user.primaryEmailAddress?.emailAddress ||
      'Welcome'
    );
  }, [user]);

  const avatarSource =
    user?.imageUrl && !avatarLoadFailed
      ? { uri: user.imageUrl }
      : images.avatar;

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
        
        <FlatList
          ListHeaderComponent={() => (
            <>
              <View className="home-header">
                <View className="home-user">
                  <Image
                    source={avatarSource}
                    className="home-avatar"
                    onError={() => setAvatarLoadFailed(true)}
                  />
                  <Text
                    className="home-user-name"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {displayName}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setIsCreateModalOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Add subscription"
                  hitSlop={8}
                >
                  <Image
                    source={icons.add}
                    className="home-add-icon"
                  />
                </Pressable>
              </View>

              <View className="home-balance-card">
                <Text className="home-balance-label">Balance</Text>
                <View className="home-balance-row">
                  <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
                  <Text className="home-balance-date">
                    {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
                  </Text>
                </View>
              </View>

              <View className='mb-5'>
                <ListHeading title="Upcoming" />
                <FlatList
                  data={UPCOMING_SUBSCRIPTIONS}
                  renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ListEmptyComponent={
                    <Text className="home-empty-state">No upcoming renewal yet.</Text>
                  }
                />
                <ListHeading title="All Subscriptions" />
              </View>
            </>
          )}
          data={subscriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() =>
                setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id))
              }
            />
          )}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet.</Text>}
          contentContainerClassName='pb-30'
        />
        <CreateSubscriptionModal
          visible={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={addSubscription}
        />
    </SafeAreaView>
  );
}
