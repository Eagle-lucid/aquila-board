// Main entry Logic for Aquilaboard

// CORE IMPORTS 
// Gloobal Styles 
import '../scss/main.scss';

// Utilities 
import { setupErrorHandling } from './utils/error-handler';

// Core UI Modules
import { initializeTheme } from './modules/theme-switcher';
import { setupSidebar } from './modules/sidebar';
import { setupNotifications } from './modules/notifications';

// Page Logic 
import { initDashboard } from './pages/dashboard';

// Animations
import { animateUIElements } from './animations/gsap';
import { setupScrollEffects } from './animations/scroll';
import { initChartAnimations } from './animations/charts';

// Analytics
import { trackInitialAnalytics } from './utils/analytics';

// MAIN APPLICATION BOOTSTRAP

const AquilaApp = {
    initialized: false, 

    async init() {
        if (this.initialized) return;

        try {
            // Essentials 
            setupErrorHandling();
            this.setupCoreModules();
            
            // Page-specific Controllers 
             if (this.isPage('dashboard')) {
                await initDashboard();
             }

             // Deferred Initializations
             this.deferNonCriticalFeatures();
                this.initialized = true;
        } catch (err) {
            this.handleInitFailure(err);
        }
    },

    setupCoreModules() {
        initializeTheme();
        setupSidebar();
        setupNotifications();
    },

    isPage(name) {
        return document.body.classList.contains(name) ||
               document.querySelector(`[data-page="${name}"]`);
    }, 

    deferNonCriticalFeatures() {
        const runLater = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));

        runLater(() => {
            animateUIElements?.();
            setupScrollEffects?.();
            initChartAnimations?.();
            trackInitialAnalytics?.();
        });
    },

    handleInitFailure(error) {
        console.error('[AquilaApp] Bootstrap Error:', error);

        const fallbackHTML = `
        <section class="app-fallback">
        <div class="fallback-inner">
          <h1>Initialization Error</h1>
          <p>We couldn't load the dashboard. Try again.</p>
          <button class="btn retry-btn">Reload</button>
        </div>
        </section>
        `;

        const container = document.getElementById('app') || document.body;
        container.innerHTML = fallbackHTML;

        document.querySelector('.retry-btn')?.addEventListener('click', () => {
            window.location.reload();
        });
    }
};

// BOOTSTRAP ON PAGE LOAD
const bootstrapApp = () => AquilaApp.init();

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    bootstrapApp();
} else {
    document.addEventListener('DOMContentLoaded', bootstrapApp);
}

// Turbo Drive / Turbolinks Support
document.addEventListener('turbo:load', bootstrapApp);

// Vite HMR Support
if (import.meta.hot) {
    import.meta.hot.accept(() => {
        console.log('[HMR] Reloading AquilaApp...');
        bootstrapApp();
    });
    import.meta.hot.dispose(() => {
        AquilaApp.initialized = false; // Reset state for next load
    });
}