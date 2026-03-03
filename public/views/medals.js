import { fetchApi } from '../app.js';

export async function renderMedals(container) {
    const data = await fetchApi('/medals');

    if (!data) {
        throw new Error("Kunde inte ladda medaljligan.");
    }

    let html = `<h1 class="card-title">Medaljligan</h1>`;

    if (data.preGames) {
        html += `<div class="card bg-swe-blue" style="color: white; border-left: 4px solid var(--swe-yellow); margin-bottom: 1rem;"><p class="text-sm">Spelen har inte startat ännu — medaljer och resultat är 0.</p></div>`;
    }

    if (!data.standings || data.standings.length === 0) {
        html += `<div class="card"><p class="text-muted" style="text-align: center; padding: 3rem 0;">Inga medaljer ännu.</p></div>`;
    } else {
        html += `<div class="card" style="padding: 0; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 300px;">
                <thead>
                    <tr style="background: var(--skeleton-base); border-bottom: 1px solid var(--border-color);">
                        <th style="padding: 12px; width: 40px; font-weight: 600;">#</th>
                        <th style="padding: 12px; font-weight: 600;">Nation</th>
                        <th style="padding: 12px; text-align: center; color: #d4af37; font-weight: 600;">G</th>
                        <th style="padding: 12px; text-align: center; color: #a8a8a8; font-weight: 600;">S</th>
                        <th style="padding: 12px; text-align: center; color: #cd7f32; font-weight: 600;">B</th>
                        <th style="padding: 12px; text-align: center; font-weight: 600;">Totalt</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.standings.map((s, index) => {
            const isSwe = s.countryCode === 'SWE';
            return `
                        <tr style="border-bottom: 1px solid var(--border-color); ${isSwe ? 'background: rgba(0, 106, 167, 0.1); font-weight: bold;' : ''}">
                            <td style="padding: 12px;">${s.rank || index + 1}</td>
                            <td style="padding: 12px;">${s.countryCode}</td>
                            <td style="padding: 12px; text-align: center;">${s.gold || 0}</td>
                            <td style="padding: 12px; text-align: center;">${s.silver || 0}</td>
                            <td style="padding: 12px; text-align: center;">${s.bronze || 0}</td>
                            <td style="padding: 12px; text-align: center; font-weight: bold;">${s.total || 0}</td>
                        </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        </div>`;
    }

    container.innerHTML = html;
}
