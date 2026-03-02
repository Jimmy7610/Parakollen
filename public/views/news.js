import { fetchApi } from '../app.js';

export async function renderNews(container) {
    const data = await fetchApi('/news');

    if (!data) {
        throw new Error("Kunde inte ladda nyheter.");
    }

    container.innerHTML = `
        <h1 class="card-title">Nyheter</h1>
        <div class="card">
            <p><strong>Under uppbyggnad.</strong> Länkar till senaste paralympiska nyheter.</p>
        </div>
    `;
}
