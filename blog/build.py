"""
BLOG BUILD SKRIPTA — TenderAtlas
================================
Skenira /blog/ subfoldere, čita sadrzaj.txt + slike,
generira HTML blog postove i ažurira posts.json.

Pokreni iz root foldera:
  python blog/build.py

FORMAT sadrzaj.txt:
  NASLOV: Naslov posta
  DATUM: 2026-02-20
  KATEGORIJA: Analiza
  OPIS: Kratki opis (150-160 znakova)
  HERO: hero.png
  ---
  Tekst posta...
  ## Podnaslov
  ### Pod-podnaslov
  - Lista
  > Citat
  **Bold tekst**
  [SLIKA: ime.png | Opis ispod slike]
"""

import os
import re
import json
import shutil
from datetime import datetime
from pathlib import Path

BLOG_DIR = Path(__file__).parent
ROOT_DIR = BLOG_DIR.parent
POSTS_JSON = BLOG_DIR / "posts.json"
BASE_URL = "https://tenderatlas.hr"

MONTHS_HR = [
    "siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja",
    "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"
]

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}


def format_date_hr(date_str):
    """2026-02-20 -> '20. veljače 2026.'"""
    d = datetime.strptime(date_str.strip(), "%Y-%m-%d")
    return f"{d.day}. {MONTHS_HR[d.month - 1]} {d.year}."


def parse_metadata(header_text):
    """Parse NASLOV:, DATUM:, etc. from header."""
    meta = {}
    for line in header_text.strip().splitlines():
        line = line.strip()
        if ":" in line:
            key, val = line.split(":", 1)
            meta[key.strip().upper()] = val.strip()
    return meta


def txt_to_html_content(body_text, folder_name):
    """Convert simple txt markup to HTML."""
    lines = body_text.strip().splitlines()
    html_parts = []
    in_list = False
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Empty line — close list if open, skip
        if not stripped:
            if in_list:
                html_parts.append("        </ul>")
                in_list = False
            i += 1
            continue

        # Image: [SLIKA: file.png | Caption text]
        img_match = re.match(r'\[SLIKA:\s*(.+?)\s*(?:\|\s*(.+?))?\s*\]', stripped)
        if img_match:
            if in_list:
                html_parts.append("        </ul>")
                in_list = False
            img_file = img_match.group(1)
            caption = img_match.group(2) or ""
            html_parts.append('        <figure class="blog-figure">')
            html_parts.append(f'          <img src="{folder_name}/{img_file}" alt="{caption}" loading="lazy">')
            if caption:
                html_parts.append(f"          <figcaption>{caption}</figcaption>")
            html_parts.append("        </figure>")
            i += 1
            continue

        # H2: ## Heading
        if stripped.startswith("## ") and not stripped.startswith("### "):
            if in_list:
                html_parts.append("        </ul>")
                in_list = False
            text = inline_format(stripped[3:].strip())
            html_parts.append(f"        <h2>{text}</h2>")
            i += 1
            continue

        # H3: ### Heading
        if stripped.startswith("### "):
            if in_list:
                html_parts.append("        </ul>")
                in_list = False
            text = inline_format(stripped[4:].strip())
            html_parts.append(f"        <h3>{text}</h3>")
            i += 1
            continue

        # Blockquote: > text
        if stripped.startswith("> "):
            if in_list:
                html_parts.append("        </ul>")
                in_list = False
            # Collect multi-line blockquote
            quote_lines = []
            while i < len(lines) and lines[i].strip().startswith("> "):
                quote_lines.append(lines[i].strip()[2:])
                i += 1
            quote_text = inline_format(" ".join(quote_lines))
            html_parts.append("        <blockquote>")
            html_parts.append(f"          {quote_text}")
            html_parts.append("        </blockquote>")
            continue

        # List item: - text
        if stripped.startswith("- "):
            if not in_list:
                html_parts.append("        <ul>")
                in_list = True
            text = inline_format(stripped[2:].strip())
            html_parts.append(f"          <li>{text}</li>")
            i += 1
            continue

        # Regular paragraph
        if in_list:
            html_parts.append("        </ul>")
            in_list = False

        # Collect consecutive non-empty, non-special lines as one paragraph
        para_lines = []
        while i < len(lines):
            l = lines[i].strip()
            if not l or l.startswith("## ") or l.startswith("### ") or l.startswith("> ") or l.startswith("- ") or re.match(r'\[SLIKA:', l):
                break
            para_lines.append(l)
            i += 1
        para_text = inline_format(" ".join(para_lines))
        html_parts.append(f"        <p>{para_text}</p>")
        continue

    if in_list:
        html_parts.append("        </ul>")

    return "\n".join(html_parts)


def inline_format(text):
    """Handle **bold**, *italic*, [link](url)."""
    # Bold: **text**
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    # Italic: *text*
    text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
    # Links: [text](url)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)
    return text


