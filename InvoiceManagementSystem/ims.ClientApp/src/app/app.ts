import { Component, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthStore } from './auth/auth.store';
import { UserService } from './security/users/user.service';
import { CompanyService, Company } from './companies/company/company.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class App implements OnInit, AfterViewInit {
  protected readonly title = signal('ims.ClientApp');
  isSidebarOpen = signal(true);
  onAuthRoute = signal(false);
  userProfilePicture = signal<string | null>(null);
  companyLogoUrl = signal<string | null>(null);
  companyName = signal<string>('');
  private baseUrl = 'https://localhost:7276';

  constructor(
    private router: Router,
    public authStore: AuthStore,
    private userService: UserService,
    private companyService: CompanyService
  ) {}

  ngOnInit() {
    // Track route changes to toggle layout for auth pages
    this.setAuthRouteState(this.router.url);

    // Load logged-in user's profile picture
    this.loadUserProfilePicture();

    // Load company logo for shell header
    this.loadCompanyBranding();

    // Track route changes to toggle layout for auth pages
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this.setAuthRouteState(evt.urlAfterRedirects);
      }
    });

    // Initialize Simplebar if needed
    this.initializeSimplebar();
  }

  ngAfterViewInit() {
    // Delay to ensure DOM elements exist before binding listeners
    setTimeout(() => this.setupMenuToggle(), 0);
  }

  private setAuthRouteState(url: string) {
    const normalized = (url || '').toLowerCase();
    const pathOnly = normalized.split('?')[0].split('#')[0];
    const isAuth = /(^|\/)login(\/|$)/.test(pathOnly) || /(^|\/)auth(\/|$)/.test(pathOnly);
    this.onAuthRoute.set(isAuth);
  }

  isAuthRoute() {
    return this.onAuthRoute();
  }

  getUserName() {
    return this.authStore.userName();
  }

  private setupMenuToggle() {
    const hamburgerBtn = document.getElementById('topnav-hamburger-icon');
    const appMenu = document.querySelector('.app-menu');
    const layoutWrapper = document.getElementById('layout-wrapper');
    const overlay = document.querySelector('.vertical-overlay') as HTMLElement | null;

    if (hamburgerBtn) {
      hamburgerBtn.onclick = () => this.toggleMenu(appMenu, layoutWrapper);
    }

    document.onkeydown = (e) => {
      if (e.key === 'Escape' && !this.isSidebarOpen()) {
        this.toggleMenu(appMenu, layoutWrapper);
      }
    };

    if (overlay) {
      overlay.onclick = () => this.setSidebarOpen(false, appMenu, layoutWrapper);
    }
  }

  private toggleMenu(appMenu: Element | null, layoutWrapper: HTMLElement | null) {
    if (!appMenu) return;

    const isMobile = window.innerWidth < 992;

    if (isMobile) {
      const shouldOpen = !document.body.classList.contains('vertical-sidebar-enable');
      this.setSidebarOpen(shouldOpen, appMenu, layoutWrapper);
      return;
    }

    // Desktop collapse/expand
    document.body.classList.remove('vertical-sidebar-enable');
    const current = document.documentElement.getAttribute('data-sidebar-size');
    const next = current === 'sm' ? 'lg' : 'sm';
    document.documentElement.setAttribute('data-sidebar-size', next);
    this.isSidebarOpen.update(() => next !== 'sm');
  }

  private setSidebarOpen(isOpen: boolean, appMenu: Element | null, layoutWrapper: HTMLElement | null) {
    if (!appMenu) return;
    const overlay = document.querySelector('.vertical-overlay') as HTMLElement | null;

    if (isOpen) {
      appMenu.classList.add('navbar-menu-open');
      if (layoutWrapper) layoutWrapper.classList.add('sidebar-open');
      document.body.classList.add('vertical-sidebar-enable', 'sidebar-enable');
      document.documentElement.setAttribute('data-sidebar-size', 'lg');
      overlay?.classList.add('show');
    } else {
      appMenu.classList.remove('navbar-menu-open');
      if (layoutWrapper) layoutWrapper.classList.remove('sidebar-open');
      document.body.classList.remove('vertical-sidebar-enable', 'sidebar-enable');
      document.documentElement.setAttribute('data-sidebar-size', 'sm');
      overlay?.classList.remove('show');
    }

    this.isSidebarOpen.set(isOpen);
  }

  private loadUserProfilePicture() {
    const userId = this.authStore.userId();
    if (!userId) return;

    this.userService.getById(userId).subscribe({
      next: (user) => {
        if (user && user.profilePictureUrl) {
          const fullUrl = user.profilePictureUrl.startsWith('http')
            ? user.profilePictureUrl
            : `${this.baseUrl}${user.profilePictureUrl}`;
          this.userProfilePicture.set(fullUrl);
        }
      },
      error: (err: unknown) => {
        console.error('Error loading user profile picture:', err);
      }
    });
  }

  private loadCompanyBranding() {
    this.companyService.getAll().subscribe({
      next: (companies: Company[]) => {
        const company = companies && companies.length ? companies[0] : null;
        if (!company) return;
        this.companyName.set(company.name || 'Company');
        const resolved = this.resolveLogoUrl(company.logoUrl);
        if (resolved) {
          this.companyLogoUrl.set(resolved);
        }
      },
      error: (err: unknown) => {
        console.error('Error loading company branding:', err);
      }
    });
  }

  private resolveLogoUrl(url?: string | null): string | null {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith('/')) return trimmed;
    return `${this.baseUrl}/${trimmed.replace(/^\/+/, '')}`;
  }

  private initializeSimplebar() {
    setTimeout(() => {
      const scrollbarElement = document.getElementById('scrollbar');
      const existing = (scrollbarElement as any)?.__simplebar;
      if (scrollbarElement && (window as any).SimpleBar && !existing) {
        try {
          new (window as any).SimpleBar(scrollbarElement);
        } catch (e) {
          console.log('Simplebar already initialized or not available');
        }
      }
    }, 100);
  }

  logout() {
    this.authStore.clear();
    this.router.navigateByUrl('/login');
  }
}
