import { fetchApi } from '../app.js';

export async function renderToday(container) {
    const data = await fetchApi('/today');

    if (!data) {
        throw new Error("Kunde inte ladda data för Idag-vyn.");
    }

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div class="card" style="text-align: center; padding: 2rem 1rem; margin-bottom: 0;">
                <div class="text-sm text-muted mb-2">Milano Cortina 2026</div>
                <h1 style="font-size: 2.5rem; color: var(--swe-blue); margin-bottom: 0.5rem;">Idag!</h1>
                ${data.nextSweStart ? `<div class="badge mt-2">Nästa svensk: ${data.nextSweStart}</div>` : ''}
            </div>
            
            <div class="card" style="display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2rem 1rem; margin-bottom: 0;">
                <div class="text-sm text-muted mb-2">Sveriges Medaljer</div>
                <div style="font-size: 3rem; font-weight: 800; color: var(--swe-yellow); line-height: 1;">${data.swedenMedals || 0}</div>
                <div style="font-weight: 500; margin-top: 0.5rem;">Total Rank: ${data.swedenRank || '-'}</div>
            </div>
        </div>
        
        <h2 class="card-title" style="margin-bottom: 1rem;">Svenska Starter</h2>
        <div class="card">
            ${data.sweEvents?.length ? data.sweEvents.map(e => `
                <div class="flex items-center justify-between mb-2 pb-2" style="border-bottom: 1px solid var(--border-color);">
                    <div><strong>${e.time}</strong> ${e.sport}</div>
                    <div class="text-swe-blue font-semibold">${e.athletes}</div>
                </div>
            `).join('') : '<p class="text-muted">Inga svenska starter idag.</p>'}
        </div>

        <h2 class="card-title" style="margin-top: 2rem; margin-bottom: 1rem;">Dagens program</h2>
        <div class="card">
            ${data.highlights?.length ? data.highlights.map(e => `
                <div class="mb-2 pb-2" style="border-bottom: 1px solid var(--border-color);"><strong>${e.time}</strong> - ${e.event} <span class="text-muted">(${e.sport})</span></div>
            `).join('') : '<p class="text-muted">Inget program inlagt än.</p>'}
        </div>
    `;
}
