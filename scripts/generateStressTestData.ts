// scripts/generateStressTestData.ts
// Run this to flood your app with test data for stress testing

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Business } from '../data/businesses';
import { Event } from '../data/events';

// Business name generators
const businessTypes = [
  { type: 'Cafe', names: ['Byron', 'Beach', 'Sunrise', 'Coastal', 'Pacific', 'Lighthouse', 'Karma', 'Elements'] },
  { type: 'Restaurant', names: ['The Bay', 'Fishheads', 'Bayleaf', 'Salt', 'Pier', 'Dunes', 'Twisted Sista'] },
  { type: 'Yoga Studio', names: ['Byron', 'Zen', 'Flow', 'Sacred', 'Divine', 'Lotus', 'Mindful', 'Peaceful'] },
  { type: 'Gallery', names: ['Byron', 'Arts', 'Creative', 'Local', 'Coastal', 'Contemporary', 'Regional'] },
  { type: 'Brewery', names: ['Byron Bay', 'Stone & Wood', 'Pacific', 'Lighthouse', 'Coastal', 'Hinterland'] },
  { type: 'Boutique', names: ['Byron', 'Bohemian', 'Spell', 'Arnhem', 'Island', 'Coastal', 'Natural'] },
  { type: 'Surf Shop', names: ['Byron', 'DHD', 'Simon Anderson', 'Wategos', 'The Pass', 'Clarkes Beach'] },
  { type: 'Wellness Center', names: ['Byron', 'Healing', 'Natural', 'Wholistic', 'Elements', 'Sacred'] }
];

const addresses = [
  'Jonson Street, Byron Bay NSW 2481',
  'Bay Street, Byron Bay NSW 2481',  
  'Fletcher Street, Byron Bay NSW 2481',
  'Lawson Street, Byron Bay NSW 2481',
  'Marvel Street, Byron Bay NSW 2481',
  'Butler Street, Byron Bay NSW 2481',
  'Bangalow Road, Byron Bay NSW 2481',
  'Ewingsdale Road, Byron Bay NSW 2481',
  'Arts & Industry Estate, Byron Bay NSW 2481',
  'The Plaza, 90 Jonson Street, Byron Bay NSW 2481'
];

const eventTitles = [
  'Live Music Night',
  'Morning Yoga Session',
  'Art Exhibition Opening',
  'Wine Tasting Evening',
  'Local Markets',
  'Beach Cleanup',
  'Comedy Night',
  'Trivia Tuesday',
  'Open Mic Night',
  'Sunset Session',
  'Film Screening',
  'Workshop Session',
  'Community Event',
  'Fundraiser Night',
  'Cultural Festival',
  'Food & Wine Festival',
  'Wellness Workshop',
  'Surf Competition',
  'Music Festival',
  'Craft Workshop'
];

const tags = [
  'Live Music', 'Art', 'Electronic Music', 'Open Mic Nights', 'Comedy', 'Trivia', 'Films',
  'Yoga/Pilates', 'Wellness', 'Fitness', 'Outdoor activities', 'Surfing', 'Markets',
  'Beer, Wine & Spirits', 'Food & Drink Specials', 'Food', 'Workshops', 'Community Events',
  'Fundraisers', 'Cultural Events'
];

// Sample image URLs (placeholder services)
const imageUrls = [
  'https://picsum.photos/400/300?random=1',
  'https://picsum.photos/400/300?random=2',
  'https://picsum.photos/400/300?random=3',
  'https://picsum.photos/400/300?random=4',
  'https://picsum.photos/400/300?random=5',
  'https://picsum.photos/400/300?random=6',
  'https://picsum.photos/400/300?random=7',
  'https://picsum.photos/400/300?random=8',
  'https://picsum.photos/400/300?random=9',
  'https://picsum.photos/400/300?random=10'
];

// Sample video URLs (public test videos)
const videoUrls = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateBusinessName(): string {
  const businessType = getRandomItem(businessTypes);
  const name = getRandomItem(businessType.names);
  return `${name} ${businessType.type}`;
}

function generateBusiness(id: string): Business {
  const businessTags = getRandomItems(tags, Math.floor(Math.random() * 4) + 1);
  
  return {
    id,
    name: generateBusinessName(),
    address: getRandomItem(addresses),
    description: `A wonderful ${businessTags.join(' and ').toLowerCase()} venue in the heart of Byron Bay. Experience the best of what our town has to offer with friendly service and a great atmosphere.`,
    website: Math.random() > 0.3 ? `https://${generateBusinessName().toLowerCase().replace(/\s+/g, '')}.com.au` : undefined,
    tags: businessTags,
    socialLinks: Math.random() > 0.4 ? [
      `https://instagram.com/${generateBusinessName().toLowerCase().replace(/\s+/g, '')}`,
      ...(Math.random() > 0.5 ? [`https://facebook.com/${generateBusinessName().toLowerCase().replace(/\s+/g, '')}`] : [])
    ] : undefined,
    image: Math.random() > 0.2 ? getRandomItem(imageUrls) : undefined
  };
}

