import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const SignIn = () => {
  return (
    <View>
      <Text>sign-in</Text>
      <Link href="/sign-up" className="mt-4 rounded-full bg-accent px-4 py-2">Create an account</Link>
    </View>
  )
}

export default SignIn