const https = require("https");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://wiki.fishingplanet.com";

function fetch(urlPath) {
  const fullUrl = urlPath.startsWith("http") ? urlPath : `${BASE_URL}${urlPath}`;
  return new Promise((resolve) => {
    https.get(fullUrl, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetch(res.headers.location));
      }
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", (err) => {
      console.error(`Error fetching ${fullUrl}:`, err.message);
      resolve("");
    });
  });
}

function cleanText(str) {
  if (!str) return "";
  return str
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function toAbsoluteUrl(src) {
  if (!src) return null;
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("/")) return `${BASE_URL}${src}`;
  return src;
}

// 1. Collect all fish URLs
async function getAllFishList() {
  console.log("--- Collecting Fish List ---");
  const mainHtml = await fetch("/wiki/Main_page");
  const pSpeciesMatch = mainHtml.match(/<nav id="p-species"[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/);
  if (!pSpeciesMatch) {
    console.error("p-species not found in main page!");
    return [];
  }
  const catRegex = /<a href="([^"]+)"[^>]*><span>(.*?)<\/span><\/a>/g;
  let cm;
  const categories = [];
  while ((cm = catRegex.exec(pSpeciesMatch[1])) !== null) {
    categories.push({ name: cm[2].trim(), url: cm[1] });
  }

  const fishMap = new Map(); // url -> { name, category, previewImage }

  for (const cat of categories) {
    console.log(`Scanning fish category: ${cat.name}...`);
    const catHtml = await fetch(cat.url);
    const content = catHtml.slice(catHtml.indexOf("mw-parser-output"));

    // Check galleryboxes
    const gReg = /<li[^>]*class="gallerybox"[\s\S]*?<a\s+href="(\/wiki\/[^":]+)"\s+title="([^"]+)"[\s\S]*?<img\s+[^>]*src="([^"]+)"/g;
    let gm;
    let found = 0;
    while ((gm = gReg.exec(content)) !== null) {
      const url = gm[1].split("#")[0];
      const name = gm[2].replace(/\/en$/, "").trim();
      const img = toAbsoluteUrl(gm[3]);
      if (!fishMap.has(url)) {
        fishMap.set(url, { name, category: cat.name, url, previewImage: img });
      }
      found++;
    }

    // Also check standard links if gallerybox didn't catch or for extra lists
    const linkReg = /<li><a href="(\/wiki\/[^":]+)"\s+title="([^"]+)">/g;
    let lm;
    while ((lm = linkReg.exec(content)) !== null) {
      const url = lm[1].split("#")[0];
      if (!url.includes("Special:") && !url.includes("Talk:") && !url.includes("Help:") && !url.includes("Category:")) {
        if (!fishMap.has(url) && !url.endsWith("_family") && !url.endsWith("_Fish")) {
          fishMap.set(url, { name: lm[2].trim(), category: cat.name, url, previewImage: null });
        }
      }
    }
  }

  console.log(`Total unique fish pages identified: ${fishMap.size}`);
  return Array.from(fishMap.values());
}

