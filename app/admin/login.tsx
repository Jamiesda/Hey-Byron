// app/admin/login.tsx
// @ts-nocheck

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Button,
  Dimensions,
  ImageBackground,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ALLOWED_BUSINESS_CODES } from '../../data/allowedBusinessCodes';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const backgroundPattern = require('../../assets/background.png');

export default function LoginScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleLogin = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      alert('Please enter a business code.');
      return;
    }
    if (!ALLOWED_BUSINESS_CODES.includes(trimmed)) {
      alert('That business code is not recognized.');
      return;
    }
    await AsyncStorage.setItem('businessCode', trimmed);
    await AsyncStorage.setItem('isBusiness', 'true');
    router.replace('/admin/dashboard');
  };

  return (
    <ImageBackground 
      source={backgroundPattern} 
      style={styles.background}
      resizeMode="repeat"
    >
      <LinearGradient 
        colors={['rgba(0, 0, 0, 0.85)', 'rgba(43, 146, 168, 0.9)']} 
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safe}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        {/* Login form */}
        <View style={styles.container}>
          <Text style={styles.title}>Business Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Business Code"
            placeholderTextColor="rgb(0,0,0)"
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
          />
          <Button title="Login" onPress={handleLogin} color="#000" />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

// No default header
LoginScreen.options = { headerShown: false };

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backText: {
    color: '#fff',
    fontSize: 22,
    marginTop: -3,
    marginRight: 2,
  },
  container: {
    marginTop: SCREEN_HEIGHT * 0.25,
    marginHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
    color: 'rgb(0,0,0)',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
    color: 'rgb(0,0,0)',
    fontSize: 16,
  },
});
