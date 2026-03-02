export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // Auto-generate Stockholm date
        const stockholmDate = new Intl.DateTimeFormat('sv-SE', {
            timeZone: 'Europe/Stockholm',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());

        const baseData = {
            lastUpdated: new Date().toISOString(),
            stockholmDate: stockholmDate,
            source: 'mock' // Will be 'ipc' or 'olympics' when real
        };

        // CORS headers for local dev testing
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
            "Access-Control-Max-Age": "86400",
        };

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        let responseData = null;

        // Helper to simulate fetch with timeout
        async function fetchWithTimeout(url, options = {}, ms = 5000) {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), ms);
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            }).catch(() => null);
            clearTimeout(id);
            return response;
        }

        async function safeJson(res) {
            if (!res || !res.ok) return null;
            try {
                return await res.json();
            } catch (e) {
                return null;
            }
        }

        // IPC Primary Endpoints (Derived from JS parsing)
        const IPC_BASE = 'https://wrs.paralympic.org/api/v1';

        async function fetchIpcMedals() {
            const res = await fetchWithTimeout(`${IPC_BASE}/ALL/medals/standings/milano-cortina-2026`);
            const data = await safeJson(res);
            if (!data || !Array.isArray(data)) return null;

            // Normalize
            let hasSwe = false;
            const standings = data.map(c => {
                if (c.countryCode === 'SWE') hasSwe = true;
                return {
                    countryCode: c.countryCode || 'UNK',
                    gold: c.gold || 0,
                    silver: c.silver || 0,
                    bronze: c.bronze || 0,
                    total: c.total || 0
                };
            });

            if (!hasSwe) {
                standings.push({ countryCode: 'SWE', gold: 0, silver: 0, bronze: 0, total: 0 });
            }

            return { standings };
        }

        async function fetchIpcResults() {
            const res = await fetchWithTimeout(`${IPC_BASE}/results/milano-cortina-2026`);
            const data = await safeJson(res);
            if (!data || !Array.isArray(data)) return null;

            // Normalize
            const latest = data.map(r => ({
                id: r.id || `evt-${Math.random().toString(36).substr(2, 9)}`, // stable if provided
                time: r.startTime || r.date || 'TBA',
                sport: r.sport || 'Unknown',
                status: r.status || 'SCHEDULED',
                competitors: r.competitors || r.teams || []
            }));

            return { latest };
        }

        async function fetchIpcSweden(resultsPayload) {
            if (!resultsPayload || !resultsPayload.latest) return null;

            // Filter global results for Sweden
            const sweEvents = resultsPayload.latest.filter(evt => {
                return (evt.competitors && evt.competitors.some(c => c.country === 'SWE' || c.countryCode === 'SWE')) || evt.country === 'SWE';
            });

            return { events: sweEvents };
        }

        async function fetchDataWithFallback(endpointPath) {
            let ipcData = null;

            if (endpointPath === '/api/medals') {
                ipcData = await fetchIpcMedals();
            } else if (endpointPath === '/api/results') {
                ipcData = await fetchIpcResults();
            } else if (endpointPath === '/api/sweden') {
                // Fetch full results to build Sweden filter
                const results = await fetchIpcResults();
                if (results) ipcData = await fetchIpcSweden(results);
            } else if (endpointPath === '/api/health') {
                // Return test harness status
                return {
                    ...baseData,
                    status: 'ok',
                    endpoints: ['/api/medals', '/api/results', '/api/sweden'],
                    source: 'system'
                };
            }

            // Fallback chain priority: 1. IPC, 2. Mock (simulate Stale/Olympics for now as they are unset)
            if (ipcData) {
                return { ...baseData, ...ipcData, source: 'ipc', error: false };
            } else {
                const mock = getMockData(endpointPath);
                if (mock) {
                    return { ...mock, source: 'mock', error: true };
                }
                return null;
            }
        }

        function getMockData(endpointPath) {
            if (endpointPath === '/api/today') {
                return {
                    ...baseData,
                    swedenMedals: 2,
                    swedenRank: 14,
                    nextSweStart: '14:30',
                    sweEvents: [{ id: 'e1', time: '14:30', sport: 'Para-Alpint', athletes: 'Ebba Årsjö' }],
                    highlights: [{ time: '18:00', event: 'Invigning', sport: 'Ceremoni' }]
                };
            } else if (endpointPath === '/api/schedule') {
                return { ...baseData, events: [] };
            } else if (endpointPath === '/api/sweden') {
                return { ...baseData, events: [{ id: 'e1' }] };
            } else if (endpointPath === '/api/medals') {
                return { ...baseData, standings: [] };
            } else if (endpointPath === '/api/results') {
                return { ...baseData, latest: [] };
            } else if (endpointPath === '/api/news') {
                return { ...baseData, articles: [] };
            } else if (endpointPath === '/api/watch') {
                return { ...baseData, broadcasts: [] };
            }
            return null;
        }

        responseData = await fetchDataWithFallback(path);

        if (responseData) {
            return new Response(JSON.stringify(responseData), {
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
                    ...corsHeaders
                }
            });
        }

        return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders
            }
        });
    }
};
