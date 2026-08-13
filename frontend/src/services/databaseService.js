import databaseRows from './database_strongman.json';

// Omit Masters division, weight-class competitions, WSM Group Stage Heats, and single-lift championships
const isOmittedShow = (showName) => {
  const name = (showName || "").toLowerCase();
  const isWeightOrMasters = (
    name.includes("105") || name.includes("u105") ||
    name.includes("u90") || name.includes("u80") ||
    name.includes("masters") || name.includes("novice")
  );
  const isWsmHeat = (name.includes("wsm") && (name.includes("group") || name.includes("heat")));
  const isSingleLift = (
    name.includes("world deadlift") || name.includes("deadlift championship") || name.includes("deadlift championchip") ||
    name.includes("world log lift") || name.includes("log lift championship") || name.includes("log lift championchip") ||
    name.includes("log lift world championship")
  );
  return isWeightOrMasters || isWsmHeat || isSingleLift;
};

// Explicit 5-Tier classification by show name and promotion
const getTierInfo = (promotion, showName) => {
  const name = (showName || "").toLowerCase();
  const promo = (promotion || "").toLowerCase();

  // WSM heats, group stages, qualifiers, Arnold Pro/Am, Arnold Amateur, and Shaw Classic Open are TIER 4 (1.0x)
  if (
    name.includes("group") || name.includes("heat") || name.includes("qualifier") || name.includes("qualifying") ||
    name.includes("pro/am") || name.includes("amateur") || name.includes("shaw classic open")
  ) {
    return { name: "TIER_4", multiplier: 1.0 };
  }

  // TIER 5 — Low-difficulty local spectacles, Masters, Natural, and novice shows (0.25x)
  if (
    name.includes("novice") || name.includes("spectacle") || name.includes("festif") ||
    name.includes("pehar") || name.includes("hero of") || name.includes("cup of friendship") ||
    name.includes("masters") || name.includes("natural")
  ) {
    return { name: "TIER_5", multiplier: 0.25 };
  }

  // TIER 1 — World Championship Level Finals (5.0x)
  // Arnold Strongman / Strongwoman Classic (Ohio main event), WSM, WSW, SMOE, Rogue
  if (
    name.includes("world's strongest man") ||
    name.includes("world's strongest woman") ||
    name.includes("arnold strongman classic") ||
    name.includes("arnold strongwoman classic") ||
    name.includes("arnold pro strongwoman") ||
    name.includes("strongest man on earth") ||
    name.includes("strongest woman on earth") ||
    (name.includes("shaw classic") && !name.includes("shaw classic open")) ||
    name.includes("rogue invitational")
  ) {
    return { name: "TIER_1", multiplier: 5.0 };
  }

  // TIER 2 — Major International & World Series / All other Arnold World Series shows & Giants Live (3.0x)
  if (
    name.includes("giants live") || name.includes("arnold") ||
    name.includes("world tour finals") || name.includes("strongman classic") || name.includes("strongwoman classic") ||
    name.includes("world open") || name.includes("strongman open") || name.includes("strongwoman open") ||
    promo === "giants live"
  ) {
    return { name: "TIER_2", multiplier: 3.0 };
  }

  // TIER 3 — Continental & Premier National Championships (2.0x)
  if (
    name.includes("europe's strongest man") || name.includes("north america's strongest man") ||
    name.includes("britain's strongest man") || name.includes("america's strongest man") ||
    name.includes("official strongman games") || promo === "nasm"
  ) {
    return { name: "TIER_3", multiplier: 2.0 };
  }

  // TIER 4 — National / Regional / SCL Circuit (1.0x)
  if (name.includes("strongman champions league") || name.includes("scl") || name.includes("strongest man")) {
    return { name: "TIER_4", multiplier: 1.0 };
  }

  // TIER 5 — Fallback for minor local shows (0.25x)
  return { name: "TIER_5", multiplier: 0.25 };
};

