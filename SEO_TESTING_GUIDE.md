# SEO Testing Guide - Kako testirati optimizacije

## 1. Validacija HTML i Meta tagova

### Google's Rich Results Test
1. Idi na: https://search.google.com/test/rich-results
2. Unesi: https://tenderatlas.hr
3. Provjeri:
   - ✅ Organization schema
   - ✅ WebSite schema  
   - ✅ WebApplication schema
   - ❌ Nema grešaka

### Schema.org Validator
1. Idi na: https://validator.schema.org/
2. Unesi URL ili paste HTML
3. Provjeri sve tri JSON-LD bloka

### Facebook Sharing Debugger
1. Idi na: https://developers.facebook.com/tools/debug/
2. Unesi: https://tenderatlas.hr
3. Klikni "Scrape Again"
4. Provjeri:
   - og:title - "Analitika Javne Nabave i Vizualizacija..."
   - og:description
   - og:image prikazana
   - og:locale = hr_HR

### Twitter Card Validator
1. Idi na: https://cards-dev.twitter.com/validator
2. Unesi: https://tenderatlas.hr
3. Provjeri preview kako će Twitter prikazati

## 2. SEO On-Page Check

### Lighthouse Audit (Chrome DevTools)
1. Otvori https://tenderatlas.hr u Chrome
2. F12 → Lighthouse tab
3. Odaberi "SEO" + "Performance" + "Accessibility"
4. Run audit
5. Target scores:
   - SEO: 95+
   - Performance: 90+
   - Accessibility: 90+

### Meta tagovi - Ručna provjera
Desni klik → View Page Source, provjeri:
```html
✅ <title>Analitika Javne Nabave Hrvatska...
✅ <meta name="description" content="Platforma za analitiku...
✅ <meta name="keywords" content="javna nabava hrvatska...
✅ <meta name="language" content="Croatian">
✅ <meta name="geo.region" content="HR">
✅ <link rel="canonical" href="https://tenderatlas.hr/">
```

### Heading struktura
Provjeri u DevTools:
```
H1: 1x - "Analitika i Vizualizacija Javne Nabave u Hrvatskoj"
H2: 3-5x - svi s ključnim riječima
H3: 6-8x - dodatne sekcije
```

## 3. Keyword Density Check

### Manual Check
Otvori stranicu, Ctrl+F:
- "javna nabava" → treba biti 10-15 puta
- "javni natječaji" → treba biti 8-12 puta
- "analitika" → treba biti 6-10 puta
- "vizualizacija" → treba biti 5-8 puta

### Online Tool
1. Idi na: https://www.seocentro.com/tools/search-engines/keyword-density.html
2. Unesi URL: https://tenderatlas.hr
3. Provjeri density:
   - Glavni keywords: 1-3%
   - Sekundarni: 0.5-1.5%
   - NIKAD preko 5% (keyword stuffing)

## 4. Mobile-Friendly Test

### Google Mobile-Friendly Test
1. https://search.google.com/test/mobile-friendly
2. Unesi: https://tenderatlas.hr
3. Mora biti ✅ "Page is mobile friendly"

### Responsive Design Test
1. F12 → Toggle device toolbar (Ctrl+Shift+M)
2. Testiraj:
   - iPhone 12/13/14
   - Samsung Galaxy S21
   - iPad
   - Desktop (1920x1080)
3. Provjeri:
   - Sav tekst čitljiv
   - Buttoni klikabilni
   - Nema horizontal scrolla

## 5. Page Speed Test

### Google PageSpeed Insights
1. https://pagespeed.web.dev/
2. Unesi: https://tenderatlas.hr
3. Provjeri OBJE verzije:
   - Mobile (target: 85+)
   - Desktop (target: 95+)
4. Fokusiraj se na:
   - Largest Contentful Paint (LCP) < 2.5s
   - First Input Delay (FID) < 100ms
   - Cumulative Layout Shift (CLS) < 0.1

### GTmetrix
1. https://gtmetrix.com/
2. Test location: Europe - Frankfurt
3. Target:
   - Grade: A
   - Performance: 90%+
   - Structure: 95%+

## 6. Sitemap i Robots Test

### Sitemap provjera
1. Otvori: https://tenderatlas.hr/sitemap.xml
2. Provjeri:
   - Valid XML format
   - Svi linkovi funkcioniraju
   - Datumi su ažurirani (2026-01-06)
   - Priority values su logični

### Robots.txt provjera
1. Otvori: https://tenderatlas.hr/robots.txt
2. Provjeri:
   - User-agent: *
   - Allow: /
   - Sitemap URL točan

### Google's Robots Testing Tool
1. Google Search Console → robots.txt Tester
2. Testiraj sve ključne URL-ove
3. Sve trebaju biti ALLOWED

## 7. Structured Data Test

### Rich Results Test (ponovno)
1. https://search.google.com/test/rich-results
2. Unesi URL
3. Provjeri WARNINGS i ERRORS
4. Želimo 0 errors, minimalno warnings

### JSON-LD Validator
1. https://jsonld.com/json-ld-validator/
2. Copy-paste svaki JSON-LD blok
3. Provjeri syntax

## 8. Link Checking

### Dead Link Checker
1. https://www.deadlinkchecker.com/
2. Unesi: https://tenderatlas.hr
3. Provjeri da nema broken links
4. Ispravi sve 404 greške

