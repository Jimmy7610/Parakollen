# Upstream API Sources: Bornan (IPC Web Results)

This document outlines the API endpoints discovered for the IPC Web Results (Bornan) integration for the Milano Cortina 2026 Winter Paralympics.

## Base Information
- **Domain Strategy:** The IPC uses relative paths heavily in its JS application (`bornan-wrs.js`), proxying through the main `paralympic.org` domain or `wrs-paralympic.bornan.net`.
- **Primary Source:** Data is served dynamically as JSON payloads.

## Discovered Endpoints

### 1. Medal Standings
- **URL Path:** `/ALL/medals/standings/` (Often prefixed with `/api/v1` or accessed directly via the WRS subdomain like `https://wrs.paralympic.org/api/v1/ALL/medals/standings/milano-cortina-2026`)
- **Method:** `GET`
- **Purpose:** Retrieves the current, overall medal standings per country.
- **Example Response Snippet:**
  ```json
  [
    { "countryCode": "CHN", "gold": 10, "silver": 5, "bronze": 3, "total": 18 },
    { "countryCode": "SWE", "gold": 2, "silver": 1, "bronze": 0, "total": 3 }
  ]
  ```

### 2. Full Results Listing
- **URL Path:** `/results/` or `/org/milano-cortina-2026/results`
- **Method:** `GET`
- **Purpose:** Retrieves recent, ongoing, and finished event results.
- **Notes on Filtering:** Results arrays often contain `sport`, `status` (e.g., "FINISHED"), and `competitors` arrays where `country` codes (like "SWE") can be found.

### 3. Sweden Specific Filtering (Derived)
Since there is no direct `/api/sweden` endpoint discovered that perfectly matches our frontend needs, the `sweden` view will be populated by:
1. Fetching the full `/results/` array.
2. Filtering the inner `competitors` or `teams` data where `country === "SWE"`.
3. Standardizing the stable `eventId`.

## Fallback Strategy
Because these APIs are highly dynamic and only become fully stable as the Games begin, our Cloudflare Worker proxy employs the following resilience chain:
1. **IPC (Bornan):** Primary source.
2. **Olympics.com:** Secondary fallback if IPC fails.
3. **Stale Cache:** Returned if both sources fail (with `error: true` flag).
4. **Mock Data:** Returned if no cache exists during deep development.

---

# Upstream API Sources: Olympics.com (Schedule)

Olympics.com serves as the primary fallback for scheduling before the Games launch (and sometimes during). As of 2024-2026, their endpoints are heavily protected by Akamai bot shielding (HTTP2 Protocol exceptions for headless scrapers).

## Inferred Endpoints (Based on Historical Paris 2024 Patterns)

### 1. Daily Schedule Listing
- **URL Path:** `https://sph-s-api.olympics.com/winter/schedules/api/ENG/schedule/day/{YYYY-MM-DD}` (e.g., `2026-03-06`)
- **Method:** `GET`
- **Headers:** Generally requires standard Browser User-Agents.
- **Purpose:** Retrieves the complete daily schedule spanning all sports and disciplines.
- **Sample Response Fields (Normalized by Worker):**
  - `eventId`: Stable unique identifier
  - `startTime` / `endTime`: UTC ISO strings
  - `sport`: Name of the sport
  - `status`: "upcoming", "live", "finished"
  - `isFinal`: Boolean indicating medal events
  - `countries`: Array of ISO country codes involved

**Note on Stability:** As Cloudflare Workers share IPs, fetching Olympics.com directly might yield `403 Forbidden` if Akamai blocks the datacenter. The Worker gracefully handles this by parsing the errors and routing cleanly to the mock/stale fallback chains.

---

# Upstream API Sources: Official Schedule PDF (Fallback)

When the highly dynamic Olympics.com JSON schedule API is blocked by Akamai, we fall back to parsing the static Official Competition Schedule PDF as a reliable source of truth for event times pre-games.

## Source Details
- **URL Path:** `https://milanocortina2026.olympics.com/en/paralympic-games/schedule/pdf` (or corresponding official CDN link).
- **Purpose:** Provide a stable fallback for daily schedules to prevent fake/mock times from being presented to the user.

## Parsing Strategy
- Because Cloudflare Workers cannot natively run complex PDF decompression libraries (like `pdf.js`), the Worker utilizes a `extractTextFromPdf()` heuristical approach on uncompressed streams or falls back to a derived static dataset generated periodically from the master PDF.
- **Limitations:** The PDF strictly details event classifications, start times, and sports, but *does not* include final athlete or active country rosters. Therefore, `countries` is always an empty array `[]`.
- **UI Implication:** Without `SWE` country flags in this fallback payload, the `Idag` view will simply omit the "Nästa svensk" badge instead of guessing.

## Caching Choice
- Results derived from the PDF are cached heavily (`Cache-Control: max-age=86400`, 24 hours), since pre-games PDF schedules rarely mutate and do not provide live up-to-the-minute data.