// 60-Month Recency Decay Curve (Expires after 60 months / 5 years)
const getRecencyMultiplier = (dateStr) => {
  if (!dateStr) return 0.0;
  const currentDate = new Date(); // always use today
  const compDate = new Date(`${dateStr}T00:00:00Z`);

  const diffTime = currentDate - compDate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const diffMonths = diffDays / 30.436875;

  if (diffMonths < 0) return 5.0;   // Current / Upcoming
  if (diffMonths < 12) return 5.0;  // 100% weight (0-12 months)
  if (diffMonths < 24) return 3.0;  // 60% weight (12-24 months)
  if (diffMonths < 36) return 1.0;  // 20% weight (24-36 months)
  if (diffMonths < 48) return 0.5;  // 10% weight (36-48 months)
  if (diffMonths < 60) return 0.25; // 5% weight (48-60 months)
  return 0.0;                       // Expired (>60 months)
};

// Exponential Decay Base Points: 100 * e^(-0.25 * (rank - 1))
const getExponentialBasePoints = (rank) => {
  return 100.0 * Math.exp(-0.25 * (rank - 1));
};

// Metadata for known competitors
const athleteMeta = {
  "Mitchell Hooper": { country: "Canada", countryCode: "CA", flagEmoji: "🇨🇦", heightCm: 191, weightKg: 145 },
  "Tom Stoltman": { country: "United Kingdom", countryCode: "GB", flagEmoji: "🇬🇧", heightCm: 203, weightKg: 180 },
  "Hafthor Björnsson": { country: "Iceland", countryCode: "IS", flagEmoji: "🇮🇸", heightCm: 206, weightKg: 195 },
  "Evan Singleton": { country: "United States", countryCode: "US", flagEmoji: "🇺🇸", heightCm: 198, weightKg: 160 },
  "Trey Mitchell": { country: "United States", countryCode: "US", flagEmoji: "🇺🇸", heightCm: 193, weightKg: 155 },
  "Mateusz Kieliszkowski": { country: "Poland", countryCode: "PL", flagEmoji: "🇵🇱", heightCm: 195, weightKg: 150 },
  "Martins Licis": { country: "United States", countryCode: "US", flagEmoji: "🇺🇸", heightCm: 190, weightKg: 150 },
  "Oleksii Novikov": { country: "Ukraine", countryCode: "UA", flagEmoji: "🇺🇦", heightCm: 185, weightKg: 135 },
  "Luke Stoltman": { country: "United Kingdom", countryCode: "GB", flagEmoji: "🇬🇧", heightCm: 191, weightKg: 150 },
  "Pavlo Kordiyaka": { country: "Ukraine", countryCode: "UA", flagEmoji: "🇺🇦", heightCm: 193, weightKg: 132 },
  "Brian Shaw": { country: "United States", countryCode: "US", flagEmoji: "🇺🇸", heightCm: 203, weightKg: 190 },
  "Bobby Thompson": { country: "United States", countryCode: "US", flagEmoji: "🇺🇸", heightCm: 185, weightKg: 163 },
  "Kevin Faires": { country: "United States", countryCode: "US", flagEmoji: "🇺🇸", heightCm: 188, weightKg: 140 },
  "Aivars Šmaukstelis": { country: "Latvia", countryCode: "LV", flagEmoji: "🇱🇻", heightCm: 186, weightKg: 142 },
  "Thomas Evans": { country: "United States", countryCode: "US", flagEmoji: "🇺🇸", heightCm: 191, weightKg: 145 },
  "Luke Richardson": { country: "United Kingdom", countryCode: "GB", flagEmoji: "🇬🇧", heightCm: 193, weightKg: 150 },
  "Adam Bishop": { country: "United Kingdom", countryCode: "GB", flagEmoji: "🇬🇧", heightCm: 192, weightKg: 158 },
  "Paddy Haynes": { country: "United Kingdom", countryCode: "GB", flagEmoji: "🇬🇧", heightCm: 196, weightKg: 155 },
  "Rayno Nel": { country: "South Africa", countryCode: "ZA", flagEmoji: "🇿🇦", heightCm: 196, weightKg: 155 },
  "Kevin Hazeleger": { country: "Netherlands", countryCode: "NL", flagEmoji: "🇳🇱", heightCm: 192, weightKg: 145 },
  "Adam Roszkowski": { country: "Poland", countryCode: "PL", flagEmoji: "🇵🇱", heightCm: 195, weightKg: 148 },
  "Oskar Ziółkowski": { country: "Poland", countryCode: "PL", flagEmoji: "🇵🇱", heightCm: 196, weightKg: 148 },
  "Kane Francis": { country: "United Kingdom", countryCode: "GB", flagEmoji: "🇬🇧", heightCm: 193, weightKg: 145 },
  "Pavlo Nakonechnyy": { country: "Ukraine", countryCode: "UA", flagEmoji: "🇺🇦", heightCm: 185, weightKg: 130 },
  "Ondřej Fojtů": { country: "Czech Republic", countryCode: "CZ", flagEmoji: "🇨🇿", heightCm: 190, weightKg: 140 },
  "Oleh Pylypiak": { country: "Ukraine", countryCode: "UA", flagEmoji: "🇺🇦", heightCm: 188, weightKg: 132 },
  "Patrick Eibel": { country: "Germany", countryCode: "DE", flagEmoji: "🇩🇪", heightCm: 196, weightKg: 150 },
  "Evans Nana Aryee": { country: "Ghana", countryCode: "GH", flagEmoji: "🇬🇭", heightCm: 192, weightKg: 148 },
  "Brian Kichton": { country: "Canada", countryCode: "CA", flagEmoji: "🇨🇦", heightCm: 194, weightKg: 145 },
  "Cheick Sanou": { country: "Burkina Faso", countryCode: "BF", flagEmoji: "🇧🇫", heightCm: 194, weightKg: 165 },
  "Eddie Williams": { country: "United States", countryCode: "US", flagEmoji: "🇺🇸", heightCm: 196, weightKg: 160 },
  "Austin Andrade": { country: "United States", countryCode: "US", flagEmoji: "🇺🇸", heightCm: 191, weightKg: 145 },
  "Mathew Ragg": { country: "New Zealand", countryCode: "NZ", flagEmoji: "🇳🇿", heightCm: 193, weightKg: 145 },
  "Rongo Keene": { country: "New Zealand", countryCode: "NZ", flagEmoji: "🇳🇿", heightCm: 195, weightKg: 150 },
  "Nick Guardione": { country: "United States", countryCode: "US", flagEmoji: "🇺🇸", heightCm: 188, weightKg: 145 },
  "Josh Patacca": { country: "Australia", countryCode: "AU", flagEmoji: "🇦🇺", heightCm: 192, weightKg: 148 },
  "Andrew Flynn": { country: "Ireland", countryCode: "IE", flagEmoji: "🇮🇪", heightCm: 196, weightKg: 152 },
  "Bryce Gould": { country: "United States", countryCode: "US", flagEmoji: "🇺🇸", heightCm: 191, weightKg: 148 },
  "Ervin Toots": { country: "Estonia", countryCode: "EE", flagEmoji: "🇪🇪", heightCm: 192, weightKg: 148 },
  "Jaco Schoonwinkel": { country: "South Africa", countryCode: "ZA", flagEmoji: "🇿🇦", heightCm: 193, weightKg: 152 },
  "Jesper Hansson": { country: "Sweden", countryCode: "SE", flagEmoji: "🇸🇪", heightCm: 194, weightKg: 148 },
  "Péter Juhász": { country: "Hungary", countryCode: "HU", flagEmoji: "🇭🇺", heightCm: 191, weightKg: 145 },
};

