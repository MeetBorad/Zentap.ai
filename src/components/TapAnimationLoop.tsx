"use client";

import React from "react";

interface TapAnimationLoopProps {
  className?: string;
}

export default function TapAnimationLoop({ className = "" }: TapAnimationLoopProps) {
  return (
    <div className={`relative w-full aspect-[360/280] overflow-hidden rounded-2xl select-none shadow-2xl ${className}`}>
      <svg
        className="w-full h-full select-none block"
        viewBox="0 0 360 280"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients & Glows */}
          <linearGradient id="bgGlow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ecfdf5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="phoneBody" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="standGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>

          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.12" />
          </filter>

          <filter id="tapGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <clipPath id="phoneInnerClip">
            <rect x="74" y="29" width="97" height="182" rx="14" />
          </clipPath>

          <style>{`
            /* Timeline of 6s loop:
               0s - 0.6s: Phone lowers toward stand
               0.6s: Tap occurs, ripple expands (0.6s - 1.4s)
               0.9s - 1.5s: Review card slides up inside phone
               1.5s - 2.5s: Stars light up one by one
               2.5s - 5.0s: Pause & celebrate (full preview shown)
               5.0s - 5.8s: Phone resets back up, review card hides
               5.8s - 6.0s: Ready for next cycle
            */
            @keyframes phoneMotion {
              0% { transform: translate(130px, 30px) rotate(-6deg); }
              10% { transform: translate(130px, 30px) rotate(-6deg); }
              22% { transform: translate(96px, 78px) rotate(-1deg); } /* Tap point */
              25% { transform: translate(98px, 76px) rotate(-1deg); }
              80% { transform: translate(98px, 76px) rotate(-1deg); }
              92% { transform: translate(130px, 30px) rotate(-6deg); }
              100% { transform: translate(130px, 30px) rotate(-6deg); }
            }

            @keyframes rippleEffect {
              0%, 12% { transform: scale(0.2); opacity: 0; }
              14% { opacity: 0.9; }
              26% { transform: scale(2.8); opacity: 0; }
              100% { transform: scale(2.8); opacity: 0; }
            }

            @keyframes rippleRing2 {
              0%, 15% { transform: scale(0.2); opacity: 0; }
              18% { opacity: 0.6; }
              32% { transform: scale(3.6); opacity: 0; }
              100% { transform: scale(3.6); opacity: 0; }
            }

            @keyframes screenSlideUp {
              0%, 20% { transform: translateY(120px); opacity: 0; }
              28% { transform: translateY(0px); opacity: 1; }
              80% { transform: translateY(0px); opacity: 1; }
              88% { transform: translateY(120px); opacity: 0; }
              100% { transform: translateY(120px); opacity: 0; }
            }

            @keyframes star1 { 0%, 27% { fill: #cbd5e1; transform: scale(0.8); } 30%, 82% { fill: #f59e0b; transform: scale(1.1); } 86%, 100% { fill: #cbd5e1; transform: scale(0.8); } }
            @keyframes star2 { 0%, 30% { fill: #cbd5e1; transform: scale(0.8); } 33%, 82% { fill: #f59e0b; transform: scale(1.1); } 86%, 100% { fill: #cbd5e1; transform: scale(0.8); } }
            @keyframes star3 { 0%, 33% { fill: #cbd5e1; transform: scale(0.8); } 36%, 82% { fill: #f59e0b; transform: scale(1.1); } 86%, 100% { fill: #cbd5e1; transform: scale(0.8); } }
            @keyframes star4 { 0%, 36% { fill: #cbd5e1; transform: scale(0.8); } 39%, 82% { fill: #f59e0b; transform: scale(1.1); } 86%, 100% { fill: #cbd5e1; transform: scale(0.8); } }
            @keyframes star5 { 0%, 39% { fill: #cbd5e1; transform: scale(0.8); } 43%, 82% { fill: #f59e0b; transform: scale(1.2); } 86%, 100% { fill: #cbd5e1; transform: scale(0.8); } }

            @keyframes nfcBeam {
              0%, 18% { opacity: 0; transform: scale(0.6); }
              22% { opacity: 1; transform: scale(1); }
              30% { opacity: 0; transform: scale(1.3); }
              100% { opacity: 0; }
            }

            .anim-phone { animation: phoneMotion 6s cubic-bezier(0.25, 1, 0.5, 1) infinite; transform-origin: 200px 180px; }
            .anim-ripple { animation: rippleEffect 6s ease-out infinite; transform-origin: 145px 125px; }
            .anim-ripple2 { animation: rippleRing2 6s ease-out infinite; transform-origin: 145px 125px; }
            .anim-nfc-beam { animation: nfcBeam 6s ease-out infinite; transform-origin: 145px 125px; }
            .anim-screen { animation: screenSlideUp 6s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
            
            .anim-star-1 { animation: star1 6s ease infinite; transform-origin: center; }
            .anim-star-2 { animation: star2 6s ease infinite; transform-origin: center; }
            .anim-star-3 { animation: star3 6s ease infinite; transform-origin: center; }
            .anim-star-4 { animation: star4 6s ease infinite; transform-origin: center; }
            .anim-star-5 { animation: star5 6s ease infinite; transform-origin: center; }

            @media (prefers-reduced-motion: reduce) {
              .anim-phone, .anim-ripple, .anim-ripple2, .anim-screen, .anim-star-1, .anim-star-2, .anim-star-3, .anim-star-4, .anim-star-5, .anim-nfc-beam {
                animation: none !important;
              }
              .anim-phone { transform: translate(100px, 75px) rotate(-1deg); }
              .anim-screen { transform: translateY(0px); opacity: 1; }
              .anim-star-1, .anim-star-2, .anim-star-3, .anim-star-4, .anim-star-5 { fill: #f59e0b; }
            }
          `}</style>
        </defs>

        {/* Background Base / Tabletop */}
        <rect x="0" y="0" width="360" height="280" rx="16" fill="url(#bgGlow)" />

        {/* Countertop surface line & shadow */}
        <ellipse cx="180" cy="225" rx="150" ry="24" fill="#e2e8f0" opacity="0.6" />
        <rect x="20" y="220" width="320" height="6" rx="3" fill="#cbd5e1" opacity="0.4" />

        {/* STAND: ZenTap Acrylic NFC Stand */}
        <g id="stand-group" filter="url(#softShadow)">
          {/* Stand Base */}
          <ellipse cx="140" cy="216" rx="46" ry="12" fill="#0f172a" opacity="0.1" />
          <ellipse cx="140" cy="212" rx="42" ry="9" fill="#e2e8f0" />
          <ellipse cx="140" cy="210" rx="40" ry="8" fill="#f8fafc" />

          {/* Stand Body (Tilted Acrylic Plaque) */}
          <path
            d="M110,210 L124,115 C125,110 128,107 133,107 L173,107 C178,107 182,110 183,115 L170,210 Z"
            fill="url(#standGrad)"
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />

          {/* Glass edge reflection */}
          <path d="M125,115 L130,210" stroke="#ffffff" strokeWidth="2" opacity="0.8" />

          {/* NFC Icon on Stand */}
          <g transform="translate(142, 130)">
            <circle cx="9" cy="9" r="14" fill="#10b981" opacity="0.12" />
            {/* Contactless waves */}
            <path d="M6,6 C8,4 12,4 14,6" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M4,9 C7,6 13,6 16,9" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M2,12 C6,8 14,8 18,12" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
          </g>

          {/* ZenTap Brand & Google Badge on Stand */}
          <rect x="132" y="165" width="36" height="12" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
          <text
            x="150"
            y="173"
            fill="#0f172a"
            fontSize="6"
            fontWeight="700"
            letterSpacing="0.4"
            textAnchor="middle"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          >
            ZenTap
          </text>
          <text
            x="150"
            y="188"
            fill="#64748b"
            fontSize="5"
            fontWeight="600"
            textAnchor="middle"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          >
            Tap to Review ★★★★★
          </text>
        </g>

        {/* Ripple Waves from NFC point (145, 125) */}
        <g className="anim-ripple" pointerEvents="none">
          <circle cx="145" cy="125" r="18" fill="none" stroke="#10b981" strokeWidth="3" opacity="0.8" />
        </g>
        <g className="anim-ripple2" pointerEvents="none">
          <circle cx="145" cy="125" r="28" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="4 3" opacity="0.6" />
        </g>

        {/* NFC Pulse Burst */}
        <g className="anim-nfc-beam" pointerEvents="none">
          <circle cx="145" cy="125" r="8" fill="#10b981" filter="url(#tapGlow)" opacity="0.5" />
        </g>

        {/* HAND & PHONE CONTAINER */}
        <g className="anim-phone">
          {/* Stylized Hand Silhouette holding phone */}
          <g id="hand" opacity="0.95">
            <path
              d="M195,145 C205,150 220,165 228,190 C232,205 240,240 240,250 L180,250 C175,225 170,195 168,175 C168,168 174,162 182,162 C185,162 190,160 195,145 Z"
              fill="#fdba74"
              opacity="0.85"
            />
            <path
              d="M195,135 C190,135 186,140 186,146 C186,156 198,162 208,162 C214,162 216,155 214,148 C210,140 202,135 195,135 Z"
              fill="#fed7aa"
            />
          </g>

          {/* Phone Hardware Frame */}
          <g filter="url(#softShadow)">
            {/* Outer Phone Body */}
            <rect x="70" y="25" width="105" height="190" rx="18" fill="url(#phoneBody)" stroke="#334155" strokeWidth="2.5" />

            {/* Screen Bezel Area */}
            <rect x="74" y="29" width="97" height="182" rx="14" fill="#ffffff" />

            {/* Dynamic Island / Top Speaker */}
            <rect x="106" y="34" width="33" height="6" rx="3" fill="#0f172a" />

            {/* Phone Screen UI: Clip path to screen */}
            <g clipPath="url(#phoneInnerClip)">
              {/* Default Phone Ambient Wallpaper before review slides up */}
              <rect x="74" y="29" width="97" height="182" fill="#f8fafc" />

              {/* Status Bar */}
              <text x="82" y="39" fill="#64748b" fontSize="5" fontWeight="700" fontFamily="-apple-system, sans-serif">
                9:41
              </text>
              <circle cx="160" cy="37" r="1.5" fill="#64748b" />
              <path d="M152,36 L156,36 L154,39 Z" fill="#64748b" />

              {/* Ambient App background mockup */}
              <rect x="80" y="50" width="85" height="24" rx="6" fill="#f1f5f9" />
              <rect x="85" y="55" width="35" height="4" rx="2" fill="#cbd5e1" />
              <rect x="85" y="62" width="55" height="3" rx="1.5" fill="#e2e8f0" />

              {/* SLIDING GOOGLE REVIEW SHEET */}
              <g className="anim-screen">
                {/* Modal Sheet Base */}
                <rect x="74" y="65" width="97" height="146" rx="12" fill="#ffffff" filter="url(#softShadow)" />

                {/* Sheet handle bar */}
                <rect x="114" y="70" width="17" height="2.5" rx="1.2" fill="#cbd5e1" />

                {/* Google "G" Multi-color Logo header */}
                <g transform="translate(82, 78)">
                  <circle cx="7" cy="7" r="7" fill="#ffffff" stroke="#f1f5f9" strokeWidth="0.8" />
                  <path d="M11,7 C11,6.7 10.97,6.4 10.9,6.2 L7,6.2 L7,7.8 L9.2,7.8 C9.1,8.3 8.8,8.8 8.4,9.1 L8.4,10.2 L9.7,10.2 C10.5,9.4 11,8.3 11,7 Z" fill="#4285f4" />
                  <path d="M7,11 C8.1,11 9,10.6 9.7,10.2 L8.4,9.1 C8,9.4 7.5,9.5 7,9.5 C5.9,9.5 5,8.8 4.7,7.8 L3.4,7.8 L3.4,8.8 C4.1,10.2 5.4,11 7,11 Z" fill="#34a853" />
                  <path d="M4.7,7.8 C4.6,7.5 4.6,7.3 4.6,7 C4.6,6.7 4.6,6.5 4.7,6.2 L4.7,5.2 L3.4,5.2 C3.1,5.8 3,6.4 3,7 C3,7.6 3.1,8.2 3.4,8.8 L4.7,7.8 Z" fill="#fbbc05" />
                  <path d="M7,4.5 C7.6,4.5 8.1,4.7 8.6,5.1 L9.8,3.9 C9,3.2 8.1,2.8 7,2.8 C5.4,2.8 4.1,3.7 3.4,5.1 L4.7,6.2 C5,5.2 5.9,4.5 7,4.5 Z" fill="#ea4335" />
                </g>
                <text
                  x="100"
                  y="85"
                  fill="#0f172a"
                  fontSize="6.5"
                  fontWeight="700"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                >
                  Cafe Milano
                </text>
                <text
                  x="100"
                  y="91"
                  fill="#64748b"
                  fontSize="4.8"
                  fontFamily="-apple-system, sans-serif"
                >
                  Google Reviews
                </text>

                {/* Divider line */}
                <line x1="82" y1="96" x2="163" y2="96" stroke="#f1f5f9" strokeWidth="0.8" />

                {/* "Rate your experience" label */}
                <text
                  x="122.5"
                  y="105"
                  fill="#334155"
                  fontSize="5.2"
                  fontWeight="600"
                  textAnchor="middle"
                  fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
                >
                  Tap to rate 5 stars
                </text>

                {/* 5 STARS FILLING IN */}
                <g transform="translate(86, 110)">
                  {/* Star 1 */}
                  <path className="anim-star-1" d="M7,1.5 L8.5,5 L12.5,5.3 L9.5,8 L10.4,12 L7,9.8 L3.6,12 L4.5,8 L1.5,5.3 L5.5,5 Z" />
                  {/* Star 2 */}
                  <path className="anim-star-2" d="M7,1.5 L8.5,5 L12.5,5.3 L9.5,8 L10.4,12 L7,9.8 L3.6,12 L4.5,8 L1.5,5.3 L5.5,5 Z" transform="translate(15, 0)" />
                  {/* Star 3 */}
                  <path className="anim-star-3" d="M7,1.5 L8.5,5 L12.5,5.3 L9.5,8 L10.4,12 L7,9.8 L3.6,12 L4.5,8 L1.5,5.3 L5.5,5 Z" transform="translate(30, 0)" />
                  {/* Star 4 */}
                  <path className="anim-star-4" d="M7,1.5 L8.5,5 L12.5,5.3 L9.5,8 L10.4,12 L7,9.8 L3.6,12 L4.5,8 L1.5,5.3 L5.5,5 Z" transform="translate(45, 0)" />
                  {/* Star 5 */}
                  <path className="anim-star-5" d="M7,1.5 L8.5,5 L12.5,5.3 L9.5,8 L10.4,12 L7,9.8 L3.6,12 L4.5,8 L1.5,5.3 L5.5,5 Z" transform="translate(60, 0)" />
                </g>

                {/* Positive confirmation feedback tag */}
                <rect x="85" y="130" width="75" height="15" rx="4" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="0.7" />
                <text
                  x="122.5"
                  y="139"
                  fill="#047857"
                  fontSize="5"
                  fontWeight="700"
                  textAnchor="middle"
                  fontFamily="-apple-system, sans-serif"
                >
                  ✓ Outstanding Service!
                </text>

                {/* Post Button */}
                <rect x="85" y="152" width="75" height="16" rx="5" fill="#1a73e8" />
                <text
                  x="122.5"
                  y="162"
                  fill="#ffffff"
                  fontSize="5.5"
                  fontWeight="600"
                  textAnchor="middle"
                  fontFamily="-apple-system, sans-serif"
                >
                  Post Review
                </text>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
