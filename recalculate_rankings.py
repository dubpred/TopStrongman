import json
import math
import re
from datetime import datetime

DATASET_FILE = "strongman_contests_dataset.json"
FILTERED_FILE = "strongman_contests_filtered.json"
RANKED_MEN_FILE = "strongman_contests_ranked_last_5_years.json"
RANKED_WOMEN_FILE = "strongwoman_contests_ranked_last_5_years.json"
UNRANKABLE_FILE = "strongman_contests_unrankable_last_5_years.json"
DB_FILE = "database_strongman.json"
FRONTEND_DB_FILE = "frontend/src/services/database_strongman.json"

CURRENT_DATE = datetime.now()
WEIGHTS = [1.0, 0.85, 0.70, 0.55, 0.40, 0.30, 0.20, 0.15, 0.10, 0.05]
POWER_EXPONENT = 1.5

def classify_division(show_name):
    name = (show_name or "").lower()

    # Omit weight classes, masters, heats, novice, and single-lift championships
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

    is_women = ("women" in name or "woman" in name or "wsw" in name or "female" in name)
    return "women" if is_women else "men"

def get_tier_info(show_name, division):
    name = (show_name or "").lower()

    if (
        "group" in name or "heat" in name or "qualifier" in name or "qualifying" in name or
        "pro/am" in name or "amateur" in name or "shaw classic open" in name
    ):
        return "TIER_4", 1.0

    if (
        "novice" in name or "spectacle" in name or "festif" in name or
        "pehar" in name or "hero of" in name or "cup of friendship" in name or
        "natural" in name
    ):
        return "TIER_5", 0.25

    if (
        "world's strongest man" in name or "world's strongest woman" in name or
        "arnold strongman classic" in name or "arnold strongwoman classic" in name or
        "strongest man on earth" in name or "official strongman games" in name or
        "shaw classic" in name or "rogue invitational" in name
    ):
        return "TIER_1", 5.0

    if (
        "giants live" in name or "arnold" in name or
        "world tour finals" in name or "strongman classic" in name or "strongwoman classic" in name or
        "world open" in name or "strongman open" in name or "strongwoman open" in name
    ):
        return "TIER_2", 3.0

    if (
        "europe's strongest man" in name or "europe's strongest woman" in name or
        "north america's strongest man" in name or "north america's strongest woman" in name or
        "britain's strongest man" in name or "britain's strongest woman" in name or
        "america's strongest man" in name or "america's strongest woman" in name
    ):
        return "TIER_3", 2.0

    if "strongman champions league" in name or "scl" in name or "strongest man" in name or "strongest woman" in name:
        return "TIER_4", 1.0

    return "TIER_5", 0.25

def get_recency_multiplier(details_str, contest_name):
    date_match = re.search(r'(\d{4})-(\d{2})-(\d{2})', details_str or "")
    if date_match:
        y, m, d = int(date_match.group(1)), int(date_match.group(2)), int(date_match.group(3))
        comp_date = datetime(y, m, d)
    else:
        year_match = re.search(r'\b(20\d\d)\b', contest_name or "") or re.search(r'\b(20\d\d)\b', details_str or "")
        if year_match:
            y = int(year_match.group(1))
            comp_date = datetime(y, 6, 1)
        else:
            return 0.0

    diff_days = (CURRENT_DATE - comp_date).days
    diff_months = diff_days / 30.436875

    if diff_months < 0: return 5.0
    if diff_months < 12: return 5.0
    if diff_months < 24: return 3.0
    if diff_months < 36: return 1.0
    if diff_months < 48: return 0.5
    if diff_months < 60: return 0.25
    return 0.0

def get_exponential_base_points(rank):
    try:
        r = int(rank)
        return 100.0 * math.exp(-0.25 * (r - 1))
    except (ValueError, TypeError):
        return 0.0

