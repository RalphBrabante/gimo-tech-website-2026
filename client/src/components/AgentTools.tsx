'use client';

import { useEffect } from 'react';

interface ProductFacts { name: string; url: string; summary: string; specs?: { label: string; value: string }[] }
interface AgentToolsProps {
  business: { name: string; alternateName: string; email: string; address: string; lazadaShop: string; shopeeShop: string };
  products: ProductFacts[];
}

interface ModelContextTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<{ content: { type: 'text'; text: string }[] }>;
}
interface ModelContext { registerTool(tool: ModelContextTool): unknown; unregisterTool?(name: string): unknown }

const text = (value: unknown) => ({ content: [{ type: 'text' as const, text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] });

/**
 * WebMCP: exposes read-only tools to in-browser AI agents (navigator.modelContext) on page load.
 * Nothing is sent anywhere: the quotation tool only prepares an email for the visitor to send.
 * Browsers without WebMCP support are unaffected.
 */
export function AgentTools({ business, products }: AgentToolsProps) {
  useEffect(() => {
    const modelContext = (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
    if (!modelContext?.registerTool) return;
    const tools: ModelContextTool[] = [
      {
        name: 'get_gimo_product_info',
        description: `Product ranges, verified specifications and contact/ordering details for ${business.name} (${business.alternateName}), a laboratory supplier in the Philippines. Nylon syringe filter prices are published; other items are quote-only.`,
        inputSchema: { type: 'object', properties: { product: { type: 'string', description: 'Optional product name to filter by, e.g. "nylon syringe filter".' } } },
        async execute(input) {
          const query = String(input.product ?? '').toLowerCase();
          const matches = query ? products.filter((p) => p.name.toLowerCase().includes(query) || query.split(/\s+/).every((w) => p.name.toLowerCase().includes(w))) : products;
          return text({ business: { ...business, pricing: 'Nylon syringe filter prices are listed in its specs (VAT excluded, delivery quoted separately). Other products are quote-only: pricing, availability and delivery are confirmed by email.' }, products: matches.length ? matches : products });
        }
      },
      {
        name: 'prepare_gimo_quotation_email',
        description: 'Prepare (not send) a quotation request email for 25mm 0.45 micron nylon syringe filters (non-sterile canisters of 100, or single pieces). Returns a mailto link and message text for the user to review and send.',
        inputSchema: {
          type: 'object',
          properties: {
            pack: { type: 'string', enum: ['canister', 'single'], description: 'canister = canister of 100 filters (default); single = single pieces.' },
            quantity: { type: 'integer', minimum: 1, description: 'Number of canisters of 100, or of single pieces when pack is "single".' },
            name: { type: 'string', description: 'Requester full name.' },
            email: { type: 'string', description: 'Requester email address for the reply.' },
            company: { type: 'string', description: 'Company or laboratory (optional).' },
            deliveryLocation: { type: 'string', description: 'Delivery city or province in the Philippines (optional).' },
            notes: { type: 'string', description: 'Method, solvent or other requirements (optional).' }
          },
          required: ['quantity', 'name', 'email']
        },
        async execute(input) {
          const quantity = Number(input.quantity);
          if (!Number.isInteger(quantity) || quantity < 1) return text('quantity must be a whole number (1 or more).');
          const single = input.pack === 'single';
          const product = `Nylon Syringe Filter 25mm 0.45µm (non-sterile, ${single ? 'single pieces' : '100-piece canister'})`;
          const subject = `Quotation request: ${product}`;
          const body = [
            'Hello Gimo Tech Supplies,', '',
            `Please send a quotation for: ${product}`,
            `Quantity: ${quantity} × ${single ? 'single pieces' : 'canisters of 100'}`,
            input.deliveryLocation ? `Delivery city/province: ${input.deliveryLocation}` : '',
            input.notes ? `Requirements: ${input.notes}` : '', '',
            `Name: ${input.name}`, input.company ? `Company/laboratory: ${input.company}` : '', `Email: ${input.email}`
          ].filter((line, i, all) => line !== '' || (all[i - 1] !== '' && i > 0)).join('\n');
          return text({ to: business.email, subject, body, mailto: `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, note: 'Nothing has been sent. Open the mailto link or send the text to the address above.' });
        }
      }
    ];
    for (const tool of tools) { try { modelContext.registerTool(tool); } catch { /* Tool already registered or API changed. */ } }
    return () => { for (const tool of tools) { try { modelContext.unregisterTool?.(tool.name); } catch { /* ignore */ } } };
  }, [business, products]);
  return null;
}
