/**
 * Verified product configurations that have a dedicated landing page but no catalogue record.
 * They have no verified SKU, so enquiries are stored as quotation requests with productId 0 and
 * are priced manually in the internal Quotations screen.
 */
export const ENQUIRY_PRODUCTS: Record<string, { name: string; sku: string; unit: string; sourcePath: string }> = {
  'nylon-syringe-filter-25mm-045um': {
    name: 'Nylon Syringe Filter 25mm 0.45µm (non-sterile, 100-piece canister)',
    sku: 'SKU not assigned',
    unit: 'canister (100 pcs)',
    sourcePath: '/products/nylon-syringe-filter-25mm-045um'
  }
};
