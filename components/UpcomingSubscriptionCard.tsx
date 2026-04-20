import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import { formatCurrency } from '@/lib/utils'

type Props = UpcomingSubscription & {
  onPress?: () => void
}

const UpcomingSubscriptionCard = ({ name, price, icon, daysLeft, currency, onPress }: Props) => {
  const content = (
    <>
      <View className='upcoming-row'>
        <Image source={icon} className='upcoming-icon' />
        <View className='upcoming-price' >
          <Text className='upcoming-price-text'>{formatCurrency(price, currency)}</Text>
          <Text className='upcoming-meta' numberOfLines={1} >{daysLeft > 1 ? `${daysLeft} days left` : 'Last day'}</Text>
        </View>
      </View>
      <Text className='upcoming-name' numberOfLines={1} >{name}</Text>
    </>
  )

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole='button'
        accessibilityLabel={`Open ${name}`}
        className='upcoming-card active:opacity-80'
      >
        {content}
      </Pressable>
    )
  }

  return <View className='upcoming-card'>{content}</View>
}

export default UpcomingSubscriptionCard
