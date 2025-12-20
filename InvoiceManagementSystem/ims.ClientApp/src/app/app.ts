import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class App implements OnInit {
  protected readonly title = signal('ims.ClientApp');
  isSidebarOpen = signal(true);

  ngOnInit() {
    // Initialize menu toggle event listeners
    this.setupMenuToggle();
    // Initialize Simplebar if needed
    this.initializeSimplebar();
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
}