### Internal Links
Provjeri da svi anchor linkovi rade:
- #demo-alata
- #pretplate
- #kontakt
- #contactFormSection

## 9. Content Quality Check

### Copyscape (Plagiarism)
1. https://www.copyscape.com/
2. Unesi URL
3. Potvrdi da je sadržaj originalan

### Readability Test
1. https://www.webfx.com/tools/read-able/
2. Unesi tekst sa stranice
3. Target: Grade level 8-10 (jednostavan za čitanje)

### Grammar Check
1. Grammarly ili LanguageTool
2. Kopiraj hrvatski tekst
3. Provjeri gramatiku i pravopis

## 10. Google Search Console Setup

### Nakon deploya:

1. **Dodaj property**
   - Idi na: https://search.google.com/search-console
   - Add property: https://tenderatlas.hr
   - Verify ownership (HTML tag metoda preporučena)

2. **Submit sitemap**
   - Sitemaps → Add sitemap
   - Unesi: sitemap.xml
   - Submit

3. **URL Inspection**
   - Test live URL: https://tenderatlas.hr
   - Request indexing

4. **Provjeri nakon 24-48h**
   - Overview → Coverage
   - Performance → Queries
   - Enhancements → Core Web Vitals

## 11. Bing Webmaster Tools

1. https://www.bing.com/webmasters
2. Add site: https://tenderatlas.hr
3. Verify ownership
4. Submit sitemap: https://tenderatlas.hr/sitemap.xml
5. Submit URL: https://tenderatlas.hr

## 12. Search Appearance Test

### Pregled kako će izgledati u Google rezultatima:

**Desktop SERP preview:**
```
Analitika Javne Nabave Hrvatska | Podaci Javnih Natj...
https://tenderatlas.hr
Platforma za analitiku javne nabave u Hrvatskoj. Vizualizacija 
podataka javnih natječaja, tržišta javne nabave i javnih naručitelja. 
Pregled ugovora...
```

**Mobile SERP:**
```
Analitika Javne Nabave 
Hrvatska | Podaci...
tenderatlas.hr
Platforma za analitiku javne 
nabave u Hrvatskoj. Vizualizacija 
podataka javnih natječaja...
```

### Provjeri:
- ✅ Title nije predugi (< 60 znakova)
- ✅ Description nije preduga (< 160 znakova)  
- ✅ URL je clean (https://tenderatlas.hr)
- ✅ Ključne riječi su u title i description

## 13. Competitive Analysis

### Provjeri konkurenciju za ključne riječi:

1. **Google search:**
   - "javna nabava hrvatska"
   - "analitika javne nabave"
   - "javni natječaji hrvatska"

2. **Zabilježi top 3:**
   - URL
   - Title tag
   - Meta description
   - Da/Ne structured data

3. **Usporedi:**
   - Tvoj sadržaj vs konkurencija
   - Duljina sadržaja
   - Kvaliteta vizualizacija

## 14. Analytics Setup

### Google Analytics 4

1. Kreiraj GA4 property
2. Dodaj tracking kod:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

3. Set up events:
   - CTA button clicks
   - Form submissions
   - Demo views
   - Time on page

### Tracking za pratiti:

**Bounce rate goals:**
- < 70% = dobro
- < 60% = odlično
- < 50% = izvrsno

**Session duration:**
- > 1min = dobro
- > 2min = odlično
- > 3min = izvrsno

**Pages per session:**
- > 1.5 = dobro
- > 2.0 = odlično

## 15. Final Checklist

Pre-launch provjera:

```
□ Title tag optimiziran
□ Meta description optimiziran
□ Meta keywords dodan
□ H1 unikatan i s ključnim riječima
□ H2/H3 struktura logična
□ Alt tekstovi na svim slikama (DODAJ!)
□ Internal linkovi rade
□ Canonical tag postavljen
□ Robots.txt dozvoljava crawling
□ Sitemap.xml validan i dostupan
□ Structured data bez grešaka
□ Mobile responsive
□ Page speed > 80
□ HTTPS enabled
□ Analytics postavljen
```

## 16. Post-Launch Monitoring

### Prvi tjedan:
- Dnevno provjeri Google Search Console
- Prati indexing status
- Provjeri Core Web Vitals
- Gledaj Analytics za bounce rate

### Prvi mjesec:
- Tjedni keyword ranking check
- Analiziraj GSC Performance report
- Prati organic traffic rast
- Optimiziraj based on data

### Tracking spreadsheet:

```
Datum | Keyword | Position | Impressions | Clicks | CTR
------|---------|----------|-------------|--------|----
06.01 | javna nabava hrvatska | -- | 0 | 0 | -
13.01 | javna nabava hrvatska | -- | 0 | 0 | -
...
```

---

## 🎯 Success Metrics (3 mjeseca)

**Minimalni cilj:**
- 100+ organic sessions/mjesec
- 3+ keywords u top 20
- 1+ keyword u top 10

**Realni cilj:**
- 500+ organic sessions/mjesec
- 5+ keywords u top 10
- 2+ keywords u top 5

**Optimistični cilj:**
- 1000+ organic sessions/mjesec
- 8+ keywords u top 5
- 3+ keywords u top 3
- Featured snippets za 2+ queries

---

**Napomena:** SEO nije instant. Prva poboljšanja ćete vidjeti nakon 2-4 tjedna, značajne rezultate nakon 2-3 mjeseca!
