"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Radio, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Cpu, 
  Layers, 
  ArrowRight,
  Maximize2
} from "lucide-react";
import { OpenDesignButton, OpenDesignBadge } from "@/components/open-design";
import gsap from "gsap";

interface HyperFrame {
  id: number;
  tagline: string;
  headline: string;
  highlightText: string;
  subtext: string;
  badge: string;
  duration: number; // in milliseconds
  accentColor: string;
  icon: React.ReactNode;
  metric?: { value: string; label: string };
}

const FRAMES: HyperFrame[] = [
  {
    id: 1,
    tagline: "FRAME 01 / 06 · THE HOOK",
    headline: "91% of customers check Google Reviews",
    highlightText: "before walking in.",
    subtext: "If you don't ask at the moment of peak satisfaction, you lose the review forever. ZenTap intercepts customers at the physical counter.",
    badge: "Customer Footfall Conversion",
    duration: 4000,
    accentColor: "#FF7A59",
    icon: <TrendingUp className="w-6 h-6 text-[#FF7A59]" />,
    metric: { value: "0.6s", label: "Instant Tap Velocity" }
  },
  {
    id: 2,
    tagline: "FRAME 02 / 06 · PRECISION HARDWARE",
    headline: "Machined Obsidian Acrylic",
    highlightText: "+ NTAG216 Chip.",
    subtext: "Precision laser-engraved with your logo. Embedded high-frequency 13.56 MHz NFC antenna and high-contrast Level Q Dynamic QR fallback.",
    badge: "Hardware Craftsmanship",
    duration: 4000,
    accentColor: "#D4AF37",
    icon: <Cpu className="w-6 h-6 text-[#D4AF37]" />,
    metric: { value: "888 B", label: "Certified EEPROM Capacity" }
  },
  {
    id: 3,
    tagline: "FRAME 03 / 06 · ZERO FRICTION",
    headline: "Tap phone to standee.",
    highlightText: "Zero apps required.",
    subtext: "Customers never download an app or scan via third-party scanners. Works natively on all modern iPhones (iOS 13+) and Android devices.",
    badge: "Instant Native NFC",
    duration: 3500,
    accentColor: "#10B981",
    icon: <Radio className="w-6 h-6 text-emerald-500" />,
    metric: { value: "100%", label: "Native Phone Compatibility" }
  },
  {
    id: 4,
    tagline: "FRAME 04 / 06 · ANTI-GATING SENTIMENT",
    headline: "Protect your reputation with",
    highlightText: "Smart Sentiment Routing.",
    subtext: "Happy guests (4-5★) post directly to Google Maps. Constructive critiques (1-2★) route to store management privately to prevent public rating damage.",
    badge: "Google Policy Compliant",
    duration: 4500,
    accentColor: "#3B82F6",
    icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
    metric: { value: "100%", label: "Defused Negative Ratings" }
  },
  {
    id: 5,
    tagline: "FRAME 05 / 06 · AUTOMATED SYNC",
    headline: "24/7 Automated Replies",
    highlightText: "in EN, GU & HI.",
    subtext: "Engage every single reviewer automatically. Fresh, humanized review suggestions encourage diners and clients to share keyword-rich details.",
    badge: "Multilingual Engine",
    duration: 4000,
    accentColor: "#F59E0B",
    icon: <Sparkles className="w-6 h-6 text-amber-500" />,
    metric: { value: "24/7", label: "Automated Review Engagement" }
  },
  {
    id: 6,
    tagline: "FRAME 06 / 06 · THE PAYOFF",
    headline: "Dominate Google Maps",
    highlightText: "Local 3-Pack Authority.",
    subtext: "Higher review velocity signals algorithmic trust to Google, driving organic search traffic and high-ticket customer footfall to your business.",
    badge: "Local SEO Leader",
    duration: 4500,
    accentColor: "#D94826",
    icon: <Layers className="w-6 h-6 text-[#D94826]" />,
    metric: { value: "+410%", label: "Documented Review Growth" }
  }
];

interface HyperFramesPlayerProps {
  onOrderClick?: () => void;
}

