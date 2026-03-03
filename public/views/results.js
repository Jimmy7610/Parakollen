import { fetchApi } from '../app.js';

export async function renderResults(container) {
    const data = await fetchApi('/results');

    if (!data) {
        throw new Error("Kunde inte ladda resultat.");
    }

    let html = `<h1 class="card-title">Senaste Resultat</h1>`;

    if (data.preGames) {
        html += `<div class="card bg-swe-blue" style="color: white; border-left: 4px solid var(--swe-yellow); margin-bottom: 1rem;"><p class="text-sm">Spelen har inte startat ännu — medaljer och resultat är 0.</p></div>`;
    } else if (data.source === 'unavailable' || data.source === 'mock') {
        html += `<div class="card" style="border-left: 4px solid var(--accent-red); margin-bottom: 1rem;"><p class="text-sm">Schema ej tillgängligt just nu (källan blockerar automatiska hämtningar).</p></div>`;
    }

    if (!data.latest || data.latest.length === 0) {
        html += `<div class="card"><p class="text-muted" style="text-align: center; padding: 3rem 0;">Inga resultat ännu.</p></div>`;
    } else {
        html += `<div class="flex flex-col gap-2">
            ${data.latest.map(e => `
                <div class="card" style="padding: 16px; margin-bottom: 8px;">
                    <div class="font-bold text-swe-blue">${e.sport || 'Okänd sport'}</div>
                    <div style="font-weight: 600; margin: 4px 0;">${e.title || e.id || 'Okänd tävling'}</div>
                    <div class="text-sm text-muted">Status: ${e.status || 'TBA'}</div>
                </div>
            `).join('')}
        </div>`;
    }

    container.innerHTML = html;
}
