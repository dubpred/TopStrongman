const fs = require('fs');
const path = require('path');

const repoDir = "c:\\Users\\bkyou\\Desktop\\antigravity apps\\Strongman Rankings";
const DATASET_FILE = path.join(repoDir, "strongman_contests_dataset.json");
const OUTPUT_RANKINGS = path.join(repoDir, "frontend", "src", "services", "alltime_rankings.json");
const OUTPUT_CONTESTS = path.join(repoDir, "frontend", "src", "services", "ranked_contests.json");

const dataset = JSON.parse(fs.readFileSync(DATASET_FILE, 'utf8'));

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
  if (isWeightOrMasters || isWsmHeat || isSingleLift) {
    return "OMITTED";
  }
  const isWomen = name.includes("women") || name.includes("woman") || name.includes("wsw") || name.includes("female");
  return isWomen ? "women" : "men";
}

function getExponentialBasePoints(rank) {
  const r = parseInt(rank, 10);
  if (isNaN(r) || r < 1) return 0.0;
  return 100.0 * Math.exp(-0.25 * (r - 1));
}

function isOfficialWsmContest(contestName) {
  const name = (contestName || "").toLowerCase();
  const isExcluded = (
    name.includes("natural") || name.includes("masters") || name.includes("amateur") || 
    name.includes("u105") || name.includes("u90") || name.includes("u80") || 
    name.includes("u64") || name.includes("u73") || name.includes("u82") || 
    name.includes("junior") || name.includes("wheelchair") || name.includes("group") || 
    name.includes("heat") || name.includes("qualifier") || name.includes("inspirational")
  );
  if (isExcluded) return false;
  return name.includes("world's strongest man") || name.includes("world's strongest woman");
}

function getTierName(cname) {
  const nLow = (cname || "").toLowerCase();
  if (
    nLow.includes("group") || nLow.includes("heat") || nLow.includes("qualifier") || nLow.includes("qualifying") ||
    nLow.includes("pro/am") || nLow.includes("pro-am") || nLow.includes("amateur") ||
    nLow.includes("shaw classic open") || nLow.includes("official strongman") || nLow.includes("osg")
  ) return { tier: "TIER 4", multiplier: 1.0 };
  if (
    nLow.includes("novice") || nLow.includes("spectacle") || nLow.includes("festif") ||
    nLow.includes("pehar") || nLow.includes("hero of") || nLow.includes("cup of friendship") ||
    nLow.includes("natural")
  ) return { tier: "TIER 5", multiplier: 0.25 };
  if (
    isOfficialWsmContest(cname) ||
    nLow.includes("arnold strongman classic") || nLow.includes("arnold strongwoman classic") || nLow.includes("arnold pro strongwoman") ||
    nLow.includes("strongest man on earth") || nLow.includes("strongest woman on earth") ||
    (nLow.includes("shaw classic") && !nLow.includes("shaw classic open")) || nLow.includes("rogue invitational")
  ) return { tier: "TIER 1", multiplier: 5.0 };
  if (
    nLow.includes("giants live") || nLow.includes("arnold") ||
    nLow.includes("world tour finals") || nLow.includes("strongman classic") || nLow.includes("strongwoman classic") ||
    nLow.includes("world open") || nLow.includes("strongman open") || nLow.includes("strongwoman open")
  ) return { tier: "TIER 2", multiplier: 3.0 };
  if (
    nLow.includes("europe's strongest man") || nLow.includes("europe's strongest woman") ||
    nLow.includes("north america's strongest man") || nLow.includes("north america's strongest woman") ||
    nLow.includes("britain's strongest man") || nLow.includes("america's strongest man")
  ) return { tier: "TIER 3", multiplier: 2.0 };
  return { tier: "TIER 4", multiplier: 1.0 };
}

function getContestYear(details, cname) {
  const match = (details || cname || '').match(/\b(19\d\d|20\d\d)\b/);
  return match ? parseInt(match[1]) : 2000;
}

function getEraKey(year) {
  if (year < 1990) return '1977-1989';
  if (year < 2002) return '1990-2001';
  if (year < 2020) return '2002-2019';
  return '2020-2026';
}

