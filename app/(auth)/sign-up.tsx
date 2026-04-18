import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const SignUp = () => {
  return (
    <View>
      <Text>sign-up</Text>
      <Link href="/sign-in" className="mt-4 rounded-full bg-accent px-4 py-2">Sign in</Link>
    </View>
  )
}

export default SignUp