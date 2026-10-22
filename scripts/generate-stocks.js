#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');

const EXCLUDED_PATTERNS = [
  /\b(rights?|rt)\b/i,
  /\bwarrants?\b/i,
  /\bunits?\b/i,
  /deposit(?:ary|ory)\s+shares?/i,
  /preferred\s+shares?/i,
  /preferred\s+stock/i,
  /preferred\s+securities/i,
  /preferred\s+class/i,
  /income\s+trust\s+preferred/i,
  /non-cumulative\s+preferred/i,
  /cumulative\s+preferred/i,
  /senior\s+notes?\b/i,
  /subordinated\s+notes?\b/i,
  /\bdebentures?\b/i,
];

function normalizeSymbol(s) {
  return String(s || '').toUpperCase().trim().replace(/[^A-Z0-9.-]/g, '');
}

function cleanStockName(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s*\([^)]*representing[^)]*\)/gi, '')
    .replace(/\s+american\s+deposit(?:ary|ory)\s+shares?(?:\s+class\s+[a-z])?(?:\s+ordinary\s+shares?)?(?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+american\s+deposit(?:ary|ory)\s+shs?(?:\s+class\s+[a-z])?(?:\s+ordinary\s+shares?)?(?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+american\s+deposit(?:ary|ory)\s+receipt(s)?(?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+sponsored\s+adr(?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+class\s+[a-z]\s+common\s+stock(?:\s+new)?(?:\s+nonvoting)?(?:\s+\$?[0-9.]+\s+par\s+value)?(?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+(common\s+stock|common\s+shares?)(?:\s+new)?(?:\s+nonvoting)?(?:\s+\$?[0-9.]+\s+par\s+value)?(?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+ordinary\s+shares?(?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+class\s+[a-z]\s+ordinary\s+shares?(?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+class\s+[a-z](?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+series\s+[a-z](?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+ads$/i, '')
    .replace(/\s+adr\b.*$/i, '')
    .replace(/\s+spon[a-z]+\.?$/i, '')
    .replace(/\s*\(reit\)/gi, '')
    .replace(/\s+reit\s+inc\.?$/i, '')
    .replace(/\s+reit$/i, '')
    .replace(/\s*\([a-z]{2,3}\)$/i, '')
    .replace(/\s+sponsored\s+adr\b.*$/i, '')
    .replace(/\s+shares?\s+of\s+beneficial\s+interest.*$/i, '')
    .replace(/\s+common\s+stock\s+when\s+issued$/i, '')
    .replace(/\s+common\s+stock\s+new$/i, '')
    .replace(/\s+\(the\)$/i, '')
    .replace(/\.$/, '')
    .trim();
}

function shouldExclude(symbol, name, type) {
  if (!symbol || !name) return true;
  if (!/^[A-Z][A-Z0-9.-]{0,14}$/.test(symbol)) return true;
  if (String(type || 'EQUITY').toUpperCase() !== 'ETF' && EXCLUDED_PATTERNS.some(p => p.test(name))) return true;
  return false;
}

const url = 'https://api.nasdaq.com/api/screener/stocks?tableonly=true&download=true';
const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/json',
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const rows = parsed && parsed.data && parsed.data.rows ? parsed.data.rows : [];
      const results = [];
      const seen = new Set();

      for (const row of rows) {
        const symbol = normalizeSymbol(row.symbol);
        const rawName = String(row.name || symbol).trim();
        const name = cleanStockName(rawName);
        const type = String(row.type || 'EQUITY').toUpperCase();
        const exchange = String(row.exchange || '').trim();
        const sector = String(row.sector || '').trim();
        const industry = String(row.industry || '').trim();

        if (shouldExclude(symbol, rawName, type)) continue;
        if (shouldExclude(symbol, name, type)) continue;
        if (seen.has(symbol)) continue;
        seen.add(symbol);

        const aliases = [sector, industry].filter(Boolean);
        results.push({ symbol, name, type, exchange, aliases });
      }

      const outPath = path.join(__dirname, '../public/stocks-additional.json');
      fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
      console.log('Written: ' + results.length + ' symbols');

      // show any remaining noise hits
      let patternHits = 0;
      for (const r of results) {
        const combined = r.name + ' ' + r.symbol;
        if (/\bADR\b|REIT|beneficial interest|sponsored/i.test(combined)) {
          patternHits++;
          if (patternHits <= 10) console.log('  ' + r.symbol + ': ' + r.name);
        }
      }
      console.log('Remaining noise hits: ' + patternHits);
    } catch(e) {
      console.error('Parse error: ' + e.message);
      console.error('First 500 chars: ' + data.slice(0, 500));
    }
  });
}).on('error', function(err) { console.error('Request error: ' + err.message); });
