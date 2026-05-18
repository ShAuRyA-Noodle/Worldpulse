import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

/* ENV VARIABLES */
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

/* IMPORTANT FOR VERCEL PATHS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

/* FORMAT POPULATION */
function formatPopulation(num) {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1) + " Billion";
    }
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1) + " Million";
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(1) + " Thousand";
    }
    return num;
}

/* HOME */
app.get("/", (req, res) => {
    res.render("index.ejs", { country: null });
});

/* SEARCH */
app.post("/search", async (req, res) => {
    const raw = String(req.body.country || "").trim();
    // Restrict to letters/spaces/hyphens/apostrophes — kills SSRF and
    // path-traversal before the value reaches the upstream URL. Also
    // URL-encode just in case.
    if (!/^[A-Za-z\s'-]{1,64}$/.test(raw)) {
        return res.render("index.ejs", { country: null });
    }
    const countryName = raw;

    try {
        const response = await axios.get(
            `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`
        );

        const results = response.data;

        const countryData =
            results.find(c =>
                c.name.common.toLowerCase() === countryName.toLowerCase()
            ) || results[0];

        const capital = countryData.capital[0];
        const currencyCode = Object.keys(countryData.currencies)[0];

        const currencyResponse = await axios.get(
            `https://open.er-api.com/v6/latest/USD`
        );

        const rate = currencyResponse.data.rates[currencyCode];
        const formattedRate = rate.toFixed(2);

        const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${capital}&units=metric&appid=${WEATHER_API_KEY}`
        );

        const weatherData = weatherResponse.data;

        const newsResponse = await axios.get(
            `https://newsapi.org/v2/top-headlines`,
            {
                params: {
                    q: countryData.name.common,
                    apiKey: NEWS_API_KEY,
                    pageSize: 5
                }
            }
        );

        const articles = newsResponse.data.articles;

        res.render("index.ejs", {
            country: countryData,
            formattedPopulation: formatPopulation(countryData.population),
            weather: weatherData,
            exchangeRate: formattedRate,
            currencyCode: currencyCode,
            news: articles
        });

    } catch (error) {
        console.log(error.response?.data || error.message);

        res.render("index.ejs", {
            country: null,
            error: "Failed to fetch data. Check API keys."
        });
    }
});

/* START SERVER LOCALLY (NOT USED BY VERCEL) */
if (process.env.NODE_ENV !== "production") {
    const port = 3000;
    app.listen(port, () => {
        console.log(`Server running locally on port ${port}`);
    });
}

/* EXPORT FOR VERCEL */
export default app;