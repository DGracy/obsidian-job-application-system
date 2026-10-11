const test=require('node:test'),assert=require('node:assert/strict'),Module=require('node:module');
class El {
 constructor(tag='div',options={}){this.tag=tag;this.text=options.text||'';this.children=[];this.listeners={};this.attrs={};this.hidden=false;}
 empty(){this.children=[];}addClass(){}setText(v){this.text=v;}setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,f){this.listeners[k]=f;}
 createEl(tag,opts={}){const e=new El(tag,opts);this.children.push(e);return e;}createDiv(opts={}){return this.createEl('div',opts);}
 all(){return [this,...this.children.flatMap(e=>e.all())];}
}
class Control {
 constructor(){this.inputEl=new El('input');}setValue(v){this.value=v;return this;}onChange(f){this.change=f;return this;}setButtonText(v){this.text=v;return this;}onClick(f){this.click=f;return this;}setCta(){return this;}setDisabled(){return this;}addOption(){return this;}
}
class Setting {
 constructor(parent){this.el=parent.createEl('setting');this.el.controls=[];}setName(v){this.el.text=v;return this;}setDesc(){return this;}
 add(fn){const c=new Control();this.el.controls.push(c);fn(c);return this;}addText(fn){return this.add(fn);}addTextArea(fn){return this.add(fn);}addDropdown(fn){return this.add(fn);}addToggle(fn){return this.add(fn);}addButton(fn){return this.add(fn);}
}
class Modal {constructor(app){this.app=app;this.contentEl=new El();}open(){Modal.last=this;this.onOpen();}close(){this.onClose();}}
class Plugin {async loadData(){return {};}registerView(){}addSettingTab(){}addCommand(c){(this.commands??=[]).push(c);return c;}addRibbonIcon(){}registerEvent(){}}
test('tab interaction retains drafts, gates UK field and reveals preparation fields',async()=>{
 const original=Module._load;Module._load=function(name,...args){if(name==='obsidian')return {Plugin,Modal,Setting,Notice:class{},TFile:class{},TFolder:class{},ItemView:class{},PluginSettingTab:class{},normalizePath:p=>p};return original.call(this,name,...args);};
 try{
  const P=require('../main'),p=new P();p.app={vault:{on(){return {};}}};p.readDatabase=async()=>'';await p.onload();p.commands.find(c=>c.id==='add-application').callback();const f=Modal.last;
  const setting=name=>f.contentEl.all().find(e=>e.tag==='setting'&&e.text===name);
  const tab=name=>f.contentEl.all().find(e=>e.tag==='button'&&e.text===name).listeners.click();
  assert.ok(setting('Visa sponsorship'));setting('Company *').controls[0].change('UK employer');tab('China');assert.equal(setting('Visa sponsorship'),undefined);assert.equal(setting('Role type').controls[0].inputEl.attrs.list.startsWith('jat-type-'),true);setting('Role type').controls[0].change('自定义岗位');setting('Company *').controls[0].change('国内公司');tab('UK');assert.equal(setting('Company *').controls[0].value,'UK employer');tab('China');assert.equal(setting('Role type').controls[0].value,'自定义岗位');assert.equal(setting('Company *').controls[0].value,'国内公司');
  const fields=f.contentEl.all().find(e=>e.tag==='div'&&e.hidden);assert.ok(fields);setting('Create preparation note').controls[0].change(true);assert.equal(fields.hidden,false);tab('Other');assert.ok(setting('Country / region *'));assert.equal(setting('Visa sponsorship'),undefined);assert.equal(f.contentEl.all().find(e=>e.tag==='details').open,false);
  let saved;p.saveData=async data=>{saved={...data};};p.app.workspace={getLeavesOfType:()=>[]};
  await p.setLanguage('zh');assert.equal(saved.language,'zh');assert.equal(p.commands[0].name,'新增申请');f.render();assert.ok(setting('国家／地区 *'));assert.ok(f.contentEl.all().some(e=>e.text==='其他'));assert.equal(setting('Country / region *'),undefined);
  await p.setLanguage('en');f.render();assert.ok(setting('Country / region *'));assert.equal(saved.language,'en');
 }finally{Module._load=original;}
});
