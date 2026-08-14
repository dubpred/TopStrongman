const fs = require('fs');

const DATASET_FILE = "strongman_contests_dataset.json";
const RANKED_WOMEN_FILE = "strongwoman_contests_ranked_last_5_years.json";

// All women's shows found on Strongman Archives (from browser research)
const archivesWomensShows = [
  // 2026
  { id: 2819, name: "2026 Western Canada's Strongest Woman", date: "2026-08-08" },
  { id: 2592, name: "2026 North America's Strongest Woman", date: "2026-07-25" },
  { id: 2247, name: "2026 Britain's Strongest Woman", date: "2026-07-25" },
  { id: 2733, name: "2026 Rainier Classic Pro-Am (Women)", date: "2026-07-12" },
  { id: 2691, name: "2026 Santa Monica Classic (Women)", date: "2026-06-28" },
  { id: 2658, name: "2026 Irish Strength Cup (Women)", date: "2026-06-27" },
  { id: 2552, name: "2026 Beast of the East (Women)", date: "2026-05-09" },
  { id: 2514, name: "2026 Australia's Strongest Woman", date: "2026-05-02" },
  { id: 2520, name: "2026 Alberta's Strongest Woman", date: "2026-04-11" },
  { id: 2457, name: "2026 Arnold Strongman Pro/Am (Women)", date: "2026-03-08" },
  { id: 2074, name: "2026 Arnold Strongwoman Classic", date: "2026-03-07" },
  // 2025
  { id: 2202, name: "2025 World's Strongest Woman", date: "2025-11-23" },
  { id: 2134, name: "2025 Italy's Strongest Woman", date: "2025-11-08" },
  { id: 1637, name: "2025 Rogue Invitational (Women)", date: "2025-11-01" },
  { id: 2034, name: "2025 America's Strongest Woman", date: "2025-10-11" },
  { id: 2572, name: "2025 New Zealand's Strongest Woman", date: "2025-09-27" },
  { id: 2837, name: "2025 Shaw Classic Open (Women)", date: "2025-08-17" },
  { id: 1639, name: "2025 OSG European Championships (Women)", date: "2025-08-03" },
  { id: 1635, name: "2025 North America's Strongest Woman", date: "2025-07-26" },
  { id: 1616, name: "2025 Britain's Strongest Woman", date: "2025-07-19" },
  { id: 1788, name: "2025 Rainier Classic Pro-Am (Women)", date: "2025-06-16" },
  { id: 1700, name: "2025 Australia's Strongest Woman", date: "2025-05-10" },
  { id: 1694, name: "2025 Arnold Strongman Pro/Am (Women)", date: "2025-03-02" },
  { id: 1621, name: "2025 Arnold Strongwoman Classic", date: "2025-03-01" },
  // 2024
  { id: 1624, name: "2024 World's Strongest Woman", date: "2024-12-08" },
  { id: 1599, name: "2024 Rogue Invitational (Women)", date: "2024-11-09" },
  { id: 1601, name: "2024 America's Strongest Woman", date: "2024-10-12" },
  { id: 1608, name: "2024 Extinct Games (Women)", date: "2024-10-04" },
  { id: 1527, name: "2024 Women's World Deadlift Championships", date: "2024-09-28" },
  { id: 1598, name: "2024 UK's Strongest Woman", date: "2024-08-25" },
  { id: 1595, name: "2024 OSG European Championships (Women)", date: "2024-08-18" },
  { id: 1593, name: "2024 Shaw Classic Open (Women)", date: "2024-08-18" },
  { id: 1538, name: "2024 North America's Strongest Woman", date: "2024-07-28" },
  { id: 1501, name: "2024 Britain's Strongest Woman", date: "2024-06-22" },
  { id: 1490, name: "2024 Australia's Strongest Woman", date: "2024-04-20" },
  { id: 1543, name: "2024 Olympic City Pro-Am (Women)", date: "2024-03-23" },
  { id: 1466, name: "2024 Arnold UK - Strongwoman", date: "2024-03-17" },
  { id: 1525, name: "2024 Arnold Amateur Strongwoman World Championships", date: "2024-03-03" },
  { id: 1459, name: "2024 Arnold Strongwoman Classic", date: "2024-03-02" },
  // 2023
  { id: 1485, name: "2023 World's Strongest Woman", date: "2023-12-03" },
  { id: 1449, name: "2023 America's Strongest Woman", date: "2023-11-04" },
  { id: 1455, name: "2023 Africa's Strongest Woman", date: "2023-10-29" },
  { id: 1411, name: "2023 Britain's Strongest Woman", date: "2023-09-30" },
  { id: 1526, name: "2023 Women's World Deadlift Championships", date: "2023-09-02" },
  { id: 1395, name: "2023 Shaw Classic Open (Women)", date: "2023-08-20" },
  { id: 1434, name: "2023 OSG European Championships (Women)", date: "2023-08-13" },
  { id: 1786, name: "2023 Rainier Classic Pro-Am (Women)", date: "2023-07-09" },
  { id: 1438, name: "2023 Western Canada's Strongest Woman", date: "2023-07-02" },
  { id: 1430, name: "2023 UK's Strongest Woman", date: "2023-05-29" },
  { id: 1392, name: "2023 Australia's Strongest Woman", date: "2023-03-19" },
  { id: 1409, name: "2023 Arnold Amateur Strongwoman World Championships", date: "2023-03-05" },
  { id: 1368, name: "2023 Arnold Strongwoman Classic", date: "2023-03-04" },
  { id: 1372, name: "2023 Australia's Strongest International (Women)", date: "2023-01-20" },
  // 2022
  { id: 1341, name: "2022 America's Strongest Woman", date: "2022-12-17" },
  { id: 1355, name: "2022 World's Strongest Woman", date: "2022-11-13" },
  { id: 1313, name: "2022 Middle East's Strongest Woman", date: "2022-08-27" },
  { id: 1344, name: "2022 Shaw Classic Open (Women)", date: "2022-08-14" },
  { id: 1339, name: "2022 Finland's Strongest Woman", date: "2022-08-13" },
  { id: 1785, name: "2022 Rainier Classic Pro-Am (Women)", date: "2022-06-05" },
  { id: 1277, name: "2022 UK's Strongest Woman", date: "2022-04-30" },
  { id: 1279, name: "2022 Australia's Strongest Woman", date: "2022-03-27" },
  { id: 1315, name: "2022 Beerstone", date: "2022-03-12" },
  { id: 1280, name: "2022 Arnold Amateur Strongwoman World Championships", date: "2022-03-06" },
  { id: 1146, name: "2022 Arnold Pro Strongwoman", date: "2022-03-05" },
  // 2021
  { id: 1158, name: "2021 Russia's Strongest Woman", date: "2021-12-11" },
  { id: 1163, name: "2021 Canada's Strongest Woman", date: "2021-12-05" },
  { id: 1149, name: "2021 Africa's Strongest Woman", date: "2021-11-28" },
  { id: 1106, name: "2021 World's Strongest Woman", date: "2021-11-14" },
  { id: 1127, name: "2021 America's Strongest Woman", date: "2021-10-09" },
  { id: 1122, name: "2021 Middle East's Strongest Woman", date: "2021-10-01" },
  { id: 1104, name: "2021 World's Ultimate Strongwoman", date: "2021-09-17" },
  { id: 1113, name: "2021 UK's Strongest Woman", date: "2021-08-22" },
  { id: 1318, name: "2021 Finland's Strongest Woman", date: "2021-08-14" },
  { id: 1784, name: "2021 Rainier Classic Pro-Am (Women)", date: "2021-07-08" },
];