// 2. Scrape individual fish page
async function scrapeFishPage(fishItem) {
  const html = await fetch(fishItem.url);
  if (!html) return null;

  // Title
  const titleM = html.match(/<h1[^>]*class="firstHeading[^"]*"[^>]*>([\s\S]*?)<\/h1>/);
  const name = titleM ? cleanText(titleM[1]) : fishItem.name;

  // Body content
  const parserIdx = html.indexOf('class="mw-parser-output"');
  const body = parserIdx !== -1 ? html.slice(parserIdx) : html;

  // Fish main image
  // Usually the largest image or first image inside mw-parser-output that isn't icon/flag/credits
  let image = null;
  const imgMatches = body.match(/<img[^>]+src="([^">]+)"[^>]*>/g) || [];
  for (const tag of imgMatches) {
    const srcM = tag.match(/src="([^">]+)"/);
    if (!srcM) continue;
    const src = srcM[1];
    if (src.includes("Credits.png") || src.includes("Hook_icon") || src.includes("poweredby") || src.includes("flag") || src.includes("Coin") || src.includes("Bait")) {
      continue;
    }
    // High-res or main fish image
    image = toAbsoluteUrl(src);
    break;
  }
  if (!image && fishItem.previewImage) {
    image = fishItem.previewImage;
  }

  // Description
  // Take paragraphs in mw-parser-output
  const pMatches = body.match(/<p>([\s\S]*?)<\/p>/g) || [];
  const descParts = [];
  for (const p of pMatches) {
    const text = cleanText(p);
    if (text.length > 25 && !text.startsWith("Other languages:") && !text.startsWith("From Fishing Planet")) {
      descParts.push(text);
    }
  }

  const description = descParts.join("\n\n");

  return {
    name,
    category: fishItem.category,
    url: fishItem.url.startsWith("http") ? fishItem.url : `${BASE_URL}${fishItem.url}`,
    image,
    description
  };
}

// 3. Collect Gear
async function getAllGearList() {
  console.log("--- Collecting Gear & Tackle ---");
  const mainHtml = await fetch("/wiki/Main_page");
  const pTackleMatch = mainHtml.match(/<nav id="p-tackle"[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/);
  if (!pTackleMatch) return [];

  const catRegex = /<a href="([^"]+)"[^>]*><span>(.*?)<\/span><\/a>/g;
  let cm;
  const categories = [];
  while ((cm = catRegex.exec(pTackleMatch[1])) !== null) {
    const title = cm[2].trim();
    if (title !== "Brands" && title !== "Technologies") {
      categories.push({ name: title, url: cm[1] });
    }
  }

  // Find sub-pages for each tackle category
  const subPages = [];
  for (const cat of categories) {
    const catHtml = await fetch(cat.url);
    const content = catHtml.slice(catHtml.indexOf("mw-parser-output"));

    const subRegex = /<a href="(\/wiki\/[^":]+)"[^>]*><b>(.*?)<\/b><\/a>/g;
    let sm;
    let found = 0;
    while ((sm = subRegex.exec(content)) !== null) {
      if (!sm[1].includes("Brands") && !sm[1].includes("Technologies")) {
        subPages.push({ category: cat.name, subCategory: sm[2].trim(), url: sm[1] });
        found++;
      }
    }
    // Also check figure / images in gallery or divs (e.g. Baits)
    const baitRegex = /<figure[^>]*>[\s\S]*?<a href="(\/wiki\/[^":]+)"[^>]*>[\s\S]*?<p><a[^>]*>(.*?)<\/a>/g;
    let bm;
    while ((bm = baitRegex.exec(content)) !== null) {
      subPages.push({ category: cat.name, subCategory: bm[2].trim(), url: bm[1] });
      found++;
    }

    if (found === 0) {
      // The page itself has the items!
      subPages.push({ category: cat.name, subCategory: cat.name, url: cat.url });
    }
  }

  // Deduplicate subPages by URL
  const uniqueSubPages = [];
  const seenUrls = new Set();
  for (const sp of subPages) {
    if (!seenUrls.has(sp.url)) {
      seenUrls.add(sp.url);
      uniqueSubPages.push(sp);
    }
  }

  console.log(`Found ${uniqueSubPages.length} gear sub-pages to parse.`);
  return uniqueSubPages;
}

