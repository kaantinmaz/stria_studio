#!/usr/bin/env python3
"""SEO/GEO crawl audit for a locally running Next.js site.

Usage: python3 scripts/seo-crawl.py http://localhost:3001
Crawls the sitemap + robots + llms.txt and reports, per page:
status, title/desc presence+uniqueness+length, canonical, robots meta,
H1 count, JSON-LD @types, img alt coverage, internal-link 404s.
Exit code 1 if any FAIL-level finding. Stdlib only.
"""

import json
import re
import sys
import urllib.request
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse


def fetch(url: str) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": "seo-crawl/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception as e:
        return 0, str(e)


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.desc = None
        self.canonical = None
        self.robots = None
        self.h1 = []
        self.jsonld = []
        self.imgs = []  # (src, alt-or-None)
        self.links = set()
        self._in = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self._in = "title"
        elif tag == "h1":
            self._in = "h1"
            self.h1.append("")
        elif tag == "meta":
            n = (a.get("name") or "").lower()
            if n == "description":
                self.desc = a.get("content", "")
            elif n == "robots":
                self.robots = a.get("content", "")
        elif tag == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href")
        elif tag == "script" and a.get("type") == "application/ld+json":
            self._in = "ld"
            self.jsonld.append("")
        elif tag == "img":
            self.imgs.append((a.get("src", ""), a.get("alt")))
        elif tag == "a" and a.get("href"):
            self.links.add(a["href"])

    def handle_endtag(self, tag):
        if tag in ("title", "h1", "script"):
            self._in = None

    def handle_data(self, data):
        if self._in == "title":
            self.title += data
        elif self._in == "h1":
            self.h1[-1] += data
        elif self._in == "ld":
            self.jsonld[-1] += data


def ld_types(blobs):
    out = []
    for b in blobs:
        try:
            d = json.loads(b)
        except Exception:
            out.append("!INVALID")
            continue
        for node in d if isinstance(d, list) else [d]:
            g = node.get("@graph") if isinstance(node, dict) else None
            for n in g if isinstance(g, list) else [node]:
                if isinstance(n, dict) and "@type" in n:
                    t = n["@type"]
                    out.append(t if isinstance(t, str) else "/".join(t))
    return out


def main():
    base = sys.argv[1].rstrip("/")
    host = urlparse(base).netloc
    findings = []  # (level, url, msg)

    def note(level, url, msg):
        findings.append((level, url, msg))

    st, robots = fetch(f"{base}/robots.txt")
    print(f"robots.txt [{st}]" + (f" — {len(robots.splitlines())} lines" if st == 200 else ""))
    if st != 200:
        note("FAIL", "/robots.txt", f"status {st}")
    st, llms = fetch(f"{base}/llms.txt")
    print(f"llms.txt   [{st}]" + (f" — {len(llms.splitlines())} lines" if st == 200 else ""))
    if st != 200:
        note("WARN", "/llms.txt", f"status {st}")

    st, sm = fetch(f"{base}/sitemap.xml")
    if st != 200:
        print(f"sitemap.xml [{st}] — ABORT")
        sys.exit(1)
    urls = re.findall(r"<loc>(.*?)</loc>", sm)
    paths = [urlparse(u).path or "/" for u in urls]
    print(f"sitemap.xml [200] — {len(paths)} URLs\n")

    titles, descs = {}, {}
    seen_links = {}
    for p in paths:
        url = base + p
        st, html = fetch(url)
        pg = Page()
        if st == 200:
            pg.feed(html)
        t = pg.title.strip()
        d = (pg.desc or "").strip()
        can_path = (urlparse(pg.canonical or "").path or "/") if pg.canonical else None
        types = ld_types(pg.jsonld)
        noalt = [s for s, a in pg.imgs if not a]
        print(f"[{st}] {p}")
        print(f"  title({len(t)}): {t[:80]}")
        print(f"  desc({len(d)}) canonical={can_path} robots={pg.robots or '-'} h1={len(pg.h1)} ld={','.join(types) or '-'} img={len(pg.imgs)}(noalt={len(noalt)})")

        if st != 200:
            note("FAIL", p, f"status {st}")
            continue
        if not t:
            note("FAIL", p, "missing <title>")
        elif t in titles:
            note("FAIL", p, f"duplicate title with {titles[t]}")
        else:
            titles[t] = p
        if len(t) > 65:
            note("WARN", p, f"title {len(t)} chars")
        if not d:
            note("FAIL", p, "missing meta description")
        elif d in descs:
            note("FAIL", p, f"duplicate description with {descs[d]}")
        else:
            descs[d] = p
        if not (120 <= len(d) <= 170) and d:
            note("WARN", p, f"description {len(d)} chars")
        if can_path != p:
            note("FAIL", p, f"canonical {can_path!r} != {p!r}")
        if len(pg.h1) != 1:
            note("FAIL", p, f"h1 count {len(pg.h1)}")
        if pg.robots and "noindex" in pg.robots:
            note("WARN", p, f"noindex page in sitemap: {pg.robots}")
        if "!INVALID" in types:
            note("FAIL", p, "invalid JSON-LD block")
        if not types:
            note("WARN", p, "no JSON-LD")
        if noalt:
            note("WARN", p, f"{len(noalt)} img without alt")

        for href in pg.links:
            u = urlparse(urljoin(url, href))
            if u.netloc == host and u.path not in seen_links:
                seen_links[u.path] = p

    print("\n-- internal link check --")
    broken = 0
    for path, src in sorted(seen_links.items()):
        st, _ = fetch(base + path)
        if st in (404, 500, 0):
            note("FAIL", path, f"internal link {st} (from {src})")
            broken += 1
    print(f"checked {len(seen_links)} internal paths, {broken} broken")

    print("\n== findings ==")
    fails = 0
    for level, url, msg in findings:
        print(f"{level}  {url}  {msg}")
        fails += level == "FAIL"
    print(f"\n{fails} FAIL, {len(findings) - fails} WARN")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
