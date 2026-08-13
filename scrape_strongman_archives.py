#!/usr/bin/env python3
"""
StrongmanArchives.com Full Contest Results Scraper
-------------------------------------------------
Features:
1. Incrementally scrapes contest pages from ID 1 onwards.
2. Extracts contest metadata, competitor names, rankings, countries, and total scores.
3. Excludes individual event breakdowns as requested.
4. Auto-resume: Reads existing JSON output and picks up from where it left off.
5. End detection: Stop condition triggers after N consecutive invalid/empty pages.
"""

import os
import sys
import time
import json
import logging
import requests
from bs4 import BeautifulSoup

# Ensure UTF-8 output formatting for terminal logs
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

JSON_FILE = "strongman_contests_dataset.json"
BASE_URL = "https://strongmanarchives.com/viewContest.php?id="
AJAX_URL = "https://strongmanarchives.com/fetchContestResult.php"
MAX_CONSECUTIVE_EMPTY = 15  # Stop scraping after 15 consecutive empty IDs (approx 2-3 sec check)
REQUEST_DELAY_SEC = 0.15    # Fast politeness delay between requests

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def is_excluded_contest(contest_name):
    name = (contest_name or "").lower()
    # Exclude single-lift World Deadlift and World Log Lift Championships
    if (
        "world deadlift" in name or "deadlift championship" in name or "deadlift championchip" in name or
        "world log lift" in name or "log lift championship" in name or "log lift championchip" in name or
        "log lift world championship" in name
    ):
        return True
    return False

def load_existing_data(file_path):
    """
    Loads existing scraped dataset if present and filters out excluded contests.
    Returns:
      data (list of dict): All previously scraped contest objects.
      scraped_ids (set): Set of contest IDs already processed.
    """
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                raw_data = json.load(f)
                data = [item for item in raw_data if not is_excluded_contest(item.get('contest_name', ''))]
                scraped_ids = {item['contest_id'] for item in raw_data if 'contest_id' in item}
                logging.info(f"Loaded existing data from {file_path}. Found {len(data)} valid contests ({len(scraped_ids)} unique IDs).")
                return data, scraped_ids
        except Exception as e:
            logging.error(f"Error reading existing {file_path}: {e}. Starting fresh.")
    return [], set()

def save_data(data, file_path):
    """
    Safely saves data to JSON file with retry handling for Windows file locking.
    """
    temp_file = f"{file_path}.tmp"
    try:
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        for attempt in range(5):
            try:
                os.replace(temp_file, file_path)
                return
            except PermissionError:
                time.sleep(0.3 * (attempt + 1))
        
        # Fallback direct write if atomic replace is locked
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logging.warning(f"Warning writing save file: {e}")

