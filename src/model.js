const clean = v => String(v ?? '').replace(/[\r\n\[\]]/g, ' ').trim();
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
function validDate(v) { if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false; const d=new Date(v+'T12:00:00Z'); return !isNaN(d) && d.toISOString().slice(0,10)===v; }
function records(text) {
 const lines=text.split('\n'), out=[];
 for(let i=0;i<lines.length;i++) {
  if(!lines[i].startsWith('- **')) continue;
  const r={start:i}; for(const m of lines[i].matchAll(/\[(\w+)::\s*([^\]]*)\]/g)) r[m[1]]=m[2].trim();
  if(!r.id || !r.company || !r.role) continue;
  let end=i+1; while(end<lines.length && (/^\s/.test(lines[end]) || lines[end]==='')) end++;
  r.end=end; r.block=lines.slice(i,end);
  r.status=r.block.join('\n').match(/\[status::\s*([^\]]*)\]/)?.[1]?.trim() || 'Applied';
  r.deadline=r.block.join('\n').match(/\[deadline::\s*([^\]]*)\]/)?.[1]?.trim() || '';
  r.detail=lines[i].match(/\[detail::\s*\[\[([^\]]+)\]\]\]/)?.[1] || '';
  out.push(r);
 } return out;
}
function duplicate(text,r) {return records(text).some(x=>x.country===r.country && x.company.toLowerCase()===r.company.toLowerCase() && x.role.toLowerCase()===r.role.toLowerCase() && x.applied===r.applied);}
function add(text,r) {
 const prefix=`${r.country==='China'?'CN':r.country==='UK'?'UK':'OTHER'}-${r.applied.replaceAll('-','')}-`;
 const max=records(text).filter(x=>x.id.startsWith(prefix)).reduce((n,x)=>Math.max(n,Number(x.id.slice(prefix.length))||0),0);
 const id=prefix+String(max+1).padStart(2,'0');
 const keys=['country','company','role','type','sponsor','source','applied','track','priority','cv_version'];
 const meta=keys.filter(k=>r[k]).map(k=>`[${k}:: ${clean(r[k])}]`).join(' ');
 const entry=`- **${clean(r.company)} — ${clean(r.role)}** [id:: ${id}] ${meta}\n  - 🔄 [status:: ${clean(r.status)}]${r.deadline?` [deadline:: ${r.deadline}]`:''}\n  - Website：${clean(r.website)}\n  - JD：\n  - Requirements：\n  - 流程：\n    - ${today()} Created (${clean(r.status)})\n`;
 return {id,text:text.trimEnd()+'\n\n'+entry};
}
function update(text,id,status,deadline,note,detail) {
 const r=records(text).find(x=>x.id===id); if(!r) throw Error('Application no longer exists.');
 const lines=text.split('\n'), block=[...r.block];
 const statusLine=`  - 🔄 [status:: ${clean(status)}]${deadline?` [deadline:: ${deadline}]`:''}`;
 const pos=block.findIndex(x=>/^  - .*\[status::/.test(x)); if(pos<0) block.splice(1,0,statusLine); else block[pos]=statusLine;
 let p=block.findIndex(x=>/^  - (流程：|History:)/.test(x));
 if(p<0) {block.push('  - 流程：');p=block.length-1;}
 block.splice(p+1,0,`    - ${today()} ${clean(status)}${deadline?` (deadline: ${deadline})`:''}${note?` | ${clean(note)}`:''}`);
 if(detail) block[0]=block[0].replace(/\s*\[detail::\s*\[\[[^\]]+\]\]\]/,'')+` [detail:: [[${detail}]]]`;
 lines.splice(r.start,r.end-r.start,...block); return lines.join('\n');
}
function createDraft(market) {return {country:market,region:'',company:'',role:'',type:'',sponsor:market==='UK'?'Unknown':'',source:'',applied:today(),status:'Applied',deadline:'',website:'',track:'',priority:'Medium',cv_version:'',detail:false,summary:'',requirements:''};}
function marketSubmission(market,draft) {
 const result={...draft,country:market};
 if(market==='Other'){result.country=clean(draft.region);if(!result.country)throw Error('Enter a country or region for Other.');if(['uk','china'].includes(result.country.toLowerCase()))throw Error('Use the UK or China tab for this market.');}
 if(market!=='UK')delete result.sponsor;
 delete result.region;return result;
}
module.exports={clean,today,validDate,records,duplicate,add,update,createDraft,marketSubmission};
