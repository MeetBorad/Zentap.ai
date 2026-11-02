"use client";

import React from "react";
import { ArrowUp, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { LanguageCode } from "./Header";
import { trackPhoneClick, trackEmailClick, trackWhatsAppClick } from "@/lib/analytics";

interface FooterProps {
  currentLang?: LanguageCode;
}

export default function Footer({ currentLang = "en" }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const waUrl = currentLang === "gu"
    ? "https://wa.me/919274560880?text=નમસ્તે%20ZenTap%2C%20મને%20Google%20Review%20Standee%20વિશે%20વધુ%20માહિતી%20જોઈએ%20છે."
    : currentLang === "hi"
    ? "https://wa.me/919274560880?text=नमस्ते%20ZenTap%2C%20मुझे%20Google%20Review%20Standee%20के%20बारे%20में%20जानकारी%20चाहिए।"
    : "https://wa.me/919274560880?text=Hello%20ZenTap%2C%20I%20would%20like%20to%20get%20a%20free%20demo%20of%20the%20Google%20Review%20Stand.";

  const textDict = {
    en: {
      tagline: "Smart Google review stands and digital cards for local businesses in Ahmedabad and across India.",
      quickLinks: "Quick Links",
      howItWorks: "How It Works",
      products: "Products & Prices",
      photos: "Photos",
      faq: "FAQ",
      contact: "Get in Touch",
      waAction: "Chat on WhatsApp",
      copyright: "© 2026 ZenTap Digital Solutions. Made in Ahmedabad.",
      top: "Top of page",
    },
    hi: {
      tagline: "अहमदाबाद और पूरे भारत के लोकल बिज़नेस के लिए स्मार्ट Google रिव्यू स्टैंड और डिजिटल कार्ड।",
      quickLinks: "ज़रूरी लिंक",
      howItWorks: "कैसे काम करता है",
      products: "प्रोडक्ट्स और दाम",
      photos: "काउंटर फ़ोटो",
      faq: "सवाल और जवाब",
      contact: "संपर्क करें",
      waAction: "WhatsApp पर बात करें",
      copyright: "© 2026 ZenTap Digital Solutions. अहमदाबाद में निर्मित।",
      top: "ऊपर जाएँ",
    },
    gu: {
      tagline: "અમદાવાદ અને સમગ્ર ભારતના વેપારીઓ માટે સ્માર્ટ Google રિવ્યૂ સ્ટેન્ડ અને ડિજિટલ કાર્ડ.",
      quickLinks: "ઝડપી લિંક્સ",
      howItWorks: "કેવી રીતે કામ કરે છે",
      products: "પ્રોડક્ટ્સ અને ભાવ",
      photos: "કાઉન્ટર ફોટા",
      faq: "સવાલો અને જવાબો",
      contact: "સંપર્ક કરો",
      waAction: "WhatsApp પર વાત કરો",
      copyright: "© 2026 ZenTap Digital Solutions. અમદાવાદમાં નિર્મિત.",
      top: "ટોચ પર જાઓ",
    },
  };

  const t = textDict[currentLang] || textDict.en;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#0a0c10] border-t border-[#232734] mt-16 pt-12 pb-24 md:pb-12 text-sm text-zinc-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-[#232734]">
          
          {/* Col 1: Brand & Description */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="ZenTap" 
                className="h-8 w-auto max-w-[140px] object-contain"
              />
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-sm">
              {t.tagline}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Ahmedabad, Gujarat</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              {t.quickLinks}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t.howItWorks}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("products")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t.products}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("photos")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t.photos}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t.faq}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              {t.contact}
            </h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <a
                href="tel:+919274560880"
                onClick={() => trackPhoneClick("+919274560880", "footer")}
                className="flex items-center gap-2 text-white hover:text-[#ff7a00] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#ff7a00] flex-shrink-0" />
                <span>+91 92745 60880</span>
              </a>

              <a
                href="mailto:contact@zentapdigitalsolutions.com"
                onClick={() => trackEmailClick("contact@zentapdigitalsolutions.com", "footer")}
                className="flex items-center gap-2 text-white hover:text-[#ff7a00] transition-colors break-all"
              >
                <Mail className="w-4 h-4 text-[#ff7a00] flex-shrink-0" />
                <span>contact@zentapdigitalsolutions.com</span>
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("footer")}
                className="flex items-center gap-2 text-[#25D366] hover:text-[#20bd5a] transition-colors font-semibold"
              >
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                <span>{t.waAction}</span>
              </a>

              <div className="flex items-start gap-2 text-zinc-300 text-xs pt-1 leading-relaxed">
                <MapPin className="w-4 h-4 text-[#ff7a00] flex-shrink-0 mt-0.5" />
                <span>Sindhu Bhavan Marg, Bodakdev, Ahmedabad, Gujarat 380054</span>
              </div>
            </div>
          </div>

        </div>

        {/* Colophon Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-zinc-400">
          <p>{t.copyright}</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-xs"
          >
            <span>{t.top}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
