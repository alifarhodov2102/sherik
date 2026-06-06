// src/types.ts (or similar)

export interface Listing {
  id: string;
  price: number;
  district: string;
  genderPreference: string;
  isVerified: boolean;
  imageUrl: string;
  userId: string; 
}