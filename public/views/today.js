import { fetchApi } from '../app.js';

export async function renderToday(container) {
    const data = await fetchApi('/today');

    if (!data) {
        container.innerHTML = `<div class="card"><p class="text-muted">Kunde inte ladda data.</p></div>`;
        return;
    }

    container.innerHTML = `
        <div class="card" style="text-align: center; padding: 2rem 1rem;">
            <div class="text-sm text-muted mb-2">Milano Cortina 2026</div>
            <h1 style="font-size: 2.5rem; color: var(--swe-blue); margin-bottom: 0.5rem;">Idag!</h1>
            <p style="font-size: 1.1rem; font-weight: 500;">
                Sverige har <strong>${data.swedenMedals || 0}</strong> medaljer (Rank ${data.swedenRank || '-'})
            </p>
            ${data.nextSweStart ? `<div class="badge mt-2">Nästa svensk: ${data.nextSweStart}</div>` : ''}
        </div>
        
        <h2 class="card-title">Svenska Starter</h2>
        <div class="card">
            ${data.sweEvents?.length ? data.sweEvents.map(e => `
                <div class="flex items-center justify-between mb-2">
                    <div><strong>${e.time}</strong> ${e.sport}</div>
                    <div class="text-swe-blue">${e.athletes}</div>
                </div>
            `).join('') : '<p class="text-muted">Inga svenska starter idag.</p>'}
        </div>

        <h2 class="card-title">Dagens program</h2>
        <div class="card">
            ${data.highlights?.length ? data.highlights.map(e => `
                <div class="mb-2"><strong>${e.time}</strong> - ${e.event} (${e.sport})</div>
            `).join('') : '<p class="text-muted">Inget program inlagt än.</p>'}
        </div>
    `;
}
