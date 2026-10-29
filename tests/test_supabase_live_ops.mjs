import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env.local', 'utf8');
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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const anonClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

console.log('--- 1. Admin Users in Supabase ---');
const { data: admins, error: adminErr } = await adminClient.from('admin_users').select('*');
if (adminErr) console.error('Admin query error:', adminErr);
else console.log('Admins found:', admins);

console.log('\n--- 2. Courier Rules in Supabase ---');
const { data: rules } = await adminClient.from('courier_rules').select('*');
console.log(`Found ${rules?.length} courier rules:`, rules?.map(r => `${r.zone_name}: ₹${r.rate} (${r.estimated_days})`));

console.log('\n--- 3. Testing Business Insert & Query (Admin Client) ---');
const testBizId = '00000000-0000-4000-8000-000000000001';
const testSlug = `audit-test-${Date.now().toString().slice(-4)}`;

const { data: insertedBiz, error: insertBizErr } = await adminClient
  .from('businesses')
  .upsert({
    id: testBizId,
    name: 'ZenTap Audit Hallmark Venue',
    email: 'hallmark-audit@zentap.ai',
    phone: '+91 99999 88888',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    pincode: '380015',
    address: 'SG Highway, Bodakdev',
    category: 'Certified Fine Dining & Lounge',
    gbp_link: 'https://maps.google.com/?q=zentap+audit',
    slug: testSlug,
    plan: 'standee_auto_2000',
    payment_status: 'paid',
    review_url: 'https://g.page/r/test-review/review',
    active: true,
    updated_at: new Date().toISOString(),
  })
  .select()
  .single();

if (insertBizErr) {
  console.error('Failed to insert test business:', insertBizErr);
} else {
  console.log('Successfully inserted test business into Supabase:', insertedBiz.name, `(slug: ${insertedBiz.slug})`);
}

console.log('\n--- 4. Testing Public Safe View (Anon Client) ---');
const { data: pubBiz, error: pubErr } = await anonClient
  .from('public_businesses')
  .select('*')
  .eq('slug', testSlug)
  .maybeSingle();

if (pubErr) {
  console.error('Public view query error:', pubErr);
} else {
  console.log('Public view returned for anon user:', pubBiz);
  console.log('Check Privacy Leak:');
  console.log(' - Email exposed to public?  ', 'email' in (pubBiz || {}) ? 'YES (LEAK!)' : 'NO (PROTECTED)');
  console.log(' - Phone exposed to public?  ', 'phone' in (pubBiz || {}) ? 'YES (LEAK!)' : 'NO (PROTECTED)');
  console.log(' - Plan exposed to public?   ', 'plan' in (pubBiz || {}) ? 'YES (LEAK!)' : 'NO (PROTECTED)');
}

console.log('\n--- 5. Testing Anon Scan Insert ---');
const { error: scanErr } = await anonClient.from('scans').insert([
  {
    business_id: testBizId,
    source: 'nfc',
    visitor_hash: 'testhash_987654321',
    is_preview: false,
    scanned_date: new Date().toISOString().split('T')[0],
  },
]);
console.log('Anon Scan Insert result:', scanErr ? `ERROR: ${scanErr.message}` : 'SUCCESS (Allowed by RLS)');

console.log('\n--- 6. Testing Anon Event Insert ---');
const { error: eventErr } = await anonClient.from('events').insert([
  {
    business_id: testBizId,
    type: 'rating',
    rating: 5,
  },
]);
console.log('Anon Event Insert result:', eventErr ? `ERROR: ${eventErr.message}` : 'SUCCESS (Allowed by RLS)');

console.log('\n--- 7. Testing Anon Feedback Insert (1-2 Stars Private Defuse) ---');
const { error: fbErr } = await anonClient.from('feedback').insert([
  {
    business_id: testBizId,
    rating: 2,
    text: 'Audit test: Private feedback captured before Google Maps',
    customer_name: 'Test Customer',
    customer_phone: '+91 91234 56789',
  },
]);
console.log('Anon Feedback Insert result:', fbErr ? `ERROR: ${fbErr.message}` : 'SUCCESS (Allowed by RLS)');

console.log('\n--- 8. Testing RLS Privacy of Feedback (Anon Read Protection) ---');
const { data: anonFb, error: anonFbErr } = await anonClient
  .from('feedback')
  .select('*')
  .eq('business_id', testBizId);
console.log(`Anon Feedback Read: ${anonFb?.length || 0} rows visible (Must be 0 to prevent competitor spying)`);

console.log('\n--- 9. Cleaning up test business ---');
await adminClient.from('scans').delete().eq('business_id', testBizId);
await adminClient.from('events').delete().eq('business_id', testBizId);
await adminClient.from('feedback').delete().eq('business_id', testBizId);
await adminClient.from('businesses').delete().eq('id', testBizId);
console.log('Cleaned up test records from Supabase.');
