import { fetchApi } from '../app.js';

export function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem('parakollen_favorites')) || [];
    } catch {
        return [];
    }
}

export function saveFavorites(favorites) {
    localStorage.setItem('parakollen_favorites', JSON.stringify(favorites));
}

window.toggleFavorite = function (id) {
    let favs = getFavorites();
    if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
    } else {
        favs.push(id);
    }
    saveFavorites(favs);
    const container = document.getElementById('viewRoot');
    if (container) {
        import('./sweden.js').then(module => module.renderSweden(container));
    }
};

export async function renderSweden(container) {
    const data = await fetchApi('/sweden');

    if (!data) {
        throw new Error("Kunde inte ladda svensk data.");
    }

    const validEventIds = new Set(data.events?.map(e => e.eventId || e.id) || []);
    let favs = getFavorites();
    const originalLength = favs.length;
    favs = favs.filter(id => validEventIds.has(id));
    if (favs.length !== originalLength) {
        saveFavorites(favs);
    }

    let upcomingHtml = '';
    if (!data.events || data.events.length === 0) {
        upcomingHtml = `<div class="card"><p class="text-muted" style="text-align: center; padding: 3rem 0;">Inga svenska tävlingar publicerade.</p></div>`;
    } else {
        upcomingHtml = data.events.map(event => {
            const time = event.startTime ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }).format(new Date(event.startTime)) : 'TBA';
            const isFav = favs.includes(event.eventId || event.id);
            const starStr = isFav ? '⭐' : '☆';

            return `
            <div class="card" style="padding: 16px; margin-bottom: 8px; border-left: 4px solid var(--swe-blue);">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <div class="font-bold text-swe-blue" style="font-size: 1.1rem;">${time} | ${event.sport || 'Sport'}</div>
                        <div style="font-weight: 600; margin-top: 4px;">${event.title || 'Tävling'}</div>
                        <div class="text-sm text-muted">${event.isFinal ? '🏆 Final' : 'Kval/Försök'}</div>
                    </div>
                    <button onclick="window.toggleFavorite('${event.eventId || event.id}')" style="background:none; border:none; cursor:pointer; font-size:1.5rem; color:var(--swe-yellow); padding-left: 12px;">
                        ${starStr}
                    </button>
                </div>
            </div>
            `;
        }).join('');
    }

    container.innerHTML = `
        <h1 class="card-title text-swe-blue">Sverige</h1>
        
        <div class="flex justify-between items-center mt-4 mb-2">
            <h2 class="card-title" style="margin: 0;">Svenska Tävlingar (${data.events?.length || 0})</h2>
            <div class="badge" style="background: var(--swe-blue); color: white;">Endast Svenskar</div>
        </div>
        
        <div class="flex flex-col gap-2">
            ${upcomingHtml}
        </div>
    `;
}