def generate_html(meta, content_html, folder_name):
    """Generate full blog post HTML."""
    title = meta.get("NASLOV", "Blog Post")
    desc = meta.get("OPIS", "")
    date = meta.get("DATUM", "2026-01-01")
    tag = meta.get("KATEGORIJA", "Članak")
    hero = meta.get("HERO", "")
    slug = folder_name
    date_hr = format_date_hr(date)

    hero_section = ""
    hero_img_url = ""
    if hero:
        hero_path = f"{folder_name}/{hero}"
        hero_img_url = f"{BASE_URL}/blog/{hero_path}"
        hero_section = f'''
    <div class="blog-post-hero">
      <img src="{hero_path}" alt="{title}">
    </div>
'''
    else:
        hero_img_url = f"{BASE_URL}/img.png"

    return f'''<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="apple-touch-icon" href="../img.png">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title} | TenderAtlas Blog</title>
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/blog.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">

  <meta name="description" content="{desc}">
  <link rel="canonical" href="{BASE_URL}/blog/{slug}.html">
  <meta name="robots" content="index,follow">

  <meta property="og:site_name" content="TenderAtlas Blog">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{BASE_URL}/blog/{slug}.html">
  <meta property="og:image" content="{hero_img_url}">
  <meta property="og:locale" content="hr_HR">
  <meta property="article:published_time" content="{date}">
  <meta property="article:author" content="TenderAtlas">
  <meta name="twitter:card" content="summary_large_image">

  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "{title}",
    "description": "{desc}",
    "image": "{hero_img_url}",
    "datePublished": "{date}",
    "dateModified": "{date}",
    "author": {{
      "@type": "Organization",
      "name": "TenderAtlas",
      "url": "{BASE_URL}/"
    }},
    "publisher": {{
      "@type": "Organization",
      "name": "TenderAtlas",
      "url": "{BASE_URL}/",
      "logo": "{BASE_URL}/img.png"
    }},
    "mainEntityOfPage": {{
      "@type": "WebPage",
      "@id": "{BASE_URL}/blog/{slug}.html"
    }},
    "inLanguage": "hr"
  }}
  </script>
</head>
<body class="blog-page">

  <div class="scroll-progress" id="scrollProgress"></div>

  <nav class="fixed-nav">
    <div class="nav-container">
      <a href="../" class="nav-logo" aria-label="TenderAtlas">
        <svg viewBox="0 0 1600 500" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
          <defs>
            <linearGradient id="metalBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4a90c4"/>
              <stop offset="40%" stop-color="#6bb5e0"/>
              <stop offset="60%" stop-color="#4a90c4"/>
              <stop offset="100%" stop-color="#b5ffe1"/>
            </linearGradient>
          </defs>
          <polygon points="300,150 390,200 390,300 300,350 210,300 210,200" fill="none" stroke="url(#metalBlue)" stroke-width="18" stroke-linejoin="round"/>
          <text x="450" y="305" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="160" fill="url(#metalBlue)" letter-spacing="1">
            <tspan font-weight="700">Tender</tspan><tspan font-weight="500">Atlas</tspan>
          </text>
        </svg>
      </a>
      <button class="hamburger" id="hamburger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      <div class="nav-links" id="navLinks">
        <a href="../#demo-alata" class="nav-link">Naše rješenje</a>
        <a href="../#pretplate" class="nav-link">Moduli i pretplate</a>
        <a href="./" class="nav-link active">Blog</a>
        <a href="../#kontakt" class="nav-link">Kontaktiraj nas</a>
      </div>
      <div class="nav-right">
        <a href="https://app.tenderatlas.hr" class="user-login-link">
          <svg class="user-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M6 21C6 17.134 8.686 14 12 14C15.314 14 18 17.134 18 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <span>Prijava</span>
        </a>
      </div>
    </div>
  </nav>

  <article class="blog-post">
{hero_section}
    <div class="blog-post-wrap">
      <nav class="blog-breadcrumb" aria-label="Breadcrumb">
        <a href="../">Početna</a> <span>/</span>
        <a href="./">Blog</a> <span>/</span>
        <span>{title}</span>
      </nav>

      <header class="blog-post-header">
        <div class="blog-card-meta">
          <time datetime="{date}">{date_hr}</time>
          <span class="blog-tag">{tag}</span>
        </div>
        <h1>{title}</h1>
      </header>

      <div class="blog-content">
{content_html}
      </div>

      <div class="blog-cta">
        <h3>Želite dublje analize javne nabave?</h3>
        <p>Isprobajte TenderAtlas platformu besplatno.</p>
        <a href="../#kontakt" class="blog-cta-btn">Isprobaj besplatno</a>
      </div>

      <div class="blog-back">
        <a href="./">← Svi članci</a>
      </div>
    </div>
  </article>

  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-left">
        <svg viewBox="195 140 1250 225" xmlns="http://www.w3.org/2000/svg" class="footer-logo">
          <defs><linearGradient id="metalBlueFooter" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4a90c4"/><stop offset="40%" stop-color="#6bb5e0"/><stop offset="60%" stop-color="#4a90c4"/><stop offset="100%" stop-color="#b5ffe1"/></linearGradient></defs>
          <polygon points="300,150 390,200 390,300 300,350 210,300 210,200" fill="none" stroke="url(#metalBlueFooter)" stroke-width="18" stroke-linejoin="round"/>
          <text x="450" y="305" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="160" fill="url(#metalBlueFooter)" letter-spacing="1"><tspan font-weight="700">Tender</tspan><tspan font-weight="500">Atlas</tspan></text>
        </svg>
      </div>
      <div class="footer-center">
        <a href="../#demo-alata">Naše rješenje</a>
        <a href="../#pretplate">Moduli i pretplate</a>
        <a href="../#kontakt">Kontakt</a>
        <a href="./">Blog</a>
        <a href="../opci-uvjeti.html">Opći Uvjeti Korištenja</a>
        <a href="mailto:info@kti.hr">info@kti.hr</a>
      </div>
    </div>
    <div class="footer-bottom"><p>&copy; 2026 Sva prava zadržana</p></div>
  </footer>

  <script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js"></script>
  <script src="../js/main.js"></script>
</body>
</html>
'''


