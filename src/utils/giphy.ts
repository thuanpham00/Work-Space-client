import { GiphyFetch } from "@giphy/js-fetch-api";

export const gf = new GiphyFetch(
  import.meta.env.VITE_GIPHY_API_KEY
);