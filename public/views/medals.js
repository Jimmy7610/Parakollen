import { fetchApi } from '../app.js';

export async function renderMedals(container) {
    const data = await fetchApi('/medals');

    if (!data) {
        throw new Error("Kunde inte ladda medaljligan.");
    }

    container.innerHTML = `
        <h1 class="card-title">Medaljligan</h1>
        <div class="card">
            ${data.standings?.length === 0 ? '<p class="text-muted" style="text-align: center; padding: 2rem 0;">Inga medaljer ännu.</p>' : '<p><strong>Under uppbyggnad.</strong> Här visas medaljtabellen, Sverige pinnas längst upp.</p>'}
        </div>
    `;
}
