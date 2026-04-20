const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
  // Statikus fájlok átmásolása
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/assets/optimized");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  // Dátum filterek
  eleventyConfig.addFilter("dateIso", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toISODate();
  });

  eleventyConfig.addFilter("dateReadable", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
  });

  // Magyar dátum formátum
  eleventyConfig.addFilter("dateHungarian", (dateObj) => {
    return DateTime.fromJSDate(dateObj).setLocale('hu').toFormat("yyyy. MMMM dd.");
  });

  // Német dátum formátum
  eleventyConfig.addFilter("dateGerman", (dateObj) => {
    return DateTime.fromJSDate(dateObj).setLocale('de').toFormat("dd. MMMM yyyy");
  });

  // Angol dátum formátum
  eleventyConfig.addFilter("dateEnglish", (dateObj) => {
    return DateTime.fromJSDate(dateObj).setLocale('en').toFormat("MMMM dd, yyyy");
  });

  // Nyelvi kollekciókat létrehozó function
  eleventyConfig.addCollection("pages_hu", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/hu/*.md");
  });

  eleventyConfig.addCollection("pages_de", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/de/*.md");
  });

  eleventyConfig.addCollection("pages_en", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/en/*.md");
  });

  // Összes oldal kollekcija
  eleventyConfig.addCollection("allPages", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/{hu,de,en}/*.md");
  });

  // Globális adatok hozzáadása
  eleventyConfig.addGlobalData("site", {
    name: "Pedetti Apartman",
    description: {
      hu: "Hangulatos apartman a Balatonnál, vidéki bájjal és modern kényelemmel",
      de: "Gemütliches Apartment am Plattensee mit ländlichem Charme und modernem Komfort",
      en: "Cozy apartment at Lake Balaton with rustic charm and modern comfort"
    },
    url: "https://www.pedettiapartman.hu",
    author: "Major Péter",
    contact: {
      email: "pedettiapartman@gmail.com",
      phone: "+36705527552",
      address: "8230 Balatonfüred, Nádor u. 51"
    }
  });

  // Nyelv észlelő filter
  eleventyConfig.addFilter("getLang", function(inputPath) {
    if (inputPath.includes('/hu/')) return 'hu';
    if (inputPath.includes('/de/')) return 'de';
    if (inputPath.includes('/en/')) return 'en';
    return 'hu'; // alapértelmezett
  });

  // URL létrehozó filter különböző nyelvekhez
  eleventyConfig.addFilter("translateUrl", function(url, targetLang, currentLang) {
    if (!url) return '/';
    
    // Remove current language from URL
    let cleanUrl = url.replace(`/${currentLang}/`, '/').replace(`/${currentLang}`, '');
    if (cleanUrl === '') cleanUrl = '/';
    
    // Add target language
    if (targetLang === 'hu') {
      return cleanUrl === '/' ? '/hu/' : `/hu${cleanUrl}`;
    }
    return cleanUrl === '/' ? `/${targetLang}/` : `/${targetLang}${cleanUrl}`;
  });

  // Responsive image picture tag generator (WebP + fallback)
  eleventyConfig.addFilter("responsiveImage", function(src, alt, sizes = "(max-width: 768px) 100vw, 1200px", className = "") {
    if (!src) return '';
    
    const path = require('path');
    const srcBase = path.basename(src, path.extname(src));
    const webpSrc = `/assets/optimized/${srcBase}.webp`;
    const srcAttr = `src="${src}"`;
    const classAttr = className ? ` class="${className}"` : '';
    
    return `<picture>
  <source srcset="${webpSrc}" type="image/webp">
  <source srcset="${src}" type="image/${path.extname(src).slice(1)}">
  <img ${srcAttr} alt="${alt}" sizes="${sizes}" decoding="async" loading="lazy"${classAttr}>
</picture>`;
  });

  // Shortcode-ok
  eleventyConfig.addShortcode("currentYear", () => {
    return new Date().getFullYear().toString();
  });

  // Markdown library beállítás
  let markdownIt = require("markdown-it");
  let markdownItAttrs = require("markdown-it-attrs");
  
  let markdownLib = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAttrs);
  
  eleventyConfig.setLibrary("md", markdownLib);

  // Watch targets
  eleventyConfig.addWatchTarget("src/assets/");
  eleventyConfig.addWatchTarget("src/**/*.njk");

  // Nyelvi layout-ok beállítása
  eleventyConfig.addGlobalData("layout", "layout.njk");

  // Markdown fájlok front matter alapértelmezett értékei
  eleventyConfig.addGlobalData("permalink", function() {
    return (data) => {
      const lang = data.page.filePathStem.split('/')[1];
      const slug = data.page.fileSlug;
      
      if (slug === 'index') {
        return lang === 'hu' ? '/hu/' : `/${lang}/`;
      }
      
      return lang === 'hu' ? `/hu/${slug}/` : `/${lang}/${slug}/`;
    };
  });

  // Dev server beállítások
  eleventyConfig.setServerOptions({
    port: 8080,
    showAllHosts: true,
  });

  return {
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "../_data"
    }
  };
};