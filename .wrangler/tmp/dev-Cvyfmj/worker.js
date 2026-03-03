var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// .wrangler/tmp/bundle-kKPkhy/checked-fetch.js
var require_checked_fetch = __commonJS({
  ".wrangler/tmp/bundle-kKPkhy/checked-fetch.js"() {
    var urls = /* @__PURE__ */ new Set();
    function checkURL(request, init) {
      const url = request instanceof URL ? request : new URL(
        (typeof request === "string" ? new Request(request, init) : request).url
      );
      if (url.port && url.port !== "443" && url.protocol === "https:") {
        if (!urls.has(url.toString())) {
          urls.add(url.toString());
          console.warn(
            `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
          );
        }
      }
    }
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// .wrangler/tmp/bundle-kKPkhy/middleware-loader.entry.ts
var import_checked_fetch7 = __toESM(require_checked_fetch());

// wrangler-modules-watch:wrangler:modules-watch
var import_checked_fetch = __toESM(require_checked_fetch());

// .wrangler/tmp/bundle-kKPkhy/middleware-insertion-facade.js
var import_checked_fetch5 = __toESM(require_checked_fetch());

// src/worker.js
var import_checked_fetch2 = __toESM(require_checked_fetch());

// src/data/schedule_pdf.json
var schedule_pdf_default = [
  {
    eventId: "pdf-Para-Alpint-2026-03-06T09-30-00-01-00",
    rawStart: "2026-03-06T09:30:00+01:00",
    startTime: "2026-03-06T09:30:00+01:00",
    stockholmTimeLabel: "09:30",
    endTime: null,
    sport: "Para-Alpint",
    classification: null,
    venue: null,
    status: "upcoming",
    isFinal: true,
    countries: [],
    title: "Men's Downhill (LW2)"
  },
  {
    eventId: "pdf-Rullstols-curling-2026-03-06T14-30-00-01-00",
    rawStart: "2026-03-06T14:30:00+01:00",
    startTime: "2026-03-06T14:30:00+01:00",
    stockholmTimeLabel: "14:30",
    endTime: null,
    sport: "Rullstols-curling",
    classification: null,
    venue: null,
    status: "upcoming",
    isFinal: false,
    countries: [],
    title: "Wheelchair Curling \u2014 Round Robin"
  },
  {
    eventId: "pdf-Ceremoni-2026-03-06T18-00-00-01-00",
    rawStart: "2026-03-06T18:00:00+01:00",
    startTime: "2026-03-06T18:00:00+01:00",
    stockholmTimeLabel: "18:00",
    endTime: null,
    sport: "Ceremoni",
    classification: null,
    venue: null,
    status: "upcoming",
    isFinal: false,
    countries: [],
    title: "Invigning"
  },
  {
    eventId: "pdf-Para-Ishockey-2026-03-07T10-00-00-01-00",
    rawStart: "2026-03-07T10:00:00+01:00",
    startTime: "2026-03-07T10:00:00+01:00",
    stockholmTimeLabel: "10:00",
    endTime: null,
    sport: "Para-Ishockey",
    classification: null,
    venue: null,
    status: "upcoming",
    isFinal: false,
    countries: [],
    title: "Para Ice Hockey \u2014 Preliminary"
  },
  {
    eventId: "pdf-Para-Skidskytte-2026-03-07T14-00-00-01-00",
    rawStart: "2026-03-07T14:00:00+01:00",
    startTime: "2026-03-07T14:00:00+01:00",
    stockholmTimeLabel: "14:00",
    endTime: null,
    sport: "Para-Skidskytte",
    classification: null,
    venue: null,
    status: "upcoming",
    isFinal: true,
    countries: [],
    title: "Women's Sprint"
  }
];

// src/worker.js
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const GAMES_START = "2026-03-06";
    const GAMES_END = "2026-03-15";
    const stockholmDate = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Stockholm",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(/* @__PURE__ */ new Date());
    const isPreGamesMode = stockholmDate < GAMES_START;
    const baseData = {
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      stockholmDate,
      source: "mock",
      preGames: isPreGamesMode
    };
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    let responseData = null;
    async function fetchWithTimeout(url2, options = {}, ms = 5e3) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), ms);
      const response = await fetch(url2, {
        ...options,
        signal: controller.signal
      }).catch(() => null);
      clearTimeout(id);
      return response;
    }
    __name(fetchWithTimeout, "fetchWithTimeout");
    async function safeJson(res) {
      if (!res || !res.ok) return null;
      try {
        return await res.json();
      } catch (e) {
        return null;
      }
    }
    __name(safeJson, "safeJson");
    const IPC_BASE = "https://wrs.paralympic.org/api/v1";
    async function fetchIpcMedals() {
      const res = await fetchWithTimeout(`${IPC_BASE}/ALL/medals/standings/milano-cortina-2026`);
      const data = await safeJson(res);
      if (!data || !Array.isArray(data)) return null;
      let hasSwe = false;
      const standings = data.map((c) => {
        if (c.countryCode === "SWE") hasSwe = true;
        return {
          countryCode: c.countryCode || "UNK",
          gold: c.gold || 0,
          silver: c.silver || 0,
          bronze: c.bronze || 0,
          total: c.total || 0
        };
      });
      if (!hasSwe) {
        standings.push({ countryCode: "SWE", gold: 0, silver: 0, bronze: 0, total: 0 });
      }
      return { standings };
    }
    __name(fetchIpcMedals, "fetchIpcMedals");
    async function fetchIpcResults() {
      const res = await fetchWithTimeout(`${IPC_BASE}/results/milano-cortina-2026`);
      const data = await safeJson(res);
      if (!data || !Array.isArray(data)) return null;
      const latest = data.map((r) => ({
        id: r.id || `evt-${Math.random().toString(36).substr(2, 9)}`,
        // stable if provided
        time: r.startTime || r.date || "TBA",
        sport: r.sport || "Unknown",
        status: r.status || "SCHEDULED",
        competitors: r.competitors || r.teams || []
      }));
      return { latest };
    }
    __name(fetchIpcResults, "fetchIpcResults");
    async function fetchIpcSweden(resultsPayload) {
      if (!resultsPayload || !resultsPayload.latest) return null;
      const sweEvents = resultsPayload.latest.filter((evt) => {
        return evt.competitors && evt.competitors.some((c) => c.country === "SWE" || c.countryCode === "SWE") || evt.country === "SWE";
      });
      return { events: sweEvents };
    }
    __name(fetchIpcSweden, "fetchIpcSweden");
    async function fetchOlympicsSchedule(dateStr) {
      const url2 = `https://sph-s-api.olympics.com/winter/schedules/api/ENG/schedule/day/${dateStr}`;
      const res = await fetchWithTimeout(url2, { headers: { "User-Agent": "Mozilla/5.0" } });
      const data = await safeJson(res);
      if (!data || !data.units) return null;
      const timeFormatter = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", hour: "2-digit", minute: "2-digit" });
      const events = data.units.map((u) => {
        let startTimeIso = u.startDate || null;
        let stockholmTimeLabel = "TBA";
        if (startTimeIso) {
          if (!startTimeIso.includes("Z") && !startTimeIso.match(/[+-]\d{2}:\d{2}$/)) {
            startTimeIso = startTimeIso + "+01:00";
          }
          try {
            stockholmTimeLabel = timeFormatter.format(new Date(startTimeIso));
          } catch (e) {
          }
        }
        return {
          eventId: u.id || `oly-${Math.random().toString(36).substr(2, 9)}`,
          rawStart: u.startDate || null,
          startTime: startTimeIso,
          stockholmTimeLabel,
          endTime: u.endDate || null,
          sport: u.disciplineName || "Unknown",
          classification: u.eventUnitName || null,
          venue: u.venueName || null,
          status: u.status || "upcoming",
          isFinal: !!u.medal,
          countries: u.competitors?.map((c) => c.noc) || [],
          title: `${u.disciplineName || ""} \u2014 ${u.eventUnitName || ""}`
        };
      });
      return { schedule: events };
    }
    __name(fetchOlympicsSchedule, "fetchOlympicsSchedule");
    async function getPdfScheduleEvents(dateFilter) {
      const events = [];
      for (const item of schedule_pdf_default) {
        if (!item.rawStart.startsWith(dateFilter)) continue;
        events.push(item);
      }
      return events;
    }
    __name(getPdfScheduleEvents, "getPdfScheduleEvents");
    async function fetchNormalizedSchedule(dateFilter, countryFilter, finalsFilter) {
      let rawEvents = [];
      const oly = await fetchOlympicsSchedule(dateFilter);
      let source = "olympics";
      let isError = false;
      if (oly && oly.schedule && oly.schedule.length > 0) {
        rawEvents = oly.schedule;
      } else {
        const pdfEvents = await getPdfScheduleEvents(dateFilter);
        if (pdfEvents && pdfEvents.length > 0) {
          rawEvents = pdfEvents;
          source = "pdf-json";
          isError = false;
        } else {
          source = "unavailable";
          isError = true;
          rawEvents = [];
        }
      }
      if (countryFilter) {
        rawEvents = rawEvents.filter((e) => e.countries && e.countries.includes(countryFilter));
      }
      if (finalsFilter === "1") {
        rawEvents = rawEvents.filter((e) => e.isFinal);
      }
      return { schedule: rawEvents, source, error: isError };
    }
    __name(fetchNormalizedSchedule, "fetchNormalizedSchedule");
    async function aggregateToday() {
      const schedRes = await fetchDataWithFallback("/api/schedule");
      const todayEvents = schedRes.events || [];
      const medalsRes = await fetchDataWithFallback("/api/medals");
      const sweMedalsData = medalsRes?.standings?.find((s) => s.countryCode === "SWE") || { total: 0 };
      const sweEvents = todayEvents.filter((e) => e.countries && e.countries.includes("SWE"));
      const upcomingSwe = sweEvents.filter((e) => new Date(e.startTime || Date.now()) > /* @__PURE__ */ new Date());
      const formatter = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", hour: "2-digit", minute: "2-digit" });
      const nextSweStart = upcomingSwe.length > 0 ? formatter.format(new Date(upcomingSwe[0].startTime)) : null;
      const highlights = todayEvents.slice(0, 5).map((e) => ({
        time: e.startTime ? formatter.format(new Date(e.startTime)) : "TBA",
        event: e.title,
        sport: e.sport
      }));
      const formattedSweEvents = sweEvents.map((e) => ({
        id: e.eventId,
        time: e.startTime ? formatter.format(new Date(e.startTime)) : "TBA",
        sport: e.sport,
        athletes: e.title
      }));
      return {
        ...baseData,
        swedenMedals: sweMedalsData.total,
        swedenRank: sweMedalsData.rank || "-",
        nextSweStart,
        sweEvents: formattedSweEvents,
        highlights,
        source: schedRes.source,
        error: schedRes.error
      };
    }
    __name(aggregateToday, "aggregateToday");
    async function aggregateSweden() {
      const ipcSwe = await fetchDataWithFallback("/api/sweden_ipc");
      const schedRes = await fetchDataWithFallback("/api/schedule");
      const sweSchedule = (schedRes.events || []).filter((e) => e.countries && e.countries.includes("SWE"));
      return {
        ...baseData,
        events: [...sweSchedule, ...ipcSwe?.events || []],
        source: schedRes.source,
        error: schedRes.error
      };
    }
    __name(aggregateSweden, "aggregateSweden");
    async function fetchDataWithFallback(endpointPath) {
      if (endpointPath === "/api/today") {
        return await aggregateToday();
      } else if (endpointPath === "/api/schedule") {
        const dateFilter = url.searchParams.get("date") || stockholmDate;
        const countryFilter = url.searchParams.get("country");
        const finalsFilter = url.searchParams.get("finals");
        const res = await fetchNormalizedSchedule(dateFilter, countryFilter, finalsFilter);
        return { ...baseData, events: res.schedule, source: res.source, error: res.error };
      } else if (endpointPath === "/api/sweden") {
        return await aggregateSweden();
      } else if (endpointPath === "/api/sweden_ipc") {
        const resultsPayload = await fetchIpcResults();
        const res = await fetchIpcSweden(resultsPayload);
        return res || { events: [] };
      } else if (endpointPath.startsWith("/api/debug/scheduleSample")) {
        if (env && env.DEBUG === "true") {
          const dateFilter = url.searchParams.get("date") || stockholmDate;
          const olyUrl = `https://sph-s-api.olympics.com/winter/schedules/api/ENG/schedule/day/${dateFilter}`;
          const res = await fetchWithTimeout(olyUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
          const data = await safeJson(res);
          return { ...baseData, raw: data, source: "system" };
        }
        return { error: "Forbidden" };
      }
      let ipcData = null;
      if (endpointPath === "/api/medals") {
        ipcData = await fetchIpcMedals();
      } else if (endpointPath === "/api/results") {
        ipcData = await fetchIpcResults();
      } else if (endpointPath === "/api/health") {
        return { ...baseData, status: "ok", endpoints: ["/api/medals", "/api/results", "/api/sweden", "/api/schedule", "/api/today"], source: "system" };
      }
      if (ipcData) {
        return { ...baseData, ...ipcData, source: "ipc", error: false };
      } else {
        const mock = getMockData(endpointPath);
        if (mock) return { ...mock, source: "mock", error: true };
        return null;
      }
    }
    __name(fetchDataWithFallback, "fetchDataWithFallback");
    function getMockData(endpointPath) {
      return null;
    }
    __name(getMockData, "getMockData");
    function decodeHtmlEntities(str) {
      const entities = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'",
        "&aring;": "\xE5",
        "&auml;": "\xE4",
        "&ouml;": "\xF6",
        "&Aring;": "\xC5",
        "&Auml;": "\xC4",
        "&Ouml;": "\xD6"
      };
      return entities[str] || str;
    }
    __name(decodeHtmlEntities, "decodeHtmlEntities");
    async function fetchNews() {
      const rssUrl = "https://news.google.com/rss/search?q=Paralympics+OR+%22Milano+Cortina%22&hl=sv&gl=SE&ceid=SE:sv";
      try {
        const res = await fetchWithTimeout(rssUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!res.ok) throw new Error("RSS feed returned " + res.status);
        const text = await res.text();
        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(text)) !== null && items.length < 15) {
          const itemXml = match[1];
          const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemXml.match(/<title>(.*?)<\/title>/);
          const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
          const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
          const sourceMatch = itemXml.match(/<source[^>]*>(.*?)<\/source>/);
          if (titleMatch && linkMatch) {
            let cleanTitle = titleMatch[1].replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
            cleanTitle = cleanTitle.replace(/&#(\d+);/g, (match2, dec) => String.fromCharCode(dec));
            cleanTitle = cleanTitle.replace(/&([a-z]+);/gi, (match2) => decodeHtmlEntities(match2));
            cleanTitle = cleanTitle.split(" - ")[0];
            items.push({
              title: cleanTitle.trim(),
              url: linkMatch[1],
              publishedAt: pubDateMatch ? pubDateMatch[1] : null,
              sourceName: sourceMatch ? sourceMatch[1] : "Nyheter"
            });
          }
        }
        if (items.length > 0) {
          return { ...baseData, source: "rss", articles: items, error: false };
        }
        return { ...baseData, source: "unavailable", articles: [], error: true };
      } catch (e) {
        return { ...baseData, source: "unavailable", articles: [], error: true };
      }
    }
    __name(fetchNews, "fetchNews");
    if (path === "/api/today") {
      responseData = await aggregateToday();
    } else if (path === "/api/schedule") {
      const dateFilter = url.searchParams.get("date") || stockholmDate;
      const countryFilter = url.searchParams.get("country");
      const finalsFilter = url.searchParams.get("finals");
      const res = await fetchNormalizedSchedule(dateFilter, countryFilter, finalsFilter);
      responseData = { ...baseData, events: res.schedule, source: res.source, error: res.error };
    } else if (path === "/api/sweden") {
      responseData = await aggregateSweden();
    } else if (path === "/api/sweden_ipc") {
      const resultsPayload = await fetchIpcResults();
      const res = await fetchIpcSweden(resultsPayload);
      responseData = res || { events: [] };
    } else if (path === "/api/news") {
      responseData = await fetchNews();
    } else {
      responseData = await fetchDataWithFallback(path);
    }
    if (responseData) {
      const isPdf = responseData.source === "pdf-json";
      const isRss = responseData.source === "rss";
      let cacheAge = 300;
      if (isPdf) cacheAge = 86400;
      if (isRss) cacheAge = 3600;
      return new Response(JSON.stringify(responseData), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": `public, max-age=${cacheAge}, stale-while-revalidate=60`,
          ...corsHeaders
        }
      });
    }
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...corsHeaders
      }
    });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var import_checked_fetch3 = __toESM(require_checked_fetch());
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
var import_checked_fetch4 = __toESM(require_checked_fetch());
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-kKPkhy/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var import_checked_fetch6 = __toESM(require_checked_fetch());
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-kKPkhy/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
