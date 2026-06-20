# Worldpulse

A live global dashboard that surfaces real-time data for any country in one place. Search a nation and Worldpulse pulls together its population, region, currency exchange rate, current weather, and the latest breaking news headlines.

Built with Express, Axios, and EJS.

## Features

- **Population and region** from the REST Countries API.
- **Live weather** for the capital city via OpenWeather.
- **Currency exchange rate** against USD via the Open Exchange Rates API.
- **Breaking news** headlines via NewsAPI.
- Server-rendered EJS views with a single search entry point.

## Tech stack

| Layer        | Choice            |
|--------------|-------------------|
| Server       | Express 5         |
| HTTP client  | Axios             |
| Views        | EJS               |
| Config       | dotenv            |
| Hosting      | Vercel (`@vercel/node`) |

## Getting started

### Prerequisites

- Node.js 18 or newer
- API keys for OpenWeather and NewsAPI (both offer free tiers)

### Install

```bash
git clone https://github.com/ShAuRyA-Noodle/Worldpulse.git
cd Worldpulse
npm install
```

### Configure

Create a `.env` file in the project root:

```bash
WEATHER_API_KEY=your_openweather_key
NEWS_API_KEY=your_newsapi_key
```

The `.env` file is git-ignored and is never committed.

### Run

```bash
npm run dev    # local development with auto-reload (nodemon)
npm start      # plain node
```

The app starts on [http://localhost:3000](http://localhost:3000).

## How it works

1. The home page renders a search form.
2. On submit, the country name is validated against a strict allowlist (`^[A-Za-z\s'-]{1,64}$`) before any upstream request is made. This blocks server-side request forgery and path traversal.
3. The validated name is URL-encoded and used to look up country data, then weather, currency, and news are fetched in turn.
4. Results are rendered server-side with auto-escaped EJS output.

## Data sources

- [REST Countries](https://restcountries.com)
- [OpenWeather](https://openweathermap.org/api)
- [Open Exchange Rates (er-api)](https://www.exchangerate-api.com)
- [NewsAPI](https://newsapi.org)

## Security

- User input is validated against a strict allowlist before reaching any upstream URL.
- All template output is auto-escaped to prevent cross-site scripting.
- API keys are read from environment variables and never hardcoded.
- CodeQL `security-extended` runs on every push, pull request, and weekly. Secret scanning, push protection, and Dependabot security updates are enabled.

See [SECURITY.md](SECURITY.md) for how to report a vulnerability.

## Deployment

The project is configured for Vercel via `vercel.json`, exporting the Express app as a serverless function. Set `WEATHER_API_KEY` and `NEWS_API_KEY` in the Vercel project environment.

## License

ISC
