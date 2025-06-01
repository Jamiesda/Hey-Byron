import { LinearGradient } from 'expo-linear-gradient'; // app/index.tsx


import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const logo = require('../assets/logo2.png');
const backgroundPattern = require('../assets/background.png');

export default function RootScreen() {
  const router = useRouter();
  const { businessId } = useLocalSearchParams<{ businessId?: string }>();

  useEffect(() => {
    if (businessId) {
      router.replace(`/(tabs)?businessId=${businessId}`);
    }
  }, [businessId, router]);

  if (businessId) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#044E7C" />
      </View>
    );
  }

  return (
    <ImageBackground 
      source={backgroundPattern} 
      style={styles.background}
      resizeMode="repeat"
    >
      {/* Inverted Gradient Overlay */}
      <LinearGradient 
        colors={['rgba(0, 0, 0, 0.85)', 'rgba(43, 146, 168, 0.9)']} 
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />

          <TouchableOpacity
            style={[styles.button, styles.personalButton]}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={[styles.buttonText, styles.personalButtonText]}>Personal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.businessButton]}
            onPress={() => router.push('/admin/login')}
          >
            <Text style={[styles.buttonText, styles.businessButtonText]}>Business</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

RootScreen.options = { headerShown: false };

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  container: {
    flex: 1,
    marginTop: SCREEN_HEIGHT * 0.10,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 320,
    height: 320,
    borderRadius: 121.5,
    marginBottom: 70,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  button: {
    width: '100%',
    maxWidth: 300,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  personalButton: {
    backgroundColor: '#D2B48C',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  businessButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  personalButtonText: {
    color: '#000',
  },
  businessButtonText: {
    color: '#2B92A8',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});