function processAllContests(rawContests, targetDivision = "men") {
  const divContests = rawContests.filter(c => classifyDivision(c.contest_name) === targetDivision);

  // Iteration 1: Baseline athlete points from raw placements & tier multipliers
  const athleteBasePts = {};
  for (const contest of divContests) {
    const cname = contest.contest_name || "";
    const tierInfo = getTierName(cname);
    for (const res of (contest.results || [])) {
      const person = (res.person_name || "").trim();
      const r = parseInt(res.rank, 10);
      if (!person || isNaN(r) || r < 1) continue;
      const pts = getExponentialBasePoints(r) * tierInfo.multiplier;
      if (!athleteBasePts[person]) athleteBasePts[person] = [];
      athleteBasePts[person].push(pts);
    }
  }

  const WEIGHTS_10 = [1.0, 0.90, 0.80, 0.70, 0.60, 0.50, 0.40, 0.30, 0.20, 0.10];
  let athleteRating = {};
  for (const [person, ptsList] of Object.entries(athleteBasePts)) {
    ptsList.sort((a, b) => b - a);
    let sum = 0;
    for (let i = 0; i < Math.min(ptsList.length, WEIGHTS_10.length); i++) {
      sum += ptsList[i] * WEIGHTS_10[i];
    }
    athleteRating[person] = sum;
  }

  // Iteration 2-3: Graph Convergence for Competition Difficulty with Era Normalization
  for (let iter = 0; iter < 3; iter++) {
    const contestDifficulties = {};
    for (const contest of divContests) {
      const top5 = (contest.results || []).filter(res => {
        const r = parseInt(res.rank, 10);
        return !isNaN(r) && r >= 1 && r <= 5;
      });
      let rawDiff = 0;
      for (const res of top5) {
        const p = (res.person_name || "").trim();
        rawDiff += (athleteRating[p] || 0);
      }
      if (isOfficialWsmContest(contest.contest_name)) rawDiff *= 1.35;
      contestDifficulties[contest.contest_id] = rawDiff;
    }

    // Era-based maximum raw field strength
    const eraMaxRaw = {};
    for (const contest of divContests) {
      const y = getContestYear(contest.details, contest.contest_name);
      const eraKey = getEraKey(y);
      const raw = contestDifficulties[contest.contest_id] || 0;
      if (!eraMaxRaw[eraKey] || raw > eraMaxRaw[eraKey]) eraMaxRaw[eraKey] = raw;
    }

    const athleteScaledPts = {};
    for (const contest of divContests) {
      const y = getContestYear(contest.details, contest.contest_name);
      const eraKey = getEraKey(y);
      const maxR = Math.max(eraMaxRaw[eraKey] || 1.0, 1.0);
      const raw = contestDifficulties[contest.contest_id] || 0;
      const tierInfo = getTierName(contest.contest_name);

      let diffScore = Math.pow(raw / maxR, 1.2) * 1000.0;
      diffScore = Math.min(1000.0, diffScore);

      for (const res of (contest.results || [])) {
        const person = (res.person_name || "").trim();
        const r = parseInt(res.rank, 10);
        if (!person || isNaN(r) || r < 1) continue;
        const placementFactor = Math.exp(-0.25 * (r - 1));
        const pts = Math.round(diffScore * placementFactor * 10) / 10;
        if (!athleteScaledPts[person]) athleteScaledPts[person] = [];
        athleteScaledPts[person].push({
          contest: contest.contest_name,
          rank: r,
          points: pts
        });
      }
    }

    for (const [person, ptsList] of Object.entries(athleteScaledPts)) {
      ptsList.sort((a, b) => b.points - a.points);
      let sum = 0;
      for (let i = 0; i < Math.min(ptsList.length, WEIGHTS_10.length); i++) {
        sum += ptsList[i].points * WEIGHTS_10[i];
      }
      athleteRating[person] = sum;
    }
  }

  // Final Difficulty Pass with Era Normalization
  const contestDifficulties = {};
  for (const contest of divContests) {
    const top5 = (contest.results || []).filter(res => {
      const r = parseInt(res.rank, 10);
      return !isNaN(r) && r >= 1 && r <= 5;
    });
    let rawDiff = 0;
    for (const res of top5) {
      const p = (res.person_name || "").trim();
      rawDiff += (athleteRating[p] || 0);
    }
    if (isOfficialWsmContest(contest.contest_name)) rawDiff *= 1.35;
    contestDifficulties[contest.contest_id] = rawDiff;
  }

  const eraMaxRaw = {};
  for (const contest of divContests) {
    const y = getContestYear(contest.details, contest.contest_name);
    const eraKey = getEraKey(y);
    const raw = contestDifficulties[contest.contest_id] || 0;
    if (!eraMaxRaw[eraKey] || raw > eraMaxRaw[eraKey]) eraMaxRaw[eraKey] = raw;
  }

  // Build top shows breakdown map for all athletes
  const athleteTopShowsMap = {};
  for (const contest of divContests) {
    const y = getContestYear(contest.details, contest.contest_name);
    const eraKey = getEraKey(y);
    const maxR = Math.max(eraMaxRaw[eraKey] || 1.0, 1.0);
    const raw = contestDifficulties[contest.contest_id] || 0;
    const tierInfo = getTierName(contest.contest_name);

    let diffScore = Math.round(Math.pow(raw / maxR, 1.2) * 1000.0 * 10) / 10;
    diffScore = Math.min(1000.0, diffScore);

    for (const res of (contest.results || [])) {
      const person = (res.person_name || "").trim();
      const r = parseInt(res.rank, 10);
      if (!person || isNaN(r) || r < 1) continue;
      const placementFactor = Math.exp(-0.25 * (r - 1));
      const basePts = Math.round(100.0 * placementFactor * 10) / 10;
      const pts = Math.round(diffScore * placementFactor * 10) / 10;
      const isMajorWin = (tierInfo.tier === "TIER 1" || isOfficialWsmContest(contest.contest_name)) && r === 1;
      const bonus = isMajorWin ? 1000.0 : 0.0;
      const totalShowPts = pts + bonus;

      if (!athleteTopShowsMap[person]) athleteTopShowsMap[person] = [];
      athleteTopShowsMap[person].push({
        contest: contest.contest_name,
        rank: r,
        basePoints: basePts,
        tierMultiplier: tierInfo.multiplier,
        recencyMultiplier: 1.0,
        rawPoints: totalShowPts,
        bonus
      });
    }
  }

  const athleteTopEvaluatedMap = {};
  for (const [person, shows] of Object.entries(athleteTopShowsMap)) {
    shows.sort((a, b) => b.rawPoints - a.rawPoints);
    const evaluated = [];
    for (let i = 0; i < Math.min(shows.length, WEIGHTS_10.length); i++) {
      const w = WEIGHTS_10[i];
      const pts = shows[i].rawPoints;
      const weightedPts = Math.round(pts * w * 10) / 10;
      evaluated.push({
        contest: shows[i].contest,
        rank: shows[i].rank,
        basePoints: shows[i].basePoints,
        tierMultiplier: shows[i].tierMultiplier,
        recencyMultiplier: shows[i].recencyMultiplier,
        rawPoints: pts,
        bonus: shows[i].bonus || 0,
        weight: w,
        weightedPoints: weightedPts
      });
    }
    athleteTopEvaluatedMap[person] = evaluated;
  }

  const competitorMap = {};
  const contestMap = {};

  for (const contest of divContests) {
    const cid = contest.contest_id;
    const cname = contest.contest_name;
    const details = contest.details || "";
    const y = getContestYear(details, cname);
    const eraKey = getEraKey(y);
    const maxR = Math.max(eraMaxRaw[eraKey] || 1.0, 1.0);
    const rawDiff = Math.round((contestDifficulties[cid] || 0) * 10) / 10;
    const tierInfo = getTierName(cname);

    let diffScore = Math.round(Math.pow(rawDiff / maxR, 1.2) * 1000.0 * 10) / 10;
    diffScore = Math.min(1000.0, diffScore);

    const year = y;

    const top5Contributors = (contest.results || [])
      .filter(res => {
        const r = parseInt(res.rank, 10);
        return !isNaN(r) && r >= 1 && r <= 5;
      })
      .map(res => {
        const p = (res.person_name || "").trim();
        const pwr = Math.round((athleteRating[p] || 0) * 10) / 10;
        const pct = rawDiff > 0 ? Math.round((pwr / rawDiff) * 1000) / 10 : 0;
        return {
          rank: res.rank,
          person_name: p,
          country: res.country || "",
          power: pwr,
          percent: pct,
          top_shows: athleteTopEvaluatedMap[p] || [],
          label: `${p} (${res.country || 'N/A'}) [Power: ${pwr.toLocaleString()}]`
        };
      });

    const enrichedResults = (contest.results || []).map(res => {
      const person = (res.person_name || "").trim();
      const r = parseInt(res.rank, 10);
      const isRanked = !isNaN(r) && r >= 1;
      const placementFactor = isRanked ? Math.exp(-0.25 * (r - 1)) : 0;
      const earnedPts = isRanked ? Math.round(diffScore * placementFactor * 10) / 10 : 0;
      const isMajorWin = isRanked && (tierInfo.tier === "TIER 1" || isOfficialWsmContest(cname)) && r === 1;
      const bonus = isMajorWin ? 1000.0 : 0.0;

      return {
        rank: res.rank,
        person_name: person,
        country: res.country || "",
        score: res.score,
        points: earnedPts + bonus,
        basePoints: earnedPts,
        bonus
      };
    });

    contestMap[cname] = {
      name: cname,
      contest_name: cname,
      details,
      tier: tierInfo.tier,
      tier_multiplier: tierInfo.multiplier,
      recency_multiplier: 1.0,
      division: targetDivision,
      difficulty: diffScore,
      difficulty_score: diffScore,
      raw_difficulty: rawDiff,
      max_raw_difficulty: Math.round(maxR * 10) / 10,
      top_5_finishers: top5Contributors,
      results: enrichedResults
    };

    for (const res of (contest.results || [])) {
      const person = (res.person_name || "").trim();
      const r = parseInt(res.rank, 10);
      if (!person || isNaN(r) || r < 1) continue;

      const placementFactor = Math.exp(-0.25 * (r - 1));
      const contestPts = Math.round(diffScore * placementFactor * 10) / 10;
      const isMajorWin = (tierInfo.tier === "TIER 1" || isOfficialWsmContest(cname)) && r === 1;
      const bonus = isMajorWin ? 1000.0 : 0.0;
      const totalContestPts = Math.round((contestPts + bonus) * 10) / 10;

      if (!competitorMap[person]) {
        competitorMap[person] = {
          name: person,
          country: res.country || "",
          careerShows: [],
          wsmWins: 0,
          wsmPodiums: 0,
          ascWins: 0,
          smoeWins: 0,
          rogueWins: 0,
          esmWins: 0,
          totalWins: 0,
          totalPodiums: 0,
          startYear: year,
          endYear: year
        };
      }

      const c = competitorMap[person];
      if (res.country && !c.country) c.country = res.country;
      if (year < c.startYear) c.startYear = year;
      if (year > c.endYear) c.endYear = year;

      if (r === 1) c.totalWins++;
      if (r <= 3) c.totalPodiums++;

      const nLow = cname.toLowerCase();
      if (isOfficialWsmContest(cname)) {
        if (r === 1) c.wsmWins++;
        if (r <= 3) c.wsmPodiums++;
      }
      if ((nLow.includes("arnold strongman classic") || nLow.includes("arnold strongwoman classic") || nLow.includes("arnold pro strongwoman")) && !nLow.includes("amateur") && !nLow.includes("pro/am") && !nLow.includes("pro-am") && r === 1) c.ascWins++;
      if (((nLow.includes("shaw classic") && !nLow.includes("shaw classic open")) || nLow.includes("strongest man on earth") || nLow.includes("strongest woman on earth")) && r === 1) c.smoeWins++;
      if (nLow.includes("rogue") && r === 1) c.rogueWins++;
      if ((nLow.includes("europe's strongest man") || nLow.includes("europe's strongest woman")) && !nLow.includes("natural") && !nLow.includes("masters") && r === 1) c.esmWins++;

      c.careerShows.push({
        contest: cname,
        year,
        rank: r,
        difficulty: diffScore,
        points: totalContestPts,
        basePlacementPts: contestPts,
        bonus
      });
    }
  }

  const rankings = Object.values(competitorMap)
    .filter(comp => comp.careerShows.length > 0)
    .map(comp => {
      comp.careerShows.sort((a, b) => b.points - a.points);
      const top10Shows = comp.careerShows.slice(0, 10);
      let top10Points = 0;
      for (const show of top10Shows) {
        top10Points += show.points;
      }

      const majorTitles = comp.wsmWins + comp.ascWins + comp.smoeWins + comp.rogueWins;
      const goatScore = Math.round(top10Points * 10) / 10;
      const winRate = comp.careerShows.length > 0 ? Math.round((comp.totalWins / comp.careerShows.length) * 1000) / 10 : 0;
      const podiumRate = comp.careerShows.length > 0 ? Math.round((comp.totalPodiums / comp.careerShows.length) * 1000) / 10 : 0;

      let era = "Modern Era";
      if (comp.startYear < 1990) era = "Golden Era (1977–1989)";
      else if (comp.startYear < 2002) era = "Nordic Dominance (1990–2001)";
      else if (comp.startYear < 2020) era = "Titan Era (2002–2019)";
      else era = "New Era (2020–Present)";

      const parts = comp.name.split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ');

      return {
        name: comp.name,
        firstName,
        lastName,
        country: comp.country,
        goatScore,
        totalShows: comp.careerShows.length,
        evaluatedCount: top10Shows.length,
        totalWins: comp.totalWins,
        totalPodiums: comp.totalPodiums,
        winRate,
        podiumRate,
        wsmWins: comp.wsmWins,
        wsmPodiums: comp.wsmPodiums,
        ascWins: comp.ascWins,
        smoeWins: comp.smoeWins,
        rogueWins: comp.rogueWins,
        esmWins: comp.esmWins,
        majorTitles,
        activeYears: comp.startYear === comp.endYear ? `${comp.startYear}` : `${comp.startYear}–${comp.endYear}`,
        startYear: comp.startYear,
        endYear: comp.endYear,
        era,
        topShows: top10Shows
      };
    });

  rankings.sort((a, b) => b.goatScore - a.goatScore || b.totalWins - a.totalWins);
  rankings.forEach((comp, idx) => {
    comp.rank = idx + 1;
  });

  return { rankings, contestMap };
}

