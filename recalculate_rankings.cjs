const fs = require('fs');
const path = require('path');

const DATASET_FILE = "strongman_contests_dataset.json";
const RANKED_MEN_FILE = "strongman_contests_ranked_last_5_years.json";
const RANKED_WOMEN_FILE = "strongwoman_contests_ranked_last_5_years.json";
const DB_FILE = "database_strongman.json";
const FRONTEND_DB_FILE = "frontend/src/services/database_strongman.json";

const CURRENT_DATE = new Date();
const WEIGHTS = [1.0, 0.85, 0.70, 0.55, 0.40, 0.30, 0.20, 0.15, 0.10, 0.05];
const POWER_EXPONENT = 1.5;

function classifyDivision(showName) {
  const name = (showName || "").toLowerCase();
  const isWeightOrMasters = (
    name.includes("u64") || name.includes("u73") || name.includes("u82") || name.includes("105") || name.includes("u105") ||
    name.includes("u90") || name.includes("u80") || name.includes("masters") || name.includes("novice") || name.includes("inspirational")
  );
  const isWsmHeat = (name.includes("wsm") && (name.includes("group") || name.includes("heat"))) || name.includes("wsm group");
  if (isWeightOrMasters || isWsmHeat) {
    return "OMITTED";
  }
  const isWomen = name.includes("women") || name.includes("woman") || name.includes("wsw") || name.includes("female");
  return isWomen ? "women" : "men";
}

function getTierInfo(showName, division) {
  const name = (showName || "").toLowerCase();

  if (
    name.includes("group") || name.includes("heat") || name.includes("qualifier") || name.includes("qualifying") ||
    name.includes("pro/am") || name.includes("amateur") || name.includes("shaw classic open")
  ) {
    return { tier: "TIER_4", multiplier: 1.0 };
  }

  if (
    name.includes("novice") || name.includes("spectacle") || name.includes("festif") ||
    name.includes("pehar") || name.includes("hero of") || name.includes("cup of friendship") ||
    name.includes("natural")
  ) {
    return { tier: "TIER_5", multiplier: 0.25 };
  }

  if (
    name.includes("world's strongest man") || name.includes("world's strongest woman") ||
    name.includes("arnold strongman classic") || name.includes("arnold strongwoman classic") ||
    name.includes("strongest man on earth") || name.includes("official strongman games") ||
    name.includes("shaw classic") || name.includes("rogue invitational")
  ) {
    return { tier: "TIER_1", multiplier: 5.0 };
  }

  if (
    name.includes("giants live") || name.includes("arnold") ||
    name.includes("world tour finals") || name.includes("strongman classic") || name.includes("strongwoman classic") ||
    name.includes("world open") || name.includes("strongman open") || name.includes("strongwoman open") ||
    name.includes("world deadlift") || name.includes("world log lift") || name.includes("log lift championships")
  ) {
    return { tier: "TIER_2", multiplier: 3.0 };
  }

  if (
    name.includes("europe's strongest man") || name.includes("europe's strongest woman") ||
    name.includes("north america's strongest man") || name.includes("north america's strongest woman") ||
    name.includes("britain's strongest man") || name.includes("britain's strongest woman") ||
    name.includes("america's strongest man") || name.includes("america's strongest woman")
  ) {
    return { tier: "TIER_3", multiplier: 2.0 };
  }

  if (name.includes("strongman champions league") || name.includes("scl") || name.includes("strongest man") || name.includes("strongest woman")) {
    return { tier: "TIER_4", multiplier: 1.0 };
  }

  return { tier: "TIER_5", multiplier: 0.25 };
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
      return 0.0;
    }
  }

  const diffDays = (CURRENT_DATE - compDate) / (1000 * 60 * 60 * 24);
  const diffMonths = diffDays / 30.436875;

  if (diffMonths < 0) return 5.0;
  if (diffMonths < 12) return 5.0;
  if (diffMonths < 24) return 3.0;
  if (diffMonths < 36) return 1.0;
  if (diffMonths < 48) return 0.5;
  if (diffMonths < 60) return 0.25;
  return 0.0;
}

function getExponentialBasePoints(rank) {
  const r = parseInt(rank, 10);
  if (isNaN(r) || r < 1) return 0.0;
  return 100.0 * Math.exp(-0.25 * (r - 1));
}

function parsePromotion(cname) {
  const name = (cname || "").toLowerCase();
  if (name.includes("world's strongest") || name.includes("wsm") || name.includes("wsw")) return "WSM";
  if (name.includes("arnold")) return "Arnold Classic";
  if (name.includes("shaw classic") || name.includes("strongest man on earth")) return "Shaw Classic";
  if (name.includes("rogue")) return "Rogue";
  if (name.includes("giants live")) return "Giants Live";
  if (name.includes("europe's strongest") || name.includes("north america's strongest")) return "NASM";
  if (name.includes("strongman champions league") || name.includes("scl")) return "SCL";
  if (name.includes("official strongman") || name.includes("osg")) return "OSG";
  return "Other";
}

