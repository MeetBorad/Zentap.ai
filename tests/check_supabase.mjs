import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Read .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || '';
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1]] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

function mask(str) {
  if (!str) return 'MISSING';
  if (str.length <= 10) return '***';
  return str.slice(0, 8) + '...' + str.slice(-6);
}

console.log('========================================================');
console.log('   ZenTap.ai Live Supabase Connection & Table Audit');
console.log('========================================================');
console.log(`Supabase URL      : ${supabaseUrl || 'NOT SET'}`);
console.log(`Anon Key          : ${mask(anonKey)}`);
console.log(`Service Role Key  : ${mask(serviceKey)}`);
console.log('--------------------------------------------------------');

if (!supabaseUrl || !anonKey) {
  console.error('CRITICAL: Supabase URL or Anon Key is missing!');
  process.exit(1);
}

// 1. Basic HTTP ping to Supabase REST endpoint
const startTime = Date.now();
try {
  const restUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/`;
  const res = await fetch(restUrl, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });
  const pingLatency = Date.now() - startTime;
  console.log(`[REST Endpoint Ping] Status: ${res.status} ${res.statusText} (${pingLatency}ms)`);
} catch (err) {
  console.error(`[REST Endpoint Ping] Failed:`, err.message);
}

// 2. Client tests
const anonClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
});

const adminClient = serviceKey
  ? createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
  : null;

const tables = [
  'businesses',
  'public_businesses',
  'scans',
  'events',
  'feedback',
  'orders',
  'courier_rules',
  'subscriptions',
  'admin_users',
  // legacy/v1 checks:
  'standees',
  'reviews',
  'tap_events'
];

console.log('\n--- Checking Tables with Admin Service Role ---');
if (!adminClient) {
  console.log('Admin client NOT available (SUPABASE_SERVICE_ROLE_KEY missing).');
} else {
  for (const t of tables) {
    const t0 = Date.now();
    try {
      const { data, count, error } = await adminClient
        .from(t)
        .select('*', { count: 'exact', head: true });
      const dur = Date.now() - t0;
      if (error) {
        console.log(`Table [${t.padEnd(18)}]: ERROR -> ${error.message} (code: ${error.code}, ${dur}ms)`);
      } else {
        console.log(`Table [${t.padEnd(18)}]: EXISTS (${count ?? 0} rows, ${dur}ms)`);
      }
    } catch (e) {
      console.log(`Table [${t.padEnd(18)}]: EXCEPTION -> ${e.message}`);
    }
  }
}

console.log('\n--- Checking Tables with Public Anon Client (RLS Test) ---');
for (const t of tables) {
  const t0 = Date.now();
  try {
    const { data, count, error } = await anonClient
      .from(t)
      .select('*', { count: 'exact', head: true });
    const dur = Date.now() - t0;
    if (error) {
      console.log(`Table [${t.padEnd(18)}]: ANON BLOCKED / ERROR -> ${error.message} (code: ${error.code}, ${dur}ms)`);
    } else {
      console.log(`Table [${t.padEnd(18)}]: ANON ALLOWED (${count ?? 0} rows readable, ${dur}ms)`);
    }
  } catch (e) {
    console.log(`Table [${t.padEnd(18)}]: EXCEPTION -> ${e.message}`);
  }
}

console.log('\n--- Checking Supabase Auth Service ---');
if (adminClient) {
  try {
    const { data: usersData, error: usersErr } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 10 });
    if (usersErr) {
      console.log(`Auth Service: ERROR -> ${usersErr.message}`);
    } else {
      console.log(`Auth Service: HEALTHY (${usersData.users?.length ?? 0} registered users found)`);
      usersData.users?.forEach(u => {
        console.log(` - User ID: ${u.id} | Email: ${u.email} | Created: ${u.created_at}`);
      });
    }
  } catch (e) {
    console.log(`Auth Service: EXCEPTION -> ${e.message}`);
  }
}

console.log('\n========================================================\n');
