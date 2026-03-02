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
