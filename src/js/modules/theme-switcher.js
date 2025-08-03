/**
 * Enhanced Theme Switcher Module with localStorage fallback
 */
export function setupThemeToggle() {
    // Safety check for SSR/SSG environments
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    const THEME_KEY = 'aquilaboard-theme';
    const DEFAULT_THEME = 'auto';
    const themeRoot = document.documentElement;

    // Safe localStorage access with fallback
    const safeLocalStorage = {
        getItem: (key) => {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.warn('LocalStorage access blocked, using default theme');
                return null;
            }
        },
        setItem: (key, value) => {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                console.warn('Failed to save theme preference');
            }
        }
    };

    // DOM Elements with null checks
    const themeSelector = document.querySelector('[data-theme-trigger]');
    if (!themeSelector) {
        console.error('[Theme] No theme selector found');
        return;
    }

    const toggleBtn = themeSelector.querySelector('.theme-toggle__btn');
    const dropdown = themeSelector.querySelector('.theme-dropdown');
    const themeLabel = themeSelector.querySelector('[data-theme-label]');
    const optionsButtons = themeSelector.querySelectorAll('[data-theme-option]');

    if (!toggleBtn || !dropdown || !themeLabel || optionsButtons.length === 0) {
        console.error('[Theme] Missing required elements');
        return;
    }

    // Initialize dropdown state
    dropdown.hidden = true;
    let mediaQuery = null;

    // ----------------------------
    // Core Functions
    // ----------------------------

    function applyTheme(theme) {
        if (!theme) theme = DEFAULT_THEME;

        console.log(`[Theme] Applying theme: ${theme}`);
        safeLocalStorage.setItem(THEME_KEY, theme);
        updateLabel(theme);
        updateActiveState(theme);

        if (theme === 'auto') {
            setAutoTheme();
        } else {
            cleanupAutoListeners();
            themeRoot.setAttribute('data-theme', theme);
        }

        dispatchThemeChangeEvent(theme);
        
        // Force repaint to ensure theme applies
        void themeRoot.offsetHeight;
    }
          // After applying the theme
      themeRoot.classList.remove('theme-initializing');
      
      // Add debug element
      const debugEl = document.createElement('div');
      debugEl.className = 'theme-debug';
      debugEl.setAttribute('data-theme', themeRoot.getAttribute('data-theme'));
      document.body.appendChild(debugEl);
      
      // Update debug element on theme change
      themeRoot.addEventListener('themeChange', (e) => {
        debugEl.setAttribute('data-theme', e.detail.theme);
      });

    function setAutoTheme() {
        cleanupAutoListeners();
        
        if (!window.matchMedia) {
            console.warn('matchMedia not supported, falling back to light theme');
            themeRoot.setAttribute('data-theme', 'light');
            return;
        }

        mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const resolveAndApply = () => {
            const theme = mediaQuery.matches ? 'dark' : 'light';
            themeRoot.setAttribute('data-theme', theme);
            console.log(`[Theme] System preference changed to: ${theme}`);
        };

        resolveAndApply();
        mediaQuery.addEventListener('change', resolveAndApply);
    }

    function cleanupAutoListeners() {
        if (mediaQuery) {
            mediaQuery.removeEventListener('change', setAutoTheme);
            mediaQuery = null;
        }
    }

    // ----------------------------
    // UI Helpers
    // ----------------------------

    function updateLabel(theme) {
        const labels = {
            light: '🌞 Light',
            dark: '🌚 Dark',
            auto: '🌓 Auto'
        };
        themeLabel.textContent = labels[theme] || labels[DEFAULT_THEME];
    }

    function toggleDropdown() {
        const isOpen = !dropdown.hidden;
        dropdown.hidden = isOpen;
        toggleBtn.setAttribute('aria-expanded', String(!isOpen));

        if (!isOpen) {
            const currentTheme = safeLocalStorage.getItem(THEME_KEY) || DEFAULT_THEME;
            const activeBtn = dropdown.querySelector(`[data-theme-option="${currentTheme}"]`);
            activeBtn?.focus();
        }
    }

    function updateActiveState(theme) {
        optionsButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-theme-option') === theme;
            btn.setAttribute('aria-checked', String(isActive));
            btn.classList.toggle('active', isActive);
        });
    }

    // ----------------------------
    // Event Handlers
    // ----------------------------

    function handleOptionClick(e) {
        const selected = e.currentTarget.getAttribute('data-theme-option');
        console.log(`[Theme] Option selected: ${selected}`);
        applyTheme(selected);
        closeDropdown();
    }

    function closeDropdown() {
        dropdown.hidden = true;
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.focus();
    }

    function handleDocumentClick(e) {
        if (!themeSelector.contains(e.target) && !dropdown.hidden) {
            closeDropdown();
        }
    }

    function handleKeydown(e) {
        if (dropdown.hidden) return;

        const options = Array.from(optionsButtons);
        const index = options.findIndex(el => el === document.activeElement);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                options[(index + 1) % options.length]?.focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                options[(index - 1 + options.length) % options.length]?.focus();
                break;
            case 'Escape':
                closeDropdown();
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (document.activeElement.getAttribute('data-theme-option')) {
                    applyTheme(document.activeElement.getAttribute('data-theme-option'));
                    closeDropdown();
                }
                break;
        }
    }

    function dispatchThemeChangeEvent(theme) {
        const appliedTheme = theme === 'auto' ? themeRoot.getAttribute('data-theme') : theme;
        const event = new CustomEvent('themeChange', {
            detail: { theme: appliedTheme }
        });
        themeRoot.dispatchEvent(event);
    }

    // ----------------------------
    // Initialization
    // ----------------------------

    try {
        const savedTheme = safeLocalStorage.getItem(THEME_KEY);
        const initialTheme = savedTheme || DEFAULT_THEME;
        
        console.log(`[Theme] Initializing with theme: ${initialTheme}`);
        applyTheme(initialTheme);

        // Set up event listeners
        toggleBtn.addEventListener('click', toggleDropdown);
        optionsButtons.forEach(btn => btn.addEventListener('click', handleOptionClick));
        document.addEventListener('click', handleDocumentClick);
        dropdown.addEventListener('keydown', handleKeydown);

        // Remove loading class
        setTimeout(() => {
            themeRoot.classList.remove('theme-initializing');
            console.log('[Theme] Initialization complete');
        }, 100);
    } catch (e) {
        console.error('[Theme] Initialization failed:', e);
        // Fallback to default theme
        themeRoot.setAttribute('data-theme', 'light');
    }
}