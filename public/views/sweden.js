import { fetchApi } from '../app.js';

// Load favorites from local storage
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

export async function renderSweden(container) {
    const data = await fetchApi('/sweden');

    if (!data) {
        container.innerHTML = `<div class="card"><p class="text-muted">Kunde inte ladda svensk data.</p></div>`;
        return;
    }

    // Silent pruning logic
    const validEventIds = new Set(data.events?.map(e => e.id) || []);
    let favs = getFavorites();
    const originalLength = favs.length;
    favs = favs.filter(id => validEventIds.has(id));
    if (favs.length !== originalLength) {
        saveFavorites(favs);
        console.log(`Pruned ${originalLength - favs.length} stale favorites.`);
    }

    container.innerHTML = `
        <h1 class="card-title text-swedish">Sverige</h1>
        <div class="card bg-swe-blue" style="color: white;">
            <h2>⭐ Profiler och favoriter</h2>
            <p>Snart kan du markera specifika atleter som favoriter.</p>
        </div>
        
        <h2 class="card-title mt-4">Svenska Starter (${data.events?.length || 0})</h2>
        <div class="card">
            <p>Här listas snart alla de svenska starterna under spelet.</p>
        </div>
    `;
}