function generateEvent(businessId: string, eventId: string): Event {
  const eventTags = getRandomItems(tags, Math.floor(Math.random() * 3) + 1);
  
  // Generate random date in next 3 months
  const now = new Date();
  const futureDate = new Date(now.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);
  
  // Random hour between 8 AM and 11 PM
  futureDate.setHours(Math.floor(Math.random() * 15) + 8);
  futureDate.setMinutes(Math.random() > 0.5 ? 0 : 30);
  
  const hasMedia = Math.random() > 0.3;
  const isVideo = hasMedia && Math.random() > 0.6; // 40% of media is video
  
  return {
    id: eventId,
    businessId,
    title: getRandomItem(eventTitles),
    date: futureDate.toISOString(),
    link: Math.random() > 0.4 ? `https://eventbrite.com/event-${eventId}` : undefined,
    tags: eventTags,
    image: hasMedia && !isVideo ? getRandomItem(imageUrls) : undefined,
    video: hasMedia && isVideo ? getRandomItem(videoUrls) : undefined
  };
}

export async function generateStressTestData() {
  console.log('🚀 Generating stress test data...');
  
  try {
    // Get existing data
    const existingBusinesses = await AsyncStorage.getItem('businesses');
    const existingEvents = await AsyncStorage.getItem('events');
    
    const currentBusinesses = existingBusinesses ? JSON.parse(existingBusinesses) : [];
    const currentEvents = existingEvents ? JSON.parse(existingEvents) : [];
    
    console.log(`📊 Current data: ${currentBusinesses.length} businesses, ${currentEvents.length} events`);
    
    // Generate 100 new businesses
    const newBusinesses: Business[] = [];
    for (let i = 0; i < 100; i++) {
      newBusinesses.push(generateBusiness(`stress_biz_${i}`));
    }
    
    // Generate 5 events per business (500 total events)
    const newEvents: Event[] = [];
    newBusinesses.forEach((business, bizIndex) => {
      for (let eventIndex = 0; eventIndex < 5; eventIndex++) {
        newEvents.push(generateEvent(business.id, `stress_event_${bizIndex}_${eventIndex}`));
      }
    });
    
    // Merge with existing data
    const allBusinesses = [...currentBusinesses, ...newBusinesses];
    const allEvents = [...currentEvents, ...newEvents];
    
    // Save to AsyncStorage
    await AsyncStorage.setItem('businesses', JSON.stringify(allBusinesses));
    await AsyncStorage.setItem('events', JSON.stringify(allEvents));
    
    console.log('✅ Stress test data generated successfully!');
    console.log(`📈 New totals: ${allBusinesses.length} businesses, ${allEvents.length} events`);
    console.log('🎬 Includes mix of images and videos for media stress testing');
    console.log('📅 Events spread across next 3 months');
    
    return {
      businesses: allBusinesses.length,
      events: allEvents.length,
      newBusinesses: newBusinesses.length,
      newEvents: newEvents.length
    };
    
  } catch (error) {
    console.error('❌ Error generating stress test data:', error);
    throw error;
  }
}

// Helper function to clear all generated data (for cleanup)
export async function clearStressTestData() {
  console.log('🧹 Clearing stress test data...');
  
  try {
    const existingBusinesses = await AsyncStorage.getItem('businesses');
    const existingEvents = await AsyncStorage.getItem('events');
    
    if (existingBusinesses) {
      const businesses = JSON.parse(existingBusinesses);
      const originalBusinesses = businesses.filter((b: any) => !b.id.startsWith('stress_biz_'));
      await AsyncStorage.setItem('businesses', JSON.stringify(originalBusinesses));
    }
    
    if (existingEvents) {
      const events = JSON.parse(existingEvents);
      const originalEvents = events.filter((e: any) => !e.id.startsWith('stress_event_'));
      await AsyncStorage.setItem('events', JSON.stringify(originalEvents));
    }
    
    console.log('✅ Stress test data cleared!');
    
  } catch (error) {
    console.error('❌ Error clearing stress test data:', error);
    throw error;
  }
}