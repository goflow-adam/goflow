# Customer-Centric Navigation Restructure

## Current Structure (Company-Centric)

```
Primary Nav:
├── Services (dropdown)
│   ├── Water Heater Install
│   ├── Water Heater Repair
│   ├── Drain Cleaning
│   ├── Leak Detection
│   └── ...
├── Regions (dropdown)
│   ├── All Marin County
│   ├── San Rafael
│   ├── Novato
│   ├── All Sonoma County
│   ├── Santa Rosa
│   └── ...
├── Articles (dropdown)
├── Contact Us
└── FAQs
```

**Problem**: Asks customers to navigate *your* organization, not *their* problem.

---

## Proposed Structure (Customer-Centric)

### Primary Navigation (Always Visible)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]     Your Problem?  ▼    Near Me  ▼    Us  ▼    📞 (707) 200-8350   │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 1. **Your Problem?** (Problem-First Dropdown)

Organized by symptom/situation, not service category:

```
Your Problem?
├── 🚨 EMERGENCY
│   ├── Water flooding/spraying
│   ├── Sewer backing up into home
│   ├── Gas smell near water heater
│   └── No water at all
│
├── 💧 WATER HEATER ISSUES
│   ├── No hot water
│   ├── Not enough hot water
│   ├── Water heater leaking
│   ├── Strange noises from water heater
│   └── Need a new water heater
│
├── 🚿 DRAIN PROBLEMS
│   ├── Drain won't drain / clogged
│   ├── Drain is slow
│   ├── Multiple drains backing up
│   ├── Bad smell from drains
│   └── Gurgling sounds
│
├── 💦 LEAKS & PIPES
│   ├── Visible leak
│   ├── Water bill suddenly high
│   ├── Wet spot on wall/ceiling/floor
│   ├── Water pressure problems
│   └── Pipe damage
│
└── 📋 PLANNED WORK
    ├── Replace water heater
    ├── Install new fixtures
    ├── Repiping
    └── Maintenance / inspection
```

**Mapping**: Each item links to existing service pages, but the *label* is customer language.

#### 2. **Near Me** (Location Dropdown)

Simplified, auto-detect friendly:

```
Near Me
├── 📍 Detect My Location (if browser allows)
│
├── MARIN COUNTY
│   ├── San Rafael
│   ├── Novato
│   ├── Mill Valley
│   └── All Marin County →
│
└── SONOMA COUNTY
    ├── Santa Rosa
    ├── Petaluma
    ├── Healdsburg
    ├── Sonoma
    └── All Sonoma County →
```

#### 3. **Us** (Company Info Dropdown)

All company/brand information in one place:

```
Us
├── About GOFLOW
├── Our Team
├── Articles & Tips
├── FAQs
└── Contact Us
```

**Mapping**:
- About GOFLOW → `/about-us/`
- Our Team → `/team/`
- Articles & Tips → `/articles/`
- FAQs → `/faqs/`
- Contact Us → `/contact-us/`

#### 4. **Phone Number** (Always Visible CTA)

`📞 (707) 200-8350` — sticky on mobile, prominent on desktop.

---

### Secondary Navigation (Footer)

Full lists for SEO and legal info:

```
Footer Nav:
├── All Services
│   └── (full service list for SEO)
│
├── Service Areas
│   └── (full region list for SEO)
│
├── Company
│   ├── About GOFLOW
│   ├── Our Team
│   ├── Articles & Tips
│   ├── FAQs
│   └── Contact Us
│
└── Legal
    ├── Privacy Policy
    └── Terms of Service
```

---

## Homepage Restructure Concept

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│     "What's your plumbing problem?"                                         │
│                                                                             │
│     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│     │  No Hot      │  │  Clogged     │  │  Leak or     │                   │
│     │  Water       │  │  Drain       │  │  Flooding    │                   │
│     └──────────────┘  └──────────────┘  └──────────────┘                   │
│                                                                             │
│     ┌──────────────────────────────────────────────────┐                   │
│     │  Something else? Tell us what's happening →      │                   │
│     └──────────────────────────────────────────────────┘                   │
│                                                                             │
│     ────────────────────────────────────────────────────                   │
│                                                                             │
│     ✓ Serving Sonoma & Marin County                                        │
│     ✓ Same-day service available                                           │
│     ✓ 3rd generation family plumbers                                       │
│                                                                             │
│     📞 (707) 200-8350  —  Call now, we're ready                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Below the Fold

1. **"Here's what happens when you call"** — Simple 3-step process
2. **"Real customers, real problems solved"** — Reviews with problem context
3. **"We're in your neighborhood"** — Map or location cards
4. **"Questions before you call?"** — Top 3-4 FAQs inline

---

## Content Mapping: Old → New

| Old Location | New Primary Nav | New Footer |
|--------------|-----------------|------------|
| Services dropdown | "Your Problem?" (by symptom) | "All Services" |
| Regions dropdown | "Near Me" | "Service Areas" |
| Articles | "Us > Articles & Tips" | "Company > Articles" |
| Contact Us | "Us > Contact Us" + Phone CTA | "Company > Contact Us" |
| FAQs | "Us > FAQs" | "Company > FAQs" |
| Team | "Us > Our Team" | "Company > Our Team" |
| Privacy | — | "Legal" |

---

## New Pages Needed (Phase 2+)

1. **Symptom landing pages** (optional)
   - `/no-hot-water/` → funnels to water heater services
   - `/clogged-drain/` → funnels to drain cleaning
   - `/water-leak/` → funnels to leak detection

2. **`/what-to-expect/`** (future, when ready for pricing discussion)
   - Addresses cost concerns
   - Explains estimate process
   - Builds trust before they call

---

## Mobile Considerations

```
Mobile Nav (hamburger expands to):
┌─────────────────────────┐
│  Your Problem?        ▼ │
│  Near Me              ▼ │
│  Us                   ▼ │
│  ─────────────────────  │
│  📞 Call (707) 200-8350 │
└─────────────────────────┘
```

**Sticky mobile CTA**: Phone button always visible at bottom of screen.

---

## Implementation Phases

### Phase 1: Navigation Restructure
- Update `Navigation.astro` with new structure
- Keep all existing pages/URLs (SEO preservation)
- No new pages required

### Phase 2: Homepage Redesign
- Problem-first hero section
- Simplified above-the-fold experience
- Process/trust indicators

### Phase 3: Symptom Landing Pages (Optional)
- Create symptom-based entry points
- Internal linking to existing service pages
- Additional SEO opportunities

---

## Questions to Decide

1. **"Your Problem?" label** — alternatives:
   - "I Need Help With..."
   - "My Problem"
   - "Fix My..."
   - Keep it as "Your Problem?"

2. **"Us" label** — alternatives:
   - "About"
   - "GOFLOW"
   - "Company"
   - Keep it as "Us"

3. **Symptom pages** — worth the effort now or Phase 2?

4. **Location detection** — implement browser geolocation?
