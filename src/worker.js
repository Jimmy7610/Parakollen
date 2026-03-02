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

        // Helper to simulate the fallback strategy
        async function fetchDataWithFallback(endpointPath) {
            // TODO: Replace with actual fetch to IPC
            let ipcData = null;

            // TODO: Replace with actual fetch to Olympics.com
            let olympicsData = null;

            let staleCacheData = null; // In real implementation, this would read from KV or cache API if both fail

            if (ipcData) {
                return { ...ipcData, source: 'ipc', error: false };
            } else if (olympicsData) {
                return { ...olympicsData, source: 'olympics', error: false };
            } else if (staleCacheData) {
                return { ...staleCacheData, source: 'stale_cache', error: true };
            } else {
                // Return Mock data for now until real endpoints exist
                return getMockData(endpointPath);
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