const menData = processAllContests(dataset, "men");
const womenData = processAllContests(dataset, "women");

const allContestsCombined = { ...menData.contestMap, ...womenData.contestMap };

// Helper to compute active 5-year rolling athlete ratings with top contributing shows
function calculateActiveRatings(contests) {
  const athleteShowsMap = {};
  const WEIGHTS = [1.0, 0.90, 0.80, 0.70, 0.60, 0.50, 0.40, 0.30, 0.20, 0.10];
  
  contests.forEach(c => {
    const tierMult = c.tier_multiplier || 1.0;
    const recMult = c.recency_multiplier || 1.0;
    (c.results || []).forEach(r => {
      const p = (r.person_name || '').trim();
      const rankNum = parseInt(r.rank, 10);
      if (!p || isNaN(rankNum) || rankNum < 1) return;
      const basePts = Math.round(100.0 * Math.exp(-0.25 * (rankNum - 1)) * 100) / 100;
      const finalPts = Math.round(basePts * tierMult * recMult * 10) / 10;
      if (!athleteShowsMap[p]) athleteShowsMap[p] = [];
      athleteShowsMap[p].push({
        contest: c.contest_name,
        rank: rankNum,
        basePoints: basePts,
        tierMultiplier: tierMult,
        recencyMultiplier: recMult,
        rawPoints: finalPts
      });
    });
  });

  const ratingMap = {};
  const topShowsMap = {};

  for (const [p, shows] of Object.entries(athleteShowsMap)) {
    shows.sort((a, b) => b.rawPoints - a.rawPoints);
    let sum = 0;
    const evaluated = [];
    for (let i = 0; i < Math.min(shows.length, WEIGHTS.length); i++) {
      const w = WEIGHTS[i];
      const pts = shows[i].rawPoints;
      const weightedPts = Math.round(pts * w * 10) / 10;
      sum += weightedPts;
      evaluated.push({
        contest: shows[i].contest,
        rank: shows[i].rank,
        basePoints: shows[i].basePoints,
        tierMultiplier: shows[i].tierMultiplier,
        recencyMultiplier: shows[i].recencyMultiplier,
        rawPoints: pts,
        weight: w,
        weightedPoints: weightedPts
      });
    }
    ratingMap[p] = Math.round(sum * 10) / 10;
    topShowsMap[p] = evaluated;
  }
  return { ratingMap, topShowsMap };
}

