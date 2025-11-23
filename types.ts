export enum Role {
  USER = 'user',
  GARAGE = 'garage',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role.USER;
  createdAt: Date;
}

export interface Garage {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  balance: number;
  earnings: number;
  commission: number;
  createdAt: Date;
  averageRating?: number;
}

export enum BookingStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  ON_WAY = 'on-way',
  ARRIVED = 'arrived',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  garageId: string;
  rating: number; // 1 to 5
  comment?: string;
  garageResponse?: string;
  createdAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  garageId: string;
  issueType: string;
  status: BookingStatus;
  price: number;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  garage?: Garage;
  review?: Review;
}

export interface Payout {
  id: string;
  garageId: string;
  amount: number;
  status: 'requested' | 'approved' | 'rejected';
  requestedAt: Date;
  processedAt?: Date;
  garage?: Garage;
}