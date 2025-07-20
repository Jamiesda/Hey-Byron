// utils/firebaseUtils.ts - Firebase Only (Migration Complete)

import { collection, deleteDoc, doc, DocumentData, getDoc, getDocs, limit, orderBy, query, setDoc, where } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../firebaseConfig'; // Use your existing Firebase setup

// Types for our data
export interface FirebaseEvent {
  id: string;
  businessId: string;
  title: string;
  caption?: string;
  date: string;
  link?: string;
  tags: string[];
  image?: string;
  video?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseBusiness {
  id: string;
  name: string;
  address: string;
  description: string;
  website?: string;
  tags: string[];
  socialLinks?: string[];
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// FIREBASE STORAGE UPLOAD FUNCTION
// ==========================================

export const uploadToFirebaseStorage = async (
  localUri: string, 
  filename: string, 
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const response = await fetch(localUri);
    const blob = await response.blob();
    
    const storageRef = ref(storage, `events/${filename}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(Math.round(progress));
        },
        (error) => {
          console.error('Upload failed:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Upload setup failed:', error);
    throw error;
  }
};

// Polling configuration
const POLLING_INTERVAL = 30000; // 30 seconds
let pollingTimer: ReturnType<typeof setInterval> | null = null;
let lastEventCount = 0;

// ==========================================
// ENHANCED EVENTS FUNCTIONS WITH POLLING
// ==========================================

/**
 * Load all events from Firebase with polling support
 * Returns events sorted by date (newest first)
 */
export const loadEventsFromFirebase = async (): Promise<FirebaseEvent[]> => {
  try {
    console.log('Loading events from Firebase...');
    
    const eventsCollection = collection(db, 'events');
    const eventsQuery = query(eventsCollection, orderBy('date', 'asc'));
    const snapshot = await getDocs(eventsQuery);
    
    const events: FirebaseEvent[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      events.push({
        id: doc.id,
        businessId: data.businessId || '',
        title: data.title || '',
        caption: data.caption,
        date: data.date || '',
        link: data.link,
        tags: data.tags || [],
        image: data.image,
        video: data.video,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || ''
      });
    });
    
    // Update polling state
    lastEventCount = events.length;
    console.log(`✅ Loaded ${events.length} events from Firebase`);
    return events;
  } catch (error) {
    console.error('❌ Error loading events from Firebase:', error);
    throw new Error('Oops! Our server is down. Please try again later.');
  }
};

/**
 * Start polling for new events
 * Returns a function to stop polling
 */
export const startEventPolling = (onNewEvents: (events: FirebaseEvent[]) => void): (() => void) => {
  if (pollingTimer) {
    clearInterval(pollingTimer);
  }

  pollingTimer = setInterval(async () => {
    try {
      const events = await loadEventsFromFirebase();
      
      // Only notify if we have new events
      if (events.length > lastEventCount) {
        console.log(`🆕 Found ${events.length - lastEventCount} new events`);
        onNewEvents(events);
      }
    } catch (error) {
      console.error('Polling error:', error);
      // Don't throw error during polling - just log it
    }
  }, POLLING_INTERVAL);

  // Return function to stop polling
  return () => {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  };
};

/**
 * Stop event polling
 */
export const stopEventPolling = (): void => {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
};

/**
 * Check if there are new events (for pull-to-refresh)
 */
export const checkForNewEvents = async (): Promise<{ hasNewEvents: boolean; eventCount: number }> => {
  try {
    const events = await loadEventsFromFirebase();
    const hasNewEvents = events.length > lastEventCount;
    return { hasNewEvents, eventCount: events.length };
  } catch (error) {
    console.error('Error checking for new events:', error);
    return { hasNewEvents: false, eventCount: lastEventCount };
  }
};

/**
 * Load events for a specific business
 */
export const loadEventsForBusiness = async (businessId: string): Promise<FirebaseEvent[]> => {
  try {
    console.log(`Loading events for business: ${businessId}`);
    
    const eventsCollection = collection(db, 'events');
    const eventsQuery = query(
      eventsCollection, 
      where('businessId', '==', businessId)
    );
    const snapshot = await getDocs(eventsQuery);
    
    const events: FirebaseEvent[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      events.push({
        id: doc.id,
        businessId: data.businessId || '',
        title: data.title || '',
        caption: data.caption,
        date: data.date || '',
        link: data.link,
        tags: data.tags || [],
        image: data.image,
        video: data.video,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || ''
      });
    });
    
    // Sort events by date client-side (newest first for admin dashboard)
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    console.log(`✅ Loaded ${events.length} events for business ${businessId}`);
    return events;
  } catch (error) {
    console.error('❌ Error loading business events:', error);
    throw new Error('Failed to load business events.');
  }
};

// ==========================================
// BUSINESSES FUNCTIONS
// ==========================================

/**
 * Load all businesses from Firebase
 * Returns businesses sorted by name
 */
export const loadBusinessesFromFirebase = async (): Promise<FirebaseBusiness[]> => {
  try {
    console.log('Loading businesses from Firebase...');
    
    const businessesCollection = collection(db, 'businesses');
    const businessesQuery = query(businessesCollection, orderBy('name', 'asc'));
    const snapshot = await getDocs(businessesQuery);
    
    const businesses: FirebaseBusiness[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      businesses.push({
        id: doc.id,
        name: data.name || '',
        address: data.address || '',
        description: data.description || '',
        website: data.website,
        tags: data.tags || [],
        socialLinks: data.socialLinks || [],
        image: data.image,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || ''
      });
    });
    
    console.log(`✅ Loaded ${businesses.length} businesses from Firebase`);
    return businesses;
  } catch (error) {
    console.error('❌ Error loading businesses from Firebase:', error);
    throw new Error('Failed to load businesses. Please check your internet connection.');
  }
};

/**
 * Load a single business by ID
 */
export const loadBusinessById = async (businessId: string): Promise<FirebaseBusiness | null> => {
  try {
    console.log(`Loading business: ${businessId}`);
    
    const businessDoc = doc(db, 'businesses', businessId);
    const snapshot = await getDoc(businessDoc);
    
    if (snapshot.exists()) {
      const data = snapshot.data() as DocumentData;
      const business: FirebaseBusiness = {
        id: snapshot.id,
        name: data.name || '',
        address: data.address || '',
        description: data.description || '',
        website: data.website,
        tags: data.tags || [],
        socialLinks: data.socialLinks || [],
        image: data.image,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || ''
      };
      
      console.log(`✅ Loaded business: ${business.name}`);
      return business;
    } else {
      console.log(`❌ Business not found: ${businessId}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error loading business:', error);
    throw new Error('Failed to load business details.');
  }
};

// ==========================================
// COMBINED LOADING FUNCTIONS
// ==========================================

/**
 * Load events and businesses together (Firebase only - no AsyncStorage fallback)
 * Returns both events with business names attached
 */
export const loadEventsAndBusinesses = async (): Promise<{
  events: (FirebaseEvent & { businessName: string })[];
  businesses: FirebaseBusiness[];
}> => {
  try {
    console.log('Loading events and businesses from Firebase...');
    
    // Load both in parallel for speed
    const [events, businesses] = await Promise.all([
      loadEventsFromFirebase(),
      loadBusinessesFromFirebase()
    ]);
    
    // Create a map of business ID to business name for quick lookup
    const businessMap = new Map<string, string>();
    businesses.forEach(business => {
      businessMap.set(business.id, business.name);
    });
    
    // Add business names to events
    const eventsWithBusinessNames = events.map(event => ({
      ...event,
      businessName: businessMap.get(event.businessId) || 'Unknown Business'
    }));
    
    console.log(`✅ Loaded ${eventsWithBusinessNames.length} events and ${businesses.length} businesses`);
    
    return {
      events: eventsWithBusinessNames,
      businesses
    };
  } catch (error) {
    console.error('❌ Error loading events and businesses:', error);
    throw new Error('Failed to load data. Please check your internet connection.');
  }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Check if Firebase is connected
 */
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Try to read from a collection to test connection
    const testCollection = collection(db, 'businesses');
    const testQuery = query(testCollection, limit(1));
    await getDocs(testQuery);
    
    console.log('✅ Firebase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
};

// ==========================================
// EVENT SAVE FUNCTIONS FOR ADMIN DASHBOARD
// ==========================================

/**
 * Save event directly to Firebase (for admin dashboard)
 */
export const saveEventToFirebase = async (event: Omit<FirebaseEvent, 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    console.log('Saving event to Firebase:', event);
    const eventDoc = doc(db, 'events', event.id);
    
    const eventData = {
      businessId: event.businessId,
      title: event.title,
      caption: event.caption || null,
      date: event.date,
      link: event.link || null,
      tags: event.tags || [],
      image: event.image || null,
      video: event.video || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(eventDoc, eventData);
    console.log('✅ Event saved to Firebase successfully');
  } catch (error) {
    console.error('❌ Error saving event to Firebase:', error);
    throw error;
  }
};

/**
 * Delete event from Firebase (for admin dashboard)
 */
export const deleteEventFromFirebase = async (eventId: string): Promise<void> => {
  try {
    console.log('Deleting event from Firebase:', eventId);
    const eventDoc = doc(db, 'events', eventId);
    
    await deleteDoc(eventDoc);
    console.log('✅ Event deleted from Firebase successfully');
  } catch (error) {
    console.error('❌ Error deleting event from Firebase:', error);
    throw error;
  }
};

// ==========================================
// PENDING EVENTS FUNCTIONS
// ==========================================

/**
 * Save event to pending-events collection (waiting for video compression)
 */
export const savePendingEvent = async (eventData: Omit<FirebaseEvent, 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    console.log('Saving pending event to Firebase:', eventData.id);
    const eventDoc = doc(db, 'pending-events', eventData.id);
    
    const pendingEventData = {
      businessId: eventData.businessId,
      title: eventData.title,
      caption: eventData.caption || null,
      date: eventData.date,
      link: eventData.link || null,
      tags: eventData.tags || [],
      ...(eventData.image && { image: eventData.image }),
      ...(eventData.video && { video: eventData.video }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(eventDoc, pendingEventData);
    console.log('✅ Pending event saved to Firebase successfully');
  } catch (error) {
    console.error('❌ Error saving pending event to Firebase:', error);
    throw error;
  }
};

/**
 * Load pending events for a specific business (dashboard only)
 */
export const loadPendingEventsForBusiness = async (businessId: string): Promise<FirebaseEvent[]> => {
  try {
    console.log('Loading pending events for business:', businessId);
    
    const pendingEventsRef = collection(db, 'pending-events');
    const q = query(
      pendingEventsRef,
      where('businessId', '==', businessId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const pendingEvents: FirebaseEvent[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      pendingEvents.push({
        id: doc.id,
        businessId: data.businessId,
        title: data.title,
        caption: data.caption,
        date: data.date,
        link: data.link,
        tags: data.tags || [],
        image: data.image,
        video: data.video,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });
    
    console.log(`✅ Loaded ${pendingEvents.length} pending events for business ${businessId}`);
    return pendingEvents;
  } catch (error) {
    console.error('❌ Error loading pending events from Firebase:', error);
    throw error;
  }
};

/**
 * Move event from pending-events to events collection (when compression complete)
 */
export const movePendingEventToLive = async (eventId: string, compressedVideoUrl: string): Promise<void> => {
  try {
    console.log('Moving pending event to live:', eventId);
    
    // Get the pending event
    const pendingEventDoc = doc(db, 'pending-events', eventId);
    const pendingEventSnap = await getDoc(pendingEventDoc);
    
    if (!pendingEventSnap.exists()) {
      console.log('Pending event not found:', eventId);
      return;
    }
    
    const eventData = pendingEventSnap.data() as FirebaseEvent;
    
    // Update with compressed video URL
    const liveEventData = {
      ...eventData,
      video: compressedVideoUrl,
      updatedAt: new Date().toISOString()
    };
    
    // Save to events collection
    const liveEventDoc = doc(db, 'events', eventId);
    await setDoc(liveEventDoc, liveEventData);
    
    // Delete from pending-events
    await deleteDoc(pendingEventDoc);
    
    console.log('✅ Event moved from pending to live successfully');
  } catch (error) {
    console.error('❌ Error moving pending event to live:', error);
    throw error;
  }
};

/**
 * Delete event from pending-events collection
 */
export const deletePendingEvent = async (eventId: string): Promise<void> => {
  try {
    console.log('Deleting pending event from Firebase:', eventId);
    const eventDoc = doc(db, 'pending-events', eventId);
    
    await deleteDoc(eventDoc);
    console.log('✅ Pending event deleted from Firebase successfully');
  } catch (error) {
    console.error('❌ Error deleting pending event from Firebase:', error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 */
export const deleteFileFromFirebaseStorage = async (fileUrl: string): Promise<void> => {
  try {
    if (!fileUrl || !fileUrl.includes('firebase')) {
      console.log('Not a Firebase Storage file, skipping:', fileUrl);
      return;
    }

    // Extract file path from Firebase Storage URL
    const url = new URL(fileUrl);
    let filePath = url.pathname.match(/\/o\/(.+?)$/)?.[1];
    
    if (filePath) {
      filePath = decodeURIComponent(filePath);
      console.log('🗑️ Deleting file from Firebase Storage:', filePath);
      
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      
      console.log('✅ File deleted successfully:', filePath);
    } else {
      console.warn('Could not extract file path from URL:', fileUrl);
    }
  } catch (error) {
    console.error('❌ Error deleting file from Firebase Storage:', error);
    console.log('ℹ️ File may have already been deleted or never existed - continuing with event deletion');
    // Don't throw error - event deletion should proceed
    return; // Just return, don't throw
  }
};

/**
 * Delete both original and compressed video files
 */
export const deleteVideoFiles = async (videoUrl: string): Promise<void> => {
  try {
    // Delete the main video file
    await deleteFileFromFirebaseStorage(videoUrl);
    
    // Also try to delete compressed version if it exists
    if (videoUrl.includes('_compressed')) {
      // This is already compressed, try to delete original too
      const originalUrl = videoUrl.replace('_compressed.mp4', '.mp4');
      await deleteFileFromFirebaseStorage(originalUrl);
    } else {
      // This might be original, try to delete compressed version too
      const compressedUrl = videoUrl.replace(/\.(mp4|mov|m4v)$/i, '_compressed.mp4');
      await deleteFileFromFirebaseStorage(compressedUrl);
    }
  } catch (error) {
    console.error('Error deleting video files:', error);
  }
};