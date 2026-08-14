import json
from datetime import datetime, timezone
import re

DATASET_FILE = "strongman_contests_dataset.json"
RANKED_WOMEN_FILE = "strongwoman_contests_ranked_last_5_years.json"

CURRENT_DATE = datetime.now(timezone.utc)

def classify_division(show_name):
    name = (show_name or "").lower()
    is_weight_or_masters = (
        "u64" in name or "u73" in name or "u82" in name or "105" in name or "u105" in name or
        "u90" in name or "u80" in name or "masters" in name or "novice" in name or "inspirational" in name
    )
    is_wsm_heat = ("wsm" in name and ("group" in name or "heat" in name)) or "wsm group" in name
    is_single_lift = (
        "world deadlift" in name or "deadlift championship" in name or "deadlift championchip" in name or
        "world log lift" in name or "log lift championship" in name or "log lift championchip" in name or
        "log lift world championship" in name
    )
    if is_weight_or_masters or is_wsm_heat or is_single_lift:
        return "OMITTED"
    is_women = "women" in name or "woman" in name or "wsw" in name or "female" in name
    return "women" if is_women else "men"

def get_recency_multiplier(details_str, contest_name):
    date_match = re.search(r'(\d{4})-(\d{2})-(\d{2})', details_str or "")
    if date_match:
        comp_date = datetime(int(date_match.group(1)), int(date_match.group(2)), int(date_match.group(3)), tzinfo=timezone.utc)
    else:
        year_match = re.search(r'\b(20\d\d)\b', contest_name or "") or re.search(r'\b(20\d\d)\b', details_str or "")
        if year_match:
            comp_date = datetime(int(year_match.group(1)), 6, 1, tzinfo=timezone.utc)
        else:
            return 0.0, None

    diff_days = (CURRENT_DATE - comp_date).total_seconds() / 86400
    diff_months = diff_days / 30.436875

    if diff_months < 0: return 5.0, comp_date
    if diff_months < 12: return 5.0, comp_date
    if diff_months < 24: return 3.0, comp_date
    if diff_months < 36: return 1.0, comp_date
    if diff_months < 48: return 0.5, comp_date
    if diff_months < 60: return 0.25, comp_date
    return 0.0, comp_date

def get_tier_info(show_name):
    name = (show_name or "").lower()

    if ("group" in name or "heat" in name or "qualifier" in name or "qualifying" in name or
        "pro/am" in name or "amateur" in name or "shaw classic open" in name):
        return "TIER_4", 1.0

    if ("novice" in name or "spectacle" in name or "festif" in name or
        "pehar" in name or "hero of" in name or "cup of friendship" in name or "natural" in name):
        return "TIER_5", 0.25

    if ("world's strongest man" in name or "world's strongest woman" in name or
        "arnold strongman classic" in name or "arnold strongwoman classic" in name or
        "arnold pro strongwoman" in name or
        "strongest man on earth" in name or "strongest woman on earth" in name or
        ("shaw classic" in name and "shaw classic open" not in name) or
        "rogue invitational" in name):
        return "TIER_1", 5.0

    if ("giants live" in name or "arnold" in name or
        "world tour finals" in name or "strongman classic" in name or "strongwoman classic" in name or
        "world open" in name or "strongman open" in name or "strongwoman open" in name):
        return "TIER_2", 3.0

    if ("europe's strongest man" in name or "europe's strongest woman" in name or
        "north america's strongest man" in name or "north america's strongest woman" in name or
        "britain's strongest man" in name or "britain's strongest woman" in name or
        "america's strongest man" in name or "america's strongest woman" in name):
        return "TIER_3", 2.0

    if "strongman champions league" in name or "scl" in name or "strongest man" in name or "strongest woman" in name:
        return "TIER_4", 1.0

    return "TIER_5", 0.25

with open(DATASET_FILE, 'r', encoding='utf-8') as f:
    raw_contests = json.load(f)

with open(RANKED_WOMEN_FILE, 'r', encoding='utf-8') as f:
    ranked_women = json.load(f)

ranked_ids = set(c['contest_id'] for c in ranked_women)

# Find women's shows NOT already in the ranked list
women_contests_all = [c for c in raw_contests if classify_division(c.get('contest_name', '')) == 'women']
print(f"Total women's shows in dataset: {len(women_contests_all)}")
print(f"Already ranked women's shows: {len(ranked_women)}")

excluded = []
for c in women_contests_all:
    if c['contest_id'] in ranked_ids:
        continue
    name = c.get('contest_name', '')
    details = c.get('details', '')
    recency, comp_date = get_recency_multiplier(details, name)
    results = c.get('results', [])
    num_competitors = len(results)
    
    reason = []
    if recency == 0.0:
        reason.append("TOO_OLD (>5 years)")
    if num_competitors < 3:
        reason.append(f"TOO_FEW_COMPETITORS ({num_competitors})")
    
    tier, mult = get_tier_info(name)
    
    excluded.append({
        'contest_id': c['contest_id'],
        'contest_name': name,
        'details': details,
        'date': comp_date.strftime('%Y-%m-%d') if comp_date else 'unknown',
        'tier': tier,
        'tier_multiplier': mult,
        'recency': recency,
        'num_competitors': num_competitors,
        'reasons_excluded': reason,
        'top_competitors': [r['person_name'] for r in results[:5]]
    })

# Sort by recency (most recent first), then by tier multiplier
eligible_excluded = [e for e in excluded if not e['reasons_excluded']]
too_old = [e for e in excluded if any('TOO_OLD' in r for r in e['reasons_excluded'])]
too_few = [e for e in excluded if any('TOO_FEW' in r for r in e['reasons_excluded']) and not any('TOO_OLD' in r for r in e['reasons_excluded'])]

eligible_excluded.sort(key=lambda x: (-x['tier_multiplier'], -x['recency']))

print(f"\n=== ELIGIBLE but NOT INCLUDED women's shows ({len(eligible_excluded)}) ===")
print("(Shows that pass age and field-size checks but somehow aren't ranked)")
for e in eligible_excluded:
    print(f"  [{e['tier']}] {e['contest_name']} | {e['date']} | {e['num_competitors']} competitors | Recency: {e['recency']}")
    print(f"       Top: {', '.join(e['top_competitors'])}")

print(f"\n=== TOO OLD women's shows ({len(too_old)}) ===")
for e in sorted(too_old, key=lambda x: x['date'], reverse=True)[:20]:
    print(f"  {e['contest_name']} | {e['date']} | {e['num_competitors']} competitors")

print(f"\n=== TOO FEW COMPETITORS women's shows ({len(too_few)}) ===")
for e in sorted(too_few, key=lambda x: (-x['tier_multiplier'], x['date']), reverse=False):
    print(f"  [{e['tier']}] {e['contest_name']} | {e['date']} | {e['num_competitors']} competitors | Recency: {e['recency']}")

print(f"\n\n=== HIGH-LEVEL SHOWS in dataset that classify as women's but may need name fix ===")
# Look for shows with "women" that might be mis-classified
for c in raw_contests:
    name = c.get('contest_name', '').lower()
    if ('open' in name or 'pro' in name or 'champion' in name) and classify_division(c.get('contest_name', '')) == 'women':
        if c['contest_id'] not in ranked_ids:
            results = c.get('results', [])
            recency, comp_date = get_recency_multiplier(c.get('details',''), c.get('contest_name',''))
            if recency > 0 and len(results) >= 3:
                print(f"  {c['contest_name']} | {c.get('details','')} | {len(results)} competitors | Recency: {recency}")
