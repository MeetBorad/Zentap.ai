// src/components/admin/QrNfcDirectoryTab.tsx
"use client";

import React, { useState } from "react";
import QRCode from "qrcode";
import { 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Radio, 
  Search, 
  Filter, 
  Tag, 
  Building2,
  FileCheck
} from "lucide-react";
import { BusinessRecord, TagRecord } from "@/lib/businessStore";

interface QrNfcDirectoryTabProps {
  businesses: BusinessRecord[];
  tags: TagRecord[];
  showToast: (msg: string) => void;
}

export default function QrNfcDirectoryTab({
  businesses,
  tags,
  showToast,
}: QrNfcDirectoryTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://zentapdigitalsolutions.com";

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast("✓ Copied link to clipboard!");
  };

  const handleDownloadQr = async (url: string, filename: string) => {
    try {
      const pngData = await QRCode.toDataURL(url, {
        width: 1200,
        margin: 2,
        errorCorrectionLevel: "Q",
      });
      const link = document.createElement("a");
      link.href = pngData;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`✓ Downloaded 1200px QR for ${filename}!`);
    } catch (err) {
      console.warn("Download QR error:", err);
    }
  };

  const filteredBiz = businesses.filter((b) => {
    if (b.is_deleted) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      b.name.toLowerCase().includes(q) ||
      b.slug.toLowerCase().includes(q) ||
      (b.city && b.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-headline font-bold text-zinc-900">
            QR &amp; NFC Hardware Manifests
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Permanent physical redirect URLs, NFC chip write strings, and high-resolution QR assets per business.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by business name or slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-xs"
        />
      </div>

      {/* Business Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBiz.map((b) => {
          const bizTags = tags.filter((t) => t.business_id === b.id);
          const reviewUrl = `${originUrl}/r/${b.slug}`;
          const nfcUrl = `${originUrl}/r/${b.slug}?s=nfc`;
          const qrUrl = `${originUrl}/r/${b.slug}?s=qr`;

          return (
            <div
              key={b.id}
              className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-zinc-100">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-zinc-900 truncate max-w-[200px]" title={b.name}>
                      {b.name}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400">
                      /r/{b.slug}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                    {bizTags.length} Card(s)
                  </span>
                </div>

                {/* Permanent Links */}
                <div className="space-y-2 pt-3 text-xs">
                  {/* Standee Review Link */}
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-500 font-bold">
                      <span>Customer Review URL</span>
                      <button
                        onClick={() => handleCopyLink(reviewUrl, `${b.id}-rev`)}
                        className="text-zinc-700 hover:text-black flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === `${b.id}-rev` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === `${b.id}-rev` ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="font-mono text-[11px] text-zinc-800 truncate" title={reviewUrl}>
                      {reviewUrl}
                    </p>
                  </div>

                  {/* NFC Write Link */}
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-500 font-bold">
                      <span>NFC Tools Write URL</span>
                      <button
                        onClick={() => handleCopyLink(nfcUrl, `${b.id}-nfc`)}
                        className="text-zinc-700 hover:text-black flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === `${b.id}-nfc` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === `${b.id}-nfc` ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="font-mono text-[11px] text-zinc-800 truncate" title={nfcUrl}>
                      {nfcUrl}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions: Download QR & Preview */}
              <div className="pt-2 flex items-center gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => handleDownloadQr(qrUrl, `${b.slug}-qr`)}
                  className="tactile-btn flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Download QR</span>
                </button>

                <a
                  href={`${reviewUrl}?preview=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                  title="Open live page"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
