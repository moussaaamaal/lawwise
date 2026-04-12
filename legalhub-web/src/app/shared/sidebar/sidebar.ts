import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

interface NavItem {
  label:       string;
  icon:        string;
  route:       string;
  badge?:      string;      
  badgeColor?: string;      
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  private authService  = inject(AuthService);
  private notifService = inject(NotificationService);

  currentUser   = this.authService.currentUser;

  // ── Signals dynamiques (mis à jour par NotificationService) ──
  unreadCount   = this.notifService.unreadCount;   // badge Notifications
  casesCount    = this.notifService.casesCount;    // badge Cases
  calendarCount = this.notifService.calendarCount; // badge Calendar

  navGroups: NavGroup[] = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', icon: 'fa-solid fa-chart-line',   route: '/dashboard' },
        { label: 'Cases',     icon: 'fa-solid fa-briefcase',    route: '/cases' },
        { label: 'Clients',   icon: 'fa-solid fa-users',        route: '/clients' },
        { label: 'Calendar',  icon: 'fa-solid fa-calendar-alt', route: '/calendar' },
      ]
    },
    {
      title: 'Management',
      items: [
        { label: 'Documents',    icon: 'fa-solid fa-folder-open',         route: '/documents' },
        { label: 'Billing',      icon: 'fa-solid fa-file-invoice-dollar', route: '/billing' },
        { label: 'AI Assistant', icon: 'fa-solid fa-robot',               route: '/ai-assistant' },
      ]
    },
    {
      title: 'Team',
      items: [
        { label: 'Staff',         icon: 'fa-solid fa-user-group', route: '/staff' },
        { label: 'Notifications', icon: 'fa-solid fa-bell',       route: '/notifications' },
      ]
    },
    {
      title: 'System',
      items: [
        { label: 'Settings',    icon: 'fa-solid fa-cog',             route: '/settings' },
        { label: 'Help Center', icon: 'fa-solid fa-circle-question', route: '/help' },
      ]
    }
  ];

  logout(): void {
    this.authService.logout();
  }
}