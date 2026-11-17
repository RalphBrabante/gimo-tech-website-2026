/**
 * Verified facts only (owner-confirmed configuration): nylon membrane, 25 mm diameter, 0.45 µm
 * pore size, non-sterile canister of 100 pieces. Housing, connectors, SKU, operating limits,
 * manufacturer and price are NOT verified and must not be stated or put in structured data.
 * The visible FAQ and the FAQPage structured data are generated from the same array.
 */
export const NYLON = {
  name: 'Nylon Syringe Filter 25mm 0.45µm',
  shortName: 'Nylon Syringe Filter',
  title: 'Nylon Syringe Filter Philippines | 0.45 Micron 25mm Supplier',
  description: 'Buy 0.45 micron nylon syringe filters (25mm) in the Philippines from GIMO, a laboratory syringe filter supplier. For HPLC sample prep. Request a quote.',
  imageAlt: '25mm 0.45 micron non-sterile nylon syringe filter canister supplied by GIMO Laboratory Supplies Philippines'
};

export const NYLON_HIGHLIGHTS = [
  { value: '25', unit: 'mm', label: 'Filter diameter' },
  { value: '0.45', unit: 'µm', label: 'Pore size (0.45 micron)' },
  { value: 'Nylon', unit: '', label: 'Membrane' },
  { value: '100', unit: 'pcs', label: 'Per non-sterile canister' }
];

export const NYLON_STORY = [
  { title: '25 mm diameter', body: 'A common laboratory syringe filter format for routine sample preparation.' },
  { title: 'Nylon membrane', body: 'Catalogued for general aqueous and mixed sample-preparation workflows.' },
  { title: '0.45 µm pore size', body: 'Removes particulates above the 0.45 micron rating before analysis.' },
  { title: '100 per canister', body: 'Non-sterile canister packs for routine and repeat laboratory use.' }
];

export const NYLON_SPECS: { label: string; value: string }[] = [
  { label: 'Membrane', value: 'Nylon' },
  { label: 'Filter diameter', value: '25 mm' },
  { label: 'Pore size', value: '0.45 µm (0.45 micron)' },
  { label: 'Packaging', value: 'Non-sterile canister, 100 pieces' },
  { label: 'Sterile packaging', value: 'Not part of this listing. Ask GIMO to confirm availability before ordering.' },
  { label: 'Housing, connectors, SKU and operating limits', value: 'Not yet verified in the catalogue. Request the applicable manufacturer specification with your quotation.' }
];

export const NYLON_FAQS = [
  {
    question: 'Where can I buy nylon syringe filters in the Philippines?',
    answer: 'You can buy 25mm 0.45 micron nylon syringe filters from GIMO Laboratory Supplies (Gimo Tech Supplies), a laboratory supplier based in San Pedro, Laguna. Request a quotation on this page for canister quantities, or order online through the official GIMO Laboratory Supplies Lazada and Shopee shops.'
  },
  {
    question: 'What is a 0.45 micron nylon syringe filter used for?',
    answer: 'It is supplied for HPLC sample preparation, removing particulates from samples before analysis, and general laboratory filtration. Suitability still depends on the sample, solvent system, and validated laboratory method.'
  },
  {
    question: 'Do you supply 0.22 micron nylon syringe filters?',
    answer: 'This page covers the 0.45 µm (0.45 micron) nylon syringe filter that GIMO supplies. If your method specifies a 0.22 µm membrane, include that in your enquiry and the supply team will tell you what can be provided instead of assuming availability. The 0.22 vs 0.45 micron syringe filter guide on this site explains how the two pore sizes differ.'
  },
  {
    question: 'Is this nylon syringe filter sterile?',
    answer: 'The pictured 100-piece canister is labeled non-sterile. Ask GIMO Laboratory Supplies to confirm whether a sterile configuration is available for your required quantity.'
  },
  {
    question: 'How many filters are in a pack?',
    answer: 'The verified non-sterile canister shown on this page contains 100 pieces. Single pieces are sold separately on Lazada and Shopee; other packaging configurations must be confirmed when requesting a quotation.'
  },
  {
    question: 'Can my company or laboratory request a formal quotation?',
    answer: 'Yes. Purchasing departments, schools, universities, clinics and industrial laboratories can request a quotation with the required quantity and delivery destination. Pricing, availability and delivery terms are confirmed by email.'
  },
  {
    question: 'Can GIMO deliver syringe filters outside Metro Manila?',
    answer: 'GIMO coordinates delivery enquiries throughout the Philippines. The destination, courier options, lead time, and charges are confirmed with the quotation or order.'
  },
  {
    question: 'How do I check chemical compatibility?',
    answer: 'Provide the complete sample and solvent composition before ordering. GIMO can help compare membrane options, but the laboratory remains responsible for confirming compatibility against the manufacturer documentation and its validated method.'
  }
];

export const MEMBRANES = [
  { key: 'nylon', name: 'Nylon', color: '#f5b800', role: 'General sample preparation', fit: 'General aqueous and mixed sample preparation', check: 'Confirm compatibility with the entire formulation' },
  { key: 'ptfe', name: 'PTFE', color: '#22c7c4', role: 'Solvent review', fit: 'Stronger-solvent workflows', check: 'Confirm the supplied format suits the sample system' },
  { key: 'pvdf', name: 'PVDF', color: '#087bdd', role: 'Low binding', fit: 'Methods seeking a low-binding option', check: 'Verify analyte recovery and chemical compatibility' },
  { key: 'mce', name: 'MCE', color: '#8ba5b7', role: 'Clarification', fit: 'General sample clarification', check: 'Verify method, sample, and solvent suitability' }
];
