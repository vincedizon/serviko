export interface Booking {
  id: string;
  service: string;
  provider: string;
  date: string;
  amount: string;
  status: 'Pending' | 'Active' | 'Completed' | 'Cancelled';
  rated: boolean;
}

export interface BookingForm {
  service: string;
  description: string;
  address: string;
  city: string;
  duration: string;
  date: string;
  time: string;
  urgency: string;
  contactName: string;
  phone: string;
  notes: string;
}
