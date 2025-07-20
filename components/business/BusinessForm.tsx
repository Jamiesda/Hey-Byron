// components/business/BusinessForm.tsx
// Business form component extracted from dashboard.tsx

import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { MAX_IMAGE_SIZE } from '../../constants/fileConfig';
import { FormInput, LoadingButton, MediaPicker } from '../shared';

export interface BusinessFormData {
  name: string;
  address: string;
  description: string;
  tags: string;
  website: string;
  socialLinks: string;
  image?: string;
}

export interface BusinessFormProps {
  businessData: BusinessFormData;
  onSave: () => void;
  loading: boolean;
  onDataChange: (data: Partial<BusinessFormData>) => void;
  onImageSelected: (uri: string) => void;
}

export default function BusinessForm({
  businessData,
  onSave,
  loading,
  onDataChange,
  onImageSelected,
}: BusinessFormProps) {

  const handleFieldChange = (field: keyof BusinessFormData) => (value: string) => {
    onDataChange({ [field]: value });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Business Information</Text>
      <Text style={styles.cloudIndicator}>✅ Synced with cloud</Text>
      
      {/* Business Image Picker */}
      <MediaPicker
        onMediaSelected={onImageSelected}
        currentMedia={businessData.image}
        type="image"
        maxSize={MAX_IMAGE_SIZE}
        buttonText={businessData.image ? 'Change Business Image' : 'Add Business Image'}
      />

      {/* Business Form Fields */}
      <FormInput
        label="Business Name"
        value={businessData.name}
        onChangeText={handleFieldChange('name')}
        placeholder="Enter your business name"
        maxLength={50}
        required
      />

      <FormInput
        label="Address"
        value={businessData.address}
        onChangeText={handleFieldChange('address')}
        placeholder="Enter your business address"
        maxLength={200}
        required
      />

      <FormInput
        label="Description"
        value={businessData.description}
        onChangeText={handleFieldChange('description')}
        placeholder="Describe your business"
        multiline
        numberOfLines={4}
        maxLength={2500}
        required
      />

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Tags *</Text>
        <TextInput
          style={styles.input}
          value={businessData.tags}
          onChangeText={handleFieldChange('tags')}
          placeholder="e.g. cafe, yoga, restaurant"
          placeholderTextColor="rgba(255,255,255,0.5)"
          maxLength={200}
        />
      </View>

      <FormInput
        label="Website"
        value={businessData.website}
        onChangeText={handleFieldChange('website')}
        placeholder="yourwebsite.com"
        maxLength={200}
        autoCapitalize="none"
        autoCorrect={false}
        required
      />

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Social Links</Text>
        <TextInput
          style={styles.input}
          value={businessData.socialLinks}
          onChangeText={handleFieldChange('socialLinks')}
          placeholder="https://facebook.com/..., https://instagram.com/..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          maxLength={500}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Save Business Button */}
      <LoadingButton
        onPress={onSave}
        loading={loading}
        title="Save Business Information"
        loadingTitle="Saving..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  cloudIndicator: {
    fontSize: 14,
    color: 'rgba(0, 255, 0, 0.8)',
    marginBottom: 16,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    minHeight: 56,
  },
}); 