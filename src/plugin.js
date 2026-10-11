const {Plugin, Modal, Setting, Notice, TFile, TFolder, ItemView, PluginSettingTab, normalizePath}=require('obsidian');
const model=require('./model');
const i18n=require('./i18n');
const VIEW='dgracy-application-flow-dashboard';
const STATUSES=['Applied','Online Test','Interview 1','Interview 2','Interview 3','Offer','Rejected','Withdrawn'];
const DEFAULTS={language:'en',database:'03 Work/Application Database.md',details:'03 Work/Job Search/01 Applications'};
class Form extends Modal {
 constructor(plugin,record=null) {
  super(plugin.app);this.plugin=plugin;this.record=record;this.market='UK';this.expanded={UK:false,China:false,Other:false};
  this.drafts=Object.fromEntries(['UK','China','Other'].map(m=>[m,model.createDraft(m)]));
  this.updateDraft=record?{status:record.status,deadline:record.deadline,note:'',detail:false}:null;
  this.previous=[];this.closed=false;
 }
 onOpen() {
  this.render();
  void this.plugin.readDatabase().then(text=>{this.previous=model.records(text);this.populateSuggestions();}).catch(()=>{});
 }
 populateSuggestions(){
  if(this.closed)return;
  for(const {list,key,defaults} of this.suggestions||[]){
   list.empty();const values=[...new Set([...defaults,...this.previous.filter(r=>r.country===this.market || (this.market==='Other'&&!['UK','China'].includes(r.country))).map(r=>r[key]).filter(Boolean)])];
   for(const value of values)list.createEl('option',{value});
  }
 }
 render() {
  const c=this.contentEl;c.empty();c.addClass('jat-form');this.suggestions=[];
  c.createEl('h2',{text:this.record?this.plugin.t('Update application'):this.plugin.t('Add application')});
  const r=this.record;const data=r?this.updateDraft:this.drafts[this.market];
  if(!r){
   const tabs=c.createDiv({cls:'jat-market-tabs'});tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label',this.plugin.t('Application market'));
   for(const market of ['UK','China','Other']){const button=tabs.createEl('button',{text:this.plugin.t(market),cls:market===this.market?'jat-market-active':''});button.setAttribute('role','tab');button.setAttribute('aria-selected',String(market===this.market));button.addEventListener('click',()=>{this.market=market;this.render();});}
   c.createEl('p',{text:this.plugin.t('Each market keeps its own draft while this form is open.'),cls:'jat-hint'});
  }
  const text=(parent,key,label,area=false)=>{const setting=new Setting(parent).setName(label);const configure=t=>t.setValue(data[key]||'').onChange(v=>data[key]=v);if(area)setting.addTextArea(configure);else setting.addText(configure);};
  const pick=(parent,key,label,options)=>new Setting(parent).setName(label).addDropdown(d=>{options.forEach(o=>d.addOption(o,this.plugin.t(o)));d.setValue(data[key]).onChange(v=>data[key]=v);});
  const suggest=(parent,key,label,defaults)=>{
   const listId='jat-'+key+'-'+Math.random().toString(36).slice(2);
   new Setting(parent).setName(label).setDesc(this.plugin.t('Type any value, or choose a suggestion.')).addText(t=>{t.setValue(data[key]||'').onChange(v=>data[key]=v);t.inputEl.setAttribute('list',listId);});
   const list=parent.createEl('datalist');list.id=listId;this.suggestions.push({list,key,defaults});
  };
  if(!r){
   if(this.market==='Other')text(c,'region',this.plugin.t('Country / region *'));
   text(c,'company',this.plugin.t('Company *'));text(c,'role',this.plugin.t('Role *'));text(c,'applied',this.plugin.t('Applied date (YYYY-MM-DD) *'));
  }
  pick(c,'status',this.plugin.t('Recruitment stage'),STATUSES);text(c,'deadline',this.plugin.t('Deadline (YYYY-MM-DD, optional)'));if(r)text(c,'note',this.plugin.t('History note'));
  if(!r){
   const more=c.createEl('details',{cls:'jat-more'});more.open=this.expanded[this.market];more.createEl('summary',{text:this.plugin.t('More information (optional)')});more.addEventListener('toggle',()=>{this.expanded[this.market]=more.open;});
   const types=this.market==='UK'?['Graduate Scheme','Full-time','Internship','Part-time']:this.market==='China'?['秋招','春招','日常实习','暑期实习','全职','兼职']:[];
   const sources=this.market==='UK'?['LinkedIn','Company Website','targetjobs','UCL Careers','Indeed','Referral']:this.market==='China'?['公司官网','Boss直聘','牛客','智联招聘','内推','LinkedIn']:[];
   suggest(more,'type',this.plugin.t('Role type'),types);
   if(this.market==='UK')pick(more,'sponsor',this.plugin.t('Visa sponsorship'),['Unknown','Yes','No']);
   suggest(more,'source',this.plugin.t('Application source'),sources);text(more,'website',this.plugin.t('Job URL'));suggest(more,'track',this.plugin.t('Career track'),['Data / Analytics','Product','Technology','Finance / M&A','Strategy','Operations']);pick(more,'priority',this.plugin.t('Priority'),['High','Medium','Low']);suggest(more,'cv_version',this.plugin.t('CV version'),[]);
  }
  const preparation=c.createDiv();
  new Setting(preparation).setName(r?this.plugin.t('Create preparation note if no valid note exists'):this.plugin.t('Create preparation note')).setDesc(this.plugin.t('Enable to save a job description and requirements with your preparation notes.')).addToggle(t=>t.setValue(data.detail).onChange(v=>{data.detail=v;fields.hidden=!v;}));
  const fields=preparation.createDiv({cls:'jat-preparation'});fields.hidden=!data.detail;
  if(!r){text(fields,'summary',this.plugin.t('Job description / summary'),true);text(fields,'requirements',this.plugin.t('Requirements'),true);}
  const error=c.createEl('p',{cls:'jat-error'});
  new Setting(c).addButton(b=>b.setButtonText(this.plugin.t('Cancel')).onClick(()=>this.close())).addButton(b=>b.setButtonText(this.plugin.t('Save')).setCta().onClick(async()=>{
   b.setDisabled(true);try {
    const submission=r?{...data}:model.marketSubmission(this.market,data);
    if(!r && (!model.clean(submission.company)||!model.clean(submission.role)||!model.validDate(submission.applied)))throw Error(this.plugin.t('Enter a company, role, and valid applied date.'));
    if(submission.deadline && !model.validDate(submission.deadline))throw Error(this.plugin.t('Enter a valid deadline or leave it blank.'));
    await this.plugin.saveApplication(r,submission);this.close();new Notice(this.plugin.t('Application saved.'));
   }catch(e){error.setText(this.plugin.t(e.message));b.setDisabled(false);}
  }));
  this.populateSuggestions();
 }
 onClose(){this.closed=true;this.contentEl.empty();}
}
class Dashboard extends ItemView {
 constructor(leaf,plugin){super(leaf);this.plugin=plugin;this.market='All';this.query='';}
 getViewType(){return VIEW;}getDisplayText(){return this.plugin.t('Job applications');}getIcon(){return 'briefcase';}
 async onOpen(){await this.render();}
 async render(){
  const c=this.contentEl;c.empty();c.addClass('jat-dashboard');c.createEl('h2',{text:this.plugin.t('Job applications')});
  new Setting(c).addButton(b=>b.setButtonText(this.plugin.t('Add application')).setCta().onClick(()=>new Form(this.plugin).open())).addButton(b=>b.setButtonText(this.plugin.t('Refresh')).onClick(()=>this.render())).addDropdown(d=>{['All','UK','China','Other'].forEach(v=>d.addOption(v,this.plugin.t(v)));d.setValue(this.market).onChange(v=>{this.market=v;void this.render();});}).addText(t=>t.setPlaceholder(this.plugin.t('Search company or role')).setValue(this.query).onChange(v=>{this.query=v;void this.renderRows();}));
  this.rowsEl=c.createDiv();await this.renderRows();
 }
 async renderRows(){
  const target=this.rowsEl;try{
   const all=model.records(await this.plugin.readDatabase());if(this.rowsEl!==target)return;
   target.empty();const rows=all.filter(r=>(this.market==='All'||r.country===this.market||(this.market==='Other'&&!['UK','China'].includes(r.country)))&&`${r.company} ${r.role}`.toLowerCase().includes(this.query.toLowerCase()));
   target.createEl('p',{text:i18n.counts(this.plugin.settings.language,rows.length,all.filter(r=>r.status==='Offer').length)});
   if(!rows.length){target.createEl('p',{text:this.plugin.t('No matching applications. Add your first application or select an existing database in settings.')});return;}
   const wrap=target.createDiv({cls:'jat-table-wrap'}),table=wrap.createEl('table');const head=table.createEl('thead').createEl('tr');[this.plugin.t('Company / role'),this.plugin.t('Market'),this.plugin.t('Stage'),this.plugin.t('Deadline'),this.plugin.t('Actions')].forEach(t=>head.createEl('th',{text:t}));const body=table.createEl('tbody');
   rows.forEach(r=>{const tr=body.createEl('tr');tr.createEl('td',{text:`${r.company} — ${r.role}`});tr.createEl('td',{text:this.plugin.t(r.country||'')});tr.createEl('td',{text:this.plugin.t(r.status)});tr.createEl('td',{text:r.deadline||'—'});const actions=tr.createEl('td');const b=actions.createEl('button',{text:this.plugin.t('Update')});this.registerDomEvent(b,'click',()=>new Form(this.plugin,r).open());if(r.detail){const n=actions.createEl('button',{text:this.plugin.t('Notes')});this.registerDomEvent(n,'click',()=>{void this.app.workspace.openLinkText(r.detail,this.plugin.settings.database);});}});
  }catch(e){target.empty();target.createEl('p',{text:this.plugin.t(e.message)});}
 }
}
function vaultPath(value,markdown=false){const raw=String(value||'').trim();if(!raw||raw.startsWith('/')||raw.includes('\\')||raw.split('/').some(p=>p==='..'||p==='.')||/[\[\]|#^:*?"<>]/.test(raw))throw Error('Use a relative vault path without special characters.');const p=normalizePath(raw);if(markdown&&!p.endsWith('.md'))throw Error('Database path must end in .md.');return p;}
class TrackerSettings extends PluginSettingTab {
 constructor(app,plugin){super(app,plugin);this.plugin=plugin;}
 display(){const c=this.containerEl;c.empty();c.createEl('h2',{text:'Application Flow'});c.createEl('p',{text:this.plugin.t('Existing Markdown records are retained. Changing paths does not move files.')});
  new Setting(c).setName(this.plugin.t('Interface language')).setDesc(this.plugin.t('Choose the language used by forms, dashboards, and messages.')).addDropdown(d=>d.addOption('en','English').addOption('zh','中文').setValue(this.plugin.settings.language).onChange(async language=>{await this.plugin.setLanguage(language);this.display();}));
  for(const [key,label] of [['database',this.plugin.t('Database file')],['details',this.plugin.t('Preparation notes folder')]]){let value=this.plugin.settings[key];new Setting(c).setName(this.plugin.t(label)).addText(t=>t.setValue(value).onChange(v=>value=v)).addButton(b=>b.setButtonText(this.plugin.t('Apply')).onClick(async()=>{try{this.plugin.settings[key]=vaultPath(value,key==='database');await this.plugin.saveData(this.plugin.settings);this.plugin.refresh();new Notice(this.plugin.t('Path saved.'));}catch(e){new Notice(this.plugin.t(e.message));}}));}
 }
}
module.exports=class JobTracker extends Plugin {
 async onload(){this.settings=Object.assign({},DEFAULTS,await this.loadData());this.queue=Promise.resolve();this.registerView(VIEW,leaf=>new Dashboard(leaf,this));this.addSettingTab(new TrackerSettings(this.app,this));this.addApplicationCommand=this.addCommand({id:'add-application',name:this.t('Add application'),callback:()=>new Form(this).open()});this.dashboardCommand=this.addCommand({id:'open-dashboard',name:this.t('Open dashboard / update application'),callback:()=>{void this.openDashboard();}});this.ribbon=this.addRibbonIcon('briefcase',this.t('Job applications'),()=>{void this.openDashboard();});this.registerEvent(this.app.vault.on('modify',file=>{if(file.path===this.settings.database)this.refresh();}));}
 t(text){return i18n.translate(this.settings.language,text);}
 async setLanguage(language){this.settings.language=language==='zh'?'zh':'en';await this.saveData(this.settings);if(this.addApplicationCommand)this.addApplicationCommand.name=this.t('Add application');if(this.dashboardCommand)this.dashboardCommand.name=this.t('Open dashboard / update application');if(this.ribbon)this.ribbon.setAttribute('aria-label',this.t('Job applications'));this.refresh();}
 async openDashboard(){let leaf=this.app.workspace.getLeavesOfType(VIEW)[0];if(!leaf){leaf=this.app.workspace.getLeaf('tab');await leaf.setViewState({type:VIEW,active:true});}await this.app.workspace.revealLeaf(leaf);}
 refresh(){for(const leaf of this.app.workspace.getLeavesOfType(VIEW)){void leaf.view.render().catch(e=>new Notice(this.t(e.message)));}}
 async readDatabase(){const path=vaultPath(this.settings.database,true),f=this.app.vault.getAbstractFileByPath(path);if(!f)return '';if(!(f instanceof TFile))throw Error('Database path points to a folder.');return this.app.vault.read(f);}
 async ensureFolder(path){if(!path)return;let current='';for(const part of path.split('/')){current=current?current+'/'+part:part;const existing=this.app.vault.getAbstractFileByPath(current);if(existing && !(existing instanceof TFolder))throw Error('A file blocks the notes folder.');if(!existing)await this.app.vault.createFolder(current);}}
 async saveApplication(record,input){const task=this.queue.then(()=>this.writeApplication(record,input));this.queue=task.catch(()=>{});return task;}
 async writeApplication(record,input){
  const path=vaultPath(this.settings.database,true);const data={...input};if(data.country!=='UK')delete data.sponsor;for(const key of Object.keys(data))if(typeof data[key]==='string' && !['summary','requirements'].includes(key))data[key]=model.clean(data[key]);
  let content=await this.readDatabase(),r=record?model.records(content).find(x=>x.id===record.id):null;
  if(record&&!r)throw Error('Application no longer exists. Refresh the dashboard.');
  if(!record&&model.duplicate(content,data))throw Error('This market, company, role, and applied date already exist. Update the existing application.');
  let result=record?null:model.add(content,data);if(!r)r={...data,id:result.id};
  let detailFile=null;let detailPath='';
  try{
   const existing=r.detail&&this.app.metadataCache.getFirstLinkpathDest(r.detail,path);
   if(data.detail&&!existing){const folder=vaultPath(this.settings.details);await this.ensureFolder(folder);const safe=v=>model.clean(v).replace(/[\\/:*?"<>|#^]/g,'-').slice(0,80);const base=`${folder}/${safe(r.id)} - ${safe(r.company)} - ${safe(r.role)}`;let name=base+'.md',n=2;while(this.app.vault.getAbstractFileByPath(name))name=`${base} (${n++}).md`;detailPath=name.slice(0,-3);
    const front=['application_id','company','role','country','track','priority','cv_version','applied'].map(k=>`${k}: ${JSON.stringify(k==='application_id'?r.id:r[k]||'')}`).join('\n');
    detailFile=await this.app.vault.create(name,`---\n${front}\n---\n\n# ${r.company} — ${r.role}\n\n## ${this.t('Role Summary')}\n\n${data.summary||''}\n\n## ${this.t('Key Requirements')}\n\n${data.requirements||''}\n\n## ${this.t('My Fit')}\n\n## ${this.t('Application Strategy')}\n\n## ${this.t('Assessment / Interview Preparation')}\n\n## ${this.t('Notes')}\n\n## ${this.t('Outcome Review')}\n`);
   }
   await this.ensureFolder(path.includes('/')?path.slice(0,path.lastIndexOf('/')):'');let file=this.app.vault.getAbstractFileByPath(path);
   const transform=current=>{if(record)return model.update(current,r.id,data.status,data.deadline,data.note,detailPath);if(model.duplicate(current,data))throw Error('Duplicate application detected.');const added=model.add(current,data);if(added.id!==r.id)throw Error('Database changed while saving. Please retry.');return detailPath?added.text.replace(`[id:: ${r.id}]`,`[id:: ${r.id}] [detail:: [[${detailPath}]]]`):added.text;};
   if(!file)await this.app.vault.create(path,transform('# Application Database\n'));else{if(!(file instanceof TFile))throw Error('Database is not a file.');await this.app.vault.process(file,transform);}
  }catch(e){if(detailFile)await this.app.vault.delete(detailFile);throw e;}this.refresh();
 }
};
