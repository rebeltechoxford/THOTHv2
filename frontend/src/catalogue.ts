import { $, errorMessage } from './dom';
import { api } from './api';
import type { Star, Lightcurve, Fit, Status, SkyPoint, Point, CatalogResponse, Summary, ClusterJob, ClusterResult } from './types';
import { initDiscovery, setDiscoveryStar } from './discovery';

interface ObservatoryState {
  page: number; pageSize: number; total: number; sort: string; direction: string;
  items: Star[]; sky: Star[]; visibleSky: Star[]; selected: Star | null;
  curve: Lightcurve | null; fit: Fit | null; status: Status | null;
  request: number; selection: number; skyPoints: SkyPoint[];
  clusterJob: { id: string; tasks: number; workers: number; star: string } | null;
  clusterResult?: ClusterResult;
}
const state: ObservatoryState = {page:1,pageSize:25,total:0,sort:'period_days',direction:'asc',items:[],sky:[],visibleSky:[],selected:null,curve:null,fit:null,status:null,request:0,selection:0,skyPoints:[],clusterJob:null};
const number = (value: unknown): number | null => value === null || value === undefined || value === '' ? null : Number.isFinite(Number(value)) ? Number(value) : null;
const fmt = (value: unknown, digits=2): string => number(value) === null ? '—' : Number(value).toLocaleString(undefined,{maximumFractionDigits:digits,minimumFractionDigits:digits});
const count = (value: unknown): string => number(value) === null ? '—' : Number(value).toLocaleString();
const entities: Record<string,string> = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
const esc = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, c => entities[c]);
const safeUrl = (value: unknown): string | null => typeof value === 'string' && (/^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value)) ? value : null;
const sourceLink = (url: unknown,label: string): string => safeUrl(url) ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>` : '';
let toastTimer: ReturnType<typeof setTimeout> | undefined;
let filterTimer: ReturnType<typeof setTimeout> | undefined;
let clusterPollTimer: ReturnType<typeof setTimeout> | undefined;
const control = (id: string): HTMLInputElement | HTMLSelectElement => {
  const node = $(id);
  if (!(node instanceof HTMLInputElement || node instanceof HTMLSelectElement)) throw new Error(`Expected input: ${id}`);
  return node;
};
function toast(message: string) { $('toast').textContent=message; $('toast').hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>{$('toast').hidden=true;},7000); }
function params() {
  const p = new URLSearchParams({page:String(state.page),page_size:String(state.pageSize),sort:state.sort,direction:state.direction});
  [['search','search'],['catalog','catalog-filter'],['region','region-filter'],['min_period','min-period'],['max_period','max-period']].forEach(([key,id])=>{if(control(id).value.trim())p.set(key,control(id).value.trim());});
  return p;
}
async function loadCatalogue() {
  const request=++state.request;
  $('star-table').setAttribute('aria-busy','true');
  try {
    const data = await api<CatalogResponse>(`/api/catalog?${params()}`);
    if(request !== state.request) return;
    state.items=data.items || []; state.total=data.total || 0; state.page=data.page || state.page;
    renderTable(); renderSummary(data.summary || {},data.manifest || {}); updateSort();
    const exportParams=params();['page','page_size','sort','direction'].forEach(key=>exportParams.delete(key));$('catalogue-export').href=`/api/export/catalog?${exportParams}`;
  } catch(error) { if(request===state.request){$('star-table').innerHTML=`<tr><td colspan="5" class="table-empty">${esc(errorMessage(error))}</td></tr>`;toast(errorMessage(error));} }
  finally { if(request===state.request)$('star-table').removeAttribute('aria-busy'); }
}
function renderSummary(summary: Summary,manifest: CatalogResponse['manifest']) {
  $('metric-stars').textContent=count(summary.total_stars);
  $('metric-periods').textContent=count(summary.with_period);
  $('metric-median').innerHTML=`${fmt(summary.median_period_days,1)}<small>d</small>`;
  const catalogs=Array.isArray(summary.catalogs) ? summary.catalogs : Object.keys(summary.catalogs || {});
  $('metric-catalogues').textContent=String(catalogs.length || '—');
  const names=catalogs.map(x=>typeof x==='string'?x:x.name).filter(Boolean);
  $('metric-source-note').textContent=names.join(' · ') || 'Published source catalogues';
  const retrieved=manifest.retrieved_utc?new Date(manifest.retrieved_utc).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}):null;
  $('coverage-note').lastElementChild!.textContent=(summary.coverage_note || 'Published catalogue records may overlap across sources. This inventory is not a complete census of every known Mira.')+(retrieved?` Snapshot retrieved ${retrieved} (UTC).`:'');
  if($('catalog-filter').options.length===1) names.forEach(name=>$('catalog-filter').add(new Option(name,name)));
}
function renderTable() {
  $('star-table').innerHTML = state.items.length ? state.items.map(star=>`<tr data-id="${esc(star.id)}" class="${state.selected?.id===star.id?'selected':''}"><td><button class="star-button" data-star="${esc(star.id)}">${esc(star.name || star.id)}</button><span class="star-region">${esc(star.region || 'Region not provided')}</span></td><td class="period-cell">${fmt(star.period_days,2)}${number(star.period_days)!==null?'<span class="unit">d</span>':''}</td><td>${fmt(star.mean_i_mag,2)}</td><td>${fmt(star.amplitude_i_mag,2)}</td><td><span class="source-tag ${String(star.catalog).toLowerCase().includes('ogle')?'ogle':'gcvs'}">${esc(star.catalog || '—')}</span></td></tr>`).join('') : '<tr><td colspan="5" class="table-empty">No records match these filters. Try a different name or period range.</td></tr>';
  const first=state.total ? (state.page-1)*state.pageSize+1 : 0, last=Math.min(state.page*state.pageSize,state.total);
  $('result-count').textContent=`${count(state.total)} records`;
  $('page-label').textContent=`${count(first)}–${count(last)} of ${count(state.total)} records`;
  $('page-number').textContent=String(state.page);
  $('prev-page').disabled=state.page<=1; $('next-page').disabled=last>=state.total;
}
function updateSort() { document.querySelectorAll<HTMLButtonElement>('.sort-button').forEach(button=>{button.lastElementChild!.textContent=button.dataset.sort===state.sort ? state.direction==='asc'?'↑':'↓' : '';button.closest('th')!.setAttribute('aria-sort',button.dataset.sort===state.sort?state.direction==='asc'?'ascending':'descending':'none');}); }
function filterChanged(updateSky=false) {
  const min=number($('min-period').value),max=number($('max-period').value);
  if(min!==null && max!==null && min>max){toast('Minimum period must be less than the maximum period.');return;}
  state.page=1;loadCatalogue();if(updateSky)filterSky();
}
function filterSky() {
  const catalog=$('catalog-filter').value,region=$('region-filter').value;
  state.visibleSky=state.sky.filter(star=>(!catalog||star.catalog===catalog)&&(!region||star.region===region));
  $('sky-count').textContent=`${count(state.visibleSky.length)} positions`;
  drawSky();renderDistribution();
}
function skyCoords(star: Star,w: number,h: number) {
  const ra=number(star.ra_deg),dec=number(star.dec_deg); if(ra===null||dec===null)return null;
  return {x:43+(360-ra)/360*(w-58),y:20+(90-dec)/180*(h-54)};
}
function drawSky() {
  const canvas=$('sky-canvas'),rect=canvas.getBoundingClientRect();if(!rect.width)return;
  const w=rect.width,h=rect.height,dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  const ctx=canvas.getContext('2d');if(!ctx)return;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);
  ctx.font='8px "DM Sans",sans-serif';ctx.fillStyle='#7890a8';ctx.strokeStyle='#223448';ctx.lineWidth=.6;
  for(let ra=0;ra<=360;ra+=60){const x=43+(360-ra)/360*(w-58);ctx.beginPath();ctx.moveTo(x,20);ctx.lineTo(x,h-34);ctx.stroke();ctx.textAlign='center';ctx.fillText(`${ra}°`,x,h-19);}
  for(let dec=-60;dec<=60;dec+=30){const y=20+(90-dec)/180*(h-54);ctx.beginPath();ctx.moveTo(43,y);ctx.lineTo(w-15,y);ctx.stroke();ctx.textAlign='right';ctx.fillText(`${dec>0?'+':''}${dec}°`,35,y+3);}
  ctx.fillStyle='#90a8bf';ctx.textAlign='center';ctx.fillText('Right ascension',w/2,h-3);ctx.save();ctx.translate(9,h/2);ctx.rotate(-Math.PI/2);ctx.fillText('Declination',0,0);ctx.restore();
  ctx.fillStyle=state.visibleSky.length>10000?'#61d7de55':'#61d7de99';
  state.skyPoints=[];
  for(const star of state.visibleSky){const pt=skyCoords(star,w,h);if(!pt)continue;ctx.fillRect(pt.x-.65,pt.y-.65,1.3,1.3);state.skyPoints.push({...pt,star});}
  if(state.selected){const pt=skyCoords(state.selected,w,h);if(pt){ctx.strokeStyle='#f6bd73';ctx.lineWidth=1;ctx.beginPath();ctx.arc(pt.x,pt.y,5,0,2*Math.PI);ctx.stroke();ctx.beginPath();ctx.moveTo(pt.x-10,pt.y);ctx.lineTo(pt.x-7,pt.y);ctx.moveTo(pt.x+7,pt.y);ctx.lineTo(pt.x+10,pt.y);ctx.moveTo(pt.x,pt.y-10);ctx.lineTo(pt.x,pt.y-7);ctx.moveTo(pt.x,pt.y+7);ctx.lineTo(pt.x,pt.y+10);ctx.stroke();ctx.fillStyle='#f6bd73';ctx.beginPath();ctx.arc(pt.x,pt.y,1.8,0,2*Math.PI);ctx.fill();}}
}
function nearestSky(event: MouseEvent) {
  const rect=$('sky-canvas').getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
  let nearest: SkyPoint | null=null,best=64;for(const p of state.skyPoints){const d=(p.x-x)**2+(p.y-y)**2;if(d<best){best=d;nearest=p;}}
  return nearest;
}
function chartShell(width: number,height: number,xRange: number[],yRange: number[],xLabel: string,yLabel: string,{reverseY=false,xFormat=null,yFormat=null,ticks=5}: {reverseY?: boolean;xFormat?: ((value: number)=>string) | null;yFormat?: ((value: number)=>string) | null;ticks?: number}={}) {
  const m={l:52,r:18,t:13,b:42},pw=width-m.l-m.r,ph=height-m.t-m.b;
  const xs=(x: number)=>m.l+(x-xRange[0])/(xRange[1]-xRange[0]||1)*pw;
  const ys=(y: number)=>m.t+(reverseY?(y-yRange[0]):(yRange[1]-y))/(yRange[1]-yRange[0]||1)*ph;
  let svg='';
  for(let i=0;i<=ticks;i++){const xv=xRange[0]+i/ticks*(xRange[1]-xRange[0]),yv=yRange[0]+i/ticks*(yRange[1]-yRange[0]),x=xs(xv),y=ys(yv);svg+=`<line x1="${m.l}" y1="${y}" x2="${width-m.r}" y2="${y}" class="chart-grid"/><text x="${m.l-9}" y="${y+3}" text-anchor="end" class="chart-text">${esc(yFormat?yFormat(yv):fmt(yv,1))}</text><text x="${x}" y="${height-m.b+16}" text-anchor="middle" class="chart-text">${esc(xFormat?xFormat(xv):fmt(xv,0))}</text>`;}
  svg+=`<line x1="${m.l}" y1="${height-m.b}" x2="${width-m.r}" y2="${height-m.b}" class="chart-axis"/><text x="${width/2+10}" y="${height-5}" text-anchor="middle" class="chart-label">${esc(xLabel)}</text><text transform="translate(12 ${height/2-8}) rotate(-90)" text-anchor="middle" class="chart-label">${esc(yLabel)}</text>`;
  return {svg,xs,ys,m,pw,ph};
}
function svgWrap(width: number,height: number,body: string,label: string) {return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}">${body}</svg>`;}
function renderDistribution() {
  const values=state.visibleSky.map(s=>number(s.period_days)).filter((v): v is number=>v!==null&&v>0).sort((a,b)=>a-b);
  if(!values.length){$('period-distribution').innerHTML='<p class="empty-message">No published periods for this selection.</p>';return;}
  const cap=Math.max(300,Math.ceil(values[Math.floor(values.length*.99)]/100)*100),n=24,bins=Array(n).fill(0),step=cap/n;
  values.forEach(v=>bins[Math.min(n-1,Math.floor(v/step))]++);
  const w=450,h=230,{svg:base,xs,ys,m}=chartShell(w,h,[0,cap],[0,Math.max(...bins)*1.12],'Period / days','Records',{yFormat:v=>v>=1000?`${fmt(v/1000,1)}k`:fmt(v,0)});
  let body=base;bins.forEach((v,i)=>{const x=xs(i*step)+1,y=ys(v),bw=xs(step)-xs(0)-2;body+=`<rect x="${x}" y="${y}" width="${bw}" height="${h-m.b-y}" rx="1.3" fill="${i%2?'#8497be':'#9babcb'}" opacity="${.62+i/n*.27}"><title>${fmt(i*step,0)}–${i===n-1?'≥'+fmt(cap-step,0):fmt((i+1)*step,0)} days: ${count(v)} records</title></rect>`;});
  $('period-distribution').innerHTML=svgWrap(w,h,body,'Histogram of published Mira periods');
  const overflow=values.filter(v=>v>=cap).length;
  $('distribution-note').textContent=`${count(values.length)} published periods${overflow?`; final bin includes ${count(overflow)} periods ≥ ${fmt(cap,0)} d`:''}. Catalogue records may overlap.`;
}
function property(label: string,value: unknown,unit='',className='') { return `<div class="${className}"><dt>${esc(label)}</dt><dd>${esc(value)}${unit&&value!=='—'?`<small>${esc(unit)}</small>`:''}</dd></div>`; }
function renderStar() {
  const s=state.selected;if(!s)return;const p=number(s.period_days),min=p?Math.max(10,p*.65):50,max=p?Math.min(5000,p*1.5):1000;
  const flags=s.catalog_flags || {},activeFlags=Object.entries(flags).filter(([,value])=>value);
  const periodLabel=`${flags.l_Period || ''}${fmt(s.period_days,2)}${flags.u_Period || ''}`;
  let extraProperties='';
  if(number(s.magnitude_max)!==null || number(s.magnitude_min)!==null || number(s.magnitude_min_catalog)!==null){
    const bright=number(s.magnitude_max)!==null?`${flags.l_magMax || ''}${fmt(s.magnitude_max,2)}${flags.u_magMax || ''}`:'—';
    const faint=number(s.magnitude_min_catalog ?? s.magnitude_min)!==null?`${flags.l_Min1 || ''}${fmt(s.magnitude_min_catalog ?? s.magnitude_min,2)}${flags.u_Min1 || ''}`:'—';
    if(number(s.magnitude_min)!==null)extraProperties+=property('CATALOGUE MAX → MIN',`${bright} → ${faint}`,`${s.magnitude_band || 'source band'} mag`,'wide');
    else {extraProperties+=property('CATALOGUE MAXIMUM',bright,`${s.magnitude_band || 'source band'} mag`,'wide');extraProperties+=property('SOURCE Min1 FIELD',faint,flags.n_Min1?`qualifier: ${flags.n_Min1}`:'source-qualified value','wide');}
  }
  if(number(s.epoch_max_jd)!==null)extraProperties+=property('CATALOGUE MAXIMUM EPOCH',fmt(s.epoch_max_jd,2),'JD','wide');
  $('star-detail').innerHTML=`<div class="selected-type"><span aria-hidden="true">✦</span>${esc(s.classification || 'Mira variable')}</div><h3 class="star-name">${esc(s.name || s.id)}</h3><p class="selected-region">${esc(s.region || 'Region not provided')} · ${esc(s.catalog || 'Catalogue record')}</p><dl class="star-properties">${property('PUBLISHED PERIOD',fmt(s.period_days,2),'days','period-property')}${property('RIGHT ASCENSION',fmt(s.ra_deg,4),'°')}${property('DECLINATION',fmt(s.dec_deg,4),'°')}${property('MEAN I MAG',fmt(s.mean_i_mag,2),'mag')}${property('MEAN V MAG',fmt(s.mean_v_mag,2),'mag')}${property('I AMPLITUDE',fmt(s.amplitude_i_mag,2),'mag')}${property('SPECTRAL TYPE',s.spectral_type || '—','')}</dl><div class="source-links">${sourceLink(s.source_url,'Catalogue source')}${sourceLink(s.lightcurve_url,'Photometry')}</div><form id="fit-form" class="fit-form"><h4>Find the period with C++</h4><p class="fit-explainer">Search candidate periods and fit a weighted, two-harmonic Fourier series to the observed light curve.</p><div class="fit-bounds"><label>Min period / days<input id="fit-min" type="number" value="${min.toFixed(2)}" min="10" max="5000" step="0.01" required></label><label>Max period / days<input id="fit-max" type="number" value="${max.toFixed(2)}" min="10" max="5000" step="0.01" required></label></div><button class="fit-button" id="fit-button" type="submit"><span aria-hidden="true">✦</span> Run native period search</button><p class="fit-footnote">An empirical fit to observations. Inspect the light curve and aliases before interpreting a period.</p><p class="fit-status" id="fit-status" role="status"></p></form>`;
  $('fit-form').addEventListener('submit',runFit);renderTable();drawSky();
  $('star-detail').querySelector('.period-property dd')!.innerHTML=`${esc(periodLabel)}${p!==null?'<small>days</small>':''}`;
  $('star-detail').querySelector('.star-properties')!.insertAdjacentHTML('beforeend',extraProperties);
  if(activeFlags.length)$('star-detail').querySelector('.source-links')!.insertAdjacentHTML('beforebegin',`<p class="catalog-qualifications">Source qualifications: ${activeFlags.map(([key,value])=>`${esc(key)} = ${esc(value)}`).join(' · ')}. Preserve these flags when interpreting the catalogue values.</p>`);
  $('analysis-star-name').textContent=s.name || s.id;$('analysis-section').hidden=false;
  updateClusterStar();setDiscoveryStar(s);
}
function resetAnalysis() {
  state.curve=null;state.fit=null;$('periodogram-card').hidden=true;$('lightcurve-notice').hidden=true;
  $('observed-chart').innerHTML='<p class="empty-message">Loading observed photometry…</p>';
  $('observation-count').textContent='Loading';$('folded-period').textContent='Awaiting fit';
  $('folded-chart').innerHTML='<div class="chart-placeholder"><svg viewBox="0 0 120 42" aria-hidden="true"><path d="M2 23C12 23 14 4 27 4S41 38 53 38 65 4 78 4 90 38 103 38 113 25 118 23"/></svg><p>Run a native period search<br>to bring the cycles together.</p></div>';
}
async function selectStar(id: string) {
  const selection=++state.selection;
  try {
    const star=await api<Star>(`/api/stars/${encodeURIComponent(id)}`);if(selection!==state.selection)return;
    state.selected=star;resetAnalysis();renderStar();
    try {const curve=await api<Lightcurve>(`/api/stars/${encodeURIComponent(id)}/lightcurve`);if(selection!==state.selection)return;state.curve=curve;renderObserved();}
    catch(error){if(selection!==state.selection)return;$('observed-chart').innerHTML='<p class="empty-message">Observed photometry is unavailable for this record.</p>';$('observation-count').textContent='No observations';$('lightcurve-notice').innerHTML=`<span>${esc(errorMessage(error))}</span>${id!==state.status?.example_star_id?'<button id="return-example" class="notice-action">Open the bundled example ↗</button>':''}`;$('lightcurve-notice').hidden=false;$('fit-status').textContent='Select the bundled example to run the analysis without downloading new photometry.';}
  } catch(error){toast(errorMessage(error));}
}
function observations() {return (state.curve?.observations || []).filter(o=>number(o.time_jd)!==null&&number(o.magnitude)!==null);}
function yRange(points: Point[]) {const vals=points.map(p=>p.y),min=Math.min(...vals),max=Math.max(...vals),pad=Math.max(.08,(max-min)*.1);return [min-pad,max+pad];}
function scatterBody(points: Point[],xs: (n: number)=>number,ys: (n: number)=>number,{opacity=.65,radius=1.6,errors=false}={}) {
  const stride=Math.max(1,Math.floor(points.length/3000));let body='';
  for(let i=0;i<points.length;i+=stride){const p=points[i];if(errors&&typeof p.error==='number'&&p.error>0)body+=`<line x1="${xs(p.x)}" y1="${ys(p.y-p.error)}" x2="${xs(p.x)}" y2="${ys(p.y+p.error)}" stroke="#61d7de" opacity=".17" stroke-width=".7"/>`;body+=`<circle cx="${xs(p.x)}" cy="${ys(p.y)}" r="${radius}" fill="#61d7de" opacity="${opacity}"><title>${esc(p.label || `${fmt(p.x,3)} · ${fmt(p.y,3)} mag`)}</title></circle>`;}
  return body;
}
function renderObserved() {
  const obs=observations();if(!obs.length){$('observed-chart').innerHTML='<p class="empty-message">No usable photometric observations.</p>';$('observation-count').textContent='No observations';return;}
  const offset=Math.floor(Math.min(...obs.map(o=>Number(o.time_jd)))/1000)*1000,points=obs.map(o=>({x:Number(o.time_jd)-offset,y:Number(o.magnitude),error:number(o.error_mag)})),xr=[Math.min(...points.map(p=>p.x)),Math.max(...points.map(p=>p.x))];
  if(xr[0]===xr[1])xr[1]++;
  const band=state.curve?.band || obs[0].band || 'source',w=600,h=265,chart=chartShell(w,h,xr,yRange(points),`${state.curve?.time_system || 'JD'} − ${offset}`,`${band}-band magnitude ↑ brighter`,{reverseY:true});
  $('observed-chart').innerHTML=svgWrap(w,h,chart.svg+scatterBody(points,chart.xs,chart.ys,{errors:true}),'Real observed brightness over time; lower magnitudes are brighter');
  $('observation-count').textContent=`${count(obs.length)} observations`;
  $('observed-caption').innerHTML=`${esc(band)} band · ${esc(state.curve?.time_system || 'Julian date, source convention')} · ${sourceLink(state.curve?.source_url,'Original photometry')}`;
}
async function runFit(event: SubmitEvent) {
  event.preventDefault();if(!state.selected)return;const min=number($('fit-min').value),max=number($('fit-max').value);
  if(min===null||max===null||min>=max){$('fit-status').textContent='Choose a maximum period greater than the minimum.';return;}
  const selection=state.selection,id=state.selected.id;$('fit-button').disabled=true;$('fit-button').textContent='Searching candidate periods…';$('fit-status').textContent='Native C++ is fitting the observed light curve.';
  try {const fit=await api<Fit>('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({star_id:id,min_period:min,max_period:max,samples:1500,harmonics:2,threads:0})});if(selection!==state.selection)return;state.fit=fit;if(!state.curve&&Array.isArray(fit.observations)){state.curve={observations:fit.observations,band:fit.band,time_system:fit.time_system};renderObserved();}renderFit();$('fit-status').textContent=`Best candidate: ${fmt(fit.period_days,4)} days within your search interval.`;}
  catch(error){if(selection===state.selection){$('fit-status').textContent=errorMessage(error);toast(errorMessage(error));}}
  finally{if(selection===state.selection){$('fit-button').disabled=false;$('fit-button').innerHTML='<span aria-hidden="true">✦</span> Run native period search';}}
}
function renderFit() {
  const fit=state.fit;if(!fit)return;const P=Number(fit.period_days),epoch=Number(fit.reference_epoch_jd),obs=observations();
  const phase=(t: number)=>((Number(t)-epoch)/P%1+1)%1;
  let points: Point[]=[];obs.forEach(o=>{const ph=phase(o.time_jd);for(const shift of [0,1])points.push({x:ph+shift,y:Number(o.magnitude),error:number(o.error_mag)});});
  const model: Point[]=[];
  if(Array.isArray(fit.phase_model)){fit.phase_model.forEach(p=>model.push({x:Number(p.phase),y:Number(p.magnitude)}));}
  else if(Array.isArray(fit.model_magnitudes)){fit.model_magnitudes.forEach((y,i)=>model.push({x:fit.model_phases?Number(fit.model_phases[i]):phase(fit.model_times?.[i] ?? epoch),y:Number(y)}));}
  model.sort((a,b)=>a.x-b.x);
  const range=points.length?yRange(points):model.length?yRange(model):[0,1],w=600,h=265,chart=chartShell(w,h,[0,2],range,'Phase / cycles',`${state.curve?.band || 'Source'}-band magnitude ↑ brighter`,{reverseY:true,xFormat:v=>fmt(v,1),ticks:4});
  let body=chart.svg+scatterBody(points,chart.xs,chart.ys,{opacity:.45,radius:1.3});
  if(model.length){for(const shift of [0,1])body+=`<path d="${model.map((p,i)=>`${i?'L':'M'}${chart.xs(p.x+shift).toFixed(2)},${chart.ys(p.y).toFixed(2)}`).join(' ')}" fill="none" stroke="#f6bd73" stroke-width="1.8"/>`;}
  $('folded-chart').innerHTML=svgWrap(w,h,body,'Observed light curve folded at the fitted period with empirical Fourier curve');$('folded-period').textContent=`${fmt(P,4)} d`;
  const frequencies=fit.frequencies || [],powers=fit.powers || [],pairs=frequencies.map((f,i)=>({x:1/Number(f),y:Number(powers[i])})).filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)).sort((a,b)=>a.x-b.x);
  if(pairs.length){const pc=chartShell(1100,200,[pairs[0].x,pairs[pairs.length-1].x],[Math.min(0,...pairs.map(p=>p.y)),Math.max(...pairs.map(p=>p.y))*1.08],'Trial period / days','Fit improvement',{yFormat:v=>fmt(v,2)});const path=pairs.map((p,i)=>`${i?'L':'M'}${pc.xs(p.x).toFixed(2)},${pc.ys(p.y).toFixed(2)}`).join(' ');$('periodogram-chart').innerHTML=svgWrap(1100,200,`${pc.svg}<path d="${path}" fill="none" stroke="#b09aec" stroke-width="1.2"/><line x1="${pc.xs(P)}" y1="13" x2="${pc.xs(P)}" y2="158" stroke="#f6bd73" stroke-width="1" stroke-dasharray="3 4"/>`,'Native frequency search: candidate periods and fit improvements');}
  $('fit-metrics').innerHTML=[['BEST PERIOD',fmt(P,4),'d'],['FITTED AMPLITUDE',fmt(fit.amplitude_mag,3),'mag'],['REDUCED χ²',fmt(fit.reduced_chi2,2),''],['OBSERVATIONS',count(fit.n_observations || obs.length),'']].map(([label,value,unit])=>`<div><span>${label}</span><strong>${value}<small>${unit}</small></strong></div>`).join('');
  const backend=fit.backend || state.status?.native_backend;
  $('fit-backend').textContent=`${typeof backend==='string'?backend:backend?.engine || 'Native C++'}${fit.threads_used?` · ${fit.threads_used} threads`:''}`;
  $('fit-caption').textContent=`Two-harmonic empirical fit. A large reduced χ² means residuals exceed the quoted errors; the model may not describe the evolving light curve. Period searches can have cadence aliases. ${(fit.warnings || []).join(' ')}`;
  $('periodogram-card').hidden=false;
  if(!document.getElementById('export-fit'))$('fit-metrics').insertAdjacentHTML('afterend','<button class="export-button fit-export" id="export-fit">Download fit JSON ↓</button>');
  $('export-fit').onclick=()=>downloadJSON(state.fit,`${state.selected?.id ?? 'star'}-fit.json`);
}

