const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function scan(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?scan(p):e.isFile()&&/\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(e.name)?[p]:[]})}
const tracks=scan(path.join(root,'assets/music')).sort().map(p=>({name:path.basename(p,path.extname(p)),url:'./'+path.relative(root,p).split(path.sep).map(encodeURIComponent).join('/')}));
fs.writeFileSync(path.join(root,'assets/music-catalog.js'),'window.activityMusicCatalog='+JSON.stringify(tracks)+';\n');
if(process.argv.includes('--stage')){const out=path.join(root,'_site');fs.mkdirSync(out,{recursive:true});for(const name of ['index.html','.nojekyll'])fs.copyFileSync(path.join(root,name),path.join(out,name));fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});}
console.log('Registered music tracks:',tracks.length);
