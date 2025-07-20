// app/index.tsx - OPTIMIZED VERSION WITH DARK THEME

import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
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

// Pre-calculate screen dimensions
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Pre-require images to avoid loading delays
const logo = require('../assets/heybyron new.png');
const backgroundPattern = require('../assets/logo3.png');

export default function RootScreen() {
  const router = useRouter();
  const { businessId } = useLocalSearchParams<{ businessId?: string }>();

  // Memoize navigation handlers to prevent recreations
  const navigateToPersonal = useCallback(() => {
    router.push('/(tabs)');
  }, [router]);

  const navigateToBusiness = useCallback(() => {
    router.push('/admin/login');
  }, [router]);

  // Optimized business redirect with early return
  useEffect(() => {
    if (businessId) {
      router.replace(`/(tabs)?businessId=${businessId}`);
    }
  }, [businessId, router]);

  // Memoize the gradient colors - using semi-transparent teal gradient
  const gradientColors = useMemo(() => [
    'rgba(10, 60, 60, 0.8)', 
    'rgba(40, 140, 140, 0.8)'
  ] as const, []);

  // Early return for business redirect loading state
  if (businessId) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="rgba(194, 164, 120, 1)" />
      </View>
    );
  }

  return (
    <ImageBackground 
      source={backgroundPattern} 
      style={styles.background}
      resizeMode="repeat"
    >
      <LinearGradient 
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Image 
            source={logo} 
            style={styles.logo} 
            resizeMode="contain"
            // Add loading optimization
            loadingIndicatorSource={require('../assets/logo2.png')}
          />

          <TouchableOpacity
            style={styles.personalButton}
            onPress={navigateToPersonal}
            activeOpacity={0.8}
            accessibilityLabel="Personal Interface"
            accessibilityHint="Browse events as a personal user"
          >
            <Text style={styles.personalButtonText}>Personal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.businessButton}
            onPress={navigateToBusiness}
            activeOpacity={0.8}
            accessibilityLabel="Business Dashboard"
            accessibilityHint="Access business management tools"
          >
            <Text style={styles.businessButtonText}>Business</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

RootScreen.options = { headerShown: false };

// Optimized styles with dark theme
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
    marginTop: SCREEN_HEIGHT * 0.001, // Pre-calculated
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 270,
    height: 500,
    borderRadius: 150, // Use exact half for perfect circle
    marginBottom: 2,
    // Optimized shadows with reduced blur
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  // Personal button with gold/tan theme
  personalButton: {
    width: '100%',
    maxWidth: 300,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(194, 164, 120, 1)', // Gold/tan accent color
    borderColor: 'rgba(255,255,255,0.3)',
    // Optimized shadows
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  businessButton: {
    width: '100%',
    maxWidth: 300,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.15)', // Semi-transparent for dark background
    borderColor: 'rgba(255,255,255,0.3)',
    // Optimized shadows
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  personalButtonText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#000', // Black text on gold button
  },
  businessButtonText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#fff', // White text for dark background
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(16, 78, 78)', // Dark teal background for loader
  },
});