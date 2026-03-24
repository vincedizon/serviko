export interface User {
  name: string;
  email: string;
  role: 'client' | 'provider' | 'admin';
  loggedIn: boolean;
}

export interface Review {
  name: string;
  date: string;
  rating: number;
  text: string;
}
