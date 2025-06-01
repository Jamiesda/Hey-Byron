// app/admin/dashboard.tsx
// @ts-nocheck

import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Business } from '../../data/businesses';
import { Event } from '../../data/events';
import { clearStressTestData, generateStressTestData } from '../../scripts/generateStressTestData';

const backgroundPattern = require('../../assets/background.png');

// Simple Video Preview Component for Dashboard
function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return (
    <VideoView
      style={styles.eventImg}
      player={player}
      contentFit="cover"
      nativeControls={false}
      allowsFullscreen={false}
    />
  );
}

const INTERNAL_OPTIONS = [
  'Live Music',
  'Art',
  'Electronic Music',
  'Open Mic Nights',
  'Comedy',
  'Trivia',
  'Films',
  'Yoga/Pilates',
  'Wellness',
  'Fitness',
  'Outdoor activities',
  'Surfing',
  'Markets',
  'Beer, Wine & Spirits',
  'Food & Drink Specials',
  'Food',
  'Workshops',
  'Community Events',
  'Fundraisers',
  'Cultural Events',
];

export default function DashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingBiz, setSavingBiz] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  // Business form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [website, setWebsite] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [bizImage, setBizImage] = useState<string | null>(null);

  // Event form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventImage, setEventImage] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventLink, setEventLink] = useState('');
  const [eventInterests, setEventInterests] = useState<string[]>([]);
  const [eventDate, setEventDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [bizEvents, setBizEvents] = useState<Event[]>([]);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Helper function to copy image to permanent location
  const copyImageToPermanentLocation = async (tempUri: string, prefix: string) => {
    try {
      const filename = `${prefix}_${Date.now()}.jpg`;
      const permanentUri = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.copyAsync({
        from: tempUri,
        to: permanentUri,
      });
      
      return permanentUri;
    } catch (error) {
      console.error('Error copying image:', error);
      return tempUri; // fallback to original URI
    }
  };

  // Helper function to delete old image file
  const deleteImageFile = async (uri: string) => {
    try {
      if (uri && uri.startsWith(FileSystem.documentDirectory)) {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(uri);
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  useEffect(() => {
    (async () => {
      const bizCode = await AsyncStorage.getItem('businessCode');
      if (!bizCode) {
        router.replace('/admin/login');
        return;
      }
      setCode(bizCode);

      // Load business
      const rawBiz = await AsyncStorage.getItem('businesses');
      const bizList: Business[] = rawBiz ? JSON.parse(rawBiz) : [];
      const biz = bizList.find(b => b.id === bizCode);
      if (biz) {
        setName(biz.name);
        setAddress(biz.address);
        setDescription(biz.description);
        setTags(biz.tags.join(', '));
        setWebsite(biz.website || '');
        setSocialLinks((biz.socialLinks || []).join(', '));
        setBizImage(biz.image || null);
      }

      // Load events
      const rawEv = await AsyncStorage.getItem('events');
      const allEv: Event[] = rawEv ? JSON.parse(rawEv) : [];
      setBizEvents(allEv.filter(e => e.businessId === bizCode));
      setLoading(false);
    })();
  }, [router]);

  const pickBizImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    
    const res = await ImagePicker.launchImageLibraryAsync({ 
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    
    if (!res.canceled && res.assets.length) {
      // Delete old image if it exists
      if (bizImage) {
        await deleteImageFile(bizImage);
      }
      
      // Copy new image to permanent location
      const permanentUri = await copyImageToPermanentLocation(res.assets[0].uri, 'business');
      setBizImage(permanentUri);
    }
  };

  const saveBusiness = async () => {
    if (!name.trim() || !code) return;
    setSavingBiz(true);
    const newBiz: Business = {
      id: code,
      name: name.trim(),
      address: address.trim(),
      description: description.trim(),
      tags: tags.split(',').map(t => t.trim()),
      website: website.trim() || undefined,
      socialLinks: socialLinks
        .split(',')
        .map(s => s.trim())
        .filter(s => s),
      image: bizImage || undefined,
    };
    const raw = await AsyncStorage.getItem('businesses');
    const list: Business[] = raw ? JSON.parse(raw) : [];
    const updated = list.filter(b => b.id !== code);
    updated.push(newBiz);
    await AsyncStorage.setItem('businesses', JSON.stringify(updated));
    setSavingBiz(false);
    alert('Business saved');
  };

  const pickEventImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
  
    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });
  
    if (!res.canceled && res.assets.length) {
      // delete old media if editing
      if (eventImage && editingEventId) {
        await deleteImageFile(eventImage);
      }
  
      // build correct filename from original extension
      const { uri } = res.assets[0];
      const ext = uri.split('.').pop() || 'jpg';
      const filename = `event_${Date.now()}.${ext}`;
      const permanentUri = `${FileSystem.documentDirectory}${filename}`;
  
      await FileSystem.copyAsync({ from: uri, to: permanentUri });
      setEventImage(permanentUri);
    }
  };

  const handleEditEvent = (ev: Event) => {
    setEditingEventId(ev.id);
    setEventTitle(ev.title);
    setEventLink(ev.link || '');
    setEventImage(ev.image || null);
    setEventInterests(ev.tags);
    setEventDate(new Date(ev.date));
    setTempDate(new Date(ev.date));
    setShowEventForm(true);
    setShowDateModal(false);
  };

  const saveEvent = async () => {
    if (!eventTitle.trim() || !code) return;
    setSavingEvent(true);
    const updatedEv: Event = {
      id: editingEventId ?? Date.now().toString(),
      businessId: code,
      title: eventTitle.trim(),
      date: eventDate.toISOString(),
      link: eventLink.trim(),
      tags: eventInterests,
      image: eventImage || undefined,
    };
    const raw = await AsyncStorage.getItem('events');
    const list: Event[] = raw ? JSON.parse(raw) : [];
    const newList = editingEventId
      ? list.map(e => (e.id === editingEventId ? updatedEv : e))
      : [...list, updatedEv];
    await AsyncStorage.setItem('events', JSON.stringify(newList));
    setBizEvents(newList.filter(e => e.businessId === code));
    setShowEventForm(false);
    setSavingEvent(false);
    setEditingEventId(null);
    setEventTitle('');
    setEventLink('');
    setEventImage(null);
    setEventInterests([]);
    setEventDate(new Date());
    setTempDate(new Date());
    alert(editingEventId ? 'Event updated' : 'Event saved');
  };

  const deleteEvent = async (eventId: string) => {
    // Find the event to get its image URI before deleting
    const eventToDelete = bizEvents.find(e => e.id === eventId);
    if (eventToDelete?.image) {
      await deleteImageFile(eventToDelete.image);
    }

    const raw = await AsyncStorage.getItem('events');
    const list: Event[] = raw ? JSON.parse(raw) : [];
    const newList = list.filter(e => e.id !== eventId);
    await AsyncStorage.setItem('events', JSON.stringify(newList));
    setBizEvents(newList.filter(e => e.businessId === code));
    alert('Event deleted');
  };

  if (loading) {
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
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
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
      <LinearGradient 
        colors={['rgba(0, 0, 0, 0.85)', 'rgba(43, 146, 168, 0.9)']} 
        style={StyleSheet.absoluteFillObject}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.form}>
          {/* Dark header with back button */}
          <View style={styles.darkBg}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/admin/login')}
            >
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.header}>Business Info</Text>
          </View>

          {/* Main content area */}
          <View style={styles.contentArea}>
            {/* Business Image Picker */}
            <TouchableOpacity onPress={pickBizImage}>
              <Text style={styles.linkText}>Pick Business Image</Text>
            </TouchableOpacity>
            {bizImage && <Image source={{ uri: bizImage }} style={styles.bizImg} />}

            {/* Business Form Fields */}
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter business name"
              placeholderTextColor="#ccc"
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter address"
              placeholderTextColor="#ccc"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              placeholderTextColor="#ccc"
              multiline
            />

            <Text style={styles.label}>Tags</Text>
            <TextInput
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder="e.g. cafe, yoga"
              placeholderTextColor="#ccc"
            />

            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={website}
              onChangeText={setWebsite}
              placeholder="https://"
              placeholderTextColor="#ccc"
            />

            <Text style={styles.label}>Social Links</Text>
            <TextInput
              style={styles.input}
              value={socialLinks}
              onChangeText={setSocialLinks}
              placeholder="comma-separated URLs"
              placeholderTextColor="#ccc"
            />

            {savingBiz ? (
              <ActivityIndicator style={{ marginTop: 10 }} color="#fff" />
            ) : (
              <Button title="Save Business" onPress={saveBusiness} color="#fff" />
            )}
{/* Stress Test Buttons */}
<View style={{ marginTop: 20 }}>
  <Button title="🚀 Add 100 Businesses + 500 Events" onPress={generateStressTestData} color="#ff6b6b" />
  <View style={{ marginTop: 10 }} />
  <Button title="🧹 Remove Test Data" onPress={clearStressTestData} color="#666" />
</View>
            {/* Event Section */}
            <View style={styles.section}>
              <Button
                title={showEventForm ? 'Cancel' : editingEventId ? 'Add New Event' : 'Add Event'}
                onPress={() => {
                  setShowEventForm(prev => !prev);
                  if (showEventForm) {
                    setEditingEventId(null);
                    setEventTitle('');
                    setEventLink('');
                    setEventImage(null);
                    setEventInterests([]);
                    setEventDate(new Date());
                    setTempDate(new Date());
                  }
                }}
                color="#000"
              />

              {showEventForm && (
                <View style={styles.eventForm}>
                  <Text style={styles.subheader}>
                    {editingEventId ? 'Edit Event' : 'New Event'}
                  </Text>

                  {/* Pick Event Media */}
                  <TouchableOpacity onPress={pickEventImage}>
                    <Text style={styles.linkText}>Pick Event Media</Text>
                  </TouchableOpacity>
                  {eventImage && (/(mp4|mov|m4v)$/i.test(eventImage)
                    ? <VideoPreview uri={eventImage} />
                    : <Image source={{ uri: eventImage }} style={styles.eventImg} />)}

                  {/* Event Form Fields */}
                  <Text style={styles.label}>Event Title</Text>
                  <TextInput
                    style={[styles.input, styles.lightInput]}
                    value={eventTitle}
                    onChangeText={setEventTitle}
                    placeholder="Enter event title"
                    placeholderTextColor="rgb(0,0,0)"
                  />

                  <Text style={styles.label}>Link</Text>
                  <TextInput
                    style={[styles.input, styles.lightInput]}
                    value={eventLink}
                    onChangeText={setEventLink}
                    placeholder="https://"
                    placeholderTextColor="rgb(0,0,0)"
                  />

                  <Text style={styles.label}>Interests</Text>
                  <View style={styles.interestsContainer}>
                    {INTERNAL_OPTIONS.map(option => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.interestItem,
                          eventInterests.includes(option) && styles.interestSelected
                        ]}
                        onPress={() =>
                          setEventInterests(prev =>
                            prev.includes(option)
                              ? prev.filter(i => i !== option)
                              : [...prev, option]
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.interestText,
                            eventInterests.includes(option) && styles.interestTextSelected
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Date & Time</Text>
                  <Button
                    title={eventDate.toLocaleString()}
                    onPress={() => {
                      setTempDate(eventDate);
                      setShowDateModal(true);
                    }}
                    color="#fff"
                  />

                  {showDateModal && (
                    <Modal transparent animationType="slide" visible>
                      <View style={styles.modalContainer}>
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
                            <Button title="Cancel" onPress={() => setShowDateModal(false)} />
                            <Button
                              title="Set"
                              onPress={() => {
                                setEventDate(tempDate);
                                setShowDateModal(false);
                              }}
                            />
                          </View>
                        </View>
                      </View>
                    </Modal>
                  )}

                  {savingEvent ? (
                    <ActivityIndicator style={{ marginTop: 10 }} color="#fff" />
                  ) : (
                    <Button
                      title={editingEventId ? 'Update Event' : 'Save Event'}
                      onPress={saveEvent}
                      color="#fff"
                    />
                  )}
                </View>
              )}
            </View>

            {/* Your Events List */}
            <Text style={styles.subheader}>Your Events</Text>
            {bizEvents.map(ev => (
              <View key={ev.id} style={styles.eventCard}>
                <TouchableOpacity
                  style={styles.eventInfo}
                  onPress={() => handleEditEvent(ev)}
                >
                  <Text style={styles.eventTitle}>{ev.title}</Text>
                  <Text style={styles.eventDate}>{new Date(ev.date).toLocaleString()}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteEvent(ev.id)}
                >
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: { 
    flex: 1,
  },
  form: { 
    flexGrow: 1,
  },
  darkBg: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 4,
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
  header: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    color: '#fff',
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    color: '#000',
    backgroundColor: 'rgba(255,255,255,0.6)',
    fontSize: 15,
  },
  linkText: {
    color: '#fff',
    marginVertical: 12,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginTop: 32,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: -8,
  },
  subheader: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 16,
    textAlign: 'center',
    color: '#fff',
    letterSpacing: 0.3,
  },
  bizImg: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginVertical: 12,
  },
  eventImg: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginVertical: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
    marginHorizontal: -4,
  },
  interestItem: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    margin: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  interestSelected: {
    backgroundColor: '#2B92A8',
    borderColor: '#2B92A8',
  },
  interestText: {
    color: '#fff',
    fontSize: 14,
  },
  interestTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  eventCard: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  eventInfo: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  deleteButton: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  deleteText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '400',
    marginTop: -2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    backgroundColor: 'rgba(34,34,34,0.9)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  eventForm: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  contentArea: {
    padding: 20,
  },
  lightInput: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    color: 'rgb(0,0,0)',
    borderColor: 'rgba(0,0,0,0.1)',
  },
});