// components/events/EventForm.tsx
// Event form component extracted from dashboard.tsx

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { MAX_VIDEO_SIZE, isVideo } from '../../constants/fileConfig';
import { INTERNAL_OPTIONS } from '../../constants/interestOptions';
import { LoadingButton, MediaPicker } from '../shared';

export interface EventFormData {
  title: string;
  caption: string;
  link: string;
  interests: string[];
  date: Date;
  image?: string;
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  isComplete: boolean;
}

export interface EventFormProps {
  eventData: EventFormData;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  uploadState: UploadState;
  onUploadStateChange: (state: Partial<UploadState>) => void;
  onDataChange: (data: Partial<EventFormData>) => void;
  onMediaSelected: () => void;
  editingMode?: boolean;
}

export default function EventForm({
  eventData,
  onSave,
  onCancel,
  loading,
  uploadState,
  onUploadStateChange,
  onDataChange,
  onMediaSelected,
  editingMode = false,
}: EventFormProps) {
  const [showDateModal, setShowDateModal] = useState(false);
  const [tempDate, setTempDate] = useState(eventData.date);

  const handleFieldChange = (field: keyof EventFormData) => (value: any) => {
    onDataChange({ [field]: value });
  };

  const handleInterestToggle = (option: string) => {
    const updatedInterests = eventData.interests.includes(option)
      ? eventData.interests.filter(i => i !== option)
      : [...eventData.interests, option];
    onDataChange({ interests: updatedInterests });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isDisabled = loading || uploadState.isUploading || !uploadState.isComplete || !!uploadState.error;

  return (
    <View style={styles.eventFormCard}>
      <Text style={styles.eventFormTitle}>
        {editingMode ? 'Edit Event' : 'Create New Event'}
      </Text>

      {/* Event Media Picker */}
      <MediaPicker
        onMediaSelected={(url) => {
          onDataChange({ image: url });
        }}
        currentMedia={eventData.image}
        type="both"
        maxSize={MAX_VIDEO_SIZE}
        buttonText={eventData.image ? 'Change Event Media' : 'Add Event Media'}
        onUploadStart={() => {
          onUploadStateChange({ 
            isUploading: true, 
            progress: 0, 
            error: null, 
            isComplete: false 
          });
        }}
        onUploadProgress={(progress) => {
          onUploadStateChange({ progress });
        }}
        onUploadComplete={(url) => {
          onUploadStateChange({ 
            isUploading: false, 
            isComplete: true, 
            progress: 100 
          });
          onDataChange({ image: url });
        }}
        onUploadError={(error) => {
          onUploadStateChange({ 
            isUploading: false, 
            error, 
            isComplete: false 
          });
        }}
      />

      {/* Upload Progress Indicator */}
      {uploadState.isUploading && (
        <View style={styles.uploadProgress}>
          <Text style={styles.uploadProgressTitle}>
            📤 Uploading video... {uploadState.progress}% complete
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${uploadState.progress}%` }
              ]} 
            />
          </View>
          <Text style={styles.uploadProgressSubtext}>
            Continue filling out event details below
          </Text>
        </View>
      )}

      {/* Upload Error Display */}
      {uploadState.error && (
        <View style={styles.uploadError}>
          <Text style={styles.uploadErrorTitle}>⚠️ Upload Error</Text>
          <Text style={styles.uploadErrorText}>{uploadState.error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              onDataChange({ image: undefined });
            }}
          >
            <Text style={styles.retryButtonText}>Try Different File</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Video Tips Section */}
      {eventData.image && isVideo(eventData.image) && (
        <View style={styles.videoTips}>
          <Text style={styles.videoTipsTitle}>
            {uploadState.isUploading ? '📤 Upload Status:' : '🎬 Video Tips:'}
          </Text>
          <Text style={styles.videoTipsText}>
            {uploadState.isUploading ? (
              `Your video is uploading in the background. You can continue filling out the form - the save button will be enabled when upload completes.`
            ) : (
              `• Videos auto-compressed to ~5MB by our servers\n• Short videos (5-15 seconds) get more engagement\n• Show the action, not just talking\n• Good lighting makes a huge difference`
            )}
          </Text>
        </View>
      )}

      {/* Event Form Fields */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Event Title *</Text>
        <TextInput
          style={styles.input}
          value={eventData.title}
          onChangeText={handleFieldChange('title')}
          placeholder="What's happening?"
          placeholderTextColor="rgba(255,255,255,0.5)"
          maxLength={100}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Event Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={eventData.caption}
          onChangeText={handleFieldChange('caption')}
          placeholder="Tell people about your event"
          placeholderTextColor="rgba(255,255,255,0.5)"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={300}
        />
        <Text style={styles.characterCount}>
          {eventData.caption.length}/300 characters
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Event Link</Text>
        <TextInput
          style={styles.input}
          value={eventData.link}
          onChangeText={handleFieldChange('link')}
          placeholder="tickets.com"
          placeholderTextColor="rgba(255,255,255,0.5)"
          maxLength={200}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Interests Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Event Categories *</Text>
        <View style={styles.interestsGrid}>
          {INTERNAL_OPTIONS.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.interestChip,
                eventData.interests.includes(option) && styles.interestChipSelected
              ]}
              onPress={() => handleInterestToggle(option)}
            >
              <Text
                style={[
                  styles.interestChipText,
                  eventData.interests.includes(option) && styles.interestChipTextSelected
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Date & Time Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Date & Time *</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => {
            setTempDate(eventData.date);
            setShowDateModal(true);
          }}
        >
          <Text style={styles.datePickerText}>
            {formatDate(eventData.date)}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Save Event Button */}
      <LoadingButton
        onPress={onSave}
        loading={loading || uploadState.isUploading}
        disabled={!uploadState.isComplete || !!uploadState.error}
        title={editingMode ? 'Update Event' : 'Save Event'}
        loadingTitle={
          loading ? 'Saving...' : 
          uploadState.isUploading ? `Uploading video... ${uploadState.progress}%` : 
          'Loading...'
        }
      />

      {/* Date Modal */}
      {showDateModal && (
        <Modal transparent animationType="slide" visible>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={tempDate}
                mode="datetime"
                display="spinner"
                textColor="#fff"
                onChange={(_, selected) => {
                  if (selected) setTempDate(selected);
                }}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowDateModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={() => {
                    onDataChange({ date: tempDate });
                    setShowDateModal(false);
                  }}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>Set Date</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  eventFormCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  eventFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  uploadProgress: {
    backgroundColor: 'rgba(0, 150, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 150, 255, 0.3)',
  },
  uploadProgressTitle: {
    color: '#4fc3f7',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4fc3f7',
    borderRadius: 4,
  },
  uploadProgressSubtext: {
    color: 'rgba(79, 195, 247, 0.8)',
    fontSize: 14,
  },
  uploadError: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  uploadErrorTitle: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  uploadErrorText: {
    color: 'rgba(255, 107, 107, 0.9)',
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
  },
  videoTips: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  videoTipsTitle: {
    color: '#ffc107',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  videoTipsText: {
    color: 'rgba(255, 193, 7, 0.9)',
    fontSize: 14,
    lineHeight: 20,
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
  multilineInput: {
    minHeight: 100,
    paddingTop: 16,
  },
  characterCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    marginTop: 6,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  interestChipSelected: {
    backgroundColor: '#fff',
  },
  interestChipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  interestChipTextSelected: {
    color: '#000',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    minHeight: 56,
  },
  datePickerText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    gap: 16,
  },
  modalButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#fff',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonPrimaryText: {
    color: '#000',
  },
}); 