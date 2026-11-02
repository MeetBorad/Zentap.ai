"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  MessageCircle, 
  ArrowRight, 
  Check, 
  Star, 
  Smartphone, 
  CreditCard, 
  CheckCircle2, 
  Store, 
  Utensils, 
  Sparkles, 
  Dumbbell, 
  Stethoscope, 
  Building2, 
  Calendar, 
  FileText, 
  HelpCircle, 
  ChevronDown, 
  ShieldCheck,
  Zap,
  PhoneCall
} from "lucide-react";
import { LanguageCode } from "@/components/Header";
import { trackWhatsAppClick } from "@/lib/analytics";

interface HomeViewProps {
  currentLang?: LanguageCode;
  onNavigate?: (view: any) => void;
}

export default function HomeView({ currentLang = "en", onNavigate }: HomeViewProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const waBase = "https://wa.me/919274560880";

  const getWaLink = (msg: string) => `${waBase}?text=${encodeURIComponent(msg)}`;

  // Multi-language content dictionary for all 10 sections
  const content = {
    en: {
      // 1. HERO
      h1: "Get more Google reviews. Just one tap.",
      sub: "Put the ZenTap stand on your counter. Your customer taps their phone. Your Google review page opens. No app. No typing.",
      heroBtnDemo: "Get a Free Demo on WhatsApp",
      heroBtnPrices: "See Prices",
      heroBadgeLine: "Made in Ahmedabad | Works on any phone (tap or scan) | No monthly fee on the Review Stand",
      heroWaMsg: "Hello ZenTap, I would like to get a free demo of the Google Review Stand on WhatsApp.",

      // 2. WHY IT MATTERS
      whyTitle: "More good reviews, more customers walking in.",
      whyP1: "Before visiting a shop, most people check its Google rating. If customers are happy but never write a review, you lose that chance.",
      whyP2: "ZenTap makes it easy to ask at the right moment: right after they pay.",
      whyBullet1: "Happy customers actually leave a rating before leaving your shop.",
      whyBullet2: "Higher Google rating brings you to the top of Google Maps search.",
      whyBullet3: "Zero awkward asking — customers tap their phone naturally on the counter.",

      // 3. HOW IT WORKS
      howTitle: "How It Works",
      howSub: "Three simple steps. Works on every iPhone and Android.",
      step1Title: "1. Customer finishes and pays",
      step1Desc: "After a great meal, haircut, treatment, or shopping, your customer pays their bill at your counter.",
      step2Title: "2. They tap their phone or scan QR",
      step2Desc: "They simply tap their smartphone on the ZenTap stand. Or they scan the QR code with their camera.",
      step3Title: "3. Your Google review page opens",
      step3Desc: "Your official Google review box opens immediately on their screen. They tap 5 stars and post.",

      // 4. PRODUCTS
      prodTitle: "Simple Products & Clear Prices",
      prodSub: "One-time purchase. No monthly fee on the Review Stand.",
      prodAskBtn: "Ask on WhatsApp",

      p1Name: "Review Stand",
      p1Price: "Rs 999 (Stand) / Rs 499 (Card)",
      p1Desc: "Tap or scan and your Google review page opens directly. One-time payment, no monthly fee.",
      p1Features: [
        "Opens your Google Maps review page in 1 tap",
        "Includes both contactless tap and QR code",
        "Durable, scratch-proof counter display",
        "Lifetime use: zero monthly subscription"
      ],

      p2Name: "Smart Review Stand",
      p2Price: "Rs 1,499",
      p2Desc: "Opens your own simple review page with ideas customers can pick from, like 'friendly staff' or 'clean place'. Customers who don't know what to write find it easy, and they post their own final words.",
      p2Features: [
        "Pre-filled compliments ('Fast service', 'Great vibe')",
        "Makes writing a review effortless for customers",
        "Customer always reviews directly on Google",
        "Customized with your business name and logo"
      ],

      p3Name: "Digital Visiting Card",
      p3Price: "Rs 699 (PVC) / Rs 1,499 (Metal)",
      p3Desc: "Tap to save your phone number instantly and share your WhatsApp, Instagram, and website.",
      p3Features: [
        "Saves contact details to their phone contacts in 1 tap",
        "Share WhatsApp, Instagram, address, and website",
        "Premium matte PVC or laser-engraved metal",
        "Never run out of paper visiting cards again"
      ],

      p4Name: "Custom Orders",
      p4Price: "Custom Price",
      p4Desc: "Many branches, large corporate fleet, or want your custom brand logo on it? Message us for special bulk pricing.",
      p4Features: [
        "Custom shape, color, and logo engraving",
        "Multi-branch and multi-counter setups",
        "Dedicated phone and WhatsApp support",
        "Bulk discount on orders of 3 or more"
      ],

      // 5. WHO IT'S FOR
      whoTitle: "Who It's For",
      whoSub: "Made for any physical business in Ahmedabad with a checkout counter.",
      bizSalons: "Salons & Spas",
      bizSalonsDesc: "Hair stylists, nail art studios, beauty parlours, and barbershops.",
      bizCafes: "Restaurants & Cafes",
      bizCafesDesc: "Bistros, coffee bars, sweet shops, bakeries, and cloud kitchens.",
      bizClinics: "Clinics & Doctors",
      bizClinicsDesc: "Dentists, dermatologists, eye care, physiotherapy, and pathology labs.",
      bizGyms: "Gyms & Fitness Centers",
      bizGymsDesc: "CrossFit boxes, yoga studios, fitness gyms, and pilates centers.",
      bizHotels: "Hotels & Stays",
      bizHotelsDesc: "Boutique hotels, guest houses, resorts, and homestays.",
      bizShops: "Retail Shops & Jewellers",
      bizShopsDesc: "Jewellery showrooms, clothing boutiques, optics, and electronics stores.",

      // 6. PHOTOS
      photosTitle: "How it looks on your counter",
      photosSub: "Clean, elegant, premium acrylic and wood finishes made to fit your counter aesthetics.",

      // 7. MORE THAN REVIEWS
      moreTitle: "One tap can also do more",
      moreSub: "Need something beyond Google reviews? The same tap can trigger any action your business needs:",
      more1Title: "WhatsApp chat with you",
      more1Desc: "Customer taps to start a direct WhatsApp chat with your front desk or manager.",
      more2Title: "Table or appointment booking link",
      more2Desc: "Instant booking link for repeat appointments, table reservations, or consultations.",
      more3Title: "Digital menu or service photos",
      more3Desc: "Opens your digital restaurant menu, spa service catalog, or lookbook.",
      more4Title: "A form for customer enquiries",
      more4Desc: "Quick feedback form or enquiry form saved directly to your phone.",

      // 8. FAQ
      faqTitle: "Frequently Asked Questions",
      faqSub: "Simple answers to common questions about ZenTap.",

      // 9. FINAL CTA
      ctaTitle: "Ready to get more reviews?",
      ctaSub: "Message us on WhatsApp. We will show you a live demo and answer all your questions in minutes.",
      ctaBtn: "Get a Free Demo on WhatsApp",
    },

    hi: {
      // 1. HERO
      h1: "Google पर और रिव्यू पाएँ। बस एक टैप में।",
      sub: "ZenTap स्टैंड काउंटर पर रखिए। ग्राहक फोन टैप करता है। आपका Google रिव्यू पेज खुल जाता है। कोई ऐप नहीं। कोई टाइपिंग नहीं।",
      heroBtnDemo: "WhatsApp पर फ्री डेमो लें",
      heroBtnPrices: "दाम देखें",
      heroBadgeLine: "अहमदाबाद में निर्मित | हर फोन पर काम करता है (टैप या स्कैन) | रिव्यू स्टैंड पर कोई मासिक शुल्क नहीं",
      heroWaMsg: "नमस्ते ZenTap, मुझे Google Review Stand का WhatsApp पर फ्री डेमो चाहिए।",

      // 2. WHY IT MATTERS
      whyTitle: "ज्यादा अच्छे रिव्यू, ज्यादा नए ग्राहक।",
      whyP1: "किसी भी दुकान या कैफ़े जाने से पहले, लोग Google रेटिंग ज़रूर देखते हैं। अगर आपके ग्राहक खुश हैं लेकिन रिव्यू नहीं लिखते, तो आप नए ग्राहक खो देते हैं।",
      whyP2: "ZenTap बिल चुकाते ही सही समय पर रिव्यू मांगना बेहद आसान बना देता है।",
      whyBullet1: "खुश ग्राहक दुकान से बाहर जाने से पहले ही तुरंत 5 स्टार दे देते हैं।",
      whyBullet2: "अच्छी Google रेटिंग से आपकी दुकान Google Maps सर्च में सबसे ऊपर आती है।",
      whyBullet3: "रिव्यू मांगने में कोई झिझक नहीं — ग्राहक काउंटर पर खुद फोन टैप करते हैं।",

      // 3. HOW IT WORKS
      howTitle: "यह कैसे काम करता है",
      howSub: "तीन आसान कदम। हर Android और iPhone पर काम करता है।",
      step1Title: "1. ग्राहक बिल चुकाता है",
      step1Desc: "खाना, हेयरकट, क्लिनिक विज़िट या शॉपिंग के बाद ग्राहक आपके काउंटर पर पेमेंट करता है।",
      step2Title: "2. ग्राहक स्टैंड पर फोन टैप करता है",
      step2Desc: "ग्राहक अपना फोन ZenTap स्टैंड पर छूता है, या कैमरे से QR कोड स्कैन करता है।",
      step3Title: "3. आपका Google रिव्यू पेज खुल जाता है",
      step3Desc: "सीधे आपकी दुकान का Google रिव्यू बॉक्स खुल जाता है। ग्राहक 5 स्टार दबाकर पोस्ट कर देता है।",

      // 4. PRODUCTS
      prodTitle: "सिंपल प्रोडक्ट्स और साफ़ दाम",
      prodSub: "एक बार की ख़रीद। रिव्यू स्टैंड पर कोई महीनावार चार्ज नहीं।",
      prodAskBtn: "WhatsApp पर पूछें",

      p1Name: "Review Stand",
      p1Price: "रु 999 (स्टैंड) / रु 499 (कार्ड)",
      p1Desc: "टैप या स्कैन करते ही सीधे आपका Google रिव्यू पेज खुलता है। वन-टाइम पेमेंट, कोई मंथली फ़ीस नहीं।",
      p1Features: [
        "1 टैप में Google Maps रिव्यू पेज खुलता है",
        "NFC टैप और QR कोड दोनों शामिल हैं",
        "मजबूत, स्क्रैच-रेज़िस्टेंट ऐक्रिलिक फिनिश",
        "ज़िंदगी भर इस्तेमाल: कोई मासिक सब्सक्रिप्शन नहीं"
      ],

      p2Name: "Smart Review Stand",
      p2Price: "रु 1,499",
      p2Desc: "आपका अपना सिंपल रिव्यू पेज खुलता है जहाँ ग्राहक आसान विचार चुन सकते हैं, जैसे 'अच्छा स्टाफ़' या 'साफ़ जगह'। जिन्हें लिखना नहीं आता, वे भी झटपट रिव्यू पोस्ट कर देते हैं।",
      p2Features: [
        "तैयार सुझाव ('तेज़ सर्विस', 'शानदार माहौल')",
        "ग्राहकों के लिए रिव्यू लिखना बहुत आसान",
        "ग्राहक सीधे Google पर ही रिव्यू पोस्ट करता है",
        "आपकी दुकान के नाम और लोगो के साथ तैयार"
      ],

      p3Name: "Digital Visiting Card",
      p3Price: "रु 699 (PVC) / रु 1,499 (Metal)",
      p3Desc: "टैप करते ही आपका नंबर ग्राहक के फोन में सेव हो जाता है और WhatsApp, Instagram व वेबसाइट शेयर हो जाती है।",
      p3Features: [
        "1 टैप में नंबर फोन कॉन्टैक्ट में सेव",
        "WhatsApp, Instagram, पता और वेबसाइट शेयर करें",
        "प्रीमियम मैट PVC या लेज़र-मेटल कार्ड",
        "कागज़ के विज़िटिंग कार्ड बार-बार छपवाने का झंझट खत्म"
      ],

      p4Name: "Custom Orders",
      p4Price: "कस्टम प्राइस",
      p4Desc: "कई ब्रांच हैं या अपना खास लोगो लगवाना चाहते हैं? हमें मैसेज करें, हम आपको बेहतरीन दाम देंगे।",
      p4Features: [
        "कस्टम साइज़, कलर और लोगो प्रिंटिंग",
        "मल्टी-ब्रांच और मल्टी-काउंटर सेटअप",
        "सीधा फोन और WhatsApp सपोर्ट",
        "3 या अधिक ऑर्डर करने पर विशेष छूट"
      ],

      // 5. WHO IT'S FOR
      whoTitle: "यह किसके लिए है",
      whoSub: "काउंटर वाले हर उस बिज़नेस के लिए जो Google पर नए ग्राहक पाना चाहता है।",
      bizSalons: "सैलून और स्पा",
      bizSalonsDesc: "हेयर स्टाइलिस्ट, ब्यूटी पार्लर, बारबर शॉप और स्किन केयर क्लिनिक।",
      bizCafes: "रेस्टोरेंट और कैफ़े",
      bizCafesDesc: "कैफ़े, मिठाई की दुकानें, बेकरी, डाइनिंग और क्लाउड किचन।",
      bizClinics: "क्लिनिक और डॉक्टर्स",
      bizClinicsDesc: "डेंटिस्ट, आई क्लिनिक, डर्मेटोलॉजिस्ट, फिजियोथेरेपी और लैब।",
      bizGyms: "जिम और फिटनेस सेंटर",
      bizGymsDesc: "जिम, योगा स्टूडियो, क्रॉसफिट और फिटनेस क्लब।",
      bizHotels: "होटल और रिसॉर्ट",
      bizHotelsDesc: "होटल, गेस्ट हाउस, रिसॉर्ट और होमस्टे।",
      bizShops: "दुकानें और शोरूम",
      bizShopsDesc: "ज्वेलरी शोरूम, कपड़े की दुकान, ऑप्टिकल्स और इलेक्ट्रॉनिक्स।",

      // 6. PHOTOS
      photosTitle: "काउंटर पर कैसा दिखता है",
      photosSub: "प्रीमियम ऐक्रिलिक और लकड़ी की फिनिश, जो आपके काउंटर की शोभा बढ़ाती है।",

      // 7. MORE THAN REVIEWS
      moreTitle: "एक टैप से और भी बहुत कुछ हो सकता है",
      moreSub: "अगर आपको सिर्फ रिव्यू से ज्यादा कुछ चाहिए, तो एक टैप यह काम भी कर सकता है:",
      more1Title: "सीधा WhatsApp चैट",
      more1Desc: "ग्राहक फोन टैप करते ही आपकी दुकान के WhatsApp पर सीधे चैट शुरू कर सकता है।",
      more2Title: "अपॉइंटमेंट या टेबल बुकिंग लिंक",
      more2Desc: "अगली विज़िट या टेबल बुक करने के लिए सीधा ऑनलाइन लिंक खुलता है।",
      more3Title: "डिजिटल मेनू या सर्विस फ़ोटो",
      more3Desc: "रेस्टोरेंट का मेनू कार्ड या सैलून का सर्विस कैटलॉग फोन पर खुल जाता है।",
      more4Title: "कस्टमर इन्क्वायरी फॉर्म",
      more4Desc: "ग्राहक का नाम और नंबर लेने के लिए तुरंत आसान फॉर्म खुलता है।",

      // 8. FAQ
      faqTitle: "अक्सर पूछे जाने वाले सवाल",
      faqSub: "ZenTap के बारे में आसान और सीधे जवाब।",

      // 9. FINAL CTA
      ctaTitle: "Google पर और ज्यादा रिव्यू पाने के लिए तैयार हैं?",
      ctaSub: "हमें WhatsApp पर मैसेज करें। हम आपको लाइव डेमो दिखाएँगे और सभी सवालों के जवाब देंगे।",
      ctaBtn: "WhatsApp पर फ्री डेमो लें",
    },

    gu: {
      // 1. HERO
      h1: "Google પર વધુ રિવ્યૂ મેળવો. બસ એક ટેપમાં.",
      sub: "ZenTap સ્ટેન્ડ કાઉન્ટર પર મૂકો. ગ્રાહક ફોન ટેપ કરે છે. તમારું Google રિવ્યૂ પેજ ખુલી જાય છે. કોઈ એપ નહીં. કોઈ ટાઇપિંગ નહીં.",
      heroBtnDemo: "WhatsApp પર ફ્રી ડેમો લો",
      heroBtnPrices: "ભાવ જુઓ",
      heroBadgeLine: "અમદાવાદમાં નિર્મિત | કોઈપણ ફોન પર ચાલે છે (ટેપ અથવા સ્કેન) | રિવ્યૂ સ્ટેન્ડ પર કોઈ માસિક ફી નથી",
      heroWaMsg: "નમસ્તે ZenTap, મને Google Review Stand નો WhatsApp પર ફ્રી ડેમો જોઈએ છે.",

      // 2. WHY IT MATTERS
      whyTitle: "વધુ સારા રિવ્યૂ, વધુ નવા ગ્રાહકો.",
      whyP1: "કોઈપણ દુકાન કે રેસ્ટોરન્ટમાં જતાં પહેલાં, લોકો Google રેટિંગ ચોક્કસ જુએ છે. જો તમારા ગ્રાહકો ખુશ છે પણ રિવ્યૂ નથી લખતા, તો તમે નવા ગ્રાહકો ગુમાવો છો.",
      whyP2: "ZenTap બિલ આપ્યા પછી બરાબર યોગ્ય સમયે રિવ્યૂ માંગવાનું ખૂબ સરળ બનાવી દે છે.",
      whyBullet1: "ખુશ ગ્રાહક દુકાનમાંથી નીકળતા પહેલાં જ સરળતાથી 5 સ્ટાર આપી દે છે.",
      whyBullet2: "સારી Google રેટિંગથી તમારો બિઝનેસ Google Maps સર્ચમાં સૌથી ઉપર આવે છે.",
      whyBullet3: "રિવ્યૂ માંગવામાં કોઈ સંકોચ નહીં — ગ્રાહક કાઉન્ટર પર જાતે જ ફોન ટેપ કરે છે.",

      // 3. HOW IT WORKS
      howTitle: "આ કેવી રીતે કામ કરે છે",
      howSub: "ત્રણ સરળ પગલાં. દરેક Android અને iPhone પર ચાલે છે.",
      step1Title: "૧. ગ્રાહક બિલ ચૂકવે છે",
      step1Desc: "સરસ જમ્યા પછી, વાળ કપાવ્યા પછી, ક્લિનિક કે ખરીદી પછી ગ્રાહક કાઉન્ટર પર પેમેન્ટ કરે છે.",
      step2Title: "૨. સ્ટેન્ડ પર ફોન ટેપ કરે છે",
      step2Desc: "ગ્રાહક પોતાનો સ્માર્ટફોન ZenTap સ્ટેન્ડ પર અડાવે છે, અથવા કેમેરાથી QR સ્કેન કરે છે.",
      step3Title: "૩. તમારું Google રિવ્યૂ પેજ ખુલી જાય છે",
      step3Desc: "સીધું તમારી દુકાનનું Google રિવ્યૂ બોક્સ ખુલી જાય છે. ગ્રાહક 5 સ્ટાર આપીને પોસ્ટ કરી દે છે.",

      // 4. PRODUCTS
      prodTitle: "સરળ પ્રોડક્ટ્સ અને સ્પષ્ટ ભાવ",
      prodSub: "એક જ વાર ખરીદો. રિવ્યૂ સ્ટેન્ડ પર કોઈ મહિને ફી નથી.",
      prodAskBtn: "WhatsApp પર પૂછો",

      p1Name: "Review Stand",
      p1Price: "રૂ 999 (સ્ટેન્ડ) / રૂ 499 (કાર્ડ)",
      p1Desc: "ટેપ કે સ્કેન કરતાં જ સીધું તમારું Google રિવ્યૂ પેજ ખુલે છે. એક જ વાર પેમેન્ટ, કોઈ મંથલી ફી નહીં.",
      p1Features: [
        "૧ ટેપમાં Google Maps રિવ્યૂ પેજ ખૂલે છે",
        "NFC ટેપ અને QR કોડ બંને સામેલ છે",
        "મજબૂત, સ્ક્રેચ-પ્રૂફ એક્રેલિક ફિનિશ",
        "આજીવન ઉપયોગ: કોઈ માસિક સબ્સ્ક્રિપ્શન નહીં"
      ],

      p2Name: "Smart Review Stand",
      p2Price: "રૂ 1,499",
      p2Desc: "તમારું પોતાનું સરળ રિવ્યૂ પેજ ખુલે છે જ્યાં ગ્રાહકો તૈયાર શબ્દો પસંદ કરી શકે છે, જેમ કે 'નમ્ર સ્ટાફ' કે 'સ્વચ્છ જગ્યા'. જેમને લખતાં નથી ફાવતું તેઓ પણ ઝડપથી રિવ્યૂ પોસ્ટ કરી દે છે.",
      p2Features: [
        "તૈયાર પ્રશંસાના મુદ્દા ('ઝડપી સેવા', 'ઉત્તમ સ્ટાફ')",
        "ગ્રાહક માટે રિવ્યૂ લખવું એકદમ આસાન",
        "ગ્રાહક સીધો જ Google પર રિવ્યૂ પોસ્ટ કરે છે",
        "તમારા બિઝનેસના નામ અને લોગો સાથે તૈયાર"
      ],

      p3Name: "Digital Visiting Card",
      p3Price: "રૂ 699 (PVC) / રૂ 1,499 (Metal)",
      p3Desc: "ટેપ કરતાં જ તમારો નંબર ગ્રાહકના ફોનમાં સેવ થઈ જાય છે અને WhatsApp, Instagram તથા વેબસાઇટ શેર થઈ જાય છે.",
      p3Features: [
        "૧ ટેપમાં નંબર ફોન કોન્ટેક્ટમાં સેવ",
        "WhatsApp, Instagram, સરનામું અને વેબસાઇટ શેર કરો",
        "પ્રીમિયમ મેટ PVC અથવા લેસર-મેટલ કાર્ડ",
        "કાગળના કાર્ડ વારંવાર છપાવવાની ઝંઝટમાંથી મુક્તિ"
      ],

      p4Name: "Custom Orders",
      p4Price: "કસ્ટમ ભાવ",
      p4Desc: "વધુ બ્રાન્ચ હોય કે તમારો પોતાનો ખાસ લોગો પ્રિન્ટ કરાવવો હોય? અમને મેસેજ કરો, અમે સ્પેશિયલ ભાવ આપીશું.",
      p4Features: [
        "કસ્ટમ સાઇઝ, કલર અને લોગો ડિઝાઇન",
        "મલ્ટી-બ્રાન્ચ અને મલ્ટી-કાઉન્ટર સેટઅપ",
        "સીધો ફોન અને WhatsApp સપોર્ટ",
        "૩ કે તેથી વધુ ઓર્ડર પર વિશેષ ડિસ્કાઉન્ટ"
      ],

      // 5. WHO IT'S FOR
      whoTitle: "આ કોના માટે છે",
      whoSub: "કાઉન્ટર ધરાવતી અમદાવાદની દરેક દુકાન માટે જે Google પર વધુ ગ્રાહકો ઇચ્છે છે.",
      bizSalons: "સલૂન અને સ્પા",
      bizSalonsDesc: "હેર સ્ટાઇલિંગ, બ્યુટી પાર્લર, બાર્બર શોપ અને સ્કીન ક્લિનિક.",
      bizCafes: "રેસ્ટોરન્ટ અને કાફે",
      bizCafesDesc: "કાફે, મીઠાઈની દુકાનો, બેકરી, રેસ્ટોરન્ટ્સ અને ક્લાઉડ કિચન.",
      bizClinics: "ક્લિનિક અને ડોક્ટર્સ",
      bizClinicsDesc: "ડેન્ટિસ્ટ, આંખના ડોક્ટર, ફિઝિયોથેરાપી અને લેબોરેટરી.",
      bizGyms: "જિમ અને ફિટનેસ સેન્ટર",
      bizGymsDesc: "જિમ, યોગા સ્ટુડિયો, ક્રોસફિટ અને ફિટનેસ ક્લબ.",
      bizHotels: "હોટેલ અને રિસોર્ટ",
      bizHotelsDesc: "હોટેલ, ગેસ્ટ હાઉસ, રિસોર્ટ અને હોમસ્ટે.",
      bizShops: "દુકાનો અને શોરૂમ",
      bizShopsDesc: "જ્વેલરી શોરૂમ, કાપડની દુકાન, ઓપ્ટિક્સ અને ઇલેક્ટ્રોનિક્સ.",

      // 6. PHOTOS
      photosTitle: "કાઉન્ટર પર કેવું દેખાય છે",
      photosSub: "પ્રીમિયમ એક્રેલિક અને લાકડાની ફિનિશ, જે તમારા કાઉન્ટરની સુંદરતા વધારે છે.",

      // 7. MORE THAN REVIEWS
      moreTitle: "એક ટેપથી બીજું ઘણું બધું પણ થઈ શકે છે",
      moreSub: "જો તમારે માત્ર રિવ્યૂ ઉપરાંત પણ કંઈક જોઈતું હોય, તો એક જ ટેપ આ કામ પણ કરી શકે છે:",
      more1Title: "સીધી WhatsApp વાતચીત",
      more1Desc: "ગ્રાહક ફોન ટેપ કરીને સીધો તમારી સાથે WhatsApp ચેટ શરૂ કરી શકે છે.",
      more2Title: "એપોઇન્ટમેન્ટ કે ટેબલ બુકિંગ લિંક",
      more2Desc: "ફરી મુલાકાત કે ટેબલ બુકિંગ માટે સીધી ઓનલાઇન લિંક ખુલી જાય છે.",
      more3Title: "ડિજિટલ મેનૂ કે સર્વિસ ફોટા",
      more3Desc: "રેસ્ટોરન્ટનું મેનૂ કાર્ડ કે સલૂનનું સર્વિસ લિસ્ટ ફોન પર દેખાય છે.",
      more4Title: "ગ્રાહક પૂછપરછ ફોર્મ",
      more4Desc: "ગ્રાહકનું નામ અને ફોન નંબર મેળવવા માટે સરળ ફોર્મ ખુલે છે.",

      // 8. FAQ
      faqTitle: "વારંવાર પૂછાતા સવાલો",
      faqSub: "ZenTap વિશે સરળ અને સીધા જવાબો.",

      // 9. FINAL CTA
      ctaTitle: "Google પર વધુ રિવ્યૂ મેળવવા તૈયાર છો?",
      ctaSub: "અમને WhatsApp પર મેસેજ કરો. અમે તમને લાઇવ ડેમો બતાવીશું અને બધા પ્રશ્નોના જવાબ આપીશું.",
      ctaBtn: "WhatsApp પર ફ્રી ડેમો લો",
    },
  };

  const t = content[currentLang] || content.en;

  // 5 FAQ Questions with Class 8 English / Hindi / Gujarati answers
  const faqs = [
    {
      q: {
        en: "Do customers need an app?",
        hi: "क्या ग्राहकों को कोई ऐप डाउनलोड करना पड़ता है?",
        gu: "શું ગ્રાહકોએ કોઈ એપ ડાઉનલોડ કરવી પડે છે?",
      },
      a: {
        en: "No. Customers do not need to download any app. They just touch their smartphone to the stand or scan the QR code with their normal phone camera.",
        hi: "नहीं। ग्राहकों को कोई ऐप डाउनलोड नहीं करना पड़ता। वे बस अपना फोन स्टैंड पर छूते हैं या कैमरे से QR स्कैन करते हैं।",
        gu: "ના. ગ્રાહકોએ કોઈ એપ ડાઉનલોડ કરવાની જરૂર નથી. તેઓ ફક્ત પોતાનો ફોન સ્ટેન્ડ પર અડાવે છે અથવા કેમેરાથી QR સ્કેન કરે છે.",
      },
    },
    {
      q: {
        en: "Does it need charging or batteries?",
        hi: "क्या इसे चार्जिंग या बैटरी की ज़रूरत होती है?",
        gu: "શું આને ચાર્જિંગ કે બેટરીની જરૂર પડે છે?",
      },
      a: {
        en: "No battery, no charging, and no wires. It uses contactless tap technology powered by the customer's smartphone. It works 24/7 forever.",
        hi: "कोई बैटरी नहीं, कोई चार्जिंग नहीं और कोई तार नहीं। यह ग्राहक के फोन के सिग्नल से चलता है और हमेशा काम करता रहता है।",
        gu: "કોઈ બેટરી નહીં, કોઈ ચાર્જિંગ નહીં અને કોઈ વાયર નહીં. આ ગ્રાહકના ફોનની મદદથી ચાલે છે અને હંમેશા ચાલુ રહે છે.",
      },
    },
    {
      q: {
        en: "Can I change my link later?",
        hi: "क्या मैं भविष्य में अपनी लिंक बदल सकता हूँ?",
        gu: "શું હું ભવિષ્યમાં લિંક બદલી શકું છું?",
      },
      a: {
        en: "Yes. If you change your Google Maps profile or want to update your link, we can update it in seconds without you needing to buy a new stand.",
        hi: "हाँ। अगर आप अपनी दुकान का Google पेज बदलते हैं, तो हम कुछ ही सेकंड में लिंक अपडेट कर देते हैं। नया स्टैंड खरीदने की ज़रूरत नहीं होती।",
        gu: "હા. જો તમારી Google લિંક બદલાય, તો અમે થોડી સેકન્ડમાં નવી લિંક સેટ કરી આપીએ છીએ. નવું સ્ટેન્ડ ખરીદવાની જરૂર રહેતી નથી.",
      },
    },
    {
      q: {
        en: "Is it allowed by Google?",
        hi: "क्या यह Google के नियमों के अनुसार सही है?",
        gu: "શું આ Google ના નિયમો મુજબ માન્ય છે?",
      },
      a: {
        en: "Yes, 100%. We never pay customers for reviews, and every single customer sees the official Google review screen directly. It is completely safe and encouraged.",
        hi: "हाँ, बिल्कुल। हम ग्राहकों को पैसे देकर रिव्यू नहीं लिखवाते। हर ग्राहक सीधे आपकी दुकान के ऑफिशियल Google पेज पर रिव्यू लिखता है, जो 100% सुरक्षित है।",
        gu: "હા, ૧૦૦% માન્ય છે. અમે ગ્રાહકોને પૈસા આપીને રિવ્યૂ નથી કરાવતા. દરેક ગ્રાહક સીધા જ તમારા સત્તાવાર Google પેજ પર રિવ્યૂ આપે છે.",
      },
    },
    {
      q: {
        en: "How long does delivery take?",
        hi: "ડિલિવરીમાં કેટલો સમય લાગે છે? / डिलीवरी में कितना समय लगता है?",
        gu: "ડિલિવરીમાં કેટલો સમય લાગે છે?",
      },
      a: {
        en: "24 to 48 hours across Ahmedabad. For other cities in Gujarat and across India, delivery takes 3 to 5 business days.",
        hi: "अहमदाबाद में 24 से 48 घंटे में डिलीवरी हो जाती है। गुजरात के अन्य शहरों और पूरे भारत में 3 से 5 दिन लगते हैं।",
        gu: "અમદાવાદમાં ૨૪ થી ૪૮ કલાકમાં ડિલિવરી મળી જાય છે. ગુજરાતના અન્ય શહેરો અને સમગ્ર ભારતમાં ૩ થી ૫ દિવસ લાગે છે.",
      },
    },
  ];

  // 10 compressed Standee Photos for Section 6 (zero jargon captions)
  const standeePhotos = [
    { src: "/standees/Gold.webp", label: "Champagne Gold Acrylic" },
    { src: "/standees/Steel.webp", label: "Brushed Satin Steel" },
    { src: "/standees/Wood Trans.webp", label: "Natural Beechwood Base" },
    { src: "/standees/Pink.webp", label: "Blush Rose Gold" },
    { src: "/standees/1.webp", label: "Counter Setup Overview" },
    { src: "/standees/2.webp", label: "Tap & Scan Target" },
    { src: "/standees/3.webp", label: "Front Counter View" },
    { src: "/standees/4.webp", label: "Polished Beveled Edges" },
    { src: "/standees/5.webp", label: "Compact Desk Card" },
    { src: "/standees/6.webp", label: "Ready for Billing Counter" },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO SECTION                                               */}
      {/* ------------------------------------------------------------- */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16 sm:py-20 text-center flex flex-col items-center">
        
        {/* Trust pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141720] border border-[#232734] text-xs font-semibold text-emerald-400 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{currentLang === "gu" ? "અમદાવાદના વેપારીઓની પહેલી પસંદ" : currentLang === "hi" ? "अहमदाबाद के बिज़नेस की पहली पसंद" : "Trusted by 100+ Ahmedabad Businesses"}</span>
        </div>

        {/* H1 - Exact text as mandated by prompt */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl">
          {t.h1}
        </h1>

        {/* Subtitle - Exact text as mandated by prompt */}
        <p className="mt-5 text-base sm:text-xl text-zinc-300 max-w-2xl leading-relaxed">
          {t.sub}
        </p>

        {/* Main Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <a
            href={getWaLink(t.heroWaMsg)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("hero")}
            className="tactile-btn w-full sm:w-auto min-h-[52px] px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950/30 transition-transform active:scale-[0.978] cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-black text-black" />
            <span>{t.heroBtnDemo}</span>
          </a>

          <a
            href="#products"
            className="tactile-btn w-full sm:w-auto min-h-[52px] px-7 py-3.5 rounded-full bg-[#141720] hover:bg-[#1d2230] text-white border border-[#232734] font-bold text-base flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>{t.heroBtnPrices}</span>
            <ArrowRight className="w-4 h-4 text-zinc-400" />
          </a>
        </div>

        {/* Small line under buttons */}
        <p className="mt-5 text-xs sm:text-sm font-medium text-zinc-300">
          {t.heroBadgeLine}
        </p>

        {/* Hero Visual Mockup */}
        <div className="mt-12 w-full max-w-4xl relative rounded-3xl overflow-hidden border border-[#232734] bg-gradient-to-b from-[#141720] to-[#0a0c10] p-4 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-[#232734]/80 shadow-inner">
              <Image
                src="/standees/Gold.webp"
                alt="ZenTap Google Review Stand on Counter"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover"
              />
            </div>

            <div className="text-left flex flex-col gap-4">
              <div className="flex items-center gap-1.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400" />
                ))}
                <span className="ml-2 font-bold text-white text-sm">5.0 Star Experience</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {currentLang === "gu" 
                  ? "કાઉન્ટર પર મૂકો, ગ્રાહક જાતે રિવ્યૂ આપશે." 
                  : currentLang === "hi" 
                  ? "काउंटर पर रखिए, ग्राहक खुद रिव्यू देगा।" 
                  : "Placed right where customers pay."}
              </h3>

              <p className="text-base text-zinc-300 leading-relaxed">
                {currentLang === "gu"
                  ? "કોઈ પણ ફોન પર ચાલે છે. માત્ર એક ટચ અને તમારું ગૂગલ રિવ્યૂ પેજ ગ્રાહકના ફોનમાં ખુલી જાય છે."
                  : currentLang === "hi"
                  ? "किसी भी स्मार्टफोन पर काम करता है। बस एक स्पर्श और आपका Google रिव्यू पेज ग्राहक के फोन पर खुल जाता है।"
                  : "Works with any phone. Just a gentle tap on the stand and your Google review page opens directly."}
              </p>

              <div className="pt-2 flex flex-col gap-2 text-sm text-zinc-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{currentLang === "gu" ? "ઝીરો વાયરો, કોઈ બેટરી નહીં" : currentLang === "hi" ? "कोई वायर नहीं, कोई बैटरी नहीं" : "Zero wires, zero batteries"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{currentLang === "gu" ? "કોઈ પણ એપ ઇન્સ્ટોલ કરવાની જરૂર નથી" : currentLang === "hi" ? "कोई ऐप डाउनलोड करने की ज़रूरत नहीं" : "No customer app needed"}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. WHY IT MATTERS                                             */}
      {/* ------------------------------------------------------------- */}
      <section id="why-it-matters" className="w-full bg-[#0e1015] border-y border-[#232734] py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff7a00]">
              {currentLang === "gu" ? "આ શા માટે જરૂરી છે" : currentLang === "hi" ? "यह क्यों ज़रूरी है" : "Why It Matters"}
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
              {t.whyTitle}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed">
              {t.whyP1}
            </p>
            <p className="mt-2 text-base sm:text-lg text-emerald-400 font-semibold leading-relaxed">
              {t.whyP2}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#141720] border border-[#232734] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.whyBullet1}</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {currentLang === "gu" 
                  ? "દુકાનમાંથી ગયા પછી ગ્રાહકો ભૂલી જાય છે. કાઉન્ટર પર પૂછવાથી ૧૦ ગણા વધુ રિવ્યૂ મળે છે."
                  : currentLang === "hi"
                  ? "दुकान से जाने के बाद ग्राहक भूल जाते हैं। काउंटर पर पूछने से तुरंत रिव्यू मिल जाता है।"
                  : "Customers forget once they leave. Asking while they are at the billing counter yields 10x more reviews."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#141720] border border-[#232734] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.whyBullet2}</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {currentLang === "gu"
                  ? "જે બિઝનેસના રેટિંગ અને રિવ્યૂ વધુ હોય, ગુગલ તેને મેપ સર્ચમાં સૌથી પહેલાં બતાવે છે."
                  : currentLang === "hi"
                  ? "जिस दुकान की रेटिंग और रिव्यू ज्यादा होते हैं, Google Maps उसे हमेशा सबसे ऊपर दिखाता है।"
                  : "Businesses with more recent, positive reviews are ranked at the top of local Google Maps search."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#141720] border border-[#232734] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.whyBullet3}</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {currentLang === "gu"
                  ? "સ્ટાફે વારંવાર વિનંતી નથી કરવી પડતી. સ્ટેન્ડ પોતે જ ગ્રાહકને આકર્ષિત કરે છે."
                  : currentLang === "hi"
                  ? "स्टाफ को बार-बार बोलना नहीं पड़ता। काउंटर पर रखा सुंदर स्टैंड खुद ही ध्यान खींचता है।"
                  : "Staff never feels awkward asking. The stand naturally invites the customer to tap their phone."}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. HOW IT WORKS (3 Big Steps)                                 */}
      {/* ------------------------------------------------------------- */}
      <section id="how-it-works" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff7a00]">
            {t.howTitle}
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.howTitle}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-zinc-300">
            {t.howSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Step 1 */}
          <div className="relative p-7 rounded-3xl bg-[#141720] border border-[#232734] flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ff7a00]/10 text-[#ff7a00] flex items-center justify-center font-extrabold text-xl">
              <CreditCard className="w-6 h-6 text-[#ff7a00]" />
            </div>
            <h3 className="text-xl font-bold text-white leading-snug">
              {t.step1Title}
            </h3>
            <p className="text-base text-zinc-300 leading-relaxed">
              {t.step1Desc}
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-7 rounded-3xl bg-[#141720] border border-[#232734] flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center font-extrabold text-xl">
              <Smartphone className="w-6 h-6 text-[#25D366]" />
            </div>
            <h3 className="text-xl font-bold text-white leading-snug">
              {t.step2Title}
            </h3>
            <p className="text-base text-zinc-300 leading-relaxed">
              {t.step2Desc}
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-7 rounded-3xl bg-[#141720] border border-[#232734] flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-extrabold text-xl">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white leading-snug">
              {t.step3Title}
            </h3>
            <p className="text-base text-zinc-300 leading-relaxed">
              {t.step3Desc}
            </p>
          </div>

        </div>

      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. PRODUCTS & PRICING (4 Cards, Price Large)                  */}
      {/* ------------------------------------------------------------- */}
      <section id="products" className="w-full bg-[#0a0c10] border-y border-[#232734] py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff7a00]">
              {t.prodTitle}
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t.prodTitle}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-zinc-300">
              {t.prodSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Review Stand */}
            <div className="p-6 rounded-3xl bg-[#141720] border border-[#232734] flex flex-col justify-between hover:border-[#ff7a00]/40 transition-colors">
              <div>
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-zinc-200">
                  Most Popular
                </span>
                <h3 className="mt-3 text-xl font-bold text-white">{t.p1Name}</h3>
                
                {/* Price Large */}
                <div className="mt-4 pb-4 border-b border-[#232734]">
                  <span className="text-2xl font-extrabold text-[#ff7a00] block">{t.p1Price}</span>
                  <span className="text-xs text-zinc-300 block mt-1 font-medium">One-time payment • No monthly fee</span>
                </div>

                <p className="mt-4 text-base text-zinc-300 leading-relaxed">
                  {t.p1Desc}
                </p>

                <ul className="mt-6 space-y-2.5 text-sm text-zinc-300">
                  {t.p1Features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={getWaLink(`Hello ZenTap, I want to ask about the Review Stand (${t.p1Price})`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("product_review_stand")}
                className="tactile-btn mt-8 w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-black text-black" />
                <span>{t.prodAskBtn}</span>
              </a>
            </div>

            {/* Card 2: Smart Review Stand */}
            <div className="p-6 rounded-3xl bg-[#141720] border-2 border-emerald-500/40 relative flex flex-col justify-between shadow-xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-black text-[11px] font-extrabold uppercase tracking-wide">
                Smart Suggestions
              </div>

              <div>
                <h3 className="mt-3 text-xl font-bold text-white">{t.p2Name}</h3>
                
                {/* Price Large */}
                <div className="mt-4 pb-4 border-b border-[#232734]">
                  <span className="text-3xl font-extrabold text-emerald-400 block">{t.p2Price}</span>
                  <span className="text-xs text-zinc-300 block mt-1 font-medium">One-time setup • Ready in 24 hrs</span>
                </div>

                <p className="mt-4 text-base text-zinc-300 leading-relaxed">
                  {t.p2Desc}
                </p>

                <ul className="mt-6 space-y-2.5 text-sm text-zinc-300">
                  {t.p2Features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={getWaLink(`Hello ZenTap, I want to ask about the Smart Review Stand (${t.p2Price})`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("product_smart_stand")}
                className="tactile-btn mt-8 w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-black text-black" />
                <span>{t.prodAskBtn}</span>
              </a>
            </div>

            {/* Card 3: Digital Visiting Card */}
            <div className="p-6 rounded-3xl bg-[#141720] border border-[#232734] flex flex-col justify-between hover:border-[#ff7a00]/40 transition-colors">
              <div>
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-zinc-200">
                  For Business Owners
                </span>
                <h3 className="mt-3 text-xl font-bold text-white">{t.p3Name}</h3>
                
                {/* Price Large */}
                <div className="mt-4 pb-4 border-b border-[#232734]">
                  <span className="text-2xl font-extrabold text-white block">{t.p3Price}</span>
                  <span className="text-xs text-zinc-300 block mt-1 font-medium">Keep in your wallet • Tap on phones</span>
                </div>

                <p className="mt-4 text-base text-zinc-300 leading-relaxed">
                  {t.p3Desc}
                </p>

                <ul className="mt-6 space-y-2.5 text-sm text-zinc-300">
                  {t.p3Features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={getWaLink(`Hello ZenTap, I want to ask about the Digital Visiting Card (${t.p3Price})`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("product_visiting_card")}
                className="tactile-btn mt-8 w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-black text-black" />
                <span>{t.prodAskBtn}</span>
              </a>
            </div>

            {/* Card 4: Custom Orders */}
            <div className="p-6 rounded-3xl bg-[#141720] border border-[#232734] flex flex-col justify-between hover:border-[#ff7a00]/40 transition-colors">
              <div>
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-zinc-200">
                  Multiple Branches
                </span>
                <h3 className="mt-3 text-xl font-bold text-white">{t.p4Name}</h3>
                
                {/* Price Large */}
                <div className="mt-4 pb-4 border-b border-[#232734]">
                  <span className="text-2xl font-extrabold text-zinc-300 block">{t.p4Price}</span>
                  <span className="text-xs text-zinc-300 block mt-1 font-medium">Bulk discounts for 3+ counters</span>
                </div>

                <p className="mt-4 text-base text-zinc-300 leading-relaxed">
                  {t.p4Desc}
                </p>

                <ul className="mt-6 space-y-2.5 text-sm text-zinc-300">
                  {t.p4Features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={getWaLink("Hello ZenTap, I want to discuss a Custom Bulk Order for multiple counters/branches")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("product_custom_bulk")}
                className="tactile-btn mt-8 w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-black text-black" />
                <span>{t.prodAskBtn}</span>
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. WHO IT'S FOR                                               */}
      {/* ------------------------------------------------------------- */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff7a00]">
            {t.whoTitle}
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.whoTitle}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-zinc-300">
            {t.whoSub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-[#141720] border border-[#232734] flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.bizSalons}</h3>
              <p className="mt-1 text-sm text-zinc-300 leading-relaxed">{t.bizSalonsDesc}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#141720] border border-[#232734] flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.bizCafes}</h3>
              <p className="mt-1 text-sm text-zinc-300 leading-relaxed">{t.bizCafesDesc}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#141720] border border-[#232734] flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.bizClinics}</h3>
              <p className="mt-1 text-sm text-zinc-300 leading-relaxed">{t.bizClinicsDesc}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#141720] border border-[#232734] flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.bizGyms}</h3>
              <p className="mt-1 text-sm text-zinc-300 leading-relaxed">{t.bizGymsDesc}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#141720] border border-[#232734] flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.bizHotels}</h3>
              <p className="mt-1 text-sm text-zinc-300 leading-relaxed">{t.bizHotelsDesc}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#141720] border border-[#232734] flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center flex-shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.bizShops}</h3>
              <p className="mt-1 text-sm text-zinc-300 leading-relaxed">{t.bizShopsDesc}</p>
            </div>
          </div>

        </div>

      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. PHOTOS: "How it looks on your counter" (No Jargon Captions) */}
      {/* ------------------------------------------------------------- */}
      <section id="photos" className="w-full bg-[#0e1015] border-y border-[#232734] py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff7a00]">
              {t.photosTitle}
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t.photosTitle}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-zinc-300">
              {t.photosSub}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {standeePhotos.map((photo, idx) => (
              <div 
                key={idx}
                className="group relative rounded-2xl overflow-hidden border border-[#232734] bg-[#141720] aspect-4/5 flex flex-col justify-end p-3 transition-transform hover:scale-[1.02] duration-200"
              >
                <Image
                  src={photo.src}
                  alt={photo.label}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                <span className="relative z-10 text-xs sm:text-sm font-bold text-white leading-tight drop-shadow-sm">
                  {photo.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. MORE THAN REVIEWS (4 Simple Points)                         */}
      {/* ------------------------------------------------------------- */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff7a00]">
            {t.moreTitle}
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.moreTitle}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-zinc-300">
            {t.moreSub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div className="p-7 rounded-3xl bg-[#141720] border border-[#232734] flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 fill-[#25D366] text-[#25D366]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.more1Title}</h3>
              <p className="mt-1.5 text-base text-zinc-300 leading-relaxed">{t.more1Desc}</p>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-[#141720] border border-[#232734] flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.more2Title}</h3>
              <p className="mt-1.5 text-base text-zinc-300 leading-relaxed">{t.more2Desc}</p>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-[#141720] border border-[#232734] flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.more3Title}</h3>
              <p className="mt-1.5 text-base text-zinc-300 leading-relaxed">{t.more3Desc}</p>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-[#141720] border border-[#232734] flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.more4Title}</h3>
              <p className="mt-1.5 text-base text-zinc-300 leading-relaxed">{t.more4Desc}</p>
            </div>
          </div>

        </div>

      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. FAQ (5 Questions, Expandable Accordion)                     */}
      {/* ------------------------------------------------------------- */}
      <section id="faq" className="w-full bg-[#0a0c10] border-y border-[#232734] py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff7a00]">
              {t.faqTitle}
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t.faqTitle}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-zinc-300">
              {t.faqSub}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              const question = faq.q[currentLang] || faq.q.en;
              const answer = faq.a[currentLang] || faq.a.en;

              return (
                <div
                  key={index}
                  className="rounded-2xl bg-[#141720] border border-[#232734] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <span className="text-base sm:text-lg font-bold text-white">
                      {question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-zinc-400 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? "rotate-180 text-[#ff7a00]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-base text-zinc-300 leading-relaxed border-t border-[#232734]/60">
                      {answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. FINAL CALL TO ACTION                                       */}
      {/* ------------------------------------------------------------- */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center flex flex-col items-center">
        
        <div className="w-16 h-16 rounded-3xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center mb-6">
          <MessageCircle className="w-8 h-8 fill-[#25D366] text-[#25D366]" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl">
          {t.ctaTitle}
        </h2>

        <p className="mt-4 text-base sm:text-xl text-zinc-300 max-w-xl leading-relaxed">
          {t.ctaSub}
        </p>

        <a
          href={getWaLink(t.heroWaMsg)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick("final_cta")}
          className="tactile-btn mt-8 min-h-[54px] px-8 py-4 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-950/40 transition-transform active:scale-[0.978] cursor-pointer"
        >
          <MessageCircle className="w-6 h-6 fill-black text-black" />
          <span>{t.ctaBtn}</span>
        </a>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-zinc-300">
          <span>Ahmedabad: +91 92745 60880</span>
          <span>•</span>
          <span>contact@zentapdigitalsolutions.com</span>
        </div>

      </section>

    </div>
  );
}
