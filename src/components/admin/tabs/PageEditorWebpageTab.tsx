"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Palette,
  Search,
  ExternalLink,
  QrCode,
  Download,
  Copy,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Sparkles,
  Phone,
  Navigation,
  MessageCircle,
  Instagram,
  Facebook,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  Star,
  Save,
  Edit2,
  Trash2,
  RotateCcw,
  ShieldAlert,
  Share2,
  Radio,
  Tag,
  Globe,
  Mail,
  MapPin,
  Clock,
  HelpCircle,
  Plus,
  FileText,
  Info,
} from "lucide-react";
import QRCode from "qrcode";
import {
  PageEditorConfigItemRecord,
  DeletedPageEditorConfigRecord,
  GoogleReviewLinkItemRecord,
  getAllPageEditorConfigs,
  getAllDeletedPageEditorConfigs,
  getAllGoogleReviewLinks,
  getAllClients,
  savePageEditorConfig,
  savePageEditorConfigServer,
  updatePageEditorConfig,
  updateGoogleReviewLinkServer,
  softDeletePageEditorServer,
  restorePageEditorServer,
  permanentDeletePageEditorServer,
  serverFetchPlatformData,
  DOMAIN_BASE,
} from "@/lib/adminPlatformStore";
import {
  getPageDesign,
  savePageDesign,
  savePageButtons,
  PageButtonRecord,
} from "@/lib/hubDesignStore";

interface PageEditorWebpageTabProps {
  onShowToast: (msg: string) => void;
}

const PRESET_CATEGORIES = [
  "Restaurant & Cafe",
  "Salon & Spa",
  "Retail Store",
  "Healthcare & Clinic",
  "Service",
  "Jewellery & Luxury",
  "Customer Satisfaction Hub",
];

const parseCategoriesList = (raw: string): string[] => {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(/[,/|•]+/)
    .map((s) => s.trim())
    .filter(Boolean);
};