const OUTPUT_ALLTIME_CONTESTS = path.join(repoDir, "frontend", "src", "services", "alltime_contests.json");
const OUTPUT_ACTIVE_CONTESTS = path.join(repoDir, "frontend", "src", "services", "active_contests.json");

const activeContestsMap = {};
const activeMenFile = path.join(repoDir, "strongman_contests_ranked_last_5_years.json");
const activeWomenFile = path.join(repoDir, "strongwoman_contests_ranked_last_5_years.json");

if (fs.existsSync(activeMenFile)) {
  const activeMen = JSON.parse(fs.readFileSync(activeMenFile, 'utf8'));
  const { ratingMap: activeMenRatings, topShowsMap: activeMenShows } = calculateActiveRatings(activeMen);
  const maxActiveRaw = Math.max(...activeMen.map(c => c.raw_difficulty || 0), 1.0);

  activeMen.forEach(c => {
    if (c.contest_name) {
      const rawDiff = Math.round((c.raw_difficulty || 0) * 10) / 10;
      const top5WithPower = (c.results || [])
        .filter(r => {
          const rNum = parseInt(r.rank, 10);
          return !isNaN(rNum) && rNum >= 1 && rNum <= 5;
        })
        .map(r => {
          const p = (r.person_name || '').trim();
          const pwr = Math.round((activeMenRatings[p] || 0) * 10) / 10;
          const pct = rawDiff > 0 ? Math.round((pwr / rawDiff) * 1000) / 10 : 0;
          return {
            rank: r.rank,
            person_name: p,
            country: r.country || '',
            power: pwr,
            percent: pct,
            top_shows: activeMenShows[p] || [],
            label: `${p} (${r.country || 'N/A'}) [Power: ${pwr.toLocaleString()}]`
          };
        });

      activeContestsMap[c.contest_name] = {
        name: c.contest_name,
        contest_name: c.contest_name,
        details: c.details,
        tier: (c.tier || 'TIER 4').replace('_', ' '),
        tier_multiplier: c.tier_multiplier || 1.0,
        recency_multiplier: c.recency_multiplier || 1.0,
        division: 'men',
        difficulty: c.difficulty_score,
        difficulty_score: c.difficulty_score,
        raw_difficulty: rawDiff,
        max_raw_difficulty: Math.round(maxActiveRaw * 10) / 10,
        top_5_finishers: top5WithPower,
        results: c.results || []
      };
    }
  });
}

