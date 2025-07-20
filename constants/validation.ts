// constants/validation.ts
// Extracted validation functions from dashboard.tsx

import * as Location from 'expo-location';

// Business data validation
export const validateBusinessData = async (businessData: {
  name: string;
  address: string;
  description: string;
  website: string;
  tags: string;
  socialLinks: string;
}) => {
  const errors: string[] = [];

  // Business name validation
  if (!businessData.name.trim()) {
    errors.push("Business name is required");
  } else if (businessData.name.trim().length > 50) {
    errors.push("Business name must be 50 characters or less");
  }

  // Address validation
  if (!businessData.address.trim()) {
    errors.push("Address is required");
  } else {
    // Test if address can be geocoded
    try {
      const geocoded = await Location.geocodeAsync(businessData.address.trim());
      if (!geocoded || geocoded.length === 0) {
        errors.push("Please enter a valid address that can be found on maps");
      }
    } catch (error) {
      errors.push("Unable to verify address. Please check your internet connection and try again");
    }
  }

  // Description validation
  if (!businessData.description.trim()) {
    errors.push("Business description is required");
  } else if (businessData.description.trim().length > 2500) {
    errors.push("Description must be 2,500 characters or less");
  }

  // Website validation (required)
  if (!businessData.website.trim()) {
    errors.push("Website is required");
  } else {
    // More flexible website validation - allow domain names without protocol
    const websiteValue = businessData.website.trim();
    // Check if it's a valid domain format (with or without protocol)
    const domainRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!domainRegex.test(websiteValue)) {
      errors.push("Please enter a valid website (e.g., yourwebsite.com or https://yourwebsite.com)");
    }
  }

  // Tags validation
  if (!businessData.tags.trim()) {
    errors.push("At least one tag is required");
  } else if (businessData.tags.length > 200) {
    errors.push("Tags must be 200 characters or less");
  }

  // Social links validation (optional, but if provided must be valid)
  if (businessData.socialLinks.trim()) {
    if (businessData.socialLinks.length > 500) {
      errors.push("Social links must be 500 characters or less");
    }
    
    // Check if each social link is a valid URL
    const links = businessData.socialLinks.split(',').map(link => link.trim());
    const urlRegex = /^https?:\/\/.+\..+/;
    const invalidLinks = links.filter(link => link && !urlRegex.test(link));
    
    if (invalidLinks.length > 0) {
      errors.push("All social links must be valid URLs (e.g., https://facebook.com/yourpage)");
    }
  }

  return errors;
};

// Event data validation
export const validateEventData = (eventData: {
  title: string;
  caption: string;
  date: Date;
  link: string;
  interests: string[];
}) => {
  const errors: string[] = [];

  // Event title validation
  if (!eventData.title.trim()) {
    errors.push("Event title is required");
  } else if (eventData.title.trim().length > 100) {
    errors.push("Event title must be 100 characters or less");
  }

  // Event description validation (optional)
  if (eventData.caption.trim().length > 300) {
    errors.push("Event description must be 300 characters or less");
  }

  // Date validation (future only)
  const now = new Date();
  if (eventData.date <= now) {
    errors.push("Event date must be in the future");
  }

  // Link validation (optional, but if provided must be valid)
  if (eventData.link.trim()) {
    if (eventData.link.length > 200) {
      errors.push("Event link must be 200 characters or less");
    }
    
    // More flexible link validation - allow domain names without protocol
    const linkValue = eventData.link.trim();
    const domainRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!domainRegex.test(linkValue)) {
      errors.push("Event link must be a valid URL (e.g., tickets.com or https://tickets.com)");
    }
  }

  // Interests validation
  if (!eventData.interests || eventData.interests.length === 0) {
    errors.push("Please select at least one interest category for your event");
  }

  return errors;
};

// Website URL formatting helper
export const formatWebsiteUrl = (website: string): string => {
  if (!website) return website;
  
  // If it already has a protocol, return as-is
  if (website.startsWith('http://') || website.startsWith('https://')) {
    return website;
  }
  
  // Add https:// prefix for consistency and clickability
  return `https://${website}`;
}; 