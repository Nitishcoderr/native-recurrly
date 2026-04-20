import { View, Text, Pressable } from 'react-native'
import React from 'react'

type Props = ListHeadingProps & {
  onPress?: () => void
  actionLabel?: string
}

const ListHeading = ({ title, onPress, actionLabel = 'View all' }: Props) => {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel} ${title}`}
          hitSlop={8}
          className="list-action"
        >
          <Text className="list-action-text">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

export default ListHeading