// Derive country from name for SCL athletes using known nationalities 
const countryLookup = {
  // Known SCL regulars - Latvia
  "Aivars Šmaukstelis": "LV", "Maris Krievelis": "LV",
  // Poland
  "Oskar Ziółkowski": "PL", "Adam Roszkowski": "PL",
  // Netherlands
  "Kevin Hazeleger": "NL", "Kelvin de Ruiter": "NL",
  // UK
  "Kane Francis": "GB", "Adam Bishop": "GB", "Luke Stoltman": "GB", "Tom Stoltman": "GB", 
  "Luke Richardson": "GB", "Paddy Haynes": "GB", "Gavin Bilton": "GB",
  // USA
  "Mitchell Hooper": "CA", "Trey Mitchell": "US", "Evan Singleton": "US", "Nick Wortham": "US",
  "Martins Licis": "US", "Eddie Williams": "US", "Austin Andrade": "US",
  // Germany
  "Patrick Eibel": "DE",
  // Czech Republic
  "Ondřej Fojtů": "CZ", "Jan Lacina": "CZ",
  // Ukraine
  "Oleksii Novikov": "UA", "Pavlo Kordiyaka": "UA", "Oleh Pylypiak": "UA", "Pavlo Nakonechnyy": "UA",
  // South Africa
  "Rayno Nel": "ZA", "Jaco Schoonwinkel": "ZA",
  // Ghana
  "Evans Nana Aryee": "GH",
  // Canada
  "Mitchell Hooper": "CA", "Brian Kichton": "CA",
  // Serbia/Estonia
  "Ervin Toots": "EE",
  // Iceland
  "Hafthor Björnsson": "IS",
};

