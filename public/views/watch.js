import { fetchApi } from '../app.js';

export async function renderWatch(container) {
    const data = await fetchApi('/watch');

    if (!data) {
        throw new Error("Kunde inte ladda TV-tablå.");
    }

    container.innerHTML = `
        <h1 class="card-title">Så sänder SVT</h1>
        <div class="card">
            <h2 style="font-size: 1.2rem; margin-bottom: 8px; color: var(--swe-blue);">SVT:s Sändningar</h2>
            <p style="margin-bottom: 16px;">SVT sänder alla tävlingar från Paralympics 2026 i Milano Cortina. Du kan följa sändningarna i SVT1, SVT2 och på SVT Play.</p>
            <p class="text-sm text-muted">Fullständig tidsplan för TV-sändningarna publiceras närmare invigningen.</p>
        </div>
    `;
}
