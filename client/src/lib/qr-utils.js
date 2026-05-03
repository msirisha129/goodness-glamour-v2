import { z } from "zod";
export const qrDataSchema = z.object({
    url: z.string().url(),
    serviceId: z.string().optional().nullable(),
    source: z.string(),
    timestamp: z.string(),
});
/**
 * Generates QR code data for salon services
 */
export function generateQRData(options) {
    const baseUrl = window.location.origin;
    return {
        url: `${baseUrl}/ai-chat`,
        serviceId: options.serviceId || null,
        source: options.source || "website",
        timestamp: new Date().toISOString(),
    };
}
/**
 * Parses QR code data and validates format
 */
export function parseQRData(qrString) {
    try {
        const data = JSON.parse(qrString);
        const validatedData = qrDataSchema.parse(data);
        return validatedData;
    }
    catch (error) {
        console.error("Invalid QR data:", error);
        return null;
    }
}
/**
 * Creates a URL with QR parameters
 */
export function createQRUrl(qrData) {
    const url = new URL(qrData.url);
    if (qrData.serviceId) {
        url.searchParams.set("serviceId", qrData.serviceId);
    }
    url.searchParams.set("source", qrData.source);
    url.searchParams.set("timestamp", qrData.timestamp);
    return url.toString();
}
/**
 * Extracts QR parameters from current URL
 */
export function extractQRParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        serviceId: urlParams.get("serviceId"),
        source: urlParams.get("source") || undefined,
        timestamp: urlParams.get("timestamp") || undefined,
    };
}
/**
 * Generates QR code SVG (simple text-based placeholder)
 * In a real implementation, you would use a QR code library like qrcode
 */
export function generateQRCodeSVG(data, size = 200) {
    // This is a placeholder implementation
    // In production, use a proper QR code library
    const qrData = encodeURIComponent(data);
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="white" stroke="#000" stroke-width="2"/>
      <rect x="10" y="10" width="20" height="20" fill="black"/>
      <rect x="${size - 30}" y="10" width="20" height="20" fill="black"/>
      <rect x="10" y="${size - 30}" width="20" height="20" fill="black"/>
      <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="black">
        QR Code
      </text>
      <text x="${size / 2}" y="${size / 2 + 20}" text-anchor="middle" dominant-baseline="middle" font-size="8" fill="gray">
        Scan Me
      </text>
    </svg>
  `;
}
/**
 * Validates if a scanned QR code is from our salon
 */
export function isValidSalonQR(qrData) {
    const currentDomain = window.location.hostname;
    const qrDomain = new URL(qrData.url).hostname;
    // Check if the QR code is from the same domain or allowed domains
    const allowedDomains = [
        currentDomain,
        "localhost",
        ...(process.env.REPLIT_DOMAINS?.split(",") || [])
    ];
    return allowedDomains.includes(qrDomain);
}
/**
 * Creates a shareable QR code URL for social media or print
 */
export function createShareableQRUrl(serviceId) {
    const qrData = generateQRData({
        serviceId,
        source: "shared"
    });
    return createQRUrl(qrData);
}
/**
 * Formats QR data for display
 */
export function formatQRDataForDisplay(qrData) {
    if (qrData.serviceId) {
        return {
            title: "Service QR Code",
            description: `QR code for specific service (ID: ${qrData.serviceId})`,
            actionText: "Book This Service"
        };
    }
    return {
        title: "Salon QR Code",
        description: "General salon booking and AI assistant access",
        actionText: "Start Booking"
    };
}
