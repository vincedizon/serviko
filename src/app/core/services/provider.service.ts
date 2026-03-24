import { Injectable, signal } from '@angular/core';
import { Provider } from '../models/provider.model';

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private _selected = signal<Provider | null>(null);
  readonly selected = this._selected.asReadonly();

  readonly providers: Provider[] = [
    {
      id: 1, name: 'Roldan Santos', service: 'Electrician',
      city: 'San Fernando', icon: '⚡', rate: 350,
      rating: 4.9, reviews: 128, jobs: 214, verified: true,
      years: 8, responseTime: '< 30 min', memberSince: 'Jan 2023',
      about: 'Professional electrician with 8 years experience in residential and commercial electrical work. Specializing in rewiring, panel upgrades, and emergency repairs.',
      specialties: ['Panel Upgrades', 'Rewiring', 'Emergency Repairs', 'Lighting Installation', 'Safety Inspections'],
      serviceList: [
        { icon: '⚡', name: 'Electrical Repair',     desc: 'Fix wiring, outlets, switches',  rate: 350,  unit: 'hr'  },
        { icon: '💡', name: 'Lighting Installation', desc: 'Install LED fixtures & panels',   rate: 400,  unit: 'hr'  },
        { icon: '🔌', name: 'Panel Upgrade',          desc: 'Upgrade circuit breakers',        rate: 2500, unit: 'job' }
      ]
    },
    {
      id: 2, name: 'Maria Lacson', service: 'Plumber',
      city: 'Angeles City', icon: '🔧', rate: 300,
      rating: 4.8, reviews: 94, jobs: 176, verified: true,
      years: 6, responseTime: '< 1 hr', memberSince: 'Mar 2023',
      about: 'Licensed plumber specializing in leak detection, pipe installation, and bathroom renovation.',
      specialties: ['Leak Repair', 'Pipe Installation', 'Bathroom Renovation', 'Drain Cleaning'],
      serviceList: [
        { icon: '🔧', name: 'Leak Repair',       desc: 'Fix pipe leaks and water damage', rate: 300, unit: 'hr' },
        { icon: '🚿', name: 'Pipe Installation', desc: 'Install new pipes & fittings',    rate: 350, unit: 'hr' }
      ]
    },
    {
      id: 3, name: 'Arnel Dizon', service: 'Carpenter',
      city: 'Mabalacat', icon: '🪚', rate: 280,
      rating: 4.7, reviews: 67, jobs: 143, verified: true,
      years: 10, responseTime: '< 2 hrs', memberSince: 'Jun 2022',
      about: 'Skilled carpenter specializing in furniture making, door installation, and custom woodwork.',
      specialties: ['Custom Furniture', 'Door Installation', 'Cabinet Making', 'Flooring'],
      serviceList: [
        { icon: '🪚', name: 'Custom Furniture',  desc: 'Design & build custom pieces', rate: 450, unit: 'hr'  },
        { icon: '🚪', name: 'Door Installation', desc: 'Install doors & frames',       rate: 800, unit: 'job' }
      ]
    },
    {
      id: 4, name: 'Rey Cunanan', service: 'Painter',
      city: 'San Fernando', icon: '🖌️', rate: 250,
      rating: 4.6, reviews: 45, jobs: 98, verified: false,
      years: 5, responseTime: '< 3 hrs', memberSince: 'Sep 2023',
      about: 'Professional painter with expertise in interior and exterior painting using quality materials.',
      specialties: ['Interior Painting', 'Exterior Painting', 'Waterproofing', 'Texture Finishing'],
      serviceList: [
        { icon: '🖌️', name: 'Interior Painting', desc: 'Repaint rooms & ceilings',    rate: 250, unit: 'hr' },
        { icon: '🏠',  name: 'Exterior Painting', desc: 'Repaint building facades',    rate: 300, unit: 'hr' }
      ]
    },
    {
      id: 5, name: 'Jun Escoto', service: 'Aircon Technician',
      city: 'Clark', icon: '❄️', rate: 400,
      rating: 4.9, reviews: 201, jobs: 389, verified: true,
      years: 12, responseTime: '< 1 hr', memberSince: 'Nov 2021',
      about: 'Certified aircon technician servicing all major brands. Fast, reliable, and affordable.',
      specialties: ['AC Cleaning', 'Freon Recharge', 'Installation', 'Troubleshooting', 'General Service'],
      serviceList: [
        { icon: '❄️', name: 'AC Cleaning',    desc: 'Deep clean aircon units',   rate: 400, unit: 'unit' },
        { icon: '🔧', name: 'Freon Recharge', desc: 'Recharge refrigerant gas',  rate: 600, unit: 'unit' }
      ]
    },
    {
      id: 6, name: 'Lenie Buenaventura', service: 'House Cleaner',
      city: 'Porac', icon: '🧹', rate: 200,
      rating: 4.5, reviews: 53, jobs: 112, verified: true,
      years: 4, responseTime: '< 2 hrs', memberSince: 'Apr 2023',
      about: 'Experienced house cleaner offering thorough residential cleaning services.',
      specialties: ['Deep Cleaning', 'Post-renovation Cleanup', 'Regular Housekeeping', 'Window Cleaning'],
      serviceList: [
        { icon: '🧹', name: 'General Cleaning', desc: 'Full house cleaning service',   rate: 200, unit: 'hr' },
        { icon: '✨', name: 'Deep Cleaning',    desc: 'Intensive top-to-bottom clean', rate: 250, unit: 'hr' }
      ]
    },
    {
      id: 7, name: 'Dennis Flores', service: 'Welder',
      city: 'Mexico, Pampanga', icon: '🔥', rate: 320,
      rating: 4.7, reviews: 38, jobs: 87, verified: true,
      years: 7, responseTime: '< 2 hrs', memberSince: 'Feb 2023',
      about: 'Professional welder specializing in steel gates, grills, and structural welding.',
      specialties: ['Steel Gates', 'Grills', 'Structural Welding', 'Fabrication'],
      serviceList: [
        { icon: '🔥', name: 'Gate Fabrication', desc: 'Custom steel gates & doors',   rate: 1500, unit: 'job' },
        { icon: '🔩', name: 'Welding Repair',   desc: 'Fix broken metal structures',  rate: 320,  unit: 'hr'  }
      ]
    },
    {
      id: 8, name: 'Carlo Manansala', service: 'Pest Control',
      city: 'Lubao', icon: '🐛', rate: 500,
      rating: 4.8, reviews: 72, jobs: 145, verified: true,
      years: 9, responseTime: '< 1 hr', memberSince: 'Jul 2022',
      about: 'Licensed pest control specialist covering termites, cockroaches, and rodents.',
      specialties: ['Termite Control', 'Cockroach Treatment', 'Rodent Control', 'Fumigation'],
      serviceList: [
        { icon: '🐛', name: 'General Pest Control', desc: 'Full property treatment',   rate: 1200, unit: 'session' },
        { icon: '🐜', name: 'Termite Treatment',    desc: 'Soil & wood treatment',     rate: 2500, unit: 'session' }
      ]
    }
  ];

  select(provider: Provider): void { this._selected.set(provider); }

  getById(id: number): Provider | undefined {
    return this.providers.find(p => p.id === id);
  }

  getSelectedOrFirst(): Provider {
    return this._selected() ?? this.providers[0];
  }
}
