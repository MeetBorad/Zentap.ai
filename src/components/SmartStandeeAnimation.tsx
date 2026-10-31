"use client";

import React, { useState } from "react";
import { Play, RotateCcw, Smartphone, Zap } from "lucide-react";
import { OpenDesignButton } from "@/components/open-design";

interface SmartStandeeAnimationProps {
  className?: string;
}

export default function SmartStandeeAnimation({ className = "" }: SmartStandeeAnimationProps) {
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Complete self-contained HTML animation for the ZenTap Smart Standee
  const animationHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>ZenTap Smart NFC Standee</title>
<style>
:root{--bg:#0b0c10;--gold:#ff7a00;--star:#f5b800;--green:#14a02a;--blue:#1677d9;--ink:#fff;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
*{box-sizing:border-box;margin:0}
html,body{height:100%;background:var(--bg);font-family:"Segoe UI",system-ui,Arial,sans-serif;color:var(--ink);overflow:hidden}
body{display:flex;align-items:center;justify-content:center}
#stage{position:relative;aspect-ratio:9/16;height:100vh;max-height:100%;max-width:100vw;overflow:hidden;background:#0e1016;container-type:inline-size;cursor:pointer;border-radius:2cqw}
.scene{position:absolute;inset:0;opacity:0;transition:opacity .5s;pointer-events:none;background:repeating-linear-gradient(45deg,#14161d 0 3px,#10121a 3px 6px)}
.scene.on{opacity:1;pointer-events:auto}
.light{background:linear-gradient(#f4f4f6 55%,#fff 55%)}
.dark{background:#000}
.stand{position:absolute;left:50%;transform:translateX(-50%)}
.stand svg{width:100%;height:auto;display:block;filter:drop-shadow(0 4cqw 4cqw rgba(0,0,0,.45))}
.on .pop{animation:pop .9s cubic-bezier(.16, 1, .3, 1) both}
@keyframes pop{from{transform:translateX(-50%) scale(.6) rotateY(60deg);opacity:0}to{transform:translateX(-50%) scale(1) rotateY(0);opacity:1}}
.on .spin{animation:spin 3s ease-in-out both}
@keyframes spin{0%{transform:translateX(-50%) rotateY(-35deg) scale(.9)}50%{transform:translateX(-50%) rotateY(25deg) scale(1.05)}100%{transform:translateX(-50%) rotateY(0) scale(1)}}
.tag{position:absolute;left:50%;transform:translateX(-50%);font-weight:800;font-style:italic;white-space:nowrap;padding:.6cqw 3cqw;letter-spacing:.2cqw}
.t1{top:6cqw;font-size:5.2cqw;background:#fff;color:#000;transform:translateX(-50%) skewX(-12deg)}
.t2{top:15cqw;font-size:10cqw;background:var(--gold);color:#000;transform:translateX(-50%) skewX(-12deg)}
.on .slide{animation:slide .7s both}
@keyframes slide{from{opacity:0;margin-top:-6cqw}to{opacity:1;margin-top:0}}
.head{position:absolute;top:8cqw;left:50%;transform:translateX(-50%);background:#fff;color:#111;font-weight:800;font-size:6.2cqw;padding:2cqw 5cqw;border-radius:1.2cqw;white-space:nowrap}
.chips{position:absolute;top:24cqw;left:0;right:0;display:flex;justify-content:space-around;padding:0 6cqw}
.chip{background:var(--gold);color:#000;font-weight:700;font-size:4cqw;padding:1.2cqw 3.5cqw;border-radius:1cqw;opacity:0}
.on .chip{animation:fade .6s .5s both}.on .chip+.chip{animation-delay:1.1s}
@keyframes fade{from{opacity:0;transform:translateY(3cqw)}to{opacity:1;transform:none}}
.line{position:absolute;top:20cqw;left:50%;width:56cqw;height:5cqw;border:.5cqw solid #bbb;border-bottom:0;transform:translateX(-50%);border-radius:1cqw 1cqw 0 0;opacity:.8}
.ico{position:absolute;width:15cqw;height:15cqw;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:8cqw;color:#fff;opacity:0;box-shadow:0 2cqw 4cqw rgba(0,0,0,.4)}
.on .ico{animation:float 1s cubic-bezier(.16, 1, .3, 1) both}
@keyframes float{from{opacity:0;transform:translateY(25cqw) scale(.3)}to{opacity:1;transform:none}}
.cap{position:absolute;left:0;right:0;text-align:center;font-size:5cqw;font-weight:700;padding:0 6cqw}
.lab{position:absolute;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:1cqw;font-weight:800;font-size:7cqw;white-space:nowrap}
.lab b{padding:.5cqw 3cqw;background:var(--green);color:#fff}.lab i{font-style:normal;background:var(--blue);color:#fff;padding:.5cqw 3cqw;font-size:6.4cqw}
.phone{position:absolute;width:44cqw;height:84cqw;background:#101218;border:1.2cqw solid #22262f;border-radius:6cqw;overflow:hidden;box-shadow:0 4cqw 8cqw rgba(0,0,0,.5)}
.scr{position:absolute;inset:0;background:#fff;color:#111;text-align:center;padding:8cqw 3cqw 0}
.scr h4{font-size:3.6cqw;margin-bottom:1.5cqw}.scr p{font-size:2.5cqw;color:#666;margin-bottom:3cqw}
.stars{font-size:6cqw;color:#ddd;letter-spacing:.4cqw}.stars span{display:inline-block}
.on .stars span{animation:star .35s both}
@keyframes star{from{color:#ddd;transform:scale(.6)}to{color:var(--star);transform:scale(1)}}
.btn{margin:4cqw auto 0;background:var(--blue);color:#fff;font-size:2.8cqw;font-weight:700;padding:2cqw 3cqw;border-radius:6cqw;width:80%}
.btn.g{background:#111}
.draft{background:#f1f4f8;border-radius:2cqw;font-size:2.4cqw;text-align:left;padding:2cqw;margin-top:3cqw;color:#333}
.in-r{animation:inr 1.2s .2s cubic-bezier(.2,.9,.3,1) both}
@keyframes inr{from{transform:translateX(60cqw) rotate(12deg)}to{transform:none}}
.in-b{animation:inb 1.2s .2s cubic-bezier(.2,.9,.3,1) both}
@keyframes inb{from{transform:translateY(70cqw)}to{transform:none}}
.wave{position:absolute;border:.8cqw solid var(--gold);border-radius:50%;opacity:0}
.on .wave{animation:wave 1.4s 1.2s infinite}.on .wave:nth-of-type(2){animation-delay:1.6s}
@keyframes wave{0%{transform:scale(.3);opacity:.9}100%{transform:scale(2.2);opacity:0}}
.view{position:absolute;inset:0;background:#0a0c10;display:grid;place-items:center}
.view .qr2{width:60%;aspect-ratio:1;background:#fff;border-radius:2cqw;padding:2cqw}
.view .qr2 svg{width:100%;height:100%}
.scan{position:absolute;left:12%;right:12%;height:.7cqw;background:#27e06a;box-shadow:0 0 3cqw #27e06a;animation:scan 1.2s 1s ease-in-out infinite alternate;top:30%}
@keyframes scan{from{top:30%}to{top:62%}}
.feat{position:absolute;left:6cqw;right:6cqw;display:grid;grid-template-columns:1fr 1fr;gap:3cqw}
.f{display:flex;gap:2cqw;align-items:center;font-weight:800;font-size:3.6cqw;line-height:1.15;opacity:0}
.f u{flex:none;width:7cqw;height:7cqw;border-radius:50%;background:var(--green);display:grid;place-items:center;text-decoration:none;font-size:4.5cqw}
.on .f{animation:fade .5s both}.on .f:nth-child(2){animation-delay:.5s}.on .f:nth-child(3){animation-delay:1s}.on .f:nth-child(4){animation-delay:1.5s}
.logo{font-size:14cqw;font-weight:800;letter-spacing:-.3cqw}.logo em{color:var(--gold);font-style:normal}
.sub{font-size:4.2cqw;color:#bbb;margin-top:2cqw;text-align:center}
.cta{margin-top:8cqw;background:var(--gold);color:#000;font-weight:800;font-size:5.4cqw;padding:3cqw 9cqw;border-radius:2cqw;box-shadow:0 1cqw 0 #9a3a00;cursor:pointer}
.on .cta{animation:press 1s 1s infinite}
@keyframes press{50%{transform:translateY(1cqw);box-shadow:0 0 0 #9a3a00}}
.center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
#bar{position:absolute;left:0;bottom:0;height:1.2cqw;background:var(--gold);width:0;z-index:5}
#hint{position:absolute;top:2cqw;right:3cqw;z-index:6;font-size:2.8cqw;color:#fff;background:rgba(0,0,0,.6);padding:.6cqw 2cqw;border-radius:5cqw;opacity:.85}
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute"><defs>
<linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b2133"/><stop offset="1" stop-color="#0a0d16"/></linearGradient>
<linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb000"/><stop offset="1" stop-color="#ff5200"/></linearGradient>
<symbol id="st" viewBox="0 0 300 400">
<path d="M18 335 L282 335 L252 388 L48 388Z" fill="#12151e" stroke="#343a48" stroke-width="2"/>
<g fill="none" stroke="url(#gd)" stroke-width="5" stroke-linecap="round"><path d="M110 362 q-14-12 0-24"/><path d="M122 366 q-22-16 0-32"/><path d="M190 362 q14-12 0-24"/><path d="M178 366 q22-16 0-32"/></g>
<text x="150" y="368" text-anchor="middle" font-size="22" font-weight="800" fill="url(#gd)">NFC</text>
<rect x="48" y="18" width="204" height="322" rx="12" fill="url(#pg)" stroke="#39425a" stroke-width="2"/>
<text x="150" y="65" text-anchor="middle" fill="#fff" font-size="18" font-weight="900" letter-spacing="1">Zen<tspan fill="#ff7a00">Tap</tspan></text>
<rect x="92" y="86" width="116" height="116" rx="12" fill="url(#gd)"/>
<rect x="100" y="94" width="100" height="100" rx="6" fill="#fff"/>
<g id="qrg" transform="translate(104 98) scale(1)">
  <rect x="4" y="4" width="24" height="24" fill="#111" rx="3"/>
  <rect x="8" y="8" width="16" height="16" fill="#fff" rx="1"/>
  <rect x="11" y="11" width="10" height="10" fill="#111" rx="1"/>
  <rect x="64" y="4" width="24" height="24" fill="#111" rx="3"/>
  <rect x="68" y="8" width="16" height="16" fill="#fff" rx="1"/>
  <rect x="71" y="11" width="10" height="10" fill="#111" rx="1"/>
  <rect x="4" y="64" width="24" height="24" fill="#111" rx="3"/>
  <rect x="8" y="68" width="16" height="16" fill="#fff" rx="1"/>
  <rect x="11" y="71" width="10" height="10" fill="#111" rx="1"/>
  <circle cx="46" cy="46" r="8" fill="#ff7a00"/>
  <rect x="36" y="14" width="8" height="8" fill="#111"/>
  <rect x="48" y="14" width="8" height="8" fill="#111"/>
  <rect x="14" y="38" width="8" height="8" fill="#111"/>
  <rect x="70" y="38" width="8" height="8" fill="#111"/>
  <rect x="36" y="68" width="8" height="8" fill="#111"/>
  <rect x="68" y="68" width="8" height="8" fill="#111"/>
</g>
<text x="150" y="226" text-anchor="middle" fill="#fff" font-size="10" font-weight="800" letter-spacing="1">TAP OR SCAN TO REVIEW</text>
<circle cx="112" cy="248" r="9" fill="#4285f4"/><circle cx="138" cy="248" r="9" fill="#1877f2"/><circle cx="164" cy="248" r="9" fill="#e1306c"/><circle cx="190" cy="248" r="9" fill="#25d366"/>
<g fill="#fff" font-size="10" font-weight="800" text-anchor="middle"><text x="112" y="252">G</text><text x="138" y="252">f</text><text x="164" y="252">◎</text><text x="190" y="252">✆</text></g>
<text x="150" y="288" text-anchor="middle" fill="#f5b800" font-size="20">★★★★★</text>
<text x="150" y="312" text-anchor="middle" fill="#cfd5e3" font-size="7.5">YOUR REVIEWS ARE GREATLY APPRECIATED</text>
</symbol></defs></svg>

<div id="stage">
<span id="hint">tap to replay</span>

<!-- 0 Title -->
<section class="scene light on" id="s0">
<span class="tag t1 slide">Premium All-in-One Smart</span>
<span class="tag t2 slide" style="animation-delay:.3s">NFC STANDEE</span>
<div class="stand pop spin" style="width:78cqw;top:36cqw"><svg viewBox="0 0 300 400"><use href="#st"/></svg></div>
</section>

<!-- 1 Dual -->
<section class="scene" id="s1">
<div class="head slide">DUAL FUNCTIONALITY</div><div class="line slide" style="animation-delay:.3s"></div>
<div class="chips"><span class="chip">NFC Enabled</span><span class="chip">QR Enabled</span></div>
<div class="stand pop" style="width:70cqw;top:46cqw"><svg viewBox="0 0 300 400"><use href="#st"/></svg></div>
</section>

<!-- 2 Socials -->
<section class="scene" id="s2">
<div class="ico" style="left:22cqw;top:12cqw;background:#4285f4;animation-delay:.3s">G</div>
<div class="ico" style="left:42cqw;top:6cqw;background:#1877f2;animation-delay:.6s">f</div>
<div class="ico" style="left:62cqw;top:12cqw;background:linear-gradient(45deg,#f9a03f,#e1306c,#833ab4);animation-delay:.9s">◎</div>
<div class="ico" style="left:42cqw;top:26cqw;background:#25d366;animation-delay:1.2s">✆</div>
<div class="stand pop" style="width:66cqw;top:44cqw"><svg viewBox="0 0 300 400"><use href="#st"/></svg></div>
<div class="cap" style="bottom:7cqw;color:var(--gold)">Reviews · Social · WhatsApp — all in one stand</div>
</section>

<!-- 3 Tap -->
<section class="scene light" id="s3">
<div class="stand" style="width:70cqw;top:14cqw;left:34%"><svg viewBox="0 0 300 400"><use href="#st"/></svg></div>
<div class="phone in-r" style="right:6cqw;top:18cqw">
 <div class="scr"><h4>Rate your experience</h4><p>Loved it? Tell Google in 10 seconds</p>
 <div class="stars"><span style="animation-delay:1.6s">★</span><span style="animation-delay:1.8s">★</span><span style="animation-delay:2s">★</span><span style="animation-delay:2.2s">★</span><span style="animation-delay:2.4s">★</span></div>
 <div class="draft">“Great service and friendly staff — highly recommend!”<br><small>AI-drafted for you</small></div><div class="btn">Post on Google</div></div>
</div>
<div class="wave" style="left:46cqw;top:44cqw;width:16cqw;height:16cqw"></div><div class="wave" style="left:46cqw;top:44cqw;width:16cqw;height:16cqw"></div>
<div class="lab" style="bottom:9cqw"><b>JUST TAP</b><i>Your Phone</i></div>
</section>

<!-- 4 Scan -->
<section class="scene light" id="s4">
<div class="stand" style="width:60cqw;top:20cqw;left:30%"><svg viewBox="0 0 300 400"><use href="#st"/></svg></div>
<div class="phone in-b" style="right:8cqw;top:22cqw">
 <div class="view"><div class="qr2"><svg viewBox="0 0 100 100"><use href="#qrg" transform="scale(1)"/></svg></div><div class="scan"></div></div>
</div>
<div class="lab" style="top:6cqw"><b>OR SCAN</b><i>The QR</i></div>
</section>

<!-- 5 Features -->
<section class="scene" id="s5">
<div class="feat" style="top:8cqw">
<div class="f"><u>✓</u>ALL IN ONE<br>SOLUTION</div><div class="f"><u>✓</u>UNLIMITED<br>TAP / SCAN</div>
<div class="f"><u>✓</u>DYNAMIC<br>QR</div><div class="f"><u>✓</u>AI REVIEW<br>ASSISTANT</div></div>
<div class="stand pop" style="width:68cqw;top:44cqw"><svg viewBox="0 0 300 400"><use href="#st"/></svg></div>
</section>

<!-- 6 CTA -->
<section class="scene dark" id="s6">
<div class="center">
  <img src="/logo.png" alt="ZenTap" style="width:65cqw;max-width:85%;height:auto;object-fit:contain;margin-bottom:2cqw" />
  <div class="sub">Tap To Get Reviews<br>Boost your Google profile reach</div>
  <div class="cta">ORDER NOW</div>
</div>
</section>
<div id="bar"></div>
</div>

<script>
(function(){
  var dur = [3500, 3000, 3200, 3800, 3500, 3200, 4000];
  var total = dur.reduce(function(a,b){return a+b;}, 0);
  var cur = 0;
  var timer = null;
  var start = Date.now();
  var bar = document.getElementById('bar');
  var scenes = [];
  for(var i=0; i<7; i++){
    scenes.push(document.getElementById('s' + i));
  }

  function show(idx){
    scenes.forEach(function(s, i){
      if(s) s.classList.toggle('on', i === idx);
    });
  }

  function step(){
    show(cur);
    timer = setTimeout(function(){
      cur++;
      if(cur < dur.length){
        step();
      } else {
        setTimeout(replay, 1200);
      }
    }, dur[cur]);
  }

  function replay(){
    clearTimeout(timer);
    cur = 0;
    start = Date.now();
    step();
  }

  function tick(){
    var elapsed = (Date.now() - start) % (total + 1200);
    var p = Math.min(100, (elapsed / total) * 100);
    if(bar) bar.style.width = p + '%';
    requestAnimationFrame(tick);
  }

  document.getElementById('stage').addEventListener('click', replay);
  step();
  tick();
})();
</script>
</body>
</html>`;

  const handleRestart = () => {
    setIframeKey((prev) => prev + 1);
    setIsPlaying(true);
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Outer Phone Mockup Frame */}
      <div className="relative w-full max-w-[360px] sm:max-w-[380px] aspect-[9/16] rounded-[2.5rem] p-3 bg-gradient-to-b from-surface-container-highest via-surface-container-low to-surface-container border-4 border-surface-variant/40 shadow-2xl overflow-hidden ring-1 ring-white/10">
        
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black/80 rounded-full z-20 flex items-center justify-center pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-surface-variant/40 mr-2" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
        </div>

        {/* Live Animation Iframe Container */}
        <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-[#0b0c10] shadow-inner">
          <iframe
            key={iframeKey}
            srcDoc={animationHtml}
            title="ZenTap Smart Standee 9:16 Video Animation"
            className="w-full h-full border-0 select-none"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        {/* Interactive Controls Overlay at Bottom */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 shadow-lg text-[11px] text-white">
          <button
            onClick={handleRestart}
            className="flex items-center gap-1.5 hover:text-secondary transition-colors cursor-pointer"
            title="Restart Animation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="font-semibold">Replay</span>
          </button>
          <span className="text-white/30">•</span>
          <span className="flex items-center gap-1 text-[10px] text-secondary font-medium">
            <Zap className="w-3 h-3" />
            Live Hardware Demo
          </span>
        </div>
      </div>

      {/* Caption badge */}
      <div className="mt-4 flex items-center gap-2 text-xs text-on-surface-variant font-medium">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary/15 text-secondary text-[11px] font-bold">
          7-Scene Walkthrough
        </span>
        <span>Tap stage or click Replay anytime</span>
      </div>
    </div>
  );
}
