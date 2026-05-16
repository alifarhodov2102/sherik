// src/types/index.ts

export interface Listing {
  id: string;
  price: number;
  district: string;
  genderPreference: 'Male' | 'Female' | 'Any';
  isVerified: boolean;
  imageUrl: string;
}
