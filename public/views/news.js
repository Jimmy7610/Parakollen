import { fetchApi } from '../app.js';

export async function renderNews(container) {
    const data = await fetchApi('/news');

    if (!data) {
        container.innerHTML = `<div class="card"><p class="text-muted">Kunde inte ladda nyheter.</p></div>`;
        return;
    }

    container.innerHTML = `
        <h1 class="card-title">Nyheter</h1>
        <div class="card">
            <p><strong>Under uppbyggnad.</strong> Länkar till senaste paralympiska nyheter.</p>
        </div>
    `;
}