export default function PageEditorWebpageTab({ onShowToast }: PageEditorWebpageTabProps) {
  const [editorConfigs, setEditorConfigs] = useState<PageEditorConfigItemRecord[]>([]);
  const [deletedConfigs, setDeletedConfigs] = useState<DeletedPageEditorConfigRecord[]>([]);
  const [googleLinks, setGoogleLinks] = useState<GoogleReviewLinkItemRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "deleted">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedTagLink, setCopiedTagLink] = useState(false);
  const [copiedNfcTagId, setCopiedNfcTagId] = useState<string | null>(null);

  const handleCopyNfc = (tagId: string, tagLink: string) => {
    const nfcUrl = `${tagLink}?s=nfc`;
    navigator.clipboard.writeText(nfcUrl);
    setCopiedNfcTagId(tagId);
    onShowToast(`✓ Copied NFC Link: ${nfcUrl}`);
    setTimeout(() => setCopiedNfcTagId(null), 2500);
  };

  const handleDestinationChange = async (
    tagId: string,
    businessId: string,
    businessName: string,
    newDest: "not_assigned" | "direct_google" | "zentap_google" | "business_page"
  ) => {
    // Optimistic UI state update for googleLinks
    setGoogleLinks((prev) =>
      prev.map((l) => (l.tag_id === tagId ? { ...l, destination: newDest } : l))
    );

    const matching = googleLinks.find((g) => g.tag_id === tagId);
    const res = await updateGoogleReviewLinkServer(tagId, {
      destination: newDest,
      business_id: businessId,
      business_name: businessName,
      business_google_review_link: matching?.business_google_review_link,
    });

    if (res.success) {
      onShowToast(
        `✓ Synced destination for ${businessName} (${tagId}) to ${
          newDest === "business_page"
            ? "Business Page"
            : newDest === "zentap_google"
            ? "ZenTap Google Review"
            : newDest === "direct_google"
            ? "Direct Google Review"
            : "Not Assigned"
        } in Google Links & QR Sharing!`
      );
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to update destination");
    }
  };

  // Visual Editor State
  const [activeItem, setActiveItem] = useState<PageEditorConfigItemRecord | null>(null);
  const [editTheme, setEditTheme] = useState("obsidian");
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editBannerUrl, setEditBannerUrl] = useState("/standees/standee_01.jpg");
  const [editLogoUrl, setEditLogoUrl] = useState("/logo.png");
  const [editWallpaperUrl, setEditWallpaperUrl] = useState("");
  const [editCtaText, setEditCtaText] = useState("Leave a 5-Star Review on Google");
  const [editGoogleLink, setEditGoogleLink] = useState("");
  const [editPhone, setEditPhone] = useState("+91 98250 12345");
  const [editWhatsapp, setEditWhatsapp] = useState("919825012345");
  const [editInstagram, setEditInstagram] = useState("");
  const [editFacebook, setEditFacebook] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editMapsLink, setEditMapsLink] = useState("");
  const [editAboutUs, setEditAboutUs] = useState("");
  const [editOpeningHours, setEditOpeningHours] = useState("");
  const [editFaqs, setEditFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [editLocationImage, setEditLocationImage] = useState("");
  const [editLocationTitle, setEditLocationTitle] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editTagLink, setEditTagLink] = useState("");

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const locationImgInputRef = useRef<HTMLInputElement>(null);

  const handleFileToUrl = (file: File, setter: (url: string) => void, label: string) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      onShowToast("Image size exceeds 4MB. Please choose a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        setter(e.target.result);
        onShowToast(`✓ ${label} uploaded successfully!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFetchFromClient = (businessId: string) => {
    const allC = getAllClients();
    const client = allC.find((c) => c.business_id.toLowerCase() === businessId.toLowerCase());
    if (!client) {
      onShowToast(`No client profile found for ${businessId}`);
      return;
    }

    if (client.business_name) setEditTitle(client.business_name);
    if (client.city) {
      setEditSubtitle(`${client.city} • Customer Satisfaction Hub`);
      setEditAddress(client.city);
    }
    if (client.owner_phone) setEditPhone(client.owner_phone);
    if (client.whatsapp || client.owner_phone) setEditWhatsapp(client.whatsapp || client.owner_phone);
    if (client.instagram_link) setEditInstagram(client.instagram_link);
    if (client.facebook_link) setEditFacebook(client.facebook_link);
    if (client.owner_email) setEditEmail(client.owner_email);
    if (client.custom_fields?.website_url || client.custom_fields?.website) {
      setEditWebsite(client.custom_fields.website_url || client.custom_fields.website);
    }
    if (client.custom_fields?.google_maps_link || client.custom_fields?.maps_link) {
      setEditMapsLink(client.custom_fields.google_maps_link || client.custom_fields.maps_link);
    }
    if (client.custom_fields?.about_us) {
      setEditAboutUs(client.custom_fields.about_us);
    }
    if (client.google_review_link) {
      setEditGoogleLink(client.google_review_link);
    } else if (activeItem) {
      const matchingG = googleLinks.find((g) => g.tag_id.toLowerCase() === activeItem.tag_id.toLowerCase()) ||
        getAllGoogleReviewLinks().find((g) => g.tag_id.toLowerCase() === activeItem.tag_id.toLowerCase());
      if (matchingG?.business_google_review_link) {
        setEditGoogleLink(matchingG.business_google_review_link);
      }
    }

    onShowToast(`✓ Auto-fetched data from Client profile (${client.business_name})!`);
  };

  // Edit Whole Entry Modal
  const [editWholeTarget, setEditWholeTarget] = useState<PageEditorConfigItemRecord | null>(null);
  const [editWholeTagId, setEditWholeTagId] = useState("");
  const [editWholeBusinessId, setEditWholeBusinessId] = useState("");
  const [editWholeBusinessName, setEditWholeBusinessName] = useState("");
  const [editWholeCategory, setEditWholeCategory] = useState("Customer Satisfaction Hub");
  const [categoryInputText, setCategoryInputText] = useState("");
  const [designerCatInputText, setDesignerCatInputText] = useState("");
  const [editWholeLinkUrl, setEditWholeLinkUrl] = useState("");
  const [editWholeSetupStatus, setEditWholeSetupStatus] = useState<"pending" | "completed">("pending");

  // Category Tag Helpers for Edit Whole Entry Modal
  const currentWholeCategories = parseCategoriesList(editWholeCategory);

  const handleAddWholeCategory = (catToAdd: string) => {
    const trimmed = catToAdd.trim();
    if (!trimmed) return;
    const exists = currentWholeCategories.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );
    if (!exists) {
      const updated = [...currentWholeCategories, trimmed];
      setEditWholeCategory(updated.join(", "));
    }
    setCategoryInputText("");
  };

  const handleRemoveWholeCategory = (catToRemove: string) => {
    const updated = currentWholeCategories.filter(
      (c) => c.toLowerCase() !== catToRemove.toLowerCase()
    );
    setEditWholeCategory(updated.join(", "));
  };

  const handleToggleWholeCategory = (cat: string) => {
    const exists = currentWholeCategories.some(
      (c) => c.toLowerCase() === cat.toLowerCase()
    );
    if (exists) {
      handleRemoveWholeCategory(cat);
    } else {
      handleAddWholeCategory(cat);
    }
  };

  // Category Tag Helpers for Visual Page Designer Modal
  const currentDesignerCategories = parseCategoriesList(editSubtitle);

  const handleAddDesignerCategory = (catToAdd: string) => {
    const trimmed = catToAdd.trim();
    if (!trimmed) return;
    const exists = currentDesignerCategories.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );
    if (!exists) {
      const updated = [...currentDesignerCategories, trimmed];
      setEditSubtitle(updated.join(", "));
    }
    setDesignerCatInputText("");
  };

  const handleRemoveDesignerCategory = (catToRemove: string) => {
    const updated = currentDesignerCategories.filter(
      (c) => c.toLowerCase() !== catToRemove.toLowerCase()
    );
    setEditSubtitle(updated.join(", "));
  };

  const handleToggleDesignerCategory = (cat: string) => {
    const exists = currentDesignerCategories.some(
      (c) => c.toLowerCase() === cat.toLowerCase()
    );
    if (exists) {
      handleRemoveDesignerCategory(cat);
    } else {
      handleAddDesignerCategory(cat);
    }
  };

  // Delete Target Modal (Soft delete)
  const [deleteTarget, setDeleteTarget] = useState<PageEditorConfigItemRecord | null>(null);

  // Permanent Delete Target (Deleted tab only)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<DeletedPageEditorConfigRecord | null>(null);
  const [typedConfirmName, setTypedConfirmName] = useState("");

  // QR Modal
  const [qrModalItem, setQrModalItem] = useState<PageEditorConfigItemRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    // Preserve URL state on refresh (Requirement 4)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const st = params.get("status");
      if (st === "deleted") {
        setActiveTab("deleted");
      }
    }
    refreshData();
  }, []);

  const setTabAndUrl = (status: "all" | "deleted") => {
    setActiveTab(status);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (status === "all") {
        url.searchParams.delete("status");
      } else {
        url.searchParams.set("status", status);
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  const refreshData = async () => {
    setEditorConfigs(getAllPageEditorConfigs());
    setDeletedConfigs(getAllDeletedPageEditorConfigs());
    setGoogleLinks(getAllGoogleReviewLinks());
    const res = await serverFetchPlatformData();
    if (res.success && res.data) {
      setEditorConfigs(res.data.pageEditorConfigs || []);
      setDeletedConfigs(res.data.deletedPageEditorConfigs || []);
      if (res.data.googleLinks) {
        setGoogleLinks(res.data.googleLinks);
      }
    }
  };

  const handleOpenEditor = (item: PageEditorConfigItemRecord) => {
    setActiveItem(item);
    const cfg = item.config_data || {};
    const matchingGLink =
      googleLinks.find((g) => g.tag_id.toLowerCase() === item.tag_id.toLowerCase()) ||
      getAllGoogleReviewLinks().find((g) => g.tag_id.toLowerCase() === item.tag_id.toLowerCase());

    const allC = getAllClients();
    const client = allC.find((c) => c.business_id.toLowerCase() === item.business_id.toLowerCase());

    const resolvedTagLink = matchingGLink?.link_of_tag_id || (item.link_url?.includes("/t/") ? item.link_url : `${DOMAIN_BASE}/t/${item.tag_id}`);
    const resolvedGoogleLink = cfg.google_link || matchingGLink?.business_google_review_link || client?.google_review_link || "";

    const isZenTap = item.tag_id.toLowerCase() === "zentap" || item.business_id.toLowerCase() === "sample-demo-biz-01";

    setEditTheme(cfg.theme || "obsidian");
    setEditTitle(cfg.title || item.business_name || client?.business_name || (isZenTap ? "ZenTap Digital Solutions" : "Business Name"));
    setEditSubtitle(cfg.subtitle || (client?.city ? `${client.city} • Customer Satisfaction Hub` : (isZenTap ? "Ahmedabad • Welcome to our official digital hub" : "Customer Satisfaction Hub")));
    setEditBannerUrl(cfg.cover_image || cfg.cover_url || "/standees/standee_01.jpg");
    setEditLogoUrl(cfg.logo_url || (isZenTap ? "https://lh3.googleusercontent.com/aida-public/AB6AXuC1v0R5J-iLk5f40ycfMMud4JnJoswjm15FbobEOnF982t6u0ffqZ5svfbrN6qmKCgW6F-ejOC4Wb7QfcaQxHkJ1zNt1_wwvtSXB_tS_LnuUT3Ix44J8qUCCdD5R0FV5uVKI6skyKM5QrdeTcFxjYpSEt1QvFc280v1TA_DIT0JIOkcNc80JTWv6k4ina32ylCuUkv281QHYkmRhBaS2AuAkImi5kyMIeFwMO0zhd8316MT0gk6t2Q50A" : "/logo.png"));
    setEditWallpaperUrl(cfg.wallpaper_url || "");
    setEditCtaText(cfg.cta_text || (isZenTap ? "Loved your visit? Tap to write a rapid 5-Star Google Review" : "Leave a 5-Star Review on Google"));
    setEditGoogleLink(resolvedGoogleLink || (isZenTap ? "https://www.google.com/maps/place//@23.0393793,72.6446507,17z" : ""));
    setEditPhone(cfg.phone || client?.owner_phone || (isZenTap ? "+91 92745 60880" : "+91 98250 12345"));
    setEditWhatsapp(cfg.whatsapp || client?.whatsapp || client?.owner_phone || (isZenTap ? "919274560880" : "919825012345"));
    setEditInstagram(cfg.instagram || client?.instagram_link || (isZenTap ? "https://instagram.com" : ""));
    setEditFacebook(cfg.facebook || client?.facebook_link || (isZenTap ? "https://facebook.com" : ""));
    setEditWebsite(cfg.website || client?.custom_fields?.website_url || client?.custom_fields?.website || (isZenTap ? "https://zentapdigitalsolutions.com" : ""));
    setEditEmail(cfg.email || client?.owner_email || (isZenTap ? "contact@zentapdigitalsolutions.com" : ""));
    setEditAddress(cfg.address || client?.city || (isZenTap ? "Ahmedabad, Gujarat, India" : ""));
    setEditMapsLink(cfg.maps_link || client?.custom_fields?.google_maps_link || (isZenTap ? "https://www.google.com/maps/place//@23.0393793,72.6446507,17z" : ""));
    setEditAboutUs(cfg.about_us || (isZenTap ? "Welcome to ZenTap Digital Solutions! We take pride in delivering premier service, top craftsmanship, and genuine hospitality to every visitor." : ""));
    setEditOpeningHours(cfg.opening_hours || (isZenTap ? "Monday – Saturday: 10:00 AM – 09:00 PM\nSunday: 11:00 AM – 06:00 PM" : ""));
    setEditFaqs(Array.isArray(cfg.faqs) && cfg.faqs.length > 0 ? cfg.faqs : (isZenTap ? [
      { question: "Do you offer parking?", answer: "Yes, dedicated on-site parking is available for visitors, with seamless accessibility directly in front of our premises." },
      { question: "What payment modes are accepted?", answer: "We support all major payment types including UPI (Google Pay, PhonePe, Paytm), Visa/Mastercard/RuPay credit & debit cards, net banking, and cash." },
    ] : []));
    setEditLocationImage(cfg.location_image || (isZenTap ? "https://lh3.googleusercontent.com/aida-public/AB6AXuBntBRRtvFsUDBYuSpyCqOKOrww8i3Jra2cvrOlya4dusW8PVtI8vY7kNlQT6oWsIbi_RxEvnxmKef0KVtOB85lYnw8jONF_Iq3ZThxyxk6mZACXbKDiXpMZyAsooT3GYU_dpN4F5OQ6bwFzaHC988imjfe9wnu2h5NOQPefD_KjMN5mLgmOXi2e77FzabIrI3F4X9mEWZg-Dd5qiEghoie3wXTVnHyKlrg9B18etzc" : ""));
    setEditLocationTitle(cfg.location_title || (isZenTap ? "Ahmedabad Central Hub" : ""));
    setEditTags(Array.isArray(cfg.tags) ? cfg.tags.join(", ") : (cfg.tags || "Cleanliness, Nice Staff, Good Behaviour, Excellent Quality, Fair Pricing, Fast Service, Good Ambience, Value for Money, Hygiene, Professional Team, On-time Delivery, Easy Parking"));
    setEditTagLink(resolvedTagLink);
  };

  const handleSaveDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    const newConfigData = {
      theme: editTheme,
      title: editTitle.trim(),
      subtitle: editSubtitle.trim(),
      category: editSubtitle.trim(),
      address: editAddress.trim(),
      maps_link: editMapsLink.trim(),
      cover_image: editBannerUrl.trim(),
      logo_url: editLogoUrl.trim(),
      wallpaper_url: editWallpaperUrl.trim(),
      cta_text: editCtaText.trim(),
      google_link: editGoogleLink.trim(),
      phone: editPhone.trim(),
      whatsapp: editWhatsapp.trim(),
      instagram: editInstagram.trim(),
      facebook: editFacebook.trim(),
      website: editWebsite.trim(),
      email: editEmail.trim(),
      about_us: editAboutUs.trim(),
      opening_hours: editOpeningHours.trim(),
      faqs: editFaqs,
      location_image: editLocationImage.trim(),
      location_title: editLocationTitle.trim(),
      tags: editTags ? editTags.split(",").map((s) => s.trim()).filter(Boolean) : [],
      link_url: editTagLink.trim(),
    };

    setIsSubmitting(true);
    const res = await savePageEditorConfigServer(activeItem.tag_id, newConfigData, {
      business_id: activeItem.business_id,
      business_name: activeItem.business_name,
      link_url: activeItem.link_url,
    });
    setIsSubmitting(false);

    if (res.success) {
      // Sync to hubDesignStore for live preview and Hub hydration
      try {
        const defaultDesign = getPageDesign(activeItem.business_id);
        savePageDesign({
          ...defaultDesign,
          hub_enabled: true,
          theme_preset: editTheme === "slate" ? "modern_slate"
                      : editTheme === "emerald" ? "emerald_luxe"
                      : editTheme === "sunset" ? "midnight_amber"
                      : editTheme === "clean_light" ? "clean_minimal"
                      : "modern_slate",
          primary_color: editTheme === "sunset" ? "#ea580c" : editTheme === "emerald" ? "#059669" : "#ff7a00",
          bg_color: editTheme === "clean_light" ? "#ffffff" : editTheme === "slate" ? "#0f172a" : editTheme === "emerald" ? "#062016" : "#0e1015",
          dark_mode: editTheme === "clean_light" ? "light" : "dark",
          cover_url: editBannerUrl.trim(),
          logo_url: editLogoUrl.trim(),
          wallpaper_url: editWallpaperUrl.trim(),
          tagline: editSubtitle.trim(),
          texts: {
            ...defaultDesign.texts,
            write_review_btn: editCtaText.trim(),
          },
        });

        const hubButtons: PageButtonRecord[] = [
          {
            id: `btn_review_${activeItem.business_id}`,
            business_id: activeItem.business_id,
            type: "review",
            label: editCtaText.trim() || "Leave a 5-Star Review on Google",
            url_or_value: editGoogleLink.trim(),
            sort_order: 1,
            visible: true,
          },
          ...(editPhone.trim() ? [{
            id: `btn_call_${activeItem.business_id}`,
            business_id: activeItem.business_id,
            type: "call" as const,
            label: "Call",
            url_or_value: editPhone.trim(),
            sort_order: 2,
            visible: true,
          }] : []),
          {
            id: `btn_maps_${activeItem.business_id}`,
            business_id: activeItem.business_id,
            type: "directions" as const,
            label: "Directions",
            url_or_value: editGoogleLink.trim(),
            sort_order: 3,
            visible: true,
          },
          ...(editWhatsapp.trim() ? [{
            id: `btn_wa_${activeItem.business_id}`,
            business_id: activeItem.business_id,
            type: "whatsapp" as const,
            label: "WhatsApp",
            url_or_value: editWhatsapp.trim(),
            sort_order: 4,
            visible: true,
          }] : []),
          ...(editInstagram.trim() ? [{
            id: `btn_ig_${activeItem.business_id}`,
            business_id: activeItem.business_id,
            type: "instagram" as const,
            label: "Instagram",
            url_or_value: editInstagram.trim(),
            sort_order: 5,
            visible: true,
          }] : []),
          ...(editFacebook.trim() ? [{
            id: `btn_fb_${activeItem.business_id}`,
            business_id: activeItem.business_id,
            type: "facebook" as const,
            label: "Facebook",
            url_or_value: editFacebook.trim(),
            sort_order: 6,
            visible: true,
          }] : []),
        ];
        savePageButtons(activeItem.business_id, hubButtons);
      } catch (err) {
        console.warn("Hub design sync error", err);
      }

      onShowToast(`✓ Successfully saved & published live for "${activeItem.business_name}"! Status of Design: Completed.`);
      setActiveItem(null);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to save design in database");
    }
  };

  // Open Edit Whole Entry Modal
  const openEditWhole = (item: PageEditorConfigItemRecord) => {
    setEditWholeTarget(item);
    setEditWholeTagId(item.tag_id);
    setEditWholeBusinessId(item.business_id);
    setEditWholeBusinessName(item.business_name);
    setEditWholeCategory(item.config_data?.category || item.config_data?.subtitle || "Customer Satisfaction Hub");
    setCategoryInputText("");
    setEditWholeLinkUrl(item.link_url);
    const isAlreadyDesigned = item.setup_status === "completed" || Boolean(item.config_data && (item.config_data.title || item.config_data.theme));
    setEditWholeSetupStatus(isAlreadyDesigned ? "completed" : (item.setup_status || "pending"));
  };

  const handleSaveWholeEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWholeTarget) return;

    setIsSubmitting(true);
    const updatedConfigData = {
      ...(editWholeTarget.config_data || {}),
      category: editWholeCategory.trim() || "Customer Satisfaction Hub",
      subtitle: editWholeCategory.trim() || "Customer Satisfaction Hub",
    };

    try {
      await fetch("/api/admin/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          table: "page_editor_configs",
          data: {
            tag_id: editWholeTarget.tag_id,
            business_id: editWholeBusinessId.trim(),
            business_name: editWholeBusinessName.trim(),
            link_url: editWholeLinkUrl.trim(),
            setup_status: editWholeSetupStatus,
            config_data: updatedConfigData,
            updated_at: new Date().toISOString(),
          },
          onConflict: "tag_id",
        }),
      });

      // Keep qr_nfc_tags in sync
      await fetch("/api/admin/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          table: "qr_nfc_tags",
          data: {
            tag_id: editWholeTarget.tag_id,
            business_id: editWholeBusinessId.trim(),
            business_name: editWholeBusinessName.trim(),
            updated_at: new Date().toISOString(),
          },
          onConflict: "tag_id",
        }),
      }).catch(() => {});
    } catch (err) {
      console.warn("Failed to persist whole entry edits to server", err);
    }

    const updated = updatePageEditorConfig(editWholeTarget.tag_id, {
      business_id: editWholeBusinessId.trim(),
      business_name: editWholeBusinessName.trim(),
      link_url: editWholeLinkUrl.trim(),
      setup_status: editWholeSetupStatus,
      config_data: updatedConfigData,
    });

    setIsSubmitting(false);
    onShowToast(`✓ Updated whole entry for ${editWholeBusinessName.trim()} (${editWholeTarget.tag_id})!`);
    setEditWholeTarget(null);
    await refreshData();
  };

  // Soft delete (moves to Deleted tab)
  const handleConfirmSoftDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    const res = await softDeletePageEditorServer(deleteTarget.tag_id);
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Page configuration for ${deleteTarget.tag_id} moved to Deleted section`);
      setDeleteTarget(null);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to delete page configuration");
    }
  };

  // Restore
  const handleRestore = async (item: DeletedPageEditorConfigRecord) => {
    setIsSubmitting(true);
    const res = await restorePageEditorServer(item.tag_id);
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Restored page configuration for ${item.tag_id}!`);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to restore page configuration");
    }
  };

  // Permanent Delete (Deleted tab only with typed Tag ID confirmation)
  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteTarget) return;
    if (typedConfirmName.trim().toUpperCase() !== permanentDeleteTarget.tag_id.trim().toUpperCase()) {
      onShowToast(`Typed Tag ID does not match "${permanentDeleteTarget.tag_id}".`);
      return;
    }
    setIsSubmitting(true);
    const res = await permanentDeletePageEditorServer(permanentDeleteTarget.tag_id, typedConfirmName.trim());
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Permanently deleted page config for ${permanentDeleteTarget.tag_id}`);
      setPermanentDeleteTarget(null);
      setTypedConfirmName("");
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to permanently delete page configuration");
    }
  };

  const handleOpenQr = async (item: PageEditorConfigItemRecord) => {
    setQrModalItem(item);
    const matchingGLink = googleLinks.find((g) => g.tag_id.toLowerCase() === item.tag_id.toLowerCase());
    const targetUrl = matchingGLink?.link_of_tag_id || (item.link_url?.includes("/t/") ? item.link_url : `${DOMAIN_BASE}/t/${item.tag_id}`);
    try {
      const url = await QRCode.toDataURL(targetUrl, {
        width: 320,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      setQrDataUrl(url);
    } catch (e) {
      console.warn("QR gen error", e);
    }
  };

  const handleDownloadQr = (item: PageEditorConfigItemRecord) => {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `page-editor-qr-${item.tag_id.toLowerCase()}.png`;
    a.click();
    onShowToast(`✓ Downloaded Page QR Code for ${item.tag_id}`);
  };

  // Destination filter state
  const [destFilter, setDestFilter] = useState<"all" | "zentap">("all");

  // Filter to entries whose Destination in Google Links & QR sharing is "zentap_google" or "business_page"
  const zentapOnlyConfigs = editorConfigs.filter((item) => {
    const matchingGLink = googleLinks.find((g) => g.tag_id.toLowerCase() === item.tag_id.toLowerCase());
    const dest = matchingGLink?.destination || item.destination;
    return dest === "zentap_google" || dest === "business_page";
  });

  const activeConfigsList = destFilter === "zentap" ? zentapOnlyConfigs : editorConfigs;

  // Search filter
  const q = searchQuery.toLowerCase().trim();
  const filteredConfigs = activeConfigsList.filter((item) => {
    if (!q) return true;
    return (
      (item.business_id && item.business_id.toLowerCase().includes(q)) ||
      (item.business_name && item.business_name.toLowerCase().includes(q)) ||
      (item.tag_id && item.tag_id.toLowerCase().includes(q)) ||
      (item.link_url && item.link_url.toLowerCase().includes(q)) ||
      (item.config_data?.category && item.config_data.category.toLowerCase().includes(q)) ||
      (item.config_data?.subtitle && item.config_data.subtitle.toLowerCase().includes(q))
    );
  });

  const filteredDeleted = deletedConfigs.filter((item) => {
    if (!q) return true;
    return (
      (item.business_id && item.business_id.toLowerCase().includes(q)) ||
      (item.business_name && item.business_name.toLowerCase().includes(q)) ||
      (item.tag_id && item.tag_id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                Standee Page Editor (ZenTap Review Assistant)
              </h1>
              <p className="text-xs text-zinc-500">
                Design custom review assistant landing pages for Standee merchants. Live interactive showcase.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={`${DOMAIN_BASE}/r/zentap?preview=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="tactile-btn inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978]"
            >
              <Eye className="w-4 h-4 text-white" />
              <span>Preview Demo Page (/r/zentap)</span>
            </a>
          </div>
        </div>

        {/* Tab Filter Pills & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-zinc-100">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl w-fit">
            <button
              onClick={() => { setActiveTab("all"); setDestFilter("all"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all" && destFilter === "all" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              All Standees ({editorConfigs.length})
            </button>
            <button
              onClick={() => { setActiveTab("all"); setDestFilter("zentap"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all" && destFilter === "zentap" ? "bg-white text-emerald-800 shadow-2xs font-extrabold" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              ZenTap Google Review ({zentapOnlyConfigs.length})
            </button>
            <button
              onClick={() => setTabAndUrl("deleted")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "deleted" ? "bg-white text-rose-700 shadow-2xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Deleted ({deletedConfigs.length})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Business ID, Name, Tag ID, Category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* ACTIVE PAGE EDITOR DIRECTORY TABLE */}
      {activeTab === "all" && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Business ID</th>
                  <th className="py-3.5 px-4">Business Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Tag ID</th>
                  <th className="py-3.5 px-4">Link of Tag ID</th>
                  <th className="py-3.5 px-4 text-center">QR Code</th>
                  <th className="py-3.5 px-4 text-center">NFC Link</th>
                  <th className="py-3.5 px-4">Setup Status</th>
                  <th className="py-3.5 px-4">Status of Design</th>
                  <th className="py-3.5 px-4">Destination from the Google Links &amp; QR sharing</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredConfigs.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-zinc-500 font-medium">
                      No Standee entries found. To design a custom review assistant page, configure a Standee below.
                    </td>
                  </tr>
                ) : (
                  filteredConfigs.map((item) => {
                    const isCompleted = item.setup_status === "completed";
                    const matchingGLink = googleLinks.find((g) => g.tag_id.toLowerCase() === item.tag_id.toLowerCase());
                    const displayTagLink = matchingGLink?.link_of_tag_id || (item.link_url?.includes("/t/") ? item.link_url : `${DOMAIN_BASE}/t/${item.tag_id}`);
                    const currentCategory = item.config_data?.category || item.config_data?.subtitle || "Customer Satisfaction Hub";
                    const currentDest = matchingGLink?.destination || item.destination || "zentap_google";

                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                        {/* 1. Business ID */}
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200 text-[11px]">
                            {item.business_id}
                          </span>
                        </td>

                        {/* 2. Business Name */}
                        <td className="py-3 px-4 whitespace-nowrap font-bold text-zinc-900">
                          {item.business_name}
                        </td>

                        {/* 3. Category */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEditWhole(item)}
                            className="tactile-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-purple-50 text-zinc-800 hover:text-purple-900 text-[11px] font-semibold border border-zinc-200 hover:border-purple-300 transition-colors cursor-pointer group"
                            title="Click to edit category"
                          >
                            <Tag className="w-3 h-3 text-purple-600" />
                            <span className="max-w-[140px] truncate">{currentCategory}</span>
                            <Edit2 className="w-2.5 h-2.5 text-zinc-400 group-hover:text-purple-600" />
                          </button>
                        </td>

                        {/* 4. Tag ID */}
                        <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md bg-zinc-900 text-white text-xs tracking-wider">
                            {item.tag_id}
                          </span>
                        </td>

                        {/* 5. Link of Tag ID */}
                        <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                          <a
                            href={displayTagLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-semibold"
                            title={displayTagLink}
                          >
                            <span className="truncate max-w-[170px]">{displayTagLink}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        </td>

                        {/* 6. QR Code */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleOpenQr(item)}
                            className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-bold border border-zinc-200 transition-all cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-zinc-700" />
                            <span>QR</span>
                          </button>
                        </td>

                        {/* 7. NFC Link */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleCopyNfc(item.tag_id, displayTagLink)}
                            className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                            title="Copy NFC Link"
                          >
                            {copiedNfcTagId === item.tag_id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Radio className="w-3.5 h-3.5 text-zinc-300" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* 8. Setup Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 text-[11px] font-bold">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>

                        {/* 9. Status of Design */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 text-[11px] font-bold">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>

                        {/* 10. Destination from the Google Links & QR sharing (Interactive Dropdown) */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <select
                            value={currentDest}
                            onChange={(e) =>
                              handleDestinationChange(
                                item.tag_id,
                                item.business_id,
                                item.business_name,
                                e.target.value as any
                              )
                            }
                            className={`tactile-btn text-[11px] font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer outline-none transition-all ${
                              currentDest === "business_page"
                                ? "bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100"
                                : currentDest === "zentap_google"
                                ? "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100"
                                : currentDest === "direct_google"
                                ? "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                                : "bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200"
                            }`}
                          >
                            <option value="business_page">Business Page (Blue)</option>
                            <option value="zentap_google">ZenTap Google Review (Green)</option>
                            <option value="direct_google">Direct Google Review (Amber)</option>
                            <option value="not_assigned">Not Assigned (Grey)</option>
                          </select>
                        </td>

                        {/* 10. Actions: Live Preview, Design, Edit Whole Entry, Delete */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={displayTagLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Live Preview Standee Page"
                              className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-bold border border-zinc-200 transition-transform active:scale-[0.978] cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-zinc-700" />
                              <span>Live Preview</span>
                            </a>
                            <button
                              onClick={() => handleOpenEditor(item)}
                              title="Open Visual Page Designer"
                              className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shadow-2xs transition-transform active:scale-[0.978] cursor-pointer"
                            >
                              <Sliders className="w-3 h-3" />
                              <span>Design</span>
                            </button>
                            <button
                              onClick={() => openEditWhole(item)}
                              title="Edit Whole Entry"
                              className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200 transition-transform active:scale-[0.978] cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3 text-blue-600" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              title="Delete Entry"
                              className="tactile-btn p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DELETED PAGE EDITOR CONFIGS TABLE */}
      {activeTab === "deleted" && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold">Deleted Page Configurations Registry</span>
            </div>
            <span className="text-[11px] text-rose-700">
              Archived Standee page customizations. Can be restored back to active directory at any time.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Tag ID</th>
                  <th className="py-3.5 px-4">Business ID</th>
                  <th className="py-3.5 px-4">Business Name</th>
                  <th className="py-3.5 px-4">Link of Tag ID</th>
                  <th className="py-3.5 px-4">Deleted At</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredDeleted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 font-medium">
                      No deleted page configurations in registry.
                    </td>
                  </tr>
                ) : (
                  filteredDeleted.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-900 text-white text-xs">
                          {item.tag_id}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-zinc-700">
                        {item.business_id}
                      </td>
                      <td className="py-3 px-4 font-bold text-zinc-900">{item.business_name}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-600 truncate max-w-xs">
                        {item.link_url?.includes("/t/") ? item.link_url : `${DOMAIN_BASE}/t/${item.tag_id}`}
                      </td>
                      <td className="py-3 px-4 text-zinc-500 text-[11px]">
                        {new Date(item.deleted_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestore(item)}
                            disabled={isSubmitting}
                            className="tactile-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-transform active:scale-[0.978] cursor-pointer disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                          <button
                            onClick={() => {
                              setPermanentDeleteTarget(item);
                              setTypedConfirmName("");
                            }}
                            disabled={isSubmitting}
                            className="tactile-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-transform active:scale-[0.978] cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Permanently</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT WHOLE ENTRY                                                   */}
      {/* ========================================================================= */}
      {editWholeTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Edit2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">
                    Edit Page Entry: {editWholeTarget.tag_id}
                  </h3>
                  <p className="text-[11px] text-zinc-500">Edit business name, target preview URL, or setup status</p>
                </div>
              </div>
              <button
                onClick={() => setEditWholeTarget(null)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWholeEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Tag ID</label>
                  <input
                    type="text"
                    disabled
                    value={editWholeTagId}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-mono font-bold text-zinc-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Business ID</label>
                  <input
                    type="text"
                    value={editWholeBusinessId}
                    onChange={(e) => setEditWholeBusinessId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Business Name</label>
                <input
                  type="text"
                  value={editWholeBusinessName}
                  onChange={(e) => setEditWholeBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-zinc-800">
                    Category / Categories
                  </label>
                  {currentWholeCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setEditWholeCategory("")}
                      className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Active Category Badges (Removable with ×) */}
                <div className="min-h-[42px] p-2 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-wrap items-center gap-1.5 mb-2">
                  {currentWholeCategories.length === 0 ? (
                    <span className="text-xs text-zinc-400 italic px-1">
                      No categories selected. Type below to add or click a preset chip.
                    </span>
                  ) : (
                    currentWholeCategories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold shadow-2xs group animate-in zoom-in-95 duration-150"
                      >
                        <Tag className="w-3 h-3 text-purple-600 shrink-0" />
                        <span>{cat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveWholeCategory(cat)}
                          title={`Remove ${cat}`}
                          className="w-4 h-4 rounded-md hover:bg-purple-200 text-purple-700 flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add Custom Category Input with + Add button */}
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Type category (e.g. Service, Cafe, Salon) and press Enter..."
                    value={categoryInputText}
                    onChange={(e) => setCategoryInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        handleAddWholeCategory(categoryInputText);
                      }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddWholeCategory(categoryInputText)}
                    disabled={!categoryInputText.trim()}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1 shrink-0"
                  >
                    <span>+ Add</span>
                  </button>
                </div>

                {/* Preset Categories (Click to Add / Remove toggle) */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1.5">
                    Click preset to add or remove:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_CATEGORIES.map((preset) => {
                      const isSelected = currentWholeCategories.some(
                        (c) => c.toLowerCase() === preset.toLowerCase()
                      );
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleToggleWholeCategory(preset)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold cursor-pointer transition-all flex items-center gap-1 active:scale-95 ${
                            isSelected
                              ? "bg-purple-600 text-white border-purple-600 shadow-2xs hover:bg-purple-700"
                              : "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200 hover:border-zinc-300"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3 h-3 text-white" />
                              <span>{preset}</span>
                              <X className="w-3 h-3 text-white/70 hover:text-white ml-0.5" />
                            </>
                          ) : (
                            <>
                              <span className="text-zinc-400 font-bold">+</span>
                              <span>{preset}</span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Link of Tag ID</label>
                <input
                  type="text"
                  value={editWholeLinkUrl}
                  onChange={(e) => setEditWholeLinkUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Status of Design / Setup Status</label>
                <select
                  value={editWholeSetupStatus}
                  onChange={(e) => setEditWholeSetupStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                >
                  <option value="pending">Pending (Not Designed — Shows &apos;Business Profile Under Process&apos;)</option>
                  <option value="completed">Completed (Designed — Live &amp; Redirects to Customized Review Page)</option>
                </select>
                <p className="text-[10px] text-zinc-500 mt-1">
                  When Pending, scanning the standee shows &apos;Business Profile Under Process&apos;. Once designed and saved, it becomes Completed and redirects to the customized review page.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditWholeTarget(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SOFT DELETE CONFIRMATION                                            */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-zinc-900">Move Config to Deleted Section?</h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Are you sure you want to delete the page customization for <strong className="text-zinc-900 font-bold">{deleteTarget.business_name}</strong> ({deleteTarget.tag_id})?
                This will be moved to the <strong>Deleted</strong> section and can be restored at any time.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSoftDelete}
                disabled={isSubmitting}
                className="tactile-btn px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Yes, Move to Deleted"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PERMANENT DELETE WITH TYPED CONFIRMATION (Deleted Tab Only)          */}
      {/* ========================================================================= */}
      {permanentDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-rose-950">Delete Page Config Permanently</h3>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                This action is <strong>irreversible</strong>. The landing page configuration for <strong>{permanentDeleteTarget.business_name}</strong> ({permanentDeleteTarget.tag_id}) will be permanently removed from the database.
              </p>
            </div>

            <div className="space-y-2 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
              <label className="block text-[11px] font-bold text-zinc-800">
                To confirm permanent deletion, please type:
                <span className="block mt-1 font-mono text-xs text-rose-900 bg-white px-2 py-1 rounded border border-rose-200 select-all">
                  {permanentDeleteTarget.tag_id}
                </span>
              </label>
              <input
                type="text"
                value={typedConfirmName}
                onChange={(e) => setTypedConfirmName(e.target.value)}
                placeholder="Type exact Tag ID here"
                className="w-full px-3 py-2 rounded-xl bg-white border border-rose-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono uppercase"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  setPermanentDeleteTarget(null);
                  setTypedConfirmName("");
                }}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                disabled={
                  isSubmitting ||
                  typedConfirmName.trim().toUpperCase() !== permanentDeleteTarget.tag_id.trim().toUpperCase()
                }
                className="tactile-btn px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FULL VISUAL PAGE EDITOR & LIVE MOCKUP PREVIEW                      */}
      {/* ========================================================================= */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-5xl w-full h-[92vh] shadow-2xl border border-zinc-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center font-bold">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">
                      Design Review Page — {activeItem.business_name} ({activeItem.tag_id})
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      <Share2 className="w-3 h-3 text-emerald-400" />
                      <span>Connected to Google Links &amp; QR Sharing</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-[11px] text-zinc-400 font-mono">
                      Link of Tag ID: <strong className="text-amber-400">{editTagLink}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleFetchFromClient(activeItem.business_id)}
                      className="tactile-btn inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 text-[10px] font-bold transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5 text-purple-300" />
                      <span>Auto-fetch data from Client Profile</span>
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Body: Controls on Left, Live Mockup on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
              {/* Controls Column (7 Cols) */}
              <div className="lg:col-span-7 p-6 overflow-y-auto space-y-5 border-r border-zinc-200 bg-zinc-50/50">
                <form onSubmit={handleSaveDesign} className="space-y-4">
                  {/* Hidden File Inputs */}
                  <input
                    type="file"
                    ref={bannerInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileToUrl(file, setEditBannerUrl, "Cover Banner");
                    }}
                  />
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileToUrl(file, setEditLogoUrl, "Round Profile Logo");
                    }}
                  />
                  <input
                    type="file"
                    ref={wallpaperInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileToUrl(file, setEditWallpaperUrl, "Page Wallpaper");
                    }}
                  />
                  <input
                    type="file"
                    ref={locationImgInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileToUrl(file, setEditLocationImage, "Studio Location Banner");
                    }}
                  />

                  {/* Theme Presets */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Theme Preset</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "obsidian", label: "Obsidian Dark", bg: "bg-[#0e1015] text-white" },
                        { id: "slate", label: "Slate Minimal", bg: "bg-slate-900 text-white" },
                        { id: "emerald", label: "Emerald Luxe", bg: "bg-emerald-950 text-white" },
                        { id: "sunset", label: "Sunset Amber", bg: "bg-orange-950 text-white" },
                        { id: "clean_light", label: "Pure Light", bg: "bg-white text-zinc-900 border" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setEditTheme(t.id)}
                          className={`p-2 rounded-xl text-center cursor-pointer transition-all ${
                            editTheme === t.id
                              ? "ring-2 ring-purple-600 shadow-sm"
                              : "opacity-75 hover:opacity-100"
                          }`}
                        >
                          <div className={`w-full h-8 rounded-lg ${t.bg} flex items-center justify-center text-[10px] font-bold shadow-2xs mb-1`}>
                            Aa
                          </div>
                          <span className="text-[11px] font-medium text-zinc-700">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand Titles */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1">Headline / Business Title</label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-bold"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-zinc-900">Category / Subtitle</label>
                        {currentDesignerCategories.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setEditSubtitle("")}
                            className="text-[10px] font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                          >
                            Clear all
                          </button>
                        )}
                      </div>

                      {/* Active Category Badges (Removable with ×) */}
                      <div className="min-h-[38px] p-1.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-wrap items-center gap-1.5 mb-1.5">
                        {currentDesignerCategories.length === 0 ? (
                          <span className="text-[11px] text-zinc-400 italic px-1">
                            No categories selected. Type to add or click a preset below.
                          </span>
                        ) : (
                          currentDesignerCategories.map((cat) => (
                            <span
                              key={cat}
                              className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-bold shadow-2xs group"
                            >
                              <Tag className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                              <span>{cat}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDesignerCategory(cat)}
                                title={`Remove ${cat}`}
                                className="w-3.5 h-3.5 rounded hover:bg-purple-200 text-purple-700 flex items-center justify-center cursor-pointer transition-colors"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Add Custom Category Input with + Add button */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <input
                          type="text"
                          placeholder="Type category & press Enter..."
                          value={designerCatInputText}
                          onChange={(e) => setDesignerCatInputText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault();
                              handleAddDesignerCategory(designerCatInputText);
                            }
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddDesignerCategory(designerCatInputText)}
                          disabled={!designerCatInputText.trim()}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1 shrink-0"
                        >
                          <span>+ Add</span>
                        </button>
                      </div>

                      {/* Preset Categories (Click to Add / Remove toggle) */}
                      <div>
                        <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">
                          Click preset to add or remove:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {PRESET_CATEGORIES.map((preset) => {
                            const isSelected = currentDesignerCategories.some(
                              (c) => c.toLowerCase() === preset.toLowerCase()
                            );
                            return (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => handleToggleDesignerCategory(preset)}
                                className={`text-[10px] px-2 py-0.5 rounded-md border font-medium cursor-pointer transition-all flex items-center gap-1 active:scale-95 ${
                                  isSelected
                                    ? "bg-purple-600 text-white border-purple-600 shadow-2xs hover:bg-purple-700"
                                    : "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200 hover:border-zinc-300"
                                }`}
                              >
                                {isSelected ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 text-white" />
                                    <span>{preset}</span>
                                    <X className="w-2.5 h-2.5 text-white/70 hover:text-white ml-0.5" />
                                  </>
                                ) : (
                                  <>
                                    <span className="text-zinc-400 font-bold">+</span>
                                    <span>{preset}</span>
                                  </>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Button Text */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-1">Primary Hero Button Text</label>
                    <input
                      type="text"
                      value={editCtaText}
                      onChange={(e) => setEditCtaText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-semibold"
                    />
                  </div>

                  {/* Visual Assets: Cover Banner, Round Profile Logo, Background Wallpaper */}
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-bold text-zinc-900">Custom Visual Assets</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-medium">Upload files or enter direct image URLs</span>
                    </div>

                    {/* 1. Behind the Banner (Cover Image) & 2. Round Cover Profile (Logo) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Behind the Banner */}
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                        <label className="block text-[11px] font-bold text-zinc-800">
                          Behind the Banner (Cover Banner)
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-10 rounded-lg bg-zinc-200 border border-zinc-300 overflow-hidden shrink-0">
                            {editBannerUrl ? (
                              <img src={editBannerUrl} alt="Banner" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-500">None</div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => bannerInputRef.current?.click()}
                            className="tactile-btn flex-1 py-1.5 px-2.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3 h-3 text-zinc-600" />
                            <span>Upload Banner</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Or paste banner image URL..."
                          value={editBannerUrl}
                          onChange={(e) => setEditBannerUrl(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-[11px] text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>

                      {/* Round Cover Profile (Logo) */}
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                        <label className="block text-[11px] font-bold text-zinc-800">
                          Round Cover Profile (Logo)
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-zinc-200 border border-zinc-300 overflow-hidden shrink-0 flex items-center justify-center">
                            {editLogoUrl ? (
                              <img src={editLogoUrl} alt="Logo" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <div className="text-[9px] text-zinc-500 font-bold">Logo</div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="tactile-btn flex-1 py-1.5 px-2.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3 h-3 text-zinc-600" />
                            <span>Upload Round Logo</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Or paste round logo image URL..."
                          value={editLogoUrl}
                          onChange={(e) => setEditLogoUrl(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-[11px] text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>
                    </div>

                    {/* 3. Background Wallpaper for the Page */}
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-zinc-800">
                          Background Wallpaper for the Page
                        </label>
                        {editWallpaperUrl && (
                          <button
                            type="button"
                            onClick={() => setEditWallpaperUrl("")}
                            className="text-[10px] text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                          >
                            Remove Wallpaper
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-10 rounded-lg bg-zinc-200 border border-zinc-300 overflow-hidden shrink-0">
                          {editWallpaperUrl ? (
                            <img src={editWallpaperUrl} alt="Wallpaper" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-500">Theme Color</div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => wallpaperInputRef.current?.click()}
                          className="tactile-btn flex-1 py-1.5 px-2.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3 h-3 text-zinc-600" />
                          <span>Upload Page Wallpaper</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Or paste wallpaper image URL..."
                        value={editWallpaperUrl}
                        onChange={(e) => setEditWallpaperUrl(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-[11px] text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] text-zinc-500 font-medium">Quick Presets:</span>
                        {[
                          { label: "Dark Mesh", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&q=80" },
                          { label: "Luxury Texture", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80" },
                          { label: "Obsidian Abstract", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80" },
                        ].map((wp) => (
                          <button
                            key={wp.label}
                            type="button"
                            onClick={() => setEditWallpaperUrl(wp.url)}
                            className="px-2 py-0.5 rounded-md bg-white hover:bg-zinc-200 text-zinc-700 border border-zinc-300 text-[10px] font-medium cursor-pointer"
                          >
                            {wp.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Connected Google Links & QR Sharing Box */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-zinc-900">
                          Connected to Google Links &amp; QR Sharing
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Tag ID: {activeItem.tag_id}</span>
                      </span>
                    </div>

                    {/* 1. Link of Tag ID from Google Links & QR Sharing */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-zinc-800 flex items-center gap-1">
                          <span>Link of Tag ID</span>
                          <span className="text-[10px] text-amber-700 font-normal">
                            (Standee NFC Tap &amp; QR Scan Link)
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(editTagLink);
                            setCopiedTagLink(true);
                            onShowToast(`✓ Copied Link of Tag ID: ${editTagLink}`);
                            setTimeout(() => setCopiedTagLink(false), 2000);
                          }}
                          className="text-[11px] text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedTagLink ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={editTagLink}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-300/80 text-xs text-zinc-900 font-mono font-bold select-all"
                        />
                        <a
                          href={editTagLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open Link of Tag ID in new tab"
                          className="tactile-btn px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-transform active:scale-[0.978]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Visit</span>
                        </a>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Live NFC/QR scan URL from <strong>Google Links &amp; QR Sharing</strong> programmed on the merchant&apos;s physical standee.
                      </p>
                    </div>

                    {/* 2. Page Linked to Tag ID / Google Review Posting URL */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Page Linked to Tag ID{" "}
                        <span className="text-[10px] text-zinc-500 font-normal">
                          (Business&apos;s Google Review Page Link)
                        </span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://g.page/r/.../review"
                        value={editGoogleLink}
                        onChange={(e) => setEditGoogleLink(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-mono font-medium"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Both are connected: changes saved here automatically sync with <strong>Google Links &amp; QR Sharing</strong> for {activeItem.tag_id}.
                      </p>
                    </div>
                  </div>

                  {/* Direct Contact Links: Phone, WhatsApp, Instagram, Facebook, Website, Email */}
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-purple-600" />
                        <span>Direct Contact &amp; Social Channels</span>
                      </label>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        *Blank buttons are automatically hidden from the card
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {/* Phone */}
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-700 mb-1 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>Phone / Call</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="+91 92745 60880"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>

                      {/* WhatsApp */}
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-700 mb-1 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-emerald-500" />
                          <span>WhatsApp</span>
                        </label>
                        <input
                          type="text"
                          placeholder="919274560880"
                          value={editWhatsapp}
                          onChange={(e) => setEditWhatsapp(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>

                      {/* Instagram */}
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-700 mb-1 flex items-center gap-1">
                          <Instagram className="w-3 h-3 text-pink-500" />
                          <span>Instagram (URL or @)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="@zentapdigital"
                          value={editInstagram}
                          onChange={(e) => setEditInstagram(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>

                      {/* Facebook */}
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-700 mb-1 flex items-center gap-1">
                          <Facebook className="w-3 h-3 text-blue-500" />
                          <span>Facebook URL</span>
                        </label>
                        <input
                          type="text"
                          placeholder="https://facebook.com/..."
                          value={editFacebook}
                          onChange={(e) => setEditFacebook(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>

                      {/* Website */}
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-700 mb-1 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-amber-500" />
                          <span>Website URL</span>
                        </label>
                        <input
                          type="text"
                          placeholder="https://zentapdigitalsolutions.com"
                          value={editWebsite}
                          onChange={(e) => setEditWebsite(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-700 mb-1 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-cyan-500" />
                          <span>Email Address</span>
                        </label>
                        <input
                          type="email"
                          placeholder="contact@zentapdigitalsolutions.com"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address & Studio Location */}
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-600" />
                        <span>Address &amp; Studio Location</span>
                      </label>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        *Powers Directions button and Location card
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                          Address Text (Pill display)
                        </label>
                        <input
                          type="text"
                          placeholder="Ahmedabad, Gujarat, India"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                          Google Maps URL (Directions Target)
                        </label>
                        <input
                          type="url"
                          placeholder="https://www.google.com/maps/place/..."
                          value={editMapsLink}
                          onChange={(e) => setEditMapsLink(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                          Studio Location Title
                        </label>
                        <input
                          type="text"
                          placeholder="Ahmedabad Central Hub"
                          value={editLocationTitle}
                          onChange={(e) => setEditLocationTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-medium text-zinc-700">
                            Studio Location Photo / Map URL
                          </label>
                          <button
                            type="button"
                            onClick={() => locationImgInputRef.current?.click()}
                            className="text-[10px] text-purple-600 hover:text-purple-700 font-bold cursor-pointer"
                          >
                            Upload Photo
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Image URL..."
                          value={editLocationImage}
                          onChange={(e) => setEditLocationImage(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* About Us & Opening Hours */}
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-3 shadow-2xs">
                    <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-600" />
                      <span>About Us &amp; Opening Hours</span>
                    </label>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                        About Us Description (Leave blank to hide section)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Welcome to our business! We take pride in delivering premier service..."
                        value={editAboutUs}
                        onChange={(e) => setEditAboutUs(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                        Opening Hours Matrix (One per line e.g. Monday – Saturday: 10:00 AM – 09:00 PM)
                      </label>
                      <textarea
                        rows={2}
                        placeholder={"Monday – Saturday: 10:00 AM – 09:00 PM\nSunday: 11:00 AM – 06:00 PM"}
                        value={editOpeningHours}
                        onChange={(e) => setEditOpeningHours(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Review Modal Tags & FAQs */}
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-3 shadow-2xs">
                    <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Google Review Modal Tags &amp; FAQs</span>
                    </label>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                        &quot;What Stood Out?&quot; Tag Chips (Comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="Cleanliness, Nice Staff, Fast Service, Great Ambience..."
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                    </div>

                    {/* FAQs Manager */}
                    <div className="space-y-2 pt-1 border-t border-zinc-100">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-zinc-800">
                          Frequently Asked Questions ({editFaqs.length})
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditFaqs((prev) => [...prev, { question: "", answer: "" }])}
                          className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Question</span>
                        </button>
                      </div>

                      {editFaqs.map((faq, fIdx) => (
                        <div key={fIdx} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5 relative">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Q{fIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => setEditFaqs((prev) => prev.filter((_, i) => i !== fIdx))}
                              className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Question (e.g. Do you offer parking?)"
                            value={faq.question}
                            onChange={(e) => {
                              const updated = [...editFaqs];
                              updated[fIdx].question = e.target.value;
                              setEditFaqs(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none"
                          />
                          <textarea
                            rows={2}
                            placeholder="Answer text..."
                            value={faq.answer}
                            onChange={(e) => {
                              const updated = [...editFaqs];
                              updated[fIdx].answer = e.target.value;
                              setEditFaqs(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-zinc-200">
                    <a
                      href={editTagLink || `${DOMAIN_BASE}/t/${activeItem.tag_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tactile-btn inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold border border-zinc-300 transition-transform active:scale-[0.978]"
                    >
                      <Eye className="w-3.5 h-3.5 text-zinc-600" />
                      <span>Live Preview Standee ({activeItem.tag_id})</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveItem(null)}
                        disabled={isSubmitting}
                        className="px-4 py-2.5 rounded-xl bg-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="tactile-btn flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSubmitting ? "Saving..." : "Save & Publish Live"}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Live Interactive Phone Mockup (5 Cols) with Instant Theme & Field Reflection */}
              {(() => {
                const hasQuickActions = !!(editPhone.trim() || editMapsLink.trim() || editAddress.trim());
                const hasSocials = !!(
                  editWhatsapp.trim() || 
                  editInstagram.trim() || 
                  editPhone.trim() || 
                  editFacebook.trim() || 
                  editWebsite.trim() || 
                  editEmail.trim()
                );

                return (
                  <div className="lg:col-span-5 p-6 bg-[#07090e] flex flex-col items-center justify-center overflow-y-auto">
                    <div 
                      className="w-[290px] max-h-[700px] overflow-y-auto bg-[#0B0F17] rounded-[36px] border-[5px] border-zinc-800 shadow-2xl flex flex-col relative transition-all duration-200 select-none pb-4"
                      style={{
                        fontFamily: "'Outfit', sans-serif"
                      }}
                    >
                      {/* Ambient Mesh Glows in Phone */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute top-44 -left-10 w-28 h-28 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

                      {/* Notch */}
                      <div className="h-4.5 bg-[#0B0F17] flex justify-center items-center relative z-20 shrink-0 sticky top-0">
                        <div className="w-16 h-2 bg-zinc-900 rounded-full" />
                      </div>

                      <div className="px-3 pt-2 space-y-2.5 relative z-10">
                        {/* Profile & NFC Hero Card */}
                        <div className="relative overflow-hidden rounded-xl bg-[#121824] p-3 shadow-md border border-white/5 space-y-2">
                          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-80" />
                          
                          <div className="flex items-center gap-2.5">
                            <div className="relative shrink-0 w-11 h-11 rounded-lg bg-[#121824] p-0.5 shadow border border-amber-500/20 flex items-center justify-center">
                              <img 
                                src={editLogoUrl || "/logo.png"} 
                                alt="Logo" 
                                className="w-full h-full object-contain rounded-md"
                                onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }}
                              />
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                                <Check className="w-2 h-2 text-black font-black stroke-[3]" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-xs text-[#F8FAFC] leading-snug truncate">
                                {editTitle || "Business Name"}
                              </h4>
                              {editSubtitle && (
                                <p className="text-[10px] text-[#94A3B8] truncate">{editSubtitle}</p>
                              )}
                              {editAddress && (
                                <p className="text-[9px] text-[#ffb95f] truncate flex items-center gap-0.5 mt-0.5">
                                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                                  <span>{editAddress}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions (Call / Directions) */}
                          {hasQuickActions && (
                            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                              {editPhone.trim() && (
                                <div className="py-1 px-2 rounded-lg bg-[#1B2232] text-[9px] font-bold text-[#F8FAFC] flex items-center justify-center gap-1 border border-white/5">
                                  <Phone className="w-2.5 h-2.5 text-[#ffc174]" />
                                  <span>Call Us</span>
                                </div>
                              )}
                              {(editMapsLink.trim() || editAddress.trim()) && (
                                <div className="py-1 px-2 rounded-lg bg-[#1B2232] text-[9px] font-bold text-[#F8FAFC] flex items-center justify-center gap-1 border border-white/5">
                                  <Navigation className="w-2.5 h-2.5 text-[#4cd7f6]" />
                                  <span>Directions</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Loved your visit? Banner */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#121824] via-[#1c2230] to-[#121824] p-3 shadow border border-white/5 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-[#ffc174] fill-[#ffc174]" />
                              <span className="text-xs font-bold text-[#F8FAFC]">Loved your visit?</span>
                            </div>
                            <p className="text-[9px] text-[#94A3B8] mt-0.5">{editCtaText || "Tap to write a rapid 5-Star Review"}</p>
                            <div className="flex items-center gap-0.5 mt-1 text-[#ffc174]">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className="w-2.5 h-2.5 fill-[#ffc174] text-[#ffc174]" />
                              ))}
                              <span className="text-[9px] text-[#ffb95f] ml-1 font-bold">5.0</span>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-[#f59e0b] flex items-center justify-center shrink-0 shadow">
                            <Star className="w-4 h-4 fill-black text-black" />
                          </div>
                        </div>

                        {/* Connect & Social Channels (Live conditional hiding of blanks!) */}
                        {hasSocials && (
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-[#94A3B8] tracking-wider block px-1">
                              Connect Channels
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {editWhatsapp.trim() && (
                                <div className="p-2 rounded-lg bg-[#121824] border border-white/5 flex items-center gap-1.5">
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span className="text-[10px] font-bold text-[#F8FAFC] truncate">WhatsApp</span>
                                </div>
                              )}
                              {editInstagram.trim() && (
                                <div className="p-2 rounded-lg bg-[#121824] border border-white/5 flex items-center gap-1.5">
                                  <Instagram className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                                  <span className="text-[10px] font-bold text-[#F8FAFC] truncate">Instagram</span>
                                </div>
                              )}
                              {editPhone.trim() && (
                                <div className="p-2 rounded-lg bg-[#121824] border border-white/5 flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                  <span className="text-[10px] font-bold text-[#F8FAFC] truncate">Call Office</span>
                                </div>
                              )}
                              {editFacebook.trim() && (
                                <div className="p-2 rounded-lg bg-[#121824] border border-white/5 flex items-center gap-1.5">
                                  <Facebook className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                  <span className="text-[10px] font-bold text-[#F8FAFC] truncate">Facebook</span>
                                </div>
                              )}
                              {editWebsite.trim() && (
                                <div className="p-2 rounded-lg bg-[#121824] border border-white/5 flex items-center gap-1.5">
                                  <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span className="text-[10px] font-bold text-[#F8FAFC] truncate">Website</span>
                                </div>
                              )}
                              {editEmail.trim() && (
                                <div className="p-2 rounded-lg bg-[#121824] border border-white/5 flex items-center gap-1.5">
                                  <Mail className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                                  <span className="text-[10px] font-bold text-[#F8FAFC] truncate">Email</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* About Us (Only if not blank) */}
                        {editAboutUs.trim() && (
                          <div className="p-2.5 rounded-xl bg-[#121824] border border-white/5 space-y-1">
                            <span className="text-[10px] font-bold text-[#F8FAFC] flex items-center gap-1">
                              <Info className="w-3 h-3 text-[#ffc174]" />
                              <span>About Us</span>
                            </span>
                            <p className="text-[9px] text-[#dfe2ee] leading-relaxed line-clamp-2">{editAboutUs}</p>
                          </div>
                        )}

                        {/* Opening Hours (Only if not blank) */}
                        {editOpeningHours.trim() && (
                          <div className="p-2.5 rounded-xl bg-[#121824] border border-white/5 space-y-1">
                            <span className="text-[10px] font-bold text-[#F8FAFC] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#4cd7f6]" />
                              <span>Opening Hours</span>
                            </span>
                            <div className="text-[9px] text-[#ffddb8] font-mono leading-tight">
                              {editOpeningHours.split("\n").slice(0, 2).map((l, i) => (
                                <p key={i} className="truncate">{l}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* FAQs (Only if not blank) */}
                        {editFaqs.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-[#121824] border border-white/5 space-y-1">
                            <span className="text-[10px] font-bold text-[#F8FAFC] flex items-center gap-1">
                              <HelpCircle className="w-3 h-3 text-[#c7c8ff]" />
                              <span>FAQs ({editFaqs.length})</span>
                            </span>
                            <div className="p-1.5 rounded-lg bg-[#1B2232] text-[9px] text-[#F8FAFC] font-medium truncate">
                              {editFaqs[0].question || "Sample Question"}
                            </div>
                          </div>
                        )}

                        {/* Location Card (Only if not blank) */}
                        {(editAddress.trim() || editLocationImage.trim()) && (
                          <div className="rounded-xl overflow-hidden relative h-20 bg-zinc-800 flex items-end p-2 border border-white/5">
                            <img 
                              src={editLocationImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuBntBRRtvFsUDBYuSpyCqOKOrww8i3Jra2cvrOlya4dusW8PVtI8vY7kNlQT6oWsIbi_RxEvnxmKef0KVtOB85lYnw8jONF_Iq3ZThxyxk6mZACXbKDiXpMZyAsooT3GYU_dpN4F5OQ6bwFzaHC988imjfe9wnu2h5NOQPefD_KjMN5mLgmOXi2e77FzabIrI3F4X9mEWZg-Dd5qiEghoie3wXTVnHyKlrg9B18etzc"}
                              alt="Location"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="relative z-10 flex items-center justify-between w-full">
                              <span className="text-[9px] font-bold text-white truncate flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 text-amber-400" />
                                <span>{editLocationTitle || editAddress || "Location"}</span>
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full bg-[#1B2232] text-[8px] font-bold text-white border border-white/10">
                                NFC Station
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Home Bar */}
                      <div className="py-2 flex justify-center relative z-10 mt-auto">
                        <div className="w-16 h-1 bg-zinc-700 rounded-full" />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QR CODE PREVIEW & DOWNLOAD                                         */}
      {/* ========================================================================= */}
      {qrModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="text-left">
                <h3 className="font-bold text-base text-zinc-900">{qrModalItem.tag_id} Page QR</h3>
                <p className="text-[11px] text-zinc-500">{qrModalItem.business_name}</p>
              </div>
              <button
                onClick={() => setQrModalItem(null)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`QR for ${qrModalItem.tag_id}`} className="w-56 h-56 rounded-lg shadow-xs" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-zinc-400">
                  Generating high-res QR...
                </div>
              )}
              <span className="font-mono text-xs font-bold text-zinc-700 mt-3">
                {qrModalItem.link_url?.includes("/t/") ? qrModalItem.link_url : `${DOMAIN_BASE}/t/${qrModalItem.tag_id}`}
              </span>
            </div>

            <button
              onClick={() => handleDownloadQr(qrModalItem)}
              className="tactile-btn w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Page QR PNG</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
