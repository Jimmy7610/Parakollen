import { fetchApi } from '../app.js';

export async function renderMedals(container) {
    const data = await fetchApi('/medals');

    if (!data) {
        container.innerHTML = `<div class="card"><p class="text-muted">Kunde inte ladda medaljligan.</p></div>`;
        return;
    }

    container.innerHTML = `
        <h1 class="card-title">Medaljligan</h1>
        <div class="card">
            <p><strong>Under uppbyggnad.</strong> Här visas medaljtabellen, Sverige pinnas längst upp.</p>
        </div>
    `;
}
