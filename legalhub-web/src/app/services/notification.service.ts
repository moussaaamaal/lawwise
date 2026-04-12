import { Injectable, signal, computed } from '@angular/core';

/**
 * NotificationService — source unique de vérité pour tous les badges de navigation.
 *
 * Intégration API : appeler setBadges() depuis n'importe quel composant/guard :
 *
 *   this.http.get('/api/badges').subscribe((data: BadgeCounts) => {
 *     this.notificationService.setBadges(data);
 *   });
 */

export interface BadgeCounts {
  unreadNotifications?: number;
  cases?:               number;
  calendar?:            number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  // ── Signals privés (writables) ────────────────────────────
  private _unreadCount  = signal<number>(8);   // notifications non lues
  private _casesCount   = signal<number>(24);  // dossiers actifs
  private _calendarCount = signal<number>(3);  // événements à venir

  // ── Signals publics (read-only) ───────────────────────────
  /** Utilisé par la sidebar — badge Notifications */
  readonly unreadCount   = this._unreadCount.asReadonly();

  /** Utilisé par la sidebar — badge Cases */
  readonly casesCount    = this._casesCount.asReadonly();

  /** Utilisé par la sidebar — badge Calendar */
  readonly calendarCount = this._calendarCount.asReadonly();

  // ── Setters individuels ───────────────────────────────────
  setUnreadCount(n: number)   { this._unreadCount.set(Math.max(0, n)); }
  setCasesCount(n: number)    { this._casesCount.set(Math.max(0, n)); }
  setCalendarCount(n: number) { this._calendarCount.set(Math.max(0, n)); }

  /** Met à jour plusieurs compteurs d'un coup (ex: réponse API /api/badges) */
  setBadges(counts: BadgeCounts) {
    if (counts.unreadNotifications != null) this.setUnreadCount(counts.unreadNotifications);
    if (counts.cases               != null) this.setCasesCount(counts.cases);
    if (counts.calendar            != null) this.setCalendarCount(counts.calendar);
  }

  /** Décrémente après "mark as read" */
  decrementUnread(by = 1) {
    this._unreadCount.update(v => Math.max(0, v - by));
  }

  /** Marque tout comme lu */
  markAllRead() {
    this._unreadCount.set(0);
  }
}