export default function HyperFramesPlayer({ onOrderClick }: HyperFramesPlayerProps) {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const frameContainerRef = useRef<HTMLDivElement>(null);

  const currentFrame = FRAMES[currentFrameIndex];

  // Auto-play timeline loop with interpolation
  useEffect(() => {
    if (!isPlaying) return;

    const frameDuration = currentFrame.duration;
    const intervalMs = 50;
    const step = (intervalMs / frameDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentFrameIndex((curr) => (curr + 1) % FRAMES.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, currentFrameIndex, currentFrame.duration]);

  // GSAP transition when frame changes
  useEffect(() => {
    if (frameContainerRef.current) {
      gsap.fromTo(
        frameContainerRef.current.querySelectorAll(".hyper-anim"),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.08 }
      );
    }
  }, [currentFrameIndex]);

  const handleNext = () => {
    setProgress(0);
    setCurrentFrameIndex((prev) => (prev + 1) % FRAMES.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentFrameIndex((prev) => (prev - 1 + FRAMES.length) % FRAMES.length);
  };

  const handleSelectFrame = (idx: number) => {
    setProgress(0);
    setCurrentFrameIndex(idx);
  };

  return (
    <div className="w-full relative overflow-hidden rounded-3xl bg-[#141312] border border-[#2C2B2A] text-white shadow-2xl">
      {/* 1. HyperFrames Top Linear Progress Bar */}
      <div className="w-full h-1.5 bg-white/10 relative">
        <div 
          className="h-full transition-all duration-75 ease-linear"
          style={{ 
            width: `${((currentFrameIndex + progress / 100) / FRAMES.length) * 100}%`,
            backgroundColor: currentFrame.accentColor 
          }}
        />
      </div>

      {/* 2. Ambient Motion Backdrop */}
      <div 
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[140px] opacity-25 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: currentFrame.accentColor }}
      />
      <div 
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-[140px] opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: currentFrame.accentColor }}
      />

      {/* 3. Main Frame Stage */}
      <div 
        ref={frameContainerRef}
        className="p-8 sm:p-12 lg:p-16 min-h-[440px] flex flex-col justify-between relative z-10"
      >
        {/* Header Tag & Metric */}
        <div className="flex flex-wrap items-center justify-between gap-4 hyper-anim">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono tracking-widest uppercase text-white/50">
              {currentFrame.tagline}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span 
              className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15"
              style={{ color: currentFrame.accentColor }}
            >
              {currentFrame.badge}
            </span>
          </div>

          {currentFrame.metric && (
            <div className="flex items-baseline gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl">
              <span className="font-headline font-black text-xl text-white">
                {currentFrame.metric.value}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {currentFrame.metric.label}
              </span>
            </div>
          )}
        </div>

        {/* Center Frame Hero Content */}
        <div className="my-8 max-w-3xl">
          <div className="flex items-center gap-3.5 mb-4 hyper-anim">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
              {currentFrame.icon}
            </div>
          </div>

          <h2 className="font-headline font-black text-2xl sm:text-4xl lg:text-5xl leading-tight sm:leading-tight text-white tracking-tight mb-4 hyper-anim text-balance">
            {currentFrame.headline}{" "}
            <span 
              className="underline decoration-wavy decoration-white/30"
              style={{ color: currentFrame.accentColor }}
            >
              {currentFrame.highlightText}
            </span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans max-w-2xl hyper-anim">
            {currentFrame.subtext}
          </p>
        </div>

        {/* Frame Timeline Scrubber Strip */}
        <div className="grid grid-cols-6 gap-2 pt-6 border-t border-white/10 hyper-anim">
          {FRAMES.map((f, idx) => (
            <button
              key={f.id}
              onClick={() => handleSelectFrame(idx)}
              className={`h-1.5 rounded-full cursor-pointer transition-all ${
                idx === currentFrameIndex
                  ? "bg-white shadow-sm ring-2 ring-white/40"
                  : idx < currentFrameIndex
                  ? "bg-white/40"
                  : "bg-white/10 hover:bg-white/20"
              }`}
              title={`Frame ${f.id}: ${f.badge}`}
            />
          ))}
        </div>
      </div>

      {/* 4. HyperFrames Interactive Floating Controller Bar */}
      <div className="bg-[#1C1B1A]/90 backdrop-blur-md px-6 py-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="tactile-btn p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title="Previous Frame"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="tactile-btn p-2 px-3 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-1.5 shadow-md"
            title={isPlaying ? "Pause Timeline" : "Play Timeline"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            className="tactile-btn p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title="Next Frame"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-mono text-zinc-400 ml-2">
            Frame {currentFrameIndex + 1} of {FRAMES.length}
          </span>
        </div>

        {/* HyperFrames Framework Badge & CTA */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400">
            <span>Powered by</span>
            <strong className="text-white">HyperFrames Engine</strong>
          </span>

          {onOrderClick && (
            <OpenDesignButton
              variant="accent"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={onOrderClick}
            >
              Order Smart Standee
            </OpenDesignButton>
          )}
        </div>
      </div>
    </div>
  );
}
