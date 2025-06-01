// app/data/businesses.ts

/**
 * Business interface - displayed in the Explore screen
 */
export interface Business {
  id: string;
  name: string;
  address: string;
  description: string;
  website?: string;
  tags: string[];
  socialLinks?: string[];
  image?: string;
}