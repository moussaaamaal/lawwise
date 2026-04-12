import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

// ── AppUser — type local partagé par toute l'app ──────────────
// Supabase User ne contient pas name/avatar/title au top-level.
// Ces champs viennent de user_metadata (renseignés à l'inscription)
// ou d'une table "profiles". On les mappe ici.
export interface AppUser {
  id:       string;
  email:    string;
  name:     string;    // user_metadata.full_name
  title:    string;    // user_metadata.title
  avatar:   string;    // user_metadata.avatar_url
  role:     'lawyer' | 'paralegal' | 'admin' | 'client';  // user_metadata.role
  firmName: string;    // user_metadata.firm_name
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient;

  // Signal global — consommé par Sidebar, Dashboard, etc.
  currentUser = signal<AppUser | null>(null);

  constructor(private router: Router) {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );

    // ── Restaurer la session existante au démarrage ──────────
    this.supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        this.currentUser.set(this._mapUser(data.session.user));
      }
    });

    // ── Écouter les changements d'état auth ──────────────────
    this.supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        this.currentUser.set(this._mapUser(session.user));
      } else {
        this.currentUser.set(null);
      }
    });
  }

  // ── LOGIN ────────────────────────────────────────────────────
  // Returns the MFA factor ID if the account has 2FA enrolled, otherwise null.
  async login(email: string, password: string): Promise<string | null> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      this.currentUser.set(this._mapUser(data.user));
    }
    // Check for enrolled MFA factors (TOTP or phone)
    const { data: factorsData } = await this.supabase.auth.mfa.listFactors();
    const activeFactor =
      factorsData?.totp?.find(f => f.status === 'verified') ??
      factorsData?.phone?.find(f => f.status === 'verified');
    return activeFactor?.id ?? null;
  }

  // ── WEB-AUTH-04 — MFA verification ──────────────────────────
  async verifyMfa(factorId: string, code: string): Promise<void> {
    const { error } = await this.supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (error) throw error;
  }

  // ── SIGN UP ──────────────────────────────────────────────────
  async signUp(params: {
    email:     string;
    password:  string;
    firstName: string;
    lastName:  string;
    phone?:    string;
    firmName:  string;
    role:      AppUser['role'];
  }): Promise<void> {
    const { data, error } = await this.supabase.auth.signUp({
      email:    params.email,
      password: params.password,
      options: {
        data: {
          full_name:  `${params.firstName} ${params.lastName}`,
          title:      params.role === 'lawyer' ? 'Attorney at Law' : params.role,
          avatar_url: '',
          role:       params.role,
          firm_name:  params.firmName,
          phone:      params.phone ?? '',
        },
        // Redirige vers /auth après confirmation email
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });
    if (error) throw error;
    // Si email confirmation activée, data.session sera null
    // Si désactivée, la session est créée immédiatement
    if (data.user) {
      this.currentUser.set(this._mapUser(data.user));
    }
  }

  // ── WEB-AUTH-05 — Reset password (workspace-aware) ──────────
  async sendPasswordReset(email: string, workspace?: string): Promise<void> {
    const base = `${window.location.origin}/auth/reset`;
    const redirectTo = workspace
      ? `${base}?workspace=${encodeURIComponent(workspace)}`
      : base;
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  }


  // ── OAuth (Google, Microsoft) ────────────────────────────────
  async loginWithOAuth(provider: 'google' | 'azure'): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;
    // Supabase redirects the browser — onAuthStateChange handles session
  }

  // ── LOGOUT ───────────────────────────────────────────────────
  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
    this.router.navigate(['/auth']);
  }

  // ── HELPERS ──────────────────────────────────────────────────
  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  getUserRole(): string {
    return this.currentUser()?.role ?? '';
  }

  /** Vérifie si une session active existe (utile dans les guards) */
  async getSession() {
    return this.supabase.auth.getSession();
  }

  // ── Invite (edge functions) ──────────────────────────────────
  async inviteLawyer(email: string): Promise<void> {
    const { error } = await this.supabase.functions.invoke('invite-user', {
      body: { email, role: 'lawyer' },
    });
    if (error) throw error;
  }

  async inviteClient(email: string, phone?: string): Promise<void> {
    const { error } = await this.supabase.functions.invoke('invite-user', {
      body: { email, phone, role: 'client' },
    });
    if (error) throw error;
  }

  // ── Mapper Supabase User → AppUser ───────────────────────────
  private _mapUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }): AppUser {
    const m = user.user_metadata ?? {};
    return {
      id:       user.id,
      email:    user.email ?? '',
      name:     (m['full_name']   as string) || (user.email ?? 'User'),
      title:    (m['title']       as string) || 'Member',
      avatar:   (m['avatar_url']  as string) || '',
      role:     ((m['role']       as AppUser['role']) || 'lawyer'),
      firmName: (m['firm_name']   as string) || '',
    };
  }
}