def scrape_contest(session, contest_id):
    """
    Scrapes a single contest by ID.
    Returns contest dict if valid and non-empty, otherwise None.
    """
    contest_url = f"{BASE_URL}{contest_id}"
    try:
        r_page = session.get(contest_url, timeout=10)
    except Exception as e:
        logging.warning(f"[ID {contest_id}] Network error fetching page: {e}")
        return None

    if r_page.status_code != 200 or "viewContest.php" not in r_page.url:
        return None

    soup = BeautifulSoup(r_page.content, 'html.parser')

    # Extract Contest Title & Details with robust 3-tier strategy
    h3 = soup.find('h3')
    contest_name = h3.text.strip() if (h3 and h3.text.strip() and h3.text.strip() != '#') else None

    if not contest_name and soup.title and soup.title.string:
        t = soup.title.string.strip()
        contest_name = t.replace("Strongman Archives - ", "").strip()

    details_line = ""
    table0 = soup.find('table')
    if table0:
        tr0 = table0.find('tr')
        if tr0 and tr0.text.strip() and not tr0.text.strip().startswith('#'):
            lines = [l.strip() for l in tr0.text.strip().split('\n') if l.strip()]
            if lines and (not contest_name or contest_name == '#'):
                contest_name = lines[0]
            if len(lines) > 1:
                details_line = lines[1]

    if not contest_name or contest_name == '#':
        contest_name = f"Contest #{contest_id}"

    if is_excluded_contest(contest_name):
        logging.info(f"[ID {contest_id}] Excluded single-lift contest: {contest_name}")
        return None

    # Fetch competitor results via AJAX endpoint
    post_headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': contest_url
    }
    
    try:
        r_ajax = session.post(
            AJAX_URL,
            data=f"contestID={contest_id}&unitDisplay=metric",
            headers=post_headers,
            timeout=10
        )
    except Exception as e:
        logging.warning(f"[ID {contest_id}] Error fetching AJAX results: {e}")
        return None

    if r_ajax.status_code != 200:
        return None

    competitors = []
    try:
        data_json = r_ajax.json()
        raw_rows = data_json.get('data', [])
        
        for row in raw_rows:
            if len(row) >= 4:
                rank_str = str(row[0]).strip()
                
                # Extract Full Competitor Name from title="Full Name" in HTML link
                comp_soup = BeautifulSoup(row[1], 'html.parser')
                a_comp = comp_soup.find('a')
                person_name = a_comp.get('title', '').strip() if a_comp else comp_soup.text.strip()
                
                # Extract Country
                country_soup = BeautifulSoup(row[2], 'html.parser')
                a_country = country_soup.find('a')
                country = a_country.get('title', '').strip() if a_country else country_soup.text.strip()
                
                # Extract Total Score
                raw_score = row[3]
                try:
                    score = float(raw_score) if raw_score is not None else None
                except (ValueError, TypeError):
                    score = str(raw_score).strip()

                competitors.append({
                    "rank": rank_str,
                    "person_name": person_name,
                    "country": country,
                    "score": score
                })
    except Exception as e:
        logging.warning(f"[ID {contest_id}] JSON parsing error: {e}")
        return None

    if not competitors:
        return None

    return {
        "contest_id": contest_id,
        "contest_name": contest_name,
        "details": details_line,
        "url": contest_url,
        "total_competitors": len(competitors),
        "results": competitors
    }

def main():
    logging.info("Starting Strongman Archives Contest Scraper...")
    existing_data, scraped_ids = load_existing_data(JSON_FILE)
    
    # Map data by contest_id for easy updates
    dataset_map = {item['contest_id']: item for item in existing_data}
    
    # Determine starting ID (resume from max existing ID + 1, or start at 1)
    if scraped_ids:
        start_id = max(scraped_ids) + 1
        logging.info(f"Resuming from Contest ID {start_id} (already scraped up to ID {max(scraped_ids)})")
    else:
        start_id = 1
        logging.info("Starting fresh from Contest ID 1")

    session = requests.Session()
    session.headers.update(headers)

    current_id = start_id
    consecutive_empty = 0
    scraped_count_session = 0

    try:
        while True:
            # Skip if ID was already scraped
            if current_id in scraped_ids:
                current_id += 1
                continue

            contest_data = scrape_contest(session, current_id)

            if contest_data:
                dataset_map[current_id] = contest_data
                scraped_ids.add(current_id)
                scraped_count_session += 1
                consecutive_empty = 0  # Reset consecutive empty counter

                logging.info(
                    f"✓ [ID {current_id}] {contest_data['contest_name']} "
                    f"({contest_data['total_competitors']} competitors)"
                )

                # Save to disk every contest or periodically
                save_data(list(dataset_map.values()), JSON_FILE)
            else:
                consecutive_empty += 1
                logging.info(f"✗ [ID {current_id}] Empty / No Contest Data ({consecutive_empty}/{MAX_CONSECUTIVE_EMPTY})")

                # Check End of List Condition
                if consecutive_empty >= MAX_CONSECUTIVE_EMPTY:
                    logging.info(
                        f"\nReached end of possible results! Encountered {MAX_CONSECUTIVE_EMPTY} "
                        f"consecutive empty pages at ID {current_id}."
                    )
                    break

            current_id += 1
            time.sleep(REQUEST_DELAY_SEC)

    except KeyboardInterrupt:
        logging.info("\nScraping interrupted by user (Ctrl+C). Progress saved safely.")
    finally:
        final_list = list(dataset_map.values())
        save_data(final_list, JSON_FILE)
        logging.info(f"Done! Scraped {scraped_count_session} new contests in this run.")
        logging.info(f"Total dataset size: {len(final_list)} contests saved in '{JSON_FILE}'.")

if __name__ == "__main__":
    main()
