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

        async function fetchOlympicsSchedule(dateStr) {
            const url = `https://sph-s-api.olympics.com/winter/schedules/api/ENG/schedule/day/${dateStr}`;
            const res = await fetchWithTimeout(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const data = await safeJson(res);
            if (!data || !data.units) return null;

            const events = data.units.map(u => ({
                eventId: u.id || `oly-${Math.random().toString(36).substr(2, 9)}`,
                startTime: u.startDate || null,
                endTime: u.endDate || null,
                sport: u.disciplineName || 'Unknown',
                classification: u.eventUnitName || null,
                venue: u.venueName || null,
                status: u.status || 'upcoming',
                isFinal: !!u.medal,
                countries: u.competitors?.map(c => c.noc) || [],
                title: `${u.disciplineName || ''} — ${u.eventUnitName || ''}`
            }));
            return { schedule: events };
        }

        async function fetchNormalizedSchedule(dateFilter, countryFilter, finalsFilter) {
            let rawEvents = [];
            const oly = await fetchOlympicsSchedule(dateFilter);
            let source = 'olympics';
            let isError = false;

            if (oly && oly.schedule) {
                rawEvents = oly.schedule;
            } else {
                const mock = getMockData('/api/schedule');
                rawEvents = mock.events || [];
                source = 'mock';
                isError = true;
            }

            if (countryFilter) {
                rawEvents = rawEvents.filter(e => e.countries && e.countries.includes(countryFilter));
            }
            if (finalsFilter === '1') {
                rawEvents = rawEvents.filter(e => e.isFinal);
            }

            return { schedule: rawEvents, source, error: isError };
        }

        async function aggregateToday() {
            const schedRes = await fetchDataWithFallback('/api/schedule');
            const todayEvents = schedRes.events || [];
            const medalsRes = await fetchDataWithFallback('/api/medals');
            const sweMedalsData = medalsRes?.standings?.find(s => s.countryCode === 'SWE') || { total: 0 };

            const sweEvents = todayEvents.filter(e => e.countries && e.countries.includes('SWE'));
            const upcomingSwe = sweEvents.filter(e => new Date(e.startTime || Date.now()) > new Date());

            const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' });

            const nextSweStart = upcomingSwe.length > 0 ? formatter.format(new Date(upcomingSwe[0].startTime)) : null;
            const highlights = todayEvents.slice(0, 5).map(e => ({
                time: e.startTime ? formatter.format(new Date(e.startTime)) : 'TBA',
                event: e.title,
                sport: e.sport
            }));

            const formattedSweEvents = sweEvents.map(e => ({
                id: e.eventId,
                time: e.startTime ? formatter.format(new Date(e.startTime)) : 'TBA',
                sport: e.sport,
                athletes: e.title
            }));

            return {
                ...baseData,
                swedenMedals: sweMedalsData.total,
                swedenRank: sweMedalsData.rank || '-',
                nextSweStart,
                sweEvents: formattedSweEvents,
                highlights,
                source: schedRes.source,
                error: schedRes.error
            };
        }

        async function aggregateSweden() {
            const ipcSwe = await fetchDataWithFallback('/api/sweden_ipc'); // Using unique internal path 
            const schedRes = await fetchDataWithFallback('/api/schedule');
            const sweSchedule = (schedRes.events || []).filter(e => e.countries && e.countries.includes('SWE'));

            return {
                ...baseData,
                events: [...sweSchedule, ...(ipcSwe?.events || [])],
                source: schedRes.source,
                error: schedRes.error
            };
        }

        async function fetchDataWithFallback(endpointPath) {
            if (endpointPath === '/api/today') {
                return await aggregateToday();
            } else if (endpointPath === '/api/schedule') {
                const dateFilter = url.searchParams.get('date') || stockholmDate;
                const countryFilter = url.searchParams.get('country');
                const finalsFilter = url.searchParams.get('finals');
                const res = await fetchNormalizedSchedule(dateFilter, countryFilter, finalsFilter);
                return { ...baseData, events: res.schedule, source: res.source, error: res.error };
            } else if (endpointPath === '/api/sweden') {
                return await aggregateSweden();
            } else if (endpointPath === '/api/sweden_ipc') {
                const resultsPayload = await fetchIpcResults();
                const res = await fetchIpcSweden(resultsPayload);
                return res || { events: [] };
            } else if (endpointPath.startsWith('/api/debug/scheduleSample')) {
                if (env && env.DEBUG === 'true') {
                    const dateFilter = url.searchParams.get('date') || stockholmDate;
                    const olyUrl = `https://sph-s-api.olympics.com/winter/schedules/api/ENG/schedule/day/${dateFilter}`;
                    const res = await fetchWithTimeout(olyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                    const data = await safeJson(res);
                    return { ...baseData, raw: data, source: 'system' };
                }
                return { error: 'Forbidden' };
            }

            let ipcData = null;
            if (endpointPath === '/api/medals') {
                ipcData = await fetchIpcMedals();
            } else if (endpointPath === '/api/results') {
                ipcData = await fetchIpcResults();
            } else if (endpointPath === '/api/health') {
                return { ...baseData, status: 'ok', endpoints: ['/api/medals', '/api/results', '/api/sweden', '/api/schedule', '/api/today'], source: 'system' };
            }

            if (ipcData) {
                return { ...baseData, ...ipcData, source: 'ipc', error: false };
            } else {
                const mock = getMockData(endpointPath);
                if (mock) return { ...mock, source: 'mock', error: true };
                return null;
            }
        }

        function getMockData(endpointPath) {
            const mockEvents = [
                { eventId: 'oly-mock-1', startTime: new Date(Date.now() + 3600000).toISOString(), sport: 'Para-Alpint', isFinal: true, countries: ['SWE', 'NOR'], title: 'Men\'s Downhill (LW2)' },
                { eventId: 'oly-mock-2', startTime: new Date(Date.now() + 7200000).toISOString(), sport: 'Rullstols-curling', isFinal: false, countries: ['SWE', 'CAN'], title: 'Wheelchair Curling — Round Robin' },
                { eventId: 'oly-mock-3', startTime: new Date(Date.now() + 10800000).toISOString(), sport: 'Para-Ishockey', isFinal: false, countries: ['USA', 'CHN'], title: 'Para Ice Hockey — Preliminary' }
            ];

            if (endpointPath === '/api/today') {
                return {
                    ...baseData,
                    swedenMedals: 2,
                    swedenRank: 15,
                    nextSweStart: '14:30',
                    sweEvents: [{ id: 'oly-mock-1', time: '14:30', sport: 'Para-Alpint', athletes: 'Men\'s Downhill (LW2)' }],
                    highlights: [{ time: '18:00', event: 'Invigning', sport: 'Ceremoni' }]
                };
            } else if (endpointPath === '/api/schedule') {
                return { ...baseData, events: mockEvents };
            } else if (endpointPath === '/api/sweden') {
                return { ...baseData, events: mockEvents.filter(e => e.countries.includes('SWE')) };
            } else if (endpointPath === '/api/medals') {
                return {
                    ...baseData, standings: [
                        { countryCode: 'CHN', gold: 10, silver: 5, bronze: 3, total: 18, rank: 1 },
                        { countryCode: 'SWE', gold: 2, silver: 1, bronze: 0, total: 3, rank: 15 }
                    ]
                };
            } else if (endpointPath === '/api/results') {
                return { ...baseData, latest: mockEvents };
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
