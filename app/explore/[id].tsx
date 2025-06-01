// app/explore/[id].tsx
// @ts-nocheck

import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Business } from '../../data/businesses';

const backgroundPattern = require('../../assets/background.png');

export default function BusinessDetail() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { id: rawId } = useLocalSearchParams<{ id?: string }>();
  const businessId = rawId ?? '';
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    if (!businessId) return;
    
    const loadBusiness = async () => {
      const raw = await AsyncStorage.getItem('businesses');
      const list: Business[] = raw ? JSON.parse(raw) : [];
      setBusiness(list.find(b => b.id === businessId) || null);
    };
    
    loadBusiness();
  }, [businessId]);

  const openMap = () => {
    if (!business?.address) return;
    const q = encodeURIComponent(business.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
  };

  const handleViewEvents = () => {
    router.push(`/(tabs)?businessId=${businessId}`);
  };

  const getSocialIcon = (url: string): string => {
    if (url.includes('facebook.com')) return 'facebook-square';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('twitter.com')) return 'twitter-square';
    if (url.includes('linkedin.com')) return 'linkedin-square';
    return 'link';
  };

  if (!business) {
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
        
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading business…</Text>
        </View>
      </ImageBackground>
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
        <ScrollView contentContainerStyle={styles.container}>
          {/* Full-width Header Image */}
          {business.image && (
            <Image
              source={{ uri: business.image }}
              style={[styles.headerImage, { width }, styles.fullWidth]}
              resizeMode="cover"
            />
          )}

          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Business Name */}
          <View style={styles.box}>
            <Text style={styles.title}>{business.name}</Text>
          </View>

          {/* Address */}
          {business.address && (
            <TouchableOpacity style={styles.box} onPress={openMap} activeOpacity={0.7}>
              <View style={styles.addressRow}>
                <FontAwesome name="map-marker" size={16} color="#555" style={styles.icon} />
                <Text style={styles.addressText}>{business.address}</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* View Events Button */}
          <TouchableOpacity style={styles.eventsButton} onPress={handleViewEvents} activeOpacity={0.8}>
            <Text style={styles.eventsButtonText}>View Events</Text>
          </TouchableOpacity>

          {/* Overview */}
          {business.description && (
            <View style={styles.box}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.bodyText}>{business.description}</Text>
            </View>
          )}

          {/* Website */}
          {business.website && (
            <View style={styles.box}>
              <Text style={styles.label}>Website</Text>
              <TouchableOpacity onPress={() => Linking.openURL(business.website!)}>
                <Text style={[styles.link, styles.text]}>
                  {business.website}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Social Links Icons */}
          {business.socialLinks?.length ? (
            <View style={styles.box}>
              <Text style={styles.label}>Connect</Text>
              <View style={styles.socialRow}>
                {business.socialLinks.map((url, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.iconButton}
                    onPress={() => Linking.openURL(url)}
                  >
                    <FontAwesome name={getSocialIcon(url)} size={28} color="#1E90FF" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

BusinessDetail.options = {
  headerShown: false,
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  headerImage: {
    height: 200,
    marginBottom: 20,
  },
  fullWidth: {
    marginLeft: -20,
    marginRight: -20,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#fff',
  },
  box: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginVertical: 8,
    borderRadius: 8,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  addressText: {
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  bodyText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  eventsButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  eventsButtonText: {
    color: '#2B92A8',
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#444',
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  link: {
    color: '#1E90FF',
    textDecorationLine: 'underline',
    marginBottom: 4,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  iconButton: {
    marginHorizontal: 8,
  },
});