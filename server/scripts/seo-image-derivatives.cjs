// Offline operator tool; originals stay untouched. Default is a dry run.
const fs=require('node:fs/promises');
const path=require('node:path');
const {createThumbnail}=require('../dist/media/public-image');
async function run(){
 const root=path.resolve(process.argv[2] || 'uploads/products');const apply=process.argv.includes('--apply');
 for(const name of await fs.readdir(root)){
  if(!/\.(?:jpe?g|png|webp|avif)$/i.test(name)||name.endsWith('.thumb.webp'))continue;
  const file=path.join(root,name);try{await fs.access(file+'.thumb.webp');continue;}catch{}
  console.log(`${apply?'CREATE':'WOULD CREATE'} ${name}.thumb.webp`);if(apply)await createThumbnail(file);
 }
}
run().catch(e=>{console.error(e.message);process.exitCode=1});
