# Parakollen Local Development Guide

To prevent the frontend from appearing blank, it **must** be served over HTTP, not via double-clicking `index.html` (which uses the `file://` protocol). Furthermore, the Cloudflare Worker needs to be running to provide data.

## 1. Start the Data Layer (Cloudflare Worker)
Open a terminal in the root of the `Parakollen` directory and run:
```bash
npx wrangler dev --local --port 8787
```
This will start the mock/IPC proxy API at `http://127.0.0.1:8787`.

## 2. Start the Frontend
Open a **second** terminal in the root of the `Parakollen` directory and run:
```bash
npx serve public -l 4173
```
*Note: If you don't have `serve` installed globally, `npx serve` will temporarily download and run it.*

## 3. View the App
Open your browser and navigate to:
**http://127.0.0.1:4173**

The app will now reliably load data from the local worker and render the interface correctly.
