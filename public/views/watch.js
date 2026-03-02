import { fetchApi } from '../app.js';

export async function renderWatch(container) {
    const data = await fetchApi('/watch');

    if (!data) {
        container.innerHTML = `<div class="card"><p class="text-muted">Kunde inte ladda TV-tablå.</p></div>`;
        return;
    }

    container.innerHTML = `
        <h1 class="card-title">Så sänder SVT</h1>
        <div class="card">
            <p>SVT sänder alla tävlingar från Paralympics 2026 i Milano Cortina. Fullständig sändningsplan kommer.</p>
        </div>
    `;
}
