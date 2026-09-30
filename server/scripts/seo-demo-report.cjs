// Input: authorized, local product export including images and edit ownership.
// Read-only: never connects to a database or changes a record.
const fs=require('node:fs');
const {isUnchangedDemo}=require('../dist/products/demo-products');
if(!process.argv[2]){console.error('Usage: node server/scripts/seo-demo-report.cjs /path/to/authorized-product-export.json');process.exit(1);}
const records=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
console.log(JSON.stringify({timestamp:new Date().toISOString(),mode:'dry-run',records:records.map(p=>({id:p.id,sku:p.sku,classification:isUnchangedDemo(p)?'unchanged-demo-hidden-from-public':'preserved',hasRequiredEvidence:['images','createdByUserId','updatedByUserId'].every(k=>Object.hasOwn(p,k))}))},null,2));
