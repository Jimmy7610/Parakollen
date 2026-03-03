import { fetchApi } from '../app.js';

let currentDate = null;

export async function renderSchedule(container) {
    if (!currentDate) {
        currentDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    }

    const data = await fetchApi(`/schedule?date=${currentDate}`);

    if (!data) {
        throw new Error("Kunde inte ladda tablån.");
    }

    let html = `
        <div class="flex justify-between items-center mb-4">
            <h1 style="margin: 0;">Tablå</h1>
            <div class="flex gap-2 items-center">
                <button id="prevDayBtn" class="badge" style="cursor: pointer; padding: 6px 12px; border: 1px solid var(--border-color); background: var(--surface-color); color: var(--text-primary);">&laquo; Föreg</button>
                <div style="font-weight: 600; font-size: 0.95rem; width: 90px; text-align: center;">${currentDate}</div>
                <button id="nextDayBtn" class="badge" style="cursor: pointer; padding: 6px 12px; border: 1px solid var(--border-color); background: var(--surface-color); color: var(--text-primary);">Nästa &raquo;</button>
            </div>
        </div>
    `;

    if (data.preGames) {
        html += `<div class="card bg-swe-blue" style="color: white; border-left: 4px solid var(--swe-yellow);"><p class="text-sm">Spelen har inte startat ännu — schema och resultat kan vara begränsade.</p></div>`;
    } else if (data.source === 'unavailable' || data.source === 'mock') {
        html += `<div class="card" style="border-left: 4px solid var(--accent-red);"><p class="text-sm">Schema ej tillgängligt just nu (källan blockerar automatiska hämtningar).</p></div>`;
    }

    if (!data.events || data.events.length === 0) {
        html += `<div class="card"><p class="text-muted" style="text-align: center; padding: 3rem 0;">Inget schema tillgängligt just nu.</p></div>`;
    } else {
        html += `<div class="flex flex-col gap-2">
            ${data.events.map(event => {
            const time = event.startTime ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' }).format(new Date(event.startTime)) : 'TBA';
            const statusBadge = event.status === 'live' ? '<span class="badge live">LIVE</span>' :
                event.status === 'finished' ? '<span class="badge" style="background:#444; color:#fff;">Avslutad</span>' : '';

            const countriesHTML = (event.countries || []).map(c => `<span class="badge" style="font-size: 0.65rem; margin-right: 4px; border: 1px solid var(--border-color);">${c}</span>`).join('');

            return `
                <div class="card" style="padding: 16px; margin-bottom: 8px;">
                    <div class="flex justify-between items-center mb-2">
                        <div class="font-bold text-swe-blue" style="font-size: 1.15rem;">${time}</div>
                        ${statusBadge}
                    </div>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">${event.title || 'Okänd tävling'}</div>
                        <div class="text-sm text-muted mb-2">${event.sport} ${event.isFinal ? '🏆 Final' : ''}</div>
                        ${countriesHTML ? `<div>${countriesHTML}</div>` : ''}
                    </div>
                </div>
                `;
        }).join('')}
        </div>`;
    }

    container.innerHTML = html;

    setTimeout(() => {
        document.getElementById('prevDayBtn')?.addEventListener('click', () => {
            const d = new Date(`${currentDate}T12:00:00Z`);
            d.setDate(d.getDate() - 1);
            currentDate = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
            renderSchedule(container).catch(e => {
                container.innerHTML = `<div class="card" style="border-color: var(--accent-red);"><p>Kunde inte hämta valt datum. <button onclick="location.reload()" class="bg-swe-blue badge" style="border:none; color:white; padding:8px 16px; cursor:pointer;">Ladda om</button></p></div>`;
            });
        });

        document.getElementById('nextDayBtn')?.addEventListener('click', () => {
            const d = new Date(`${currentDate}T12:00:00Z`);
            d.setDate(d.getDate() + 1);
            currentDate = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
            renderSchedule(container).catch(e => {
                container.innerHTML = `<div class="card" style="border-color: var(--accent-red);"><p>Kunde inte hämta valt datum. <button onclick="location.reload()" class="bg-swe-blue badge" style="border:none; color:white; padding:8px 16px; cursor:pointer;">Ladda om</button></p></div>`;
            });
        });
    }, 0);
}
