// components/shared/MediaPicker.tsx
// Reusable media picker component extracted from dashboard.tsx

import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { isImage, isVideo } from '../../constants/fileConfig';
import { uploadToFirebaseStorage } from '../../utils/firebaseUtils';

export interface MediaPickerProps {
  onMediaSelected: (uri: string) => void;
  currentMedia?: string;
  type: 'image' | 'video' | 'both';
  maxSize: number;
  style?: ViewStyle;
  buttonText?: string;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: string) => void;
}

export default function MediaPicker({
  onMediaSelected,
  currentMedia,
  type,
  maxSize,
  style,
  buttonText,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
}: MediaPickerProps) {

  // Helper function to get file size
  const getFileSize = async (uri: string): Promise<number> => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      return info.exists ? info.size || 0 : 0;
    } catch (error) {
      console.error('Error getting file size:', error);
      return 0;
    }
  };

  // Helper function to format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  // Upload function
  const uploadMedia = async (uri: string) => {
    try {
      onUploadStart?.();
      
      const ext = uri.split('.').pop() || (isVideo(uri) ? 'mp4' : 'jpg');
      const filename = `event_${Date.now()}.${ext}`;
      
      const url = await uploadToFirebaseStorage(
        uri, 
        filename,
        (progress: number) => onUploadProgress?.(progress)
      );
      
      onUploadComplete?.(url);
      onMediaSelected(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMessage);
    }
  };

  // Main media picker function
  const pickMedia = async () => {
    try {
      // Clear any previous errors
      onUploadError?.('');
      
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your photo library to select media.');
        return;
      }

      // Determine media types based on prop
      let mediaTypes = ImagePicker.MediaTypeOptions.All;
      if (type === 'image') {
        mediaTypes = ImagePicker.MediaTypeOptions.Images;
      } else if (type === 'video') {
        mediaTypes = ImagePicker.MediaTypeOptions.Videos;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.6,
        mediaTypes,
        allowsEditing: false,
        videoMaxDuration: 30,
      });
      
      if (!result.canceled && result.assets.length) {
        const asset = result.assets[0];
        
        // Check file size
        const fileSize = await getFileSize(asset.uri);
        if (fileSize > maxSize) {
          const isVideoAsset = asset.type === 'video' || isVideo(asset.uri);
          const mediaType = isVideoAsset ? 'video' : 'image';
          
          Alert.alert(
            `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} Too Large`,
            `Your ${mediaType} is ${formatFileSize(fileSize)} but our limit is ${formatFileSize(maxSize)}.${
              isVideoAsset ? '\n\n📱 Tips to reduce size:\n• Record shorter videos (5-15 seconds)\n• Use your phone\'s built-in video editor\n• Record in standard quality (not 4K)' : ''
            }`,
            [
              { text: 'Try Again', onPress: () => pickMedia() },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
          return;
        }
        
        // Upload the media
        await uploadMedia(asset.uri);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to select media';
      onUploadError?.(errorMessage);
    }
  };

  // Determine button text
  const getButtonText = () => {
    if (buttonText) return buttonText;
    
    if (currentMedia) {
      if (isVideo(currentMedia)) return 'Change Video';
      if (isImage(currentMedia)) return 'Change Photo';
      return 'Change Media';
    }
    
    switch (type) {
      case 'image': return 'Select Photo';
      case 'video': return 'Select Video';
      default: return 'Select Photo/Video';
    }
  };

  return (
    <View style={styles.container}>
      {/* Media Preview */}
      {currentMedia && (
        <View style={styles.mediaPreview}>
          {isImage(currentMedia) ? (
            <Image source={{ uri: currentMedia }} style={styles.previewImage} />
          ) : isVideo(currentMedia) ? (
            <Image source={{ uri: currentMedia }} style={styles.previewImage} />
          ) : null}
        </View>
      )}
      
      {/* Picker Button */}
      <TouchableOpacity 
        style={[styles.pickerButton, style]} 
        onPress={pickMedia}
      >
        <Text style={styles.pickerButtonText}>{getButtonText()}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  mediaPreview: {
    alignItems: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pickerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 