def process_division(raw_contests, target_division):
    div_contests = [c for c in raw_contests if classify_division(c.get('contest_name', '')) == target_division]

    athlete_points_list = {}
    for contest in div_contests:
        cname = contest.get('contest_name', '')
        details = contest.get('details', '')
        tier_name, tier_mult = get_tier_info(cname, target_division)
        recency_mult = get_recency_multiplier(details, cname)

        if recency_mult == 0.0: continue

        for res in contest.get('results', []):
            person = res.get('person_name', '').strip()
            rank_val = res.get('rank')
            if not person: continue
            base_pts = get_exponential_base_points(rank_val)
            final_pts = base_pts * tier_mult * recency_mult
            
            if person not in athlete_points_list: athlete_points_list[person] = []
            athlete_points_list[person].append(final_pts)

    pure_map = {}
    for athlete, pts_list in athlete_points_list.items():
        pts_list.sort(reverse=True)
        weighted_sum = sum(p * w for p, w in zip(pts_list, WEIGHTS))
        pure_map[athlete] = weighted_sum

    min_field_size = 3 if target_division == 'women' else 5
    rankable_contests = []

    for contest in div_contests:
        cid = contest.get('contest_id')
        cname = contest.get('contest_name')
        details = contest.get('details')
        results = contest.get('results', [])

        recency_mult = get_recency_multiplier(details, cname)
        # Strictly limit to competitions within the last 5 years / 60 months
        if recency_mult == 0.0:
            continue

        top5_finishers = [res for res in results if str(res.get('rank')).isdigit() and 1 <= int(res.get('rank')) <= 5]
        if len(results) < min_field_size:
            continue

        raw_diff = sum(pure_map.get(res.get('person_name', '').strip(), 0.0) for res in top5_finishers)
        tier_name, tier_mult = get_tier_info(cname, target_division)

        rankable_contests.append({
            "contest_id": cid,
            "contest_name": cname,
            "details": details,
            "tier": tier_name,
            "tier_multiplier": tier_mult,
            "recency_multiplier": recency_mult,
            "division": target_division,
            "total_competitors": len(results),
            "raw_difficulty": raw_diff,
            "top_5_finishers": [f"{r.get('person_name')} (#{r.get('rank')})" for r in top5_finishers],
            "results": results
        })

    max_raw_diff = max((c['raw_difficulty'] for c in rankable_contests), default=1.0)
    for c in rankable_contests:
        norm = math.pow(c['raw_difficulty'] / (max_raw_diff or 1.0), POWER_EXPONENT) * 1000.0
        c['difficulty_score'] = round(norm, 1)

    rankable_contests.sort(key=lambda x: x['difficulty_score'], reverse=True)
    for idx, c in enumerate(rankable_contests):
        c['competition_rank'] = idx + 1

    return rankable_contests

def parse_promotion(cname):
    name = cname.lower()
    if "world's strongest" in name or "wsm" in name or "wsw" in name: return "WSM"
    if "arnold" in name: return "Arnold Classic"
    if "shaw classic" in name or "strongest man on earth" in name: return "Shaw Classic"
    if "rogue" in name: return "Rogue"
    if "giants live" in name: return "Giants Live"
    if "europe's strongest" in name or "north america's strongest" in name: return "NASM"
    if "strongman champions league" in name or "scl" in name: return "SCL"
    if "official strongman" in name or "osg" in name: return "OSG"
    return "Other"

def run_full_recalculation():
    with open(DATASET_FILE, 'r', encoding='utf-8') as f:
        raw_contests = json.load(f)

    men_contests = process_division(raw_contests, "men")
    women_contests = process_division(raw_contests, "women")

    with open(RANKED_MEN_FILE, 'w', encoding='utf-8') as f:
        json.dump(men_contests, f, indent=2, ensure_ascii=False)

    with open(RANKED_WOMEN_FILE, 'w', encoding='utf-8') as f:
        json.dump(women_contests, f, indent=2, ensure_ascii=False)

    flattened_rows = []
    for div_name, contest_list in [("men", men_contests), ("women", women_contests)]:
        for contest in contest_list:
            cname = contest.get('contest_name', '')
            details = contest.get('details', '')
            diff_score = contest.get('difficulty_score', 0.0)
            promo = parse_promotion(cname)

            date_match = re.search(r'(\d{4}-\d{2}-\d{2})', details)
            date_str = date_match.group(1) if date_match else "2024-06-01"
            year_val = int(date_str[:4]) if len(date_str) >= 4 else 2024

            for res in contest.get('results', []):
                pname = res.get('person_name', '').strip()
                if not pname: continue
                try:
                    rank_val = int(res.get('rank'))
                except (ValueError, TypeError):
                    continue

                parts = pname.split(' ', 1)
                fname = parts[0]
                lname = parts[1] if len(parts) > 1 else ""

                flattened_rows.append({
                    "Show_Name": cname,
                    "Show_Promotion": promo,
                    "Date": date_str,
                    "Year": year_val,
                    "PlacementRank": rank_val,
                    "Competitor_fName": fname,
                    "Compititor_LName": lname,
                    "difficulty": diff_score,
                    "country_code": res.get('country', ''),
                    "division": div_name
                })

    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(flattened_rows, f, indent=2, ensure_ascii=False)

    with open(FRONTEND_DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(flattened_rows, f, indent=2, ensure_ascii=False)

    print(f"Recalculation complete! {len(men_contests)} Men's Open and {len(women_contests)} Women's Open competitions ranked.")

if __name__ == "__main__":
    run_full_recalculation()
