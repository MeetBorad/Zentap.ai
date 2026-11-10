// components/modals/OwnerAccessModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  X,
  ExternalLink,
  Clock,
  RotateCcw,
  Sliders,
  ChevronDown,
  Building2,
  Phone,
  Instagram,
  QrCode,
  MapPin,
  Globe,
  Facebook,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Save,
  Twitter,
  CreditCard,
  Navigation,
  Mail
} from "lucide-react";
import {
  getOwnerFieldPermissions,
  getCustomFieldDefinitions,
  CustomFieldDefinition,
} from "@/lib/adminPlatformStore";

interface OwnerAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tagCode: string; // standee/card code (e.g. zt-0004, st3, or business slug)
  businessSlug?: string;
  clientBusinessId?: string;
  initialBusinessName?: string;
  onDetailsUpdated?: (updated: any) => void;
}

export default function OwnerAccessModal({
  isOpen,
  onClose,
  tagCode,
  businessSlug,
  clientBusinessId,
  initialBusinessName,
  onDetailsUpdated,
}: OwnerAccessModalProps) {
  // Resolve default login ID (e.g. "ZT-0004")
  const computeDefaultId = () => {
    if (clientBusinessId && clientBusinessId.toUpperCase().startsWith("ZT-")) {
      return clientBusinessId.toUpperCase();
    }
    const raw = (businessSlug || tagCode || "ZT-0004").toLowerCase().trim();
    if (raw === "st3" || raw === "zentap") return "ZT-0004";
    return (clientBusinessId || tagCode || businessSlug || "ZT-0004").toUpperCase();
  };

  // Authentication State
  const [loginId, setLoginId] = useState(computeDefaultId);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Authenticated Session State (15-Minute Expiry)
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(15 * 60);

  // Owner Panel Editable Fields
  const [cardData, setCardData] = useState<any>(null);
  const [bizData, setBizData] = useState<any>(null);
  const [scanStats, setScanStats] = useState<{ totalScans: number; nfcScans: number; qrScans: number; reviewClicks: number }>({
    totalScans: 0,
    nfcScans: 0,
    qrScans: 0,
    reviewClicks: 0,
  });

  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editOwnerName, setEditOwnerName] = useState("");
  const [editOwnerPhone, setEditOwnerPhone] = useState("");
  const [editContactPhone, setEditContactPhone] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editWhatsappMsg, setEditWhatsappMsg] = useState("");
  const [editReviewUrl, setEditReviewUrl] = useState("");
  const [editGoogleBusinessPage, setEditGoogleBusinessPage] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editFacebook, setEditFacebook] = useState("");
  const [editTwitter, setEditTwitter] = useState("");
  const [editUpiId, setEditUpiId] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editArea, setEditArea] = useState("");
  const [editServices, setEditServices] = useState("");
  const [editKeywords, setEditKeywords] = useState("");
  const [autoFilling, setAutoFilling] = useState(false);
  const [autoFillMsg, setAutoFillMsg] = useState("");
  const [editDirections, setEditDirections] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Field Permissions & Custom Fields
  const [ownerPerms, setOwnerPerms] = useState<Record<string, boolean>>({});
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomFieldDefinition[]>([]);
  const [ownerCustomFields, setOwnerCustomFields] = useState<Record<string, string>>({});

  useEffect(() => {
    setOwnerPerms(getOwnerFieldPermissions());
    setCustomFieldDefs(getCustomFieldDefinitions());

    const handlePermsUpdate = (e: Event) => {
      const customEv = e as CustomEvent<Record<string, boolean>>;
      if (customEv.detail) {
        setOwnerPerms(customEv.detail);
      } else {
        setOwnerPerms(getOwnerFieldPermissions());
      }
    };

    const handleCustomFieldsUpdate = (e: Event) => {
      const customEv = e as CustomEvent<CustomFieldDefinition[]>;
      if (customEv.detail) {
        setCustomFieldDefs(customEv.detail);
      } else {
        setCustomFieldDefs(getCustomFieldDefinitions());
      }
    };

    window.addEventListener("zentap_owner_field_permissions_updated", handlePermsUpdate);
    window.addEventListener("zentap_custom_fields_updated", handleCustomFieldsUpdate);
    return () => {
      window.removeEventListener("zentap_owner_field_permissions_updated", handlePermsUpdate);
      window.removeEventListener("zentap_custom_fields_updated", handleCustomFieldsUpdate);
    };
  }, []);

  const isPermitted = (fieldId: string) => {
    if (ownerPerms[fieldId] !== undefined) {
      return ownerPerms[fieldId] === true;
    }
    return true; // Default standard fields to true
  };

  // Sync default code whenever tagCode, businessSlug, or clientBusinessId changes
  useEffect(() => {
    setLoginId(computeDefaultId());
  }, [tagCode, businessSlug, clientBusinessId]);

  // Check existing session from sessionStorage on mount / open
  useEffect(() => {
    if (isOpen) {
      const codeKey = (tagCode || businessSlug || "zt-0004").toLowerCase().trim();
      const storageKey = `zentap_owner_session_${codeKey}`;
      try {
        const cached = sessionStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
            setSessionToken(parsed.token);
            setSessionExpiresAt(parsed.expiresAt);
            setRemainingSeconds(Math.max(0, Math.floor((parsed.expiresAt - Date.now()) / 1000)));
            if (parsed.tag) setCardData(parsed.tag);
            if (parsed.business) {
              setBizData(parsed.business);
              populateFields(parsed.business);
            }
            if (parsed.stats) setScanStats(parsed.stats);

            // Re-validate and fetch fresh client table data in background to populate exact current fields from clients table
            fetch(`/api/card/verify?code=${encodeURIComponent(loginId || codeKey)}&token=${encodeURIComponent(parsed.token)}`)
              .then((res) => res.json())
              .then((fresh) => {
                if (fresh?.success && fresh?.business) {
                  setBizData(fresh.business);
                  populateFields(fresh.business);
                  if (fresh.stats) setScanStats(fresh.stats);
                }
              })
              .catch((err) => console.warn("Background client refresh notice:", err));
          } else {
            sessionStorage.removeItem(storageKey);
          }
        }
      } catch (err) {
        console.warn("Session parse notice:", err);
      }
    }
  }, [isOpen, tagCode, businessSlug]);

  const populateFields = (b: any) => {
    setEditName(b.name || initialBusinessName || "");
    setEditCity(b.city || "Ahmedabad");
    setEditOwnerName(b.owner_name || "");
    setEditOwnerPhone(b.owner_phone || b.phone || "");
    setEditContactPhone(b.contact_phone || b.phone || "");
    setEditPhone(b.phone || b.contact_phone || b.owner_phone || "");
    setEditEmail(b.owner_email || b.email || "");
    setEditWhatsapp(b.whatsapp_number || b.whatsapp || "");
    setEditWhatsappMsg(b.whatsapp_message || "Hello, I am reaching out regarding your business services.");
    setEditReviewUrl(b.google_review_link || b.review_url || "");
    setEditGoogleBusinessPage(b.google_business_page || b.gbp_link || "");
    setEditInstagram(b.instagram_url || b.instagram_handle || b.instagram || "");
    setEditFacebook(b.facebook_url || b.facebook_link || b.facebook || "");
    setEditTwitter(b.twitter_link || b.twitter || "");
    setEditUpiId(b.upi_id || b.upi || "");
    setEditWebsite(b.website_url || b.website || "");
    setEditCategory(b.category || "");
    const custom = b.custom_fields || {};
    setEditArea(custom.area || b.area || b.city || "");
    const rawServices = custom.services ?? b.services;
    setEditServices(
      Array.isArray(rawServices)
        ? rawServices.join(", ")
        : typeof rawServices === "string"
        ? rawServices
        : ""
    );
    const rawKeywords = custom.keywords ?? b.keywords;
    setEditKeywords(
      Array.isArray(rawKeywords)
        ? rawKeywords.join(", ")
        : typeof rawKeywords === "string"
        ? rawKeywords
        : ""
    );
    setEditDirections(b.directions_link || b.directions || b.address || "");
    setEditAddress(b.address || b.directions_link || b.directions || "");
    setOwnerCustomFields(custom);
  };

  // 15-Minute Countdown Timer
  useEffect(() => {
    if (!sessionExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((sessionExpiresAt - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        handleLockAndExit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionExpiresAt]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Submit Login credentials for verification
  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) {
      setErrorMsg("Please enter both Login ID and Password");
      return;
    }

    setVerifying(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/card/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: loginId.trim(),
          password: password.trim(),
          pin: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Login ID or Password is incorrect");
        return;
      }

      // Success: Save 15-min session
      setSessionToken(data.token);
      setSessionExpiresAt(data.expiresAt);
      setRemainingSeconds(Math.max(0, Math.floor((data.expiresAt - Date.now()) / 1000)));
      setCardData(data.tag);
      setBizData(data.business);
      if (data.stats) setScanStats(data.stats);

      if (data.business) {
        populateFields(data.business);
      }

      // Cache session for 15 mins
      try {
        const codeKey = (tagCode || businessSlug || loginId).toLowerCase().trim();
        const storageKey = `zentap_owner_session_${codeKey}`;
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            token: data.token,
            expiresAt: data.expiresAt,
            tag: data.tag,
            business: data.business,
            stats: data.stats,
          })
        );
      } catch (err) {
        console.warn("sessionStorage save error:", err);
      }
    } catch (err) {
      console.warn("handleVerifyLogin error:", err);
      setErrorMsg("Connection error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // Auto-fill business details from website
  const handleAutoFillFromWebsite = async () => {
    if (!editWebsite.trim()) {
      setErrorMsg("Please enter a Website URL first to auto-fill details.");
      return;
    }
    setAutoFilling(true);
    setErrorMsg("");
    setAutoFillMsg("");
    try {
      const res = await fetch("/api/business/auto-fill-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: editWebsite.trim(),
          businessName: editName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Could not extract details from website. Please enter manually.");
        return;
      }
      const ext = data.extracted || {};
      if (ext.businessName && (!editName || editName.includes("ABC"))) {
        setEditName(ext.businessName);
      }
      if (ext.category && (!editCategory || editCategory === "Service")) {
        setEditCategory(ext.category);
      }
      if (ext.area) {
        setEditArea(ext.area);
      }
      if (Array.isArray(ext.services) && ext.services.length > 0) {
        setEditServices(ext.services.join(", "));
      }
      if (Array.isArray(ext.keywords) && ext.keywords.length > 0) {
        setEditKeywords(ext.keywords.join(", "));
      }
      setAutoFillMsg("✓ Details extracted from website! Review and save below.");
    } catch (err: any) {
      setErrorMsg("Website extraction failed: " + (err.message || "Network error"));
    } finally {
      setAutoFilling(false);
    }
  };

  // Save updated details
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) return;

    setSaving(true);
    setErrorMsg("");
    setSaveSuccess(false);

    try {
      const activeOwnerPhone = (editOwnerPhone || editPhone).trim();
      const activeContactPhone = (editContactPhone || editPhone).trim();
      const activePhone = (editContactPhone || editOwnerPhone || editPhone).trim();
      const activeDirections = (editDirections || editAddress).trim();

      const payloadUpdates = {
        name: isPermitted("business_name") ? editName.trim() : bizData?.name || editName.trim(),
        city: isPermitted("city") ? editCity.trim() : bizData?.city || editCity.trim(),
        area: isPermitted("area") ? editArea.trim() : bizData?.area || editArea.trim(),
        services: isPermitted("services") ? editServices.trim() : bizData?.services || editServices.trim(),
        keywords: isPermitted("keywords") ? editKeywords.trim() : bizData?.keywords || editKeywords.trim(),
        owner_name: isPermitted("owner_name") ? editOwnerName.trim() : bizData?.owner_name || editOwnerName.trim(),
        owner_phone: isPermitted("owner_phone") ? activeOwnerPhone : bizData?.owner_phone || activeOwnerPhone,
        contact_phone: isPermitted("contact_phone") ? activeContactPhone : bizData?.contact_phone || activeContactPhone,
        phone: activePhone,
        owner_email: isPermitted("owner_email") ? editEmail.trim() : bizData?.owner_email || editEmail.trim(),
        email: isPermitted("owner_email") ? editEmail.trim() : bizData?.email || editEmail.trim(),
        whatsapp_number: isPermitted("whatsapp") ? editWhatsapp.trim() : bizData?.whatsapp_number || editWhatsapp.trim(),
        whatsapp_message: editWhatsappMsg.trim(),
        google_review_link: isPermitted("google_review_link") ? editReviewUrl.trim() : bizData?.google_review_link || editReviewUrl.trim(),
        review_url: isPermitted("google_review_link") ? editReviewUrl.trim() : bizData?.review_url || editReviewUrl.trim(),
        google_business_page: isPermitted("google_business_page") ? editGoogleBusinessPage.trim() : bizData?.google_business_page || editGoogleBusinessPage.trim(),
        instagram_handle: isPermitted("instagram_link") ? editInstagram.trim() : bizData?.instagram_handle || editInstagram.trim(),
        instagram_url: isPermitted("instagram_link") ? editInstagram.trim() : bizData?.instagram_url || editInstagram.trim(),
        facebook_link: isPermitted("facebook_link") ? editFacebook.trim() : bizData?.facebook_link || editFacebook.trim(),
        facebook_url: isPermitted("facebook_link") ? editFacebook.trim() : bizData?.facebook_url || editFacebook.trim(),
        twitter: isPermitted("twitter_link") ? editTwitter.trim() : bizData?.twitter || editTwitter.trim(),
        twitter_link: isPermitted("twitter_link") ? editTwitter.trim() : bizData?.twitter_link || editTwitter.trim(),
        upi_id: isPermitted("upi_id") ? editUpiId.trim() : bizData?.upi_id || editUpiId.trim(),
        website: isPermitted("website_url") ? editWebsite.trim() : bizData?.website || editWebsite.trim(),
        website_url: isPermitted("website_url") ? editWebsite.trim() : bizData?.website_url || editWebsite.trim(),
        category: isPermitted("category") ? editCategory.trim() : bizData?.category || editCategory.trim(),
        directions: isPermitted("directions_link") ? activeDirections : bizData?.directions || activeDirections,
        directions_link: isPermitted("directions_link") ? activeDirections : bizData?.directions_link || activeDirections,
        address: isPermitted("directions_link") ? activeDirections : bizData?.address || activeDirections,
        custom_fields: {
          ...(bizData?.custom_fields || {}),
          ...ownerCustomFields,
        },
      };

      const res = await fetch("/api/card/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken,
          code: loginId || tagCode || businessSlug,
          updates: payloadUpdates,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to update details");
        return;
      }

      const updatedPayload = {
        ...payloadUpdates,
        id: data.business?.id || clientBusinessId || loginId || "ZT-0004",
      };

      setSaveSuccess(true);
      setBizData((prev: any) => ({ ...(prev || {}), ...updatedPayload }));

      // Update cached session in sessionStorage
      try {
        const codeKey = (tagCode || businessSlug || loginId).toLowerCase().trim();
        const storageKey = `zentap_owner_session_${codeKey}`;
        const existingRaw = sessionStorage.getItem(storageKey);
        if (existingRaw) {
          const parsed = JSON.parse(existingRaw);
          sessionStorage.setItem(
            storageKey,
            JSON.stringify({
              ...parsed,
              business: {
                ...(parsed.business || {}),
                ...updatedPayload,
              },
            })
          );
        }
      } catch (err) {
        console.warn("sessionStorage update notice:", err);
      }

      // Sync client-side caches and stores so changes populate instantly like page editor
      try {
        const cTargetBid = data.business?.id || clientBusinessId || loginId || "ZT-0004";

        // A. Sync to localStorage zentap_platform_clients
        const rawClients = localStorage.getItem("zentap_platform_clients");
        if (rawClients) {
          const parsedClients = JSON.parse(rawClients);
          if (Array.isArray(parsedClients)) {
            const idx = parsedClients.findIndex((c: any) =>
              (c.business_id || "").toLowerCase() === cTargetBid.toLowerCase() ||
              (c.id || "").toLowerCase() === cTargetBid.toLowerCase()
            );
            if (idx !== -1) {
              parsedClients[idx] = {
                ...parsedClients[idx],
                business_name: editName.trim(),
                city: editCity.trim(),
                owner_name: editOwnerName.trim(),
                owner_phone: activeOwnerPhone,
                contact_phone: activeContactPhone,
                owner_email: editEmail.trim(),
                whatsapp: editWhatsapp.trim(),
                google_review_link: editReviewUrl.trim(),
                google_business_page: editGoogleBusinessPage.trim(),
                instagram_link: editInstagram.trim(),
                facebook_link: editFacebook.trim(),
                twitter_link: editTwitter.trim(),
                upi_id: editUpiId.trim(),
                website_url: editWebsite.trim(),
                website: editWebsite.trim(),
                directions_link: activeDirections,
                custom_fields: {
                  ...(parsedClients[idx].custom_fields || {}),
                  contact_phone: activeContactPhone,
                  google_business_page: editGoogleBusinessPage.trim(),
                  twitter_link: editTwitter.trim(),
                  upi_id: editUpiId.trim(),
                  website: editWebsite.trim(),
                  website_url: editWebsite.trim(),
                  directions: activeDirections,
                  directions_link: activeDirections,
                  address: activeDirections,
                  category: editCategory.trim(),
                  subtitle: editCategory.trim(),
                },
              };
              localStorage.setItem("zentap_platform_clients", JSON.stringify(parsedClients));
            }
          }
        }

        // B. Sync to localStorage zentap_platform_page_editor_configs
        const rawConfigs = localStorage.getItem("zentap_platform_page_editor_configs");
        const activeTag = (tagCode || businessSlug || "st3").toLowerCase();
        if (rawConfigs) {
          const parsedConfigs = JSON.parse(rawConfigs);
          if (Array.isArray(parsedConfigs)) {
            const peIdx = parsedConfigs.findIndex((p: any) =>
              (p.tag_id || "").toLowerCase() === activeTag ||
              (p.business_id || "").toLowerCase() === cTargetBid.toLowerCase()
            );
            if (peIdx !== -1) {
              const existingCfg = parsedConfigs[peIdx].config_data || {};
              parsedConfigs[peIdx] = {
                ...parsedConfigs[peIdx],
                business_name: editName.trim(),
                setup_status: "completed",
                config_data: {
                  ...existingCfg,
                  title: editName.trim(),
                  city: editCity.trim(),
                  subtitle: editCategory.trim(),
                  category: editCategory.trim(),
                  owner_name: editOwnerName.trim(),
                  owner_phone: activeOwnerPhone,
                  contact_phone: activeContactPhone,
                  phone: activePhone,
                  whatsapp: editWhatsapp.trim(),
                  google_link: editReviewUrl.trim(),
                  google_business_page: editGoogleBusinessPage.trim(),
                  instagram: editInstagram.trim(),
                  facebook: editFacebook.trim(),
                  twitter: editTwitter.trim(),
                  upi_id: editUpiId.trim(),
                  website: editWebsite.trim(),
                  directions_link: activeDirections,
                  address: activeDirections,
                },
              };
              localStorage.setItem("zentap_platform_page_editor_configs", JSON.stringify(parsedConfigs));
            }
          }
        }

        // C. Dispatch real-time events for live page updates across any active components
        window.dispatchEvent(new CustomEvent("zentap_client_updated", { detail: updatedPayload }));
        window.dispatchEvent(new CustomEvent("zentap_page_editor_updated", { detail: updatedPayload }));
        window.dispatchEvent(new Event("storage"));
      } catch (e) {
        console.warn("Client stores synchronization notice:", e);
      }

      if (onDetailsUpdated) {
        onDetailsUpdated(updatedPayload);
      }

      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.warn("handleSaveDetails error:", err);
      setErrorMsg("Failed to update details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLockAndExit = () => {
    const codeKey = (tagCode || businessSlug || loginId).toLowerCase().trim();
    const storageKey = `zentap_owner_session_${codeKey}`;
    try {
      sessionStorage.removeItem(storageKey);
    } catch { }
    setSessionToken(null);
    setSessionExpiresAt(null);
    setPassword("");
    setErrorMsg("");
    setSaveSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#121622] text-white border border-white/10 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {sessionToken ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {sessionToken ? "Business Owner Panel" : "Business Owner Access"}
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Item: {loginId || "ZT-0004"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sessionToken && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                <Clock className="w-3 h-3" />
                <span>{formatTimer(remainingSeconds)}</span>
              </span>
            )}
            <button
              onClick={handleLockAndExit}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: LOGIN AUTHENTICATION (LOGIN ID + PASSWORD)                         */}
        {/* ========================================================================= */}
        {!sessionToken ? (
          <form onSubmit={handleVerifyLogin} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300 space-y-1">
              <p className="font-semibold text-white">Owner Security Check</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Enter your unique Login ID and password to manage this physical standee or card. Unlocks a private 15-minute management session.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-in shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login ID Input */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Login ID *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. ZT-0004"
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono tracking-wider focus:outline-none focus:border-amber-400"
                />
              </div>
              <span className="text-[10px] text-gray-500 mt-1 block">
                Pre-filled with your physical card / standee code.
              </span>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoFocus
                  placeholder="Enter your owner password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white tracking-wider focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1.5">
                <span>5 wrong attempts locks card for 30 minutes.</span>
                <a
                  href={`https://wa.me/919274560880?text=${encodeURIComponent(
                    `Hi ZenTap Super Admin, I need the password for my Business: ${initialBusinessName || ""}, ID: ${loginId}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 hover:underline inline-flex items-center gap-0.5 font-bold"
                >
                  <span>Forgot Password?</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={verifying}
                className="tactile-btn flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#ff7a00] hover:brightness-110 text-black text-xs font-bold cursor-pointer shadow-lg transition-transform active:scale-[0.978] disabled:opacity-50"
              >
                {verifying ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-black" />
                    <span>Log In &amp; Manage Business</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: 15-MINUTE SCOPED OWNER MANAGEMENT PANEL                           */
          /* ========================================================================= */
          <div className="space-y-4 animate-in fade-in duration-200">

            {/* Live Telemetry Card */}
            <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
              <div>
                <span className="block text-[9.5px] text-gray-400 uppercase font-mono">Total Scans</span>
                <span className="font-mono text-sm sm:text-base font-bold text-amber-400">
                  {scanStats.totalScans}
                </span>
              </div>
              <div className="border-l border-white/10">
                <span className="block text-[9.5px] text-gray-400 uppercase font-mono">NFC Taps</span>
                <span className="font-mono text-sm sm:text-base font-bold text-sky-400">
                  {scanStats.nfcScans}
                </span>
              </div>
              <div className="border-l border-white/10">
                <span className="block text-[9.5px] text-gray-400 uppercase font-mono">QR Scans</span>
                <span className="font-mono text-sm sm:text-base font-bold text-purple-400">
                  {scanStats.qrScans}
                </span>
              </div>
              <div className="border-l border-white/10">
                <span className="block text-[9.5px] text-gray-400 uppercase font-mono">Reviews</span>
                <span className="font-mono text-sm sm:text-base font-bold text-emerald-400">
                  {scanStats.reviewClicks}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>✓ Business details saved successfully! Your live page is updated.</span>
              </div>
            )}

            {/* Form: Update Details */}
            <form onSubmit={handleSaveDetails} className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Edit Business Details
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  Changes go live immediately
                </span>
              </div>

              {/* 1. Business Name */}
              {isPermitted("business_name") && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Business Name *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Zentap Digital Solutions"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* 2. City & Category */}
              {(isPermitted("city") || isPermitted("category")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {isPermitted("city") && (
                    <div className={!isPermitted("category") ? "sm:col-span-2" : ""}>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">
                        City / Location
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                        <input
                          type="text"
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          placeholder="e.g. Ahmedabad"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}

                  {isPermitted("category") && (
                    <div className={!isPermitted("city") ? "sm:col-span-2" : ""}>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">
                        Category / Subtitle
                      </label>
                      <input
                        type="text"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        placeholder="e.g. Service • Digital Agency"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 3. Owner Name & Owner Phone */}
              {(isPermitted("owner_name") || isPermitted("owner_phone")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {isPermitted("owner_name") && (
                    <div className={!isPermitted("owner_phone") ? "sm:col-span-2" : ""}>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">
                        Owner Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={editOwnerName}
                          onChange={(e) => setEditOwnerName(e.target.value)}
                          placeholder="e.g. Meet Borad"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}

                  {isPermitted("owner_phone") && (
                    <div className={!isPermitted("owner_name") ? "sm:col-span-2" : ""}>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">
                        Owner Phone
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                        <input
                          type="tel"
                          value={editOwnerPhone}
                          onChange={(e) => setEditOwnerPhone(e.target.value)}
                          placeholder="+91 92745 60880"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Contact Phone & Owner Email */}
              {(isPermitted("contact_phone") || isPermitted("owner_email")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {isPermitted("contact_phone") && (
                    <div className={!isPermitted("owner_email") ? "sm:col-span-2" : ""}>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">
                        Contact Phone
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
                        <input
                          type="tel"
                          value={editContactPhone}
                          onChange={(e) => setEditContactPhone(e.target.value)}
                          placeholder="+91 96627 60880"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}

                  {isPermitted("owner_email") && (
                    <div className={!isPermitted("contact_phone") ? "sm:col-span-2" : ""}>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">
                        Owner Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="e.g. contact@zentapdigitalsolutions.com"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 5. Google Review Link & Google Business Page */}
              {(isPermitted("google_review_link") || isPermitted("google_business_page")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {isPermitted("google_review_link") && (
                    <div className={!isPermitted("google_business_page") ? "sm:col-span-2" : ""}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-gray-300">
                          Google Review Link
                        </label>
                        {editReviewUrl && (
                          <a
                            href={editReviewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-amber-400 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Test link</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://g.page/r/.../review"
                        value={editReviewUrl}
                        onChange={(e) => setEditReviewUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}

                  {isPermitted("google_business_page") && (
                    <div className={!isPermitted("google_review_link") ? "sm:col-span-2" : ""}>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">
                        Google Business Page
                      </label>
                      <input
                        type="url"
                        placeholder="https://maps.app.goo.gl/... or business profile"
                        value={editGoogleBusinessPage}
                        onChange={(e) => setEditGoogleBusinessPage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 6. WhatsApp Number & Instagram */}
              {(isPermitted("whatsapp") || isPermitted("instagram_link")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {isPermitted("whatsapp") && (
                    <div className={!isPermitted("instagram_link") ? "sm:col-span-2" : ""}>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">
                        WhatsApp Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                        <input
                          type="text"
                          placeholder="+91 92745 60880"
                          value={editWhatsapp}
                          onChange={(e) => setEditWhatsapp(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}

                  {isPermitted("instagram_link") && (
                    <div className={!isPermitted("whatsapp") ? "sm:col-span-2" : ""}>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">
                        Instagram Link / Handle
                      </label>
                      <div className="relative">
                        <Instagram className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" />
                        <input
                          type="text"
                          placeholder="https://instagram.com/..."
                          value={editInstagram}
                          onChange={(e) => setEditInstagram(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 7. Facebook & Website */}
              {(isPermitted("facebook_link") || isPermitted("website_url")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {isPermitted("facebook_link") && (
                    <div className={!isPermitted("website_url") ? "sm:col-span-2" : ""}>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">
                        Facebook Page URL
                      </label>
                      <div className="relative">
                        <Facebook className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                        <input
                          type="url"
                          placeholder="https://facebook.com/..."
                          value={editFacebook}
                          onChange={(e) => setEditFacebook(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}

                  {isPermitted("website_url") && (
                    <div className={!isPermitted("facebook_link") ? "sm:col-span-2" : ""}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-gray-300">
                          Website / Portfolio URL
                        </label>
                        <button
                          type="button"
                          onClick={handleAutoFillFromWebsite}
                          disabled={autoFilling || !editWebsite.trim()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-[10px] text-amber-300 hover:bg-amber-500/30 font-semibold cursor-pointer disabled:opacity-40 transition-colors"
                          title="Extract business info, services & keywords from website"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                          <span>{autoFilling ? "Extracting..." : "Auto-fill from website"}</span>
                        </button>
                      </div>
                      <div className="relative">
                        <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
                        <input
                          type="url"
                          placeholder="https://yourwebsite.com"
                          value={editWebsite}
                          onChange={(e) => setEditWebsite(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {autoFillMsg && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2 animate-in fade-in">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                  <span>{autoFillMsg}</span>
                </div>
              )}

              {/* 8. Business Info for Reviews (Context, Services, Area, Keywords) */}
              {(isPermitted("area") || isPermitted("services") || isPermitted("keywords")) && (
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-amber-500/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Business Info (Review Context)
                      </span>
                    </div>
                    {isPermitted("website_url") && (
                      <button
                        type="button"
                        onClick={handleAutoFillFromWebsite}
                        disabled={autoFilling || !editWebsite.trim()}
                        className="inline-flex items-center gap-1 text-[10px] text-gray-400 hover:text-amber-300 transition-colors cursor-pointer disabled:opacity-40"
                        title="Re-fetch and refresh business info from website"
                      >
                        <RotateCcw className={`w-2.5 h-2.5 ${autoFilling ? "animate-spin" : ""}`} />
                        <span>Refresh business info</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10.5px] text-gray-400 leading-relaxed">
                    Used by the Smart Review Assistant for exact name spelling, service naming, and local context. Owner values always override fetched data.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {isPermitted("area") && (
                      <div className={!isPermitted("services") ? "sm:col-span-2" : ""}>
                        <label className="block text-[11px] font-bold text-gray-300 mb-1">
                          Area / Locality
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sindhu Bhavan Road, Bodakdev"
                          value={editArea}
                          onChange={(e) => setEditArea(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}

                    {isPermitted("services") && (
                      <div className={!isPermitted("area") ? "sm:col-span-2" : ""}>
                        <label className="block text-[11px] font-bold text-gray-300 mb-1">
                          Services / Products List
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Smart NFC Standee, Google Review Card, Tap Card"
                          value={editServices}
                          onChange={(e) => setEditServices(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}
                  </div>

                  {isPermitted("keywords") && (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">
                        3–5 Focus Keywords
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. NFC Standee, Tap Review, Smart Business Card, Fast Setup"
                        value={editKeywords}
                        onChange={(e) => setEditKeywords(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-[9.5px] text-gray-500 mt-1 block">
                        Comma separated. Never invents details — only naturally weaves relevant keywords if customer selects matching chips.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* 9. Twitter / X & UPI ID */}
              {(isPermitted("twitter_link") || isPermitted("upi_id")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {isPermitted("twitter_link") && (
                    <div className={!isPermitted("upi_id") ? "sm:col-span-2" : ""}>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">
                        Twitter / X Profile
                      </label>
                      <div className="relative">
                        <Twitter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
                        <input
                          type="text"
                          placeholder="https://x.com/... or @handle"
                          value={editTwitter}
                          onChange={(e) => setEditTwitter(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}

                  {isPermitted("upi_id") && (
                    <div className={!isPermitted("twitter_link") ? "sm:col-span-2" : ""}>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">
                        Business UPI ID
                      </label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                        <input
                          type="text"
                          placeholder="e.g. zentap@oksbi"
                          value={editUpiId}
                          onChange={(e) => setEditUpiId(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 10. Directions Link / Full Address */}
              {isPermitted("directions_link") && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Directions Link / Full Address Note
                  </label>
                  <div className="relative">
                    <Navigation className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                    <input
                      type="text"
                      placeholder="e.g. https://maps.app.goo.gl/... or Ahmedabad, Gujarat, India"
                      value={editDirections}
                      onChange={(e) => {
                        setEditDirections(e.target.value);
                        setEditAddress(e.target.value);
                      }}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* 11. Permitted Custom Fields Configured in Settings */}
              {customFieldDefs.filter((f) => f.is_active && isPermitted(f.id)).length > 0 && (
                <div className="pt-2.5 border-t border-white/10 space-y-2.5">
                  <div className="flex items-center gap-1.5 pb-0.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Custom Business Details
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                      {customFieldDefs.filter((f) => f.is_active && isPermitted(f.id)).length} active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {customFieldDefs
                      .filter((f) => f.is_active && isPermitted(f.id))
                      .map((field) => (
                        <div key={field.id} className={field.type === "url" || field.id.includes("address") ? "sm:col-span-2" : ""}>
                          <label className="block text-[11px] font-bold text-gray-300 mb-1 flex items-center justify-between">
                            <span>{field.label}</span>
                            <span className="text-[10px] font-mono text-gray-500">({field.type})</span>
                          </label>
                          <input
                            type={field.type === "url" ? "url" : field.type === "email" ? "email" : field.type === "tel" ? "tel" : field.type === "number" ? "number" : "text"}
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                            value={ownerCustomFields[field.id] || ""}
                            onChange={(e) => setOwnerCustomFields({ ...ownerCustomFields, [field.id]: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Empty state notice if all fields are turned off in Settings */}
              {!isPermitted("business_name") &&
                !isPermitted("city") &&
                !isPermitted("category") &&
                !isPermitted("owner_name") &&
                !isPermitted("owner_phone") &&
                !isPermitted("contact_phone") &&
                !isPermitted("owner_email") &&
                !isPermitted("google_review_link") &&
                !isPermitted("google_business_page") &&
                !isPermitted("whatsapp") &&
                !isPermitted("instagram_link") &&
                !isPermitted("facebook_link") &&
                !isPermitted("website_url") &&
                !isPermitted("area") &&
                !isPermitted("services") &&
                !isPermitted("keywords") &&
                !isPermitted("twitter_link") &&
                !isPermitted("upi_id") &&
                !isPermitted("directions_link") &&
                customFieldDefs.filter((f) => f.is_active && isPermitted(f.id)).length === 0 && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1.5 py-6">
                    <p className="text-xs text-amber-300 font-bold">No editable fields permitted</p>
                    <p className="text-[11px] text-gray-400">
                      Field editing access has been turned off in settings. Contact your administrator if you need to update any business details.
                    </p>
                  </div>
                )}

              {/* Save Updates Button */}
              <div className="pt-3 flex items-center justify-between border-t border-white/10">
                <button
                  type="button"
                  onClick={handleLockAndExit}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 cursor-pointer"
                >
                  Sign Out
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="tactile-btn flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#ff7a00] hover:brightness-110 text-black text-xs font-bold cursor-pointer shadow-lg transition-transform active:scale-[0.978] disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-black" />
                  <span>{saving ? "Publishing Changes..." : "Save & Publish Live"}</span>
                </button>
              </div>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
