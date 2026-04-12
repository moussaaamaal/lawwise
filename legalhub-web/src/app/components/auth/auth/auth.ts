import { Component, signal, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

type AuthMode = 'login' | 'signup' | 'admin';
type Role     = 'lawyer' | 'admin';
type AuthStep = 'credentials' | 'mfa';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class Auth {
  private authService = inject(AuthService);
  private router      = inject(Router);

  // ── Mode & authentication step ────────────
  mode     = signal<AuthMode>('login');
  authStep = signal<AuthStep>('credentials');

  switchTo(m: AuthMode): void {
    this.mode.set(m);
    this.error.set('');
    this.signupStep.set(1);
    this.authStep.set('credentials');
    this.mfaCode.set('');
  }

  // ── Shared ────────────────────────────────
  showPassword = signal(false);
  showConfirm  = signal(false);
  loading      = signal(false);
  error        = signal('');

  togglePassword(): void { this.showPassword.update(v => !v); }
  toggleConfirm():  void { this.showConfirm.update(v => !v);  }

  // ── WEB-AUTH-01 — Workspace selector ──────
  selectedWorkspace = signal('morrison');
  workspaces = [
    { value: 'morrison', label: 'Morrison & Associates' },
    { value: 'williams', label: 'Williams Legal Group'  },
    { value: 'chen',     label: 'Chen & Partners LLP'   },
    { value: 'taylor',   label: 'Taylor Law Firm'       },
    { value: 'lopez',    label: 'Lopez Legal Services'  },
  ];
  get currentWorkspaceLabel(): string {
    return this.workspaces.find(w => w.value === this.selectedWorkspace())?.label ?? '';
  }
  showWorkspaceDropdown = signal(false);
  toggleWorkspace(): void { this.showWorkspaceDropdown.update(v => !v); }
  selectWorkspace(v: string): void {
    this.selectedWorkspace.set(v);
    this.showWorkspaceDropdown.set(false);
  }

  // ── WEB-AUTH-02 — Email/password login ────
  email    = signal('');
  password = signal('');

  constructor() {
    this.authService.getSession().then(({ data }) => {
      if (data.session) this.router.navigate(['/dashboard']);
    });
  }

  async login(): Promise<void> {

    this.router.navigate(['/dashboard']);
    // if (!this.email() || !this.password()) { this.error.set('Please fill in all fields.'); return; }
    // this.loading.set(true); this.error.set('');
    // try {
    //   const factorId = await this.authService.login(this.email(), this.password());
    //   if (factorId) {
    //     this.mfaFactorId.set(factorId);
    //     this.authStep.set('mfa');
    //   } else {
    //     this.router.navigate(['/dashboard']);
    //   }
    // } catch (err: unknown) {
    //   const msg = err instanceof Error ? err.message : 'An error occurred.';
    //   if (msg.includes('Invalid login credentials')) {
    //     this.error.set('Invalid email or password. Please try again.');
    //   } else if (msg.includes('Email not confirmed')) {
    //     this.error.set('Please confirm your email before signing in.');
    //   } else {
    //     this.error.set(msg);
    //   }
    // } finally {
    //   this.loading.set(false);
    // }
  }

  // ── WEB-AUTH-03 — OAuth SSO ───────────────
  async loginWithGoogle(): Promise<void> {
    this.loading.set(true); this.error.set('');
    try {
      await this.authService.loginWithOAuth('google');
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Google sign-in failed.');
      this.loading.set(false);
    }
  }

  async loginWithMicrosoft(): Promise<void> {
    this.loading.set(true); this.error.set('');
    try {
      await this.authService.loginWithOAuth('azure');
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Microsoft sign-in failed.');
      this.loading.set(false);
    }
  }

  // ── WEB-AUTH-04 — Two-factor authentication
  mfaCode     = signal('');
  mfaFactorId = signal('');

  async verifyMfa(): Promise<void> {
    const code = this.mfaCode().replace(/\D/g, '');
    if (code.length !== 6) { this.error.set('Please enter the 6-digit code.'); return; }
    this.loading.set(true); this.error.set('');
    try {
      await this.authService.verifyMfa(this.mfaFactorId(), code);
      this.router.navigate(['/dashboard']);
    } catch {
      this.error.set('Invalid code. Please check your authenticator app and try again.');
    } finally {
      this.loading.set(false);
    }
  }

  backFromMfa(): void {
    this.authStep.set('credentials');
    this.mfaCode.set('');
    this.error.set('');
  }

  // ── WEB-AUTH-05 — Password reset ──────────
  showForgotModal = signal(false);
  resetEmail      = signal('');
  resetSent       = signal(false);

  openForgotModal():  void { this.showForgotModal.set(true); this.resetSent.set(false); this.resetEmail.set(''); }
  closeForgotModal(): void { this.showForgotModal.set(false); }

  async sendReset(): Promise<void> {
    if (!this.resetEmail()) return;
    try {
      await this.authService.sendPasswordReset(this.resetEmail(), this.selectedWorkspace());
      this.resetSent.set(true);
    } catch {
      this.resetSent.set(true); // Avoid email enumeration
    }
  }

  // ── WEB-AUTH-06 — Admin portal ────────────
  adminEmail    = signal('');
  adminPassword = signal('');
  showAdminPwd  = signal(false);

  async adminLogin(): Promise<void> {
    if (!this.adminEmail() || !this.adminPassword()) { this.error.set('Please fill in all fields.'); return; }
    this.loading.set(true); this.error.set('');
    try {
      const factorId = await this.authService.login(this.adminEmail(), this.adminPassword());
      const user = this.authService.currentUser();
      if (user?.role !== 'admin') {
        await this.authService.logout();
        this.error.set('Access denied. This portal is for administrators only.');
        return;
      }
      if (factorId) {
        this.mfaFactorId.set(factorId);
        this.authStep.set('mfa');
      } else {
        this.router.navigate(['/dashboard']);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred.';
      this.error.set(msg.includes('Invalid login credentials') ? 'Invalid administrator credentials.' : msg);
    } finally {
      this.loading.set(false);
    }
  }

  // ── SIGN UP — 2-step form ─────────────────
  signupStep     = signal<1 | 2>(1);
  su_firstName   = signal('');
  su_lastName    = signal('');
  su_email       = signal('');
  su_phone       = signal('');
  su_password    = signal('');
  su_confirm     = signal('');
  su_firmName    = signal('');
  su_firmSize    = signal('');
  su_role        = signal<Role>('lawyer');
  su_agreeTerms  = signal(false);
  su_gdprConsent = signal(false);
  signupSuccess  = signal(false);

  firmSizes = ['1 (Solo)', '2–5', '6–20', '21–50', '50+'];
  roles: { value: Role; label: string; icon: string; desc: string }[] = [
    { value: 'lawyer', label: 'Lawyer / Attorney', icon: 'fa-solid fa-scale-balanced', desc: 'Full platform access'  },
    { value: 'admin',  label: 'Office Admin',       icon: 'fa-solid fa-gear',           desc: 'Billing & scheduling' },
  ];

  get step1Valid(): boolean {
    return !!this.su_firstName().trim() && !!this.su_lastName().trim() &&
           !!this.su_email().trim() && this.su_password().length >= 8 &&
           this.su_password() === this.su_confirm();
  }
  get passwordMismatch(): boolean {
    return !!this.su_confirm() && this.su_password() !== this.su_confirm();
  }
  get passwordStrength(): 'weak' | 'medium' | 'strong' {
    const p = this.su_password();
    if (p.length < 8) return 'weak';
    if (p.length < 12 || !/[A-Z]/.test(p) || !/[0-9]/.test(p)) return 'medium';
    return 'strong';
  }
  get strengthColor(): string {
    return { weak: 'bg-red-500', medium: 'bg-amber-500', strong: 'bg-green-500' }[this.passwordStrength];
  }
  get strengthWidth(): string {
    return { weak: 'w-1/3', medium: 'w-2/3', strong: 'w-full' }[this.passwordStrength];
  }
  get step2Valid(): boolean {
    return !!this.su_firmName().trim() && !!this.su_firmSize() &&
           this.su_agreeTerms() && this.su_gdprConsent();
  }

  nextStep(): void {
    if (!this.step1Valid) { this.error.set('Please complete all required fields correctly.'); return; }
    this.error.set('');
    this.signupStep.set(2);
  }

  async signup(): Promise<void> {
    if (!this.step2Valid) { this.error.set('Please complete all required fields and accept the terms.'); return; }
    this.loading.set(true); this.error.set('');
    try {
      await this.authService.signUp({
        email:     this.su_email(),
        password:  this.su_password(),
        firstName: this.su_firstName(),
        lastName:  this.su_lastName(),
        phone:     this.su_phone() || undefined,
        firmName:  this.su_firmName(),
        role:      this.su_role(),
      });
      this.signupSuccess.set(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed.';
      this.error.set(msg.includes('already registered') ? 'This email is already registered. Please sign in instead.' : msg);
    } finally {
      this.loading.set(false);
    }
  }
}