function updateTheory() {
  const p=Number($('parallel-fraction').value)/100,N=Number($('processor-count').value),amd=(n: number)=>1/((1-p)+p/n),gus=(n: number)=>n-(1-p)*(n-1);
  $('parallel-fraction-label').textContent=`${fmt(p*100,p*100%1?1:0)}%`;$('processor-label').textContent=String(N);
  $('amdahl-speedup').textContent=`${fmt(amd(N),2)}×`;$('gustafson-speedup').textContent=`${fmt(gus(N),2)}×`;
  const w=700,h=265,chart=chartShell(w,h,[1,Math.max(2,N)],[0,Math.max(2,N)*1.08],'Ideal processor count / N','Theoretical speedup / ×',{xFormat:v=>fmt(v,0),yFormat:v=>fmt(v,0),ticks:4}),xs=chart.xs,ys=chart.ys;
  let body=chart.svg;([['#60748c',(n: number)=>n,'4 4'],['#b09aec',gus,''],['#61d7de',amd,'']] as [string,(n: number)=>number,string][]).forEach(([color,fn,dash])=>{const points=Array.from({length:Math.max(N,2)},(_,i)=>({x:i+1,y:fn(i+1)}));body+=`<path d="${points.map((v,i)=>`${i?'L':'M'}${xs(v.x)},${ys(v.y)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="1.8" ${dash?`stroke-dasharray="${dash}"`:''}/>`;});
  body+=`<circle cx="${xs(N)}" cy="${ys(amd(N))}" r="3.2" fill="#61d7de"/><circle cx="${xs(N)}" cy="${ys(gus(N))}" r="3.2" fill="#b09aec"/>`;
  $('scaling-chart').innerHTML=svgWrap(w,h,body,`Amdahl speedup ${fmt(amd(N),2)} and Gustafson speedup ${fmt(gus(N),2)} for ${N} processors and ${fmt(p*100,1)} percent parallel work`);
}
function taskTiles(tasks: number,completed=0,stage='idle',indices: Set<number> | null=null) {
  $('task-grid').innerHTML=Array.from({length:tasks},(_,i)=>{const done=indices?indices.has(i):i<completed,active=!done&&stage!=='idle'&&stage!=='complete'&&stage!=='preparing';return `<div class="task-tile ${done?stage==='serial'?'serial':'complete':active?'active':''}"><span aria-hidden="true">${done?'✓':active?'◌':'·'}</span>Task ${i+1}</div>`;}).join('');
}
function updateClusterStar() {
  const select=$('cluster-star'),selectedValue=select.value,example=state.status?.example_star_id || 'OGLE-BLG-LPV-096697';
  select.innerHTML='';select.add(new Option(`Bundled example · ${example}`,example));
  if(state.selected&&state.selected.id!==example)select.add(new Option(`Selected star · ${state.selected.name || state.selected.id}`,state.selected.id));
  if(Array.from(select.options).some(o=>o.value===selectedValue))select.value=selectedValue;
}
async function runCluster(event: SubmitEvent) {
  event.preventDefault();if(state.clusterJob)return;
  const workers=Number($('cluster-workers').value),tasks=Number($('cluster-tasks').value),star=$('cluster-star').value;
  $('cluster-run').disabled=true;$('cluster-run').textContent='Starting the experiment…';$('cluster-results').hidden=true;$('cluster-error').hidden=true;$('cluster-idle-copy').hidden=true;$('cluster-heading').textContent='Preparing real photometry';$('cluster-state').textContent='Queued';$('cluster-progress-bar').style.width='0%';$('cluster-progress-percent').textContent='0%';taskTiles(tasks,0,'preparing');
  try{const job=await api<{job_id: string; state: string}>('/api/cluster/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({star_id:star,workers,tasks,samples:400,observations_limit:1200})});state.clusterJob={id:job.job_id,tasks,workers,star};pollCluster();}
  catch(error){clusterFailed(errorMessage(error));}
}
function clusterFailed(message: string) {clearTimeout(clusterPollTimer);state.clusterJob=null;$('cluster-state').textContent='Failed';$('cluster-heading').textContent='Experiment interrupted';$('cluster-error').textContent=message;$('cluster-error').hidden=false;$('cluster-run').disabled=false;$('cluster-run').innerHTML='<span aria-hidden="true">⚡</span> Run the scaling experiment';}
async function pollCluster() {
  if(!state.clusterJob)return;
  try{const data=await api<ClusterJob>(`/api/cluster/jobs/${encodeURIComponent(state.clusterJob.id)}`);const progress=data.progress,stage=progress?.stage || data.state,done=Number(progress?.completed)||0,total=Number(progress?.total)||state.clusterJob.tasks;
    $('cluster-state').textContent=data.state==='complete'?'Complete':stage.charAt(0).toUpperCase()+stage.slice(1);
    $('cluster-heading').textContent=stage==='serial'?'Measuring the serial baseline':stage==='parallel'?'Workers are searching periods':data.state==='complete'?'The experiment is complete':'Preparing the workload';
    const percent=data.state==='complete'?100:stage==='parallel'?50+done/total*50:stage==='serial'?done/total*50:0;
    $('cluster-progress-bar').style.width=`${Math.min(100,percent)}%`;$('cluster-progress-percent').textContent=`${Math.round(percent)}%`;
    $('cluster-progress-text').textContent=data.state==='complete'?`${state.clusterJob.tasks} tasks completed in each run`:`${stage==='serial'?'Serial baseline':stage==='parallel'?'Parallel run':'Preparing'} · ${done}/${total} tasks`;
    const finishedEvents=(data.events || []).filter(e=>e.stage===stage&&Number.isInteger(e.task_index)),indices=finishedEvents.length?new Set(finishedEvents.map(e=>e.task_index).filter((i): i is number=>i!==undefined)):null;
    taskTiles(state.clusterJob.tasks,data.state==='complete'?state.clusterJob.tasks:done,stage,data.state==='complete'?null:indices);
    if(data.state==='failed'){clusterFailed(data.error || 'The cluster experiment failed.');return;}
    if(data.state==='complete'){renderClusterResults(data.result || {});state.clusterJob=null;$('cluster-run').disabled=false;$('cluster-run').innerHTML='<span aria-hidden="true">⚡</span> Run the scaling experiment';return;}
    clusterPollTimer=setTimeout(pollCluster,750);
  }catch(error){clusterFailed(errorMessage(error));}
}
function renderClusterResults(result: ClusterResult) {
  state.clusterResult=result;
  $('cluster-results').hidden=false;
  const metrics=[['SERIAL TIME',fmt(result.serial_seconds,2),'s'],['PARALLEL TIME',fmt(result.parallel_seconds,2),'s'],['SPEEDUP',fmt(result.speedup,2),'×'],['EFFICIENCY',fmt(Number(result.efficiency)*100,1),'%']];
  $('cluster-metrics').innerHTML=metrics.map(([label,value,unit])=>`<div><span>${label}</span><strong>${value}<small>${unit}</small></strong></div>`).join('');
  const oldWorkers=document.getElementById('worker-results');if(oldWorkers)oldWorkers.remove();
  if(Array.isArray(result.node_results)&&result.node_results.length)$('cluster-metrics').insertAdjacentHTML('afterend',`<div id="worker-results" class="worker-results"><p>PARALLEL WORKERS · ACTUAL PROCESS RESULTS</p><table><thead><tr><th>PROCESS / HOST</th><th>TASKS</th><th>COMPUTE</th></tr></thead><tbody>${result.node_results.map(node=>`<tr><td>${esc(node.worker_pid)}<span class="star-region">${esc(node.hostname || 'local')}${node.mpi_rank!==undefined?` · rank ${esc(node.mpi_rank)}`:''}</span></td><td>${count(node.tasks_completed)}</td><td>${fmt(node.compute_seconds,3)} s</td></tr>`).join('')}</tbody></table></div>`);
  const distribution=result.period_distribution || {},periods=(distribution.periods_days || result.periods || []).map(number).filter((v): v is number=>v!==null);
  if(periods.length){const min=Math.min(...periods),max=Math.max(...periods),pad=Math.max(.03,(max-min)*.15),bins=Array(14).fill(0),range=[min-pad,max+pad],step=(range[1]-range[0])/bins.length;periods.forEach(v=>bins[Math.min(bins.length-1,Math.floor((v-range[0])/step))]++);const w=500,h=115,chart=chartShell(w,h,range,[0,Math.max(...bins)*1.1],'Bootstrap period estimates / days','Tasks',{xFormat:v=>fmt(v,2),yFormat:v=>fmt(v,0),ticks:3});let body=chart.svg;bins.forEach((v,i)=>{const y=chart.ys(v);body+=`<rect x="${chart.xs(range[0]+i*step)+1}" y="${y}" width="${chart.xs(range[0]+step)-chart.xs(range[0])-2}" height="${h-chart.m.b-y}" fill="#b09aec" opacity=".8" rx="1"/>`;});$('ensemble-chart').innerHTML=svgWrap(w,h,body,'Bootstrap distribution of fitted periods from real photometry');}
  else $('ensemble-chart').innerHTML='';
  const pids=Array.isArray(result.worker_pids)?result.worker_pids.join(', '):'—',hosts=Array.isArray(result.hostnames)?result.hostnames.join(', '):'local host';
  $('cluster-result-note').textContent=`${result.workers || result.settings?.workers || '—'} local worker processes · ${hosts} · PIDs ${pids}. ${result.same_task_results===false?'Serial and parallel task results differed; inspect the report.':'Same deterministic tasks in both runs.'} ${Number(result.speedup)<1?'Parallel overhead exceeded the saved compute time on this run.':''} The resampling spread is illustrative, not a calibrated astrophysical confidence interval; Mira cycles can be correlated and evolve.`;
  if(!document.getElementById('export-cluster'))$('cluster-result-note').insertAdjacentHTML('afterend','<button class="export-button" id="export-cluster">Download experiment JSON ↓</button>');
  $('export-cluster').onclick=()=>downloadJSON(state.clusterResult,'thoth-cluster-experiment.json');
}
function downloadJSON(value: unknown,filename: string) {
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=filename.replace(/[^A-Za-z0-9._-]/g,'_');document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

document.querySelectorAll<HTMLButtonElement>('.sort-button').forEach(button=>button.addEventListener('click',()=>{state.direction=state.sort===button.dataset.sort&&state.direction==='asc'?'desc':'asc';state.sort=button.dataset.sort ?? 'name';state.page=1;loadCatalogue();}));
$('star-table').addEventListener('click',event=>{const button=(event.target instanceof Element ? event.target : null)?.closest<HTMLButtonElement>('[data-star]');if(button?.dataset.star)selectStar(button.dataset.star);});
$('search').addEventListener('input',()=>{clearTimeout(filterTimer);filterTimer=setTimeout(()=>filterChanged(),280);});
['min-period','max-period'].forEach(id=>$(id).addEventListener('input',()=>{clearTimeout(filterTimer);filterTimer=setTimeout(()=>filterChanged(),400);}));
['catalog-filter','region-filter'].forEach(id=>$(id).addEventListener('change',()=>filterChanged(true)));
$('reset-filters').addEventListener('click',()=>{['search','catalog-filter','region-filter','min-period','max-period'].forEach(id=>control(id).value='');filterChanged(true);});
$('prev-page').addEventListener('click',()=>{if(state.page>1){state.page--;loadCatalogue();}});$('next-page').addEventListener('click',()=>{if(state.page*state.pageSize<state.total){state.page++;loadCatalogue();}});
$('sky-canvas').addEventListener('click',event=>{const hit=nearestSky(event);if(hit)selectStar(hit.star.id);});
let skyHoverFrame: number | null=null;$('sky-canvas').addEventListener('mousemove',event=>{if(skyHoverFrame)return;skyHoverFrame=requestAnimationFrame(()=>{skyHoverFrame=null;const hit=nearestSky(event),tooltip=$('sky-tooltip');$('sky-canvas').style.cursor=hit?'pointer':'crosshair';tooltip.hidden=!hit;if(hit){tooltip.textContent=`${hit.star.name || hit.star.id} · ${fmt(hit.star.period_days,2)} d`;const width=$('sky-map').clientWidth;tooltip.style.left=`${Math.min(hit.x+10,width-170)}px`;tooltip.style.top=`${Math.max(0,hit.y-35)}px`;}});});
$('sky-canvas').addEventListener('mouseleave',()=>{$('sky-tooltip').hidden=true;});
new ResizeObserver(drawSky).observe($('sky-map'));
['parallel-fraction','processor-count'].forEach(id=>$(id).addEventListener('input',updateTheory));
$('cluster-form').addEventListener('submit',runCluster);$('cluster-tasks').addEventListener('change',()=>{if(!state.clusterJob)taskTiles(Number($('cluster-tasks').value));});
$('lightcurve-notice').addEventListener('click',event=>{if((event.target instanceof Element ? event.target : null)?.closest('#return-example'))selectStar(state.status?.example_star_id || 'OGLE-BLG-LPV-096697');});
document.querySelectorAll('.topbar nav a').forEach(link=>link.addEventListener('click',()=>{document.querySelectorAll('.topbar nav a').forEach(l=>l.classList.toggle('active',l===link));}));

async function initialize() {
  updateTheory();taskTiles(Number($('cluster-tasks').value));
  const results=await Promise.allSettled([api<Status>('/api/status'),loadCatalogue(),api<Star[]>('/api/sky')]);
  if(results[0].status==='fulfilled'){state.status=results[0].value;const available=state.status.native_available;$('engine-status').innerHTML=`<span class="status-dot"></span>${available?'C++ engine ready':'Native engine unavailable'}`;$('engine-status').classList.toggle('unavailable',!available);updateClusterStar();}
  else {$('engine-status').innerHTML='<span class="status-dot"></span>Engine status unavailable';$('engine-status').classList.add('unavailable');}
  if(results[2].status==='fulfilled'){state.sky=results[2].value;const regions=[...new Set(state.sky.map(s=>s.region).filter(Boolean))].sort();regions.forEach(region=>$('region-filter').add(new Option(region,region)));filterSky();}
  else {$('sky-count').textContent='Sky unavailable';$('period-distribution').innerHTML='<p class="empty-message">Catalogue visualization is unavailable.</p>';toast(errorMessage(results[2].reason));}
  if(state.status?.example_star_id)selectStar(state.status.example_star_id);
  else if(state.items.length)selectStar(state.items[0].id);
}
initDiscovery();
initialize().catch(error=>toast(errorMessage(error)));
