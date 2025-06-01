// app/(tabs)/explore/index.tsx
// @ts-nocheck

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Business } from '../../../data/businesses';

const backgroundPattern = require('../../../assets/background.png');
const logo = require('../../../assets/logo2.png');

export default function ExploreScreen() {
  const [searchText, setSearchText] = useState('');
  const [businessList, setBusinessList] = useState<Business[]>([]);

  useEffect(() => {
    const loadBusinesses = async () => {
      const stored = await AsyncStorage.getItem('businesses');
      setBusinessList(stored ? JSON.parse(stored) : []);
    };
    
    loadBusinesses();
  }, []);

  const filtered = searchText.trim() === '' 
    ? [] 
    : businessList.filter(business =>
        business.name.toLowerCase().includes(searchText.toLowerCase()) ||
        business.tags.some(tag =>
          tag.toLowerCase().includes(searchText.toLowerCase())
        )
      );

  const renderItem = ({ item }: { item: Business }) => (
    <Link href={{ pathname: '/explore/[id]', params: { id: item.id } }} asChild>
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
            <Ionicons name="business-outline" size={24} color="#999" />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.tags} numberOfLines={2}>{item.tags.join(' • ')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>
    </Link>
  );

  const renderEmptyState = () => {
    if (searchText.trim() === '') {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyTitle}>Discover Byron Bay</Text>
          <Text style={styles.emptySubtitle}>Search for businesses, cafes, restaurants, and more...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyState}>
        <Ionicons name="sad-outline" size={64} color="rgba(255,255,255,0.3)" />
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptySubtitle}>Try adjusting your search terms</Text>
      </View>
    );
  };

  return (
    <View style={styles.background}>
      <ImageBackground 
        source={backgroundPattern} 
        style={StyleSheet.absoluteFill}
        resizeMode="repeat"
      />
      
      {/* Logo Background */}
      <Image 
        source={logo} 
        style={[
          StyleSheet.absoluteFill, 
          { 
            opacity: 0.5, 
            width: '100%', 
            height: '100%',
            top: '20%', // Controls vertical position from top
            transform: [
              { translateX: 0 }, // Move left/right
              { translateY: -100 }, // Move up/down
              { scale: 1 } // Control size
            ]
          }
        ]} 
        resizeMode="contain"
      />
      
      {/* Inverted Gradient Overlay */}
      <LinearGradient 
        colors={['rgba(0, 0, 0, 0.85)', 'rgba(43, 146, 168, 0.9)']} 
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safe}>
        <Text style={styles.header}>Explore</Text>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={22} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search businesses, cafes, restaurants..."
              placeholderTextColor="#888"
              value={searchText}
              onChangeText={setSearchText}
              clearButtonMode="while-editing"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        </View>
        
        {filtered.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        )}
        
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  header: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 20,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
    marginBottom: 60,
  },
  searchContainer: {
    marginBottom: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  searchIcon: {
    marginRight: 12,
    color: '#888',
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
  },
  placeholderThumbnail: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  tags: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
});