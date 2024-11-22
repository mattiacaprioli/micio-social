import { StyleSheet, View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { hp, wp } from '../helpers/common'
import { theme } from '../constants/theme'
import Button from '../components/Button'

const Welcome = () => {
  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Welcome image */}
        <Image style={styles.image} resizeMode='contain' source={require('../assets/images/welcome.png')} />
      
        {/* title */}
        <View style={{gap: 20}}>
          <Text style={styles.title}>LinkUp!</Text>
          <Text style={styles.punchline}>
            Where every thought find a home and every image tells a story.
          </Text>
        </View>

        {/* footer */}
        <View style={styles.footer}>
          <Button
            title='Get Started'
            buttonStyle={{marginHorizontal: wp(3)}}
            onPress={() => {}}
          />
          <View style={styles.bottomTextContainer}>
            <Text style={styles.loginText}>
              Already have an account!
            </Text>
            <Pressable onPress={() => {}}>
              <Text style={[styles.loginText, {color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>
                Login
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Welcome

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: wp(4)
  },
  image: {
    width: hp(30),
    height: wp(100),
    alignSelf: 'center'
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(4),
    textAlign: 'center',
    fontWeight: theme.fonts.extraBold
  },
  punchline: {
    color: theme.colors.text,
    fontSize: hp(1.7),
    textAlign: 'center',
    paddingHorizontal: wp(10)
  },
  footer: {
    gap: 30,
    width: '100%',
  },
  bottomTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5
  },
  loginText: {
    color: theme.colors.text,
    textAlign: 'center',
    fontSize: hp(1.6),
  }
})