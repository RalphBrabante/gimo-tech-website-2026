import { NYLON_PATH } from '@/lib/site';
import { PRICE_SUMMARY } from '@/content/nylon';

/** Product ranges that have their own verified pages. */
export const RANGES = [
  { name: 'Nylon Syringe Filter 25mm 0.45µm', path: NYLON_PATH, text: `For HPLC sample preparation and general laboratory filtration: ${PRICE_SUMMARY}.` },
  { name: 'Syringe Filters for HPLC Sample Preparation', path: '/syringe-filters', text: 'Compare Nylon, PTFE, PVDF and MCE membranes in the common 25 mm format.' },
  { name: 'Sequential QR Code Labels', path: '/sequential-qr-code-labels', text: '30 × 20 mm adhesive labels with unique QR codes and sequential numbering for tracking and inventory.' },
  { name: 'Customized Biohazard Bags with QR Code Printing', path: '/biohazard-bags', text: 'Printed identifiers, series-based layouts and QR code attachments for laboratory waste workflows.' }
];
