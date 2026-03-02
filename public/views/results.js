import { fetchApi } from '../app.js';

export async function renderResults(container) {
    const data = await fetchApi('/results');

    if (!data) {
        container.innerHTML = `<div class="card"><p class="text-muted">Kunde inte ladda resultat.</p></div>`;
        return;
    }

    container.innerHTML = `
        <h1 class="card-title">Resultat</h1>
        <div class="card">
            <p><strong>Under uppbyggnad.</strong> Senaste avslutade tävlingar och svenska placeringar.</p>
        </div>
    `;
}
