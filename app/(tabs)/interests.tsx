// app/(tabs)/interests.tsx
// @ts-nocheck

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ImageBackground,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { INTEREST_OPTIONS } from '../../data/interests';

const backgroundPattern = require('../../assets/background.png');

export default function InterestsScreen() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Load saved selections
  useEffect(() => {
    const loadInterests = async () => {
      const raw = await AsyncStorage.getItem('userInterests');
      if (raw) {
        setSelectedInterests(JSON.parse(raw));
      }
    };
    
    loadInterests();
  }, []);

  // Persist whenever selections change
  useEffect(() => {
    AsyncStorage.setItem('userInterests', JSON.stringify(selectedInterests));
  }, [selectedInterests]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleSelectAll = () => {
    if (selectedInterests.length === INTEREST_OPTIONS.length) {
      // If all are selected, deselect all
      setSelectedInterests([]);
    } else {
      // If not all are selected, select all
      setSelectedInterests([...INTEREST_OPTIONS]);
    }
  };

  const onContinue = () => {
    if (!selectedInterests.length) {
      Alert.alert(
        'Select Interests', 
        'Please select at least one interest to personalize your experience.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    router.replace('/');
  };

  const renderInterestItem = ({ item }: { item: string }) => {
    const isSelected = selectedInterests.includes(item);
    
    return (
      <TouchableOpacity
        style={[
          styles.interestCard,
          isSelected && styles.selectedCard,
        ]}
        onPress={() => toggleInterest(item)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.interestText,
            isSelected && styles.selectedText,
          ]}
          numberOfLines={2}
        >
          {item}
        </Text>
        {isSelected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Interests</Text>
          <Text style={styles.subtitle}>
            Choose your interests to discover personalized events
          </Text>
        </View>

        <View style={styles.selectAllContainer}>
          <TouchableOpacity style={styles.selectAllButton} onPress={toggleSelectAll}>
            <Text style={styles.selectAllText}>
              {selectedInterests.length === INTEREST_OPTIONS.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={INTEREST_OPTIONS}
          keyExtractor={item => item}
          numColumns={2}
          contentContainerStyle={styles.list}
          renderItem={renderInterestItem}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.continueButton,
              !selectedInterests.length && styles.disabledButton
            ]} 
            onPress={onContinue}
            disabled={!selectedInterests.length}
          >
            <Text style={[
              styles.continueText,
              !selectedInterests.length && styles.disabledText
            ]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

InterestsScreen.options = { headerShown: false };

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginVertical: 3,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  selectAllContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectAllButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  selectAllText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    paddingBottom: 20,
  },
  interestCard: {
    flex: 1,
    margin: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    position: 'relative',
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
  selectedCard: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  interestText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18,
  },
  selectedText: {
    color: '#333',
    fontWeight: '700',
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  footer: {
    paddingVertical: 20,
  },
  continueButton: {
    backgroundColor: '#D2B48C',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  disabledButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  continueText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledText: {
    color: '#999',
  },
});