const fs = require('fs');

const DATASET_FILE = "strongman_contests_dataset.json";
const RANKED_WOMEN_FILE = "strongwoman_contests_ranked_last_5_years.json";

const CURRENT_DATE = new Date();

function classifyDivision(showName) {
  const name = (showName || "").toLowerCase();
  const isWeightOrMasters = (
    name.includes("u64") || name.includes("u73") || name.includes("u82") || name.includes("105") || name.includes("u105") ||
    name.includes("u90") || name.includes("u80") || name.includes("masters") || name.includes("novice") || name.includes("inspirational")
  );
  const isWsmHeat = (name.includes("wsm") && (name.includes("group") || name.includes("heat"))) || name.includes("wsm group");
  const isSingleLift = (
    name.includes("world deadlift") || name.includes("deadlift championship") || name.includes("deadlift championchip") ||
    name.includes("world log lift") || name.includes("log lift championship") || name.includes("log lift championchip") ||
    name.includes("log lift world championship")
  );
  if (isWeightOrMasters || isWsmHeat || isSingleLift) return "OMITTED";
  const isWomen = name.includes("women") || name.includes("woman") || name.includes("wsw") || name.includes("female");
  return isWomen ? "women" : "men";
}

function getRecencyMultiplier(detailsStr, contestName) {
  const dateMatch = (detailsStr || "").match(/(\d{4})-(\d{2})-(\d{2})/);
  let compDate;
  if (dateMatch) {
    compDate = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T00:00:00Z`);
  } else {
    const yearMatch = (contestName || "").match(/\b(20\d\d)\b/) || (detailsStr || "").match(/\b(20\d\d)\b/);
    if (yearMatch) {
      compDate = new Date(`${yearMatch[1]}-06-01T00:00:00Z`);
    } else {
      return { mult: 0.0, date: null };
    }
  }

  const diffDays = (CURRENT_DATE - compDate) / (1000 * 60 * 60 * 24);
  const diffMonths = diffDays / 30.436875;

  let mult;
  if (diffMonths < 0) mult = 5.0;
  else if (diffMonths < 12) mult = 5.0;
  else if (diffMonths < 24) mult = 3.0;
  else if (diffMonths < 36) mult = 1.0;
  else if (diffMonths < 48) mult = 0.5;
  else if (diffMonths < 60) mult = 0.25;
  else mult = 0.0;

  return { mult, date: compDate };
}

function getTierInfo(showName) {
  const name = (showName || "").toLowerCase();
  if (name.includes("group") || name.includes("heat") || name.includes("qualifier") || name.includes("qualifying") ||
      name.includes("pro/am") || name.includes("amateur") || name.includes("shaw classic open")) {
    return { tier: "TIER_4", multiplier: 1.0 };
  }
  if (name.includes("novice") || name.includes("spectacle") || name.includes("festif") ||
      name.includes("pehar") || name.includes("hero of") || name.includes("cup of friendship") || name.includes("natural")) {
    return { tier: "TIER_5", multiplier: 0.25 };
  }
  if (name.includes("world's strongest man") || name.includes("world's strongest woman") ||
      name.includes("arnold strongman classic") || name.includes("arnold strongwoman classic") ||
      name.includes("arnold pro strongwoman") ||
      name.includes("strongest man on earth") || name.includes("strongest woman on earth") ||
      (name.includes("shaw classic") && !name.includes("shaw classic open")) ||
      name.includes("rogue invitational")) {
    return { tier: "TIER_1", multiplier: 5.0 };
  }
  if (name.includes("giants live") || name.includes("arnold") ||
      name.includes("world tour finals") || name.includes("strongman classic") || name.includes("strongwoman classic") ||
      name.includes("world open") || name.includes("strongman open") || name.includes("strongwoman open")) {
    return { tier: "TIER_2", multiplier: 3.0 };
  }
  if (name.includes("europe's strongest man") || name.includes("europe's strongest woman") ||
      name.includes("north america's strongest man") || name.includes("north america's strongest woman") ||
      name.includes("britain's strongest man") || name.includes("britain's strongest woman") ||
      name.includes("america's strongest man") || name.includes("america's strongest woman")) {
    return { tier: "TIER_3", multiplier: 2.0 };
  }
  if (name.includes("strongman champions league") || name.includes("scl") || name.includes("strongest man") || name.includes("strongest woman")) {
    return { tier: "TIER_4", multiplier: 1.0 };
  }
  return { tier: "TIER_5", multiplier: 0.25 };
}

const rawContests = JSON.parse(fs.readFileSync(DATASET_FILE, 'utf-8'));
const rankedWomen = JSON.parse(fs.readFileSync(RANKED_WOMEN_FILE, 'utf-8'));

const rankedIds = new Set(rankedWomen.map(c => c.contest_id));

// All women's shows in dataset
const allWomensContests = rawContests.filter(c => classifyDivision(c.contest_name) === 'women');
console.log(`Total women's shows in dataset: ${allWomensContests.length}`);
console.log(`Already ranked women's shows: ${rankedWomen.length}`);

const excluded = [];
for (const c of allWomensContests) {
  if (rankedIds.has(c.contest_id)) continue;

  const name = c.contest_name || '';
  const details = c.details || '';
  const { mult: recency, date: compDate } = getRecencyMultiplier(details, name);
  const results = c.results || [];
  const numCompetitors = results.length;
  const tierInfo = getTierInfo(name);

  const reasons = [];
  if (recency === 0.0) reasons.push(`TOO_OLD`);
  if (numCompetitors < 3) reasons.push(`TOO_FEW(${numCompetitors})`);

  excluded.push({
    contest_id: c.contest_id,
    contest_name: name,
    details,
    date: compDate ? compDate.toISOString().slice(0, 10) : 'unknown',
    tier: tierInfo.tier,
    tier_multiplier: tierInfo.multiplier,
    recency,
    num_competitors: numCompetitors,
    reasons,
    top_competitors: results.slice(0, 5).map(r => r.person_name)
  });
}

// Categorize
const eligibleExcluded = excluded.filter(e => e.reasons.length === 0);
const tooOld = excluded.filter(e => e.reasons.some(r => r.includes('TOO_OLD')));
const tooFew = excluded.filter(e => e.reasons.some(r => r.includes('TOO_FEW')) && !e.reasons.some(r => r.includes('TOO_OLD')));

eligibleExcluded.sort((a, b) => b.tier_multiplier - a.tier_multiplier || b.recency - a.recency);

console.log(`\n=== ELIGIBLE but NOT INCLUDED women's shows (${eligibleExcluded.length}) ===`);
console.log("(Shows that pass age and field-size checks but aren't ranked - likely classification issue)");
for (const e of eligibleExcluded) {
  console.log(`  [${e.tier} x${e.tier_multiplier}] ${e.contest_name} | ${e.date} | ${e.num_competitors} competitors | Recency: ${e.recency}x`);
  console.log(`       Top: ${e.top_competitors.join(', ')}`);
}

console.log(`\n=== TOO FEW COMPETITORS (need ≥3) women's shows in the LAST 5 YEARS (${tooFew.length}) ===`);
tooFew.sort((a, b) => b.tier_multiplier - a.tier_multiplier || b.recency - a.recency);
for (const e of tooFew) {
  console.log(`  [${e.tier} x${e.tier_multiplier}] ${e.contest_name} | ${e.date} | ${e.num_competitors} competitors | Recency: ${e.recency}x`);
  if (e.top_competitors.length > 0) console.log(`       Has: ${e.top_competitors.join(', ')}`);
}

console.log(`\n=== TOO OLD (>5 years) women's shows (${tooOld.length} total, showing 20 most recent) ===`);
tooOld.sort((a, b) => b.date.localeCompare(a.date));
for (const e of tooOld.slice(0, 20)) {
  console.log(`  ${e.contest_name} | ${e.date} | ${e.num_competitors} competitors`);
}

// Check the "unrankable" list
console.log(`\n\n=== Checking unrankable last 5 years for women's shows ===`);
try {
  const unrankable = JSON.parse(fs.readFileSync('strongman_contests_unrankable_last_5_years.json', 'utf-8'));
  const unrankableWomen = unrankable.filter(c => classifyDivision(c.contest_name) === 'women');
  console.log(`Women's shows in unrankable list: ${unrankableWomen.length}`);
  unrankableWomen.sort((a, b) => {
    const tA = getTierInfo(a.contest_name);
    const tB = getTierInfo(b.contest_name);
    return tB.multiplier - tA.multiplier;
  });
  for (const c of unrankableWomen.slice(0, 30)) {
    const ti = getTierInfo(c.contest_name);
    const results = c.results || [];
    console.log(`  [${ti.tier} x${ti.multiplier}] ${c.contest_name} | ${c.details} | ${results.length} competitors`);
    if (results.length > 0) console.log(`       Top: ${results.slice(0, 5).map(r => r.person_name).join(', ')}`);
  }
} catch(e) {
  console.log("Unrankable file not found");
}
