import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Listing {
  _id: string;
  name: string;
  service: string;
  rating: number;
  rate: number;
  verified: boolean;
  description?: string;
  location?: string;
  userId?: string;
}

export interface ListingFilters {
  search?: string;
  category?: string;
  minRating?: number;
  maxRate?: number;
  verifiedOnly?: boolean;
  sortBy?: string;
}

export interface CategoryCount {
  _id: string;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class ListingService {
  private apiUrl = 'http://localhost:3000/api';

  // Selected listing for provider-profile page
  selectedListing = signal<Listing | null>(null);

  constructor(private http: HttpClient) {}

  /** Fetch all listings with optional filters */
  getListings(filters: ListingFilters = {}): Observable<{ success: boolean; data: Listing[] }> {
    let params = new HttpParams();
    if (filters.search)      params = params.set('search', filters.search);
    if (filters.category)    params = params.set('category', filters.category);
    if (filters.minRating)   params = params.set('minRating', filters.minRating.toString());
    if (filters.maxRate)     params = params.set('maxRate', filters.maxRate.toString());
    if (filters.verifiedOnly) params = params.set('verified', 'true');
    if (filters.sortBy)      params = params.set('sortBy', filters.sortBy);

    return this.http.get<{ success: boolean; data: Listing[] }>(`${this.apiUrl}/listings`, { params });
  }

  /** Fetch category counts for home page */
  getCategoryCounts(): Observable<{ success: boolean; data: CategoryCount[] }> {
    return this.http.get<{ success: boolean; data: CategoryCount[] }>(`${this.apiUrl}/listings/categories`);
  }

  /** Get a single listing by ID */
  getListingById(id: string): Observable<{ success: boolean; data: Listing }> {
    return this.http.get<{ success: boolean; data: Listing }>(`${this.apiUrl}/listings/${id}`);
  }

  /** Create a new listing (providers only) */
  createListing(data: Partial<Listing>): Observable<{ success: boolean; data: Listing }> {
    return this.http.post<{ success: boolean; data: Listing }>(`${this.apiUrl}/listings`, data);
  }

  /** Select a listing to view in provider-profile */
  select(listing: Listing): void {
    this.selectedListing.set(listing);
  }
}