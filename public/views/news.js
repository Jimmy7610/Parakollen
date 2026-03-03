import { fetchApi } from '../app.js';

export async function renderNews(container) {
    const data = await fetchApi('/news');

    if (!data) {
        throw new Error("Kunde inte ladda nyheter.");
    }

    let html = `<h1 class="card-title">Nyheter</h1>`;

    if (!data.articles || data.articles.length === 0) {
        html += `<div class="card"><p class="text-muted" style="text-align: center; padding: 3rem 0;">Inga nyheter ännu.</p></div>`;
    } else {
        html += `<div class="flex flex-col gap-2">
            ${data.articles.map(a => `
                <a href="${a.url || '#'}" target="_blank" rel="noopener noreferrer" class="card" style="display: block; text-decoration: none; padding: 16px; margin-bottom: 8px; color: inherit;">
                    <h3 style="margin-bottom: 8px; font-size: 1.1rem; color: var(--swe-blue);">${a.title || 'Nyhet'}</h3>
                    <div class="flex justify-between items-center text-sm text-muted">
                        <span>${a.source || 'Källa'}</span>
                        <span>${a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ''}</span>
                    </div>
                </a>
            `).join('')}
        </div>`;
    }

    container.innerHTML = html;
}
