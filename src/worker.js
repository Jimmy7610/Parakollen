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
            stockholmDate: stockholmDate
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

        if (path === '/api/today') {
            responseData = {
                ...baseData,
                swedenMedals: 2,
                swedenRank: 14,
                nextSweStart: '14:30',
                sweEvents: [{ id: 'e1', time: '14:30', sport: 'Para-Alpint', athletes: 'Ebba Årsjö' }],
                highlights: [{ time: '18:00', event: 'Invigning', sport: 'Ceremoni' }]
            };
        } else if (path === '/api/schedule') {
            responseData = { ...baseData, events: [] };
        } else if (path === '/api/sweden') {
            responseData = { ...baseData, events: [{ id: 'e1' }] };
        } else if (path === '/api/medals') {
            responseData = { ...baseData, standings: [] };
        } else if (path === '/api/results') {
            responseData = { ...baseData, latest: [] };
        } else if (path === '/api/news') {
            responseData = { ...baseData, articles: [] };
        } else if (path === '/api/watch') {
            responseData = { ...baseData, broadcasts: [] };
        }

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
