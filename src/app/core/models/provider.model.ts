export interface ServiceItem {
  icon: string;
  name: string;
  desc: string;
  rate: number;
  unit: string;
}

export interface Provider {
  id: number;
  name: string;
  service: string;
  city: string;
  icon: string;
  rate: number;
  rating: number;
  reviews: number;
  jobs: number;
  verified: boolean;
  years: number;
  responseTime: string;
  memberSince: string;
  about: string;
  specialties: string[];
  serviceList: ServiceItem[];
  email?: string;
  status?: string;
}