def find_first_image(folder_path):
    """Find the first image in folder for posts.json thumbnail."""
    for f in sorted(folder_path.iterdir()):
        if f.suffix.lower() in IMAGE_EXTENSIONS:
            return f.name
    return ""


def build_blog():
    """Main build function."""
    skip_dirs = {"img"}
    posts = []

    # Load existing posts.json to preserve manually added posts (like capex)
    existing_posts = []
    if POSTS_JSON.exists():
        try:
            existing_posts = json.loads(POSTS_JSON.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, ValueError):
            existing_posts = []

    # Keep track of manually managed posts (those without a subfolder)
    manual_posts = []
    generated_slugs = set()

    # Scan subfolders
    for item in sorted(BLOG_DIR.iterdir()):
        if not item.is_dir():
            continue
        if item.name.startswith("_") or item.name.startswith(".") or item.name in skip_dirs:
            continue

        txt_file = item / "sadrzaj.txt"
        if not txt_file.exists():
            continue

        folder_name = item.name
        slug = folder_name
        generated_slugs.add(slug)

        print(f"  📝 Gradim: {folder_name}/")

        # Read and parse txt
        raw = txt_file.read_text(encoding="utf-8")

        # Split header and body at ---
        if "---" in raw:
            header_part, body_part = raw.split("---", 1)
        else:
            print(f"  ⚠️  {folder_name}/sadrzaj.txt nema --- separator, preskačem.")
            continue

        meta = parse_metadata(header_part)

        if not meta.get("NASLOV"):
            print(f"  ⚠️  {folder_name}/sadrzaj.txt nema NASLOV:, preskačem.")
            continue

        # Convert body to HTML
        content_html = txt_to_html_content(body_part, folder_name)

        # Generate HTML file
        html = generate_html(meta, content_html, folder_name)
        output_file = BLOG_DIR / f"{slug}.html"
        output_file.write_text(html, encoding="utf-8")
        print(f"  ✅ Generirano: {slug}.html")

        # Find hero or first image for thumbnail
        hero = meta.get("HERO", "")
        if hero:
            thumb = f"{folder_name}/{hero}"
        else:
            first_img = find_first_image(item)
            thumb = f"{folder_name}/{first_img}" if first_img else "../img.png"

        # Add to posts list
        posts.append({
            "file": f"{slug}.html",
            "title": meta["NASLOV"],
            "description": meta.get("OPIS", ""),
            "date": meta.get("DATUM", "2026-01-01"),
            "image": thumb,
            "tag": meta.get("KATEGORIJA", "Članak")
        })

    # Keep manually added posts that don't have a subfolder
    for ep in existing_posts:
        ep_slug = ep.get("file", "").replace(".html", "")
        if ep_slug not in generated_slugs:
            manual_posts.append(ep)

    # Merge: generated + manual, sorted by date descending
    all_posts = posts + manual_posts
    all_posts.sort(key=lambda p: p.get("date", ""), reverse=True)

    # Write posts.json
    POSTS_JSON.write_text(
        json.dumps(all_posts, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"\n  📋 posts.json ažuriran ({len(all_posts)} postova)")


if __name__ == "__main__":
    print("\n🔨 TenderAtlas Blog Build\n" + "=" * 35)
    build_blog()
    print("\n✅ Gotovo!\n")
