import { fetchApi } from '../app.js';

export async function renderSchedule(container) {
    const data = await fetchApi('/schedule');

    if (!data) {
        container.innerHTML = `<div class="card"><p class="text-muted">Kunde inte ladda tablån.</p></div>`;
        return;
    }

    container.innerHTML = `
        <h1 class="card-title">Tablå</h1>
        <div class="card">
            <p><strong>Under uppbyggnad.</strong> Här visas hela schemat dag för dag.</p>
        </div>
    `;
}
