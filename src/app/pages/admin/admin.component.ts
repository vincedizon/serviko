import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { Router }        from '@angular/router';
import { HttpClient }    from '@angular/common/http';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

type AdminTab = 'dashboard' | 'providers' | 'users' | 'bookings' | 'payments' | 'verification';

@Component({
  selector:    'app-admin',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls:   ['./admin.component.css'],
  animations: [
    trigger('staggerFade', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger(40, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class AdminComponent implements OnInit {
  private api = 'http://localhost:3000/api';

  tab           = signal<AdminTab>('dashboard');
  loading       = signal(true);
  providerSearch = '';
  providerFilter = '';
  userSearch     = '';

  // Dashboard stats (computed from real data)
  adminStats = signal([
    { icon:'👥', val:'—',  label:'Total Users',    trend:'Loading...', color:'var(--text)'    },
    { icon:'🔧', val:'—',  label:'Providers',      trend:'Loading...', color:'var(--cyan)'    },
    { icon:'📋', val:'—',  label:'Total Bookings', trend:'Loading...', color:'var(--accent)'  },
    { icon:'💰', val:'—',  label:'Revenue (YTD)',  trend:'Loading...', color:'var(--success)' },
  ]);

  recentActivity = signal<any[]>([]);
  providers      = signal<any[]>([]);
  users          = signal<any[]>([]);
  allBookings    = signal<any[]>([]);
  payments       = signal<any[]>([]);
  verificationQueue = signal<any[]>([]);

  pendingVerifications = computed(() =>
    this.verificationQueue().length
  );

  filteredProviders = computed(() => {
    const s = this.providerSearch.toLowerCase();
    return this.providers().filter(p => {
      const matchSearch = !s || p.name?.toLowerCase().includes(s) || p.category?.toLowerCase().includes(s);
      const matchFilter = !this.providerFilter || p.status === this.providerFilter;
      return matchSearch && matchFilter;
    });
  });

  filteredUsers = computed(() => {
    const s = this.userSearch.toLowerCase();
    return !s
      ? this.users()
      : this.users().filter(u => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s));
  });

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    // Load listings (providers)
    this.http.get<any[]>(`${this.api}/listings`).subscribe(data => {
      const mapped = data.map(p => ({
        ...p,
        name:    p.providerName ?? p.title,
        service: p.category,
        city:    p.city,
        rating:  p.rating ?? '—',
        jobs:    p.completedJobs ?? 0,
        email:   (p.providerName ?? 'provider').toLowerCase().replace(/\s/g, '.') + '@serviko.ph',
        status:  p.verified ? 'Verified' : 'Pending',
      }));
      this.providers.set(mapped);

      // Update stats
      this.adminStats.update(stats => {
        stats[1] = { ...stats[1], val: String(mapped.length), trend: `${mapped.filter(p => p.status==='Verified').length} verified` };
        return [...stats];
      });
    });

    // Load users
    this.http.get<any[]>(`${this.api}/users`).subscribe({
      next: (data) => {
        this.users.set(data.map(u => ({
          ...u,
          name:     u.name,
          email:    u.email,
          city:     u.city ?? 'Angeles City',
          bookings: u.bookingCount ?? 0,
          joined:   new Date(u.createdAt).toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' }),
        })));
        this.adminStats.update(stats => {
          stats[0] = { ...stats[0], val: String(data.length), trend: `${data.length} registered` };
          return [...stats];
        });
      },
      error: () => {} // non-critical
    });

    // Load bookings
    this.http.get<any[]>(`${this.api}/bookings`).subscribe({
      next: (data) => {
        const mapped = data.map(b => ({
          id:       b.ref ?? b._id?.slice(-5).toUpperCase(),
          client:   b.user?.name ?? 'Client',
          provider: b.listing?.providerName ?? 'Provider',
          service:  b.service ?? b.listing?.category ?? '—',
          date:     new Date(b.date ?? b.createdAt).toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' }),
          amount:   b.totalAmount ?? '—',
          status:   b.status,
        }));
        this.allBookings.set(mapped);

        // Build recent activity from latest 5 bookings
        const activity = mapped.slice(0, 5).map(b => ({
          time:   'Recently',
          event:  'New booking created',
          user:   b.client,
          status: b.status,
        }));
        this.recentActivity.set(activity);

        // Update stats
        this.adminStats.update(stats => {
          stats[2] = { ...stats[2], val: String(mapped.length), trend: `${mapped.filter(b=>b.status==='Pending').length} pending` };
          return [...stats];
        });
      },
      error: () => {}
    });

    // Load payments
    this.http.get<any[]>(`${this.api}/payments`).subscribe({
      next: (data) => {
        const mapped = data.map(p => ({
          _id:      p._id,
          ref:      p.ref,
          client:   p.user?.name ?? 'Client',
          provider: p.booking?.listing?.providerName ?? 'Provider',
          method:   p.method,
          amount:   p.amount,
          date:     new Date(p.createdAt).toLocaleDateString('en-PH', { month:'short', day:'numeric' }),
          status:   p.status,
        }));
        this.payments.set(mapped);

        // Revenue
        const revenue = mapped
          .filter(p => p.status === 'Released')
          .reduce((s, p) => s + Number(p.amount), 0);
        this.adminStats.update(stats => {
          stats[3] = { ...stats[3], val: `₱${revenue.toLocaleString()}`, trend: `${mapped.filter(p=>p.status==='Held').length} held` };
          return [...stats];
        });

        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    // Load verification queue (listings with status Pending)
    this.http.get<any[]>(`${this.api}/listings?status=Pending`).subscribe({
      next: (data) => {
        const queue = data
          .filter(l => !l.verified)
          .map(l => ({
            _id:       l._id,
            name:      l.providerName ?? l.title,
            service:   l.category,
            city:      l.city,
            submitted: 'Recently',
            idType:    'PhilSys ID',
            icon:      '🔧',
          }));
        this.verificationQueue.set(queue);
      },
      error: () => {}
    });
  }

  setTab(t: AdminTab): void { this.tab.set(t); }
  go(path: string): void    { this.router.navigate([path]); }

  releasePayment(p: any): void {
    this.http.patch(`${this.api}/payments/${p._id}/release`, {}).subscribe({
      next: () => {
        this.payments.update(list =>
          list.map(item => item._id === p._id ? { ...item, status: 'Released' } : item)
        );
      }
    });
  }

  verifyProvider(p: any): void {
    this.http.patch(`${this.api}/listings/${p._id}`, { verified: true }).subscribe({
      next: () => {
        this.providers.update(list =>
          list.map(item => item._id === p._id ? { ...item, verified: true, status: 'Verified' } : item)
        );
      }
    });
  }

  suspendProvider(p: any): void {
    this.http.patch(`${this.api}/listings/${p._id}`, { status: 'Suspended' }).subscribe({
      next: () => {
        this.providers.update(list =>
          list.map(item => item._id === p._id ? { ...item, status: 'Suspended' } : item)
        );
      }
    });
  }

  approveVerification(v: any): void {
    this.http.patch(`${this.api}/listings/${v._id}`, { verified: true }).subscribe({
      next: () => {
        this.verificationQueue.update(q => q.filter(item => item._id !== v._id));
      }
    });
  }

  rejectVerification(v: any): void {
    this.verificationQueue.update(q => q.filter(item => item._id !== v._id));
  }

  statusBadge(s: string)  {
    const m: Record<string,string> = { Pending:'badge-accent', Active:'badge-info', Completed:'badge-success', Cancelled:'badge-danger', Held:'badge-accent', Released:'badge-success' };
    return m[s] ?? 'badge-muted';
  }
  providerBadge(s: string) {
    return ({ Verified:'badge-success', Pending:'badge-accent', Suspended:'badge-danger' } as any)[s] ?? 'badge-muted';
  }
  payBadge(s: string) {
    return ({ Held:'badge-accent', Released:'badge-success', Pending:'badge-muted', Disputed:'badge-danger' } as any)[s] ?? 'badge-muted';
  }
}