async function scrapeGearFromPage(subPage) {
  const html = await fetch(subPage.url);
  const items = [];
  if (!html) return items;

  const content = html.slice(html.indexOf("mw-parser-output"));

  // Check if page contains Wikitables (like Baits, Hooks, Lines tables)
  // Or Rods/Reels structured multi-row tables
  const tables = content.match(/<table[\s\S]*?<\/table>/g) || [];

  for (let i = 0; i < tables.length; i++) {
    const t = tables[i];
    // Check type of table
    // Type A: Rods / Reels item table (has brand + name in row 0 td with background color, row 1 image, row 2 description)
    if (t.includes('Part of') || (t.includes('Technologies included') && t.includes('style='))) {
      // Find name: <td colspan="9" ...><a ...>Brand</a> <b>Name</b>
      const nameM = t.match(/<td[^>]*colspan="\d+"[^>]*>([\s\S]*?)<\/td>/);
      const name = nameM ? cleanText(nameM[1]) : null;

      // Find image
      const imgM = t.match(/<img[^>]+src="([^">]+)"/);
      const image = imgM ? toAbsoluteUrl(imgM[1]) : null;

      // Find description: usually in 3rd row or first paragraph
      const trs = t.match(/<tr[\s\S]*?<\/tr>/g) || [];
      let desc = "";
      for (const tr of trs) {
        const text = cleanText(tr);
        if (text.length > 30 && !text.includes("Technologies included") && !text.includes("Length") && !text.includes("Weight")) {
          desc = text;
          break;
        }
      }

      if (name && (image || desc)) {
        items.push({
          name,
          category: subPage.category,
          subCategory: subPage.subCategory,
          url: `${BASE_URL}${subPage.url}`,
          image,
          description: desc
        });
        continue;
      }
    }

    // Type B: Standard wikitable (rows with th/td)
    if (t.includes('class="wikitable"') || t.includes('<th>Description</th>') || t.includes('<th>Bait</th>') || t.includes('<th>Name</th>') || t.includes('<th>Lure</th>')) {
      const trs = t.match(/<tr[\s\S]*?<\/tr>/g) || [];
      for (let r = 1; r < trs.length; r++) {
        const row = trs[r];
        const tds = row.match(/<td[\s\S]*?<\/td>/g) || [];
        if (tds.length >= 2) {
          // One td usually has img and name, one has description
          let img = null;
          const imgM = row.match(/<img[^>]+src="([^">]+)"/);
          if (imgM) img = toAbsoluteUrl(imgM[1]);

          // Find name and desc
          let itemName = "";
          let itemDesc = "";

          // check <b> tags
          const bMatch = row.match(/<b>(.*?)<\/b>/);
          if (bMatch) {
            itemName = cleanText(bMatch[1]);
          }

          for (const td of tds) {
            const txt = cleanText(td);
            if (txt.length > 35 && !itemDesc) {
              itemDesc = txt;
            } else if (!itemName && txt.length > 1 && txt.length < 50 && !txt.startsWith("1") && !txt.startsWith("2")) {
              itemName = txt;
            }
          }

          if (itemName || itemDesc) {
            items.push({
              name: itemName || `${subPage.subCategory} Item`,
              category: subPage.category,
              subCategory: subPage.subCategory,
              url: `${BASE_URL}${subPage.url}`,
              image: img,
              description: itemDesc
            });
          }
        }
      }
    }
  }

  // If no tables yielded items, check galleries or figure blocks
  if (items.length === 0) {
    const figures = content.match(/<figure[\s\S]*?<\/figure>/g) || [];
    for (const f of figures) {
      const imgM = f.match(/<img[^>]+src="([^">]+)"/);
      const capM = f.match(/<figcaption>([\s\S]*?)<\/figcaption>/);
      const titleM = f.match(/title="([^"]+)"/);
      const name = titleM ? titleM[1] : (capM ? cleanText(capM[1]) : subPage.subCategory);
      if (imgM) {
        items.push({
          name: cleanText(name),
          category: subPage.category,
          subCategory: subPage.subCategory,
          url: `${BASE_URL}${subPage.url}`,
          image: toAbsoluteUrl(imgM[1]),
          description: capM ? cleanText(capM[1]) : ""
        });
      }
    }
  }

  return items;
}

module.exports = {
  getAllFishList,
  scrapeFishPage,
  getAllGearList,
  scrapeGearFromPage
};
