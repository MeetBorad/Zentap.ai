/**
 * Google Maps Embed URL Helper
 * Converts any Google Maps URL (Place link, search query, coordinates, CID, or share link)
 * and address into an interactive, zero-API-key Google Maps iframe embed URL.
 */
export function getGoogleMapsEmbedUrl(
  mapsUrl?: string | null,
  address?: string | null,
  businessName?: string | null
): string {
  const cleanMap = (mapsUrl || "").trim();
  const cleanAddr = (address || "").trim();
  const cleanName = (businessName || "").trim();

  // 1. Direct Embed URL (e.g. https://www.google.com/maps/embed?pb=...)
  if (cleanMap.includes("/maps/embed") || cleanMap.includes("output=embed")) {
    return cleanMap;
  }

  // 2. Direct CID Link e.g. maps.google.com/?cid=123456789
  const cidMatch = cleanMap.match(/[?&]cid=([0-9]+)/i);
  if (cidMatch && cidMatch[1]) {
    return `https://maps.google.com/maps?cid=${cidMatch[1]}&output=embed`;
  }

  // 3. Place URL e.g. /maps/place/ZenTap+Digital+Solutions/@23.0225,72.5714...
  const placeMatch = cleanMap.match(/\/maps\/place\/([^/@?]+)/i);
  if (placeMatch && placeMatch[1]) {
    const placeQuery = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    return `https://maps.google.com/maps?q=${encodeURIComponent(placeQuery)}&hl=en&z=15&output=embed`;
  }

  // 4. Coordinates in URL e.g. /@23.0225,72.5714
  const coordsMatch = cleanMap.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordsMatch) {
    return `https://maps.google.com/maps?q=${coordsMatch[1]},${coordsMatch[2]}&hl=en&z=15&output=embed`;
  }

  // 5. Search query URL e.g. ?q=... or ?query=...
  const qMatch = cleanMap.match(/[?&](?:q|query)=([^&]+)/i);
  if (qMatch && qMatch[1]) {
    const qQuery = decodeURIComponent(qMatch[1].replace(/\+/g, " "));
    return `https://maps.google.com/maps?q=${encodeURIComponent(qQuery)}&hl=en&z=15&output=embed`;
  }

  // 6. If businessName and address are available, combine them for maximum Google Maps precision
  if (cleanName && cleanAddr) {
    const combined = cleanAddr.toLowerCase().includes(cleanName.toLowerCase())
      ? cleanAddr
      : `${cleanName}, ${cleanAddr}`;
    return `https://maps.google.com/maps?q=${encodeURIComponent(combined)}&hl=en&z=15&output=embed`;
  }

  // 7. Plain address fallback
  if (cleanAddr) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(cleanAddr)}&hl=en&z=15&output=embed`;
  }

  // 8. Plain business name fallback
  if (cleanName) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(cleanName)}&hl=en&z=15&output=embed`;
  }

  // 9. Default fallback
  return "https://maps.google.com/maps?q=Ahmedabad%2C%20Gujarat%2C%20India&output=embed";
}