if (fs.existsSync(activeWomenFile)) {
  const activeWomen = JSON.parse(fs.readFileSync(activeWomenFile, 'utf8'));
  const { ratingMap: activeWomenRatings, topShowsMap: activeWomenShows } = calculateActiveRatings(activeWomen);
  const maxActiveRawWomen = Math.max(...activeWomen.map(c => c.raw_difficulty || 0), 1.0);

  activeWomen.forEach(c => {
    if (c.contest_name) {
      const rawDiff = Math.round((c.raw_difficulty || 0) * 10) / 10;
      const top5WithPower = (c.results || [])
        .filter(r => {
          const rNum = parseInt(r.rank, 10);
          return !isNaN(rNum) && rNum >= 1 && rNum <= 5;
        })
        .map(r => {
          const p = (r.person_name || '').trim();
          const pwr = Math.round((activeWomenRatings[p] || 0) * 10) / 10;
          const pct = rawDiff > 0 ? Math.round((pwr / rawDiff) * 1000) / 10 : 0;
          return {
            rank: r.rank,
            person_name: p,
            country: r.country || '',
            power: pwr,
            percent: pct,
            top_shows: activeWomenShows[p] || [],
            label: `${p} (${r.country || 'N/A'}) [Power: ${pwr.toLocaleString()}]`
          };
        });

      activeContestsMap[c.contest_name] = {
        name: c.contest_name,
        contest_name: c.contest_name,
        details: c.details,
        tier: (c.tier || 'TIER 4').replace('_', ' '),
        tier_multiplier: c.tier_multiplier || 1.0,
        recency_multiplier: c.recency_multiplier || 1.0,
        division: 'women',
        difficulty: c.difficulty_score,
        difficulty_score: c.difficulty_score,
        raw_difficulty: rawDiff,
        max_raw_difficulty: Math.round(maxActiveRawWomen * 10) / 10,
        top_5_finishers: top5WithPower,
        results: c.results || []
      };
    }
  });
}

const outputPayload = {
  lastUpdated: new Date().toISOString(),
  totalRankedMen: menData.rankings.length,
  totalRankedWomen: womenData.rankings.length,
  men: menData.rankings,
  women: womenData.rankings
};

fs.writeFileSync(OUTPUT_RANKINGS, JSON.stringify(outputPayload, null, 2));
fs.writeFileSync(OUTPUT_ALLTIME_CONTESTS, JSON.stringify(allContestsCombined));
fs.writeFileSync(OUTPUT_ACTIVE_CONTESTS, JSON.stringify(activeContestsMap));
fs.writeFileSync(OUTPUT_CONTESTS, JSON.stringify(allContestsCombined));

console.log(`Generated All-Time dataset with ${menData.rankings.length} Men and ${womenData.rankings.length} Women saved to ${OUTPUT_RANKINGS}`);
console.log(`Generated All-Time Contests Map saved to ${OUTPUT_ALLTIME_CONTESTS}`);
console.log(`Generated Active Contests Map saved to ${OUTPUT_ACTIVE_CONTESTS}`);