const countryCodeMap = {
  "USA": { country: "United States", flagEmoji: "🇺🇸" },
  "GBR": { country: "United Kingdom", flagEmoji: "🇬🇧" },
  "ENG": { country: "England", flagEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "SCO": { country: "Scotland", flagEmoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  "WAL": { country: "Wales", flagEmoji: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  "CAN": { country: "Canada", flagEmoji: "🇨🇦" },
  "ISL": { country: "Iceland", flagEmoji: "🇮🇸" },
  "UKR": { country: "Ukraine", flagEmoji: "🇺🇦" },
  "POL": { country: "Poland", flagEmoji: "🇵🇱" },
  "NED": { country: "Netherlands", flagEmoji: "🇳🇱" },
  "NLD": { country: "Netherlands", flagEmoji: "🇳🇱" },
  "LAT": { country: "Latvia", flagEmoji: "🇱🇻" },
  "LTV": { country: "Latvia", flagEmoji: "🇱🇻" },
  "LTU": { country: "Lithuania", flagEmoji: "🇱🇹" },
  "EST": { country: "Estonia", flagEmoji: "🇪🇪" },
  "FIN": { country: "Finland", flagEmoji: "🇫🇮" },
  "NOR": { country: "Norway", flagEmoji: "🇳🇴" },
  "SWE": { country: "Sweden", flagEmoji: "🇸🇪" },
  "DEN": { country: "Denmark", flagEmoji: "🇩🇰" },
  "GER": { country: "Germany", flagEmoji: "🇩🇪" },
  "DEU": { country: "Germany", flagEmoji: "🇩🇪" },
  "FRA": { country: "France", flagEmoji: "🇫🇷" },
  "ITA": { country: "Italy", flagEmoji: "🇮🇹" },
  "ESP": { country: "Spain", flagEmoji: "🇪🇸" },
  "POR": { country: "Portugal", flagEmoji: "🇵🇹" },
  "CZE": { country: "Czech Republic", flagEmoji: "🇨🇿" },
  "SVK": { country: "Slovakia", flagEmoji: "🇸🇰" },
  "HUN": { country: "Hungary", flagEmoji: "🇭🇺" },
  "AUT": { country: "Austria", flagEmoji: "🇦🇹" },
  "SUI": { country: "Switzerland", flagEmoji: "🇨🇭" },
  "BEL": { country: "Belgium", flagEmoji: "🇧🇪" },
  "IRL": { country: "Ireland", flagEmoji: "🇮🇪" },
  "AUS": { country: "Australia", flagEmoji: "🇦🇺" },
  "NZL": { country: "New Zealand", flagEmoji: "🇳🇿" },
  "ZAF": { country: "South Africa", flagEmoji: "🇿🇦" },
  "RSA": { country: "South Africa", flagEmoji: "🇿🇦" },
  "GHA": { country: "Ghana", flagEmoji: "🇬🇭" },
  "NGR": { country: "Nigeria", flagEmoji: "🇳🇬" },
  "BUR": { country: "Burkina Faso", flagEmoji: "🇧🇫" },
  "BFA": { country: "Burkina Faso", flagEmoji: "🇧🇫" },
  "CMR": { country: "Cameroon", flagEmoji: "🇨🇲" },
  "EGY": { country: "Egypt", flagEmoji: "🇪🇬" },
  "ALG": { country: "Algeria", flagEmoji: "🇩🇿" },
  "MAR": { country: "Morocco", flagEmoji: "🇲🇦" },
  "GEO": { country: "Georgia", flagEmoji: "🇬🇪" },
  "ARM": { country: "Armenia", flagEmoji: "🇦🇲" },
  "AZE": { country: "Azerbaijan", flagEmoji: "🇦🇿" },
  "SRB": { country: "Serbia", flagEmoji: "🇷🇸" },
  "CRO": { country: "Croatia", flagEmoji: "🇭🇷" },
  "SLO": { country: "Slovenia", flagEmoji: "🇸🇮" },
  "BIH": { country: "Bosnia and Herzegovina", flagEmoji: "🇧🇦" },
  "BUL": { country: "Bulgaria", flagEmoji: "🇧🇬" },
  "ROU": { country: "Romania", flagEmoji: "🇷🇴" },
  "GRE": { country: "Greece", flagEmoji: "🇬🇷" },
  "CYP": { country: "Cyprus", flagEmoji: "🇨🇾" },
  "TUR": { country: "Turkey", flagEmoji: "🇹🇷" },
  "RUS": { country: "Russia", flagEmoji: "🇷🇺" },
  "BLR": { country: "Belarus", flagEmoji: "🇧🇾" },
  "KAZ": { country: "Kazakhstan", flagEmoji: "🇰🇿" },
  "UZB": { country: "Uzbekistan", flagEmoji: "🇺🇿" },
  "KYR": { country: "Kyrgyzstan", flagEmoji: "🇰🇬" },
  "TJK": { country: "Tajikistan", flagEmoji: "🇹🇯" },
  "MNG": { country: "Mongolia", flagEmoji: "🇲🇳" },
  "CHN": { country: "China", flagEmoji: "🇨🇳" },
  "JPN": { country: "Japan", flagEmoji: "🇯🇵" },
  "KOR": { country: "South Korea", flagEmoji: "🇰🇷" },
  "IND": { country: "India", flagEmoji: "🇮🇳" },
  "PAK": { country: "Pakistan", flagEmoji: "🇵🇰" },
  "MAS": { country: "Malaysia", flagEmoji: "🇲🇾" },
  "PHI": { country: "Philippines", flagEmoji: "🇵🇭" },
  "IRI": { country: "Iran", flagEmoji: "🇮🇷" },
  "IRQ": { country: "Iraq", flagEmoji: "🇮🇶" },
  "UAE": { country: "United Arab Emirates", flagEmoji: "🇦🇪" },
  "OMA": { country: "Oman", flagEmoji: "🇴🇲" },
  "KUW": { country: "Kuwait", flagEmoji: "🇰🇼" },
  "LBN": { country: "Lebanon", flagEmoji: "🇱🇧" },
  "BRN": { country: "Bahrain", flagEmoji: "🇧🇭" },
  "PLE": { country: "Palestine", flagEmoji: "🇵🇸" },
  "MEX": { country: "Mexico", flagEmoji: "🇲🇽" },
  "BRA": { country: "Brazil", flagEmoji: "🇧🇷" },
  "ARG": { country: "Argentina", flagEmoji: "🇦🇷" },
  "COL": { country: "Colombia", flagEmoji: "🇨🇴" },
  "CHI": { country: "Chile", flagEmoji: "🇨🇱" },
  "URU": { country: "Uruguay", flagEmoji: "🇺🇾" },
  "BOL": { country: "Bolivia", flagEmoji: "🇧🇴" },
  "VEN": { country: "Venezuela", flagEmoji: "🇻🇪" },
  "PUR": { country: "Puerto Rico", flagEmoji: "🇵🇷" },
  "GRL": { country: "Greenland", flagEmoji: "🇬🇱" },
  "ZAM": { country: "Zambia", flagEmoji: "🇿🇲" }
};

function getCountryData(fullName, rowCountryCode) {
  const code = (rowCountryCode || countryLookup[fullName] || "").toUpperCase().trim();
  if (code && countryCodeMap[code]) {
    return { country: countryCodeMap[code].country, countryCode: code, flagEmoji: countryCodeMap[code].flagEmoji };
  }

  const meta = athleteMeta[fullName];
  if (meta) return { country: meta.country, countryCode: meta.countryCode, flagEmoji: meta.flagEmoji };
  
  return { country: "International", countryCode: "INT" };
}

export function computeRankingsFromDatabase(options = {}) {
  const {
    yearsLimit = 5,
    placementLimit = 'all',
    division = 'men'
  } = options;

  const targetDivision = division === 'women' ? 'women' : 'men';

  const isWithinTimeframe = (dateStr) => {
    if (!dateStr) return false;
    const currentDate = new Date();
    const compDate = new Date(`${dateStr}T00:00:00Z`);
    const diffDays = (currentDate - compDate) / (1000 * 60 * 60 * 24);
    const diffMonths = diffDays / 30.436875;
    return diffMonths <= (yearsLimit * 12);
  };

  // Step 1: Calculate Pure Rankings using Top-6 Best Results Cap
  const athletePtsList = {};
  databaseRows.forEach((row) => {
    const rowDiv = row.division || 'men';
    if (rowDiv !== targetDivision) return;
    if (!isWithinTimeframe(row.Date)) return;

    const recencyMult = getRecencyMultiplier(row.Date);
    if (recencyMult === 0.0) return;

    const fullName = `${row.Competitor_fName} ${row.Compititor_LName}`;
    const tierInfo = getTierInfo(row.Show_Promotion, row.Show_Name);
    const basePts = getExponentialBasePoints(row.PlacementRank);
    const finalPts = basePts * tierInfo.multiplier * recencyMult;

    if (!athletePtsList[fullName]) athletePtsList[fullName] = [];
    athletePtsList[fullName].push(finalPts);
  });

  const WEIGHTS = [1.0, 0.85, 0.70, 0.55, 0.40, 0.30, 0.20, 0.15, 0.10, 0.05];
  const pureMap = {};
  for (const [name, ptsArray] of Object.entries(athletePtsList)) {
    ptsArray.sort((a, b) => b - a);
    const weightedSum = ptsArray.reduce((sum, val, idx) => {
      const weight = idx < WEIGHTS.length ? WEIGHTS[idx] : 0.0;
      return sum + val * weight;
    }, 0);
    pureMap[name] = weightedSum;
  }

  const sortedPureAthletes = Object.keys(pureMap).sort((a, b) => pureMap[b] - pureMap[a]);
  const pureRankMap = {};
  sortedPureAthletes.forEach((name, idx) => {
    pureRankMap[name] = {
      pureRank: idx + 1,
      purePoints: Math.round(pureMap[name] * 10.0) / 10.0
    };
  });

  // Step 2: Calculate Competition Difficulty within timeframe
  const showGroupMap = {};
  databaseRows.forEach((row) => {
    const rowDiv = row.division || 'men';
    if (rowDiv !== targetDivision) return;
    if (!isWithinTimeframe(row.Date)) return;
    if (getRecencyMultiplier(row.Date) === 0.0) return;
    if (!showGroupMap[row.Show_Name]) showGroupMap[row.Show_Name] = [];
    showGroupMap[row.Show_Name].push(row);
  });

  const showRawDifficulties = {};
  for (const [showName, placements] of Object.entries(showGroupMap)) {
    const top5 = placements.filter(p => p.PlacementRank <= 5);
    const rawDiff = top5.reduce((sum, p) => {
      const fullName = `${p.Competitor_fName} ${p.Compititor_LName}`;
      return sum + (pureRankMap[fullName]?.purePoints || 0);
    }, 0);
    showRawDifficulties[showName] = rawDiff;
  }

  const maxRawDiff = Math.max(0, ...Object.values(showRawDifficulties));
  const showDifficulties = {};
  for (const [showName, rawDiff] of Object.entries(showRawDifficulties)) {
    const norm = Math.pow(rawDiff / (maxRawDiff || 1), 1.5) * 1000;
    showDifficulties[showName] = row => row.difficulty !== undefined 
      ? row.difficulty 
      : Math.round(norm * 10) / 10;
  }

  // Step 3: Compute final athlete scores based on Placement Limit & Competition Difficulty
  const competitorMap = {};

  databaseRows.forEach((row) => {
    const rowDiv = row.division || 'men';
    if (rowDiv !== targetDivision) return;
    if (!isWithinTimeframe(row.Date)) return;

    const recencyMult = getRecencyMultiplier(row.Date);
    if (recencyMult === 0.0) return;

    const fullName = `${row.Competitor_fName} ${row.Compititor_LName}`;
    const tierInfo = getTierInfo(row.Show_Promotion, row.Show_Name);
    const placementFactor = Math.exp(-0.25 * (row.PlacementRank - 1));
    const compDifficulty = row.difficulty !== undefined ? row.difficulty : (showDifficulties[row.Show_Name](row));
    const finalPts = compDifficulty * placementFactor * recencyMult;

    if (!competitorMap[fullName]) {
      const meta = athleteMeta[fullName];
      const countryData = getCountryData(fullName, row.country_code);
      const pureInfo = pureRankMap[fullName] || { pureRank: 999, purePoints: 0 };

      competitorMap[fullName] = {
        competitor: {
          id: fullName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          name: fullName,
          country: countryData.country,
          countryCode: countryData.countryCode,
          flagEmoji: countryData.flagEmoji,
          heightCm: meta?.heightCm || null,
          weightKg: meta?.weightKg || null,
        },
        pureRank: pureInfo.pureRank,
        purePoints: pureInfo.purePoints,
        contributions: []
      };
    }

    competitorMap[fullName].contributions.push({
      competitionName: row.Show_Name,
      year: row.Year,
      date: row.Date,
      tier: tierInfo.name,
      rank: row.PlacementRank,
      difficulty: compDifficulty,
      placementFactor: Math.round(placementFactor * 1000) / 1000,
      recencyMultiplier: recencyMult,
      finalPoints: Math.round(finalPts * 10.0) / 10.0
    });
  });

  const rankings = Object.values(competitorMap).map((item) => {
    item.contributions.sort((a, b) => b.finalPoints - a.finalPoints);

    let evaluatedContributions = item.contributions;
    let totalPoints = 0;

    if (placementLimit === 'top5') {
      evaluatedContributions = item.contributions.slice(0, 5);
      totalPoints = evaluatedContributions.reduce((sum, c) => sum + c.finalPoints, 0);
    } else if (placementLimit === 'top10') {
      evaluatedContributions = item.contributions.slice(0, 10);
      totalPoints = evaluatedContributions.reduce((sum, c) => sum + c.finalPoints, 0);
    } else {
      // Option B Diminishing Marginal Weights across Top 10 results
      evaluatedContributions = item.contributions.slice(0, 10);
      totalPoints = evaluatedContributions.reduce((sum, c, idx) => {
        const w = idx < WEIGHTS.length ? WEIGHTS[idx] : 0.0;
        return sum + c.finalPoints * w;
      }, 0);
    }

    const winsCount = item.contributions.filter(c => c.rank === 1).length;
    const podiumsCount = item.contributions.filter(c => c.rank <= 3).length;
    const totalShows = item.contributions.length;

    return {
      ...item,
      totalPoints: Math.round(totalPoints * 10.0) / 10.0,
      winsCount,
      podiumsCount,
      totalShows,
      evaluatedCount: evaluatedContributions.length
    };
  });

  // Step 4: Re-rank athletes based on new score
  rankings.sort((a, b) => b.totalPoints - a.totalPoints);
  rankings.forEach((item, idx) => {
    item.globalRank = idx + 1;
  });

  return rankings;
}

export function getAllShowsWithDifficulty(division = 'men') {
  const map = {};
  const targetDivision = division === 'women' ? 'women' : (division === 'all' ? 'all' : 'men');
  databaseRows.forEach(row => {
    if (isOmittedShow(row.Show_Name)) return;
    if (getRecencyMultiplier(row.Date) === 0.0) return;
    const rowDiv = row.division || 'men';
    if (targetDivision !== 'all' && rowDiv !== targetDivision) return;
    if (!map[row.Show_Name]) {
      const tierInfo = getTierInfo(row.Show_Promotion, row.Show_Name);
      const tierFormatted = (tierInfo.name || "TIER_4").replace('_', ' ');
      map[row.Show_Name] = {
        name: row.Show_Name,
        promotion: row.Show_Promotion,
        year: row.Year,
        date: row.Date,
        division: rowDiv,
        difficulty: row.difficulty !== undefined ? row.difficulty : 0,
        tier: tierFormatted,
        tierName: tierInfo.name,
      };
    }
  });
  return Object.values(map).sort((a, b) => b.difficulty - a.difficulty);
}


