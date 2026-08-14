const fs = require('fs');
const https = require('https');
const http = require('http');

const DATASET_FILE = "strongman_contests_dataset.json";
const CONTEST_ID = 2837;
const BASE_URL = `https://strongmanarchives.com/viewContest.php?id=${CONTEST_ID}`;
const AJAX_URL = `https://strongmanarchives.com/fetchContestResult.php`;

function httpRequest(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, {
      method: postData ? 'POST' : 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...(postData ? {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': BASE_URL,
          'Content-Length': Buffer.byteLength(postData)
        } : {}),
        ...options.headers
      },
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// Simple HTML parser to extract text and attributes
function extractText(html) {
  return html.replace(/<[^>]+>/g, '').trim();
}

function extractAttr(html, attr) {
  const match = html.match(new RegExp(`${attr}="([^"]*)"`, 'i'));
  return match ? match[1].trim() : '';
}

async function scrape() {
  console.log(`Scraping contest ID ${CONTEST_ID}: ${BASE_URL}`);

  // Fetch main page
  const pageRes = await httpRequest(BASE_URL);
  if (pageRes.statusCode !== 200) {
    console.error(`Failed to fetch page: HTTP ${pageRes.statusCode}`);
    process.exit(1);
  }

  const html = pageRes.body;

  // Extract contest name from h3
  const h3Match = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
  let contestName = h3Match ? extractText(h3Match[1]) : null;

  // Fallback: title tag
  if (!contestName || contestName === '#') {
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      contestName = extractText(titleMatch[1]).replace('Strongman Archives - ', '').trim();
    }
  }

  // Extract details line from first table row
  let detailsLine = '';
  const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
  if (tableMatch) {
    const trMatch = tableMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);
    if (trMatch) {
      const rowText = extractText(trMatch[1]);
      const lines = rowText.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length > 1) {
        detailsLine = lines[1];
      }
    }
  }

  console.log(`Contest Name: ${contestName}`);
  console.log(`Details: ${detailsLine}`);

  // Fetch results via AJAX
  const postData = `contestID=${CONTEST_ID}&unitDisplay=metric`;
  const ajaxRes = await httpRequest(AJAX_URL, {}, postData);

  if (ajaxRes.statusCode !== 200) {
    console.error(`AJAX request failed: HTTP ${ajaxRes.statusCode}`);
    process.exit(1);
  }

  let jsonData;
  try {
    jsonData = JSON.parse(ajaxRes.body);
  } catch (e) {
    console.error('Failed to parse AJAX JSON:', e.message);
    console.error('Raw response:', ajaxRes.body.slice(0, 500));
    process.exit(1);
  }

  const rawRows = jsonData.data || [];
  console.log(`Raw rows from AJAX: ${rawRows.length}`);

  const competitors = [];
  for (const row of rawRows) {
    if (row.length < 4) continue;

    const rankStr = String(row[0]).trim();

    // Extract person name from HTML (title attribute of anchor)
    const nameHtml = row[1] || '';
    const titleMatch = nameHtml.match(/title="([^"]+)"/i);
    const personName = titleMatch ? titleMatch[1].trim() : extractText(nameHtml);

    // Extract country from HTML (title attribute of anchor)
    const countryHtml = row[2] || '';
    const countryTitleMatch = countryHtml.match(/title="([^"]+)"/i);
    const country = countryTitleMatch ? countryTitleMatch[1].trim() : extractText(countryHtml);

    // Score
    const rawScore = row[3];
    let score;
    try {
      score = rawScore !== null ? parseFloat(rawScore) : null;
      if (isNaN(score)) score = String(rawScore).trim();
    } catch {
      score = String(rawScore).trim();
    }

    competitors.push({
      rank: rankStr,
      person_name: personName,
      country,
      score
    });
  }

  console.log(`Parsed ${competitors.length} competitors:`);
  competitors.forEach(c => console.log(`  #${c.rank} ${c.person_name} (${c.country}) - ${c.score}`));

  if (competitors.length === 0) {
    console.error('No competitors found. Aborting.');
    process.exit(1);
  }

  const newContest = {
    contest_id: CONTEST_ID,
    contest_name: contestName || `Contest #${CONTEST_ID}`,
    details: detailsLine,
    url: BASE_URL,
    total_competitors: competitors.length,
    results: competitors
  };

  // Load existing dataset and add/update
  const dataset = JSON.parse(fs.readFileSync(DATASET_FILE, 'utf-8'));
  const existingIdx = dataset.findIndex(c => c.contest_id === CONTEST_ID);
  if (existingIdx >= 0) {
    console.log(`\nContest ID ${CONTEST_ID} already exists at index ${existingIdx}. Updating...`);
    dataset[existingIdx] = newContest;
  } else {
    console.log(`\nAdding new contest ID ${CONTEST_ID} to dataset...`);
    dataset.push(newContest);
  }

  fs.writeFileSync(DATASET_FILE, JSON.stringify(dataset, null, 2), 'utf-8');
  console.log(`\nDataset saved! Total contests: ${dataset.length}`);
  console.log(`\nContest added: "${newContest.contest_name}" | ${newContest.details} | ${competitors.length} competitors`);
}

scrape().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