const rawContests = JSON.parse(fs.readFileSync(DATASET_FILE, 'utf-8'));
const rankedWomen = JSON.parse(fs.readFileSync(RANKED_WOMEN_FILE, 'utf-8'));

const datasetIds = new Set(rawContests.map(c => c.contest_id));
const rankedIds = new Set(rankedWomen.map(c => c.contest_id));

console.log("=== SHOWS ON STRONGMAN ARCHIVES BUT NOT IN OUR DATASET ===\n");
console.log("These contests need to be scraped and added to the dataset:\n");

const missingFromDataset = archivesWomensShows.filter(s => !datasetIds.has(s.id));
const inDatasetNotRanked = archivesWomensShows.filter(s => datasetIds.has(s.id) && !rankedIds.has(s.id));
const alreadyRanked = archivesWomensShows.filter(s => rankedIds.has(s.id));

console.log(`Total archives shows: ${archivesWomensShows.length}`);
console.log(`Already ranked: ${alreadyRanked.length}`);
console.log(`In dataset but not ranked: ${inDatasetNotRanked.length}`);
console.log(`Missing from dataset entirely: ${missingFromDataset.length}\n`);

// Categorize missing shows by tier
function getTier(name) {
  const n = name.toLowerCase();
  if (n.includes("world's strongest woman") || n.includes("arnold strongwoman classic") || n.includes("arnold pro strongwoman") || n.includes("strongest woman on earth")) return "TIER_1 ⭐⭐⭐";
  if (n.includes("rogue invitational") || n.includes("arnold")) return "TIER_1 ⭐⭐⭐";
  if (n.includes("north america's strongest woman") || n.includes("britain's strongest woman") || n.includes("america's strongest woman") || n.includes("europe's strongest woman")) return "TIER_3 ⭐⭐";
  if (n.includes("uk's strongest woman") || n.includes("africa's strongest woman") || n.includes("australia's strongest woman") || n.includes("canada's strongest woman")) return "TIER_4 ⭐";
  if (n.includes("osg") || n.includes("official strongman") || n.includes("shaw classic open")) return "TIER_4 ⭐";
  return "TIER_5";
}

console.log("=== MISSING FROM DATASET (Need to be scraped) ===");
const highPriority = missingFromDataset.filter(s => getTier(s.name).includes("⭐⭐") || getTier(s.name).includes("⭐⭐⭐"));
const lowerPriority = missingFromDataset.filter(s => !highPriority.includes(s));

console.log("\n--- HIGH PRIORITY (Tier 1-3) ---");
for (const s of highPriority) {
  console.log(`  [ID ${s.id}] ${s.name} | ${s.date} | ${getTier(s.name)}`);
}

console.log("\n--- LOWER PRIORITY (Tier 4-5) ---");
for (const s of lowerPriority) {
  console.log(`  [ID ${s.id}] ${s.name} | ${s.date} | ${getTier(s.name)}`);
}

console.log("\n\n=== IN DATASET BUT NOT RANKED (Check why) ===");
for (const s of inDatasetNotRanked) {
  const contest = rawContests.find(c => c.contest_id === s.id);
  if (contest) {
    const numCompetitors = (contest.results || []).length;
    console.log(`  [ID ${s.id}] ${s.name} | ${numCompetitors} competitors | ${getTier(s.name)}`);
    if (numCompetitors > 0) {
      const top5 = (contest.results || []).slice(0, 3).map(r => r.person_name).join(', ');
      console.log(`       Top: ${top5}`);
    }
  }
}

console.log("\n\n=== ALREADY RANKED ===");
for (const s of alreadyRanked) {
  const ranked = rankedWomen.find(c => c.contest_id === s.id);
  console.log(`  [Rank #${ranked.competition_rank}] ${s.name} | Score: ${ranked.difficulty_score} | ${ranked.total_competitors} competitors`);
}
