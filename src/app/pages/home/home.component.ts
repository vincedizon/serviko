import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../core/services/listing.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(50, [
            animate('400ms cubic-bezier(0.165, 0.84, 0.44, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  searchTerm = '';

  // Default categories with static icons — counts replaced by real data
  serviceCategories = [
    { icon: '⚡', name: 'Electrical',      count: 0 },
    { icon: '🔧', name: 'Plumbing',         count: 0 },
    { icon: '🪚', name: 'Carpentry',        count: 0 },
    { icon: '🖌️', name: 'Painting',         count: 0 },
    { icon: '❄️', name: 'Aircon',           count: 0 },
    { icon: '🧹', name: 'Cleaning',         count: 0 },
    { icon: '🔥', name: 'Welding',          count: 0 },
    { icon: '🐛', name: 'Pest Control',     count: 0 },
    { icon: '🌿', name: 'Landscaping',      count: 0 },
    { icon: '🛁', name: 'Tiling',           count: 0 },
    { icon: '🔩', name: 'Masonry',          count: 0 },
    { icon: '📺', name: 'Appliance Repair', count: 0 },
  ];

  steps = [
    { num: '1', title: 'Search & Browse',  desc: 'Find verified service professionals in your area of Pampanga.' },
    { num: '2', title: 'Book Online',       desc: 'Choose your schedule, describe the job, and confirm instantly.' },
    { num: '3', title: 'Pay Securely',      desc: 'Pay via GCash or Maya. Funds held in escrow until work is done.' },
    { num: '4', title: 'Rate & Review',     desc: 'After the job, rate your provider to help the community.' },
  ];

  constructor(private router: Router, private listingService: Listing