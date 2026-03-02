import { renderToday } from './views/today.js';
import { renderSchedule } from './views/schedule.js';
import { renderSweden } from './views/sweden.js';
import { renderMedals } from './views/medals.js';
import { renderResults } from './views/results.js';
import { renderNews } from './views/news.js';
import { renderWatch } from './views/watch.js';

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8787/api'
    : '/api';
const CACHE_TTL_MS = 60000; // 60s max client-side caching
const RECHECK_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes (for tab left open)

const state = {
    currentView: 'today',
    lastRenderedStockholmDate: null,
    cache: {}, // Holds { data, timestamp } per URL
    midnightTimer: null
};

const views = {
    'today': renderToday,
    'schedule': renderSchedule,
    'sweden': renderSweden,
    'medals': renderMedals,
    'results': renderResults,
    'news': renderNews,
    'watch': renderWatch
};

export async function fetchApi(endpoint) {
    const url = `${API_BASE}${endpoint}`;
    const now = Date.now();

    // Cache check
    if (state.cache[url] && now - state.cache[url].timestamp < CACHE_TTL_MS) {
        return state.cache[url].data;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();

        // Save to cache
        state.cache[url] = { data, timestamp: now };

        // Monitor day boundary changes
        if (data.stockholmDate) {
            handleStockholmDateChange(data.stockholmDate);
        }

        return data;
    } catch (err) {
        console.error(`Fetch error for ${url}:`, err);
        return null;
    }
}

function handleStockholmDateChange(newDate) {
    if (!state.lastRenderedStockholmDate) {
        state.lastRenderedStockholmDate = newDate;
        setupMidnightTimer();
    } else if (state.lastRenderedStockholmDate !== newDate) {
        console.log(`Day boundary crossed: ${state.lastRenderedStockholmDate} -> ${newDate}`);
        state.lastRenderedStockholmDate = newDate;

        // Hard invalidate Today cache
        delete state.cache['/api/today'];

        // Rerender Today if active
        if (state.currentView === 'today') {
            renderView('today', true);
        }
        setupMidnightTimer();
    }
}

function setupMidnightTimer() {
    if (state.midnightTimer) clearTimeout(state.midnightTimer);

    state.midnightTimer = setTimeout(() => {
        if (state.currentView === 'today') {
            fetchApi('/api/today').then(() => setupMidnightTimer());
        }
    }, RECHECK_INTERVAL_MS);
}

function handleTabFocus() {
    if (document.visibilityState === 'visible' || document.hasFocus()) {
        const now = Date.now();
        const currentEndpoint = getEndpointForView(state.currentView);

        if (currentEndpoint && state.cache[currentEndpoint]) {
            const age = now - state.cache[currentEndpoint].timestamp;
            if (age > CACHE_TTL_MS) {
                console.log(`Tab focused, data age > 60s (${Math.round(age / 1000)}s), refreshing ${state.currentView}`);
                renderView(state.currentView, true);
            }
        }
    }
}

function getEndpointForView(view) {
    const endpoints = {
        'today': '/today',
        'schedule': '/schedule',
        'sweden': '/sweden',
        'medals': '/medals',
        'results': '/results',
        'news': '/news',
        'watch': '/watch'
    };
    return endpoints[view];
}

export function renderErrorCard(container, message) {
    container.innerHTML = `
        <div class="card" style="border-left: 4px solid var(--accent-red);">
            <h2 style="color: var(--accent-red); margin-bottom: 0.5rem;">Kunde inte hämta data</h2>
            <p class="text-muted" style="margin-bottom: 1rem;">${message}</p>
            <div class="flex gap-2">
                <button onclick="window.location.reload()" class="bg-swe-blue" style="padding: 0.5rem 1rem; border: none; border-radius: var(--radius-md); cursor: pointer;">Försök igen</button>
                <button onclick="window.open('Docs/DEV.md')" style="padding: 0.5rem 1rem; border: 1px solid var(--border-color); background: transparent; border-radius: var(--radius-md); color: var(--text-primary); cursor: pointer;">Öppna DEV.md</button>
            </div>
        </div>
    `;
}

async function renderView(viewName, forceRefresh = false) {
    state.currentView = viewName;

    // Update active nav link
    document.querySelectorAll('#main-nav a').forEach(a => {
        a.classList.toggle('active', a.dataset.view === viewName);
    });

    const container = document.getElementById('viewRoot');
    if (!container) return;

    // Guard against file:// 
    if (window.location.protocol === 'file:') {
        container.innerHTML = `
            <div class="card" style="border-left: 4px solid var(--swe-yellow);">
                <h2 style="margin-bottom: 0.5rem;">Du öppnar via fil.</h2>
                <p class="text-muted">Starta en lokal server för att se data (se Docs/DEV.md).</p>
            </div>
        `;
        return;
    }

    if (forceRefresh) {
        const ep = getEndpointForView(viewName);
        if (ep) delete state.cache[`${API_BASE}${ep}`];
    }

    if (views[viewName]) {
        container.innerHTML = `<div class="skeleton-box" style="height: 400px; margin-bottom: 1rem;"></div><div class="skeleton-text" style="width: 80%"></div><div class="skeleton-text short"></div>`;
        window.scrollTo(0, 0);

        try {
            await views[viewName](container);
        } catch (error) {
            console.error(`Error rendering view ${viewName}:`, error);
            renderErrorCard(container, error.message || "API unreachable");
        }
    } else {
        container.innerHTML = `<div class="card"><h2>404</h2><p>Vy hittades inte (${viewName}).</p></div>`;
    }
}

function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    // Set initial aria state
    const currentTheme = document.documentElement.dataset.theme;
    btn.setAttribute('aria-pressed', currentTheme === 'light' ? 'true' : 'false');

    btn.addEventListener('click', () => {
        const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('theme', theme);
        btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    });
}

function initRouter() {
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        const view = (hash.split('?')[0]) || 'today';
        renderView(view);
    });

    const initialHash = window.location.hash.replace('#', '');
    const initialView = (initialHash.split('?')[0]) || 'today';
    renderView(initialView);
}

// Global Listeners for Tab Boundary/Stale refreshes
document.addEventListener('visibilitychange', handleTabFocus);
window.addEventListener('focus', handleTabFocus);

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initRouter();
});
