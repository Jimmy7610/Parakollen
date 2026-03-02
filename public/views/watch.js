import { fetchApi } from '../app.js';

export async function renderWatch(container) {
    const data = await fetchApi('/watch');

    if (!data) {
        throw new Error("Kunde inte ladda TV-tablå.");
    }

    container.innerHTML = `
        <h1 class="card-title">Så sänder SVT</h1>
        <div class="card">
            <p>SVT sänder alla tävlingar från Paralympics 2026 i Milano Cortina. Fullständig sändningsplan kommer.</p>
        </div>
    `;
}
