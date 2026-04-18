import { View, Text } from 'react-native'
import React from 'react'
import { Link, useLocalSearchParams } from 'expo-router';

const SubscriptionDetails = () => {
    const { id } = useLocalSearchParams<{id:string}>();
  return (
    <View>
      <Text>Subscription Details : {id}</Text>
      <Link href="/subscriptions" className="mt-4 rounded-full bg-accent px-4 py-2">Go back!</Link>
    </View>
  )
}

export default SubscriptionDetails