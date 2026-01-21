# Schema.org Structured Data Specification

This document defines the expected schema objects for each page type on goflow.plumbing. Use this as a reference when making changes to prevent regressions.

## Core Principle

**The `WebSite` schema should ONLY appear on the homepage** to send a clear, unambiguous signal to search engines about the site's identity and name. All other pages receive the `Organization` (Plumber) schema plus page-specific schemas.

## Schema Objects by Page Type

### Homepage (`/`)

**Top-level objects in `@graph`:**
| Object | Purpose |
|--------|---------|
| `WebSite` | Site identity, name ("GoFlow Plumbing"), alternate name, SearchAction for sitelinks |
| `Plumber` (Organization) | Business identity, contact info, reviews, service areas |
| `WebPage` | Page metadata |

**Key signals:**
- `WebSite.name` = "GoFlow Plumbing" (primary brand signal)
- `WebSite.alternateName` = "GoFlow"
- `SearchAction` for sitelinks search box

---

### Service Pages (`/water-heater-repair-santa-rosa/`, etc.)

**Top-level objects in `@graph`:**
| Object | Purpose |
|--------|---------|
| `Plumber` (Organization) | Business identity |
| `Service` | The specific service offered |
| `WebPage` | Page metadata (with geo-focus when location specified) |
| `BreadcrumbList` | Navigation context |

**Notes:**
- `Service.provider` references Organization via `@id`
- `WebPage` may include `about`, `contentLocation`, `spatialCoverage` for geo-targeted pages

---

### Region Pages (`/novato-plumbing/`, `/sonoma-county-plumbing/`)

**Top-level objects in `@graph`:**
| Object | Purpose |
|--------|---------|
| `Plumber` (Organization) | Business identity |
| `WebPage` | Page metadata with embedded `Service` as `mainEntity` |
| `BreadcrumbList` | Navigation context |

**Notes:**
- `Service` is embedded within `WebPage.mainEntity`, NOT as a separate top-level object
- `WebPage` includes geo-focus properties (`about`, `contentLocation`, `spatialCoverage`)

---

### Articles Index (`/articles/`)

**Top-level objects in `@graph`:**
| Object | Purpose |
|--------|---------|
| `Plumber` (Organization) | Business identity |
| `CollectionPage` | Page type with `ItemList` of articles as `mainEntity` |

---

### Individual Article Pages (`/articles/[slug]/`)

**Top-level objects in `@graph`:**
| Object | Purpose |
|--------|---------|
| `Plumber` (Organization) | Business identity |
| `Article` | Article content, author, dates |
| `BreadcrumbList` | Navigation context |

---

### FAQ Page (`/faqs/`)

**Top-level objects in `@graph`:**
| Object | Purpose |
|--------|---------|
| `Plumber` (Organization) | Business identity |
| `FAQPage` | Q&A pairs for rich results |

---

### Contact Page (`/contact-us/`)

**Top-level objects in `@graph`:**
| Object | Purpose |
|--------|---------|
| `Plumber` (Organization) | Business identity |
| `ContactPage` | Contact information |

---

### About Page (`/about-us/`)

**Top-level objects in `@graph`:**
| Object | Purpose |
|--------|---------|
| `Plumber` (Organization) | Business identity |
| `AboutPage` | Company information |

---

### Team Page (`/team/`)

**Top-level objects in `@graph`:**
| Object | Purpose |
|--------|---------|
| `Plumber` (Organization) | Business identity |
| `AboutPage` | Team information with employee details |

---

## Validation Checklist

When making schema changes, verify:

1. [ ] Homepage has `WebSite` schema
2. [ ] Non-homepage pages do NOT have `WebSite` schema
3. [ ] All pages have `Plumber` (Organization) schema
4. [ ] Service pages have `Service` + `WebPage` + `BreadcrumbList`
5. [ ] Region pages have `WebPage` (with embedded Service) + `BreadcrumbList`
6. [ ] Article pages have `Article` + `BreadcrumbList`
7. [ ] No duplicate top-level objects of the same type

## Testing

After building, validate schema output:

```bash
# Check for WebSite schema presence
grep -o '"@type":"WebSite"' dist/index.html | wc -l  # Should be 1
grep -o '"@type":"WebSite"' dist/about-us/index.html | wc -l  # Should be 0

# List all top-level @type values on a page
grep -o '"@type":"[^"]*"' dist/[page]/index.html | sort | uniq
```

## Schema.org Validator

Use https://validator.schema.org/ to validate pages and ensure the expected objects are recognized.