function processDivision(rawContests, targetDivision) {
  const divContests = rawContests.filter(c => classifyDivision(c.contest_name) === targetDivision);

  const athletePointsList = {};
  for (const contest of divContests) {
    const cname = contest.contest_name || "";
    const details = contest.details || "";
    const tierInfo = getTierInfo(cname, targetDivision);
    const recencyMult = getRecencyMultiplier(details, cname);

    if (recencyMult === 0.0) continue;

    for (const res of (contest.results || [])) {
      const person = (res.person_name || "").trim();
      const rankVal = res.rank;
      if (!person) continue;
      const basePts = getExponentialBasePoints(rankVal);
      const finalPts = basePts * tierInfo.multiplier * recencyMult;

      if (!athletePointsList[person]) athletePointsList[person] = [];
      athletePointsList[person].push(finalPts);
    }
  }

  const pureMap = {};
  for (const [athlete, ptsList] of Object.entries(athletePointsList)) {
    ptsList.sort((a, b) => b - a);
    const weightedSum = ptsList.reduce((sum, p, idx) => {
      const w = idx < WEIGHTS.length ? WEIGHTS[idx] : 0.0;
      return sum + p * w;
    }, 0);
    pureMap[athlete] = weightedSum;
  }

  const minFieldSize = targetDivision === 'women' ? 3 : 5;
  const rankableContests = [];

  for (const contest of divContests) {
    const cid = contest.contest_id;
    const cname = contest.contest_name;
    const details = contest.details;
    const results = contest.results || [];

    const recencyMult = getRecencyMultiplier(details, cname);
    // Strictly omit any competition older than 60 months (5 years)
    if (recencyMult === 0.0) continue;

    const top5Finishers = results.filter(res => {
      const r = parseInt(res.rank, 10);
      return !isNaN(r) && r >= 1 && r <= 5;
    });

    if (results.length < minFieldSize) continue;

    const rawDiff = top5Finishers.reduce((sum, res) => {
      const person = (res.person_name || "").trim();
      return sum + (pureMap[person] || 0.0);
    }, 0);

    const tierInfo = getTierInfo(cname, targetDivision);

    rankableContests.push({
      contest_id: cid,
      contest_name: cname,
      details: details,
      tier: tierInfo.tier,
      tier_multiplier: tierInfo.multiplier,
      recency_multiplier: recencyMult,
      division: targetDivision,
      total_competitors: results.length,
      raw_difficulty: rawDiff,
      top_5_finishers: top5Finishers.map(r => `${r.person_name} (#${r.rank})`),
      results: results
    });
  }

  const maxRawDiff = Math.max(1.0, ...rankableContests.map(c => c.raw_difficulty));
  for (const c of rankableContests) {
    const norm = Math.pow(c.raw_difficulty / (maxRawDiff || 1.0), POWER_EXPONENT) * 1000.0;
    c.difficulty_score = Math.round(norm * 10) / 10;
  }

  rankableContests.sort((a, b) => b.difficulty_score - a.difficulty_score);
  rankableContests.forEach((c, idx) => {
    c.competition_rank = idx + 1;
  });

  return rankableContests;
}

function runFullRecalculation() {
  const rawContests = JSON.parse(fs.readFileSync(DATASET_FILE, 'utf-8'));

  const menContests = processDivision(rawContests, "men");
  const womenContests = processDivision(rawContests, "women");

  fs.writeFileSync(RANKED_MEN_FILE, JSON.stringify(menContests, null, 2), 'utf-8');
  fs.writeFileSync(RANKED_WOMEN_FILE, JSON.stringify(womenContests, null, 2), 'utf-8');

  const flattenedRows = [];
  for (const [divName, contestList] of [["men", menContests], ["women", womenContests]]) {
    for (const contest of contestList) {
      const cname = contest.contest_name || "";
      const details = contest.details || "";
      const diffScore = contest.difficulty_score || 0.0;
      const promo = parsePromotion(cname);

      const dateMatch = (details || "").match(/(\d{4}-\d{2}-\d{2})/);
      const dateStr = dateMatch ? dateMatch[1] : "2024-06-01";
      const yearVal = dateStr.length >= 4 ? parseInt(dateStr.slice(0, 4), 10) : 2024;

      for (const res of (contest.results || [])) {
        const pname = (res.person_name || "").trim();
        if (!pname) continue;
        const rankVal = parseInt(res.rank, 10);
        if (isNaN(rankVal)) continue;

        const parts = pname.split(' ');
        const fname = parts[0];
        const lname = parts.slice(1).join(' ');

        flattenedRows.append ? null : flattenedRows.push({
          Show_Name: cname,
          Show_Promotion: promo,
          Date: dateStr,
          Year: yearVal,
          PlacementRank: rankVal,
          Competitor_fName: fname,
          Compititor_LName: lname,
          difficulty: diffScore,
          country_code: res.country || '',
          division: divName
        });
      }
    }
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(flattenedRows, null, 2), 'utf-8');
  fs.writeFileSync(FRONTEND_DB_FILE, JSON.stringify(flattenedRows, null, 2), 'utf-8');

  console.log(`Recalculation complete! ${menContests.length} Men's Open and ${womenContests.length} Women's Open competitions ranked (strictly <= 60 months old).`);
  console.log(`Total database rows: ${flattenedRows.length}`);
}

runFullRecalculation();
