import { Injectable, signal } from '@angular/core';

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function getDisplayNameFromClaims(claims: any | null): string {
  if (!claims) return '';

  // Prefer explicit full name fields
  const fullName = claims['FullName'] || claims['fullName'] || claims['fullname'];
  if (fullName) return String(fullName).trim();

  // Common short claim keys (excluding email to avoid showing it)
  const shortName =
    claims['name'] ||
    claims['unique_name'] ||
    claims['preferred_username'] ||
    claims['upn'] ||
    claims['nickname'] ||
    '';
  if (shortName) return String(shortName).trim();

  // Compose from given/family names
  const given =
    claims['given_name'] ||
    claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] ||
    '';
  const family =
    claims['family_name'] ||
    claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] ||
    '';
  const composed = [given, family].filter(Boolean).join(' ').trim();
  if (composed) return composed;

  // URI-based claim keys often used by ASP.NET Core (excluding email)
  const uriName =
    claims['http://schemas.microsoft.com/identity/claims/displayname'] ||
    claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
    '';
  if (uriName) return String(uriName).trim();

  // Fallback to subject if present (last resort)
  const subject = claims['sub'] || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '';
  if (subject) return String(subject).trim();

  return '';
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly storageKey = 'auth_token';
  token = signal<string | null>(null);
  userName = signal<string>('');
  userId = signal<string | null>(null);

  constructor() {
    // Prefer persistent token, else session token
    const savedPersistent = (localStorage.getItem(this.storageKey) || '').trim();
    const savedSession = (sessionStorage.getItem(this.storageKey) || '').trim();
    const saved = savedPersistent || savedSession;
    if (saved) {
      this.setToken(saved, { remember: Boolean(savedPersistent) });
    }
  }

  setToken(token: string | null, opts?: { remember?: boolean }) {
    if (token) {
      const remember = opts?.remember !== false; // default to true
      if (remember) {
        localStorage.setItem(this.storageKey, token);
        sessionStorage.removeItem(this.storageKey);
      } else {
        sessionStorage.setItem(this.storageKey, token);
        localStorage.removeItem(this.storageKey);
      }
      this.token.set(token);
      const claims = decodeJwtPayload(token);
      const sub = (claims && (claims['sub'] || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'])) || null;
      this.userId.set(sub ? String(sub) : null);
      this.userName.set(getDisplayNameFromClaims(claims) || '');
    } else {
      localStorage.removeItem(this.storageKey);
      sessionStorage.removeItem(this.storageKey);
      this.token.set(null);
      this.userName.set('');
      this.userId.set(null);
    }
  }

  clear() {
    this.setToken(null);
  }
}
