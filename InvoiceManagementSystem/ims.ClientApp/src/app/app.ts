import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthStore } from './auth/auth.store';
import { UserService } from './security/users/user.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class App implements OnInit {
  protected readonly title = signal('ims.ClientApp');
  isSidebarOpen = signal(true);
  onAuthRoute = signal(false);
  userProfilePicture = signal<string | null>(null);
  private baseUrl = 'https://localhost:7276';

  constructor(
    private router: Router,
    public authStore: AuthStore,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Track route changes to toggle layout for auth pages
    // Set initial state based on current URL (first render)
    this.setAuthRouteState(this.router.url);

    // Load logged-in user's profile picture
    this.loadUserProfilePicture();

    // Track route changes to toggle layout for auth pages
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this.setAuthRouteState(evt.urlAfterRedirects);
      }
    });
    // Initialize menu toggle event listeners
    this.setupMenuToggle();
    // Initialize Simplebar if needed
    this.initializeSimplebar();
  }

  private setAuthRouteState(url: string) {
    const normalized = (url || '').toLowerCase();
    // Be robust to leading slash and query/hash fragments
    const pathOnly = normalized.split('?')[0].split('#')[0];
    // Match login/auth anywhere at a path boundary
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
    // Get the hamburger button
    const hamburgerBtn = document.getElementById('topnav-hamburger-icon');
    const appMenu = document.querySelector('.app-menu');
    const layoutWrapper = document.getElementById('layout-wrapper');

    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', () => {
        this.toggleMenu(appMenu, layoutWrapper);
      });
    }

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.isSidebarOpen()) {
        this.toggleMenu(appMenu, layoutWrapper);
      }
    });
  }

  private toggleMenu(appMenu: Element | null, layoutWrapper: HTMLElement | null) {
    if (!appMenu) return;

    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // On mobile, toggle the menu visibility
      appMenu.classList.toggle('navbar-menu-open');
      if (layoutWrapper) {
        layoutWrapper.classList.toggle('sidebar-open');
      }
      this.isSidebarOpen.update(val => !val);
    } else {
      // On desktop, toggle menu width/collapse
      document.documentElement.setAttribute(
        'data-sidebar-size',
        document.documentElement.getAttribute('data-sidebar-size') === 'sm' ? 'lg' : 'sm'
      );
    }
  }

  private loadUserProfilePicture() {
    const userId = this.authStore.userId();
    if (!userId) return;

    this.userService.getById(userId).subscribe({
      next: (user) => {
        if (user.profilePictureUrl) {
          const fullUrl = user.profilePictureUrl.startsWith('http') 
            ? user.profilePictureUrl 
            : `${this.baseUrl}${user.profilePictureUrl}`;
          this.userProfilePicture.set(fullUrl);
        }
      },
      error: (err) => {
        console.error('Error loading user profile picture:', err);
      }
    });
  }

  private initializeSimplebar() {
    // Simplebar should auto-initialize based on data-simplebar attribute
    // but we can trigger a refresh if needed
    setTimeout(() => {
      const scrollbarElement = document.getElementById('scrollbar');
      if (scrollbarElement && (window as any).SimpleBar) {
        // Re-initialize or refresh simplebar if it exists
        try {
          new (window as any).SimpleBar(scrollbarElement);
        } catch (e) {
          // Simplebar might already be initialized
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
