import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProviderService } from '../../core/services/provider.service';
import { Provider } from '../../core/models/provider.model';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

type AdminTab = 'dashboard'|'providers'|'users'|'bookings'|'payments'|'verification';

interface AdminProvider extends Provider { email: string; status: string; }

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
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
export class AdminComponent {
  tab                  = signal<AdminTab>('dashboard');
  pendingVerifications = signal(3);
  providerSearch       = '';
  providerFilter       = '';
  userSearch           = '';

  constructor(private providerService: ProviderService, private router: Router) {}

  setTab(t: AdminTab): void { this.tab.set(t); }
  go(path: string): void    { this.router.navigate([path]); }

  adminStats = [
    { icon:'👥', val:'10,241', label:'Total Users',    trend:'↑ +342 this month',   color:'var(--text)'    },
    { icon:'🔧', val:'2,814',  label:'Providers',      trend:'↑ +58 this month',    color:'var(--cyan)'    },
    { icon:'📋', val:'15,892', label:'Total Bookings', trend:'↑ +891 this month',   color:'var(--accent)'  },
    { icon:'💰', val:'₱1.2M',  label:'Revenue (YTD)',  trend:'↑ +18% vs last year', color:'var(--success)' },
  ];

  recentActivity = [
    { time:'2 min ago',  event:'New booking created',      user:'Ana Santos',    status:'Pending'   },
    { time:'5 min ago',  event:'Provider verified',         user:'Jun Escoto',    status:'Completed' },
    { time:'12 min ago', event:'Payment received',          user:'Mario Reyes',   status:'Completed' },
    { time:'18 min ago', event:'New provider registration', user:'Dennis Flores', status:'Pending'   },
    { time:'25 min ago', event:'Dispute raised',            user:'Rosa Manalo',   status:'Active'    },
  ];

  providers: AdminProvider[] = this.providerService.providers.map(p => ({
    ...p,
    email:  p.name.toLowerCase().replace(' ', '.') + '@serviko.ph',
    status: p.verified ? 'Verified' : 'Pending'
  }));

  users = [
    { name:'Juan dela Cruz', email:'juan@email.com',  city:'Angeles City', bookings:12, joined:'Jan 15, 2026' },
    { name:'Maria Santos',   email:'maria@email.com', city:'San Fernando', bookings:7,  joined:'Jan 22, 2026' },
    { name:'Pedro Reyes',    email:'pedro@email.com', city:'Mabalacat',    bookings:3,  joined:'Feb 3, 2026'  },
    { name:'Ana Garcia',     email:'ana@email.com',   city:'Clark',        bookings:15, joined:'Dec 10, 2025' },
    { name:'Rosa Cruz',      email:'rosa@email.com',  city:'Porac',        bookings:5,  joined:'Feb 18, 2026' },
  ];

  allBookings = [
    { id:'SK-10023', client:'Juan dela Cruz', provider:'Roldan Santos',      service:'Electrical Repair', date:'Mar 10, 2026', amount:'750',  status:'Pending'   },
    { id:'SK-10022', client:'Ana Garcia',     provider:'Jun Escoto',         service:'AC Cleaning',       date:'Mar 8, 2026',  amount:'400',  status:'Completed' },
    { id:'SK-10021', client:'Maria Santos',   provider:'Maria Lacson',       service:'Leak Repair',       date:'Mar 6, 2026',  amount:'600',  status:'Active'    },
    { id:'SK-10020', client:'Pedro Reyes',    provider:'Arnel Dizon',        service:'Carpentry',         date:'Mar 4, 2026',  amount:'1200', status:'Completed' },
    { id:'SK-10019', client:'Rosa Cruz',      provider:'Lenie Buenaventura', service:'Deep Cleaning',     date:'Mar 2, 2026',  amount:'500',  status:'Pending'   },
  ];

  payments = [
    { ref:'PAY-88821', client:'Juan dela Cruz', provider:'Roldan Santos',      method:'GCash', amount:'750',  date:'Mar 10', status:'Held'     },
    { ref:'PAY-88820', client:'Ana Garcia',     provider:'Jun Escoto',         method:'Maya',  amount:'400',  date:'Mar 8',  status:'Released' },
    { ref:'PAY-88819', client:'Maria Santos',   provider:'Maria Lacson',       method:'GCash', amount:'600',  date:'Mar 6',  status:'Released' },
    { ref:'PAY-88818', client:'Pedro Reyes',    provider:'Arnel Dizon',        method:'BDO',   amount:'1200', date:'Mar 4',  status:'Released' },
    { ref:'PAY-88817', client:'Rosa Cruz',      provider:'Lenie Buenaventura', method:'Cash',  amount:'500',  date:'Mar 2',  status:'Pending'  },
  ];

  verificationQueue = [
    { name:'Dennis Flores',    service:'Welder',     city:'Mexico',  submitted:'2 days ago', idType:"Driver's License", icon:'🔥' },
    { name:'New Provider',     service:'Landscaper', city:'Porac',   submitted:'3 days ago', idType:'PhilSys ID',       icon:'🌿' },
    { name:'Cynthia Bautista', service:'Tiler',      city:'Guagua',  submitted:'4 days ago', idType:'SSS ID',           icon:'🧱' },
  ];

  filteredProviders() {
    return this.providers.filter(p => {
      const s = this.providerSearch.toLowerCase();
      const matchSearch = !s || p.name.toLowerCase().includes(s) || p.service.toLowerCase().includes(s);
      const matchFilter = !this.providerFilter || p.status === this.providerFilter;
      return matchSearch && matchFilter;
    });
  }
  filteredUsers() {
    const s = this.userSearch.toLowerCase();
    return !s ? this.users : this.users.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
  }

  statusBadge(s: string)  { const m: Record<string,string> = {Pending:'badge-accent',Active:'badge-info',Completed:'badge-success',Cancelled:'badge-danger',Held:'badge-accent',Released:'badge-success'}; return m[s]??'badge-muted'; }
  providerBadge(s: string){ return {Verified:'badge-success',Pending:'badge-accent',Suspended:'badge-danger'}[s]??'badge-muted'; }
  payBadge(s: string)     { return {Held:'badge-accent',Released:'badge-success',Pending:'badge-muted',Disputed:'badge-danger'}[s]??'badge-muted'; }

  verifyProvider(p: AdminProvider):  void { p.verified = true;  p.status = 'Verified'; }
  suspendProvider(p: AdminProvider): void { p.status = 'Suspended'; }
  approveVerification(v: any): void {
    const i = this.verificationQueue.indexOf(v);
    if (i > -1) { this.verificationQueue.splice(i,1); this.pendingVerifications.update(n => n-1); }
  }
  rejectVerification(v: any): void {
    const i = this.verificationQueue.indexOf(v);
    if (i > -1) { this.verificationQueue.splice(i,1); this.pendingVerifications.update(n => n-1); }
  }
}
