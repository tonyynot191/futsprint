// src/config/pricing.js
//
// ⚠️  PLACEHOLDER PRICING — NOT PRODUCTION RATES ⚠️
// Phase 6 replaces this with a server-side pricing engine.

export const PRINT_PRICING = {
  A4: { bw_single: 30, bw_double: 25, color_single: 100, color_double: 90 },
  A3: { bw_single: 60, bw_double: 55, color_single: 200, color_double: 180 },
  finishing: { none: 0, staple: 100, spiral: 500, hardcover: 1500 },
};

export const PHOTOCOPY_PRICING = {
  perPage: 25,
  finishing: { none: 0, staple: 100, spiral: 500, hardcover: 1500 },
};

export function estimatePrintCost({ paperSize, printType, sides, copies, pages, finishing = 'none' }) {
  const key = `${printType}_${sides}`;
  const rate = PRINT_PRICING[paperSize]?.[key] ?? 30;
  const finishingCost = PRINT_PRICING.finishing[finishing] ?? 0;
  return Math.round(rate * pages * copies + finishingCost * copies);
}

export function estimatePhotocopyCost({ estimatedPages, copies, bindingType }) {
  const pageRate = PHOTOCOPY_PRICING.perPage;
  const bindingCost = PHOTOCOPY_PRICING.finishing[bindingType] ?? 0;
  return (estimatedPages * pageRate + bindingCost) * copies;
}

// ---- Upload limits ----
export const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB per file
export const MAX_FILES_PER_ORDER = 10;

// File input `accept` attribute
export const ACCEPTED_UPLOAD_EXTENSIONS =
  '.pdf,' +
  '.doc,.docx,.odt,.rtf,.txt,' +
  '.ppt,.pptx,.odp,' +
  '.xls,.xlsx,.ods,' +
  '.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.tif,.heic,.heif';

// MIME allow-list for reference / error messages
export const ACCEPTED_UPLOAD_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'application/rtf',
  'text/rtf',
  'text/plain',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.spreadsheet',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/heic',
  'image/heif',
];

export const FRIENDLY_TYPE_LIST =
  'PDF, Word, PowerPoint, Excel, OpenDocument, RTF, text, JPG, PNG, WEBP, GIF, BMP, TIFF, HEIC';

// ---- Physical document photocopy ----
// Minimum gap between Course Rep receive date and return date (days)
export const COURSE_REP_MIN_GAP_DAYS = 2;

// Page count presets for physical documents
export const PAGE_ESTIMATE_PRESETS = [
  { id: 'under_50', label: 'Less than 50 pages', mid: 40 },
  { id: '50_100', label: '50 \u2013 100 pages', mid: 75 },
  { id: '100_250', label: '100 \u2013 250 pages', mid: 175 },
  { id: '250_500', label: '250 \u2013 500 pages', mid: 375 },
  { id: '500_1000', label: '500 \u2013 1,000 pages', mid: 750 },
  { id: 'over_1000', label: 'More than 1,000 pages', mid: 1200 },
];