import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in process.env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BASELINE_CLIENTS = [
  {
    business_id: "ZT-0001",
    business_name: "Café Aroma Bodakdev",
    owner_name: "Aarav Sharma",
    owner_phone: "+91 98250 12345",
    owner_email: "contact@cafearoma.in",
    whatsapp: "+91 98250 12345",
    instagram_link: "https://instagram.com/cafearoma_ahmedabad",
    facebook_link: "https://facebook.com/cafearomabodakdev",
    city: "Ahmedabad",
    google_review_link: "https://g.page/r/cafearoma/review",
  },
  {
    business_id: "ZT-0002",
    business_name: "Smile Dental Clinic",
    owner_name: "Dr. Priya Patel",
    owner_phone: "+91 98251 23456",
    owner_email: "smiledental@gmail.com",
    whatsapp: "+91 98251 23456",
    instagram_link: "https://instagram.com/smiledentalclinic",
    facebook_link: "https://facebook.com/smiledentalclinicindia",
    city: "Surat",
    google_review_link: "https://g.page/r/smiledental/review",
  },
  {
    business_id: "ZT-0003",
    business_name: "Urban Hair Salon",
    owner_name: "Rohan Mehta",
    owner_phone: "+91 98252 34567",
    owner_email: "urbanhairsalon@gmail.com",
    whatsapp: "+91 98252 34567",
    instagram_link: "https://instagram.com/urbanhairsalon_official",
    facebook_link: "https://facebook.com/urbanhairsalon",
    city: "Vadodara",
    google_review_link: "https://g.page/r/urbanhairsalon/review",
  },
];

const BASELINE_PAYMENTS = [
  {
    business_id: "ZT-0001",
    business_name: "Café Aroma Bodakdev",
    product: "Counter Standee",
    product_price: 1499,
    selling_rate: 1499,
    payment_date: "2026-10-25",
    payment_method: "UPI",
    payment_status: "Completed paid",
    notes: "Full payment received via PhonePe. Standee dispatched.",
  },
  {
    business_id: "ZT-0002",
    business_name: "Smile Dental Clinic",
    product: "Counter Standee",
    product_price: 999,
    selling_rate: 500,
    payment_date: "2026-10-28",
    payment_method: "Cash",
    payment_status: "Partial Advance",
    notes: "₹500 advance received. Remaining ₹499 on installation.",
  },
  {
    business_id: "ZT-0003",
    business_name: "Urban Hair Salon",
    product: "Business NFC Card",
    product_price: 699,
    selling_rate: 699,
    payment_date: "2026-10-30",
    payment_method: "UPI",
    payment_status: "Completed paid",
    notes: "Card activated with WhatsApp direct link.",
  },
];

async function seed() {
  console.log("Checking Supabase clients table...");
  const { data: clients, error: cErr } = await supabase.from("clients").select("id");
  if (cErr) {
    console.error("Failed to query clients:", cErr);
    process.exit(1);
  }

  if (clients.length === 0) {
    console.log("Seeding baseline clients into Supabase...");
    const { data: inserted, error: inErr } = await supabase.from("clients").insert(BASELINE_CLIENTS).select();
    if (inErr) {
      console.error("Failed to insert baseline clients:", inErr);
      process.exit(1);
    }
    console.log(`✓ Inserted ${inserted.length} baseline clients!`);
  } else {
    console.log(`Clients already seeded (${clients.length} found).`);
  }

  console.log("Checking Supabase payments table...");
  const { data: payments, error: pErr } = await supabase.from("payments").select("id");
  if (pErr) {
    console.error("Failed to query payments:", pErr);
    process.exit(1);
  }

  if (payments.length === 0) {
    console.log("Seeding baseline payments into Supabase...");
    const { data: insertedP, error: inPErr } = await supabase.from("payments").insert(BASELINE_PAYMENTS).select();
    if (inPErr) {
      console.error("Failed to insert baseline payments:", inPErr);
      process.exit(1);
    }
    console.log(`✓ Inserted ${insertedP.length} baseline payments!`);
  } else {
    console.log(`Payments already seeded (${payments.length} found).`);
  }

  console.log("=== Seeding completed successfully ===");
}

seed();
