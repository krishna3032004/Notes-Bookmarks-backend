import fetch from "node-fetch";
import * as cheerio from "cheerio";
// import { Cheerio } from "cheerio";

const fetchTitleFromURL = async (url) => {
  try {
    const response = await fetch(url, { timeout: 5000 });
    const html = await response.text();

    const $ = cheerio.load(html);
    const title = $("title").text();

    return title || "";
  } catch (err) {
    return "";
  }
};

export default fetchTitleFromURL;
