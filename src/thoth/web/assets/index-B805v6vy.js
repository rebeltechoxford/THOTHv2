(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();function W(n){const e=document.getElementById(n);if(!e)throw new Error(`Missing interface element: ${n}`);return e}const bt=n=>n instanceof Error?n.message:String(n);async function Bt(n,e={}){const t=await fetch(n,e);let i;try{i=await t.json()}catch{throw new Error(`The server returned an unexpected response (${t.status}).`)}if(!t.ok){const s=typeof i=="object"&&i!==null&&"detail"in i?i.detail:null;throw new Error(typeof s=="string"?s:`Request failed (${t.status}).`)}return i}function Hs(n,e){return Bt(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}const Me=n=>{const e=document.getElementById(n);if(!e)throw new Error(`Missing lab element: ${n}`);return e},We=n=>{const e=Me(n);if(!(e instanceof HTMLInputElement||e instanceof HTMLSelectElement))throw new Error(`Expected control: ${n}`);return e},Yt=n=>{const e=Me(n);if(!(e instanceof HTMLButtonElement))throw new Error(`Expected button: ${n}`);return e},hc=n=>{const e=We(n);if(!(e instanceof HTMLInputElement))throw new Error(`Expected slider: ${n}`);return e},et=(n,e=3)=>typeof n=="number"&&Number.isFinite(n)?n.toLocaleString(void 0,{maximumFractionDigits:e}):"—",qt=n=>String(n??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e),nn=["#efac7d","#b09aec","#61d7de","#8dd8ae","#e68fa4"];function td(n){const e=n.filter(Number.isFinite);if(!e.length)return[0,1];const t=Math.min(...e),i=Math.max(...e),s=Math.max((i-t)*.09,Math.abs(i)*.001,.01);return[t-s,i+s]}function Ki(n){const e=window.matchMedia("(max-width: 640px)").matches,t=e?460:620,i=e?300:275,s=e?63:52,r=e?20:15,a=15,o=e?51:43,l=e?3:4,c=e?' style="font-size:16px"':"",p=n.series.flatMap(f=>f.points).filter(f=>Number.isFinite(f.x)&&Number.isFinite(f.y)),m=n.xRange??td(p.map(f=>f.x)),u=n.yRange??td(p.map(f=>f.y)),d=f=>s+(f-m[0])/(m[1]-m[0]||1)*(t-s-r),g=f=>a+(n.reverseY?f-u[0]:u[1]-f)/(u[1]-u[0]||1)*(i-a-o);let y="";for(let f=0;f<=l;f++){const h=m[0]+f/l*(m[1]-m[0]),M=u[0]+f/l*(u[1]-u[0]);y+=`<line x1="${s}" x2="${t-r}" y1="${g(M)}" y2="${g(M)}" class="chart-grid"/><text x="${s-8}" y="${g(M)+(e?5:3)}" text-anchor="end" class="chart-text"${c}>${qt(et(M,2))}</text><text x="${d(h)}" y="${i-o+(e?24:18)}" text-anchor="middle" class="chart-text"${c}>${qt(et(h,m[1]-m[0]<.1?5:m[1]-m[0]<3?2:0))}</text>`}n.zeroLine&&u[0]<=0&&u[1]>=0&&(y+=`<line x1="${s}" x2="${t-r}" y1="${g(0)}" y2="${g(0)}" stroke="#597082" stroke-dasharray="4 4"/>`);for(const f of n.series){const h=f.points.filter(M=>Number.isFinite(M.x)&&Number.isFinite(M.y));if(f.scatter){const M=Math.max(1,Math.ceil(h.length/1800));y+=h.filter((R,b)=>b%M===0).map(R=>`<circle cx="${d(R.x)}" cy="${g(R.y)}" r="1.8" fill="${R.color??f.color}" opacity="${f.opacity??.55}"><title>${qt(R.label??`${et(R.x)} · ${et(R.y)}`)}</title></circle>`).join("")}else y+=`<path d="${h.map((M,R)=>`${R?"L":"M"}${d(M.x).toFixed(2)},${g(M.y).toFixed(2)}`).join(" ")}" fill="none" stroke="${f.color}" stroke-width="1.7" opacity="${f.opacity??1}"${f.dashed?' stroke-dasharray="4 4"':""}/>`}return n.markerX!==void 0&&(y+=`<line x1="${d(n.markerX)}" x2="${d(n.markerX)}" y1="${a}" y2="${i-o}" stroke="#e9bb8c" opacity=".8" stroke-dasharray="3 4"/>`),n.highlight&&(y+=`<circle cx="${d(n.highlight.x)}" cy="${g(n.highlight.y)}" r="5" stroke="#efac7d" stroke-width="1.5" fill="#0e1623"/>`),y+=`<line x1="${s}" x2="${t-r}" y1="${i-o}" y2="${i-o}" class="chart-axis"/><text x="${t/2}" y="${i-4}" text-anchor="middle" class="chart-label"${c}>${qt(n.xLabel)}</text><text transform="translate(${e?17:12} ${i/2}) rotate(-90)" text-anchor="middle" class="chart-label"${c}>${qt(n.yLabel)}</text>`,`<svg viewBox="0 0 ${t} ${i}" role="img" aria-label="${qt(n.label)}">${y}</svg>`}let La=null,il=null,ws="OGLE-BLG-LPV-096697",sl=!1,Tn=null,Fs=0,As=null,Eu;const or=new Map;let Zi=null,rl="displacement",mi=0,Or=0,al,Rs=null,xa=0,ya=0;function Yh(n){La=n;const e=We("research-source");if(!(e instanceof HTMLSelectElement))return;const t=e.querySelector('option[value="selected"]');t?t.textContent=`Selected star · ${n.name||n.id}`:e.add(new Option(`Selected star · ${n.name||n.id}`,"selected")),n.id===ws&&(il=n,!Tn&&!sl&&e.value==="example"&&Ma(n))}function Ma(n){const e=n?.period_days;e&&e>0&&(We("research-min").value=String(Math.max(10,Math.floor(e*.65))),We("research-max").value=String(Math.min(5e3,Math.ceil(e*1.5))))}function Tu(n){const e=`dataset:${n.dataset_id}`,t=or.has(e);or.set(e,n);const i=We("research-source");return!t&&i instanceof HTMLSelectElement&&i.add(new Option(`${n.name} · ${n.band} band · ${n.time_system} · ${n.observations_count.toLocaleString()} points`,e)),e}function nd(n){return{prepare:"Preparing observations",preparing:"Preparing observations",model_comparison:"Challenging competing Fourier models",compare_models:"Challenging competing Fourier models",aliases:"Searching competing frequency peaks",cadence:"Examining the sampling window",stability:"Comparing early and late cycles",period_stability:"Comparing early and late cycles",observation_planning:"Finding discriminating observation times",planning:"Finding discriminating observation times",complete:"Evidence ready to explore"}[n]??n.replaceAll("_"," ")}function Kh(n){return{model_comparison:"compare_models",aliases:"cadence",stability:"period_stability",observation_planning:"planning"}[n]??n}async function Zh(n){if(n.preventDefault(),As)return;const e=Number(We("research-min").value),t=Number(We("research-max").value);if(!Number.isFinite(e)||!Number.isFinite(t)||e<=0||e>=t){wu("Choose a positive minimum period and a greater maximum period.");return}const i=We("research-source").value,s=Number(We("research-samples").value),r=Math.min(3e3,Math.floor(48e6/(12*s))),a={...or.has(i)?{dataset_id:or.get(i).dataset_id}:{star_id:i==="selected"?La?.id??ws:ws},min_period:e,max_period:t,samples:s,threads:Number(We("research-threads").value),observations_limit:r};Yt("research-run").disabled=!0,Yt("research-run").textContent="Preparing the investigation…",Me("research-error").hidden=!0,Me("research-results").hidden=!0,Me("research-state").textContent="Queued",Me("research-progress").style.width="0%",Me("research-percent").textContent="0%",Me("research-heading").textContent="Preparing observations",Me("research-events").innerHTML=`<li><span class="timeline-dot"></span><div>Experiment submitted<small>${qt(or.get(i)?.name??(i==="selected"?La?.name:ws))} · ${et(e,0)}–${et(t,0)} days</small></div></li>`,document.querySelectorAll(".research-pipeline>span").forEach(o=>o.className="");try{As=(await Hs("/api/research/jobs",a)).job_id,await Au()}catch(o){ba(bt(o))}}function wu(n){Me("research-error").textContent=n,Me("research-error").hidden=!1}function ba(n){clearTimeout(Eu),As=null,Me("research-state").textContent="Failed",Me("research-heading").textContent="The investigation needs attention",wu(n),Yt("research-run").disabled=!1,Yt("research-run").textContent="✦ Investigate the unknowns"}async function Au(){if(As)try{const n=await Bt(`/api/research/jobs/${encodeURIComponent(As)}`),e=n.progress?.stage??n.state,t=n.state==="complete"?100:Math.min(100,Math.max(0,n.progress?.percent??0));Me("research-progress").style.width=`${t}%`,Me("research-percent").textContent=`${Math.round(t)}%`,Me("research-heading").textContent=nd(e),Me("research-state").textContent=n.state==="complete"?"Complete":n.state==="failed"?"Failed":"Computing",Me("research-detail").textContent=n.progress?.detail??"Python is coordinating the native computation.";const i=n.events??[];i.length&&(Me("research-events").innerHTML=i.slice(-7).map(a=>`<li><span class="timeline-dot"></span><div>${qt(nd(a.stage))}<small>${a.elapsed_seconds===void 0?"":`${et(a.elapsed_seconds,2)} s · `}${qt(a.detail)}</small></div></li>`).join(""));const s=["compare_models","cadence","period_stability","planning"],r=s.indexOf(Kh(e));if(document.querySelectorAll(".research-pipeline>span").forEach(a=>{const o=s.indexOf(a.dataset.stage??"");a.classList.toggle("active",o===r&&n.state!=="complete"),a.classList.toggle("done",n.state==="complete"||o<r)}),n.state==="failed"){ba(n.error??"The research computation failed.");return}if(n.state==="complete"){if(!n.result){ba("The completed job did not include an evidence report.");return}Tn=n.result,window.dispatchEvent(new CustomEvent("thoth:research-result",{detail:n.result})),Fs=0,As=null,Yt("research-run").disabled=!1,Yt("research-run").textContent="✦ Investigate the unknowns",Me("research-heading").textContent="Evidence ready to explore",jh();return}Eu=setTimeout(()=>{Au()},550)}catch(n){ba(bt(n))}}function Br(n,e,t,i){return`<div><span>${qt(n)}</span><strong>${qt(e)}<small>${qt(t)}</small></strong><p>${qt(i)}</p></div>`}function Jh(n,e,t=0){for(const i of e)if(typeof n[i]=="number")return n[i];return t}function jh(){if(!Tn)return;const n=Tn,e=n.selected_model,t=Jh(n.computation,["native_seconds","total_native_seconds","elapsed_seconds"]);Me("research-summary").innerHTML=Br("TRAINING-SELECTED PERIOD",et(e.period_days,4),"days",`${e.harmonics} harmonics · earlier ${n.training_observations.toLocaleString()} observations`)+Br("WITHHELD PREDICTION ERROR",et(e.holdout_rmse_mag,4),"mag",`Unweighted RMSE · later ${n.holdout_observations.toLocaleString()} observations`)+Br("FULL-DATA CANDIDATES",String(n.candidates.length),"rhythms","Lens curves use all observations")+Br("OBSERVATIONS TESTED",n.residuals.length.toLocaleString(),"points",`Native compute: ${et(t,3)} s`);const i=Math.max(...n.models.map(d=>d.holdout_weighted_rmse_mag),.001);Me("model-comparison").innerHTML=n.models.map(d=>`<div class="model-bar-row ${d.harmonics===e.harmonics?"winner":""}"><span>${d.harmonics} harmonic${d.harmonics===1?"":"s"}${d.harmonics===e.harmonics?" ✦":""}</span><div class="model-bar"><i style="width:${Math.max(1,d.holdout_weighted_rmse_mag/i*100)}%"></i></div><strong>${et(d.holdout_weighted_rmse_mag,4)}</strong></div>`).join(""),Me("model-table").innerHTML=n.models.map(d=>`<tr><td>${d.harmonics===e.harmonics?"✦ ":""}${d.harmonics}</td><td>${et(d.period_days,3)}</td><td>${et(d.holdout_weighted_rmse_mag,4)}</td><td>${et(d.bic,1)}</td></tr>`).join(""),Me("hypothesis-options").innerHTML=n.candidates.map((d,g)=>`<button type="button" class="${g===Fs?"active":""}" data-candidate="${g}" aria-pressed="${g===Fs}">${g===0?"Leading":`Alternative ${g}`}<br>${et(d.period_days,2)} d</button>`).join("");const s=n.periodogram.frequencies,r=n.periodogram.powers,a=[Math.min(...s),Math.max(...s)],o=s.map((d,g)=>({x:d,y:r[g]??NaN})).filter(d=>Number.isFinite(d.x)&&Number.isFinite(d.y)).sort((d,g)=>d.x-g.x),l=n.spectral_window.frequencies.map((d,g)=>({x:d,y:n.spectral_window.powers[g]})).filter(d=>Number.isFinite(d.x)&&Number.isFinite(d.y)&&d.x>=a[0]&&d.x<=a[1]).sort((d,g)=>d.x-g.x);Me("cadence-chart").innerHTML=Ki({label:"Period search and native spectral window; shared peaks can indicate cadence aliases",xLabel:"Trial frequency / day⁻¹",yLabel:"Relative response",xRange:a,yRange:[0,Math.max(1,...o.map(d=>d.y),...l.map(d=>d.y))*1.05],series:[{points:o,color:nn[1]},{points:l,color:nn[2],opacity:.6}],markerX:1/e.period_days});const c=Math.floor(Math.min(...n.residuals.map(d=>d.time_jd))/1e3)*1e3;Me("residual-chart").innerHTML=Ki({label:"Training and withheld residuals around zero",xLabel:`Observation time − ${c} / days`,yLabel:"Observed − predicted / mag",zeroLine:!0,series:[{points:n.residuals.filter(d=>d.partition==="training").map(d=>({x:d.time_jd-c,y:d.residual_mag,label:`Training residual ${et(d.residual_mag,4)} mag`})),color:nn[2],scatter:!0},{points:n.residuals.filter(d=>d.partition==="holdout").map(d=>({x:d.time_jd-c,y:d.residual_mag,label:`Withheld residual ${et(d.residual_mag,4)} mag`})),color:nn[0],scatter:!0}]}),Me("stability-windows").innerHTML=n.stability.map(d=>`<div><small>${qt(d.label)}</small><strong>${et(d.period_days,2)} d</strong><small>${d.n_observations.toLocaleString()} observations</small></div>`).join(""),Me("plan-shortcuts").innerHTML=n.observation_plan.slice(0,3).map((d,g)=>`<button type="button" data-plan-day="${d.days_after_last_observation}">Test ${g+1} · +${et(d.days_after_last_observation,1)} d</button>`).join("");const p=Math.ceil(n.planning_horizon_days);hc("plan-scrub").max=String(p),We("plan-scrub").value=String(n.observation_plan[0]?.days_after_last_observation??0);const m={native_seconds:"Native C++ time / s",total_seconds:"Python pipeline elapsed / s",trial_frequency_evaluations:"Trial frequencies fitted",observation_frequency_harmonic_evaluations:"Observation × frequency × harmonic evaluations",frequency_scans:"Native frequency scans",samples_per_scan:"Trial frequencies per scan",threads_requested:"C++ threads requested",threads_used:"C++ threads used"},u=Object.entries(n.computation).filter(([,d])=>typeof d=="string"||typeof d=="number"||typeof d=="boolean");Me("research-computation").innerHTML=u.map(([d,g])=>`<span>${qt(m[d]??d.replaceAll("_"," "))}: <b>${qt(typeof g=="number"?et(g,d.includes("seconds")?4:0):g)}</b></span>`).join(""),Me("research-caveats").innerHTML=n.caveats.map(d=>`<p>${qt(d)}</p>`).join(""),ol(),ll(),Me("research-results").hidden=!1}function Da(n,e){const t=(e-n.reference_epoch_jd)/n.period_days;let i=n.coefficients[0];for(let s=1;s<=Math.floor((n.coefficients.length-1)/2);s++){const r=2*Math.PI*s*t;i+=n.coefficients[2*s-1]*Math.sin(r)+n.coefficients[2*s]*Math.cos(r)}return i}function ol(){if(!Tn)return;const n=Tn.candidates[Fs];if(!n){Me("hypothesis-chart").innerHTML='<p class="empty-message">No candidate coefficients were returned.</p>';return}const e=Number(We("phase-scrub").value),t=Tn.residuals.map(r=>({x:((r.time_jd-n.reference_epoch_jd)/n.period_days%1+1)%1,y:r.observed_magnitude,color:r.partition==="holdout"?nn[1]:nn[2],label:`${r.partition} · ${et(r.observed_magnitude)} mag`})),i=Array.from({length:201},(r,a)=>({x:a/200,y:Da(n,n.reference_epoch_jd+a/200*n.period_days)})),s=Da(n,n.reference_epoch_jd+e*n.period_days);Me("hypothesis-chart").innerHTML=Ki({label:`Observations folded at candidate ${et(n.period_days,3)} days`,xLabel:"Phase / cycles",yLabel:"Magnitude ↑ brighter",reverseY:!0,xRange:[0,1],series:[{points:t,color:nn[2],scatter:!0},{points:i,color:nn[0]}],markerX:e,highlight:{x:e,y:s}}),Me("hypothesis-period").textContent=`${et(n.period_days,3)} days`,Me("phase-readout").textContent=`${et(e,2)} cycles · ${et(s,3)} mag`,document.querySelectorAll("[data-candidate]").forEach(r=>{const a=Number(r.dataset.candidate)===Fs;r.classList.toggle("active",a),r.setAttribute("aria-pressed",String(a))})}function ll(){if(!Tn||!Tn.candidates.length)return;const n=Number(We("plan-scrub").value),e=Number(hc("plan-scrub").max),t=Tn.planning_anchor_jd,i=Tn.candidates,s=i.map(o=>Da(o,t+n)),r=Math.max(...s)-Math.min(...s),a=i.map((o,l)=>({color:nn[l%nn.length],points:Array.from({length:301},(c,p)=>({x:p/300*e,y:Da(o,t+p/300*e)}))}));Me("plan-chart").innerHTML=Ki({label:"Competing empirical predictions after the final observation",xLabel:"Days after final observation",yLabel:"Predicted magnitude ↑ brighter",reverseY:!0,xRange:[0,e],series:a,markerX:n}),Me("plan-day").textContent=`+${et(n,1)} d · ${et(t+n,2)}`,Me("plan-spread").textContent=`${et(r,3)} mag spread`,Me("plan-predictions").innerHTML=i.map((o,l)=>`<div style="border-color:${nn[l%nn.length]}"><small>${et(o.period_days,2)} d hypothesis</small><strong>${et(s[l],3)} mag</strong></div>`).join("")}async function Qh(n){n.preventDefault();const e=We("dataset-file"),t=e instanceof HTMLInputElement?e.files?.[0]:null;if(!t){Me("upload-status").textContent="Choose a CSV file first.";return}if(t.size>5*1024*1024){Me("upload-status").textContent="This interactive lab accepts CSV files up to 5 MB.";return}Yt("upload-button").disabled=!0,Me("upload-status").textContent="Validating the observations…";try{const i=await Hs("/api/datasets",{name:We("dataset-name").value.trim(),csv_text:await t.text(),band:We("dataset-band").value.trim(),time_system:We("dataset-time").value}),s=Tu(i),r=We("research-source");r.value=s,Me("upload-status").textContent=`${i.name}: ${i.observations_count.toLocaleString()} validated ${i.band}-band observations. Ready to investigate.`,We("research-min").value="50",We("research-max").value="1000"}catch(i){Me("upload-status").textContent=bt(i)}finally{Yt("upload-button").disabled=!1}}function Ru(){return{period_days:Number(We("sim-period").value),damping:Number(We("sim-damping").value),drive:Number(We("sim-drive").value),nonlinearity:Number(We("sim-nonlinearity").value),cycles:6,steps_per_cycle:200}}function fo(){const n=Ru();Me("sim-period-label").textContent=`${n.period_days} d`;for(const e of["damping","drive","nonlinearity"])Me(`sim-${e}-label`).textContent=n[e].toFixed(3)}async function kr(n){n?.preventDefault(),lr(),clearTimeout(al);const e=++Or;Yt("simulation-run").disabled=!0,Yt("simulation-run").textContent="C++ is integrating two resolutions…",Me("simulation-status").textContent="RK4 solves the oscillator at Δτ and Δτ/2, then compares the trajectories and energy bookkeeping.";try{const t=await Hs("/api/simulation",Ru());if(e!==Or)return;Zi=t,mi=0,window.dispatchEvent(new CustomEvent("thoth:simulation-result",{detail:t})),hc("sim-scrub").max=String(t.times_days.length-1),We("sim-scrub").value="0",We("sim-scrub").disabled=!1,Yt("simulation-play").disabled=!1,Me("simulation-equation").textContent=t.equation,Me("simulation-status").textContent=`${t.times_days.length.toLocaleString()} states · ${et(t.native_seconds,5)} s native C++ compute. Sliders now rerun the native solver as you explore.`,Me("simulation-metrics").innerHTML=`<div><span>NATIVE INTEGRATION</span><strong>${et(t.native_seconds*1e3,3)} ms</strong><small>Two RK4 resolutions</small></div><div><span>STEP REFINEMENT DIFFERENCE</span><strong>${t.convergence.max_displacement_difference.toExponential(2)}</strong><small>max |xΔτ − xΔτ/2|</small></div><div><span>ENERGY BALANCE ERROR</span><strong>${t.convergence.energy_balance_error.toExponential(2)}</strong><small>E − E₀ − work + loss</small></div>`,Me("simulation-caveat").textContent=`The disc illustrates toy displacement, not stellar radius or luminosity. ${(t.caveats??[]).join(" ")}`,Ia()}catch(t){e===Or&&(Me("simulation-status").textContent=bt(t))}finally{e===Or&&(Yt("simulation-run").disabled=!1,Yt("simulation-run").textContent="Integrate in native C++ ↗")}}function Ia(){if(!Zi)return;const n=Zi,e=n.times_days[mi],t=n.displacement[mi],i=n.velocity[mi],s=1+.27*Math.tanh(t);if(Me("sandbox-star").style.transform=`scale(${s})`,Me("sim-displacement").textContent=`${t>=0?"+":""}${et(t,4)}`,Me("sim-time").textContent=`${et(e,1)} days · velocity ${et(i,3)}`,Me("sim-step-label").textContent=`${mi.toLocaleString()} / ${(n.times_days.length-1).toLocaleString()}`,We("sim-scrub").value=String(mi),rl==="phase")Me("simulation-chart").innerHTML=Ki({label:"Native oscillator phase portrait with selected state",xLabel:"Dimensionless displacement",yLabel:"Dimensionless velocity",series:[{points:n.displacement.map((r,a)=>({x:r,y:n.velocity[a]})),color:nn[2]}],highlight:{x:t,y:i},zeroLine:!0});else if(rl==="energy"){const r=n.energy.map((a,o)=>n.energy[0]+n.drive_work[o]-n.dissipated_energy[o]);Me("simulation-chart").innerHTML=Ki({label:"Native oscillator energy and accumulated forcing work minus dissipation",xLabel:"Simulation time / days",yLabel:"Dimensionless energy",series:[{points:n.energy.map((a,o)=>({x:n.times_days[o],y:a})),color:nn[0]},{points:r.map((a,o)=>({x:n.times_days[o],y:a})),color:nn[2],dashed:!0}],markerX:e})}else Me("simulation-chart").innerHTML=Ki({label:"Native oscillator displacement over time and selected state",xLabel:"Simulation time / days",yLabel:"Dimensionless displacement",series:[{points:n.displacement.map((r,a)=>({x:n.times_days[a],y:r})),color:nn[0]}],markerX:e,highlight:{x:e,y:t},zeroLine:!0})}function lr(){Rs!==null&&cancelAnimationFrame(Rs),Rs=null,xa=0,ya=0,Yt("simulation-play").textContent="Play cycle ▶"}function Cu(n){if(!Zi||document.hidden){lr();return}xa&&(ya+=Math.min(100,n-xa)*.06),xa=n;const e=Math.floor(ya);e>0&&(ya-=e,mi=(mi+e)%Zi.times_days.length,Ia()),Rs=requestAnimationFrame(Cu)}function ef(){const n=URL.createObjectURL(new Blob([JSON.stringify(Tn,null,2)],{type:"application/json"})),e=document.createElement("a");e.href=n,e.download="thoth-discovery-evidence.json",e.click(),setTimeout(()=>URL.revokeObjectURL(n),1e3)}function id(){const n=Number(We("research-samples").value),e=Math.min(3e3,Math.floor(48e6/(12*n)));Me("research-budget").textContent=`Up to ${e.toLocaleString()} observations · six frequency scans · up to ${(6*n).toLocaleString()} trial fits. Larger datasets use a reproducible subset across their full time baseline.`}function tf(){Me("research-form").addEventListener("submit",n=>{Zh(n)}),We("research-source").addEventListener("change",()=>{We("research-source").value==="selected"?Ma(La):We("research-source").value==="example"&&Ma(il)});for(const n of["research-min","research-max"])We(n).addEventListener("input",()=>{sl=!0});We("research-samples").addEventListener("change",id),Me("upload-form").addEventListener("submit",n=>{Qh(n)}),Me("hypothesis-options").addEventListener("click",n=>{const e=n.target instanceof Element?n.target.closest("[data-candidate]"):null;e&&(Fs=Number(e.dataset.candidate),ol())}),We("phase-scrub").addEventListener("input",ol),We("plan-scrub").addEventListener("input",ll),Me("plan-shortcuts").addEventListener("click",n=>{const e=n.target instanceof Element?n.target.closest("[data-plan-day]"):null;e?.dataset.planDay&&(We("plan-scrub").value=e.dataset.planDay,ll())}),Yt("research-export").addEventListener("click",ef),Me("simulation-form").addEventListener("submit",n=>{kr(n)});for(const n of["sim-period","sim-damping","sim-drive","sim-nonlinearity"])We(n).addEventListener("input",()=>{fo(),Zi&&(lr(),clearTimeout(al),Me("simulation-status").textContent="Parameters changed · updating the native integration…",al=setTimeout(()=>{kr()},500))});document.querySelectorAll("[data-preset]").forEach(n=>n.addEventListener("click",()=>{const t={conservative:{damping:0,drive:0,nonlinearity:.2},damped:{damping:.15,drive:0,nonlinearity:.2},driven:{damping:.035,drive:.4,nonlinearity:.5}}[n.dataset.preset??""];if(t){for(const i of["damping","drive","nonlinearity"])We(`sim-${i}`).value=String(t[i]);fo(),kr()}})),document.querySelectorAll("[data-sim-chart]").forEach(n=>n.addEventListener("click",()=>{const e=n.dataset.simChart;e!=="displacement"&&e!=="phase"&&e!=="energy"||(rl=e,document.querySelectorAll("[data-sim-chart]").forEach(t=>t.setAttribute("aria-selected",String(t===n))),Ia())})),We("sim-scrub").addEventListener("input",()=>{lr(),mi=Number(We("sim-scrub").value),Ia()}),Yt("simulation-play").addEventListener("click",()=>{Rs!==null?lr():Zi&&(Yt("simulation-play").textContent="Pause cycle Ⅱ",Rs=requestAnimationFrame(Cu))}),fo(),id(),Bt("/api/datasets").then(n=>{n.items.forEach(Tu)}).catch(()=>{}),Bt("/api/status").then(n=>(ws=n.example_star_id,n.native_available&&kr(),Bt(`/api/stars/${encodeURIComponent(ws)}`))).then(n=>{il=n,!sl&&!Tn&&We("research-source").value==="example"&&Ma(n)}).catch(()=>{})}const ne={page:1,pageSize:25,total:0,sort:"period_days",direction:"asc",items:[],sky:[],visibleSky:[],selected:null,curve:null,fit:null,status:null,request:0,selection:0,skyPoints:[],clusterJob:null},Ct=n=>n==null||n===""?null:Number.isFinite(Number(n))?Number(n):null,Be=(n,e=2)=>Ct(n)===null?"—":Number(n).toLocaleString(void 0,{maximumFractionDigits:e,minimumFractionDigits:e}),wn=n=>Ct(n)===null?"—":Number(n).toLocaleString(),nf={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},ct=n=>String(n??"").replace(/[&<>"']/g,e=>nf[e]),sf=n=>typeof n=="string"&&(/^https?:\/\//i.test(n)||/^\/(?!\/)/.test(n))?n:null,cl=(n,e)=>sf(n)?`<a href="${ct(n)}" target="_blank" rel="noopener noreferrer">${ct(e)} ↗</a>`:"";let sd,Na,Pu;const dl=n=>{const e=W(n);if(!(e instanceof HTMLInputElement||e instanceof HTMLSelectElement))throw new Error(`Expected input: ${n}`);return e};function Gs(n){W("toast").textContent=n,W("toast").hidden=!1,clearTimeout(sd),sd=setTimeout(()=>{W("toast").hidden=!0},7e3)}function rd(){const n=new URLSearchParams({page:String(ne.page),page_size:String(ne.pageSize),sort:ne.sort,direction:ne.direction});return[["search","search"],["catalog","catalog-filter"],["region","region-filter"],["min_period","min-period"],["max_period","max-period"]].forEach(([e,t])=>{dl(t).value.trim()&&n.set(e,dl(t).value.trim())}),n}async function Cr(){const n=++ne.request;W("star-table").setAttribute("aria-busy","true");try{const e=await Bt(`/api/catalog?${rd()}`);if(n!==ne.request)return;ne.items=e.items||[],ne.total=e.total||0,ne.page=e.page||ne.page,Lu(),rf(e.summary||{},e.manifest||{}),af();const t=rd();["page","page_size","sort","direction"].forEach(i=>t.delete(i)),W("catalogue-export").href=`/api/export/catalog?${t}`}catch(e){n===ne.request&&(W("star-table").innerHTML=`<tr><td colspan="5" class="table-empty">${ct(bt(e))}</td></tr>`,Gs(bt(e)))}finally{n===ne.request&&W("star-table").removeAttribute("aria-busy")}}function rf(n,e){W("metric-stars").textContent=wn(n.total_stars),W("metric-periods").textContent=wn(n.with_period),W("metric-median").innerHTML=`${Be(n.median_period_days,1)}<small>d</small>`;const t=Array.isArray(n.catalogs)?n.catalogs:Object.keys(n.catalogs||{});W("metric-catalogues").textContent=String(t.length||"—");const i=t.map(r=>typeof r=="string"?r:r.name).filter(Boolean);W("metric-source-note").textContent=i.join(" · ")||"Published source catalogues";const s=e.retrieved_utc?new Date(e.retrieved_utc).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric",timeZone:"UTC"}):null;W("coverage-note").lastElementChild.textContent=(n.coverage_note||"Published catalogue records may overlap across sources. This inventory is not a complete census of every known Mira.")+(s?` Snapshot retrieved ${s} (UTC).`:""),W("catalog-filter").options.length===1&&i.forEach(r=>W("catalog-filter").add(new Option(r,r)))}function Lu(){W("star-table").innerHTML=ne.items.length?ne.items.map(t=>`<tr data-id="${ct(t.id)}" class="${ne.selected?.id===t.id?"selected":""}"><td><button class="star-button" data-star="${ct(t.id)}">${ct(t.name||t.id)}</button><span class="star-region">${ct(t.region||"Region not provided")}</span></td><td class="period-cell">${Be(t.period_days,2)}${Ct(t.period_days)!==null?'<span class="unit">d</span>':""}</td><td>${Be(t.mean_i_mag,2)}</td><td>${Be(t.amplitude_i_mag,2)}</td><td><span class="source-tag ${String(t.catalog).toLowerCase().includes("ogle")?"ogle":"gcvs"}">${ct(t.catalog||"—")}</span></td></tr>`).join(""):'<tr><td colspan="5" class="table-empty">No records match these filters. Try a different name or period range.</td></tr>';const n=ne.total?(ne.page-1)*ne.pageSize+1:0,e=Math.min(ne.page*ne.pageSize,ne.total);W("result-count").textContent=`${wn(ne.total)} records`,W("page-label").textContent=`${wn(n)}–${wn(e)} of ${wn(ne.total)} records`,W("page-number").textContent=String(ne.page),W("prev-page").disabled=ne.page<=1,W("next-page").disabled=e>=ne.total}function af(){document.querySelectorAll(".sort-button").forEach(n=>{n.lastElementChild.textContent=n.dataset.sort===ne.sort?ne.direction==="asc"?"↑":"↓":"",n.closest("th").setAttribute("aria-sort",n.dataset.sort===ne.sort?ne.direction==="asc"?"ascending":"descending":"none")})}function ja(n=!1){const e=Ct(W("min-period").value),t=Ct(W("max-period").value);if(e!==null&&t!==null&&e>t){Gs("Minimum period must be less than the maximum period.");return}ne.page=1,Cr(),n&&Du()}function Du(){const n=W("catalog-filter").value,e=W("region-filter").value;ne.visibleSky=ne.sky.filter(t=>(!n||t.catalog===n)&&(!e||t.region===e)),W("sky-count").textContent=`${wn(ne.visibleSky.length)} positions`,fc(),of()}function ad(n,e,t){const i=Ct(n.ra_deg),s=Ct(n.dec_deg);return i===null||s===null?null:{x:43+(360-i)/360*(e-58),y:20+(90-s)/180*(t-54)}}function fc(){const n=W("sky-canvas"),e=n.getBoundingClientRect();if(!e.width)return;const t=e.width,i=e.height,s=Math.min(devicePixelRatio||1,2);n.width=Math.round(t*s),n.height=Math.round(i*s);const r=n.getContext("2d");if(r){r.scale(s,s),r.clearRect(0,0,t,i),r.font='8px "DM Sans",sans-serif',r.fillStyle="#7890a8",r.strokeStyle="#223448",r.lineWidth=.6;for(let a=0;a<=360;a+=60){const o=43+(360-a)/360*(t-58);r.beginPath(),r.moveTo(o,20),r.lineTo(o,i-34),r.stroke(),r.textAlign="center",r.fillText(`${a}°`,o,i-19)}for(let a=-60;a<=60;a+=30){const o=20+(90-a)/180*(i-54);r.beginPath(),r.moveTo(43,o),r.lineTo(t-15,o),r.stroke(),r.textAlign="right",r.fillText(`${a>0?"+":""}${a}°`,35,o+3)}r.fillStyle="#90a8bf",r.textAlign="center",r.fillText("Right ascension",t/2,i-3),r.save(),r.translate(9,i/2),r.rotate(-Math.PI/2),r.fillText("Declination",0,0),r.restore(),r.fillStyle=ne.visibleSky.length>1e4?"#61d7de55":"#61d7de99",ne.skyPoints=[];for(const a of ne.visibleSky){const o=ad(a,t,i);o&&(r.fillRect(o.x-.65,o.y-.65,1.3,1.3),ne.skyPoints.push({...o,star:a}))}if(ne.selected){const a=ad(ne.selected,t,i);a&&(r.strokeStyle="#f6bd73",r.lineWidth=1,r.beginPath(),r.arc(a.x,a.y,5,0,2*Math.PI),r.stroke(),r.beginPath(),r.moveTo(a.x-10,a.y),r.lineTo(a.x-7,a.y),r.moveTo(a.x+7,a.y),r.lineTo(a.x+10,a.y),r.moveTo(a.x,a.y-10),r.lineTo(a.x,a.y-7),r.moveTo(a.x,a.y+7),r.lineTo(a.x,a.y+10),r.stroke(),r.fillStyle="#f6bd73",r.beginPath(),r.arc(a.x,a.y,1.8,0,2*Math.PI),r.fill())}}}function Iu(n){const e=W("sky-canvas").getBoundingClientRect(),t=n.clientX-e.left,i=n.clientY-e.top;let s=null,r=64;for(const a of ne.skyPoints){const o=(a.x-t)**2+(a.y-i)**2;o<r&&(r=o,s=a)}return s}function Os(n,e,t,i,s,r,{reverseY:a=!1,xFormat:o=null,yFormat:l=null,ticks:c=5}={}){const p={l:52,r:18,t:13,b:42},m=n-p.l-p.r,u=e-p.t-p.b,d=f=>p.l+(f-t[0])/(t[1]-t[0]||1)*m,g=f=>p.t+(a?f-i[0]:i[1]-f)/(i[1]-i[0]||1)*u;let y="";for(let f=0;f<=c;f++){const h=t[0]+f/c*(t[1]-t[0]),M=i[0]+f/c*(i[1]-i[0]),R=d(h),b=g(M);y+=`<line x1="${p.l}" y1="${b}" x2="${n-p.r}" y2="${b}" class="chart-grid"/><text x="${p.l-9}" y="${b+3}" text-anchor="end" class="chart-text">${ct(l?l(M):Be(M,1))}</text><text x="${R}" y="${e-p.b+16}" text-anchor="middle" class="chart-text">${ct(o?o(h):Be(h,0))}</text>`}return y+=`<line x1="${p.l}" y1="${e-p.b}" x2="${n-p.r}" y2="${e-p.b}" class="chart-axis"/><text x="${n/2+10}" y="${e-5}" text-anchor="middle" class="chart-label">${ct(s)}</text><text transform="translate(12 ${e/2-8}) rotate(-90)" text-anchor="middle" class="chart-label">${ct(r)}</text>`,{svg:y,xs:d,ys:g,m:p,pw:m,ph:u}}function Bs(n,e,t,i){return`<svg viewBox="0 0 ${n} ${e}" role="img" aria-label="${ct(i)}">${t}</svg>`}function of(){const n=ne.visibleSky.map(d=>Ct(d.period_days)).filter(d=>d!==null&&d>0).sort((d,g)=>d-g);if(!n.length){W("period-distribution").innerHTML='<p class="empty-message">No published periods for this selection.</p>';return}const e=Math.max(300,Math.ceil(n[Math.floor(n.length*.99)]/100)*100),t=24,i=Array(t).fill(0),s=e/t;n.forEach(d=>i[Math.min(t-1,Math.floor(d/s))]++);const r=450,a=230,{svg:o,xs:l,ys:c,m:p}=Os(r,a,[0,e],[0,Math.max(...i)*1.12],"Period / days","Records",{yFormat:d=>d>=1e3?`${Be(d/1e3,1)}k`:Be(d,0)});let m=o;i.forEach((d,g)=>{const y=l(g*s)+1,f=c(d),h=l(s)-l(0)-2;m+=`<rect x="${y}" y="${f}" width="${h}" height="${a-p.b-f}" rx="1.3" fill="${g%2?"#8497be":"#9babcb"}" opacity="${.62+g/t*.27}"><title>${Be(g*s,0)}–${g===t-1?"≥"+Be(e-s,0):Be((g+1)*s,0)} days: ${wn(d)} records</title></rect>`}),W("period-distribution").innerHTML=Bs(r,a,m,"Histogram of published Mira periods");const u=n.filter(d=>d>=e).length;W("distribution-note").textContent=`${wn(n.length)} published periods${u?`; final bin includes ${wn(u)} periods ≥ ${Be(e,0)} d`:""}. Catalogue records may overlap.`}function Un(n,e,t="",i=""){return`<div class="${i}"><dt>${ct(n)}</dt><dd>${ct(e)}${t&&e!=="—"?`<small>${ct(t)}</small>`:""}</dd></div>`}function lf(){const n=ne.selected;if(!n)return;const e=Ct(n.period_days),t=e?Math.max(10,e*.65):50,i=e?Math.min(5e3,e*1.5):1e3,s=n.catalog_flags||{},r=Object.entries(s).filter(([,l])=>l),a=`${s.l_Period||""}${Be(n.period_days,2)}${s.u_Period||""}`;let o="";if(Ct(n.magnitude_max)!==null||Ct(n.magnitude_min)!==null||Ct(n.magnitude_min_catalog)!==null){const l=Ct(n.magnitude_max)!==null?`${s.l_magMax||""}${Be(n.magnitude_max,2)}${s.u_magMax||""}`:"—",c=Ct(n.magnitude_min_catalog??n.magnitude_min)!==null?`${s.l_Min1||""}${Be(n.magnitude_min_catalog??n.magnitude_min,2)}${s.u_Min1||""}`:"—";Ct(n.magnitude_min)!==null?o+=Un("CATALOGUE MAX → MIN",`${l} → ${c}`,`${n.magnitude_band||"source band"} mag`,"wide"):(o+=Un("CATALOGUE MAXIMUM",l,`${n.magnitude_band||"source band"} mag`,"wide"),o+=Un("SOURCE Min1 FIELD",c,s.n_Min1?`qualifier: ${s.n_Min1}`:"source-qualified value","wide"))}Ct(n.epoch_max_jd)!==null&&(o+=Un("CATALOGUE MAXIMUM EPOCH",Be(n.epoch_max_jd,2),"JD","wide")),W("star-detail").innerHTML=`<div class="selected-type"><span aria-hidden="true">✦</span>${ct(n.classification||"Mira variable")}</div><h3 class="star-name">${ct(n.name||n.id)}</h3><p class="selected-region">${ct(n.region||"Region not provided")} · ${ct(n.catalog||"Catalogue record")}</p><dl class="star-properties">${Un("PUBLISHED PERIOD",Be(n.period_days,2),"days","period-property")}${Un("RIGHT ASCENSION",Be(n.ra_deg,4),"°")}${Un("DECLINATION",Be(n.dec_deg,4),"°")}${Un("MEAN I MAG",Be(n.mean_i_mag,2),"mag")}${Un("MEAN V MAG",Be(n.mean_v_mag,2),"mag")}${Un("I AMPLITUDE",Be(n.amplitude_i_mag,2),"mag")}${Un("SPECTRAL TYPE",n.spectral_type||"—","")}</dl><div class="source-links">${cl(n.source_url,"Catalogue source")}${cl(n.lightcurve_url,"Photometry")}</div><form id="fit-form" class="fit-form"><h4>Find the period with C++</h4><p class="fit-explainer">Search candidate periods and fit a weighted, two-harmonic Fourier series to the observed light curve.</p><div class="fit-bounds"><label>Min period / days<input id="fit-min" type="number" value="${t.toFixed(2)}" min="10" max="5000" step="0.01" required></label><label>Max period / days<input id="fit-max" type="number" value="${i.toFixed(2)}" min="10" max="5000" step="0.01" required></label></div><button class="fit-button" id="fit-button" type="submit"><span aria-hidden="true">✦</span> Run native period search</button><p class="fit-footnote">An empirical fit to observations. Inspect the light curve and aliases before interpreting a period.</p><p class="fit-status" id="fit-status" role="status"></p></form>`,W("fit-form").addEventListener("submit",df),Lu(),fc(),W("star-detail").querySelector(".period-property dd").innerHTML=`${ct(a)}${e!==null?"<small>days</small>":""}`,W("star-detail").querySelector(".star-properties").insertAdjacentHTML("beforeend",o),r.length&&W("star-detail").querySelector(".source-links").insertAdjacentHTML("beforebegin",`<p class="catalog-qualifications">Source qualifications: ${r.map(([l,c])=>`${ct(l)} = ${ct(c)}`).join(" · ")}. Preserve these flags when interpreting the catalogue values.</p>`),W("analysis-star-name").textContent=n.name||n.id,W("analysis-section").hidden=!1,Bu(),Yh(n)}function cf(){ne.curve=null,ne.fit=null,W("periodogram-card").hidden=!0,W("lightcurve-notice").hidden=!0,W("observed-chart").innerHTML='<p class="empty-message">Loading observed photometry…</p>',W("observation-count").textContent="Loading",W("folded-period").textContent="Awaiting fit",W("folded-chart").innerHTML='<div class="chart-placeholder"><svg viewBox="0 0 120 42" aria-hidden="true"><path d="M2 23C12 23 14 4 27 4S41 38 53 38 65 4 78 4 90 38 103 38 113 25 118 23"/></svg><p>Run a native period search<br>to bring the cycles together.</p></div>'}async function pr(n){const e=++ne.selection;try{const t=await Bt(`/api/stars/${encodeURIComponent(n)}`);if(e!==ne.selection)return;ne.selected=t,cf(),lf(),window.dispatchEvent(new CustomEvent("thoth:star-selected",{detail:t}));try{const i=await Bt(`/api/stars/${encodeURIComponent(n)}/lightcurve`);if(e!==ne.selection)return;ne.curve=i,Fu()}catch(i){if(e!==ne.selection)return;W("observed-chart").innerHTML='<p class="empty-message">Observed photometry is unavailable for this record.</p>',W("observation-count").textContent="No observations",W("lightcurve-notice").innerHTML=`<span>${ct(bt(i))}</span>${n!==ne.status?.example_star_id?'<button id="return-example" class="notice-action">Open the bundled example ↗</button>':""}`,W("lightcurve-notice").hidden=!1,W("fit-status").textContent="Select the bundled example to run the analysis without downloading new photometry."}}catch(t){Gs(bt(t))}}function Nu(){return(ne.curve?.observations||[]).filter(n=>Ct(n.time_jd)!==null&&Ct(n.magnitude)!==null)}function ul(n){const e=n.map(r=>r.y),t=Math.min(...e),i=Math.max(...e),s=Math.max(.08,(i-t)*.1);return[t-s,i+s]}function Uu(n,e,t,{opacity:i=.65,radius:s=1.6,errors:r=!1}={}){const a=Math.max(1,Math.floor(n.length/3e3));let o="";for(let l=0;l<n.length;l+=a){const c=n[l];r&&typeof c.error=="number"&&c.error>0&&(o+=`<line x1="${e(c.x)}" y1="${t(c.y-c.error)}" x2="${e(c.x)}" y2="${t(c.y+c.error)}" stroke="#61d7de" opacity=".17" stroke-width=".7"/>`),o+=`<circle cx="${e(c.x)}" cy="${t(c.y)}" r="${s}" fill="#61d7de" opacity="${i}"><title>${ct(c.label||`${Be(c.x,3)} · ${Be(c.y,3)} mag`)}</title></circle>`}return o}function Fu(){const n=Nu();if(!n.length){W("observed-chart").innerHTML='<p class="empty-message">No usable photometric observations.</p>',W("observation-count").textContent="No observations";return}const e=Math.floor(Math.min(...n.map(l=>Number(l.time_jd)))/1e3)*1e3,t=n.map(l=>({x:Number(l.time_jd)-e,y:Number(l.magnitude),error:Ct(l.error_mag)})),i=[Math.min(...t.map(l=>l.x)),Math.max(...t.map(l=>l.x))];i[0]===i[1]&&i[1]++;const s=ne.curve?.band||n[0].band||"source",r=600,a=265,o=Os(r,a,i,ul(t),`${ne.curve?.time_system||"JD"} − ${e}`,`${s}-band magnitude ↑ brighter`,{reverseY:!0});W("observed-chart").innerHTML=Bs(r,a,o.svg+Uu(t,o.xs,o.ys,{errors:!0}),"Real observed brightness over time; lower magnitudes are brighter"),W("observation-count").textContent=`${wn(n.length)} observations`,W("observed-caption").innerHTML=`${ct(s)} band · ${ct(ne.curve?.time_system||"Julian date, source convention")} · ${cl(ne.curve?.source_url,"Original photometry")}`}async function df(n){if(n.preventDefault(),!ne.selected)return;const e=Ct(W("fit-min").value),t=Ct(W("fit-max").value);if(e===null||t===null||e>=t){W("fit-status").textContent="Choose a maximum period greater than the minimum.";return}const i=ne.selection,s=ne.selected.id;W("fit-button").disabled=!0,W("fit-button").textContent="Searching candidate periods…",W("fit-status").textContent="Native C++ is fitting the observed light curve.";try{const r=await Bt("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({star_id:s,min_period:e,max_period:t,samples:1500,harmonics:2,threads:0})});if(i!==ne.selection)return;ne.fit=r,!ne.curve&&Array.isArray(r.observations)&&(ne.curve={observations:r.observations,band:r.band,time_system:r.time_system},Fu()),uf(),W("fit-status").textContent=`Best candidate: ${Be(r.period_days,4)} days within your search interval.`}catch(r){i===ne.selection&&(W("fit-status").textContent=bt(r),Gs(bt(r)))}finally{i===ne.selection&&(W("fit-button").disabled=!1,W("fit-button").innerHTML='<span aria-hidden="true">✦</span> Run native period search')}}function uf(){const n=ne.fit;if(!n)return;const e=Number(n.period_days),t=Number(n.reference_epoch_jd),i=Nu(),s=f=>((Number(f)-t)/e%1+1)%1;let r=[];i.forEach(f=>{const h=s(f.time_jd);for(const M of[0,1])r.push({x:h+M,y:Number(f.magnitude),error:Ct(f.error_mag)})});const a=[];Array.isArray(n.phase_model)?n.phase_model.forEach(f=>a.push({x:Number(f.phase),y:Number(f.magnitude)})):Array.isArray(n.model_magnitudes)&&n.model_magnitudes.forEach((f,h)=>a.push({x:n.model_phases?Number(n.model_phases[h]):s(n.model_times?.[h]??t),y:Number(f)})),a.sort((f,h)=>f.x-h.x);const o=r.length?ul(r):a.length?ul(a):[0,1],l=600,c=265,p=Os(l,c,[0,2],o,"Phase / cycles",`${ne.curve?.band||"Source"}-band magnitude ↑ brighter`,{reverseY:!0,xFormat:f=>Be(f,1),ticks:4});let m=p.svg+Uu(r,p.xs,p.ys,{opacity:.45,radius:1.3});if(a.length)for(const f of[0,1])m+=`<path d="${a.map((h,M)=>`${M?"L":"M"}${p.xs(h.x+f).toFixed(2)},${p.ys(h.y).toFixed(2)}`).join(" ")}" fill="none" stroke="#f6bd73" stroke-width="1.8"/>`;W("folded-chart").innerHTML=Bs(l,c,m,"Observed light curve folded at the fitted period with empirical Fourier curve"),W("folded-period").textContent=`${Be(e,4)} d`;const u=n.frequencies||[],d=n.powers||[],g=u.map((f,h)=>({x:1/Number(f),y:Number(d[h])})).filter(f=>Number.isFinite(f.x)&&Number.isFinite(f.y)).sort((f,h)=>f.x-h.x);if(g.length){const f=Os(1100,200,[g[0].x,g[g.length-1].x],[Math.min(0,...g.map(M=>M.y)),Math.max(...g.map(M=>M.y))*1.08],"Trial period / days","Fit improvement",{yFormat:M=>Be(M,2)}),h=g.map((M,R)=>`${R?"L":"M"}${f.xs(M.x).toFixed(2)},${f.ys(M.y).toFixed(2)}`).join(" ");W("periodogram-chart").innerHTML=Bs(1100,200,`${f.svg}<path d="${h}" fill="none" stroke="#b09aec" stroke-width="1.2"/><line x1="${f.xs(e)}" y1="13" x2="${f.xs(e)}" y2="158" stroke="#f6bd73" stroke-width="1" stroke-dasharray="3 4"/>`,"Native frequency search: candidate periods and fit improvements")}W("fit-metrics").innerHTML=[["BEST PERIOD",Be(e,4),"d"],["FITTED AMPLITUDE",Be(n.amplitude_mag,3),"mag"],["REDUCED χ²",Be(n.reduced_chi2,2),""],["OBSERVATIONS",wn(n.n_observations||i.length),""]].map(([f,h,M])=>`<div><span>${f}</span><strong>${h}<small>${M}</small></strong></div>`).join("");const y=n.backend||ne.status?.native_backend;W("fit-backend").textContent=`${typeof y=="string"?y:y?.engine||"Native C++"}${n.threads_used?` · ${n.threads_used} threads`:""}`,W("fit-caption").textContent=`Two-harmonic empirical fit. A large reduced χ² means residuals exceed the quoted errors; the model may not describe the evolving light curve. Period searches can have cadence aliases. ${(n.warnings||[]).join(" ")}`,W("periodogram-card").hidden=!1,document.getElementById("export-fit")||W("fit-metrics").insertAdjacentHTML("afterend",'<button class="export-button fit-export" id="export-fit">Download fit JSON ↓</button>'),W("export-fit").onclick=()=>zu(ne.fit,`${ne.selected?.id??"star"}-fit.json`)}function Ou(){const n=Number(W("parallel-fraction").value)/100,e=Number(W("processor-count").value),t=p=>1/(1-n+n/p),i=p=>p-(1-n)*(p-1);W("parallel-fraction-label").textContent=`${Be(n*100,n*100%1?1:0)}%`,W("processor-label").textContent=String(e),W("amdahl-speedup").textContent=`${Be(t(e),2)}×`,W("gustafson-speedup").textContent=`${Be(i(e),2)}×`;const s=700,r=265,a=Os(s,r,[1,Math.max(2,e)],[0,Math.max(2,e)*1.08],"Ideal processor count / N","Theoretical speedup / ×",{xFormat:p=>Be(p,0),yFormat:p=>Be(p,0),ticks:4}),o=a.xs,l=a.ys;let c=a.svg;[["#60748c",p=>p,"4 4"],["#b09aec",i,""],["#61d7de",t,""]].forEach(([p,m,u])=>{const d=Array.from({length:Math.max(e,2)},(g,y)=>({x:y+1,y:m(y+1)}));c+=`<path d="${d.map((g,y)=>`${y?"L":"M"}${o(g.x)},${l(g.y)}`).join(" ")}" fill="none" stroke="${p}" stroke-width="1.8" ${u?`stroke-dasharray="${u}"`:""}/>`}),c+=`<circle cx="${o(e)}" cy="${l(t(e))}" r="3.2" fill="#61d7de"/><circle cx="${o(e)}" cy="${l(i(e))}" r="3.2" fill="#b09aec"/>`,W("scaling-chart").innerHTML=Bs(s,r,c,`Amdahl speedup ${Be(t(e),2)} and Gustafson speedup ${Be(i(e),2)} for ${e} processors and ${Be(n*100,1)} percent parallel work`)}function Qa(n,e=0,t="idle",i=null){W("task-grid").innerHTML=Array.from({length:n},(s,r)=>{const a=i?i.has(r):r<e,o=!a&&t!=="idle"&&t!=="complete"&&t!=="preparing";return`<div class="task-tile ${a?t==="serial"?"serial":"complete":o?"active":""}"><span aria-hidden="true">${a?"✓":o?"◌":"·"}</span>Task ${r+1}</div>`}).join("")}function Bu(){const n=W("cluster-star"),e=n.value,t=ne.status?.example_star_id||"OGLE-BLG-LPV-096697";n.innerHTML="",n.add(new Option(`Bundled example · ${t}`,t)),ne.selected&&ne.selected.id!==t&&n.add(new Option(`Selected star · ${ne.selected.name||ne.selected.id}`,ne.selected.id)),Array.from(n.options).some(i=>i.value===e)&&(n.value=e)}async function hf(n){if(n.preventDefault(),ne.clusterJob)return;const e=Number(W("cluster-workers").value),t=Number(W("cluster-tasks").value),i=W("cluster-star").value;W("cluster-run").disabled=!0,W("cluster-run").textContent="Starting the experiment…",W("cluster-results").hidden=!0,W("cluster-error").hidden=!0,W("cluster-idle-copy").hidden=!0,W("cluster-heading").textContent="Preparing real photometry",W("cluster-state").textContent="Queued",W("cluster-progress-bar").style.width="0%",W("cluster-progress-percent").textContent="0%",Qa(t,0,"preparing");try{const s=await Bt("/api/cluster/jobs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({star_id:i,workers:e,tasks:t,samples:400,observations_limit:1200})});ne.clusterJob={id:s.job_id,tasks:t,workers:e,star:i},ku()}catch(s){hl(bt(s))}}function hl(n){clearTimeout(Pu),ne.clusterJob=null,W("cluster-state").textContent="Failed",W("cluster-heading").textContent="Experiment interrupted",W("cluster-error").textContent=n,W("cluster-error").hidden=!1,W("cluster-run").disabled=!1,W("cluster-run").innerHTML='<span aria-hidden="true">⚡</span> Run the scaling experiment'}async function ku(){if(ne.clusterJob)try{const n=await Bt(`/api/cluster/jobs/${encodeURIComponent(ne.clusterJob.id)}`),e=n.progress,t=e?.stage||n.state,i=Number(e?.completed)||0,s=Number(e?.total)||ne.clusterJob.tasks;W("cluster-state").textContent=n.state==="complete"?"Complete":t.charAt(0).toUpperCase()+t.slice(1),W("cluster-heading").textContent=t==="serial"?"Measuring the serial baseline":t==="parallel"?"Workers are searching periods":n.state==="complete"?"The experiment is complete":"Preparing the workload";const r=n.state==="complete"?100:t==="parallel"?50+i/s*50:t==="serial"?i/s*50:0;W("cluster-progress-bar").style.width=`${Math.min(100,r)}%`,W("cluster-progress-percent").textContent=`${Math.round(r)}%`,W("cluster-progress-text").textContent=n.state==="complete"?`${ne.clusterJob.tasks} tasks completed in each run`:`${t==="serial"?"Serial baseline":t==="parallel"?"Parallel run":"Preparing"} · ${i}/${s} tasks`;const a=(n.events||[]).filter(l=>l.stage===t&&Number.isInteger(l.task_index)),o=a.length?new Set(a.map(l=>l.task_index).filter(l=>l!==void 0)):null;if(Qa(ne.clusterJob.tasks,n.state==="complete"?ne.clusterJob.tasks:i,t,n.state==="complete"?null:o),n.state==="failed"){hl(n.error||"The cluster experiment failed.");return}if(n.state==="complete"){ff(n.result||{}),ne.clusterJob=null,W("cluster-run").disabled=!1,W("cluster-run").innerHTML='<span aria-hidden="true">⚡</span> Run the scaling experiment';return}Pu=setTimeout(ku,750)}catch(n){hl(bt(n))}}function ff(n){window.dispatchEvent(new CustomEvent("thoth:cluster-result",{detail:n})),ne.clusterResult=n,W("cluster-results").hidden=!1;const e=[["SERIAL TIME",Be(n.serial_seconds,2),"s"],["PARALLEL TIME",Be(n.parallel_seconds,2),"s"],["SPEEDUP",Be(n.speedup,2),"×"],["EFFICIENCY",Be(Number(n.efficiency)*100,1),"%"]];W("cluster-metrics").innerHTML=e.map(([o,l,c])=>`<div><span>${o}</span><strong>${l}<small>${c}</small></strong></div>`).join("");const t=document.getElementById("worker-results");t&&t.remove(),Array.isArray(n.node_results)&&n.node_results.length&&W("cluster-metrics").insertAdjacentHTML("afterend",`<div id="worker-results" class="worker-results"><p>PARALLEL WORKERS · ACTUAL PROCESS RESULTS</p><table><thead><tr><th>PROCESS / HOST</th><th>TASKS</th><th>COMPUTE</th></tr></thead><tbody>${n.node_results.map(o=>`<tr><td>${ct(o.worker_pid)}<span class="star-region">${ct(o.hostname||"local")}${o.mpi_rank!==void 0?` · rank ${ct(o.mpi_rank)}`:""}</span></td><td>${wn(o.tasks_completed)}</td><td>${Be(o.compute_seconds,3)} s</td></tr>`).join("")}</tbody></table></div>`);const i=n.period_distribution||{},s=(i.periods_days||n.periods||[]).map(Ct).filter(o=>o!==null);if(s.length){const o=Math.min(...s),l=Math.max(...s),c=Math.max(.03,(l-o)*.15),p=Array(14).fill(0),m=[o-c,l+c],u=(m[1]-m[0])/p.length;s.forEach(h=>p[Math.min(p.length-1,Math.floor((h-m[0])/u))]++);const d=500,g=115,y=Os(d,g,m,[0,Math.max(...p)*1.1],"Bootstrap period estimates / days","Tasks",{xFormat:h=>Be(h,2),yFormat:h=>Be(h,0),ticks:3});let f=y.svg;p.forEach((h,M)=>{const R=y.ys(h);f+=`<rect x="${y.xs(m[0]+M*u)+1}" y="${R}" width="${y.xs(m[0]+u)-y.xs(m[0])-2}" height="${g-y.m.b-R}" fill="#b09aec" opacity=".8" rx="1"/>`}),W("ensemble-chart").innerHTML=Bs(d,g,f,"Bootstrap distribution of fitted periods from real photometry")}else W("ensemble-chart").innerHTML="";const r=Array.isArray(n.worker_pids)?n.worker_pids.join(", "):"—",a=Array.isArray(n.hostnames)?n.hostnames.join(", "):"local host";W("cluster-result-note").textContent=`${n.workers||n.settings?.workers||"—"} local worker processes · ${a} · PIDs ${r}. ${n.same_task_results===!1?"Serial and parallel task results differed; inspect the report.":"Same deterministic tasks in both runs."} ${Number(n.speedup)<1?"Parallel overhead exceeded the saved compute time on this run.":""} The resampling spread is illustrative, not a calibrated astrophysical confidence interval; Mira cycles can be correlated and evolve.`,document.getElementById("export-cluster")||W("cluster-result-note").insertAdjacentHTML("afterend",'<button class="export-button" id="export-cluster">Download experiment JSON ↓</button>'),W("export-cluster").onclick=()=>zu(ne.clusterResult,"thoth-cluster-experiment.json")}function zu(n,e){const t=URL.createObjectURL(new Blob([JSON.stringify(n,null,2)],{type:"application/json"})),i=document.createElement("a");i.href=t,i.download=e.replace(/[^A-Za-z0-9._-]/g,"_"),document.body.append(i),i.click(),i.remove(),setTimeout(()=>URL.revokeObjectURL(t),1e3)}document.querySelectorAll(".sort-button").forEach(n=>n.addEventListener("click",()=>{ne.direction=ne.sort===n.dataset.sort&&ne.direction==="asc"?"desc":"asc",ne.sort=n.dataset.sort??"name",ne.page=1,Cr()}));W("star-table").addEventListener("click",n=>{const e=(n.target instanceof Element?n.target:null)?.closest("[data-star]");e?.dataset.star&&pr(e.dataset.star)});W("search").addEventListener("input",()=>{clearTimeout(Na),Na=setTimeout(()=>ja(),280)});["min-period","max-period"].forEach(n=>W(n).addEventListener("input",()=>{clearTimeout(Na),Na=setTimeout(()=>ja(),400)}));["catalog-filter","region-filter"].forEach(n=>W(n).addEventListener("change",()=>ja(!0)));W("reset-filters").addEventListener("click",()=>{["search","catalog-filter","region-filter","min-period","max-period"].forEach(n=>dl(n).value=""),ja(!0)});W("prev-page").addEventListener("click",()=>{ne.page>1&&(ne.page--,Cr())});W("next-page").addEventListener("click",()=>{ne.page*ne.pageSize<ne.total&&(ne.page++,Cr())});W("sky-canvas").addEventListener("click",n=>{const e=Iu(n);e&&pr(e.star.id)});let po=null;W("sky-canvas").addEventListener("mousemove",n=>{po||(po=requestAnimationFrame(()=>{po=null;const e=Iu(n),t=W("sky-tooltip");if(W("sky-canvas").style.cursor=e?"pointer":"crosshair",t.hidden=!e,e){t.textContent=`${e.star.name||e.star.id} · ${Be(e.star.period_days,2)} d`;const i=W("sky-map").clientWidth;t.style.left=`${Math.min(e.x+10,i-170)}px`,t.style.top=`${Math.max(0,e.y-35)}px`}}))});W("sky-canvas").addEventListener("mouseleave",()=>{W("sky-tooltip").hidden=!0});new ResizeObserver(fc).observe(W("sky-map"));["parallel-fraction","processor-count"].forEach(n=>W(n).addEventListener("input",Ou));W("cluster-form").addEventListener("submit",hf);W("cluster-tasks").addEventListener("change",()=>{ne.clusterJob||Qa(Number(W("cluster-tasks").value))});W("lightcurve-notice").addEventListener("click",n=>{(n.target instanceof Element?n.target:null)?.closest("#return-example")&&pr(ne.status?.example_star_id||"OGLE-BLG-LPV-096697")});document.querySelectorAll(".topbar nav a").forEach(n=>n.addEventListener("click",()=>{document.querySelectorAll(".topbar nav a").forEach(e=>e.classList.toggle("active",e===n))}));async function pf(){Ou(),Qa(Number(W("cluster-tasks").value));const n=await Promise.allSettled([Bt("/api/status"),Cr(),Bt("/api/sky")]);if(n[0].status==="fulfilled"){ne.status=n[0].value;const e=ne.status.native_available;W("engine-status").innerHTML=`<span class="status-dot"></span>${e?"C++ engine ready":"Native engine unavailable"}`,W("engine-status").classList.toggle("unavailable",!e),Bu()}else W("engine-status").innerHTML='<span class="status-dot"></span>Engine status unavailable',W("engine-status").classList.add("unavailable");n[2].status==="fulfilled"?(ne.sky=n[2].value,[...new Set(ne.sky.map(t=>t.region).filter(Boolean))].sort().forEach(t=>W("region-filter").add(new Option(t,t))),Du()):(W("sky-count").textContent="Sky unavailable",W("period-distribution").innerHTML='<p class="empty-message">Catalogue visualization is unavailable.</p>',Gs(bt(n[2].reason))),ne.status?.example_star_id?pr(ne.status.example_star_id):ne.items.length&&pr(ne.items[0].id)}tf();pf().catch(n=>Gs(bt(n)));const De=n=>{const e=document.getElementById(n);if(!e)throw new Error(`Missing transform element: ${n}`);return e},An=n=>De(n),cn=n=>Number(An(n).value),Ne=(n,e=3)=>typeof n=="number"&&Number.isFinite(n)?n.toLocaleString(void 0,{maximumFractionDigits:e}):"—",dn=n=>String(n??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e),mf="OGLE-BLG-LPV-096697",Ua=new Map;let Ot=null,Cs=null,Hu,Vi={frequency:0,row:0},mr={frequency:0,row:0};De("transform-lab").innerHTML=`
  <div class="section-heading"><div><p class="eyebrow">A RHYTHM IS A LANDSCAPE. EXPLORE ITS DIMENSIONS.</p><h2>The Transform Foundry</h2></div><span class="data-badge"><span class="status-dot"></span>C++ grids · Python ensembles · TypeScript lenses</span></div>
  <p class="transform-intro">Make the computation work for a question. Does the rhythm drift? Where does it disappear? Could the cadence recover a weaker signal? Search thousands of models, then challenge the evidence with independently seeded experiments.</p>
  <div class="transform-setup-grid">
    <article class="card transform-control-card"><div class="card-heading"><div><p class="eyebrow">BUILD A COMPUTATIONAL EXPERIMENT</p><h3>Give the unknown another dimension</h3></div><span class="subtle-pill amethyst">Irregular observing times</span></div><div class="transform-body">
      <form id="transform-form">
        <label class="transform-source-label">Measured observations<select id="transform-source"><option value="example">OGLE-BLG-LPV-096697 · bundled Mira</option></select></label>
        <div class="transform-presets" role="group" aria-label="Computation presets"><button type="button" data-transform-preset="quick">Quick survey</button><button type="button" data-transform-preset="deep" aria-pressed="true">Deep field</button><button type="button" data-transform-preset="research">Research grid</button></div>
        <div class="transform-controls"><label>Minimum period / days<input id="transform-min" type="number" min="0.5" max="99999" step="any" value="60" required></label><label>Maximum period / days<input id="transform-max" type="number" min="0.5" max="100000" step="any" value="140" required></label></div>
        <details class="transform-resolution"><summary>Shape the search &amp; compute budget <span>+</span></summary>
          <div class="transform-controls"><label>Frequency cells<input id="transform-frequency" type="number" min="32" max="384" step="1" value="128" required></label><label>Drift cells<input id="transform-drifts" type="number" min="3" max="81" step="2" value="31" required></label><label>Time windows<input id="transform-times" type="number" min="8" max="64" step="1" value="24" required></label><label>Null / injection trials each<input id="transform-surrogates" type="number" min="1" max="64" step="1" value="12" required></label><label>Maximum phase curvature / cycles<input id="transform-curvature" type="number" min="0" max="8" step="0.25" value="2" required></label><label>Gaussian window scale / cycles<input id="transform-window" type="number" min="0.5" max="8" step="0.25" value="3" required></label><label>Fourier harmonics<select id="transform-harmonics"><option>1</option><option selected>2</option><option>3</option></select></label><label>Worker processes<select id="transform-workers"><option>1</option><option selected>2</option><option>4</option><option>6</option><option>8</option></select></label><label>Observation cap<input id="transform-observations" type="number" min="30" max="3000" step="1" value="1200" required></label><label>Reproducible random seed<input id="transform-seed" type="number" min="0" max="2147483647" step="1" value="1729" required></label></div>
        </details>
        <div class="transform-budget"><span>UPPER WORK ESTIMATE</span><strong id="transform-budget">—</strong><p id="transform-budget-detail">Observation visits across the search grid, ensemble, and pairwise structure function.</p></div>
        <button id="transform-run" type="submit" class="fit-button transform-run">✦ Fire the transform foundry</button>
        <p class="transform-note">Increasing the grid creates more real fits. Local workers run on this computer; MPI can distribute the same seeded experiments across machines. No hardware cost is inferred from an operation count.</p>
      </form>
    </div></article>
    <article class="card transform-console"><div class="card-heading"><div><p class="eyebrow">FOLLOW THE ACTUAL WORK</p><h3 id="transform-heading">Four lenses. One observed sky.</h3></div><span id="transform-state" class="subtle-pill">Idle</span></div><div class="transform-body">
      <div class="transform-kernel-list"><div><span>01</span><p>Chirped phase search<small>Frequency × frequency derivative</small></p></div><div><span>02</span><p>Gaussian localized spectrum<small>Time × frequency · irregular observations</small></p></div><div><span>03</span><p>Phase dispersion &amp; structure<small>Folded scatter · all observation pairs</small></p></div><div><span>04</span><p>Noise &amp; injection ensembles<small>Independent seeds · actual worker processes</small></p></div></div>
      <div class="cluster-progress"><div id="transform-progress"></div></div><div class="cluster-progress-label"><span id="transform-detail">Ready to calculate from measured photometry.</span><span id="transform-percent">0%</span></div>
      <ol id="transform-events" class="transform-events" aria-live="polite"><li>Awaiting an experiment.</li></ol><div id="transform-error" class="notice" role="alert" hidden></div>
      <p class="transform-question">An evolving peak is a question to investigate. It can also arise from aliases, gaps, changing amplitude, or an incomplete model.</p>
    </div></article>
  </div>
  <div id="transform-results" hidden>
    <div id="transform-metrics" class="transform-metrics"></div>
    <div class="transform-results-grid">
      <article class="card"><div class="card-heading"><div><p class="eyebrow">FREQUENCY × PHASE CURVATURE</p><h3>What if the clock is changing?</h3></div><span class="subtle-pill amber-pill">Empirical chirp</span></div><div class="transform-body">
        <div class="transform-map"><canvas id="transform-chirp-map" aria-label="Chirped period search heatmap. Use the two sliders below for accessible cell selection."></canvas></div>
        <div class="transform-legend"><span>Unidentifiable</span><i></i><span>Higher χ² improvement</span></div><div id="transform-chirp-readout" class="transform-cell-readout" aria-live="polite"></div>
        <label class="transform-scrub">Frequency column <strong id="transform-chirp-frequency-label"></strong><input id="transform-chirp-frequency" type="range" min="0" max="0" step="1" value="0"></label><label class="transform-scrub">Frequency derivative row <strong id="transform-chirp-row-label"></strong><input id="transform-chirp-row" type="range" min="0" max="0" step="1" value="0"></label>
        <p class="transform-note">Tap the map or use the sliders. Phase = fΔt + ½ḟΔt². A fitted ḟ is an uncalibrated empirical candidate; it does not establish stellar evolution or a physical period-change rate.</p>
      </div></article>
      <article class="card"><div class="card-heading"><div><p class="eyebrow">TIME × FREQUENCY</p><h3>Where does the rhythm hold?</h3></div><span class="subtle-pill amethyst">Gaussian localization</span></div><div class="transform-body">
        <div class="transform-map"><canvas id="transform-local-map" aria-label="Gaussian localized spectrum heatmap. Use the two sliders below for accessible cell selection."></canvas></div>
        <div class="transform-legend"><span>Unidentifiable</span><i></i><span>Higher local χ² improvement</span></div><div id="transform-local-readout" class="transform-cell-readout" aria-live="polite"></div>
        <label class="transform-scrub">Frequency column <strong id="transform-local-frequency-label"></strong><input id="transform-local-frequency" type="range" min="0" max="0" step="1" value="0"></label><label class="transform-scrub">Window center <strong id="transform-local-row-label"></strong><input id="transform-local-row" type="range" min="0" max="0" step="1" value="0"></label>
        <p class="transform-note">Every cell fits observations near a time center with Gaussian weights. Effective support can fall below the actual count. Gaps and edge windows can produce fragile peaks; colors are not calibrated probabilities.</p>
      </div></article>
      <article class="card"><div class="card-heading"><div><p class="eyebrow">FOLD WITHOUT A SINUSOID</p><h3>How much scatter survives?</h3></div><span class="subtle-pill">Phase dispersion</span></div><div class="transform-body"><div id="transform-pdm-chart" class="transform-chart"></div><p id="transform-pdm-note" class="transform-note">Lower phase-bin variance relative to total variance indicates a more coherent fold.</p></div></article>
      <article class="card"><div class="card-heading"><div><p class="eyebrow">ALL PAIRS OF OBSERVATIONS</p><h3>How does the star forget its past?</h3></div><span class="subtle-pill">Structure function</span></div><div class="transform-body"><div id="transform-structure-chart" class="transform-chart"></div><p class="transform-note"><span class="transform-dot copper"></span>Mean squared magnitude difference <span class="transform-dot cyan"></span>Quoted-noise-subtracted difference. Negative corrected values can occur; pair counts and cadence determine support.</p><div id="transform-pair-support" class="transform-small-facts"></div></div></article>
      <article class="card"><div class="card-heading"><div><p class="eyebrow">CHALLENGE THE STATIONARY SEARCH</p><h3>Can independent noise do this?</h3></div><span id="transform-null-badge" class="subtle-pill amethyst">Gaussian null</span></div><div class="transform-body"><div id="transform-null-chart" class="transform-chart"></div><div id="transform-null-facts" class="transform-small-facts"></div><p class="transform-note">Each null trial draws independent Gaussian noise using the supplied measurement errors at the real observing times, then repeats the stationary frequency search. The tail estimate is conditional on this noise model; it does not calibrate the chirp or localized maps.</p></div></article>
      <article class="card"><div class="card-heading"><div><p class="eyebrow">PUT A KNOWN SIGNAL INTO THE CADENCE</p><h3>What could these observations recover?</h3></div><span id="transform-injection-badge" class="subtle-pill amber-pill">Injection recovery</span></div><div class="transform-body"><div id="transform-injection-chart" class="transform-chart"></div><div id="transform-recovery-groups" class="transform-recovery-groups"></div><p class="transform-note"><span class="transform-dot cyan"></span>Recovered <span class="transform-dot purple"></span>Missed or aliased. Each trial injects a sinusoid plus quoted-error Gaussian noise. Recovery reflects this experiment’s period tolerance, search range, amplitude, and cadence.</p></div></article>
    </div>
    <article class="card transform-workers"><div class="card-heading"><div><p class="eyebrow">THE COMPUTATION HAS A RECEIPT</p><h3>Show the workers, the work, and the assumptions</h3></div><button id="transform-export" type="button" class="export-button">Evidence JSON ↓</button></div><div class="transform-body"><div id="transform-work-facts" class="transform-small-facts"></div><div class="table-scroll"><table><thead><tr><th>HOST / PROCESS</th><th>TASKS</th><th>COMPUTE / s</th></tr></thead><tbody id="transform-worker-table"></tbody></table></div>
      <div class="transform-scale"><div><p class="eyebrow">MEASURE HERE. PROJECT A BIGGER QUESTION.</p><h3>Scale this experiment</h3><p class="transform-note">Project repeated seeded ensemble experiments using the average task time measured above. These controls calculate a scenario; they do not launch more computation.</p></div><div class="transform-controls"><label>Equivalent ensemble repetitions<input id="transform-repeat" type="number" min="1" max="1000000" step="1" value="1000"></label><label>Ideal MPI ranks<input id="transform-ranks" type="number" min="1" max="256" step="1" value="80"></label></div><div id="transform-scale-facts" class="transform-small-facts"></div><p class="transform-note">Projected times assume equal-speed ranks and balanced independent tasks, with no startup, communication, I/O, or shared-memory penalty. 80 MPI ranks are 80 processes; placement determines the number of physical machines. They are not 80 clusters. A real multi-node run is needed to measure scaling.</p></div>
      <details class="transform-math"><summary>Inspect mathematics, provenance &amp; limits <span>+</span></summary><div class="transform-equations"><code>φ(t) = f(t − t₀) + ½ḟ(t − t₀)²</code><code>wᵢ(t₀,f) ∝ exp[−½((tᵢ − t₀)f / window_cycles)²] / σᵢ²</code><code>D₂(τ) = mean[(mⱼ − mᵢ)²] within each lag bin</code><code>p̂ = (1 + null maxima ≥ observed maximum) / (trials + 1)</code></div><div id="transform-provenance" class="transform-provenance"></div><div id="transform-caveats" class="transform-caveats"></div><p class="transform-note">Operation counts measure these kernels’ work. They are not FLOP counts or evidence of a historical price tag. Use the measured runtime and an actual multi-node scaling run to assess a cluster.</p></details></div></article>
  </div>`;function Gu(){const n=An("transform-source").value;return{...Ua.has(n)?{dataset_id:Ua.get(n).dataset_id}:{star_id:mf},min_period:cn("transform-min"),max_period:cn("transform-max"),frequency_samples:cn("transform-frequency"),drift_samples:cn("transform-drifts"),time_samples:cn("transform-times"),drift_cycles:cn("transform-curvature"),window_cycles:cn("transform-window"),surrogates:cn("transform-surrogates"),workers:cn("transform-workers"),observations_limit:cn("transform-observations"),harmonics:cn("transform-harmonics"),seed:cn("transform-seed")}}function Pr(){const n=Gu(),e=Math.min(n.observations_limit,Ua.get(An("transform-source").value)?.observations_count??n.observations_limit),t=e*n.frequency_samples*(2*n.harmonics+n.harmonics*n.drift_samples+n.time_samples+2*n.surrogates*n.harmonics)+e*(e-1)/2;De("transform-budget").textContent=`${Ne(t,0)} observation / harmonic visits`,De("transform-budget-detail").textContent=`${Ne(n.frequency_samples*n.drift_samples,0)} chirp cells · ${Ne(n.frequency_samples*n.time_samples,0)} localized cells · ${Ne(n.surrogates*2,0)} seeded ensemble tasks · ≤${Ne(e,0)} observations`}const gf={quick:[64,15,16,4,600,2],deep:[128,31,24,12,1200,2],research:[256,61,40,32,2400,3]};for(const n of document.querySelectorAll("[data-transform-preset]"))n.addEventListener("click",()=>{const e=gf[n.dataset.transformPreset??"deep"];["frequency","drifts","times","surrogates","observations","harmonics"].forEach((t,i)=>An(`transform-${t}`).value=String(e[i])),document.querySelectorAll("[data-transform-preset]").forEach(t=>t.setAttribute("aria-pressed",String(t===n))),Pr()});async function Vu(){try{const n=await Bt("/api/datasets"),e=De("transform-source");for(const t of n.items){const i=`dataset:${t.dataset_id}`;Ua.set(i,t),Array.from(e.options).some(s=>s.value===i)||e.add(new Option(`${t.name} · ${t.band} · ${t.observations_count.toLocaleString()} points`,i))}Pr()}catch(n){De("transform-detail").textContent=`Saved datasets unavailable: ${bt(n)}`}}function Fa(n){clearTimeout(Hu),Cs=null,De("transform-error").textContent=n,De("transform-error").hidden=!1,De("transform-state").textContent="Failed",De("transform-heading").textContent="The computation needs attention",De("transform-run").disabled=!1,De("transform-run").textContent="✦ Fire the transform foundry"}async function _f(n){if(n.preventDefault(),Cs)return;const e=Gu();if(!(e.min_period<e.max_period)){Fa("Choose a maximum period greater than the minimum.");return}De("transform-error").hidden=!0,De("transform-results").hidden=!0,De("transform-run").disabled=!0,De("transform-run").textContent="Native computation in progress…",De("transform-state").textContent="Queued",De("transform-progress").style.width="0%",De("transform-percent").textContent="0%",De("transform-events").innerHTML="<li>Experiment submitted. Waiting for the coordinator.</li>";try{Cs=(await Hs("/api/transforms/jobs",e)).job_id,await $u()}catch(t){Fa(bt(t))}}async function $u(){if(Cs)try{const n=await Bt(`/api/transforms/jobs/${encodeURIComponent(Cs)}`),e=n.state==="complete"?100:Math.max(0,Math.min(100,n.progress?.percent??0));if(De("transform-state").textContent=n.state==="complete"?"Complete":n.state==="running"?"Computing":"Queued",De("transform-percent").textContent=`${Ne(e,0)}%`,De("transform-progress").style.width=`${e}%`,De("transform-detail").textContent=n.progress?.detail??n.state,De("transform-heading").textContent=n.state==="complete"?"Evidence, ready to explore":(n.progress?.stage??"Preparing observations").replaceAll("_"," "),n.events?.length&&(De("transform-events").innerHTML=n.events.slice(-6).map(t=>`<li><span>${dn(t.stage.replaceAll("_"," "))}</span><small>${dn(t.detail)}</small></li>`).join("")),n.state==="failed"){Fa(n.error??"The scientific computation failed.");return}if(n.state==="complete"&&n.result){Ot=n.result,Cs=null,vf(Ot),De("transform-run").disabled=!1,De("transform-run").textContent="✦ Run another experiment";return}Hu=setTimeout(()=>{$u()},700)}catch(n){Fa(bt(n))}}function zr(n,e,t,i,s=!1){const m=i.flatMap(w=>w.points.filter(v=>v!==null&&Number.isFinite(v.x)&&Number.isFinite(v.y)));if(!m.length)return'<p class="empty-message">No identifiable values for this experiment.</p>';const u=m.map(w=>w.x),d=m.map(w=>w.y);let g=Math.min(...u),y=Math.max(...u),f=Math.min(...d),h=Math.max(...d);s&&(g=f=Math.min(g,f),y=h=Math.max(y,h));const M=(y-g)*.05||1,R=(h-f)*.1||.05;g=!s&&g>=0?Math.max(0,g-M):g-M,y+=M,f-=R,h+=R;const b=w=>75+(w-g)/(y-g)*445,S=w=>20+(h-w)/(h-f)*215;let E="";for(let w=0;w<=3;w++){const v=g+w/3*(y-g),T=f+w/3*(h-f);E+=`<line x1="75" x2="520" y1="${S(T)}" y2="${S(T)}" stroke="#273448"/><text x="65" y="${S(T)+5}" text-anchor="end">${dn(Ne(T,Math.abs(h-f)<1?3:1))}</text><text x="${b(v)}" y="261" text-anchor="middle">${dn(Ne(v,Math.abs(y-g)<1?4:1))}</text>`}s&&(E+=`<path d="M${b(g)},${S(g)} L${b(y)},${S(y)}" stroke="#56677b" stroke-dasharray="5 5" fill="none"/>`);for(const w of i)if(w.scatter)E+=w.points.filter(v=>v!==null).map(v=>`<circle cx="${b(v.x)}" cy="${S(v.y)}" r="4" fill="${v.color??w.color}" opacity=".8"><title>${dn(v.label??`${Ne(v.x)} · ${Ne(v.y)}`)}</title></circle>`).join("");else{let v=!0;const T=w.points.map(C=>{if(!C||!Number.isFinite(C.y))return v=!0,"";const L=`${v?"M":"L"}${b(C.x)},${S(C.y)}`;return v=!1,L}).join(" ");E+=`<path d="${T}" stroke="${w.color}" stroke-width="2" fill="none"/>`}return E+=`<text x="${595/2}" y="288" text-anchor="middle" class="axis-label">${dn(e)}</text><text transform="translate(19 ${255/2}) rotate(-90)" text-anchor="middle" class="axis-label">${dn(t)}</text>`,`<svg viewBox="0 0 540 300" role="img" aria-label="${dn(n)}">${E}</svg>`}function mo(n,e){return e!==null&&Number.isFinite(e)?{x:n,y:e}:null}function cr(n){return n.map(([e,t])=>`<span>${dn(e)} <b>${dn(t)}</b></span>`).join("")}function vf(n){window.dispatchEvent(new CustomEvent("thoth:transform-result",{detail:n})),De("transform-results").hidden=!1;const e=n.computation,t=n.ensemble,i=n.provenance;De("transform-metrics").innerHTML=[["SEARCHED OBSERVATION VISITS",Ne(e.total_observation_evaluations,0),"Measured kernel work; not FLOPs"],["SUMMED NATIVE SERVICE TIME",`${Ne(e.native_seconds)} s`,`Pipeline wall time ${Ne(e.pipeline_seconds)} s`],["CHIRP CANDIDATE PERIOD",`${Ne(n.chirp.best_period_days)} d`,"At the reference epoch; empirical model"],["SEEDED ENSEMBLE TASKS",Ne(t.task_count,0),`${t.workers.length} actual processes · ${t.execution}`]].map(([a,o,l])=>`<div><span>${dn(a)}</span><strong>${dn(o)}</strong><small>${dn(l)}</small></div>`).join(""),Vi.frequency=od(n.chirp.frequencies,n.chirp.best_frequency),Vi.row=od(n.chirp.frequency_derivatives,n.chirp.best_frequency_derivative),mr={frequency:Vi.frequency,row:Math.floor(n.localized.time_centers_jd.length/2)};for(const a of["chirp","local"]){const o=a==="chirp"?n.chirp:n.localized,l=a==="chirp"?Vi:mr;De(`transform-${a}-frequency`).max=String(o.frequencies.length-1),De(`transform-${a}-row`).max=String(o.powers.length-1),An(`transform-${a}-frequency`).value=String(l.frequency),An(`transform-${a}-row`).value=String(l.row),gr(a)}const s=n.phase_dispersion;De("transform-pdm-chart").innerHTML=zr("Phase dispersion over the trial frequencies","Frequency / cycles per day","Phase dispersion θ",[{points:s.frequencies.map((a,o)=>mo(a,s.theta[o])),color:"#b09aec"}]),De("transform-pdm-note").textContent=`Lowest phase-dispersion candidate: ${Ne(s.best_period_days)} days. Lower within-bin scatter relative to total scatter indicates a more coherent fold. Phase binning and incomplete coverage can favor aliases; θ is not a probability.`;const r=n.structure_function;De("transform-structure-chart").innerHTML=zr("Mean squared brightness differences grouped by observation lag","Pair lag / days","Squared difference / mag²",[{points:r.lag_centers_days.map((a,o)=>mo(a,r.mean_squared_difference[o])),color:"#efac7d"},{points:r.lag_centers_days.map((a,o)=>mo(a,r.noise_corrected_difference[o])),color:"#61d7de"}]),De("transform-pair-support").innerHTML=cr([["Pairs in plotted bins",Ne(r.pair_counts.reduce((a,o)=>a+o,0),0)],["Populated lag bins",`${r.pair_counts.filter(a=>a>0).length} / ${r.pair_counts.length}`]]),De("transform-null-chart").innerHTML=zr("Maximum stationary-search power from each independent Gaussian null trial","Null experiment index","Maximum χ² improvement",[{points:t.null_max_powers.map((a,o)=>({x:o+1,y:a})),color:"#b09aec",scatter:!0},{points:[{x:1,y:t.observed_max_power},{x:Math.max(2,t.null_max_powers.length),y:t.observed_max_power}],color:"#efac7d"}]),De("transform-null-badge").textContent=`${Ne(t.surrogates,0)} null searches`,De("transform-null-facts").innerHTML=cr([["Conditional tail estimate",Ne(t.empirical_p_value,4)],["Resolution floor",Ne(t.p_value_floor,4)],["Exceedances",`${Ne(t.exceedances,0)} / ${Ne(t.surrogates,0)}`]]),De("transform-injection-chart").innerHTML=zr("Injected versus recovered periods for seeded synthetic sinusoids","Injected period / days","Recovered period / days",[{points:t.injection_trials.map(a=>({x:a.injected_period_days,y:a.recovered_period_days,color:a.recovered?"#61d7de":"#b09aec",label:`Trial ${a.trial_index}: amplitude ${Ne(a.amplitude_mag)} mag; injected ${Ne(a.injected_period_days)} d; recovered ${Ne(a.recovered_period_days)} d; ${a.recovered?"within recovery tolerance":"missed / aliased"}`})),color:"#61d7de",scatter:!0}],!0),De("transform-injection-badge").textContent=`${Ne((t.recovery_fraction??0)*100,1)}% recovered`,De("transform-recovery-groups").innerHTML=t.injection_groups.map(a=>`<div><span>${Ne(a.amplitude_mag)} mag injection</span><strong>${a.recovery_fraction===null?"Untested":`${Ne(a.recovery_fraction*100,0)}%`}</strong><small>${a.recovered} / ${a.trials} · unrecovered ${a.alias_count}</small></div>`).join(""),De("transform-work-facts").innerHTML=cr([["Grid observation-cell visits",Ne(e.observation_cell_evaluations,0)],["Ensemble harmonic visits",Ne(e.ensemble_observation_frequency_harmonic_evaluations,0)],["Visits / pipeline second",Ne(e.total_observation_evaluations/Math.max(e.pipeline_seconds,1e-6),0)],["Ensemble wall time",`${Ne(t.elapsed_seconds)} s`],["Base native duration",`${Ne(e.base_native_seconds)} s`],["Input used",`${Ne(i.used_observations,0)} / ${Ne(i.input_observations,0)}`]]),De("transform-worker-table").innerHTML=t.workers.map(a=>`<tr><td>${dn(a.hostname)}<small class="transform-pid">PID ${a.worker_pid}${a.mpi_rank!==void 0?` · rank ${a.mpi_rank}`:""}</small></td><td>${a.tasks_completed}</td><td>${Ne(a.compute_seconds)}</td></tr>`).join(""),De("transform-provenance").textContent=`${i.name||i.star_id} · ${i.band} band · ${i.time_system} · baseline ${Ne(i.observation_span_days,1)} days
${i.subsampling}
Source: ${i.source_url}
Canonical input SHA-256: ${i.input_sha256}
Ensemble: ${t.sampling_assumption} · seed ${t.base_seed}`,De("transform-caveats").innerHTML=[...n.caveats,...t.caveats].map(a=>`<p>${dn(a)}</p>`).join(""),pc()}function pc(){if(!Ot)return;const n=cn("transform-repeat"),e=cn("transform-ranks");if(!Number.isInteger(n)||n<1||n>1e6||!Number.isInteger(e)||e<1||e>256){De("transform-scale-facts").textContent="Choose 1–1,000,000 repetitions and 1–256 ranks.";return}const t=Ot.ensemble,i=t.workers.reduce((l,c)=>l+c.compute_seconds,0),s=t.task_count*n,r=i*n/3600,a=Math.min(e,s),o=r*3600/Math.max(1,a);De("transform-scale-facts").innerHTML=cr([["Projected tasks",Ne(s,0)],["Measured average task",`${Ne(i/Math.max(1,t.task_count),4)} s`],["Projected aggregate worker hours",Ne(r,3)],["Ideal wall time",`${Ne(o/60,3)} minutes`],["Ideal concurrent ranks",Ne(a,0)],["Projected ensemble harmonic visits",Ne(Ot.computation.ensemble_observation_frequency_harmonic_evaluations*n,0)]])}function od(n,e){return n.reduce((t,i,s)=>Math.abs(i-e)<Math.abs(n[t]-e)?s:t,0)}function Wu(){return window.matchMedia("(max-width: 640px)").matches?{w:480,h:330,left:78,right:18,top:15,bottom:68}:{w:620,h:310,left:67,right:18,top:15,bottom:58}}function xf(n,e,t){if(n===null||!Number.isFinite(n))return"#101623";const i=[[20,37,53],[65,80,111],[142,87,122],[233,162,121],[255,237,193]],s=Math.max(0,Math.min(1,(n-e)/(t-e||1)))*(i.length-1),r=Math.min(i.length-2,Math.floor(s)),a=s-r;return`rgb(${i[r].map((o,l)=>Math.round(o*(1-a)+i[r+1][l]*a)).join(",")})`}function yf(n,e,t,i){const s=De(`transform-${n}-map`),r=Math.min(2,window.devicePixelRatio||1),a=Wu();s.width=a.w*r,s.height=a.h*r;const o=s.getContext("2d");if(!o)return;o.scale(r,r),o.fillStyle="#0c1421",o.fillRect(0,0,a.w,a.h);const l=e.powers.flat().filter(h=>h!==null&&Number.isFinite(h)),c=Math.min(...l),p=Math.max(...l),m=a.w-a.left-a.right,u=a.h-a.top-a.bottom,d=m/e.frequencies.length,g=u/e.powers.length;for(let h=0;h<e.powers.length;h++)for(let M=0;M<e.frequencies.length;M++)o.fillStyle=xf(e.powers[h]?.[M]??null,c,p),o.fillRect(a.left+M*d,a.top+(e.powers.length-h-1)*g,d+.4,g+.4);const y=a.left+(i.frequency+.5)*d,f=a.top+(e.powers.length-i.row-.5)*g;o.strokeStyle="#fff3ce",o.lineWidth=1,o.beginPath(),o.moveTo(y,a.top),o.lineTo(y,a.h-a.bottom),o.moveTo(a.left,f),o.lineTo(a.w-a.right,f),o.stroke(),o.strokeStyle="#fff",o.lineWidth=2,o.strokeRect(y-5,f-5,10,10),o.fillStyle="#b2c2d4",o.font="17px system-ui",o.textAlign="center";for(let h=0;h<=2;h++){const M=Math.round(h/2*(e.frequencies.length-1));o.textAlign=h===0?"left":h===2?"right":"center",o.fillText(Ne(e.frequencies[M],4),a.left+(M+.5)*d,a.h-a.bottom+26);const R=Math.round(h/2*(t.length-1));o.textAlign="right";const b=n==="chirp"?t[R]*1e6:t[R]-(Ot?.chirp.reference_epoch_jd??0);o.fillText(Ne(b,n==="chirp"?2:0),a.left-9,a.top+(t.length-R-.5)*g+5),o.textAlign="center"}o.fillText("Frequency / cycles per day",(a.left+a.w-a.right)/2,a.h-7),o.save(),o.translate(15,(a.top+a.h-a.bottom)/2),o.rotate(-Math.PI/2),o.fillText(n==="chirp"?"ḟ / μcycles day⁻²":"Days from reference epoch",0,0),o.restore(),s.setAttribute("aria-label",`${n==="chirp"?"Chirp":"Localized"} heatmap: ${e.frequencies.length} frequency columns and ${e.powers.length} rows. Power range ${Ne(c)} to ${Ne(p)}. Use sliders below to read every cell.`)}function gr(n){if(!Ot)return;const e=n==="chirp"?Ot.chirp:Ot.localized,t=n==="chirp"?Vi:mr,i=n==="chirp"?Ot.chirp.frequency_derivatives:Ot.localized.time_centers_jd,s=e.frequencies[t.frequency],r=i[t.row],a=e.powers[t.row]?.[t.frequency]??null,o=1/s;De(`transform-${n}-frequency-label`).textContent=`${Ne(o)} days`,De(`transform-${n}-row-label`).textContent=n==="chirp"?`${r.toExponential(3)} cycles/day²`:`${Ne(r,2)} ${Ot.provenance.time_system}`;const l=n==="chirp"?["Endpoint phase curvature",`${Ne(.5*r*(Ot.provenance.observation_span_days/2)**2)} cycles`]:["Effective observations",Ne(Ot.localized.effective_observations[t.row]?.[t.frequency])];De(`transform-${n}-readout`).innerHTML=cr([["Period",`${Ne(o)} d`],["Power",Ne(a)],[l[0],l[1]]]),yf(n,e,i,t)}for(const n of["chirp","local"]){for(const i of["frequency","row"])An(`transform-${n}-${i}`).addEventListener("input",()=>{const s=n==="chirp"?Vi:mr;s[i]=cn(`transform-${n}-${i}`),gr(n)});const e=De(`transform-${n}-map`),t=i=>{if(!Ot)return;const s=n==="chirp"?Ot.chirp:Ot.localized,r=Wu(),a=e.getBoundingClientRect(),o=(i.clientX-a.left)/a.width*r.w,l=(i.clientY-a.top)/a.height*r.h;if(o<r.left||o>r.w-r.right||l<r.top||l>r.h-r.bottom)return;const c=n==="chirp"?Vi:mr,p=Math.min(s.frequencies.length-1,Math.max(0,Math.floor((o-r.left)/(r.w-r.left-r.right)*s.frequencies.length))),m=Math.min(s.powers.length-1,Math.max(0,s.powers.length-1-Math.floor((l-r.top)/(r.h-r.top-r.bottom)*s.powers.length)));p===c.frequency&&m===c.row||(c.frequency=p,c.row=m,An(`transform-${n}-frequency`).value=String(c.frequency),An(`transform-${n}-row`).value=String(c.row),gr(n))};e.addEventListener("pointerdown",t),e.addEventListener("pointermove",i=>{i.pointerType==="mouse"&&t(i)})}De("transform-form").addEventListener("submit",n=>{_f(n)});De("transform-form").addEventListener("input",n=>{!(n.target instanceof HTMLElement)||n.target.id==="transform-source"||(document.querySelectorAll("[data-transform-preset]").forEach(e=>e.setAttribute("aria-pressed","false")),Pr())});An("transform-source").addEventListener("change",Pr);An("transform-source").addEventListener("focus",()=>{Vu()});De("transform-export").addEventListener("click",()=>{if(!Ot)return;const n=URL.createObjectURL(new Blob([JSON.stringify(Ot,null,2)],{type:"application/json"})),e=document.createElement("a");e.href=n,e.download="thoth-transform-evidence.json",e.click(),setTimeout(()=>URL.revokeObjectURL(n),1e3)});An("transform-repeat").addEventListener("input",pc);An("transform-ranks").addEventListener("input",pc);let go=null;window.addEventListener("resize",()=>{!Ot||go!==null||(go=requestAnimationFrame(()=>{go=null,gr("chirp"),gr("local")}))});Pr();Vu();const mc="186",Ps={ROTATE:0,DOLLY:1,PAN:2},Es={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Mf=0,ld=1,bf=2,Sa=1,Sf=2,sr=3,Ji=0,fn=1,yn=2,_i=0,dr=1,fl=2,cd=3,dd=4,Ef=5,Ss=100,Tf=101,wf=102,Af=103,Rf=104,Cf=200,Pf=201,Lf=202,Df=203,Xu=204,qu=205,If=206,Nf=207,Uf=208,Ff=209,Of=210,Bf=211,kf=212,zf=213,Hf=214,pl=0,ml=1,gl=2,_r=3,_l=4,vl=5,xl=6,yl=7,gc=0,Gf=1,Vf=2,ii=0,Yu=1,Ku=2,Zu=3,Ju=4,ju=5,Qu=6,eh=7,th=300,ji=301,ks=302,_o=303,vo=304,eo=306,Ml=1e3,gi=1001,bl=1002,Kt=1003,$f=1004,Hr=1005,sn=1006,xo=1007,$i=1008,En=1009,nh=1010,ih=1011,vr=1012,_c=1013,ri=1014,zn=1015,ai=1016,vc=1017,xc=1018,xr=1020,sh=35902,rh=35899,ah=1021,oh=1022,Hn=1023,xi=1026,Wi=1027,yc=1028,Mc=1029,Qi=1030,bc=1031,Sc=1033,Ea=33776,Ta=33777,wa=33778,Aa=33779,Sl=35840,El=35841,Tl=35842,wl=35843,Al=36196,Rl=37492,Cl=37496,Pl=37488,Ll=37489,Oa=37490,Dl=37491,Il=37808,Nl=37809,Ul=37810,Fl=37811,Ol=37812,Bl=37813,kl=37814,zl=37815,Hl=37816,Gl=37817,Vl=37818,$l=37819,Wl=37820,Xl=37821,ql=36492,Yl=36494,Kl=36495,Zl=36283,Jl=36284,Ba=36285,jl=36286,Wf=3200,Ql=0,Xf=1,Ci="",Ln="srgb",ka="srgb-linear",za="linear",ut="srgb",yo=7680,qf=519,Yf=512,Kf=513,Zf=514,Ec=515,Jf=516,jf=517,Tc=518,Qf=519,lh=35044,ud="300 es",ei=2e3,yr=2001;function ep(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Ha(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function tp(){const n=Ha("canvas");return n.style.display="block",n}const hd={};function Ga(...n){const e="THREE."+n.shift();console.log(e,...n)}function ch(n){const e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Oe(...n){n=ch(n);const e="THREE."+n.shift();{const t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function it(...n){n=ch(n);const e="THREE."+n.shift();{const t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function Ls(...n){const e=n.join(" ");e in hd||(hd[e]=!0,Oe(...n))}function np(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}const ip={[pl]:ml,[gl]:xl,[_l]:yl,[_r]:vl,[ml]:pl,[xl]:gl,[yl]:_l,[vl]:_r};class Ui{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const s=i[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const en=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ra=Math.PI/180,ec=180/Math.PI;function Li(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(en[n&255]+en[n>>8&255]+en[n>>16&255]+en[n>>24&255]+"-"+en[e&255]+en[e>>8&255]+"-"+en[e>>16&15|64]+en[e>>24&255]+"-"+en[t&63|128]+en[t>>8&255]+"-"+en[t>>16&255]+en[t>>24&255]+en[i&255]+en[i>>8&255]+en[i>>16&255]+en[i>>24&255]).toLowerCase()}function Je(n,e,t){return Math.max(e,Math.min(t,n))}function sp(n,e){return(n%e+e)%e}function Mo(n,e,t){return(1-t)*n+t*e}function jn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:case Uint8ClampedArray:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function mt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const rp={DEG2RAD:Ra},zc=class zc{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Je(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Je(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*i-a*s+e.x,this.y=r*s+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};zc.prototype.isVector2=!0;let Ae=zc;class Di{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,a,o){let l=i[s+0],c=i[s+1],p=i[s+2],m=i[s+3],u=r[a+0],d=r[a+1],g=r[a+2],y=r[a+3];if(m!==y||l!==u||c!==d||p!==g){let f=l*u+c*d+p*g+m*y;f<0&&(u=-u,d=-d,g=-g,y=-y,f=-f);let h=1-o;if(f<.9995){const M=Math.acos(f),R=Math.sin(M);h=Math.sin(h*M)/R,o=Math.sin(o*M)/R,l=l*h+u*o,c=c*h+d*o,p=p*h+g*o,m=m*h+y*o}else{l=l*h+u*o,c=c*h+d*o,p=p*h+g*o,m=m*h+y*o;const M=1/Math.sqrt(l*l+c*c+p*p+m*m);l*=M,c*=M,p*=M,m*=M}}e[t]=l,e[t+1]=c,e[t+2]=p,e[t+3]=m}static multiplyQuaternionsFlat(e,t,i,s,r,a){const o=i[s],l=i[s+1],c=i[s+2],p=i[s+3],m=r[a],u=r[a+1],d=r[a+2],g=r[a+3];return e[t]=o*g+p*m+l*d-c*u,e[t+1]=l*g+p*u+c*m-o*d,e[t+2]=c*g+p*d+o*u-l*m,e[t+3]=p*g-o*m-l*u-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(i/2),p=o(s/2),m=o(r/2),u=l(i/2),d=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=u*p*m+c*d*g,this._y=c*d*m-u*p*g,this._z=c*p*g+u*d*m,this._w=c*p*m-u*d*g;break;case"YXZ":this._x=u*p*m+c*d*g,this._y=c*d*m-u*p*g,this._z=c*p*g-u*d*m,this._w=c*p*m+u*d*g;break;case"ZXY":this._x=u*p*m-c*d*g,this._y=c*d*m+u*p*g,this._z=c*p*g+u*d*m,this._w=c*p*m-u*d*g;break;case"ZYX":this._x=u*p*m-c*d*g,this._y=c*d*m+u*p*g,this._z=c*p*g-u*d*m,this._w=c*p*m+u*d*g;break;case"YZX":this._x=u*p*m+c*d*g,this._y=c*d*m+u*p*g,this._z=c*p*g-u*d*m,this._w=c*p*m-u*d*g;break;case"XZY":this._x=u*p*m-c*d*g,this._y=c*d*m-u*p*g,this._z=c*p*g+u*d*m,this._w=c*p*m+u*d*g;break;default:Oe("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],p=t[6],m=t[10],u=i+o+m;if(u>0){const d=.5/Math.sqrt(u+1);this._w=.25/d,this._x=(p-l)*d,this._y=(r-c)*d,this._z=(a-s)*d}else if(i>o&&i>m){const d=2*Math.sqrt(1+i-o-m);this._w=(p-l)/d,this._x=.25*d,this._y=(s+a)/d,this._z=(r+c)/d}else if(o>m){const d=2*Math.sqrt(1+o-i-m);this._w=(r-c)/d,this._x=(s+a)/d,this._y=.25*d,this._z=(l+p)/d}else{const d=2*Math.sqrt(1+m-i-o);this._w=(a-s)/d,this._x=(r+c)/d,this._y=(l+p)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Je(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,p=t._w;return this._x=i*p+a*o+s*c-r*l,this._y=s*p+a*l+r*o-i*c,this._z=r*p+a*c+i*l-s*o,this._w=a*p-i*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),p=Math.sin(c);l=Math.sin(l*c)/p,t=Math.sin(t*c)/p,this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Hc=class Hc{constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(fd.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(fd.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,i=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*i),p=2*(o*t-r*s),m=2*(r*i-a*t);return this.x=t+l*c+a*m-o*p,this.y=i+l*p+o*c-r*m,this.z=s+l*m+r*p-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this.z=Je(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this.z=Je(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Je(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-i*l,this.z=i*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return bo.copy(this).projectOnVector(e),this.sub(bo)}reflect(e){return this.sub(bo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Je(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Hc.prototype.isVector3=!0;let P=Hc;const bo=new P,fd=new Di,Gc=class Gc{constructor(e,t,i,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,l,c)}set(e,t,i,s,r,a,o,l,c){const p=this.elements;return p[0]=e,p[1]=s,p[2]=o,p[3]=t,p[4]=r,p[5]=l,p[6]=i,p[7]=a,p[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],p=i[4],m=i[7],u=i[2],d=i[5],g=i[8],y=s[0],f=s[3],h=s[6],M=s[1],R=s[4],b=s[7],S=s[2],E=s[5],w=s[8];return r[0]=a*y+o*M+l*S,r[3]=a*f+o*R+l*E,r[6]=a*h+o*b+l*w,r[1]=c*y+p*M+m*S,r[4]=c*f+p*R+m*E,r[7]=c*h+p*b+m*w,r[2]=u*y+d*M+g*S,r[5]=u*f+d*R+g*E,r[8]=u*h+d*b+g*w,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],p=e[8];return t*a*p-t*o*c-i*r*p+i*o*l+s*r*c-s*a*l}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],p=e[8],m=p*a-o*c,u=o*l-p*r,d=c*r-a*l,g=t*m+i*u+s*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const y=1/g;return e[0]=m*y,e[1]=(s*c-p*i)*y,e[2]=(o*i-s*a)*y,e[3]=u*y,e[4]=(p*t-s*l)*y,e[5]=(s*r-o*t)*y,e[6]=d*y,e[7]=(i*l-c*t)*y,e[8]=(a*t-i*r)*y,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return Ls("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(So.makeScale(e,t)),this}rotate(e){return Ls("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(So.makeRotation(-e)),this}translate(e,t){return Ls("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(So.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Gc.prototype.isMatrix3=!0;let Ge=Gc;const So=new Ge,pd=new Ge().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),md=new Ge().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function ap(){const n={enabled:!0,workingColorSpace:ka,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===ut&&(s.r=vi(s.r),s.g=vi(s.g),s.b=vi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===ut&&(s.r=Ds(s.r),s.g=Ds(s.g),s.b=Ds(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Ci?za:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ls("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ls("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[ka]:{primaries:e,whitePoint:i,transfer:za,toXYZ:pd,fromXYZ:md,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Ln},outputColorSpaceConfig:{drawingBufferColorSpace:Ln}},[Ln]:{primaries:e,whitePoint:i,transfer:ut,toXYZ:pd,fromXYZ:md,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Ln}}}),n}const tt=ap();function vi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Ds(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let ss;class op{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{ss===void 0&&(ss=Ha("canvas")),ss.width=e.width,ss.height=e.height;const s=ss.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=ss}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Ha("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=vi(r[a]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(vi(t[i]/255)*255):t[i]=vi(t[i]);return{data:t,width:e.width,height:e.height}}else return Oe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let lp=0;class wc{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:lp++}),this.uuid=Li(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Eo(s[a].image)):r.push(Eo(s[a]))}else r=Eo(s);i.url=r}return t||(e.images[this.uuid]=i),i}}function Eo(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?op.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Oe("Texture: Unable to serialize Texture."),{})}let cp=0;const To=new P;class Zt extends Ui{constructor(e=Zt.DEFAULT_IMAGE,t=Zt.DEFAULT_MAPPING,i=gi,s=gi,r=sn,a=$i,o=Hn,l=En,c=Zt.DEFAULT_ANISOTROPY,p=Ci){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:cp++}),this.uuid=Li(),this.name="",this.source=new wc(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ae(0,0),this.repeat=new Ae(1,1),this.center=new Ae(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ge,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=p,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(To).x}get height(){return this.source.getSize(To).y}get depth(){return this.source.getSize(To).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){Oe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Oe(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==th)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ml:e.x=e.x-Math.floor(e.x);break;case gi:e.x=e.x<0?0:1;break;case bl:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ml:e.y=e.y-Math.floor(e.y);break;case gi:e.y=e.y<0?0:1;break;case bl:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Zt.DEFAULT_IMAGE=null;Zt.DEFAULT_MAPPING=th;Zt.DEFAULT_ANISOTROPY=1;const Vc=class Vc{constructor(e=0,t=0,i=0,s=1){this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*i+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r;const l=e.elements,c=l[0],p=l[4],m=l[8],u=l[1],d=l[5],g=l[9],y=l[2],f=l[6],h=l[10];if(Math.abs(p-u)<.01&&Math.abs(m-y)<.01&&Math.abs(g-f)<.01){if(Math.abs(p+u)<.1&&Math.abs(m+y)<.1&&Math.abs(g+f)<.1&&Math.abs(c+d+h-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const R=(c+1)/2,b=(d+1)/2,S=(h+1)/2,E=(p+u)/4,w=(m+y)/4,v=(g+f)/4;return R>b&&R>S?R<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(R),s=E/i,r=w/i):b>S?b<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(b),i=E/s,r=v/s):S<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(S),i=w/r,s=v/r),this.set(i,s,r,t),this}let M=Math.sqrt((f-g)*(f-g)+(m-y)*(m-y)+(u-p)*(u-p));return Math.abs(M)<.001&&(M=1),this.x=(f-g)/M,this.y=(m-y)/M,this.z=(u-p)/M,this.w=Math.acos((c+d+h-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this.z=Je(this.z,e.z,t.z),this.w=Je(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this.z=Je(this.z,e,t),this.w=Je(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Je(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Vc.prototype.isVector4=!0;let Lt=Vc;class dp extends Ui{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:sn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new Lt(0,0,e,t),this.scissorTest=!1,this.viewport=new Lt(0,0,e,t),this.textures=[];const s={width:e,height:t,depth:i.depth},r=new Zt(s),a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:sn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new wc(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){const t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Vn extends dp{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class dh extends Zt{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Kt,this.minFilter=Kt,this.wrapR=gi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class up extends Zt{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Kt,this.minFilter=Kt,this.wrapR=gi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}}const Ja=class Ja{constructor(e,t,i,s,r,a,o,l,c,p,m,u,d,g,y,f){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,l,c,p,m,u,d,g,y,f)}set(e,t,i,s,r,a,o,l,c,p,m,u,d,g,y,f){const h=this.elements;return h[0]=e,h[4]=t,h[8]=i,h[12]=s,h[1]=r,h[5]=a,h[9]=o,h[13]=l,h[2]=c,h[6]=p,h[10]=m,h[14]=u,h[3]=d,h[7]=g,h[11]=y,h[15]=f,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ja().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,i=e.elements,s=1/rs.setFromMatrixColumn(e,0).length(),r=1/rs.setFromMatrixColumn(e,1).length(),a=1/rs.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,s=e.y,r=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),p=Math.cos(r),m=Math.sin(r);if(e.order==="XYZ"){const u=a*p,d=a*m,g=o*p,y=o*m;t[0]=l*p,t[4]=-l*m,t[8]=c,t[1]=d+g*c,t[5]=u-y*c,t[9]=-o*l,t[2]=y-u*c,t[6]=g+d*c,t[10]=a*l}else if(e.order==="YXZ"){const u=l*p,d=l*m,g=c*p,y=c*m;t[0]=u+y*o,t[4]=g*o-d,t[8]=a*c,t[1]=a*m,t[5]=a*p,t[9]=-o,t[2]=d*o-g,t[6]=y+u*o,t[10]=a*l}else if(e.order==="ZXY"){const u=l*p,d=l*m,g=c*p,y=c*m;t[0]=u-y*o,t[4]=-a*m,t[8]=g+d*o,t[1]=d+g*o,t[5]=a*p,t[9]=y-u*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const u=a*p,d=a*m,g=o*p,y=o*m;t[0]=l*p,t[4]=g*c-d,t[8]=u*c+y,t[1]=l*m,t[5]=y*c+u,t[9]=d*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const u=a*l,d=a*c,g=o*l,y=o*c;t[0]=l*p,t[4]=y-u*m,t[8]=g*m+d,t[1]=m,t[5]=a*p,t[9]=-o*p,t[2]=-c*p,t[6]=d*m+g,t[10]=u-y*m}else if(e.order==="XZY"){const u=a*l,d=a*c,g=o*l,y=o*c;t[0]=l*p,t[4]=-m,t[8]=c*p,t[1]=u*m+y,t[5]=a*p,t[9]=d*m-g,t[2]=g*m-d,t[6]=o*p,t[10]=y*m+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(hp,e,fp)}lookAt(e,t,i){const s=this.elements;return Mn.subVectors(e,t),Mn.lengthSq()===0&&(Mn.z=1),Mn.normalize(),Si.crossVectors(i,Mn),Si.lengthSq()===0&&(Math.abs(i.z)===1?Mn.x+=1e-4:Mn.z+=1e-4,Mn.normalize(),Si.crossVectors(i,Mn)),Si.normalize(),Gr.crossVectors(Mn,Si),s[0]=Si.x,s[4]=Gr.x,s[8]=Mn.x,s[1]=Si.y,s[5]=Gr.y,s[9]=Mn.y,s[2]=Si.z,s[6]=Gr.z,s[10]=Mn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],p=i[1],m=i[5],u=i[9],d=i[13],g=i[2],y=i[6],f=i[10],h=i[14],M=i[3],R=i[7],b=i[11],S=i[15],E=s[0],w=s[4],v=s[8],T=s[12],C=s[1],L=s[5],U=s[9],G=s[13],O=s[2],k=s[6],J=s[10],X=s[14],re=s[3],Y=s[7],te=s[11],se=s[15];return r[0]=a*E+o*C+l*O+c*re,r[4]=a*w+o*L+l*k+c*Y,r[8]=a*v+o*U+l*J+c*te,r[12]=a*T+o*G+l*X+c*se,r[1]=p*E+m*C+u*O+d*re,r[5]=p*w+m*L+u*k+d*Y,r[9]=p*v+m*U+u*J+d*te,r[13]=p*T+m*G+u*X+d*se,r[2]=g*E+y*C+f*O+h*re,r[6]=g*w+y*L+f*k+h*Y,r[10]=g*v+y*U+f*J+h*te,r[14]=g*T+y*G+f*X+h*se,r[3]=M*E+R*C+b*O+S*re,r[7]=M*w+R*L+b*k+S*Y,r[11]=M*v+R*U+b*J+S*te,r[15]=M*T+R*G+b*X+S*se,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],p=e[2],m=e[6],u=e[10],d=e[14],g=e[3],y=e[7],f=e[11],h=e[15],M=l*d-c*u,R=o*d-c*m,b=o*u-l*m,S=a*d-c*p,E=a*u-l*p,w=a*m-o*p;return t*(y*M-f*R+h*b)-i*(g*M-f*S+h*E)+s*(g*R-y*S+h*w)-r*(g*b-y*E+f*w)}determinantAffine(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],p=e[10];return t*(a*p-o*c)-i*(r*p-o*l)+s*(r*c-a*l)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],p=e[8],m=e[9],u=e[10],d=e[11],g=e[12],y=e[13],f=e[14],h=e[15],M=t*o-i*a,R=t*l-s*a,b=t*c-r*a,S=i*l-s*o,E=i*c-r*o,w=s*c-r*l,v=p*y-m*g,T=p*f-u*g,C=p*h-d*g,L=m*f-u*y,U=m*h-d*y,G=u*h-d*f,O=M*G-R*U+b*L+S*C-E*T+w*v;if(O===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const k=1/O;return e[0]=(o*G-l*U+c*L)*k,e[1]=(s*U-i*G-r*L)*k,e[2]=(y*w-f*E+h*S)*k,e[3]=(u*E-m*w-d*S)*k,e[4]=(l*C-a*G-c*T)*k,e[5]=(t*G-s*C+r*T)*k,e[6]=(f*b-g*w-h*R)*k,e[7]=(p*w-u*b+d*R)*k,e[8]=(a*U-o*C+c*v)*k,e[9]=(i*C-t*U-r*v)*k,e[10]=(g*E-y*b+h*M)*k,e[11]=(m*b-p*E-d*M)*k,e[12]=(o*T-a*L-l*v)*k,e[13]=(t*L-i*T+s*v)*k,e[14]=(y*R-g*S-f*M)*k,e[15]=(p*S-m*R+u*M)*k,this}scale(e){const t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),s=Math.sin(t),r=1-i,a=e.x,o=e.y,l=e.z,c=r*a,p=r*o;return this.set(c*a+i,c*o-s*l,c*l+s*o,0,c*o+s*l,p*o+i,p*l-s*a,0,c*l-s*o,p*l+s*a,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,a){return this.set(1,i,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){const s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,p=a+a,m=o+o,u=r*c,d=r*p,g=r*m,y=a*p,f=a*m,h=o*m,M=l*c,R=l*p,b=l*m,S=i.x,E=i.y,w=i.z;return s[0]=(1-(y+h))*S,s[1]=(d+b)*S,s[2]=(g-R)*S,s[3]=0,s[4]=(d-b)*E,s[5]=(1-(u+h))*E,s[6]=(f+M)*E,s[7]=0,s[8]=(g+R)*w,s[9]=(f-M)*w,s[10]=(1-(u+y))*w,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinantAffine();if(r===0)return i.set(1,1,1),t.identity(),this;let a=rs.set(s[0],s[1],s[2]).length();const o=rs.set(s[4],s[5],s[6]).length(),l=rs.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Fn.copy(this);const c=1/a,p=1/o,m=1/l;return Fn.elements[0]*=c,Fn.elements[1]*=c,Fn.elements[2]*=c,Fn.elements[4]*=p,Fn.elements[5]*=p,Fn.elements[6]*=p,Fn.elements[8]*=m,Fn.elements[9]*=m,Fn.elements[10]*=m,t.setFromRotationMatrix(Fn),i.x=a,i.y=o,i.z=l,this}makePerspective(e,t,i,s,r,a,o=ei,l=!1){const c=this.elements,p=2*r/(t-e),m=2*r/(i-s),u=(t+e)/(t-e),d=(i+s)/(i-s);let g,y;if(l)g=r/(a-r),y=a*r/(a-r);else if(o===ei)g=-(a+r)/(a-r),y=-2*a*r/(a-r);else if(o===yr)g=-a/(a-r),y=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=p,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=m,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=y,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,s,r,a,o=ei,l=!1){const c=this.elements,p=2/(t-e),m=2/(i-s),u=-(t+e)/(t-e),d=-(i+s)/(i-s);let g,y;if(l)g=1/(a-r),y=a/(a-r);else if(o===ei)g=-2/(a-r),y=-(a+r)/(a-r);else if(o===yr)g=-1/(a-r),y=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=p,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=m,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=g,c[14]=y,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}};Ja.prototype.isMatrix4=!0;let ft=Ja;const rs=new P,Fn=new ft,hp=new P(0,0,0),fp=new P(1,1,1),Si=new P,Gr=new P,Mn=new P,gd=new ft,_d=new Di;class Ii{constructor(e=0,t=0,i=0,s=Ii.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],p=s[9],m=s[2],u=s[6],d=s[10];switch(t){case"XYZ":this._y=Math.asin(Je(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-p,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Je(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-m,r),this._z=0);break;case"ZXY":this._x=Math.asin(Je(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-m,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Je(m,-1,1)),Math.abs(m)<.9999999?(this._x=Math.atan2(u,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Je(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-p,c),this._y=Math.atan2(-m,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-Je(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-p,d),this._y=0);break;default:Oe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return gd.makeRotationFromQuaternion(e),this.setFromRotationMatrix(gd,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return _d.setFromEuler(this),this.setFromQuaternion(_d,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ii.DEFAULT_ORDER="XYZ";class Ac{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let pp=0;const vd=new P,as=new Di,oi=new ft,Vr=new P,Ws=new P,mp=new P,gp=new Di,xd=new P(1,0,0),yd=new P(0,1,0),Md=new P(0,0,1),bd={type:"added"},_p={type:"removed"},os={type:"childadded",child:null},wo={type:"childremoved",child:null};class kt extends Ui{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:pp++}),this.uuid=Li(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=kt.DEFAULT_UP.clone();const e=new P,t=new Ii,i=new Di,s=new P(1,1,1);function r(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ft},normalMatrix:{value:new Ge}}),this.matrix=new ft,this.matrixWorld=new ft,this.matrixAutoUpdate=kt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=kt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ac,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return as.setFromAxisAngle(e,t),this.quaternion.multiply(as),this}rotateOnWorldAxis(e,t){return as.setFromAxisAngle(e,t),this.quaternion.premultiply(as),this}rotateX(e){return this.rotateOnAxis(xd,e)}rotateY(e){return this.rotateOnAxis(yd,e)}rotateZ(e){return this.rotateOnAxis(Md,e)}translateOnAxis(e,t){return vd.copy(e).applyQuaternion(this.quaternion),this.position.add(vd.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(xd,e)}translateY(e){return this.translateOnAxis(yd,e)}translateZ(e){return this.translateOnAxis(Md,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(oi.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Vr.copy(e):Vr.set(e,t,i);const s=this.parent;this.updateWorldMatrix(!0,!1),Ws.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?oi.lookAt(Ws,Vr,this.up):oi.lookAt(Vr,Ws,this.up),this.quaternion.setFromRotationMatrix(oi),s&&(oi.extractRotation(s.matrixWorld),as.setFromRotationMatrix(oi),this.quaternion.premultiply(as.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(it("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(bd),os.child=e,this.dispatchEvent(os),os.child=null):it("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(_p),wo.child=e,this.dispatchEvent(wo),wo.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),oi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),oi.multiply(e.parent.matrixWorld)),e.applyMatrix4(oi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(bd),os.child=e,this.dispatchEvent(os),os.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){const a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ws,e,mp),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ws,gp,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,i=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*i-r[8]*s,r[13]+=i-r[1]*t-r[5]*i-r[9]*s,r[14]+=s-r[2]*t-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){const r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,p=l.length;c<p;c++){const m=l[c];r(e.shapes,m)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),p=a(e.images),m=a(e.shapes),u=a(e.skeletons),d=a(e.animations),g=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),p.length>0&&(i.images=p),m.length>0&&(i.shapes=m),u.length>0&&(i.skeletons=u),d.length>0&&(i.animations=d),g.length>0&&(i.nodes=g)}return i.object=s,i;function a(o){const l=[];for(const c in o){const p=o[c];delete p.metadata,l.push(p)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}kt.DEFAULT_UP=new P(0,1,0);kt.DEFAULT_MATRIX_AUTO_UPDATE=!0;kt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class ti extends kt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const vp={type:"move"};class Ao{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ti,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ti,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ti,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const y of e.hand.values()){const f=t.getJointPose(y,i),h=this._getHandJoint(c,y);f!==null&&(h.matrix.fromArray(f.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,h.jointRadius=f.radius),h.visible=f!==null}const p=c.joints["index-finger-tip"],m=c.joints["thumb-tip"],u=p.position.distanceTo(m.position),d=.02,g=.005;c.inputState.pinching&&u>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(vp)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new ti;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const uh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ei={h:0,s:0,l:0},$r={h:0,s:0,l:0};function Ro(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class ke{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ln){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,tt.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=tt.workingColorSpace){return this.r=e,this.g=t,this.b=i,tt.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=tt.workingColorSpace){if(e=sp(e,1),t=Je(t,0,1),i=Je(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,a=2*i-r;this.r=Ro(a,r,e+1/3),this.g=Ro(a,r,e),this.b=Ro(a,r,e-1/3)}return tt.colorSpaceToWorking(this,s),this}setStyle(e,t=Ln){function i(r){r!==void 0&&parseFloat(r)<1&&Oe("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Oe("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Oe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ln){const i=uh[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Oe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=vi(e.r),this.g=vi(e.g),this.b=vi(e.b),this}copyLinearToSRGB(e){return this.r=Ds(e.r),this.g=Ds(e.g),this.b=Ds(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ln){return tt.workingToColorSpace(tn.copy(this),e),Math.round(Je(tn.r*255,0,255))*65536+Math.round(Je(tn.g*255,0,255))*256+Math.round(Je(tn.b*255,0,255))}getHexString(e=Ln){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=tt.workingColorSpace){tt.workingToColorSpace(tn.copy(this),t);const i=tn.r,s=tn.g,r=tn.b,a=Math.max(i,s,r),o=Math.min(i,s,r);let l,c;const p=(o+a)/2;if(o===a)l=0,c=0;else{const m=a-o;switch(c=p<=.5?m/(a+o):m/(2-a-o),a){case i:l=(s-r)/m+(s<r?6:0);break;case s:l=(r-i)/m+2;break;case r:l=(i-s)/m+4;break}l/=6}return e.h=l,e.s=c,e.l=p,e}getRGB(e,t=tt.workingColorSpace){return tt.workingToColorSpace(tn.copy(this),t),e.r=tn.r,e.g=tn.g,e.b=tn.b,e}getStyle(e=Ln){tt.workingToColorSpace(tn.copy(this),e);const t=tn.r,i=tn.g,s=tn.b;return e!==Ln?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Ei),this.setHSL(Ei.h+e,Ei.s+t,Ei.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Ei),e.getHSL($r);const i=Mo(Ei.h,$r.h,t),s=Mo(Ei.s,$r.s,t),r=Mo(Ei.l,$r.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const tn=new ke;ke.NAMES=uh;class xp extends kt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ii,this.environmentIntensity=1,this.environmentRotation=new Ii,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}}const On=new P,li=new P,Co=new P,ci=new P,ls=new P,cs=new P,Sd=new P,Po=new P,Lo=new P,Do=new P,Io=new Lt,No=new Lt,Uo=new Lt;class In{constructor(e=new P,t=new P,i=new P){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),On.subVectors(e,t),s.cross(On);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){On.subVectors(s,t),li.subVectors(i,t),Co.subVectors(e,t);const a=On.dot(On),o=On.dot(li),l=On.dot(Co),c=li.dot(li),p=li.dot(Co),m=a*c-o*o;if(m===0)return r.set(0,0,0),null;const u=1/m,d=(c*l-o*p)*u,g=(a*p-o*l)*u;return r.set(1-d-g,g,d)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,ci)===null?!1:ci.x>=0&&ci.y>=0&&ci.x+ci.y<=1}static getInterpolation(e,t,i,s,r,a,o,l){return this.getBarycoord(e,t,i,s,ci)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ci.x),l.addScaledVector(a,ci.y),l.addScaledVector(o,ci.z),l)}static getInterpolatedAttribute(e,t,i,s,r,a){return Io.setScalar(0),No.setScalar(0),Uo.setScalar(0),Io.fromBufferAttribute(e,t),No.fromBufferAttribute(e,i),Uo.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Io,r.x),a.addScaledVector(No,r.y),a.addScaledVector(Uo,r.z),a}static isFrontFacing(e,t,i,s){return On.subVectors(i,t),li.subVectors(e,t),On.cross(li).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return On.subVectors(this.c,this.b),li.subVectors(this.a,this.b),On.cross(li).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return In.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return In.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return In.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return In.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return In.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,s=this.b,r=this.c;let a,o;ls.subVectors(s,i),cs.subVectors(r,i),Po.subVectors(e,i);const l=ls.dot(Po),c=cs.dot(Po);if(l<=0&&c<=0)return t.copy(i);Lo.subVectors(e,s);const p=ls.dot(Lo),m=cs.dot(Lo);if(p>=0&&m<=p)return t.copy(s);const u=l*m-p*c;if(u<=0&&l>=0&&p<=0)return a=l/(l-p),t.copy(i).addScaledVector(ls,a);Do.subVectors(e,r);const d=ls.dot(Do),g=cs.dot(Do);if(g>=0&&d<=g)return t.copy(r);const y=d*c-l*g;if(y<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(i).addScaledVector(cs,o);const f=p*g-d*m;if(f<=0&&m-p>=0&&d-g>=0)return Sd.subVectors(r,s),o=(m-p)/(m-p+(d-g)),t.copy(s).addScaledVector(Sd,o);const h=1/(f+y+u);return a=y*h,o=u*h,t.copy(i).addScaledVector(ls,a).addScaledVector(cs,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class es{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Bn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Bn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Bn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Bn):Bn.fromBufferAttribute(r,a),Bn.applyMatrix4(e.matrixWorld),this.expandByPoint(Bn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Wr.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Wr.copy(i.boundingBox)),Wr.applyMatrix4(e.matrixWorld),this.union(Wr)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Bn),Bn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Xs),Xr.subVectors(this.max,Xs),ds.subVectors(e.a,Xs),us.subVectors(e.b,Xs),hs.subVectors(e.c,Xs),Ti.subVectors(us,ds),wi.subVectors(hs,us),Bi.subVectors(ds,hs);let t=[0,-Ti.z,Ti.y,0,-wi.z,wi.y,0,-Bi.z,Bi.y,Ti.z,0,-Ti.x,wi.z,0,-wi.x,Bi.z,0,-Bi.x,-Ti.y,Ti.x,0,-wi.y,wi.x,0,-Bi.y,Bi.x,0];return!Fo(t,ds,us,hs,Xr)||(t=[1,0,0,0,1,0,0,0,1],!Fo(t,ds,us,hs,Xr))?!1:(qr.crossVectors(Ti,wi),t=[qr.x,qr.y,qr.z],Fo(t,ds,us,hs,Xr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Bn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Bn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(di[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),di[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),di[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),di[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),di[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),di[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),di[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),di[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(di),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const di=[new P,new P,new P,new P,new P,new P,new P,new P],Bn=new P,Wr=new es,ds=new P,us=new P,hs=new P,Ti=new P,wi=new P,Bi=new P,Xs=new P,Xr=new P,qr=new P,ki=new P;function Fo(n,e,t,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){ki.fromArray(n,r);const o=s.x*Math.abs(ki.x)+s.y*Math.abs(ki.y)+s.z*Math.abs(ki.z),l=e.dot(ki),c=t.dot(ki),p=i.dot(ki);if(Math.max(-Math.max(l,c,p),Math.min(l,c,p))>o)return!1}return!0}const Ft=new P,Yr=new Ae;let yp=0;class rn extends Ui{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:yp++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=lh,this.updateRanges=[],this.gpuType=zn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Yr.fromBufferAttribute(this,t),Yr.applyMatrix3(e),this.setXY(t,Yr.x,Yr.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.applyMatrix3(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.applyMatrix4(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.applyNormalMatrix(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.transformDirection(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=jn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=mt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=jn(t,this.array)),t}setX(e,t){return this.normalized&&(t=mt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=jn(t,this.array)),t}setY(e,t){return this.normalized&&(t=mt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=jn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=mt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=jn(t,this.array)),t}setW(e,t){return this.normalized&&(t=mt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=mt(t,this.array),i=mt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=mt(t,this.array),i=mt(i,this.array),s=mt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=mt(t,this.array),i=mt(i,this.array),s=mt(s,this.array),r=mt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}}class hh extends rn{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class fh extends rn{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class gt extends rn{constructor(e,t,i){super(new Float32Array(e),t,i)}}const Mp=new es,qs=new P,Oo=new P;class ts{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):Mp.setFromPoints(e).getCenter(i);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;qs.subVectors(e,this.center);const t=qs.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(qs,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Oo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(qs.copy(e.center).add(Oo)),this.expandByPoint(qs.copy(e.center).sub(Oo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let bp=0;const Cn=new ft,Bo=new kt,fs=new P,bn=new es,Ys=new es,Wt=new P;class Dt extends Ui{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:bp++}),this.uuid=Li(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(ep(e)?fh:hh)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new Ge().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Cn.makeRotationFromQuaternion(e),this.applyMatrix4(Cn),this}rotateX(e){return Cn.makeRotationX(e),this.applyMatrix4(Cn),this}rotateY(e){return Cn.makeRotationY(e),this.applyMatrix4(Cn),this}rotateZ(e){return Cn.makeRotationZ(e),this.applyMatrix4(Cn),this}translate(e,t,i){return Cn.makeTranslation(e,t,i),this.applyMatrix4(Cn),this}scale(e,t,i){return Cn.makeScale(e,t,i),this.applyMatrix4(Cn),this}lookAt(e){return Bo.lookAt(e),Bo.updateMatrix(),this.applyMatrix4(Bo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(fs).negate(),this.translate(fs.x,fs.y,fs.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new gt(i,3))}else{const i=Math.min(e.length,t.count);for(let s=0;s<i;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Oe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new es);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){it("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){const r=t[i];bn.setFromBufferAttribute(r),this.morphTargetsRelative?(Wt.addVectors(this.boundingBox.min,bn.min),this.boundingBox.expandByPoint(Wt),Wt.addVectors(this.boundingBox.max,bn.max),this.boundingBox.expandByPoint(Wt)):(this.boundingBox.expandByPoint(bn.min),this.boundingBox.expandByPoint(bn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&it('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ts);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){it("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){const i=this.boundingSphere.center;if(bn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];Ys.setFromBufferAttribute(o),this.morphTargetsRelative?(Wt.addVectors(bn.min,Ys.min),bn.expandByPoint(Wt),Wt.addVectors(bn.max,Ys.max),bn.expandByPoint(Wt)):(bn.expandByPoint(Ys.min),bn.expandByPoint(Ys.max))}bn.getCenter(i);let s=0;for(let r=0,a=e.count;r<a;r++)Wt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Wt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,p=o.count;c<p;c++)Wt.fromBufferAttribute(o,c),l&&(fs.fromBufferAttribute(e,c),Wt.add(fs)),s=Math.max(s,i.distanceToSquared(Wt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&it('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){it("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,s=t.normal,r=t.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new rn(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));const o=[],l=[];for(let v=0;v<i.count;v++)o[v]=new P,l[v]=new P;const c=new P,p=new P,m=new P,u=new Ae,d=new Ae,g=new Ae,y=new P,f=new P;function h(v,T,C){c.fromBufferAttribute(i,v),p.fromBufferAttribute(i,T),m.fromBufferAttribute(i,C),u.fromBufferAttribute(r,v),d.fromBufferAttribute(r,T),g.fromBufferAttribute(r,C),p.sub(c),m.sub(c),d.sub(u),g.sub(u);const L=1/(d.x*g.y-g.x*d.y);isFinite(L)&&(y.copy(p).multiplyScalar(g.y).addScaledVector(m,-d.y).multiplyScalar(L),f.copy(m).multiplyScalar(d.x).addScaledVector(p,-g.x).multiplyScalar(L),o[v].add(y),o[T].add(y),o[C].add(y),l[v].add(f),l[T].add(f),l[C].add(f))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let v=0,T=M.length;v<T;++v){const C=M[v],L=C.start,U=C.count;for(let G=L,O=L+U;G<O;G+=3)h(e.getX(G+0),e.getX(G+1),e.getX(G+2))}const R=new P,b=new P,S=new P,E=new P;function w(v){S.fromBufferAttribute(s,v),E.copy(S);const T=o[v];R.copy(T),R.sub(S.multiplyScalar(S.dot(T))).normalize(),b.crossVectors(E,T);const L=b.dot(l[v])<0?-1:1;a.setXYZW(v,R.x,R.y,R.z,L)}for(let v=0,T=M.length;v<T;++v){const C=M[v],L=C.start,U=C.count;for(let G=L,O=L+U;G<O;G+=3)w(e.getX(G+0)),w(e.getX(G+1)),w(e.getX(G+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new rn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let u=0,d=i.count;u<d;u++)i.setXYZ(u,0,0,0);const s=new P,r=new P,a=new P,o=new P,l=new P,c=new P,p=new P,m=new P;if(e)for(let u=0,d=e.count;u<d;u+=3){const g=e.getX(u+0),y=e.getX(u+1),f=e.getX(u+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,y),a.fromBufferAttribute(t,f),p.subVectors(a,r),m.subVectors(s,r),p.cross(m),o.fromBufferAttribute(i,g),l.fromBufferAttribute(i,y),c.fromBufferAttribute(i,f),o.add(p),l.add(p),c.add(p),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(y,l.x,l.y,l.z),i.setXYZ(f,c.x,c.y,c.z)}else for(let u=0,d=t.count;u<d;u+=3)s.fromBufferAttribute(t,u+0),r.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),p.subVectors(a,r),m.subVectors(s,r),p.cross(m),i.setXYZ(u+0,p.x,p.y,p.z),i.setXYZ(u+1,p.x,p.y,p.z),i.setXYZ(u+2,p.x,p.y,p.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Wt.fromBufferAttribute(e,t),Wt.normalize(),e.setXYZ(t,Wt.x,Wt.y,Wt.z)}toNonIndexed(){function e(o,l){const c=o.array,p=o.itemSize,m=o.normalized,u=new c.constructor(l.length*p);let d=0,g=0;for(let y=0,f=l.length;y<f;y++){o.isInterleavedBufferAttribute?d=l[y]*o.data.stride+o.offset:d=l[y]*p;for(let h=0;h<p;h++)u[g++]=c[d++]}return new rn(u,p,m)}if(this.index===null)return Oe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Dt,i=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=e(l,i);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let p=0,m=c.length;p<m;p++){const u=c[p],d=e(u,i);l.push(d)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],p=[];for(let m=0,u=c.length;m<u;m++){const d=c[m];p.push(d.toJSON(e.data))}p.length>0&&(s[l]=p,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const s=e.attributes;for(const c in s){const p=s[c];this.setAttribute(c,p.clone(t))}const r=e.morphAttributes;for(const c in r){const p=[],m=r[c];for(let u=0,d=m.length;u<d;u++)p.push(m[u].clone(t));this.morphAttributes[c]=p}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,p=a.length;c<p;c++){const m=a[c];this.addGroup(m.start,m.count,m.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Sp{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=lh,this.updateRanges=[],this.version=0,this.uuid=Li()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[i+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Li()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Li()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));const t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}}const on=new P;class Va{constructor(e,t,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)on.fromBufferAttribute(this,t),on.applyMatrix4(e),this.setXYZ(t,on.x,on.y,on.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)on.fromBufferAttribute(this,t),on.applyNormalMatrix(e),this.setXYZ(t,on.x,on.y,on.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)on.fromBufferAttribute(this,t),on.transformDirection(e),this.setXYZ(t,on.x,on.y,on.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=jn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=mt(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=mt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=mt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=mt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=mt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=jn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=jn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=jn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=jn(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=mt(t,this.array),i=mt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=mt(t,this.array),i=mt(i,this.array),s=mt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=mt(t,this.array),i=mt(i,this.array),s=mt(s,this.array),r=mt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){Ga("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new rn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Va(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Ga("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const ko=new P,Ep=new P,Tp=new Ge;class kn{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const s=ko.subVectors(i,t).cross(Ep.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){const s=e.delta(ko),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Tp.getNormalMatrix(e),s=this.coplanarPoint(ko).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}}let wp=0;class Fi extends Ui{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:wp++}),this.uuid=Li(),this.name="",this.type="Material",this.blending=dr,this.side=Ji,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Xu,this.blendDst=qu,this.blendEquation=Ss,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ke(0,0,0),this.blendAlpha=0,this.depthFunc=_r,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=qf,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=yo,this.stencilZFail=yo,this.stencilZPass=yo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){Oe(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Oe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new ke().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(i=>new kn().fromJSON(i))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Ae().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ae().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class ph extends Fi{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new ke(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let ps;const Ks=new P,ms=new P,gs=new P,_s=new Ae,Zs=new Ae,mh=new ft,Kr=new P,Js=new P,Zr=new P,Ed=new Ae,zo=new Ae,Td=new Ae;class gh extends kt{constructor(e=new ph){if(super(),this.isSprite=!0,this.type="Sprite",ps===void 0){ps=new Dt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new Sp(t,5);ps.setIndex([0,1,2,0,2,3]),ps.setAttribute("position",new Va(i,3,0,!1)),ps.setAttribute("uv",new Va(i,2,3,!1))}this.geometry=ps,this.material=e,this.center=new Ae(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&it('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),ms.setFromMatrixScale(this.matrixWorld),mh.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),gs.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ms.multiplyScalar(-gs.z);const i=this.material.rotation;let s,r;i!==0&&(r=Math.cos(i),s=Math.sin(i));const a=this.center;Jr(Kr.set(-.5,-.5,0),gs,a,ms,s,r),Jr(Js.set(.5,-.5,0),gs,a,ms,s,r),Jr(Zr.set(.5,.5,0),gs,a,ms,s,r),Ed.set(0,0),zo.set(1,0),Td.set(1,1);let o=e.ray.intersectTriangle(Kr,Js,Zr,!1,Ks);if(o===null&&(Jr(Js.set(-.5,.5,0),gs,a,ms,s,r),zo.set(0,1),o=e.ray.intersectTriangle(Kr,Zr,Js,!1,Ks),o===null))return;const l=e.ray.origin.distanceTo(Ks);l<e.near||l>e.far||t.push({distance:l,point:Ks.clone(),uv:In.getInterpolation(Ks,Kr,Js,Zr,Ed,zo,Td,new Ae),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Jr(n,e,t,i,s,r){_s.subVectors(n,t).addScalar(.5).multiply(i),s!==void 0?(Zs.x=r*_s.x-s*_s.y,Zs.y=s*_s.x+r*_s.y):Zs.copy(_s),n.copy(e),n.x+=Zs.x,n.y+=Zs.y,n.applyMatrix4(mh)}const ui=new P,Ho=new P,jr=new P,Qr=new P;class Lr{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ui)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=ui.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ui.copy(this.origin).addScaledVector(this.direction,t),ui.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Ho.copy(e).add(t).multiplyScalar(.5),jr.copy(t).sub(e).normalize(),Qr.copy(this.origin).sub(Ho);const r=e.distanceTo(t)*.5,a=-this.direction.dot(jr),o=Qr.dot(this.direction),l=-Qr.dot(jr),c=Qr.lengthSq(),p=Math.abs(1-a*a);let m,u,d,g;if(p>0)if(m=a*l-o,u=a*o-l,g=r*p,m>=0)if(u>=-g)if(u<=g){const y=1/p;m*=y,u*=y,d=m*(m+a*u+2*o)+u*(a*m+u+2*l)+c}else u=r,m=Math.max(0,-(a*u+o)),d=-m*m+u*(u+2*l)+c;else u=-r,m=Math.max(0,-(a*u+o)),d=-m*m+u*(u+2*l)+c;else u<=-g?(m=Math.max(0,-(-a*r+o)),u=m>0?-r:Math.min(Math.max(-r,-l),r),d=-m*m+u*(u+2*l)+c):u<=g?(m=0,u=Math.min(Math.max(-r,-l),r),d=u*(u+2*l)+c):(m=Math.max(0,-(a*r+o)),u=m>0?r:Math.min(Math.max(-r,-l),r),d=-m*m+u*(u+2*l)+c);else u=a>0?-r:r,m=Math.max(0,-(a*u+o)),d=-m*m+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,m),s&&s.copy(Ho).addScaledVector(jr,u),d}intersectSphere(e,t){if(e.radius<0)return null;ui.subVectors(e.center,this.origin);const i=ui.dot(this.direction),s=ui.dot(ui)-i*i,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,a,o,l;const c=1/this.direction.x,p=1/this.direction.y,m=1/this.direction.z,u=this.origin;return c>=0?(i=(e.min.x-u.x)*c,s=(e.max.x-u.x)*c):(i=(e.max.x-u.x)*c,s=(e.min.x-u.x)*c),p>=0?(r=(e.min.y-u.y)*p,a=(e.max.y-u.y)*p):(r=(e.max.y-u.y)*p,a=(e.min.y-u.y)*p),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),m>=0?(o=(e.min.z-u.z)*m,l=(e.max.z-u.z)*m):(o=(e.max.z-u.z)*m,l=(e.min.z-u.z)*m),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,ui)!==null}intersectTriangle(e,t,i,s,r){const a=this.origin,o=this.direction,l=o.x,c=o.y,p=o.z,m=e.x-a.x,u=e.y-a.y,d=e.z-a.z,g=t.x-a.x,y=t.y-a.y,f=t.z-a.z,h=i.x-a.x,M=i.y-a.y,R=i.z-a.z,b=Math.abs(l),S=Math.abs(c),E=Math.abs(p);let w,v,T,C,L,U,G,O,k,J,X,re;if(b>=S&&b>=E?(T=l,U=m,k=g,re=h,l>=0?(w=c,v=p,C=u,L=d,G=y,O=f,J=M,X=R):(w=p,v=c,C=d,L=u,G=f,O=y,J=R,X=M)):S>=E?(T=c,U=u,k=y,re=M,c>=0?(w=p,v=l,C=d,L=m,G=f,O=g,J=R,X=h):(w=l,v=p,C=m,L=d,G=g,O=f,J=h,X=R)):(T=p,U=d,k=f,re=R,p>=0?(w=l,v=c,C=m,L=u,G=g,O=y,J=h,X=M):(w=c,v=l,C=u,L=m,G=y,O=g,J=M,X=h)),T===0)return null;const Y=w/T,te=v/T,se=1/T,Ie=C-Y*U,Pe=L-te*U,vt=G-Y*k,nt=O-te*k,at=J-Y*re,K=X-te*re,ee=at*nt-K*vt,be=Ie*K-Pe*at,He=vt*Pe-nt*Ie;if(s){if(ee<0||be<0||He<0)return null}else if((ee<0||be<0||He<0)&&(ee>0||be>0||He>0))return null;const xe=ee+be+He;if(xe===0)return null;const Ye=se*(ee*U+be*k+He*re);return(xe>0?Ye<0:Ye>0)?null:this.at(Ye/xe,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class pn extends Fi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ke(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ii,this.combine=gc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const wd=new ft,zi=new Lr,ea=new ts,Ad=new P,ta=new P,na=new P,ia=new P,Go=new P,sa=new P,Rd=new P,ra=new P;class Tt extends kt{constructor(e=new Dt,t=new pn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){sa.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const p=o[l],m=r[l];p!==0&&(Go.fromBufferAttribute(m,e),a?sa.addScaledVector(Go,p):sa.addScaledVector(Go.sub(t),p))}t.add(sa)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),ea.copy(i.boundingSphere),ea.applyMatrix4(r),zi.copy(e.ray).recast(e.near),!(ea.containsPoint(zi.origin)===!1&&(zi.intersectSphere(ea,Ad)===null||zi.origin.distanceToSquared(Ad)>(e.far-e.near)**2))&&(wd.copy(r).invert(),zi.copy(e.ray).applyMatrix4(wd),!(i.boundingBox!==null&&zi.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,zi)))}_computeIntersections(e,t,i){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,p=r.attributes.uv1,m=r.attributes.normal,u=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,y=u.length;g<y;g++){const f=u[g],h=a[f.materialIndex],M=Math.max(f.start,d.start),R=Math.min(o.count,Math.min(f.start+f.count,d.start+d.count));for(let b=M,S=R;b<S;b+=3){const E=o.getX(b),w=o.getX(b+1),v=o.getX(b+2);s=aa(this,h,e,i,c,p,m,E,w,v),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=f.materialIndex,t.push(s))}}else{const g=Math.max(0,d.start),y=Math.min(o.count,d.start+d.count);for(let f=g,h=y;f<h;f+=3){const M=o.getX(f),R=o.getX(f+1),b=o.getX(f+2);s=aa(this,a,e,i,c,p,m,M,R,b),s&&(s.faceIndex=Math.floor(f/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,y=u.length;g<y;g++){const f=u[g],h=a[f.materialIndex],M=Math.max(f.start,d.start),R=Math.min(l.count,Math.min(f.start+f.count,d.start+d.count));for(let b=M,S=R;b<S;b+=3){const E=b,w=b+1,v=b+2;s=aa(this,h,e,i,c,p,m,E,w,v),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=f.materialIndex,t.push(s))}}else{const g=Math.max(0,d.start),y=Math.min(l.count,d.start+d.count);for(let f=g,h=y;f<h;f+=3){const M=f,R=f+1,b=f+2;s=aa(this,a,e,i,c,p,m,M,R,b),s&&(s.faceIndex=Math.floor(f/3),t.push(s))}}}}function Ap(n,e,t,i,s,r,a,o){let l;if(e.side===fn?l=i.intersectTriangle(a,r,s,!0,o):l=i.intersectTriangle(s,r,a,e.side===Ji,o),l===null)return null;ra.copy(o),ra.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo(ra);return c<t.near||c>t.far?null:{distance:c,point:ra.clone(),object:n}}function aa(n,e,t,i,s,r,a,o,l,c){n.getVertexPosition(o,ta),n.getVertexPosition(l,na),n.getVertexPosition(c,ia);const p=Ap(n,e,t,i,ta,na,ia,Rd);if(p){const m=new P;In.getBarycoord(Rd,ta,na,ia,m),s&&(p.uv=In.getInterpolatedAttribute(s,o,l,c,m,new Ae)),r&&(p.uv1=In.getInterpolatedAttribute(r,o,l,c,m,new Ae)),a&&(p.normal=In.getInterpolatedAttribute(a,o,l,c,m,new P),p.normal.dot(i.direction)>0&&p.normal.multiplyScalar(-1));const u={a:o,b:l,c,normal:new P,materialIndex:0};In.getNormal(ta,na,ia,u.normal),p.face=u,p.barycoord=m}return p}class _h extends Zt{constructor(e=null,t=1,i=1,s,r,a,o,l,c=Kt,p=Kt,m,u){super(null,a,o,l,c,p,s,r,m,u),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Cd extends rn{constructor(e,t,i,s=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const vs=new ft,Pd=new ft,oa=[],Ld=new es,Rp=new ft,js=new Tt,Qs=new ts;class Cp extends Tt{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Cd(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,Rp)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new es),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,vs),Ld.copy(e.boundingBox).applyMatrix4(vs),this.boundingBox.union(Ld)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new ts),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,vs),Qs.copy(e.boundingSphere).applyMatrix4(vs),this.boundingSphere.union(Qs)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const i=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,a=e*r+1;for(let o=0;o<i.length;o++)i[o]=s[a+o]}raycast(e,t){const i=this.matrixWorld,s=this.count;if(js.geometry=this.geometry,js.material=this.material,js.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Qs.copy(this.boundingSphere),Qs.applyMatrix4(i),e.ray.intersectsSphere(Qs)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,vs),Pd.multiplyMatrices(i,vs),js.matrixWorld=Pd,js.raycast(e,oa);for(let a=0,o=oa.length;a<o;a++){const l=oa[a];l.instanceId=r,l.object=this,t.push(l)}oa.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Cd(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){const i=t.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new _h(new Float32Array(s*this.count),s,this.count,yc,zn));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<i.length;c++)a+=i[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;return r[l]=o,r.set(i,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Hi=new ts,Pp=new Ae(.5,.5),la=new P;class Rc{constructor(e=new kn,t=new kn,i=new kn,s=new kn,r=new kn,a=new kn){this.planes=[e,t,i,s,r,a]}set(e,t,i,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=ei,i=!1){const s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],p=r[4],m=r[5],u=r[6],d=r[7],g=r[8],y=r[9],f=r[10],h=r[11],M=r[12],R=r[13],b=r[14],S=r[15];if(s[0].setComponents(c-a,d-p,h-g,S-M).normalize(),s[1].setComponents(c+a,d+p,h+g,S+M).normalize(),s[2].setComponents(c+o,d+m,h+y,S+R).normalize(),s[3].setComponents(c-o,d-m,h-y,S-R).normalize(),i)s[4].setComponents(l,u,f,b).normalize(),s[5].setComponents(c-l,d-u,h-f,S-b).normalize();else if(s[4].setComponents(c-l,d-u,h-f,S-b).normalize(),t===ei)s[5].setComponents(c+l,d+u,h+f,S+b).normalize();else if(t===yr)s[5].setComponents(l,u,f,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Hi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Hi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Hi)}intersectsSprite(e){Hi.center.set(0,0,0);const t=Pp.distanceTo(e.center);return Hi.radius=.7071067811865476+t,Hi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Hi)}intersectsSphere(e){const t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const s=t[i];if(la.x=s.normal.x>0?e.max.x:e.min.x,la.y=s.normal.y>0?e.max.y:e.min.y,la.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(la)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Dr extends Fi{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ke(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const $a=new P,Wa=new P,Dd=new ft,er=new Lr,ca=new ts,Vo=new P,Id=new P;class Cc extends kt{constructor(e=new Dt,t=new Dr){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)$a.fromBufferAttribute(t,s-1),Wa.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=$a.distanceTo(Wa);e.setAttribute("lineDistance",new gt(i,1))}else Oe("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),ca.copy(i.boundingSphere),ca.applyMatrix4(s),ca.radius+=r,e.ray.intersectsSphere(ca)===!1)return;Dd.copy(s).invert(),er.copy(e.ray).applyMatrix4(Dd);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,p=i.index,u=i.attributes.position;if(p!==null){const d=Math.max(0,a.start),g=Math.min(p.count,a.start+a.count);for(let y=d,f=g-1;y<f;y+=c){const h=p.getX(y),M=p.getX(y+1),R=da(this,e,er,l,h,M,y);R&&t.push(R)}if(this.isLineLoop){const y=p.getX(g-1),f=p.getX(d),h=da(this,e,er,l,y,f,g-1);h&&t.push(h)}}else{const d=Math.max(0,a.start),g=Math.min(u.count,a.start+a.count);for(let y=d,f=g-1;y<f;y+=c){const h=da(this,e,er,l,y,y+1,y);h&&t.push(h)}if(this.isLineLoop){const y=da(this,e,er,l,g-1,d,g-1);y&&t.push(y)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function da(n,e,t,i,s,r,a){const o=n.geometry.attributes.position;if($a.fromBufferAttribute(o,s),Wa.fromBufferAttribute(o,r),t.distanceSqToSegment($a,Wa,Vo,Id)>i)return;Vo.applyMatrix4(n.matrixWorld);const c=e.ray.origin.distanceTo(Vo);if(!(c<e.near||c>e.far))return{distance:c,point:Id.clone().applyMatrix4(n.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:n}}const Nd=new P,Ud=new P;class to extends Cc{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let s=0,r=t.count;s<r;s+=2)Nd.fromBufferAttribute(t,s),Ud.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+Nd.distanceTo(Ud);e.setAttribute("lineDistance",new gt(i,1))}else Oe("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Lp extends Fi{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new ke(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Fd=new ft,tc=new Lr,ua=new ts,ha=new P;class vh extends kt{constructor(e=new Dt,t=new Lp){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),ua.copy(i.boundingSphere),ua.applyMatrix4(s),ua.radius+=r,e.ray.intersectsSphere(ua)===!1)return;Fd.copy(s).invert(),tc.copy(e.ray).applyMatrix4(Fd);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,m=i.attributes.position;if(c!==null){const u=Math.max(0,a.start),d=Math.min(c.count,a.start+a.count);for(let g=u,y=d;g<y;g++){const f=c.getX(g);ha.fromBufferAttribute(m,f),Od(ha,f,l,s,e,t,this)}}else{const u=Math.max(0,a.start),d=Math.min(m.count,a.start+a.count);for(let g=u,y=d;g<y;g++)ha.fromBufferAttribute(m,g),Od(ha,g,l,s,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Od(n,e,t,i,s,r,a){const o=tc.distanceSqToPoint(n);if(o<t){const l=new P;tc.closestPointToPoint(n,l),l.applyMatrix4(i);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class xh extends Zt{constructor(e=[],t=ji,i,s,r,a,o,l,c,p){super(e,t,i,s,r,a,o,l,c,p),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Dp extends Zt{constructor(e,t,i,s,r,a,o,l,c){super(e,t,i,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Mr extends Zt{constructor(e,t,i=ri,s,r,a,o=Kt,l=Kt,c,p=xi,m=1){if(p!==xi&&p!==Wi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const u={width:e,height:t,depth:m};super(u,s,r,a,o,l,p,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new wc(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}}class Ip extends Mr{constructor(e,t=ri,i=ji,s,r,a=Kt,o=Kt,l,c=xi){const p={width:e,height:e,depth:1},m=[p,p,p,p,p,p];super(e,e,t,i,s,r,a,o,l,c),this.image=m,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class yh extends Zt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Ir extends Dt{constructor(e=1,t=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],p=[],m=[];let u=0,d=0;g("z","y","x",-1,-1,i,t,e,a,r,0),g("z","y","x",1,-1,i,t,-e,a,r,1),g("x","z","y",1,1,e,i,t,s,a,2),g("x","z","y",1,-1,e,i,-t,s,a,3),g("x","y","z",1,-1,e,t,i,s,r,4),g("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new gt(c,3)),this.setAttribute("normal",new gt(p,3)),this.setAttribute("uv",new gt(m,2));function g(y,f,h,M,R,b,S,E,w,v,T){const C=b/w,L=S/v,U=b/2,G=S/2,O=E/2,k=w+1,J=v+1;let X=0,re=0;const Y=new P;for(let te=0;te<J;te++){const se=te*L-G;for(let Ie=0;Ie<k;Ie++){const Pe=Ie*C-U;Y[y]=Pe*M,Y[f]=se*R,Y[h]=O,c.push(Y.x,Y.y,Y.z),Y[y]=0,Y[f]=0,Y[h]=E>0?1:-1,p.push(Y.x,Y.y,Y.z),m.push(Ie/w),m.push(1-te/v),X+=1}}for(let te=0;te<v;te++)for(let se=0;se<w;se++){const Ie=u+se+k*te,Pe=u+se+k*(te+1),vt=u+(se+1)+k*(te+1),nt=u+(se+1)+k*te;l.push(Ie,Pe,nt),l.push(Pe,vt,nt),re+=6}o.addGroup(d,re,T),d+=re,u+=X}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ir(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class Pc extends Dt{constructor(e=1,t=1,i=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const p=[],m=[],u=[],d=[];let g=0;const y=[],f=i/2;let h=0;M(),a===!1&&(e>0&&R(!0),t>0&&R(!1)),this.setIndex(p),this.setAttribute("position",new gt(m,3)),this.setAttribute("normal",new gt(u,3)),this.setAttribute("uv",new gt(d,2));function M(){const b=new P,S=new P;let E=0;const w=(t-e)/i;for(let v=0;v<=r;v++){const T=[],C=v/r,L=C*(t-e)+e;for(let U=0;U<=s;U++){const G=U/s,O=G*l+o,k=Math.sin(O),J=Math.cos(O);S.x=L*k,S.y=-C*i+f,S.z=L*J,m.push(S.x,S.y,S.z),b.set(k,w,J).normalize(),u.push(b.x,b.y,b.z),d.push(G,1-C),T.push(g++)}y.push(T)}for(let v=0;v<s;v++)for(let T=0;T<r;T++){const C=y[T][v],L=y[T+1][v],U=y[T+1][v+1],G=y[T][v+1];(e>0||T!==0)&&(p.push(C,L,G),E+=3),(t>0||T!==r-1)&&(p.push(L,U,G),E+=3)}c.addGroup(h,E,0),h+=E}function R(b){const S=g,E=new Ae,w=new P;let v=0;const T=b===!0?e:t,C=b===!0?1:-1;for(let U=1;U<=s;U++)m.push(0,f*C,0),u.push(0,C,0),d.push(.5,.5),g++;const L=g;for(let U=0;U<=s;U++){const O=U/s*l+o,k=Math.cos(O),J=Math.sin(O);w.x=T*J,w.y=f*C,w.z=T*k,m.push(w.x,w.y,w.z),u.push(0,C,0),E.x=k*.5+.5,E.y=J*.5*C+.5,d.push(E.x,E.y),g++}for(let U=0;U<s;U++){const G=S+U,O=L+U;b===!0?p.push(O,O+1,G):p.push(O+1,O,G),v+=3}c.addGroup(h,v,b===!0?1:2),h+=v}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Pc(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Lc extends Dt{constructor(e=[],t=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:s};const r=[],a=[];o(s),c(i),p(),this.setAttribute("position",new gt(r,3)),this.setAttribute("normal",new gt(r.slice(),3)),this.setAttribute("uv",new gt(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(M){const R=new P,b=new P,S=new P;for(let E=0;E<t.length;E+=3)d(t[E+0],R),d(t[E+1],b),d(t[E+2],S),l(R,b,S,M)}function l(M,R,b,S){const E=S+1,w=[];for(let v=0;v<=E;v++){w[v]=[];const T=M.clone().lerp(b,v/E),C=R.clone().lerp(b,v/E),L=E-v;for(let U=0;U<=L;U++)U===0&&v===E?w[v][U]=T:w[v][U]=T.clone().lerp(C,U/L)}for(let v=0;v<E;v++)for(let T=0;T<2*(E-v)-1;T++){const C=Math.floor(T/2);T%2===0?(u(w[v][C+1]),u(w[v+1][C]),u(w[v][C])):(u(w[v][C+1]),u(w[v+1][C+1]),u(w[v+1][C]))}}function c(M){const R=new P;for(let b=0;b<r.length;b+=3)R.x=r[b+0],R.y=r[b+1],R.z=r[b+2],R.normalize().multiplyScalar(M),r[b+0]=R.x,r[b+1]=R.y,r[b+2]=R.z}function p(){const M=new P;for(let R=0;R<r.length;R+=3){M.x=r[R+0],M.y=r[R+1],M.z=r[R+2];const b=f(M)/2/Math.PI+.5,S=h(M)/Math.PI+.5;a.push(b,1-S)}g(),m()}function m(){for(let M=0;M<a.length;M+=6){const R=a[M+0],b=a[M+2],S=a[M+4],E=Math.max(R,b,S),w=Math.min(R,b,S);E>.9&&w<.1&&(R<.2&&(a[M+0]+=1),b<.2&&(a[M+2]+=1),S<.2&&(a[M+4]+=1))}}function u(M){r.push(M.x,M.y,M.z)}function d(M,R){const b=M*3;R.x=e[b+0],R.y=e[b+1],R.z=e[b+2]}function g(){const M=new P,R=new P,b=new P,S=new P,E=new Ae,w=new Ae,v=new Ae;for(let T=0,C=0;T<r.length;T+=9,C+=6){M.set(r[T+0],r[T+1],r[T+2]),R.set(r[T+3],r[T+4],r[T+5]),b.set(r[T+6],r[T+7],r[T+8]),E.set(a[C+0],a[C+1]),w.set(a[C+2],a[C+3]),v.set(a[C+4],a[C+5]),S.copy(M).add(R).add(b).divideScalar(3);const L=f(S);y(E,C+0,M,L),y(w,C+2,R,L),y(v,C+4,b,L)}}function y(M,R,b,S){S<0&&M.x===1&&(a[R]=M.x-1),b.x===0&&b.z===0&&(a[R]=S/2/Math.PI+.5)}function f(M){return Math.atan2(M.z,-M.x)}function h(M){return Math.atan2(-M.y,Math.sqrt(M.x*M.x+M.z*M.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Lc(e.vertices,e.indices,e.radius,e.detail)}}class Xa extends Lc{constructor(e=1,t=0){const i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Xa(e.radius,e.detail)}}class no extends Dt{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(i),l=Math.floor(s),c=o+1,p=l+1,m=e/o,u=t/l,d=[],g=[],y=[],f=[];for(let h=0;h<p;h++){const M=h*u-a;for(let R=0;R<c;R++){const b=R*m-r;g.push(b,-M,0),y.push(0,0,1),f.push(R/o),f.push(1-h/l)}}for(let h=0;h<l;h++)for(let M=0;M<o;M++){const R=M+c*h,b=M+c*(h+1),S=M+1+c*(h+1),E=M+1+c*h;d.push(R,b,E),d.push(b,S,E)}this.setIndex(d),this.setAttribute("position",new gt(g,3)),this.setAttribute("normal",new gt(y,3)),this.setAttribute("uv",new gt(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new no(e.width,e.height,e.widthSegments,e.heightSegments)}}class io extends Dt{constructor(e=.5,t=1,i=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:a},i=Math.max(3,i),s=Math.max(1,s);const o=[],l=[],c=[],p=[];let m=e;const u=(t-e)/s,d=new P,g=new Ae;for(let y=0;y<=s;y++){for(let f=0;f<=i;f++){const h=r+f/i*a;d.x=m*Math.cos(h),d.y=m*Math.sin(h),l.push(d.x,d.y,d.z),c.push(0,0,1),g.x=(d.x/t+1)/2,g.y=(d.y/t+1)/2,p.push(g.x,g.y)}m+=u}for(let y=0;y<s;y++){const f=y*(i+1);for(let h=0;h<i;h++){const M=h+f,R=M,b=M+i+1,S=M+i+2,E=M+1;o.push(R,b,E),o.push(b,S,E)}}this.setIndex(o),this.setAttribute("position",new gt(l,3)),this.setAttribute("normal",new gt(c,3)),this.setAttribute("uv",new gt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new io(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class si extends Dt{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const l=Math.min(a+o,Math.PI);let c=0;const p=[],m=new P,u=new P,d=[],g=[],y=[],f=[];for(let h=0;h<=i;h++){const M=[],R=h/i,b=a+R*o,S=e*Math.cos(b),E=Math.sqrt(e*e-S*S);let w=0;h===0&&a===0?w=.5/t:h===i&&l===Math.PI&&(w=-.5/t);for(let v=0;v<=t;v++){const T=v/t,C=s+T*r;m.x=-E*Math.cos(C),m.y=S,m.z=E*Math.sin(C),g.push(m.x,m.y,m.z),u.copy(m).normalize(),y.push(u.x,u.y,u.z),f.push(T+w,1-R),M.push(c++)}p.push(M)}for(let h=0;h<i;h++)for(let M=0;M<t;M++){const R=p[h][M+1],b=p[h][M],S=p[h+1][M],E=p[h+1][M+1];(h!==0||a>0)&&d.push(R,b,E),(h!==i-1||l<Math.PI)&&d.push(b,S,E)}this.setIndex(d),this.setAttribute("position",new gt(g,3)),this.setAttribute("normal",new gt(y,3)),this.setAttribute("uv",new gt(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new si(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Mh extends Dt{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){const t=[],i=new Set,s=new P,r=new P;if(e.index!==null){const a=e.attributes.position,o=e.index;let l=e.groups;l.length===0&&(l=[{start:0,count:o.count,materialIndex:0}]);for(let c=0,p=l.length;c<p;++c){const m=l[c],u=m.start,d=m.count;for(let g=u,y=u+d;g<y;g+=3)for(let f=0;f<3;f++){const h=o.getX(g+f),M=o.getX(g+(f+1)%3);s.fromBufferAttribute(a,h),r.fromBufferAttribute(a,M),Bd(s,r,i)===!0&&(t.push(s.x,s.y,s.z),t.push(r.x,r.y,r.z))}}}else{const a=e.attributes.position;for(let o=0,l=a.count/3;o<l;o++)for(let c=0;c<3;c++){const p=3*o+c,m=3*o+(c+1)%3;s.fromBufferAttribute(a,p),r.fromBufferAttribute(a,m),Bd(s,r,i)===!0&&(t.push(s.x,s.y,s.z),t.push(r.x,r.y,r.z))}}this.setAttribute("position",new gt(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}function Bd(n,e,t){const i=`${n.x},${n.y},${n.z}-${e.x},${e.y},${e.z}`,s=`${e.x},${e.y},${e.z}-${n.x},${n.y},${n.z}`;return t.has(i)===!0||t.has(s)===!0?!1:(t.add(i),t.add(s),!0)}function zs(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const s=n[t][i];if(kd(s))s.isRenderTargetTexture?(Oe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone();else if(Array.isArray(s))if(kd(s[0])){const r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][i]=r}else e[t][i]=s.slice();else e[t][i]=s}}return e}function ln(n){const e={};for(let t=0;t<n.length;t++){const i=zs(n[t]);for(const s in i)e[s]=i[s]}return e}function kd(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function Np(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function bh(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:tt.workingColorSpace}const Up={clone:zs,merge:ln};var Fp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Op=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class $n extends Fi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Fp,this.fragmentShader=Op,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=zs(e.uniforms),this.uniformsGroups=Np(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const i in e.uniforms){const s=e.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=t[s.value]||null;break;case"c":this.uniforms[i].value=new ke().setHex(s.value);break;case"v2":this.uniforms[i].value=new Ae().fromArray(s.value);break;case"v3":this.uniforms[i].value=new P().fromArray(s.value);break;case"v4":this.uniforms[i].value=new Lt().fromArray(s.value);break;case"m3":this.uniforms[i].value=new Ge().fromArray(s.value);break;case"m4":this.uniforms[i].value=new ft().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class Bp extends $n{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class kp extends Fi{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new ke(16777215),this.specular=new ke(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ke(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ql,this.normalScale=new Ae(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ii,this.combine=gc,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class zp extends Fi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Wf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Hp extends Fi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Sh extends kt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ke(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}const $o=new ft,zd=new P,Hd=new P;class Gp{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ae(512,512),this.mapType=En,this.map=null,this.mapPass=null,this.matrix=new ft,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Rc,this._frameExtents=new Ae(1,1),this._viewportCount=1,this._viewports=[new Lt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera;zd.setFromMatrixPosition(e.matrixWorld),t.position.copy(zd),Hd.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Hd),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,i,s){$o.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),i.setFromProjectionMatrix($o,e.coordinateSystem,e.reversedDepth);const r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===yr||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply($o)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const fa=new P,pa=new Di,Yn=new P;class Eh extends kt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ft,this.projectionMatrix=new ft,this.projectionMatrixInverse=new ft,this.coordinateSystem=ei,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(fa,pa,Yn),Yn.x===1&&Yn.y===1&&Yn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(fa,pa,Yn.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(fa,pa,Yn),Yn.x===1&&Yn.y===1&&Yn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(fa,pa,Yn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Ai=new P,Gd=new Ae,Vd=new Ae;class Dn extends Eh{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=ec*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Ra*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ec*2*Math.atan(Math.tan(Ra*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Ai.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ai.x,Ai.y).multiplyScalar(-e/Ai.z),Ai.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ai.x,Ai.y).multiplyScalar(-e/Ai.z)}getViewSize(e,t){return this.getViewBounds(e,Gd,Vd),t.subVectors(Vd,Gd)}setViewOffset(e,t,i,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Ra*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*i/c,s*=a.width/l,i*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class Dc extends Eh{constructor(e=-1,t=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-e,a=i+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,p=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=p*this.view.offsetY,l=o-p*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Vp extends Gp{constructor(){super(new Dc(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class $d extends Sh{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(kt.DEFAULT_UP),this.updateMatrix(),this.target=new kt,this.shadow=new Vp}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class $p extends Sh{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}const xs=-90,ys=1;class Wp extends kt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Dn(xs,ys,e,t);s.layers=this.layers,this.add(s);const r=new Dn(xs,ys,e,t);r.layers=this.layers,this.add(r);const a=new Dn(xs,ys,e,t);a.layers=this.layers,this.add(a);const o=new Dn(xs,ys,e,t);o.layers=this.layers,this.add(o);const l=new Dn(xs,ys,e,t);l.layers=this.layers,this.add(l);const c=new Dn(xs,ys,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,s,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===ei)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===yr)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,p]=this.children,m=e.getRenderTarget(),u=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const y=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let f=!1;e.isWebGLRenderer===!0?f=e.state.buffers.depth.getReversed():f=e.reversedDepthBuffer,e.setRenderTarget(i,0,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,2,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,3,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(i,4,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),i.texture.generateMipmaps=y,e.setRenderTarget(i,5,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,p),e.setRenderTarget(m,u,d),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class Xp extends Dn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const Wd=new ft;class qp{constructor(e,t,i=0,s=1/0){this.ray=new Lr(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new Ac,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):it("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Wd.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Wd),this}intersectObject(e,t=!0,i=[]){return nc(e,this,i,t),i.sort(Xd),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)nc(e[s],this,i,t);return i.sort(Xd),i}}function Xd(n,e){return n.distance-e.distance}function nc(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){const r=n.children;for(let a=0,o=r.length;a<o;a++)nc(r[a],e,t,!0)}}class ic{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Je(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(Je(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const $c=class $c{constructor(e,t,i,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,s){const r=this.elements;return r[0]=e,r[2]=t,r[1]=i,r[3]=s,this}};$c.prototype.isMatrix2=!0;let qd=$c;class qa extends to{constructor(e=10,t=10,i=4473924,s=8947848){i=new ke(i),s=new ke(s);const r=t/2,a=e/t,o=e/2,l=[],c=[];for(let u=0,d=0,g=-o;u<=t;u++,g+=a){l.push(-o,0,g,o,0,g),l.push(g,0,-o,g,0,o);const y=u===r?i:s;y.toArray(c,d),d+=3,y.toArray(c,d),d+=3,y.toArray(c,d),d+=3,y.toArray(c,d),d+=3}const p=new Dt;p.setAttribute("position",new gt(l,3)),p.setAttribute("color",new gt(c,3));const m=new Dr({vertexColors:!0,toneMapped:!1});super(p,m),this.type="GridHelper"}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}}class Yp extends Ui{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}}function Yd(n,e,t,i){const s=Kp(i);switch(t){case ah:return n*e;case yc:return n*e/s.components*s.byteLength;case Mc:return n*e/s.components*s.byteLength;case Qi:return n*e*2/s.components*s.byteLength;case bc:return n*e*2/s.components*s.byteLength;case oh:return n*e*3/s.components*s.byteLength;case Hn:return n*e*4/s.components*s.byteLength;case Sc:return n*e*4/s.components*s.byteLength;case Ea:case Ta:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case wa:case Aa:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case El:case wl:return Math.max(n,16)*Math.max(e,8)/4;case Sl:case Tl:return Math.max(n,8)*Math.max(e,8)/2;case Al:case Rl:case Pl:case Ll:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Cl:case Oa:case Dl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Il:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Nl:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Ul:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Fl:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Ol:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Bl:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case kl:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case zl:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Hl:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Gl:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case Vl:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case $l:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Wl:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Xl:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case ql:case Yl:case Kl:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Zl:case Jl:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Ba:case jl:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Kp(n){switch(n){case En:case nh:return{byteLength:1,components:1};case vr:case ih:case ai:return{byteLength:2,components:1};case vc:case xc:return{byteLength:2,components:4};case ri:case _c:case zn:return{byteLength:4,components:1};case sh:case rh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:mc}}));typeof window<"u"&&(window.__THREE__?Oe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=mc);function Th(){let n=null,e=!1,t=null,i=null;function s(r,a){i=n.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function Zp(n){const e=new WeakMap;function t(o,l){const c=o.array,p=o.usage,m=c.byteLength,u=n.createBuffer();n.bindBuffer(l,u),n.bufferData(l,c,p),o.onUploadCallback();let d;if(c instanceof Float32Array)d=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=n.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=n.HALF_FLOAT:d=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=n.SHORT;else if(c instanceof Uint32Array)d=n.UNSIGNED_INT;else if(c instanceof Int32Array)d=n.INT;else if(c instanceof Int8Array)d=n.BYTE;else if(c instanceof Uint8Array)d=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:m}}function i(o,l,c){const p=l.array,m=l.updateRanges;if(n.bindBuffer(c,o),m.length===0)n.bufferSubData(c,0,p);else{m.sort((d,g)=>d.start-g.start);let u=0;for(let d=1;d<m.length;d++){const g=m[u],y=m[d];y.start<=g.start+g.count+1?g.count=Math.max(g.count,y.start+y.count-g.start):(++u,m[u]=y)}m.length=u+1;for(let d=0,g=m.length;d<g;d++){const y=m[d];n.bufferSubData(c,y.start*p.BYTES_PER_ELEMENT,p,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(n.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const p=e.get(o);(!p||p.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Jp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,jp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Qp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,em=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,tm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,nm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,im=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,sm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,rm=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,am=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,om=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,lm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,cm=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,dm=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,um=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,hm=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,fm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,pm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,mm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,gm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,_m=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,vm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,xm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,ym=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Mm=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,bm=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Sm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Em=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Tm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,wm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Am="gl_FragColor = linearToOutputTexel( gl_FragColor );",Rm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Cm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Pm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Lm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Dm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Im=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Nm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Um=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Fm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Om=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Bm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,km=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,zm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Hm=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Gm=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Vm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,$m=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Wm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Xm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,qm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Ym=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Km=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Zm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Jm=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,jm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Qm=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,eg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,tg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ng=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ig=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,sg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,rg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ag=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,og=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,lg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,cg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,dg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,ug=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,hg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,fg=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,pg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,mg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,gg=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,_g=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,vg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,xg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,yg=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Mg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,bg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Sg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Eg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Tg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,wg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Ag=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Rg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Cg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Pg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Lg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Dg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Ig=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Ng=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Ug=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Fg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Og=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Bg=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,kg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,zg=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Hg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Gg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Vg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,$g=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Wg=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Xg=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,qg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Yg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Kg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Zg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Jg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,jg=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Qg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,e_=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,t_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,n_=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,i_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,s_=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,r_=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,a_=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,o_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,l_=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,c_=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,d_=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,u_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,h_=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,f_=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,p_=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,m_=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,g_=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,__=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,v_=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,x_=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,y_=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,M_=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,b_=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,S_=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,E_=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,T_=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,w_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,A_=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,R_=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,C_=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,P_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,qe={alphahash_fragment:Jp,alphahash_pars_fragment:jp,alphamap_fragment:Qp,alphamap_pars_fragment:em,alphatest_fragment:tm,alphatest_pars_fragment:nm,aomap_fragment:im,aomap_pars_fragment:sm,batching_pars_vertex:rm,batching_vertex:am,begin_vertex:om,beginnormal_vertex:lm,bsdfs:cm,iridescence_fragment:dm,bumpmap_pars_fragment:um,clipping_planes_fragment:hm,clipping_planes_pars_fragment:fm,clipping_planes_pars_vertex:pm,clipping_planes_vertex:mm,color_fragment:gm,color_pars_fragment:_m,color_pars_vertex:vm,color_vertex:xm,common:ym,cube_uv_reflection_fragment:Mm,defaultnormal_vertex:bm,displacementmap_pars_vertex:Sm,displacementmap_vertex:Em,emissivemap_fragment:Tm,emissivemap_pars_fragment:wm,colorspace_fragment:Am,colorspace_pars_fragment:Rm,envmap_fragment:Cm,envmap_common_pars_fragment:Pm,envmap_pars_fragment:Lm,envmap_pars_vertex:Dm,envmap_physical_pars_fragment:Vm,envmap_vertex:Im,fog_vertex:Nm,fog_pars_vertex:Um,fog_fragment:Fm,fog_pars_fragment:Om,gradientmap_pars_fragment:Bm,lightmap_pars_fragment:km,lights_lambert_fragment:zm,lights_lambert_pars_fragment:Hm,lights_pars_begin:Gm,lights_toon_fragment:$m,lights_toon_pars_fragment:Wm,lights_phong_fragment:Xm,lights_phong_pars_fragment:qm,lights_physical_fragment:Ym,lights_physical_pars_fragment:Km,lights_fragment_begin:Zm,lights_fragment_maps:Jm,lights_fragment_end:jm,lightprobes_pars_fragment:Qm,logdepthbuf_fragment:eg,logdepthbuf_pars_fragment:tg,logdepthbuf_pars_vertex:ng,logdepthbuf_vertex:ig,map_fragment:sg,map_pars_fragment:rg,map_particle_fragment:ag,map_particle_pars_fragment:og,metalnessmap_fragment:lg,metalnessmap_pars_fragment:cg,morphinstance_vertex:dg,morphcolor_vertex:ug,morphnormal_vertex:hg,morphtarget_pars_vertex:fg,morphtarget_vertex:pg,normal_fragment_begin:mg,normal_fragment_maps:gg,normal_pars_fragment:_g,normal_pars_vertex:vg,normal_vertex:xg,normalmap_pars_fragment:yg,clearcoat_normal_fragment_begin:Mg,clearcoat_normal_fragment_maps:bg,clearcoat_pars_fragment:Sg,iridescence_pars_fragment:Eg,opaque_fragment:Tg,packing:wg,premultiplied_alpha_fragment:Ag,project_vertex:Rg,dithering_fragment:Cg,dithering_pars_fragment:Pg,roughnessmap_fragment:Lg,roughnessmap_pars_fragment:Dg,shadowmap_pars_fragment:Ig,shadowmap_pars_vertex:Ng,shadowmap_vertex:Ug,shadowmask_pars_fragment:Fg,skinbase_vertex:Og,skinning_pars_vertex:Bg,skinning_vertex:kg,skinnormal_vertex:zg,specularmap_fragment:Hg,specularmap_pars_fragment:Gg,tonemapping_fragment:Vg,tonemapping_pars_fragment:$g,transmission_fragment:Wg,transmission_pars_fragment:Xg,uv_pars_fragment:qg,uv_pars_vertex:Yg,uv_vertex:Kg,worldpos_vertex:Zg,background_vert:Jg,background_frag:jg,backgroundCube_vert:Qg,backgroundCube_frag:e_,cube_vert:t_,cube_frag:n_,depth_vert:i_,depth_frag:s_,distance_vert:r_,distance_frag:a_,equirect_vert:o_,equirect_frag:l_,linedashed_vert:c_,linedashed_frag:d_,meshbasic_vert:u_,meshbasic_frag:h_,meshlambert_vert:f_,meshlambert_frag:p_,meshmatcap_vert:m_,meshmatcap_frag:g_,meshnormal_vert:__,meshnormal_frag:v_,meshphong_vert:x_,meshphong_frag:y_,meshphysical_vert:M_,meshphysical_frag:b_,meshtoon_vert:S_,meshtoon_frag:E_,points_vert:T_,points_frag:w_,shadow_vert:A_,shadow_frag:R_,sprite_vert:C_,sprite_frag:P_},pe={common:{diffuse:{value:new ke(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ge}},envmap:{envMap:{value:null},envMapRotation:{value:new Ge},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ge}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ge}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ge},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ge},normalScale:{value:new Ae(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ge},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ge}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ge}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ge}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ke(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new P},probesMax:{value:new P},probesResolution:{value:new P}},points:{diffuse:{value:new ke(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0},uvTransform:{value:new Ge}},sprite:{diffuse:{value:new ke(16777215)},opacity:{value:1},center:{value:new Ae(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}}},Jn={basic:{uniforms:ln([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:qe.meshbasic_vert,fragmentShader:qe.meshbasic_frag},lambert:{uniforms:ln([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new ke(0)},envMapIntensity:{value:1}}]),vertexShader:qe.meshlambert_vert,fragmentShader:qe.meshlambert_frag},phong:{uniforms:ln([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new ke(0)},specular:{value:new ke(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:qe.meshphong_vert,fragmentShader:qe.meshphong_frag},standard:{uniforms:ln([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new ke(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qe.meshphysical_vert,fragmentShader:qe.meshphysical_frag},toon:{uniforms:ln([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new ke(0)}}]),vertexShader:qe.meshtoon_vert,fragmentShader:qe.meshtoon_frag},matcap:{uniforms:ln([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:qe.meshmatcap_vert,fragmentShader:qe.meshmatcap_frag},points:{uniforms:ln([pe.points,pe.fog]),vertexShader:qe.points_vert,fragmentShader:qe.points_frag},dashed:{uniforms:ln([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qe.linedashed_vert,fragmentShader:qe.linedashed_frag},depth:{uniforms:ln([pe.common,pe.displacementmap]),vertexShader:qe.depth_vert,fragmentShader:qe.depth_frag},normal:{uniforms:ln([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:qe.meshnormal_vert,fragmentShader:qe.meshnormal_frag},sprite:{uniforms:ln([pe.sprite,pe.fog]),vertexShader:qe.sprite_vert,fragmentShader:qe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ge},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qe.background_vert,fragmentShader:qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ge}},vertexShader:qe.backgroundCube_vert,fragmentShader:qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qe.cube_vert,fragmentShader:qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qe.equirect_vert,fragmentShader:qe.equirect_frag},distance:{uniforms:ln([pe.common,pe.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qe.distance_vert,fragmentShader:qe.distance_frag},shadow:{uniforms:ln([pe.lights,pe.fog,{color:{value:new ke(0)},opacity:{value:1}}]),vertexShader:qe.shadow_vert,fragmentShader:qe.shadow_frag}};Jn.physical={uniforms:ln([Jn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ge},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ge},clearcoatNormalScale:{value:new Ae(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ge},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ge},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ge},sheen:{value:0},sheenColor:{value:new ke(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ge},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ge},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ge},transmissionSamplerSize:{value:new Ae},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ge},attenuationDistance:{value:0},attenuationColor:{value:new ke(0)},specularColor:{value:new ke(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ge},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ge},anisotropyVector:{value:new Ae},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ge}}]),vertexShader:qe.meshphysical_vert,fragmentShader:qe.meshphysical_frag};const ma={r:0,b:0,g:0},L_=new ft,wh=new Ge;wh.set(-1,0,0,0,1,0,0,0,1);function D_(n,e,t,i,s,r){const a=new ke(0);let o=s===!0?0:1,l,c,p=null,m=0,u=null;function d(M){let R=M.isScene===!0?M.background:null;if(R&&R.isTexture){const b=M.backgroundBlurriness>0;R=e.get(R,b)}return R}function g(M){let R=!1;const b=d(M);b===null?f(a,o):b&&b.isColor&&(f(b,1),R=!0);const S=n.xr.getEnvironmentBlendMode();S==="additive"?t.buffers.color.setClear(0,0,0,1,r):S==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(n.autoClear||R)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function y(M,R){const b=d(R);b&&(b.isCubeTexture||b.mapping===eo)?(c===void 0&&(c=new Tt(new Ir(1,1,1),new $n({name:"BackgroundCubeMaterial",uniforms:zs(Jn.backgroundCube.uniforms),vertexShader:Jn.backgroundCube.vertexShader,fragmentShader:Jn.backgroundCube.fragmentShader,side:fn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(S,E,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=b,c.material.uniforms.backgroundBlurriness.value=R.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=R.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(L_.makeRotationFromEuler(R.backgroundRotation)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(wh),c.material.toneMapped=tt.getTransfer(b.colorSpace)!==ut,(p!==b||m!==b.version||u!==n.toneMapping)&&(c.material.needsUpdate=!0,p=b,m=b.version,u=n.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)):b&&b.isTexture&&(l===void 0&&(l=new Tt(new no(2,2),new $n({name:"BackgroundMaterial",uniforms:zs(Jn.background.uniforms),vertexShader:Jn.background.vertexShader,fragmentShader:Jn.background.fragmentShader,side:Ji,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=b,l.material.uniforms.backgroundIntensity.value=R.backgroundIntensity,l.material.toneMapped=tt.getTransfer(b.colorSpace)!==ut,b.matrixAutoUpdate===!0&&b.updateMatrix(),l.material.uniforms.uvTransform.value.copy(b.matrix),(p!==b||m!==b.version||u!==n.toneMapping)&&(l.material.needsUpdate=!0,p=b,m=b.version,u=n.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null))}function f(M,R){M.getRGB(ma,bh(n)),t.buffers.color.setClear(ma.r,ma.g,ma.b,R,r)}function h(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,R=1){a.set(M),o=R,f(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,f(a,o)},render:g,addToRenderList:y,dispose:h}}function I_(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=u(null);let r=s,a=!1;function o(L,U,G,O,k){let J=!1;const X=m(L,O,G,U);r!==X&&(r=X,c(r.object)),J=d(L,O,G,k),J&&g(L,O,G,k),k!==null&&e.update(k,n.ELEMENT_ARRAY_BUFFER),(J||a)&&(a=!1,b(L,U,G,O),k!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(k).buffer))}function l(){return n.createVertexArray()}function c(L){return n.bindVertexArray(L)}function p(L){return n.deleteVertexArray(L)}function m(L,U,G,O){const k=O.wireframe===!0;let J=i[U.id];J===void 0&&(J={},i[U.id]=J);const X=L.isInstancedMesh===!0?L.id:0;let re=J[X];re===void 0&&(re={},J[X]=re);let Y=re[G.id];Y===void 0&&(Y={},re[G.id]=Y);let te=Y[k];return te===void 0&&(te=u(l()),Y[k]=te),te}function u(L){const U=[],G=[],O=[];for(let k=0;k<t;k++)U[k]=0,G[k]=0,O[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:G,attributeDivisors:O,object:L,attributes:{},index:null}}function d(L,U,G,O){const k=r.attributes,J=U.attributes;let X=0;const re=G.getAttributes();for(const Y in re)if(re[Y].location>=0){const se=k[Y];let Ie=J[Y];if(Ie===void 0&&(Y==="instanceMatrix"&&L.instanceMatrix&&(Ie=L.instanceMatrix),Y==="instanceColor"&&L.instanceColor&&(Ie=L.instanceColor)),se===void 0||se.attribute!==Ie||Ie&&se.data!==Ie.data)return!0;X++}return r.attributesNum!==X||r.index!==O}function g(L,U,G,O){const k={},J=U.attributes;let X=0;const re=G.getAttributes();for(const Y in re)if(re[Y].location>=0){let se=J[Y];se===void 0&&(Y==="instanceMatrix"&&L.instanceMatrix&&(se=L.instanceMatrix),Y==="instanceColor"&&L.instanceColor&&(se=L.instanceColor));const Ie={};Ie.attribute=se,se&&se.data&&(Ie.data=se.data),k[Y]=Ie,X++}r.attributes=k,r.attributesNum=X,r.index=O}function y(){const L=r.newAttributes;for(let U=0,G=L.length;U<G;U++)L[U]=0}function f(L){h(L,0)}function h(L,U){const G=r.newAttributes,O=r.enabledAttributes,k=r.attributeDivisors;G[L]=1,O[L]===0&&(n.enableVertexAttribArray(L),O[L]=1),k[L]!==U&&(n.vertexAttribDivisor(L,U),k[L]=U)}function M(){const L=r.newAttributes,U=r.enabledAttributes;for(let G=0,O=U.length;G<O;G++)U[G]!==L[G]&&(n.disableVertexAttribArray(G),U[G]=0)}function R(L,U,G,O,k,J,X){X===!0?n.vertexAttribIPointer(L,U,G,k,J):n.vertexAttribPointer(L,U,G,O,k,J)}function b(L,U,G,O){y();const k=O.attributes,J=G.getAttributes(),X=U.defaultAttributeValues;for(const re in J){const Y=J[re];if(Y.location>=0){let te=k[re];if(te===void 0&&(re==="instanceMatrix"&&L.instanceMatrix&&(te=L.instanceMatrix),re==="instanceColor"&&L.instanceColor&&(te=L.instanceColor)),te!==void 0){const se=te.normalized,Ie=te.itemSize,Pe=e.get(te);if(Pe===void 0)continue;const vt=Pe.buffer,nt=Pe.type,at=Pe.bytesPerElement,K=nt===n.INT||nt===n.UNSIGNED_INT||te.gpuType===_c;if(te.isInterleavedBufferAttribute){const ee=te.data,be=ee.stride,He=te.offset;if(ee.isInstancedInterleavedBuffer){for(let xe=0;xe<Y.locationSize;xe++)h(Y.location+xe,ee.meshPerAttribute);L.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let xe=0;xe<Y.locationSize;xe++)f(Y.location+xe);n.bindBuffer(n.ARRAY_BUFFER,vt);for(let xe=0;xe<Y.locationSize;xe++)R(Y.location+xe,Ie/Y.locationSize,nt,se,be*at,(He+Ie/Y.locationSize*xe)*at,K)}else{if(te.isInstancedBufferAttribute){for(let ee=0;ee<Y.locationSize;ee++)h(Y.location+ee,te.meshPerAttribute);L.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let ee=0;ee<Y.locationSize;ee++)f(Y.location+ee);n.bindBuffer(n.ARRAY_BUFFER,vt);for(let ee=0;ee<Y.locationSize;ee++)R(Y.location+ee,Ie/Y.locationSize,nt,se,Ie*at,Ie/Y.locationSize*ee*at,K)}}else if(X!==void 0){const se=X[re];if(se!==void 0)switch(se.length){case 2:n.vertexAttrib2fv(Y.location,se);break;case 3:n.vertexAttrib3fv(Y.location,se);break;case 4:n.vertexAttrib4fv(Y.location,se);break;default:n.vertexAttrib1fv(Y.location,se)}}}}M()}function S(){T();for(const L in i){const U=i[L];for(const G in U){const O=U[G];for(const k in O){const J=O[k];for(const X in J)p(J[X].object),delete J[X];delete O[k]}}delete i[L]}}function E(L){if(i[L.id]===void 0)return;const U=i[L.id];for(const G in U){const O=U[G];for(const k in O){const J=O[k];for(const X in J)p(J[X].object),delete J[X];delete O[k]}}delete i[L.id]}function w(L){for(const U in i){const G=i[U];for(const O in G){const k=G[O];if(k[L.id]===void 0)continue;const J=k[L.id];for(const X in J)p(J[X].object),delete J[X];delete k[L.id]}}}function v(L){for(const U in i){const G=i[U],O=L.isInstancedMesh===!0?L.id:0,k=G[O];if(k!==void 0){for(const J in k){const X=k[J];for(const re in X)p(X[re].object),delete X[re];delete k[J]}delete G[O],Object.keys(G).length===0&&delete i[U]}}}function T(){C(),a=!0,r!==s&&(r=s,c(r.object))}function C(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:T,resetDefaultState:C,dispose:S,releaseStatesOfGeometry:E,releaseStatesOfObject:v,releaseStatesOfProgram:w,initAttributes:y,enableAttribute:f,disableUnusedAttributes:M}}function N_(n,e,t){let i;function s(l){i=l}function r(l,c){n.drawArrays(i,l,c),t.update(c,i,1)}function a(l,c,p){p!==0&&(n.drawArraysInstanced(i,l,c,p),t.update(c,i,p))}function o(l,c,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,p);let u=0;for(let d=0;d<p;d++)u+=c[d];t.update(u,i,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function U_(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const w=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(w){return!(w!==Hn&&i.convert(w)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){const v=w===ai&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==En&&w!==zn&&!v&&i.convert(w)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE))}function l(w){if(w==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const p=l(c);p!==c&&(Oe("WebGLRenderer:",c,"not supported, using",p,"instead."),c=p);const m=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&Oe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const d=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=n.getParameter(n.MAX_TEXTURE_SIZE),f=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),h=n.getParameter(n.MAX_VERTEX_ATTRIBS),M=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),R=n.getParameter(n.MAX_VARYING_VECTORS),b=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),S=n.getParameter(n.MAX_SAMPLES),E=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:m,reversedDepthBuffer:u,maxTextures:d,maxVertexTextures:g,maxTextureSize:y,maxCubemapSize:f,maxAttributes:h,maxVertexUniforms:M,maxVaryings:R,maxFragmentUniforms:b,maxSamples:S,samples:E}}function F_(n){const e=this;let t=null,i=0,s=!1,r=!1;const a=new kn,o=new Ge,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(m,u){const d=m.length!==0||u||i!==0||s;return s=u,i=m.length,d},this.beginShadows=function(){r=!0,p(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(m,u){t=p(m,u,0)},this.setState=function(m,u,d){const g=m.clippingPlanes,y=m.clipIntersection,f=m.clipShadows,h=n.get(m);if(!s||g===null||g.length===0||r&&!f)r?p(null):c();else{const M=r?0:i,R=M*4;let b=h.clippingState||null;l.value=b,b=p(g,u,R,d);for(let S=0;S!==R;++S)b[S]=t[S];h.clippingState=b,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function p(m,u,d,g){const y=m!==null?m.length:0;let f=null;if(y!==0){if(f=l.value,g!==!0||f===null){const h=d+y*4,M=u.matrixWorldInverse;o.getNormalMatrix(M),(f===null||f.length<h)&&(f=new Float32Array(h));for(let R=0,b=d;R!==y;++R,b+=4)a.copy(m[R]).applyMatrix4(M,o),a.normal.toArray(f,b),f[b+3]=a.constant}l.value=f,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,f}}const Ts=4,O_=6,B_=20,k_=256,tr=new Dc,Kd=new ke;let Wo=null,Xo=0,qo=0,Yo=!1;const z_=new P,Gi=new P;class Zd{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){const{size:a=256,position:o=z_}=r;Wo=this._renderer.getRenderTarget(),Xo=this._renderer.getActiveCubeFace(),qo=this._renderer.getActiveMipmapLevel(),Yo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Qd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=jd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Wo,Xo,qo),this._renderer.xr.enabled=Yo,e.scissorTest=!1,Ms(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ji||e.mapping===ks?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Wo=this._renderer.getRenderTarget(),Xo=this._renderer.getActiveCubeFace(),qo=this._renderer.getActiveMipmapLevel(),Yo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:sn,minFilter:sn,generateMipmaps:!1,type:ai,format:Hn,colorSpace:ka,depthBuffer:!1},s=Jd(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Jd(e,t,i);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=H_(r)),this._blurMaterial=V_(r,e,t),this._ggxMaterial=G_(r,e,t)}return s}_compileMaterial(e){const t=new Tt(new Dt,e);this._renderer.compile(t,tr)}_sceneToCubeUV(e,t,i,s,r){const l=new Dn(90,1,t,i),c=[1,-1,1,1,1,1],p=[1,1,1,-1,-1,-1],m=this._renderer,u=m.autoClear,d=m.toneMapping;m.getClearColor(Kd),m.toneMapping=ii,m.autoClear=!1,m.state.buffers.depth.getReversed()&&(m.setRenderTarget(s),m.clearDepth(),m.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Tt(new Ir,new pn({name:"PMREM.Background",side:fn,depthWrite:!1,depthTest:!1})));const y=this._backgroundBox,f=y.material;let h=!1;const M=e.background;M?M.isColor&&(f.color.copy(M),e.background=null,h=!0):(f.color.copy(Kd),h=!0);for(let R=0;R<6;R++){const b=R%3;b===0?(l.up.set(0,c[R],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+p[R],r.y,r.z)):b===1?(l.up.set(0,0,c[R]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+p[R],r.z)):(l.up.set(0,c[R],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+p[R]));const S=this._cubeSize;Ms(s,b*S,R>2?S:0,S,S),m.setRenderTarget(s),h&&m.render(y,l),m.render(e,l)}m.toneMapping=d,m.autoClear=u,e.background=M}_textureToCubeUV(e,t){const i=this._renderer,s=e.mapping===ji||e.mapping===ks;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Qd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=jd());const r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;const o=r.uniforms;o.envMap.value=e;const l=this._cubeSize;Ms(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(a,tr)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){const s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;const l=a.uniforms,c=i/(this._lodMeshes.length-1),p=t/(this._lodMeshes.length-1),m=Math.sqrt(c*c-p*p),u=c*1.25,d=m*u,{_lodMax:g}=this,y=this._sizeLods[i],f=3*y*(i>g-Ts?i-g+Ts:0),h=4*(this._cubeSize-y);l.envMap.value=e.texture,l.roughness.value=d,l.mipInt.value=g-t,Ms(r,f,h,3*y,2*y),s.setRenderTarget(r),s.render(o,tr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-i,Ms(e,f,h,3*y,2*y),s.setRenderTarget(e),s.render(o,tr)}_blur(e,t,i,s){const r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,i,a),this._blurPass(r,e,i,i,a)}_blurPass(e,t,i,s,r){const a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;const c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-i;const p=this._sizeLods[s],m=3*p*(s>this._lodMax-Ts?s-this._lodMax+Ts:0),u=4*(this._cubeSize-p);Ms(t,m,u,3*p,2*p),a.setRenderTarget(t),a.render(l,tr)}}function H_(n){const e=[],t=[];let i=n;const s=n-Ts+1+O_;for(let r=0;r<s;r++){const a=Math.pow(2,i);e.push(a);const o=1/(a-2),l=-o,c=1+o,p=[l,l,c,l,c,c,l,l,c,c,l,c],m=6,u=6,d=3,g=new Float32Array(d*u*m),y=new Float32Array(d*u*m);for(let h=0;h<m;h++){const M=h%3*2/3-1,R=h>2?0:-1,b=[M,R,0,M+2/3,R,0,M+2/3,R+1,0,M,R,0,M+2/3,R+1,0,M,R+1,0];g.set(b,d*u*h);for(let S=0;S<u;S++){const E=p[S*2]*2-1,w=p[S*2+1]*2-1;h===0?Gi.set(1,w,E):h===1?Gi.set(-E,1,-w):h===2?Gi.set(-E,w,1):h===3?Gi.set(-1,w,-E):h===4?Gi.set(-E,-1,w):Gi.set(E,w,-1),Gi.toArray(y,(h*u+S)*d)}}const f=new Dt;f.setAttribute("position",new rn(g,d)),f.setAttribute("outputDirection",new rn(y,d)),t.push(new Tt(f,null)),i>Ts&&i--}return{lodMeshes:t,sizeLods:e}}function Jd(n,e,t){const i=new Vn(n,e,t);return i.texture.mapping=eo,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Ms(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function G_(n,e,t){return new $n({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:k_,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:so(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:_i,depthTest:!1,depthWrite:!1})}function V_(n,e,t){return new $n({name:"SphericalGaussianBlur",defines:{SAMPLES:B_,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:so(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:_i,depthTest:!1,depthWrite:!1})}function jd(){return new $n({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:so(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:_i,depthTest:!1,depthWrite:!1})}function Qd(){return new $n({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:so(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:_i,depthTest:!1,depthWrite:!1})}function so(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}class Ah extends Vn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new xh(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Ir(5,5,5),r=new $n({name:"CubemapFromEquirect",uniforms:zs(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:fn,blending:_i});r.uniforms.tEquirect.value=t;const a=new Tt(s,r),o=t.minFilter;return t.minFilter===$i&&(t.minFilter=sn),new Wp(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,s);e.setRenderTarget(r)}}function $_(n){let e=new WeakMap,t=new WeakMap,i=null;function s(u,d=!1){return u==null?null:d?a(u):r(u)}function r(u){if(u&&u.isTexture){const d=u.mapping;if(d===_o||d===vo)if(e.has(u)){const g=e.get(u).texture;return o(g,u.mapping)}else{const g=u.image;if(g&&g.height>0){const y=new Ah(g.height);return y.fromEquirectangularTexture(n,u),e.set(u,y),u.addEventListener("dispose",c),o(y.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){const d=u.mapping,g=d===_o||d===vo,y=d===ji||d===ks;if(g||y){let f=t.get(u);const h=f!==void 0?f.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==h)return i===null&&(i=new Zd(n)),f=g?i.fromEquirectangular(u,f):i.fromCubemap(u,f),f.texture.pmremVersion=u.pmremVersion,t.set(u,f),f.texture;if(f!==void 0)return f.texture;{const M=u.image;return g&&M&&M.height>0||y&&M&&l(M)?(i===null&&(i=new Zd(n)),f=g?i.fromEquirectangular(u):i.fromCubemap(u),f.texture.pmremVersion=u.pmremVersion,t.set(u,f),u.addEventListener("dispose",p),f.texture):null}}}return u}function o(u,d){return d===_o?u.mapping=ji:d===vo&&(u.mapping=ks),u}function l(u){let d=0;const g=6;for(let y=0;y<g;y++)u[y]!==void 0&&d++;return d===g}function c(u){const d=u.target;d.removeEventListener("dispose",c);const g=e.get(d);g!==void 0&&(e.delete(d),g.dispose())}function p(u){const d=u.target;d.removeEventListener("dispose",p);const g=t.get(d);g!==void 0&&(t.delete(d),g.dispose())}function m(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:m}}function W_(n){const e={};function t(i){if(e[i]!==void 0)return e[i];const s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const s=t(i);return s===null&&Ls("WebGLRenderer: "+i+" extension not supported."),s}}}function X_(n,e,t,i){const s={},r=new WeakMap;function a(m){const u=m.target;u.index!==null&&e.remove(u.index);for(const g in u.attributes)e.remove(u.attributes[g]);u.removeEventListener("dispose",a),delete s[u.id];const d=r.get(u);d&&(e.remove(d),r.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function o(m,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,t.memory.geometries++),u}function l(m){const u=m.attributes;for(const d in u)e.update(u[d],n.ARRAY_BUFFER)}function c(m){const u=[],d=m.index,g=m.attributes.position;let y=0;if(g===void 0)return;if(d!==null){const M=d.array;y=d.version;for(let R=0,b=M.length;R<b;R+=3){const S=M[R+0],E=M[R+1],w=M[R+2];u.push(S,E,E,w,w,S)}}else{const M=g.array;y=g.version;for(let R=0,b=M.length/3-1;R<b;R+=3){const S=R+0,E=R+1,w=R+2;u.push(S,E,E,w,w,S)}}const f=new(g.count>=65535?fh:hh)(u,1);f.version=y;const h=r.get(m);h&&e.remove(h),r.set(m,f)}function p(m){const u=r.get(m);if(u){const d=m.index;d!==null&&u.version<d.version&&c(m)}else c(m);return r.get(m)}return{get:o,update:l,getWireframeAttribute:p}}function q_(n,e,t){let i;function s(m){i=m}let r,a;function o(m){r=m.type,a=m.bytesPerElement}function l(m,u){n.drawElements(i,u,r,m*a),t.update(u,i,1)}function c(m,u,d){d!==0&&(n.drawElementsInstanced(i,u,r,m*a,d),t.update(u,i,d))}function p(m,u,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,r,m,0,d);let y=0;for(let f=0;f<d;f++)y+=u[f];t.update(y,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=p}function Y_(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=o*(r/3);break;case n.LINES:t.lines+=o*(r/2);break;case n.LINE_STRIP:t.lines+=o*(r-1);break;case n.LINE_LOOP:t.lines+=o*r;break;case n.POINTS:t.points+=o*r;break;default:it("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function K_(n,e,t){const i=new WeakMap,s=new Lt;function r(a,o,l){const c=a.morphTargetInfluences,p=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,m=p!==void 0?p.length:0;let u=i.get(o);if(u===void 0||u.count!==m){let C=function(){v.dispose(),i.delete(o),o.removeEventListener("dispose",C)};var d=C;u!==void 0&&u.texture.dispose();const g=o.morphAttributes.position!==void 0,y=o.morphAttributes.normal!==void 0,f=o.morphAttributes.color!==void 0,h=o.morphAttributes.position||[],M=o.morphAttributes.normal||[],R=o.morphAttributes.color||[];let b=0;g===!0&&(b=1),y===!0&&(b=2),f===!0&&(b=3);let S=o.attributes.position.count*b,E=1;S>e.maxTextureSize&&(E=Math.ceil(S/e.maxTextureSize),S=e.maxTextureSize);const w=new Float32Array(S*E*4*m),v=new dh(w,S,E,m);v.type=zn,v.needsUpdate=!0;const T=b*4;for(let L=0;L<m;L++){const U=h[L],G=M[L],O=R[L],k=S*E*4*L;for(let J=0;J<U.count;J++){const X=J*T;g===!0&&(s.fromBufferAttribute(U,J),w[k+X+0]=s.x,w[k+X+1]=s.y,w[k+X+2]=s.z,w[k+X+3]=0),y===!0&&(s.fromBufferAttribute(G,J),w[k+X+4]=s.x,w[k+X+5]=s.y,w[k+X+6]=s.z,w[k+X+7]=0),f===!0&&(s.fromBufferAttribute(O,J),w[k+X+8]=s.x,w[k+X+9]=s.y,w[k+X+10]=s.z,w[k+X+11]=O.itemSize===4?s.w:1)}}u={count:m,texture:v,size:new Ae(S,E)},i.set(o,u),o.addEventListener("dispose",C)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",a.morphTexture,t);else{let g=0;for(let f=0;f<c.length;f++)g+=c[f];const y=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(n,"morphTargetBaseInfluence",y),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",u.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",u.size)}return{update:r}}function Z_(n,e,t,i,s){let r=new WeakMap;function a(c){const p=s.render.frame,m=c.geometry,u=e.get(c,m);if(r.get(u)!==p&&(e.update(u),r.set(u,p)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==p&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),r.set(c,p))),c.isSkinnedMesh){const d=c.skeleton;r.get(d)!==p&&(d.update(),r.set(d,p))}return u}function o(){r=new WeakMap}function l(c){const p=c.target;p.removeEventListener("dispose",l),i.releaseStatesOfObject(p),t.remove(p.instanceMatrix),p.instanceColor!==null&&t.remove(p.instanceColor)}return{update:a,dispose:o}}const J_={[Yu]:"LINEAR_TONE_MAPPING",[Ku]:"REINHARD_TONE_MAPPING",[Zu]:"CINEON_TONE_MAPPING",[Ju]:"ACES_FILMIC_TONE_MAPPING",[Qu]:"AGX_TONE_MAPPING",[eh]:"NEUTRAL_TONE_MAPPING",[ju]:"CUSTOM_TONE_MAPPING"};function j_(n,e,t,i,s,r){const a=new Vn(e,t,{type:n,depthBuffer:s,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let o=null,l=null;const c=new Dt;c.setAttribute("position",new gt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new gt([0,2,0,0,2,0],2));const p=new Bp({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),m=new Tt(c,p),u=new Dc(-1,1,1,-1,0,1);let d=null,g=null,y=!1,f,h=null,M=[],R=!1;this.setSize=function(b,S){a.setSize(b,S),o!==null&&o.setSize(b,S),l!==null&&l.setSize(b,S);for(let E=0;E<M.length;E++){const w=M[E];w.setSize&&w.setSize(b,S)}},this.setEffects=function(b){M=b,R=M.length>0&&M[0].isRenderPass===!0;const S=a.width,E=a.height;M.length>0&&o===null&&(o=new Vn(S,E,{type:ai,depthBuffer:!1,stencilBuffer:!1}),l=new Vn(S,E,{type:ai,depthBuffer:!1,stencilBuffer:!1}));for(let w=0;w<M.length;w++){const v=M[w];v.setSize&&v.setSize(S,E)}},this.begin=function(b,S){if(y||b.toneMapping===ii&&M.length===0)return!1;if(h=S,S!==null){const E=S.width,w=S.height;(a.width!==E||a.height!==w)&&this.setSize(E,w)}return R===!1&&b.setRenderTarget(a),f=b.toneMapping,b.toneMapping=ii,!0},this.hasRenderPass=function(){return R},this.end=function(b,S){b.toneMapping=f,y=!0;let E=a,w=o;for(let v=0;v<M.length;v++){const T=M[v];T.enabled!==!1&&(T.render(b,w,E,S),T.needsSwap!==!1&&(E=w,w=w===o?l:o))}if(d!==b.outputColorSpace||g!==b.toneMapping){d=b.outputColorSpace,g=b.toneMapping,p.defines={},tt.getTransfer(d)===ut&&(p.defines.SRGB_TRANSFER="");const v=J_[g];v&&(p.defines[v]=""),p.needsUpdate=!0}p.uniforms.tDiffuse.value=E.texture,b.setRenderTarget(h),b.render(m,u),h=null,y=!1},this.isCompositing=function(){return y},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),p.dispose()}}const Rh=new Zt,sc=new Mr(1,1),Ch=new dh,Ph=new up,Lh=new xh,eu=[],tu=[],nu=new Float32Array(16),iu=new Float32Array(9),su=new Float32Array(4);function Vs(n,e,t){const i=n[0];if(i<=0||i>0)return n;const s=e*t;let r=eu[s];if(r===void 0&&(r=new Float32Array(s),eu[s]=r),e!==0){i.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,n[a].toArray(r,o)}return r}function Gt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Vt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function ro(n,e){let t=tu[e];t===void 0&&(t=new Int32Array(e),tu[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function Q_(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function e0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Gt(t,e))return;n.uniform2fv(this.addr,e),Vt(t,e)}}function t0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Gt(t,e))return;n.uniform3fv(this.addr,e),Vt(t,e)}}function n0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Gt(t,e))return;n.uniform4fv(this.addr,e),Vt(t,e)}}function i0(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Gt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Vt(t,e)}else{if(Gt(t,i))return;su.set(i),n.uniformMatrix2fv(this.addr,!1,su),Vt(t,i)}}function s0(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Gt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Vt(t,e)}else{if(Gt(t,i))return;iu.set(i),n.uniformMatrix3fv(this.addr,!1,iu),Vt(t,i)}}function r0(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Gt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Vt(t,e)}else{if(Gt(t,i))return;nu.set(i),n.uniformMatrix4fv(this.addr,!1,nu),Vt(t,i)}}function a0(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function o0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Gt(t,e))return;n.uniform2iv(this.addr,e),Vt(t,e)}}function l0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Gt(t,e))return;n.uniform3iv(this.addr,e),Vt(t,e)}}function c0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Gt(t,e))return;n.uniform4iv(this.addr,e),Vt(t,e)}}function d0(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function u0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Gt(t,e))return;n.uniform2uiv(this.addr,e),Vt(t,e)}}function h0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Gt(t,e))return;n.uniform3uiv(this.addr,e),Vt(t,e)}}function f0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Gt(t,e))return;n.uniform4uiv(this.addr,e),Vt(t,e)}}function p0(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(sc.compareFunction=t.isReversedDepthBuffer()?Tc:Ec,r=sc):r=Rh,t.setTexture2D(e||r,s)}function m0(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||Ph,s)}function g0(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||Lh,s)}function _0(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||Ch,s)}function v0(n){switch(n){case 5126:return Q_;case 35664:return e0;case 35665:return t0;case 35666:return n0;case 35674:return i0;case 35675:return s0;case 35676:return r0;case 5124:case 35670:return a0;case 35667:case 35671:return o0;case 35668:case 35672:return l0;case 35669:case 35673:return c0;case 5125:return d0;case 36294:return u0;case 36295:return h0;case 36296:return f0;case 35678:case 36198:case 36298:case 36306:case 35682:return p0;case 35679:case 36299:case 36307:return m0;case 35680:case 36300:case 36308:case 36293:return g0;case 36289:case 36303:case 36311:case 36292:return _0}}function x0(n,e){n.uniform1fv(this.addr,e)}function y0(n,e){const t=Vs(e,this.size,2);n.uniform2fv(this.addr,t)}function M0(n,e){const t=Vs(e,this.size,3);n.uniform3fv(this.addr,t)}function b0(n,e){const t=Vs(e,this.size,4);n.uniform4fv(this.addr,t)}function S0(n,e){const t=Vs(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function E0(n,e){const t=Vs(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function T0(n,e){const t=Vs(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function w0(n,e){n.uniform1iv(this.addr,e)}function A0(n,e){n.uniform2iv(this.addr,e)}function R0(n,e){n.uniform3iv(this.addr,e)}function C0(n,e){n.uniform4iv(this.addr,e)}function P0(n,e){n.uniform1uiv(this.addr,e)}function L0(n,e){n.uniform2uiv(this.addr,e)}function D0(n,e){n.uniform3uiv(this.addr,e)}function I0(n,e){n.uniform4uiv(this.addr,e)}function N0(n,e,t){const i=this.cache,s=e.length,r=ro(t,s);Gt(i,r)||(n.uniform1iv(this.addr,r),Vt(i,r));let a;this.type===n.SAMPLER_2D_SHADOW?a=sc:a=Rh;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function U0(n,e,t){const i=this.cache,s=e.length,r=ro(t,s);Gt(i,r)||(n.uniform1iv(this.addr,r),Vt(i,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Ph,r[a])}function F0(n,e,t){const i=this.cache,s=e.length,r=ro(t,s);Gt(i,r)||(n.uniform1iv(this.addr,r),Vt(i,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||Lh,r[a])}function O0(n,e,t){const i=this.cache,s=e.length,r=ro(t,s);Gt(i,r)||(n.uniform1iv(this.addr,r),Vt(i,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Ch,r[a])}function B0(n){switch(n){case 5126:return x0;case 35664:return y0;case 35665:return M0;case 35666:return b0;case 35674:return S0;case 35675:return E0;case 35676:return T0;case 5124:case 35670:return w0;case 35667:case 35671:return A0;case 35668:case 35672:return R0;case 35669:case 35673:return C0;case 5125:return P0;case 36294:return L0;case 36295:return D0;case 36296:return I0;case 35678:case 36198:case 36298:case 36306:case 35682:return N0;case 35679:case 36299:case 36307:return U0;case 35680:case 36300:case 36308:case 36293:return F0;case 36289:case 36303:case 36311:case 36292:return O0}}class k0{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=v0(t.type)}}class z0{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=B0(t.type)}}class H0{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],i)}}}const Ko=/(\w+)(\])?(\[|\.)?/g;function ru(n,e){n.seq.push(e),n.map[e.id]=e}function G0(n,e,t){const i=n.name,s=i.length;for(Ko.lastIndex=0;;){const r=Ko.exec(i),a=Ko.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){ru(t,c===void 0?new k0(o,n,e):new z0(o,n,e));break}else{let m=t.map[o];m===void 0&&(m=new H0(o),ru(t,m)),t=m}}}class Ca{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){const o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);G0(o,l,this)}const s=[],r=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){const r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){const s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){const i=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&i.push(a)}return i}}function au(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const V0=37297;let $0=0;function W0(n,e){const t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}const ou=new Ge;function X0(n){tt._getMatrix(ou,tt.workingColorSpace,n);const e=`mat3( ${ou.elements.map(t=>t.toFixed(4))} )`;switch(tt.getTransfer(n)){case za:return[e,"LinearTransferOETF"];case ut:return[e,"sRGBTransferOETF"];default:return Oe("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function lu(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+W0(n.getShaderSource(e),o)}else return r}function q0(n,e){const t=X0(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const Y0={[Yu]:"Linear",[Ku]:"Reinhard",[Zu]:"Cineon",[Ju]:"ACESFilmic",[Qu]:"AgX",[eh]:"Neutral",[ju]:"Custom"};function K0(n,e){const t=Y0[e];return t===void 0?(Oe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const ga=new P;function Z0(){tt.getLuminanceCoefficients(ga);const n=ga.x.toFixed(4),e=ga.y.toFixed(4),t=ga.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function J0(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(rr).join(`
`)}function j0(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function Q0(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(e,s),a=r.name;let o=1;r.type===n.FLOAT_MAT2&&(o=2),r.type===n.FLOAT_MAT3&&(o=3),r.type===n.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:n.getAttribLocation(e,a),locationSize:o}}return t}function rr(n){return n!==""}function cu(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function du(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const ev=/^[ \t]*#include +<([\w\d./]+)>/gm;function rc(n){return n.replace(ev,nv)}const tv=new Map;function nv(n,e){let t=qe[e];if(t===void 0){const i=tv.get(e);if(i!==void 0)t=qe[i],Oe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return rc(t)}const iv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function uu(n){return n.replace(iv,sv)}function sv(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function hu(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const rv={[Sa]:"SHADOWMAP_TYPE_PCF",[sr]:"SHADOWMAP_TYPE_VSM"};function av(n){return rv[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const ov={[ji]:"ENVMAP_TYPE_CUBE",[ks]:"ENVMAP_TYPE_CUBE",[eo]:"ENVMAP_TYPE_CUBE_UV"};function lv(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":ov[n.envMapMode]||"ENVMAP_TYPE_CUBE"}const cv={[ks]:"ENVMAP_MODE_REFRACTION"};function dv(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":cv[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}const uv={[gc]:"ENVMAP_BLENDING_MULTIPLY",[Gf]:"ENVMAP_BLENDING_MIX",[Vf]:"ENVMAP_BLENDING_ADD"};function hv(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":uv[n.combine]||"ENVMAP_BLENDING_NONE"}function fv(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function pv(n,e,t,i){const s=n.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=av(t),c=lv(t),p=dv(t),m=hv(t),u=fv(t),d=J0(t),g=j0(r),y=s.createProgram();let f,h,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(rr).join(`
`),f.length>0&&(f+=`
`),h=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(rr).join(`
`),h.length>0&&(h+=`
`)):(f=[hu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+p:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(rr).join(`
`),h=[hu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+p:"",t.envMap?"#define "+m:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ii?"#define TONE_MAPPING":"",t.toneMapping!==ii?qe.tonemapping_pars_fragment:"",t.toneMapping!==ii?K0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",qe.colorspace_pars_fragment,q0("linearToOutputTexel",t.outputColorSpace),Z0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(rr).join(`
`)),a=rc(a),a=cu(a,t),a=du(a,t),o=rc(o),o=cu(o,t),o=du(o,t),a=uu(a),o=uu(o),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,f=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,h=["#define varying in",t.glslVersion===ud?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ud?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+h);const R=M+f+a,b=M+h+o,S=au(s,s.VERTEX_SHADER,R),E=au(s,s.FRAGMENT_SHADER,b);s.attachShader(y,S),s.attachShader(y,E),t.index0AttributeName!==void 0?s.bindAttribLocation(y,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function w(L){if(n.debug.checkShaderErrors){const U=s.getProgramInfoLog(y)||"",G=s.getShaderInfoLog(S)||"",O=s.getShaderInfoLog(E)||"",k=U.trim(),J=G.trim(),X=O.trim();let re=!0,Y=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(re=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,y,S,E);else{const te=lu(s,S,"vertex"),se=lu(s,E,"fragment");it("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+k+`
`+te+`
`+se)}else k!==""?Oe("WebGLProgram: Program Info Log:",k):(J===""||X==="")&&(Y=!1);Y&&(L.diagnostics={runnable:re,programLog:k,vertexShader:{log:J,prefix:f},fragmentShader:{log:X,prefix:h}})}s.deleteShader(S),s.deleteShader(E),v=new Ca(s,y),T=Q0(s,y)}let v;this.getUniforms=function(){return v===void 0&&w(this),v};let T;this.getAttributes=function(){return T===void 0&&w(this),T};let C=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=s.getProgramParameter(y,V0)),C},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=$0++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=S,this.fragmentShader=E,this}let mv=0;class gv{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){const s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new _v(e),t.set(e,i)),i}}class _v{constructor(e){this.id=mv++,this.code=e,this.usedTimes=0}}function vv(n){return n===Qi||n===Oa||n===Ba}function xv(n,e,t,i,s,r){const a=new Ac,o=new gv,l=new Set,c=[],p=new Map,m=i.logarithmicDepthBuffer;let u=i.precision;const d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(v){return l.add(v),v===0?"uv":`uv${v}`}function y(v,T,C,L,U,G){const O=L.fog,k=U.geometry,J=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?L.environment:null,X=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,re=e.get(v.envMap||J,X),Y=re&&re.mapping===eo?re.image.height:null,te=d[v.type];v.precision!==null&&(u=i.getMaxPrecision(v.precision),u!==v.precision&&Oe("WebGLProgram.getParameters:",v.precision,"not supported, using",u,"instead."));const se=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,Ie=se!==void 0?se.length:0;let Pe=0;k.morphAttributes.position!==void 0&&(Pe=1),k.morphAttributes.normal!==void 0&&(Pe=2),k.morphAttributes.color!==void 0&&(Pe=3);let vt,nt,at,K;if(te){const yt=Jn[te];vt=yt.vertexShader,nt=yt.fragmentShader}else{vt=v.vertexShader,nt=v.fragmentShader;const yt=o.getVertexShaderStage(v),ot=o.getFragmentShaderStage(v);o.update(v,yt,ot),at=yt.id,K=ot.id}const ee=n.getRenderTarget(),be=n.state.buffers.depth.getReversed(),He=U.isInstancedMesh===!0,xe=U.isBatchedMesh===!0,Ye=!!v.map,zt=!!v.matcap,Ke=!!re,rt=!!v.aoMap,xt=!!v.lightMap,je=!!v.bumpMap&&v.wireframe===!1,wt=!!v.normalMap,$t=!!v.displacementMap,gn=!!v.emissiveMap,Rt=!!v.metalnessMap,Nt=!!v.roughnessMap,N=v.anisotropy>0,jt=v.clearcoat>0,dt=v.dispersion>0,A=v.retroreflectivity>0,_=v.iridescence>0,B=v.sheen>0,V=v.transmission>0,q=N&&!!v.anisotropyMap,ae=jt&&!!v.clearcoatMap,le=jt&&!!v.clearcoatNormalMap,Z=jt&&!!v.clearcoatRoughnessMap,Q=_&&!!v.iridescenceMap,ce=_&&!!v.iridescenceThicknessMap,Re=B&&!!v.sheenColorMap,fe=B&&!!v.sheenRoughnessMap,de=!!v.specularMap,Ce=!!v.specularColorMap,Ue=!!v.specularIntensityMap,$e=V&&!!v.transmissionMap,I=V&&!!v.thicknessMap,ue=!!v.gradientMap,j=!!v.alphaMap,he=v.alphaTest>0,_e=!!v.alphaHash,ie=!!v.extensions;let Le=ii;v.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(Le=n.toneMapping);const Te={shaderID:te,shaderType:v.type,shaderName:v.name,vertexShader:vt,fragmentShader:nt,defines:v.defines,customVertexShaderID:at,customFragmentShaderID:K,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:u,batching:xe,batchingColor:xe&&U._colorsTexture!==null,instancing:He,instancingColor:He&&U.instanceColor!==null,instancingMorph:He&&U.morphTexture!==null,outputColorSpace:ee===null?n.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:tt.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:Ye,matcap:zt,envMap:Ke,envMapMode:Ke&&re.mapping,envMapCubeUVHeight:Y,aoMap:rt,lightMap:xt,bumpMap:je,normalMap:wt,displacementMap:$t,emissiveMap:gn,normalMapObjectSpace:wt&&v.normalMapType===Xf,normalMapTangentSpace:wt&&v.normalMapType===Ql,packedNormalMap:wt&&v.normalMapType===Ql&&vv(v.normalMap.format),metalnessMap:Rt,roughnessMap:Nt,anisotropy:N,anisotropyMap:q,clearcoat:jt,clearcoatMap:ae,clearcoatNormalMap:le,clearcoatRoughnessMap:Z,dispersion:dt,retroreflection:A,iridescence:_,iridescenceMap:Q,iridescenceThicknessMap:ce,sheen:B,sheenColorMap:Re,sheenRoughnessMap:fe,specularMap:de,specularColorMap:Ce,specularIntensityMap:Ue,transmission:V,transmissionMap:$e,thicknessMap:I,gradientMap:ue,opaque:v.transparent===!1&&v.blending===dr&&v.alphaToCoverage===!1,alphaMap:j,alphaTest:he,alphaHash:_e,combine:v.combine,mapUv:Ye&&g(v.map.channel),aoMapUv:rt&&g(v.aoMap.channel),lightMapUv:xt&&g(v.lightMap.channel),bumpMapUv:je&&g(v.bumpMap.channel),normalMapUv:wt&&g(v.normalMap.channel),displacementMapUv:$t&&g(v.displacementMap.channel),emissiveMapUv:gn&&g(v.emissiveMap.channel),metalnessMapUv:Rt&&g(v.metalnessMap.channel),roughnessMapUv:Nt&&g(v.roughnessMap.channel),anisotropyMapUv:q&&g(v.anisotropyMap.channel),clearcoatMapUv:ae&&g(v.clearcoatMap.channel),clearcoatNormalMapUv:le&&g(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Z&&g(v.clearcoatRoughnessMap.channel),iridescenceMapUv:Q&&g(v.iridescenceMap.channel),iridescenceThicknessMapUv:ce&&g(v.iridescenceThicknessMap.channel),sheenColorMapUv:Re&&g(v.sheenColorMap.channel),sheenRoughnessMapUv:fe&&g(v.sheenRoughnessMap.channel),specularMapUv:de&&g(v.specularMap.channel),specularColorMapUv:Ce&&g(v.specularColorMap.channel),specularIntensityMapUv:Ue&&g(v.specularIntensityMap.channel),transmissionMapUv:$e&&g(v.transmissionMap.channel),thicknessMapUv:I&&g(v.thicknessMap.channel),alphaMapUv:j&&g(v.alphaMap.channel),vertexTangents:!!k.attributes.tangent&&(wt||N),vertexNormals:!!k.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!k.attributes.uv&&(Ye||j),fog:!!O,useFog:v.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||k.attributes.normal===void 0&&wt===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:m,reversedDepthBuffer:be,skinning:U.isSkinnedMesh===!0,hasPositionAttribute:k.attributes.position!==void 0,morphTargets:k.morphAttributes.position!==void 0,morphNormals:k.morphAttributes.normal!==void 0,morphColors:k.morphAttributes.color!==void 0,morphTargetsCount:Ie,morphTextureStride:Pe,numSunLights:T.sun.length,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numSunLightShadows:T.sunShadowMap.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:G.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:v.dithering,shadowMapEnabled:n.shadowMap.enabled&&C.length>0,shadowMapType:n.shadowMap.type,toneMapping:Le,decodeVideoTexture:Ye&&v.map.isVideoTexture===!0&&tt.getTransfer(v.map.colorSpace)===ut,decodeVideoTextureEmissive:gn&&v.emissiveMap.isVideoTexture===!0&&tt.getTransfer(v.emissiveMap.colorSpace)===ut,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===yn,flipSided:v.side===fn,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:ie&&v.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ie&&v.extensions.multiDraw===!0||xe)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return Te.vertexUv1s=l.has(1),Te.vertexUv2s=l.has(2),Te.vertexUv3s=l.has(3),l.clear(),Te}function f(v){const T=[];if(v.shaderID?T.push(v.shaderID):(T.push(v.customVertexShaderID),T.push(v.customFragmentShaderID)),v.defines!==void 0)for(const C in v.defines)T.push(C),T.push(v.defines[C]);return v.isRawShaderMaterial===!1&&(h(T,v),M(T,v),T.push(n.outputColorSpace)),T.push(v.customProgramCacheKey),T.join()}function h(v,T){v.push(T.precision),v.push(T.outputColorSpace),v.push(T.envMapMode),v.push(T.envMapCubeUVHeight),v.push(T.mapUv),v.push(T.alphaMapUv),v.push(T.lightMapUv),v.push(T.aoMapUv),v.push(T.bumpMapUv),v.push(T.normalMapUv),v.push(T.displacementMapUv),v.push(T.emissiveMapUv),v.push(T.metalnessMapUv),v.push(T.roughnessMapUv),v.push(T.anisotropyMapUv),v.push(T.clearcoatMapUv),v.push(T.clearcoatNormalMapUv),v.push(T.clearcoatRoughnessMapUv),v.push(T.iridescenceMapUv),v.push(T.iridescenceThicknessMapUv),v.push(T.sheenColorMapUv),v.push(T.sheenRoughnessMapUv),v.push(T.specularMapUv),v.push(T.specularColorMapUv),v.push(T.specularIntensityMapUv),v.push(T.transmissionMapUv),v.push(T.thicknessMapUv),v.push(T.combine),v.push(T.fogExp2),v.push(T.sizeAttenuation),v.push(T.morphTargetsCount),v.push(T.morphAttributeCount),v.push(T.numSunLights),v.push(T.numDirLights),v.push(T.numPointLights),v.push(T.numSpotLights),v.push(T.numSpotLightMaps),v.push(T.numHemiLights),v.push(T.numRectAreaLights),v.push(T.numSunLightShadows),v.push(T.numDirLightShadows),v.push(T.numPointLightShadows),v.push(T.numSpotLightShadows),v.push(T.numSpotLightShadowsWithMaps),v.push(T.numLightProbes),v.push(T.shadowMapType),v.push(T.toneMapping),v.push(T.numClippingPlanes),v.push(T.numClipIntersection),v.push(T.depthPacking)}function M(v,T){a.disableAll(),T.instancing&&a.enable(0),T.instancingColor&&a.enable(1),T.instancingMorph&&a.enable(2),T.matcap&&a.enable(3),T.envMap&&a.enable(4),T.normalMapObjectSpace&&a.enable(5),T.normalMapTangentSpace&&a.enable(6),T.clearcoat&&a.enable(7),T.iridescence&&a.enable(8),T.alphaTest&&a.enable(9),T.vertexColors&&a.enable(10),T.vertexAlphas&&a.enable(11),T.vertexUv1s&&a.enable(12),T.vertexUv2s&&a.enable(13),T.vertexUv3s&&a.enable(14),T.vertexTangents&&a.enable(15),T.anisotropy&&a.enable(16),T.alphaHash&&a.enable(17),T.batching&&a.enable(18),T.dispersion&&a.enable(19),T.retroreflection&&a.enable(24),T.batchingColor&&a.enable(20),T.gradientMap&&a.enable(21),T.packedNormalMap&&a.enable(22),T.vertexNormals&&a.enable(23),v.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.reversedDepthBuffer&&a.enable(4),T.skinning&&a.enable(5),T.morphTargets&&a.enable(6),T.morphNormals&&a.enable(7),T.morphColors&&a.enable(8),T.premultipliedAlpha&&a.enable(9),T.shadowMapEnabled&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),T.decodeVideoTextureEmissive&&a.enable(20),T.alphaToCoverage&&a.enable(21),T.numLightProbeGrids>0&&a.enable(22),T.hasPositionAttribute&&a.enable(23),v.push(a.mask)}function R(v){const T=d[v.type];let C;if(T){const L=Jn[T];C=Up.clone(L.uniforms)}else C=v.uniforms;return C}function b(v,T){let C=p.get(T);return C!==void 0?++C.usedTimes:(C=new pv(n,T,v,s),c.push(C),p.set(T,C)),C}function S(v){if(--v.usedTimes===0){const T=c.indexOf(v);c[T]=c[c.length-1],c.pop(),p.delete(v.cacheKey),v.destroy()}}function E(v){o.remove(v)}function w(){o.dispose()}return{getParameters:y,getProgramCacheKey:f,getUniforms:R,acquireProgram:b,releaseProgram:S,releaseShaderCache:E,programs:c,dispose:w}}function yv(){let n=new WeakMap;function e(a){return n.has(a)}function t(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function s(a,o,l){n.get(a)[o]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function Mv(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function fu(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function pu(){const n=[];let e=0;const t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function a(u){let d=0;return u.isInstancedMesh&&(d+=2),u.isSkinnedMesh&&(d+=1),d}function o(u,d,g,y,f,h){let M=n[e];return M===void 0?(M={id:u.id,object:u,geometry:d,material:g,materialVariant:a(u),groupOrder:y,renderOrder:u.renderOrder,z:f,group:h},n[e]=M):(M.id=u.id,M.object=u,M.geometry=d,M.material=g,M.materialVariant=a(u),M.groupOrder=y,M.renderOrder=u.renderOrder,M.z=f,M.group=h),e++,M}function l(u,d,g,y,f,h,M){M.reversedDepth===!0&&(f=-f);const R=o(u,d,g,y,f,h);g.transmission>0?i.push(R):g.transparent===!0?s.push(R):t.push(R)}function c(u,d,g,y,f,h){const M=o(u,d,g,y,f,h);g.transmission>0?i.unshift(M):g.transparent===!0?s.unshift(M):t.unshift(M)}function p(u,d){t.length>1&&t.sort(u||Mv),i.length>1&&i.sort(d||fu),s.length>1&&s.sort(d||fu)}function m(){for(let u=e,d=n.length;u<d;u++){const g=n[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:l,unshift:c,finish:m,sort:p}}function bv(){let n=new WeakMap;function e(i,s){const r=n.get(i);let a;return r===void 0?(a=new pu,n.set(i,[a])):s>=r.length?(a=new pu,r.push(a)):a=r[s],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function Sv(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new P,color:new ke};break;case"SpotLight":t={position:new P,direction:new P,color:new ke,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new ke,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new ke,groundColor:new ke};break;case"RectAreaLight":t={color:new ke,position:new P,halfWidth:new P,halfHeight:new P};break}return n[e.id]=t,t}}}function Ev(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ae};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ae};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ae,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let Tv=0;function wv(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function Av(n){const e=new Sv,t=Ev(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new P);const s=new P,r=new ft,a=new ft;function o(c){let p=0,m=0,u=0;for(let U=0;U<9;U++)i.probe[U].set(0,0,0);let d=0,g=0,y=0,f=0,h=0,M=0,R=0,b=0,S=0,E=0,w=0,v=0,T=0,C=0;c.sort(wv);for(let U=0,G=c.length;U<G;U++){const O=c[U],k=O.color,J=O.intensity,X=O.distance;let re=null;if(O.shadow&&O.shadow.map&&(O.shadow.map.texture.format===Qi?re=O.shadow.map.texture:re=O.shadow.map.depthTexture||O.shadow.map.texture),O.isAmbientLight)p+=k.r*J,m+=k.g*J,u+=k.b*J;else if(O.isLightProbe){for(let Y=0;Y<9;Y++)i.probe[Y].addScaledVector(O.sh.coefficients[Y],J);C++}else if(O.isSunLight){const Y=e.get(O);if(Y.color.copy(O.color).multiplyScalar(O.intensity),O.castShadow){const te=O.shadow,se=t.get(O);se.shadowIntensity=te.intensity,se.shadowBias=te.bias,se.shadowNormalBias=te.normalBias,se.shadowRadius=te.radius,se.shadowMapSize.copy(te.mapSize).multiply(te.getFrameExtents()),i.sunShadow[g]=se,i.sunShadowMap[g]=re;const Ie=te.getViewportCount();for(let Pe=0;Pe<Ie;Pe++)i.sunShadowMatrix[y+Pe]=te.getMatrix(Pe),i.sunShadowCascade[y+Pe]=te._cascadeData[Pe];y+=Ie,g++}i.sun[d]=Y,d++}else if(O.isDirectionalLight){const Y=e.get(O);if(Y.color.copy(O.color).multiplyScalar(O.intensity),O.castShadow){const te=O.shadow,se=t.get(O);se.shadowIntensity=te.intensity,se.shadowBias=te.bias,se.shadowNormalBias=te.normalBias,se.shadowRadius=te.radius,se.shadowMapSize=te.mapSize,i.directionalShadow[f]=se,i.directionalShadowMap[f]=re,i.directionalShadowMatrix[f]=O.shadow.matrix,S++}i.directional[f]=Y,f++}else if(O.isSpotLight){const Y=e.get(O);Y.position.setFromMatrixPosition(O.matrixWorld),Y.color.copy(k).multiplyScalar(J),Y.distance=X,Y.coneCos=Math.cos(O.angle),Y.penumbraCos=Math.cos(O.angle*(1-O.penumbra)),Y.decay=O.decay,i.spot[M]=Y;const te=O.shadow;if(O.map&&(i.spotLightMap[v]=O.map,v++,te.updateMatrices(O),O.castShadow&&T++),i.spotLightMatrix[M]=te.matrix,O.castShadow){const se=t.get(O);se.shadowIntensity=te.intensity,se.shadowBias=te.bias,se.shadowNormalBias=te.normalBias,se.shadowRadius=te.radius,se.shadowMapSize=te.mapSize,i.spotShadow[M]=se,i.spotShadowMap[M]=re,w++}M++}else if(O.isRectAreaLight){const Y=e.get(O);Y.color.copy(k).multiplyScalar(J),Y.halfWidth.set(O.width*.5,0,0),Y.halfHeight.set(0,O.height*.5,0),i.rectArea[R]=Y,R++}else if(O.isPointLight){const Y=e.get(O);if(Y.color.copy(O.color).multiplyScalar(O.intensity),Y.distance=O.distance,Y.decay=O.decay,O.castShadow){const te=O.shadow,se=t.get(O);se.shadowIntensity=te.intensity,se.shadowBias=te.bias,se.shadowNormalBias=te.normalBias,se.shadowRadius=te.radius,se.shadowMapSize=te.mapSize,se.shadowCameraNear=te.camera.near,se.shadowCameraFar=te.camera.far,i.pointShadow[h]=se,i.pointShadowMap[h]=re,i.pointShadowMatrix[h]=O.shadow.matrix,E++}i.point[h]=Y,h++}else if(O.isHemisphereLight){const Y=e.get(O);Y.skyColor.copy(O.color).multiplyScalar(J),Y.groundColor.copy(O.groundColor).multiplyScalar(J),i.hemi[b]=Y,b++}}R>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=pe.LTC_FLOAT_1,i.rectAreaLTC2=pe.LTC_FLOAT_2):(i.rectAreaLTC1=pe.LTC_HALF_1,i.rectAreaLTC2=pe.LTC_HALF_2)),i.ambient[0]=p,i.ambient[1]=m,i.ambient[2]=u;const L=i.hash;(L.sunLength!==d||L.directionalLength!==f||L.pointLength!==h||L.spotLength!==M||L.rectAreaLength!==R||L.hemiLength!==b||L.numSunShadows!==g||L.numDirectionalShadows!==S||L.numPointShadows!==E||L.numSpotShadows!==w||L.numSpotMaps!==v||L.numLightProbes!==C)&&(i.sun.length=d,i.directional.length=f,i.spot.length=M,i.rectArea.length=R,i.point.length=h,i.hemi.length=b,i.sunShadow.length=g,i.sunShadowMap.length=g,i.sunShadowMatrix.length=y,i.sunShadowCascade.length=y,i.directionalShadow.length=S,i.directionalShadowMap.length=S,i.directionalShadowMatrix.length=S,i.pointShadow.length=E,i.pointShadowMap.length=E,i.pointShadowMatrix.length=E,i.spotShadow.length=w,i.spotShadowMap.length=w,i.spotLightMatrix.length=w+v-T,i.spotLightMap.length=v,i.numSpotLightShadowsWithMaps=T,i.numLightProbes=C,L.sunLength=d,L.directionalLength=f,L.pointLength=h,L.spotLength=M,L.rectAreaLength=R,L.hemiLength=b,L.numSunShadows=g,L.numDirectionalShadows=S,L.numPointShadows=E,L.numSpotShadows=w,L.numSpotMaps=v,L.numLightProbes=C,i.version=Tv++)}function l(c,p){let m=0,u=0,d=0,g=0,y=0,f=0;const h=p.matrixWorldInverse;for(let M=0,R=c.length;M<R;M++){const b=c[M];if(b.isSunLight){const S=i.sun[m];S.direction.setFromMatrixPosition(b.matrixWorld),S.direction.transformDirection(h),m++}else if(b.isDirectionalLight){const S=i.directional[u];S.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(h),u++}else if(b.isSpotLight){const S=i.spot[g];S.position.setFromMatrixPosition(b.matrixWorld),S.position.applyMatrix4(h),S.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(h),g++}else if(b.isRectAreaLight){const S=i.rectArea[y];S.position.setFromMatrixPosition(b.matrixWorld),S.position.applyMatrix4(h),a.identity(),r.copy(b.matrixWorld),r.premultiply(h),a.extractRotation(r),S.halfWidth.set(b.width*.5,0,0),S.halfHeight.set(0,b.height*.5,0),S.halfWidth.applyMatrix4(a),S.halfHeight.applyMatrix4(a),y++}else if(b.isPointLight){const S=i.point[d];S.position.setFromMatrixPosition(b.matrixWorld),S.position.applyMatrix4(h),d++}else if(b.isHemisphereLight){const S=i.hemi[f];S.direction.setFromMatrixPosition(b.matrixWorld),S.direction.transformDirection(h),f++}}}return{setup:o,setupView:l,state:i}}function mu(n){const e=new Av(n),t=[],i=[],s=[];function r(u){m.camera=u,t.length=0,i.length=0,s.length=0}function a(u){t.push(u)}function o(u){i.push(u)}function l(u){s.push(u)}function c(){e.setup(t)}function p(u){e.setupView(t,u)}const m={lightsArray:t,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:m,setupLights:c,setupLightsView:p,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function Rv(n){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new mu(n),e.set(s,[o])):r>=a.length?(o=new mu(n),a.push(o)):o=a[r],o}function i(){e=new WeakMap}return{get:t,dispose:i}}const Cv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Pv=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Lv=[new P(1,0,0),new P(-1,0,0),new P(0,1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1)],Dv=[new P(0,-1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1),new P(0,-1,0),new P(0,-1,0)],gu=new ft,nr=new P,Zo=new P;function Iv(n,e,t){let i=new Rc;const s=new Ae,r=new Ae,a=new Lt,o=new zp,l=new Hp,c={},p=t.maxTextureSize,m={[Ji]:fn,[fn]:Ji,[yn]:yn},u=new $n({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ae},radius:{value:4}},vertexShader:Cv,fragmentShader:Pv}),d=u.clone();d.defines.HORIZONTAL_PASS=1;const g=new Dt;g.setAttribute("position",new rn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const y=new Tt(g,u),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Sa;let h=this.type;this.render=function(E,w,v){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||E.length===0)return;this.type===Sf&&(Oe("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Sa);const T=n.getRenderTarget(),C=n.getActiveCubeFace(),L=n.getActiveMipmapLevel(),U=n.state;U.setBlending(_i),U.buffers.depth.getReversed()===!0?U.buffers.color.setClear(0,0,0,0):U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);const G=h!==this.type;G&&w.traverse(function(O){O.material&&(Array.isArray(O.material)?O.material.forEach(k=>k.needsUpdate=!0):O.material.needsUpdate=!0)});for(let O=0,k=E.length;O<k;O++){const J=E[O],X=J.shadow;if(X===void 0){Oe("WebGLShadowMap:",J,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;s.copy(X.mapSize);const re=X.getFrameExtents();s.multiply(re),r.copy(X.mapSize),(s.x>p||s.y>p)&&(s.x>p&&(r.x=Math.floor(p/re.x),s.x=r.x*re.x,X.mapSize.x=r.x),s.y>p&&(r.y=Math.floor(p/re.y),s.y=r.y*re.y,X.mapSize.y=r.y));const Y=n.state.buffers.depth.getReversed();if(X.camera._reversedDepth=Y,X.map===null||G===!0){if(X.map!==null&&(X.map.depthTexture!==null&&(X.map.depthTexture.dispose(),X.map.depthTexture=null),X.map.dispose()),this.type===sr){if(J.isPointLight){Oe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}X.map=new Vn(s.x,s.y,{format:Qi,type:ai,minFilter:sn,magFilter:sn,generateMipmaps:!1}),X.map.texture.name=J.name+".shadowMap",X.map.depthTexture=new Mr(s.x,s.y,zn),X.map.depthTexture.name=J.name+".shadowMapDepth",X.map.depthTexture.format=xi,X.map.depthTexture.compareFunction=null,X.map.depthTexture.minFilter=Kt,X.map.depthTexture.magFilter=Kt}else J.isPointLight?(X.map=new Ah(s.x),X.map.depthTexture=new Ip(s.x,ri)):(X.map=new Vn(s.x,s.y),X.map.depthTexture=new Mr(s.x,s.y,ri)),X.map.depthTexture.name=J.name+".shadowMap",X.map.depthTexture.format=xi,this.type===Sa?(X.map.depthTexture.compareFunction=Y?Tc:Ec,X.map.depthTexture.minFilter=sn,X.map.depthTexture.magFilter=sn):(X.map.depthTexture.compareFunction=null,X.map.depthTexture.minFilter=Kt,X.map.depthTexture.magFilter=Kt);X.camera.updateProjectionMatrix()}X.map.isWebGLCubeRenderTarget!==!0&&(X.map.width!==s.x||X.map.height!==s.y)&&X.map.setSize(s.x,s.y);const te=X.map.isWebGLCubeRenderTarget?6:X.getViewportCount();J.isPointLight!==!0&&X.updateMatrices(J,v);for(let se=0;se<te;se++){const Ie=X.getCamera(se);if(J.isPointLight){const Pe=X.camera,vt=X.matrix,nt=J.distance||Pe.far;nt!==Pe.far&&(Pe.far=nt,Pe.updateProjectionMatrix()),nr.setFromMatrixPosition(J.matrixWorld),Pe.position.copy(nr),Zo.copy(Pe.position),Zo.add(Lv[se]),Pe.up.copy(Dv[se]),Pe.lookAt(Zo),Pe.updateMatrixWorld(),vt.makeTranslation(-nr.x,-nr.y,-nr.z),gu.multiplyMatrices(Pe.projectionMatrix,Pe.matrixWorldInverse),X._frustum.setFromProjectionMatrix(gu,Pe.coordinateSystem,Pe.reversedDepth)}if(X.map.isWebGLCubeRenderTarget)n.setRenderTarget(X.map,se),n.clear();else{se===0&&(n.setRenderTarget(X.map),n.clear());const Pe=X.getViewport(se);a.set(r.x*Pe.x,r.y*Pe.y,r.x*Pe.z,r.y*Pe.w),U.viewport(a)}i=X.getFrustum(se),b(w,v,Ie,J,this.type)}X.isPointLightShadow!==!0&&this.type===sr&&M(X,v),X.needsUpdate=!1}h=this.type,f.needsUpdate=!1,n.setRenderTarget(T,C,L)};function M(E,w){const v=e.update(y);u.defines.VSM_SAMPLES!==E.blurSamples&&(u.defines.VSM_SAMPLES=E.blurSamples,d.defines.VSM_SAMPLES=E.blurSamples,u.needsUpdate=!0,d.needsUpdate=!0),E.mapPass===null?E.mapPass=new Vn(s.x,s.y,{format:Qi,type:ai}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),u.uniforms.shadow_pass.value=E.map.depthTexture,u.uniforms.resolution.value.set(E.map.width,E.map.height),u.uniforms.radius.value=E.radius,n.setRenderTarget(E.mapPass),n.clear(),n.renderBufferDirect(w,null,v,u,y,null),d.uniforms.shadow_pass.value=E.mapPass.texture,d.uniforms.resolution.value.set(E.map.width,E.map.height),d.uniforms.radius.value=E.radius,n.setRenderTarget(E.map),n.clear(),n.renderBufferDirect(w,null,v,d,y,null)}function R(E,w,v,T){let C=null;const L=v.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(L!==void 0)C=L;else if(C=v.isPointLight===!0?l:o,n.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){const U=C.uuid,G=w.uuid;let O=c[U];O===void 0&&(O={},c[U]=O);let k=O[G];k===void 0&&(k=C.clone(),O[G]=k,w.addEventListener("dispose",S)),C=k}if(C.visible=w.visible,C.wireframe=w.wireframe,T===sr?C.side=w.shadowSide!==null?w.shadowSide:w.side:C.side=w.shadowSide!==null?w.shadowSide:m[w.side],C.alphaMap=w.alphaMap,C.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,C.map=w.map,C.clipShadows=w.clipShadows,C.clippingPlanes=w.clippingPlanes,C.clipIntersection=w.clipIntersection,C.displacementMap=w.displacementMap,C.displacementScale=w.displacementScale,C.displacementBias=w.displacementBias,C.wireframeLinewidth=w.wireframeLinewidth,C.linewidth=w.linewidth,v.isPointLight===!0&&C.isMeshDistanceMaterial===!0){const U=n.properties.get(C);U.light=v}return C}function b(E,w,v,T,C){if(E.visible===!1)return;if(E.layers.test(w.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&C===sr)&&(!E.frustumCulled||E.intersectsFrustum(i))){E.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,E.matrixWorld);const G=e.update(E),O=E.material;if(Array.isArray(O)){const k=G.groups;for(let J=0,X=k.length;J<X;J++){const re=k[J],Y=O[re.materialIndex];if(Y&&Y.visible){const te=R(E,Y,T,C);E.onBeforeShadow(n,E,w,v,G,te,re),n.renderBufferDirect(v,null,G,te,E,re),E.onAfterShadow(n,E,w,v,G,te,re)}}}else if(O.visible){const k=R(E,O,T,C);E.onBeforeShadow(n,E,w,v,G,k,null),n.renderBufferDirect(v,null,G,k,E,null),E.onAfterShadow(n,E,w,v,G,k,null)}}const U=E.children;for(let G=0,O=U.length;G<O;G++)b(U[G],w,v,T,C)}function S(E){E.target.removeEventListener("dispose",S);for(const v in c){const T=c[v],C=E.target.uuid;C in T&&(T[C].dispose(),delete T[C])}}}function Nv(n,e){function t(){let I=!1;const ue=new Lt;let j=null;const he=new Lt(0,0,0,0);return{setMask:function(_e){j!==_e&&!I&&(n.colorMask(_e,_e,_e,_e),j=_e)},setLocked:function(_e){I=_e},setClear:function(_e,ie,Le,Te,yt){yt===!0&&(_e*=Te,ie*=Te,Le*=Te),ue.set(_e,ie,Le,Te),he.equals(ue)===!1&&(n.clearColor(_e,ie,Le,Te),he.copy(ue))},reset:function(){I=!1,j=null,he.set(-1,0,0,0)}}}function i(){let I=!1,ue=!1,j=null,he=null,_e=null;return{setReversed:function(ie){if(ue!==ie){const Le=e.get("EXT_clip_control");ie?Le.clipControlEXT(Le.LOWER_LEFT_EXT,Le.ZERO_TO_ONE_EXT):Le.clipControlEXT(Le.LOWER_LEFT_EXT,Le.NEGATIVE_ONE_TO_ONE_EXT),ue=ie;const Te=_e;_e=null,this.setClear(Te)}},getReversed:function(){return ue},setTest:function(ie){ie?ee(n.DEPTH_TEST):be(n.DEPTH_TEST)},setMask:function(ie){j!==ie&&!I&&(n.depthMask(ie),j=ie)},setFunc:function(ie){if(ue&&(ie=ip[ie]),he!==ie){switch(ie){case pl:n.depthFunc(n.NEVER);break;case ml:n.depthFunc(n.ALWAYS);break;case gl:n.depthFunc(n.LESS);break;case _r:n.depthFunc(n.LEQUAL);break;case _l:n.depthFunc(n.EQUAL);break;case vl:n.depthFunc(n.GEQUAL);break;case xl:n.depthFunc(n.GREATER);break;case yl:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}he=ie}},setLocked:function(ie){I=ie},setClear:function(ie){_e!==ie&&(_e=ie,ue&&(ie=1-ie),n.clearDepth(ie))},reset:function(){I=!1,j=null,he=null,_e=null,ue=!1}}}function s(){let I=!1,ue=null,j=null,he=null,_e=null,ie=null,Le=null,Te=null,yt=null;return{setTest:function(ot){I||(ot?ee(n.STENCIL_TEST):be(n.STENCIL_TEST))},setMask:function(ot){ue!==ot&&!I&&(n.stencilMask(ot),ue=ot)},setFunc:function(ot,Nn,Xn){(j!==ot||he!==Nn||_e!==Xn)&&(n.stencilFunc(ot,Nn,Xn),j=ot,he=Nn,_e=Xn)},setOp:function(ot,Nn,Xn){(ie!==ot||Le!==Nn||Te!==Xn)&&(n.stencilOp(ot,Nn,Xn),ie=ot,Le=Nn,Te=Xn)},setLocked:function(ot){I=ot},setClear:function(ot){yt!==ot&&(n.clearStencil(ot),yt=ot)},reset:function(){I=!1,ue=null,j=null,he=null,_e=null,ie=null,Le=null,Te=null,yt=null}}}const r=new t,a=new i,o=new s,l=new WeakMap,c=new WeakMap;let p={},m={},u={},d=new WeakMap,g=[],y=null,f=!1,h=null,M=null,R=null,b=null,S=null,E=null,w=null,v=new ke(0,0,0),T=0,C=!1,L=null,U=null,G=null,O=null,k=null;const J=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,re=0;const Y=n.getParameter(n.VERSION);Y.indexOf("WebGL")!==-1?(re=parseFloat(/^WebGL (\d)/.exec(Y)[1]),X=re>=1):Y.indexOf("OpenGL ES")!==-1&&(re=parseFloat(/^OpenGL ES (\d)/.exec(Y)[1]),X=re>=2);let te=null,se={};const Ie=n.getParameter(n.SCISSOR_BOX),Pe=n.getParameter(n.VIEWPORT),vt=new Lt().fromArray(Ie),nt=new Lt().fromArray(Pe);function at(I,ue,j,he){const _e=new Uint8Array(4),ie=n.createTexture();n.bindTexture(I,ie),n.texParameteri(I,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(I,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Le=0;Le<j;Le++)I===n.TEXTURE_3D||I===n.TEXTURE_2D_ARRAY?n.texImage3D(ue,0,n.RGBA,1,1,he,0,n.RGBA,n.UNSIGNED_BYTE,_e):n.texImage2D(ue+Le,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,_e);return ie}const K={};K[n.TEXTURE_2D]=at(n.TEXTURE_2D,n.TEXTURE_2D,1),K[n.TEXTURE_CUBE_MAP]=at(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),K[n.TEXTURE_2D_ARRAY]=at(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),K[n.TEXTURE_3D]=at(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ee(n.DEPTH_TEST),a.setFunc(_r),je(!1),wt(ld),ee(n.CULL_FACE),rt(_i);function ee(I){p[I]!==!0&&(n.enable(I),p[I]=!0)}function be(I){p[I]!==!1&&(n.disable(I),p[I]=!1)}function He(I,ue){return u[I]!==ue?(n.bindFramebuffer(I,ue),u[I]=ue,I===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=ue),I===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=ue),!0):!1}function xe(I,ue){let j=g,he=!1;if(I){j=d.get(ue),j===void 0&&(j=[],d.set(ue,j));const _e=I.textures;if(j.length!==_e.length||j[0]!==n.COLOR_ATTACHMENT0){for(let ie=0,Le=_e.length;ie<Le;ie++)j[ie]=n.COLOR_ATTACHMENT0+ie;j.length=_e.length,he=!0}}else j[0]!==n.BACK&&(j[0]=n.BACK,he=!0);he&&n.drawBuffers(j)}function Ye(I){return y!==I?(n.useProgram(I),y=I,!0):!1}const zt={[Ss]:n.FUNC_ADD,[Tf]:n.FUNC_SUBTRACT,[wf]:n.FUNC_REVERSE_SUBTRACT};zt[Af]=n.MIN,zt[Rf]=n.MAX;const Ke={[Cf]:n.ZERO,[Pf]:n.ONE,[Lf]:n.SRC_COLOR,[Xu]:n.SRC_ALPHA,[Of]:n.SRC_ALPHA_SATURATE,[Uf]:n.DST_COLOR,[If]:n.DST_ALPHA,[Df]:n.ONE_MINUS_SRC_COLOR,[qu]:n.ONE_MINUS_SRC_ALPHA,[Ff]:n.ONE_MINUS_DST_COLOR,[Nf]:n.ONE_MINUS_DST_ALPHA,[Bf]:n.CONSTANT_COLOR,[kf]:n.ONE_MINUS_CONSTANT_COLOR,[zf]:n.CONSTANT_ALPHA,[Hf]:n.ONE_MINUS_CONSTANT_ALPHA};function rt(I,ue,j,he,_e,ie,Le,Te,yt,ot){if(I===_i){f===!0&&(be(n.BLEND),f=!1);return}if(f===!1&&(ee(n.BLEND),f=!0),I!==Ef){if(I!==h||ot!==C){if((M!==Ss||S!==Ss)&&(n.blendEquation(n.FUNC_ADD),M=Ss,S=Ss),ot)switch(I){case dr:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case fl:n.blendFunc(n.ONE,n.ONE);break;case cd:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case dd:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:it("WebGLState: Invalid blending: ",I);break}else switch(I){case dr:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case fl:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case cd:it("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case dd:it("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:it("WebGLState: Invalid blending: ",I);break}R=null,b=null,E=null,w=null,v.set(0,0,0),T=0,h=I,C=ot}return}_e=_e||ue,ie=ie||j,Le=Le||he,(ue!==M||_e!==S)&&(n.blendEquationSeparate(zt[ue],zt[_e]),M=ue,S=_e),(j!==R||he!==b||ie!==E||Le!==w)&&(n.blendFuncSeparate(Ke[j],Ke[he],Ke[ie],Ke[Le]),R=j,b=he,E=ie,w=Le),(Te.equals(v)===!1||yt!==T)&&(n.blendColor(Te.r,Te.g,Te.b,yt),v.copy(Te),T=yt),h=I,C=!1}function xt(I,ue){I.side===yn?be(n.CULL_FACE):ee(n.CULL_FACE);let j=I.side===fn;ue&&(j=!j),je(j),I.blending===dr&&I.transparent===!1?rt(_i):rt(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),a.setFunc(I.depthFunc),a.setTest(I.depthTest),a.setMask(I.depthWrite),r.setMask(I.colorWrite);const he=I.stencilWrite;o.setTest(he),he&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),gn(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?ee(n.SAMPLE_ALPHA_TO_COVERAGE):be(n.SAMPLE_ALPHA_TO_COVERAGE)}function je(I){L!==I&&(I?n.frontFace(n.CW):n.frontFace(n.CCW),L=I)}function wt(I){I!==Mf?(ee(n.CULL_FACE),I!==U&&(I===ld?n.cullFace(n.BACK):I===bf?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):be(n.CULL_FACE),U=I}function $t(I){I!==G&&(X&&n.lineWidth(I),G=I)}function gn(I,ue,j){I?(ee(n.POLYGON_OFFSET_FILL),(O!==ue||k!==j)&&(O=ue,k=j,a.getReversed()&&(ue=-ue),n.polygonOffset(ue,j))):be(n.POLYGON_OFFSET_FILL)}function Rt(I){I?ee(n.SCISSOR_TEST):be(n.SCISSOR_TEST)}function Nt(I){I===void 0&&(I=n.TEXTURE0+J-1),te!==I&&(n.activeTexture(I),te=I)}function N(I,ue,j){j===void 0&&(te===null?j=n.TEXTURE0+J-1:j=te);let he=se[j];he===void 0&&(he={type:void 0,texture:void 0},se[j]=he),(he.type!==I||he.texture!==ue)&&(te!==j&&(n.activeTexture(j),te=j),n.bindTexture(I,ue||K[I]),he.type=I,he.texture=ue)}function jt(){const I=se[te];I!==void 0&&I.type!==void 0&&(n.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function dt(){try{n.compressedTexImage2D(...arguments)}catch(I){it("WebGLState:",I)}}function A(){try{n.compressedTexImage3D(...arguments)}catch(I){it("WebGLState:",I)}}function _(){try{n.texSubImage2D(...arguments)}catch(I){it("WebGLState:",I)}}function B(){try{n.texSubImage3D(...arguments)}catch(I){it("WebGLState:",I)}}function V(){try{n.compressedTexSubImage2D(...arguments)}catch(I){it("WebGLState:",I)}}function q(){try{n.compressedTexSubImage3D(...arguments)}catch(I){it("WebGLState:",I)}}function ae(){try{n.texStorage2D(...arguments)}catch(I){it("WebGLState:",I)}}function le(){try{n.texStorage3D(...arguments)}catch(I){it("WebGLState:",I)}}function Z(){try{n.texImage2D(...arguments)}catch(I){it("WebGLState:",I)}}function Q(){try{n.texImage3D(...arguments)}catch(I){it("WebGLState:",I)}}function ce(I){return m[I]!==void 0?m[I]:n.getParameter(I)}function Re(I,ue){m[I]!==ue&&(n.pixelStorei(I,ue),m[I]=ue)}function fe(I){vt.equals(I)===!1&&(n.scissor(I.x,I.y,I.z,I.w),vt.copy(I))}function de(I){nt.equals(I)===!1&&(n.viewport(I.x,I.y,I.z,I.w),nt.copy(I))}function Ce(I,ue){let j=c.get(ue);j===void 0&&(j=new WeakMap,c.set(ue,j));let he=j.get(I);he===void 0&&(he=n.getUniformBlockIndex(ue,I.name),j.set(I,he))}function Ue(I,ue){const he=c.get(ue).get(I);l.get(ue)!==he&&(n.uniformBlockBinding(ue,he,I.__bindingPointIndex),l.set(ue,he))}function $e(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),p={},m={},te=null,se={},u={},d=new WeakMap,g=[],y=null,f=!1,h=null,M=null,R=null,b=null,S=null,E=null,w=null,v=new ke(0,0,0),T=0,C=!1,L=null,U=null,G=null,O=null,k=null,vt.set(0,0,n.canvas.width,n.canvas.height),nt.set(0,0,n.canvas.width,n.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ee,disable:be,bindFramebuffer:He,drawBuffers:xe,useProgram:Ye,setBlending:rt,setMaterial:xt,setFlipSided:je,setCullFace:wt,setLineWidth:$t,setPolygonOffset:gn,setScissorTest:Rt,activeTexture:Nt,bindTexture:N,unbindTexture:jt,compressedTexImage2D:dt,compressedTexImage3D:A,texImage2D:Z,texImage3D:Q,pixelStorei:Re,getParameter:ce,updateUBOMapping:Ce,uniformBlockBinding:Ue,texStorage2D:ae,texStorage3D:le,texSubImage2D:_,texSubImage3D:B,compressedTexSubImage2D:V,compressedTexSubImage3D:q,scissor:fe,viewport:de,reset:$e}}function Uv(n,e,t,i,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ae,p=new WeakMap,m=new Set;let u;const d=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(A,_){return g?new OffscreenCanvas(A,_):Ha("canvas")}function f(A,_,B){let V=1;const q=dt(A);if((q.width>B||q.height>B)&&(V=B/Math.max(q.width,q.height)),V<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){const ae=Math.floor(V*q.width),le=Math.floor(V*q.height);u===void 0&&(u=y(ae,le));const Z=_?y(ae,le):u;return Z.width=ae,Z.height=le,Z.getContext("2d").drawImage(A,0,0,ae,le),Oe("WebGLRenderer: Texture has been resized from ("+q.width+"x"+q.height+") to ("+ae+"x"+le+")."),Z}else return"data"in A&&Oe("WebGLRenderer: Image in DataTexture is too big ("+q.width+"x"+q.height+")."),A;return A}function h(A){return A.generateMipmaps}function M(A){n.generateMipmap(A)}function R(A){return A.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?n.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function b(A,_,B,V,q,ae=!1){if(A!==null){if(n[A]!==void 0)return n[A];Oe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let le;V&&(le=e.get("EXT_texture_norm16"),le||Oe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Z=_;if(_===n.RED&&(B===n.FLOAT&&(Z=n.R32F),B===n.HALF_FLOAT&&(Z=n.R16F),B===n.UNSIGNED_BYTE&&(Z=n.R8),B===n.UNSIGNED_SHORT&&le&&(Z=le.R16_EXT),B===n.SHORT&&le&&(Z=le.R16_SNORM_EXT)),_===n.RED_INTEGER&&(B===n.UNSIGNED_BYTE&&(Z=n.R8UI),B===n.UNSIGNED_SHORT&&(Z=n.R16UI),B===n.UNSIGNED_INT&&(Z=n.R32UI),B===n.BYTE&&(Z=n.R8I),B===n.SHORT&&(Z=n.R16I),B===n.INT&&(Z=n.R32I)),_===n.RG&&(B===n.FLOAT&&(Z=n.RG32F),B===n.HALF_FLOAT&&(Z=n.RG16F),B===n.UNSIGNED_BYTE&&(Z=n.RG8),B===n.UNSIGNED_SHORT&&le&&(Z=le.RG16_EXT),B===n.SHORT&&le&&(Z=le.RG16_SNORM_EXT)),_===n.RG_INTEGER&&(B===n.UNSIGNED_BYTE&&(Z=n.RG8UI),B===n.UNSIGNED_SHORT&&(Z=n.RG16UI),B===n.UNSIGNED_INT&&(Z=n.RG32UI),B===n.BYTE&&(Z=n.RG8I),B===n.SHORT&&(Z=n.RG16I),B===n.INT&&(Z=n.RG32I)),_===n.RGB_INTEGER&&(B===n.UNSIGNED_BYTE&&(Z=n.RGB8UI),B===n.UNSIGNED_SHORT&&(Z=n.RGB16UI),B===n.UNSIGNED_INT&&(Z=n.RGB32UI),B===n.BYTE&&(Z=n.RGB8I),B===n.SHORT&&(Z=n.RGB16I),B===n.INT&&(Z=n.RGB32I)),_===n.RGBA_INTEGER&&(B===n.UNSIGNED_BYTE&&(Z=n.RGBA8UI),B===n.UNSIGNED_SHORT&&(Z=n.RGBA16UI),B===n.UNSIGNED_INT&&(Z=n.RGBA32UI),B===n.BYTE&&(Z=n.RGBA8I),B===n.SHORT&&(Z=n.RGBA16I),B===n.INT&&(Z=n.RGBA32I)),_===n.RGB&&(B===n.UNSIGNED_SHORT&&le&&(Z=le.RGB16_EXT),B===n.SHORT&&le&&(Z=le.RGB16_SNORM_EXT),B===n.UNSIGNED_INT_5_9_9_9_REV&&(Z=n.RGB9_E5),B===n.UNSIGNED_INT_10F_11F_11F_REV&&(Z=n.R11F_G11F_B10F)),_===n.RGBA){const Q=ae?za:tt.getTransfer(q);B===n.FLOAT&&(Z=n.RGBA32F),B===n.HALF_FLOAT&&(Z=n.RGBA16F),B===n.UNSIGNED_BYTE&&(Z=Q===ut?n.SRGB8_ALPHA8:n.RGBA8),B===n.UNSIGNED_SHORT&&le&&(Z=le.RGBA16_EXT),B===n.SHORT&&le&&(Z=le.RGBA16_SNORM_EXT),B===n.UNSIGNED_SHORT_4_4_4_4&&(Z=n.RGBA4),B===n.UNSIGNED_SHORT_5_5_5_1&&(Z=n.RGB5_A1)}return(Z===n.R16F||Z===n.R32F||Z===n.RG16F||Z===n.RG32F||Z===n.RGBA16F||Z===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Z}function S(A,_){let B;return A?_===null||_===ri||_===xr?B=n.DEPTH24_STENCIL8:_===zn?B=n.DEPTH32F_STENCIL8:_===vr&&(B=n.DEPTH24_STENCIL8,Oe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===ri||_===xr?B=n.DEPTH_COMPONENT24:_===zn?B=n.DEPTH_COMPONENT32F:_===vr&&(B=n.DEPTH_COMPONENT16),B}function E(A,_){return h(A)===!0||A.isFramebufferTexture&&A.minFilter!==Kt&&A.minFilter!==sn?Math.log2(Math.max(_.width,_.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?_.mipmaps.length:1}function w(A){const _=A.target;_.removeEventListener("dispose",w),T(_),_.isVideoTexture&&p.delete(_),_.isHTMLTexture&&m.delete(_)}function v(A){const _=A.target;_.removeEventListener("dispose",v),L(_)}function T(A){const _=i.get(A);if(_.__webglInit===void 0)return;const B=A.source,V=d.get(B);if(V){const q=V[_.__cacheKey];q.usedTimes--,q.usedTimes===0&&C(A),Object.keys(V).length===0&&d.delete(B)}i.remove(A)}function C(A){const _=i.get(A);n.deleteTexture(_.__webglTexture);const B=A.source,V=d.get(B);delete V[_.__cacheKey],a.memory.textures--}function L(A){const _=i.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),i.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let V=0;V<6;V++){if(Array.isArray(_.__webglFramebuffer[V]))for(let q=0;q<_.__webglFramebuffer[V].length;q++)n.deleteFramebuffer(_.__webglFramebuffer[V][q]);else n.deleteFramebuffer(_.__webglFramebuffer[V]);_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer[V])}else{if(Array.isArray(_.__webglFramebuffer))for(let V=0;V<_.__webglFramebuffer.length;V++)n.deleteFramebuffer(_.__webglFramebuffer[V]);else n.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&n.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let V=0;V<_.__webglColorRenderbuffer.length;V++)_.__webglColorRenderbuffer[V]&&n.deleteRenderbuffer(_.__webglColorRenderbuffer[V]);_.__webglDepthRenderbuffer&&n.deleteRenderbuffer(_.__webglDepthRenderbuffer)}const B=A.textures;for(let V=0,q=B.length;V<q;V++){const ae=i.get(B[V]);ae.__webglTexture&&(n.deleteTexture(ae.__webglTexture),a.memory.textures--),i.remove(B[V])}i.remove(A)}let U=0;function G(){U=0}function O(){return U}function k(A){U=A}function J(){const A=U;return A>=s.maxTextures&&Oe("WebGLTextures: Trying to use "+(A+1)+" texture units while this GPU supports only "+s.maxTextures),U+=1,A}function X(A){const _=[];return _.push(A.wrapS),_.push(A.wrapT),_.push(A.wrapR||0),_.push(A.magFilter),_.push(A.minFilter),_.push(A.anisotropy),_.push(A.internalFormat),_.push(A.format),_.push(A.type),_.push(A.generateMipmaps),_.push(A.premultiplyAlpha),_.push(A.flipY),_.push(A.unpackAlignment),_.push(A.colorSpace),_.join()}function re(A,_){const B=i.get(A);if(A.isVideoTexture&&N(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&B.__version!==A.version){const V=A.image;if(V===null)Oe("WebGLRenderer: Texture marked for update but no image data found.");else if(V.complete===!1)Oe("WebGLRenderer: Texture marked for update but image is incomplete");else{be(B,A,_);return}}else A.isExternalTexture&&(B.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,B.__webglTexture,n.TEXTURE0+_)}function Y(A,_){const B=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&B.__version!==A.version){be(B,A,_);return}else A.isExternalTexture&&(B.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,B.__webglTexture,n.TEXTURE0+_)}function te(A,_){const B=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&B.__version!==A.version){be(B,A,_);return}t.bindTexture(n.TEXTURE_3D,B.__webglTexture,n.TEXTURE0+_)}function se(A,_){const B=i.get(A);if(A.isCubeDepthTexture!==!0&&A.version>0&&B.__version!==A.version){He(B,A,_);return}t.bindTexture(n.TEXTURE_CUBE_MAP,B.__webglTexture,n.TEXTURE0+_)}const Ie={[Ml]:n.REPEAT,[gi]:n.CLAMP_TO_EDGE,[bl]:n.MIRRORED_REPEAT},Pe={[Kt]:n.NEAREST,[$f]:n.NEAREST_MIPMAP_NEAREST,[Hr]:n.NEAREST_MIPMAP_LINEAR,[sn]:n.LINEAR,[xo]:n.LINEAR_MIPMAP_NEAREST,[$i]:n.LINEAR_MIPMAP_LINEAR},vt={[Yf]:n.NEVER,[Qf]:n.ALWAYS,[Kf]:n.LESS,[Ec]:n.LEQUAL,[Zf]:n.EQUAL,[Tc]:n.GEQUAL,[Jf]:n.GREATER,[jf]:n.NOTEQUAL};function nt(A,_){if(_.type===zn&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===sn||_.magFilter===xo||_.magFilter===Hr||_.magFilter===$i||_.minFilter===sn||_.minFilter===xo||_.minFilter===Hr||_.minFilter===$i)&&Oe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(A,n.TEXTURE_WRAP_S,Ie[_.wrapS]),n.texParameteri(A,n.TEXTURE_WRAP_T,Ie[_.wrapT]),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,Ie[_.wrapR]),n.texParameteri(A,n.TEXTURE_MAG_FILTER,Pe[_.magFilter]),n.texParameteri(A,n.TEXTURE_MIN_FILTER,Pe[_.minFilter]),_.compareFunction&&(n.texParameteri(A,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(A,n.TEXTURE_COMPARE_FUNC,vt[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Kt||_.minFilter!==Hr&&_.minFilter!==$i||_.type===zn&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){const B=e.get("EXT_texture_filter_anisotropic");n.texParameterf(A,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function at(A,_){let B=!1;A.__webglInit===void 0&&(A.__webglInit=!0,_.addEventListener("dispose",w));const V=_.source;let q=d.get(V);q===void 0&&(q={},d.set(V,q));const ae=X(_);if(ae!==A.__cacheKey){q[ae]===void 0&&(q[ae]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,B=!0),q[ae].usedTimes++;const le=q[A.__cacheKey];le!==void 0&&(q[A.__cacheKey].usedTimes--,le.usedTimes===0&&C(_)),A.__cacheKey=ae,A.__webglTexture=q[ae].texture}return B}function K(A,_,B){return Math.floor(Math.floor(A/B)/_)}function ee(A,_,B,V){const ae=A.updateRanges;if(ae.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,_.width,_.height,B,V,_.data);else{ae.sort((Re,fe)=>Re.start-fe.start);let le=0;for(let Re=1;Re<ae.length;Re++){const fe=ae[le],de=ae[Re],Ce=fe.start+fe.count,Ue=K(de.start,_.width,4),$e=K(fe.start,_.width,4);de.start<=Ce+1&&Ue===$e&&K(de.start+de.count-1,_.width,4)===Ue?fe.count=Math.max(fe.count,de.start+de.count-fe.start):(++le,ae[le]=de)}ae.length=le+1;const Z=t.getParameter(n.UNPACK_ROW_LENGTH),Q=t.getParameter(n.UNPACK_SKIP_PIXELS),ce=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,_.width);for(let Re=0,fe=ae.length;Re<fe;Re++){const de=ae[Re],Ce=Math.floor(de.start/4),Ue=Math.ceil(de.count/4),$e=Ce%_.width,I=Math.floor(Ce/_.width),ue=Ue,j=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,$e),t.pixelStorei(n.UNPACK_SKIP_ROWS,I),t.texSubImage2D(n.TEXTURE_2D,0,$e,I,ue,j,B,V,_.data)}A.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,Z),t.pixelStorei(n.UNPACK_SKIP_PIXELS,Q),t.pixelStorei(n.UNPACK_SKIP_ROWS,ce)}}function be(A,_,B){let V=n.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(V=n.TEXTURE_2D_ARRAY),_.isData3DTexture&&(V=n.TEXTURE_3D);const q=at(A,_),ae=_.source;t.bindTexture(V,A.__webglTexture,n.TEXTURE0+B);const le=i.get(ae);if(ae.version!==le.__version||q===!0){if(t.activeTexture(n.TEXTURE0+B),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){const j=tt.getPrimaries(tt.workingColorSpace),he=_.colorSpace===Ci?null:tt.getPrimaries(_.colorSpace),_e=_.colorSpace===Ci||j===he?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,_e)}t.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment);let Q=f(_.image,!1,s.maxTextureSize);Q=jt(_,Q);const ce=r.convert(_.format,_.colorSpace),Re=r.convert(_.type);let fe=b(_.internalFormat,ce,Re,_.normalized,_.colorSpace,_.isVideoTexture);nt(V,_);let de;const Ce=_.mipmaps,Ue=_.isVideoTexture!==!0,$e=le.__version===void 0||q===!0,I=ae.dataReady,ue=E(_,Q);if(_.isDepthTexture)fe=S(_.format===Wi,_.type),$e&&(Ue?t.texStorage2D(n.TEXTURE_2D,1,fe,Q.width,Q.height):t.texImage2D(n.TEXTURE_2D,0,fe,Q.width,Q.height,0,ce,Re,null));else if(_.isDataTexture)if(Ce.length>0){Ue&&$e&&t.texStorage2D(n.TEXTURE_2D,ue,fe,Ce[0].width,Ce[0].height);for(let j=0,he=Ce.length;j<he;j++)de=Ce[j],Ue?I&&t.texSubImage2D(n.TEXTURE_2D,j,0,0,de.width,de.height,ce,Re,de.data):t.texImage2D(n.TEXTURE_2D,j,fe,de.width,de.height,0,ce,Re,de.data);_.generateMipmaps=!1}else Ue?($e&&t.texStorage2D(n.TEXTURE_2D,ue,fe,Q.width,Q.height),I&&ee(_,Q,ce,Re)):t.texImage2D(n.TEXTURE_2D,0,fe,Q.width,Q.height,0,ce,Re,Q.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Ue&&$e&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ue,fe,Ce[0].width,Ce[0].height,Q.depth);for(let j=0,he=Ce.length;j<he;j++)if(de=Ce[j],_.format!==Hn)if(ce!==null)if(Ue){if(I)if(_.layerUpdates.size>0){const _e=Yd(de.width,de.height,_.format,_.type);for(const ie of _.layerUpdates){const Le=de.data.subarray(ie*_e/de.data.BYTES_PER_ELEMENT,(ie+1)*_e/de.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,j,0,0,ie,de.width,de.height,1,ce,Le)}}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,j,0,0,0,de.width,de.height,Q.depth,ce,de.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,j,fe,de.width,de.height,Q.depth,0,de.data,0,0);else Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ue?I&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,j,0,0,0,de.width,de.height,Q.depth,ce,Re,de.data):t.texImage3D(n.TEXTURE_2D_ARRAY,j,fe,de.width,de.height,Q.depth,0,ce,Re,de.data);_.layerUpdates.size>0&&_.clearLayerUpdates()}else{Ue&&$e&&t.texStorage2D(n.TEXTURE_2D,ue,fe,Ce[0].width,Ce[0].height);for(let j=0,he=Ce.length;j<he;j++)de=Ce[j],_.format!==Hn?ce!==null?Ue?I&&t.compressedTexSubImage2D(n.TEXTURE_2D,j,0,0,de.width,de.height,ce,de.data):t.compressedTexImage2D(n.TEXTURE_2D,j,fe,de.width,de.height,0,de.data):Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ue?I&&t.texSubImage2D(n.TEXTURE_2D,j,0,0,de.width,de.height,ce,Re,de.data):t.texImage2D(n.TEXTURE_2D,j,fe,de.width,de.height,0,ce,Re,de.data)}else if(_.isDataArrayTexture)if(Ue){if($e&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ue,fe,Q.width,Q.height,Q.depth),I)if(_.layerUpdates.size>0){const j=Yd(Q.width,Q.height,_.format,_.type);for(const he of _.layerUpdates){const _e=Q.data.subarray(he*j/Q.data.BYTES_PER_ELEMENT,(he+1)*j/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,he,Q.width,Q.height,1,ce,Re,_e)}_.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,ce,Re,Q.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,fe,Q.width,Q.height,Q.depth,0,ce,Re,Q.data);else if(_.isData3DTexture)Ue?($e&&t.texStorage3D(n.TEXTURE_3D,ue,fe,Q.width,Q.height,Q.depth),I&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,ce,Re,Q.data)):t.texImage3D(n.TEXTURE_3D,0,fe,Q.width,Q.height,Q.depth,0,ce,Re,Q.data);else if(_.isFramebufferTexture){if($e)if(Ue)t.texStorage2D(n.TEXTURE_2D,ue,fe,Q.width,Q.height);else{let j=Q.width,he=Q.height;for(let _e=0;_e<ue;_e++)t.texImage2D(n.TEXTURE_2D,_e,fe,j,he,0,ce,Re,null),j>>=1,he>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in n){const j=n.canvas;if(j.hasAttribute("layoutsubtree")||j.setAttribute("layoutsubtree","true"),Q.parentNode!==j){j.appendChild(Q),m.add(_),j.onpaint=he=>{const _e=he.changedElements;for(const ie of m)_e.includes(ie.image)&&(ie.needsUpdate=!0)},j.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,Q);else{const _e=n.RGBA,ie=n.RGBA,Le=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,_e,ie,Le,Q)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(Ce.length>0){if(Ue&&$e){const j=dt(Ce[0]);t.texStorage2D(n.TEXTURE_2D,ue,fe,j.width,j.height)}for(let j=0,he=Ce.length;j<he;j++)de=Ce[j],Ue?I&&t.texSubImage2D(n.TEXTURE_2D,j,0,0,ce,Re,de):t.texImage2D(n.TEXTURE_2D,j,fe,ce,Re,de);_.generateMipmaps=!1}else if(Ue){if($e){const j=dt(Q);t.texStorage2D(n.TEXTURE_2D,ue,fe,j.width,j.height)}I&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ce,Re,Q)}else t.texImage2D(n.TEXTURE_2D,0,fe,ce,Re,Q);h(_)&&M(V),le.__version=ae.version,_.onUpdate&&_.onUpdate(_)}A.__version=_.version}function He(A,_,B){if(_.image.length!==6)return;const V=at(A,_),q=_.source;t.bindTexture(n.TEXTURE_CUBE_MAP,A.__webglTexture,n.TEXTURE0+B);const ae=i.get(q);if(q.version!==ae.__version||V===!0){t.activeTexture(n.TEXTURE0+B);const le=tt.getPrimaries(tt.workingColorSpace),Z=_.colorSpace===Ci?null:tt.getPrimaries(_.colorSpace),Q=_.colorSpace===Ci||le===Z?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Q);const ce=_.isCompressedTexture||_.image[0].isCompressedTexture,Re=_.image[0]&&_.image[0].isDataTexture,fe=[];for(let ie=0;ie<6;ie++)!ce&&!Re?fe[ie]=f(_.image[ie],!0,s.maxCubemapSize):fe[ie]=Re?_.image[ie].image:_.image[ie],fe[ie]=jt(_,fe[ie]);const de=fe[0],Ce=r.convert(_.format,_.colorSpace),Ue=r.convert(_.type),$e=b(_.internalFormat,Ce,Ue,_.normalized,_.colorSpace),I=_.isVideoTexture!==!0,ue=ae.__version===void 0||V===!0,j=q.dataReady;let he=E(_,de);nt(n.TEXTURE_CUBE_MAP,_);let _e;if(ce){I&&ue&&t.texStorage2D(n.TEXTURE_CUBE_MAP,he,$e,de.width,de.height);for(let ie=0;ie<6;ie++){_e=fe[ie].mipmaps;for(let Le=0;Le<_e.length;Le++){const Te=_e[Le];_.format!==Hn?Ce!==null?I?j&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Le,0,0,Te.width,Te.height,Ce,Te.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Le,$e,Te.width,Te.height,0,Te.data):Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?j&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Le,0,0,Te.width,Te.height,Ce,Ue,Te.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Le,$e,Te.width,Te.height,0,Ce,Ue,Te.data)}}}else{if(_e=_.mipmaps,I&&ue){_e.length>0&&he++;const ie=dt(fe[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,he,$e,ie.width,ie.height)}for(let ie=0;ie<6;ie++)if(Re){I?j&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,fe[ie].width,fe[ie].height,Ce,Ue,fe[ie].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,$e,fe[ie].width,fe[ie].height,0,Ce,Ue,fe[ie].data);for(let Le=0;Le<_e.length;Le++){const yt=_e[Le].image[ie].image;I?j&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Le+1,0,0,yt.width,yt.height,Ce,Ue,yt.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Le+1,$e,yt.width,yt.height,0,Ce,Ue,yt.data)}}else{I?j&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,Ce,Ue,fe[ie]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,$e,Ce,Ue,fe[ie]);for(let Le=0;Le<_e.length;Le++){const Te=_e[Le];I?j&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Le+1,0,0,Ce,Ue,Te.image[ie]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Le+1,$e,Ce,Ue,Te.image[ie])}}}h(_)&&M(n.TEXTURE_CUBE_MAP),ae.__version=q.version,_.onUpdate&&_.onUpdate(_)}A.__version=_.version}function xe(A,_,B,V,q,ae){const le=r.convert(B.format,B.colorSpace),Z=r.convert(B.type),Q=b(B.internalFormat,le,Z,B.normalized,B.colorSpace),ce=i.get(_),Re=i.get(B);if(Re.__renderTarget=_,!ce.__hasExternalTextures){const fe=Math.max(1,_.width>>ae),de=Math.max(1,_.height>>ae);q===n.TEXTURE_3D||q===n.TEXTURE_2D_ARRAY?t.texImage3D(q,ae,Q,fe,de,_.depth,0,le,Z,null):t.texImage2D(q,ae,Q,fe,de,0,le,Z,null)}t.bindFramebuffer(n.FRAMEBUFFER,A),Nt(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,V,q,Re.__webglTexture,0,Rt(_)):(q===n.TEXTURE_2D||q>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&q<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,V,q,Re.__webglTexture,ae),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Ye(A,_,B){if(n.bindRenderbuffer(n.RENDERBUFFER,A),_.depthBuffer){const V=_.depthTexture,q=V&&V.isDepthTexture?V.type:null,ae=S(_.stencilBuffer,q),le=_.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;Nt(_)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Rt(_),ae,_.width,_.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,Rt(_),ae,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,ae,_.width,_.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,le,n.RENDERBUFFER,A)}else{const V=_.textures;for(let q=0;q<V.length;q++){const ae=V[q],le=r.convert(ae.format,ae.colorSpace),Z=r.convert(ae.type),Q=b(ae.internalFormat,le,Z,ae.normalized,ae.colorSpace);Nt(_)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Rt(_),Q,_.width,_.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,Rt(_),Q,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,Q,_.width,_.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function zt(A,_,B){const V=_.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,A),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const q=i.get(_.depthTexture);if(q.__renderTarget=_,(!q.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),V){if(q.__webglInit===void 0&&(q.__webglInit=!0,_.depthTexture.addEventListener("dispose",w)),q.__webglTexture===void 0){q.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,q.__webglTexture),nt(n.TEXTURE_CUBE_MAP,_.depthTexture);const ce=r.convert(_.depthTexture.format),Re=r.convert(_.depthTexture.type);let fe;_.depthTexture.format===xi?fe=n.DEPTH_COMPONENT24:_.depthTexture.format===Wi&&(fe=n.DEPTH24_STENCIL8);for(let de=0;de<6;de++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,fe,_.width,_.height,0,ce,Re,null)}}else re(_.depthTexture,0);const ae=q.__webglTexture,le=Rt(_),Z=V?n.TEXTURE_CUBE_MAP_POSITIVE_X+B:n.TEXTURE_2D,Q=_.depthTexture.format===Wi?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(_.depthTexture.format===xi)Nt(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Q,Z,ae,0,le):n.framebufferTexture2D(n.FRAMEBUFFER,Q,Z,ae,0);else if(_.depthTexture.format===Wi)Nt(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Q,Z,ae,0,le):n.framebufferTexture2D(n.FRAMEBUFFER,Q,Z,ae,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Ke(A){const _=i.get(A),B=A.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==A.depthTexture){const V=A.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),V){const q=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,V.removeEventListener("dispose",q)};V.addEventListener("dispose",q),_.__depthDisposeCallback=q}_.__boundDepthTexture=V}if(A.depthTexture&&!_.__autoAllocateDepthBuffer)if(B)for(let V=0;V<6;V++)zt(_.__webglFramebuffer[V],A,V);else{const V=A.texture.mipmaps;V&&V.length>0?zt(_.__webglFramebuffer[0],A,0):zt(_.__webglFramebuffer,A,0)}else if(B){_.__webglDepthbuffer=[];for(let V=0;V<6;V++)if(t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[V]),_.__webglDepthbuffer[V]===void 0)_.__webglDepthbuffer[V]=n.createRenderbuffer(),Ye(_.__webglDepthbuffer[V],A,!1);else{const q=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ae=_.__webglDepthbuffer[V];n.bindRenderbuffer(n.RENDERBUFFER,ae),n.framebufferRenderbuffer(n.FRAMEBUFFER,q,n.RENDERBUFFER,ae)}}else{const V=A.texture.mipmaps;if(V&&V.length>0?t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=n.createRenderbuffer(),Ye(_.__webglDepthbuffer,A,!1);else{const q=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ae=_.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ae),n.framebufferRenderbuffer(n.FRAMEBUFFER,q,n.RENDERBUFFER,ae)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function rt(A,_,B){const V=i.get(A);_!==void 0&&xe(V.__webglFramebuffer,A,A.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),B!==void 0&&Ke(A)}function xt(A){const _=A.texture,B=i.get(A),V=i.get(_);A.addEventListener("dispose",v);const q=A.textures,ae=A.isWebGLCubeRenderTarget===!0,le=q.length>1;if(le||(V.__webglTexture===void 0&&(V.__webglTexture=n.createTexture()),V.__version=_.version,a.memory.textures++),ae){B.__webglFramebuffer=[];for(let Z=0;Z<6;Z++)if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer[Z]=[];for(let Q=0;Q<_.mipmaps.length;Q++)B.__webglFramebuffer[Z][Q]=n.createFramebuffer()}else B.__webglFramebuffer[Z]=n.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer=[];for(let Z=0;Z<_.mipmaps.length;Z++)B.__webglFramebuffer[Z]=n.createFramebuffer()}else B.__webglFramebuffer=n.createFramebuffer();if(le)for(let Z=0,Q=q.length;Z<Q;Z++){const ce=i.get(q[Z]);ce.__webglTexture===void 0&&(ce.__webglTexture=n.createTexture(),a.memory.textures++)}if(A.samples>0&&Nt(A)===!1){B.__webglMultisampledFramebuffer=n.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let Z=0;Z<q.length;Z++){const Q=q[Z];B.__webglColorRenderbuffer[Z]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,B.__webglColorRenderbuffer[Z]);const ce=r.convert(Q.format,Q.colorSpace),Re=r.convert(Q.type),fe=b(Q.internalFormat,ce,Re,Q.normalized,Q.colorSpace,A.isXRRenderTarget===!0),de=Rt(A);n.renderbufferStorageMultisample(n.RENDERBUFFER,de,fe,A.width,A.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Z,n.RENDERBUFFER,B.__webglColorRenderbuffer[Z])}n.bindRenderbuffer(n.RENDERBUFFER,null),A.depthBuffer&&(B.__webglDepthRenderbuffer=n.createRenderbuffer(),Ye(B.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(ae){t.bindTexture(n.TEXTURE_CUBE_MAP,V.__webglTexture),nt(n.TEXTURE_CUBE_MAP,_);for(let Z=0;Z<6;Z++)if(_.mipmaps&&_.mipmaps.length>0)for(let Q=0;Q<_.mipmaps.length;Q++)xe(B.__webglFramebuffer[Z][Q],A,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,Q);else xe(B.__webglFramebuffer[Z],A,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0);h(_)&&M(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(le){for(let Z=0,Q=q.length;Z<Q;Z++){const ce=q[Z],Re=i.get(ce);let fe=n.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(fe=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(fe,Re.__webglTexture),nt(fe,ce),xe(B.__webglFramebuffer,A,ce,n.COLOR_ATTACHMENT0+Z,fe,0),h(ce)&&M(fe)}t.unbindTexture()}else{let Z=n.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(Z=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Z,V.__webglTexture),nt(Z,_),_.mipmaps&&_.mipmaps.length>0)for(let Q=0;Q<_.mipmaps.length;Q++)xe(B.__webglFramebuffer[Q],A,_,n.COLOR_ATTACHMENT0,Z,Q);else xe(B.__webglFramebuffer,A,_,n.COLOR_ATTACHMENT0,Z,0);h(_)&&M(Z),t.unbindTexture()}A.depthBuffer&&Ke(A)}function je(A){const _=A.textures;for(let B=0,V=_.length;B<V;B++){const q=_[B];if(h(q)){const ae=R(A),le=i.get(q).__webglTexture;t.bindTexture(ae,le),M(ae),t.unbindTexture()}}}const wt=[],$t=[];function gn(A){if(A.samples>0){if(Nt(A)===!1){const _=A.textures,B=A.width,V=A.height;let q=n.COLOR_BUFFER_BIT;const ae=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,le=i.get(A),Z=_.length>1;if(Z)for(let ce=0;ce<_.length;ce++)t.bindFramebuffer(n.FRAMEBUFFER,le.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,le.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,le.__webglMultisampledFramebuffer);const Q=A.texture.mipmaps;Q&&Q.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,le.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,le.__webglFramebuffer);for(let ce=0;ce<_.length;ce++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(q|=n.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(q|=n.STENCIL_BUFFER_BIT)),Z){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,le.__webglColorRenderbuffer[ce]);const Re=i.get(_[ce]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Re,0)}n.blitFramebuffer(0,0,B,V,0,0,B,V,q,n.NEAREST),l===!0&&(wt.length=0,$t.length=0,wt.push(n.COLOR_ATTACHMENT0+ce),A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&(wt.push(ae),$t.push(ae),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,$t)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,wt))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Z)for(let ce=0;ce<_.length;ce++){t.bindFramebuffer(n.FRAMEBUFFER,le.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.RENDERBUFFER,le.__webglColorRenderbuffer[ce]);const Re=i.get(_[ce]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,le.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.TEXTURE_2D,Re,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,le.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&l){const _=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[_])}}}function Rt(A){return Math.min(s.maxSamples,A.samples)}function Nt(A){const _=i.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function N(A){const _=a.render.frame;p.get(A)!==_&&(p.set(A,_),A.update())}function jt(A,_){const B=A.colorSpace,V=A.format,q=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||B!==ka&&B!==Ci&&(tt.getTransfer(B)===ut?(V!==Hn||q!==En)&&Oe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):it("WebGLTextures: Unsupported texture color space:",B)),_}function dt(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=J,this.resetTextureUnits=G,this.getTextureUnits=O,this.setTextureUnits=k,this.setTexture2D=re,this.setTexture2DArray=Y,this.setTexture3D=te,this.setTextureCube=se,this.rebindTextures=rt,this.setupRenderTarget=xt,this.updateRenderTargetMipmap=je,this.updateMultisampleRenderTarget=gn,this.setupDepthRenderbuffer=Ke,this.setupFrameBufferTexture=xe,this.useMultisampledRTT=Nt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Fv(n,e){function t(i,s=Ci){let r;const a=tt.getTransfer(s);if(i===En)return n.UNSIGNED_BYTE;if(i===vc)return n.UNSIGNED_SHORT_4_4_4_4;if(i===xc)return n.UNSIGNED_SHORT_5_5_5_1;if(i===sh)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===rh)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===nh)return n.BYTE;if(i===ih)return n.SHORT;if(i===vr)return n.UNSIGNED_SHORT;if(i===_c)return n.INT;if(i===ri)return n.UNSIGNED_INT;if(i===zn)return n.FLOAT;if(i===ai)return n.HALF_FLOAT;if(i===ah)return n.ALPHA;if(i===oh)return n.RGB;if(i===Hn)return n.RGBA;if(i===xi)return n.DEPTH_COMPONENT;if(i===Wi)return n.DEPTH_STENCIL;if(i===yc)return n.RED;if(i===Mc)return n.RED_INTEGER;if(i===Qi)return n.RG;if(i===bc)return n.RG_INTEGER;if(i===Sc)return n.RGBA_INTEGER;if(i===Ea||i===Ta||i===wa||i===Aa)if(a===ut)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Ea)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Ta)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===wa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Aa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Ea)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Ta)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===wa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Aa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Sl||i===El||i===Tl||i===wl)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Sl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===El)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Tl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===wl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Al||i===Rl||i===Cl||i===Pl||i===Ll||i===Oa||i===Dl)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Al||i===Rl)return a===ut?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Cl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Pl)return r.COMPRESSED_R11_EAC;if(i===Ll)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Oa)return r.COMPRESSED_RG11_EAC;if(i===Dl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Il||i===Nl||i===Ul||i===Fl||i===Ol||i===Bl||i===kl||i===zl||i===Hl||i===Gl||i===Vl||i===$l||i===Wl||i===Xl)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Il)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Nl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Ul)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Fl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Ol)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Bl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===kl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===zl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Hl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Gl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Vl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===$l)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Wl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Xl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===ql||i===Yl||i===Kl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===ql)return a===ut?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Yl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Kl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Zl||i===Jl||i===Ba||i===jl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===Zl)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Jl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Ba)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===jl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===xr?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}const Ov=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Bv=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class kv{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new yh(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new $n({vertexShader:Ov,fragmentShader:Bv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Tt(new no(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class zv extends Ui{constructor(e,t){super();const i=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,p=null,m=null,u=null,d=null,g=null;const y=typeof XRWebGLBinding<"u",f=new kv,h={},M=t.getContextAttributes();let R=null,b=null;const S=[],E=[],w=new Ae;let v=null,T=null;const C=new Dn;C.viewport=new Lt;const L=new Dn;L.viewport=new Lt;const U=[C,L],G=new Xp;let O=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let ee=S[K];return ee===void 0&&(ee=new Ao,S[K]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(K){let ee=S[K];return ee===void 0&&(ee=new Ao,S[K]=ee),ee.getGripSpace()},this.getHand=function(K){let ee=S[K];return ee===void 0&&(ee=new Ao,S[K]=ee),ee.getHandSpace()};function J(K){const ee=E.indexOf(K.inputSource);if(ee===-1)return;const be=S[ee];be!==void 0&&(be.update(K.inputSource,K.frame,c||a),be.dispatchEvent({type:K.type,data:K.inputSource}))}function X(){s.removeEventListener("select",J),s.removeEventListener("selectstart",J),s.removeEventListener("selectend",J),s.removeEventListener("squeeze",J),s.removeEventListener("squeezestart",J),s.removeEventListener("squeezeend",J),s.removeEventListener("end",X),s.removeEventListener("inputsourceschange",re);for(let K=0;K<S.length;K++){const ee=E[K];ee!==null&&(E[K]=null,S[K].disconnect(ee))}O=null,k=null,f.reset();for(const K in h)delete h[K];if(e.setRenderTarget(R),d=null,u=null,m=null,s=null,b=null,at.stop(),i.isPresenting=!1,e.setPixelRatio(v),e.setSize(w.width,w.height,!1),T!==null){const K=T.camera;K.fov=T.fov,K.zoom=T.zoom,K.updateProjectionMatrix(),T=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,i.isPresenting===!0&&Oe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){o=K,i.isPresenting===!0&&Oe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return m===null&&y&&(m=new XRWebGLBinding(s,t)),m},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(R=e.getRenderTarget(),s.addEventListener("select",J),s.addEventListener("selectstart",J),s.addEventListener("selectend",J),s.addEventListener("squeeze",J),s.addEventListener("squeezestart",J),s.addEventListener("squeezeend",J),s.addEventListener("end",X),s.addEventListener("inputsourceschange",re),M.xrCompatible!==!0&&await t.makeXRCompatible(),v=e.getPixelRatio(),e.getSize(w),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let be=null,He=null,xe=null;M.depth&&(xe=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,be=M.stencil?Wi:xi,He=M.stencil?xr:ri);const Ye={colorFormat:t.RGBA8,depthFormat:xe,scaleFactor:r};m=this.getBinding(),u=m.createProjectionLayer(Ye),s.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),b=new Vn(u.textureWidth,u.textureHeight,{format:Hn,type:En,depthTexture:new Mr(u.textureWidth,u.textureHeight,He,void 0,void 0,void 0,void 0,void 0,void 0,be),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{const be={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,t,be),s.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),b=new Vn(d.framebufferWidth,d.framebufferHeight,{format:Hn,type:En,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),at.setContext(s),at.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return f.getDepthTexture()};function re(K){for(let ee=0;ee<K.removed.length;ee++){const be=K.removed[ee],He=E.indexOf(be);He>=0&&(E[He]=null,S[He].disconnect(be))}for(let ee=0;ee<K.added.length;ee++){const be=K.added[ee];let He=E.indexOf(be);if(He===-1){for(let Ye=0;Ye<S.length;Ye++)if(Ye>=E.length){E.push(be),He=Ye;break}else if(E[Ye]===null){E[Ye]=be,He=Ye;break}if(He===-1)break}const xe=S[He];xe&&xe.connect(be)}}const Y=new P,te=new P;function se(K,ee,be){Y.setFromMatrixPosition(ee.matrixWorld),te.setFromMatrixPosition(be.matrixWorld);const He=Y.distanceTo(te),xe=ee.projectionMatrix.elements,Ye=be.projectionMatrix.elements,zt=xe[14]/(xe[10]-1),Ke=xe[14]/(xe[10]+1),rt=(xe[9]+1)/xe[5],xt=(xe[9]-1)/xe[5],je=(xe[8]-1)/xe[0],wt=(Ye[8]+1)/Ye[0],$t=zt*je,gn=zt*wt,Rt=He/(-je+wt),Nt=Rt*-je;if(ee.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(Nt),K.translateZ(Rt),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),xe[10]===-1)K.projectionMatrix.copy(ee.projectionMatrix),K.projectionMatrixInverse.copy(ee.projectionMatrixInverse);else{const N=zt+Rt,jt=Ke+Rt,dt=$t-Nt,A=gn+(He-Nt),_=rt*Ke/jt*N,B=xt*Ke/jt*N;K.projectionMatrix.makePerspective(dt,A,_,B,N,jt),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function Ie(K,ee){ee===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(ee.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let ee=K.near,be=K.far;f.texture!==null&&(f.depthNear>0&&(ee=f.depthNear),f.depthFar>0&&(be=f.depthFar)),G.near=L.near=C.near=ee,G.far=L.far=C.far=be,(O!==G.near||k!==G.far)&&(s.updateRenderState({depthNear:G.near,depthFar:G.far}),O=G.near,k=G.far),G.layers.mask=K.layers.mask|6,C.layers.mask=G.layers.mask&-5,L.layers.mask=G.layers.mask&-3;const He=K.parent,xe=G.cameras;Ie(G,He);for(let Ye=0;Ye<xe.length;Ye++)Ie(xe[Ye],He);xe.length===2?se(G,C,L):G.projectionMatrix.copy(C.projectionMatrix),T===null&&K.isPerspectiveCamera&&(T={camera:K,fov:K.fov,zoom:K.zoom}),Pe(K,G,He)};function Pe(K,ee,be){be===null?K.matrix.copy(ee.matrixWorld):(K.matrix.copy(be.matrixWorld),K.matrix.invert(),K.matrix.multiply(ee.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(ee.projectionMatrix),K.projectionMatrixInverse.copy(ee.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=ec*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return G},this.getFoveation=function(){if(!(u===null&&d===null))return l},this.setFoveation=function(K){l=K,u!==null&&(u.fixedFoveation=K),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=K)},this.hasDepthSensing=function(){return f.texture!==null},this.getDepthSensingMesh=function(){return f.getMesh(G)},this.getCameraTexture=function(K){return h[K]};let vt=null;function nt(K,ee){if(p=ee.getViewerPose(c||a),g=ee,p!==null){const be=p.views;d!==null&&(e.setRenderTargetFramebuffer(b,d.framebuffer),e.setRenderTarget(b));let He=!1;be.length!==G.cameras.length&&(G.cameras.length=0,He=!0);for(let Ke=0;Ke<be.length;Ke++){const rt=be[Ke];let xt=null;if(d!==null)xt=d.getViewport(rt);else{const wt=m.getViewSubImage(u,rt);xt=wt.viewport,Ke===0&&(e.setRenderTargetTextures(b,wt.colorTexture,wt.depthStencilTexture),e.setRenderTarget(b))}let je=U[Ke];je===void 0&&(je=new Dn,je.layers.enable(Ke),je.viewport=new Lt,U[Ke]=je),je.matrix.fromArray(rt.transform.matrix),je.matrix.decompose(je.position,je.quaternion,je.scale),je.projectionMatrix.fromArray(rt.projectionMatrix),je.projectionMatrixInverse.copy(je.projectionMatrix).invert(),je.viewport.set(xt.x,xt.y,xt.width,xt.height),Ke===0&&(G.matrix.copy(je.matrix),G.matrix.decompose(G.position,G.quaternion,G.scale)),He===!0&&G.cameras.push(je)}const xe=s.enabledFeatures;if(xe&&xe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&y){m=i.getBinding();const Ke=m.getDepthInformation(be[0]);Ke&&Ke.isValid&&Ke.texture&&f.init(Ke,s.renderState)}if(xe&&xe.includes("camera-access")&&y){e.state.unbindTexture(),m=i.getBinding();for(let Ke=0;Ke<be.length;Ke++){const rt=be[Ke].camera;if(rt){let xt=h[rt];xt||(xt=new yh,h[rt]=xt);const je=m.getCameraImage(rt);xt.sourceTexture=je}}}}for(let be=0;be<S.length;be++){const He=E[be],xe=S[be];He!==null&&xe!==void 0&&xe.update(He,ee,c||a)}vt&&vt(K,ee),ee.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ee}),g=null}const at=new Th;at.setAnimationLoop(nt),this.setAnimationLoop=function(K){vt=K},this.dispose=function(){}}}const Hv=new ft,Dh=new Ge;Dh.set(-1,0,0,0,1,0,0,0,1);function Gv(n,e){function t(f,h){f.matrixAutoUpdate===!0&&f.updateMatrix(),h.value.copy(f.matrix)}function i(f,h){h.color.getRGB(f.fogColor.value,bh(n)),h.isFog?(f.fogNear.value=h.near,f.fogFar.value=h.far):h.isFogExp2&&(f.fogDensity.value=h.density)}function s(f,h,M,R,b){h.isNodeMaterial?h.uniformsNeedUpdate=!1:h.isMeshBasicMaterial?r(f,h):h.isMeshLambertMaterial?(r(f,h),h.envMap&&(f.envMapIntensity.value=h.envMapIntensity)):h.isMeshToonMaterial?(r(f,h),m(f,h)):h.isMeshPhongMaterial?(r(f,h),p(f,h),h.envMap&&(f.envMapIntensity.value=h.envMapIntensity)):h.isMeshStandardMaterial?(r(f,h),u(f,h),h.isMeshPhysicalMaterial&&d(f,h,b)):h.isMeshMatcapMaterial?(r(f,h),g(f,h)):h.isMeshDepthMaterial?r(f,h):h.isMeshDistanceMaterial?(r(f,h),y(f,h)):h.isMeshNormalMaterial?r(f,h):h.isLineBasicMaterial?(a(f,h),h.isLineDashedMaterial&&o(f,h)):h.isPointsMaterial?l(f,h,M,R):h.isSpriteMaterial?c(f,h):h.isShadowMaterial?(f.color.value.copy(h.color),f.opacity.value=h.opacity):h.isShaderMaterial&&(h.uniformsNeedUpdate=!1)}function r(f,h){f.opacity.value=h.opacity,h.color&&f.diffuse.value.copy(h.color),h.emissive&&f.emissive.value.copy(h.emissive).multiplyScalar(h.emissiveIntensity),h.map&&(f.map.value=h.map,t(h.map,f.mapTransform)),h.alphaMap&&(f.alphaMap.value=h.alphaMap,t(h.alphaMap,f.alphaMapTransform)),h.bumpMap&&(f.bumpMap.value=h.bumpMap,t(h.bumpMap,f.bumpMapTransform),f.bumpScale.value=h.bumpScale,h.side===fn&&(f.bumpScale.value*=-1)),h.normalMap&&(f.normalMap.value=h.normalMap,t(h.normalMap,f.normalMapTransform),f.normalScale.value.copy(h.normalScale),h.side===fn&&f.normalScale.value.negate()),h.displacementMap&&(f.displacementMap.value=h.displacementMap,t(h.displacementMap,f.displacementMapTransform),f.displacementScale.value=h.displacementScale,f.displacementBias.value=h.displacementBias),h.emissiveMap&&(f.emissiveMap.value=h.emissiveMap,t(h.emissiveMap,f.emissiveMapTransform)),h.specularMap&&(f.specularMap.value=h.specularMap,t(h.specularMap,f.specularMapTransform)),h.alphaTest>0&&(f.alphaTest.value=h.alphaTest);const M=e.get(h),R=M.envMap,b=M.envMapRotation;R&&(f.envMap.value=R,f.envMapRotation.value.setFromMatrix4(Hv.makeRotationFromEuler(b)).transpose(),R.isCubeTexture&&R.isRenderTargetTexture===!1&&f.envMapRotation.value.premultiply(Dh),f.reflectivity.value=h.reflectivity,f.ior.value=h.ior,f.refractionRatio.value=h.refractionRatio),h.lightMap&&(f.lightMap.value=h.lightMap,f.lightMapIntensity.value=h.lightMapIntensity,t(h.lightMap,f.lightMapTransform)),h.aoMap&&(f.aoMap.value=h.aoMap,f.aoMapIntensity.value=h.aoMapIntensity,t(h.aoMap,f.aoMapTransform))}function a(f,h){f.diffuse.value.copy(h.color),f.opacity.value=h.opacity,h.map&&(f.map.value=h.map,t(h.map,f.mapTransform))}function o(f,h){f.dashSize.value=h.dashSize,f.totalSize.value=h.dashSize+h.gapSize,f.scale.value=h.scale}function l(f,h,M,R){f.diffuse.value.copy(h.color),f.opacity.value=h.opacity,f.size.value=h.size*M,f.scale.value=R*.5,h.map&&(f.map.value=h.map,t(h.map,f.uvTransform)),h.alphaMap&&(f.alphaMap.value=h.alphaMap,t(h.alphaMap,f.alphaMapTransform)),h.alphaTest>0&&(f.alphaTest.value=h.alphaTest)}function c(f,h){f.diffuse.value.copy(h.color),f.opacity.value=h.opacity,f.rotation.value=h.rotation,h.map&&(f.map.value=h.map,t(h.map,f.mapTransform)),h.alphaMap&&(f.alphaMap.value=h.alphaMap,t(h.alphaMap,f.alphaMapTransform)),h.alphaTest>0&&(f.alphaTest.value=h.alphaTest)}function p(f,h){f.specular.value.copy(h.specular),f.shininess.value=Math.max(h.shininess,1e-4)}function m(f,h){h.gradientMap&&(f.gradientMap.value=h.gradientMap)}function u(f,h){f.metalness.value=h.metalness,h.metalnessMap&&(f.metalnessMap.value=h.metalnessMap,t(h.metalnessMap,f.metalnessMapTransform)),f.roughness.value=h.roughness,h.roughnessMap&&(f.roughnessMap.value=h.roughnessMap,t(h.roughnessMap,f.roughnessMapTransform)),h.envMap&&(f.envMapIntensity.value=h.envMapIntensity)}function d(f,h,M){f.ior.value=h.ior,h.sheen>0&&(f.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen),f.sheenRoughness.value=h.sheenRoughness,h.sheenColorMap&&(f.sheenColorMap.value=h.sheenColorMap,t(h.sheenColorMap,f.sheenColorMapTransform)),h.sheenRoughnessMap&&(f.sheenRoughnessMap.value=h.sheenRoughnessMap,t(h.sheenRoughnessMap,f.sheenRoughnessMapTransform))),h.clearcoat>0&&(f.clearcoat.value=h.clearcoat,f.clearcoatRoughness.value=h.clearcoatRoughness,h.clearcoatMap&&(f.clearcoatMap.value=h.clearcoatMap,t(h.clearcoatMap,f.clearcoatMapTransform)),h.clearcoatRoughnessMap&&(f.clearcoatRoughnessMap.value=h.clearcoatRoughnessMap,t(h.clearcoatRoughnessMap,f.clearcoatRoughnessMapTransform)),h.clearcoatNormalMap&&(f.clearcoatNormalMap.value=h.clearcoatNormalMap,t(h.clearcoatNormalMap,f.clearcoatNormalMapTransform),f.clearcoatNormalScale.value.copy(h.clearcoatNormalScale),h.side===fn&&f.clearcoatNormalScale.value.negate())),h.dispersion>0&&(f.dispersion.value=h.dispersion),h.retroreflectivity>0&&(f.retroreflectivity.value=h.retroreflectivity),h.iridescence>0&&(f.iridescence.value=h.iridescence,f.iridescenceIOR.value=h.iridescenceIOR,f.iridescenceThicknessMinimum.value=h.iridescenceThicknessRange[0],f.iridescenceThicknessMaximum.value=h.iridescenceThicknessRange[1],h.iridescenceMap&&(f.iridescenceMap.value=h.iridescenceMap,t(h.iridescenceMap,f.iridescenceMapTransform)),h.iridescenceThicknessMap&&(f.iridescenceThicknessMap.value=h.iridescenceThicknessMap,t(h.iridescenceThicknessMap,f.iridescenceThicknessMapTransform))),h.transmission>0&&(f.transmission.value=h.transmission,f.transmissionSamplerMap.value=M.texture,f.transmissionSamplerSize.value.set(M.width,M.height),h.transmissionMap&&(f.transmissionMap.value=h.transmissionMap,t(h.transmissionMap,f.transmissionMapTransform)),f.thickness.value=h.thickness,h.thicknessMap&&(f.thicknessMap.value=h.thicknessMap,t(h.thicknessMap,f.thicknessMapTransform)),f.attenuationDistance.value=h.attenuationDistance,f.attenuationColor.value.copy(h.attenuationColor)),h.anisotropy>0&&(f.anisotropyVector.value.set(h.anisotropy*Math.cos(h.anisotropyRotation),h.anisotropy*Math.sin(h.anisotropyRotation)),h.anisotropyMap&&(f.anisotropyMap.value=h.anisotropyMap,t(h.anisotropyMap,f.anisotropyMapTransform))),f.specularIntensity.value=h.specularIntensity,f.specularColor.value.copy(h.specularColor),h.specularColorMap&&(f.specularColorMap.value=h.specularColorMap,t(h.specularColorMap,f.specularColorMapTransform)),h.specularIntensityMap&&(f.specularIntensityMap.value=h.specularIntensityMap,t(h.specularIntensityMap,f.specularIntensityMapTransform))}function g(f,h){h.matcap&&(f.matcap.value=h.matcap)}function y(f,h){const M=e.get(h).light;f.referencePosition.value.setFromMatrixPosition(M.matrixWorld),f.nearDistance.value=M.shadow.camera.near,f.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function Vv(n,e,t,i){let s={},r={},a=[];const o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,S){const E=S.program;i.uniformBlockBinding(b,E)}function c(b,S){let E=s[b.id];E===void 0&&(f(b),E=p(b),s[b.id]=E,b.addEventListener("dispose",M));const w=S.program;i.updateUBOMapping(b,w);const v=e.render.frame;r[b.id]!==v&&(u(b),r[b.id]=v)}function p(b){const S=m();b.__bindingPointIndex=S;const E=n.createBuffer(),w=b.__size,v=b.usage;return n.bindBuffer(n.UNIFORM_BUFFER,E),n.bufferData(n.UNIFORM_BUFFER,w,v),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,S,E),E}function m(){for(let b=0;b<o;b++)if(a.indexOf(b)===-1)return a.push(b),b;return it("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(b){const S=s[b.id],E=b.uniforms,w=b.__cache;n.bindBuffer(n.UNIFORM_BUFFER,S);for(let v=0,T=E.length;v<T;v++){const C=E[v];if(Array.isArray(C))for(let L=0,U=C.length;L<U;L++)d(C[L],v,L,w);else d(C,v,0,w)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function d(b,S,E,w){if(y(b,S,E,w)===!0){const v=b.__offset,T=b.value;if(Array.isArray(T)){let C=0;for(let L=0;L<T.length;L++){const U=T[L],G=h(U);g(U,b.__data,C),typeof U!="number"&&typeof U!="boolean"&&!U.isMatrix3&&!ArrayBuffer.isView(U)&&(C+=G.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(T,b.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,v,b.__data)}}function g(b,S,E){typeof b=="number"||typeof b=="boolean"?S[0]=b:b.isMatrix3?(S[0]=b.elements[0],S[1]=b.elements[1],S[2]=b.elements[2],S[3]=0,S[4]=b.elements[3],S[5]=b.elements[4],S[6]=b.elements[5],S[7]=0,S[8]=b.elements[6],S[9]=b.elements[7],S[10]=b.elements[8],S[11]=0):ArrayBuffer.isView(b)?S.set(new b.constructor(b.buffer,b.byteOffset,S.length)):b.toArray(S,E)}function y(b,S,E,w){const v=b.value,T=S+"_"+E;if(w[T]===void 0)return typeof v=="number"||typeof v=="boolean"?w[T]=v:ArrayBuffer.isView(v)?w[T]=v.slice():w[T]=v.clone(),!0;{const C=w[T];if(typeof v=="number"||typeof v=="boolean"){if(C!==v)return w[T]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(C.equals(v)===!1)return C.copy(v),!0}}return!1}function f(b){const S=b.uniforms;let E=0;const w=16;for(let T=0,C=S.length;T<C;T++){const L=Array.isArray(S[T])?S[T]:[S[T]];for(let U=0,G=L.length;U<G;U++){const O=L[U],k=Array.isArray(O.value)?O.value:[O.value];for(let J=0,X=k.length;J<X;J++){const re=k[J],Y=h(re),te=E%w,se=te%Y.boundary,Ie=te+se;E+=se,Ie!==0&&w-Ie<Y.storage&&(E+=w-Ie),O.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=E,E+=Y.storage}}}const v=E%w;return v>0&&(E+=w-v),b.__size=E,b.__cache={},this}function h(b){const S={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(S.boundary=4,S.storage=4):b.isVector2?(S.boundary=8,S.storage=8):b.isVector3||b.isColor?(S.boundary=16,S.storage=12):b.isVector4?(S.boundary=16,S.storage=16):b.isMatrix3?(S.boundary=48,S.storage=48):b.isMatrix4?(S.boundary=64,S.storage=64):b.isTexture?Oe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(b)?(S.boundary=16,S.storage=b.byteLength):Oe("WebGLRenderer: Unsupported uniform value type.",b),S}function M(b){const S=b.target;S.removeEventListener("dispose",M);const E=a.indexOf(S.__bindingPointIndex);a.splice(E,1),n.deleteBuffer(s[S.id]),delete s[S.id],delete r[S.id]}function R(){for(const b in s)n.deleteBuffer(s[b]);a=[],s={},r={}}return{bind:l,update:c,dispose:R}}const $v=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Kn=null;function Wv(){return Kn===null&&(Kn=new _h($v,16,16,Qi,ai),Kn.name="DFG_LUT",Kn.minFilter=sn,Kn.magFilter=sn,Kn.wrapS=gi,Kn.wrapT=gi,Kn.generateMipmaps=!1,Kn.needsUpdate=!0),Kn}class Xv{constructor(e={}){const{canvas:t=tp(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:p="default",failIfMajorPerformanceCaveat:m=!1,reversedDepthBuffer:u=!1,outputBufferType:d=En}=e;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=a;const y=d,f=new Set([Sc,bc,Mc]),h=new Set([En,ri,vr,xr,vc,xc]),M=new Uint32Array(4),R=new Int32Array(4),b=new P;let S=null,E=null;const w=[],v=[];let T=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ii,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const C=this;let L=!1,U=null,G=null,O=null,k=null;this._outputColorSpace=Ln;let J=0,X=0,re=null,Y=-1,te=null;const se=new Lt,Ie=new Lt;let Pe=null;const vt=new ke(0);let nt=0,at=t.width,K=t.height,ee=1,be=null,He=null;const xe=new Lt(0,0,at,K),Ye=new Lt(0,0,at,K);let zt=!1;const Ke=new Rc;let rt=!1,xt=!1;const je=new ft,wt=new P,$t=new Lt,gn={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Rt=!1;function Nt(){return re===null?ee:1}let N=i;function jt(x,D){return t.getContext(x,D)}let dt,A,_,B,V,q,ae,le,Z,Q,ce,Re,fe,de,Ce,Ue,$e,I,ue,j,he,_e,ie;try{const x={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:p,failIfMajorPerformanceCaveat:m};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${mc}`),t.addEventListener("webglcontextlost",yt,!1),t.addEventListener("webglcontextrestored",ot,!1),t.addEventListener("webglcontextcreationerror",Nn,!1),N===null){const D="webgl2";if(N=jt(D,x),N===null)throw jt(D)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Le()}catch(x){throw t.removeEventListener("webglcontextlost",yt,!1),t.removeEventListener("webglcontextrestored",ot,!1),t.removeEventListener("webglcontextcreationerror",Nn,!1),it("WebGLRenderer: "+x.message),x}function Le(){dt=new W_(N),dt.init(),he=new Fv(N,dt),A=new U_(N,dt,e,he),_=new Nv(N,dt),A.reversedDepthBuffer&&u&&_.buffers.depth.setReversed(!0),G=N.createFramebuffer(),O=N.createFramebuffer(),k=N.createFramebuffer(),B=new Y_(N),V=new yv,q=new Uv(N,dt,_,V,A,he,B),ae=new $_(C),le=new Zp(N),_e=new I_(N,le),Z=new X_(N,le,B,_e),Q=new Z_(N,Z,le,_e,B),I=new K_(N,A,q),Ce=new F_(V),ce=new xv(C,ae,dt,A,_e,Ce),Re=new Gv(C,V),fe=new bv,de=new Rv(dt),$e=new D_(C,ae,_,Q,g,l),Ue=new Iv(C,Q,A),ie=new Vv(N,B,A,_),ue=new N_(N,dt,B),j=new q_(N,dt,B),B.programs=ce.programs,C.capabilities=A,C.extensions=dt,C.properties=V,C.renderLists=fe,C.shadowMap=Ue,C.state=_,C.info=B}y!==En&&(T=new j_(y,t.width,t.height,o,s,r));const Te=new zv(C,N);this.xr=Te,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){const x=dt.get("WEBGL_lose_context");x&&x.loseContext()},this.forceContextRestore=function(){const x=dt.get("WEBGL_lose_context");x&&x.restoreContext()},this.getPixelRatio=function(){return ee},this.setPixelRatio=function(x){x!==void 0&&(ee=x,this.setSize(at,K,!1))},this.getSize=function(x){return x.set(at,K)},this.setSize=function(x,D,$=!0){if(Te.isPresenting){Oe("WebGLRenderer: Can't change size while VR device is presenting.");return}at=x,K=D,t.width=Math.floor(x*ee),t.height=Math.floor(D*ee),$===!0&&(t.style.width=x+"px",t.style.height=D+"px"),T!==null&&T.setSize(t.width,t.height),this.setViewport(0,0,x,D)},this.getDrawingBufferSize=function(x){return x.set(at*ee,K*ee).floor()},this.setDrawingBufferSize=function(x,D,$){at=x,K=D,ee=$,t.width=Math.floor(x*$),t.height=Math.floor(D*$),this.setViewport(0,0,x,D)},this.setEffects=function(x){if(y===En){it("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(x){for(let D=0;D<x.length;D++)if(x[D].isOutputPass===!0){Oe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(x||[])},this.getCurrentViewport=function(x){return x.copy(se)},this.getViewport=function(x){return x.copy(xe)},this.setViewport=function(x,D,$,z){x.isVector4?xe.set(x.x,x.y,x.z,x.w):xe.set(x,D,$,z),_.viewport(se.copy(xe).multiplyScalar(ee).round())},this.getScissor=function(x){return x.copy(Ye)},this.setScissor=function(x,D,$,z){x.isVector4?Ye.set(x.x,x.y,x.z,x.w):Ye.set(x,D,$,z),_.scissor(Ie.copy(Ye).multiplyScalar(ee).round())},this.getScissorTest=function(){return zt},this.setScissorTest=function(x){_.setScissorTest(zt=x)},this.setOpaqueSort=function(x){be=x},this.setTransparentSort=function(x){He=x},this.getClearColor=function(x){return x.copy($e.getClearColor())},this.setClearColor=function(){$e.setClearColor(...arguments)},this.getClearAlpha=function(){return $e.getClearAlpha()},this.setClearAlpha=function(){$e.setClearAlpha(...arguments)},this.clear=function(x=!0,D=!0,$=!0){let z=0;if(x){let H=!1;if(re!==null){const ge=re.texture.format;H=f.has(ge)}if(H){const ge=re.texture.type,ye=h.has(ge),me=$e.getClearColor(),Se=$e.getClearAlpha(),we=me.r,Xe=me.g,Ze=me.b;ye?(M[0]=we,M[1]=Xe,M[2]=Ze,M[3]=Se,N.clearBufferuiv(N.COLOR,0,M)):(R[0]=we,R[1]=Xe,R[2]=Ze,R[3]=Se,N.clearBufferiv(N.COLOR,0,R))}else z|=N.COLOR_BUFFER_BIT}D&&(z|=N.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),$&&(z|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z!==0&&N.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(x){x.setRenderer(this),U=x},this.dispose=function(){t.removeEventListener("webglcontextlost",yt,!1),t.removeEventListener("webglcontextrestored",ot,!1),t.removeEventListener("webglcontextcreationerror",Nn,!1),$e.dispose(),fe.dispose(),de.dispose(),V.dispose(),ae.dispose(),Q.dispose(),_e.dispose(),ie.dispose(),ce.dispose(),Te.dispose(),Te.removeEventListener("sessionstart",Xc),Te.removeEventListener("sessionend",qc),Oi.stop()};function yt(x){x.preventDefault(),Ga("WebGLRenderer: Context Lost."),L=!0}function ot(){Ga("WebGLRenderer: Context Restored."),L=!1;const x=B.autoReset,D=Ue.enabled,$=Ue.autoUpdate,z=Ue.needsUpdate,H=Ue.type;Le(),B.autoReset=x,Ue.enabled=D,Ue.autoUpdate=$,Ue.needsUpdate=z,Ue.type=H}function Nn(x){it("WebGLRenderer: A WebGL context could not be created. Reason: ",x.statusMessage)}function Xn(x){const D=x.target;D.removeEventListener("dispose",Xn),Hh(D)}function Hh(x){Gh(x),V.remove(x)}function Gh(x){const D=V.get(x).programs;D!==void 0&&(D.forEach(function($){ce.releaseProgram($)}),x.isShaderMaterial&&ce.releaseShaderCache(x))}this.renderBufferDirect=function(x,D,$,z,H,ge){D===null&&(D=gn);const ye=H.isMesh&&H.matrixWorld.determinantAffine()<0,me=Wh(x,D,$,z,H);_.setMaterial(z,ye);let Se=$.index,we=1;if(z.wireframe===!0){if(Se=Z.getWireframeAttribute($),Se===void 0)return;we=2}const Xe=$.drawRange,Ze=$.attributes.position;let Ee=Xe.start*we,lt=(Xe.start+Xe.count)*we;ge!==null&&(Ee=Math.max(Ee,ge.start*we),lt=Math.min(lt,(ge.start+ge.count)*we)),Se!==null?(Ee=Math.max(Ee,0),lt=Math.min(lt,Se.count)):Ze!=null&&(Ee=Math.max(Ee,0),lt=Math.min(lt,Ze.count));const Ut=lt-Ee;if(Ut<0||Ut===1/0)return;_e.setup(H,z,me,$,Se);let St,_t=ue;if(Se!==null&&(St=le.get(Se),_t=j,_t.setIndex(St)),H.isMesh)z.wireframe===!0?(_.setLineWidth(z.wireframeLinewidth*Nt()),_t.setMode(N.LINES)):_t.setMode(N.TRIANGLES);else if(H.isLine){let Qt=z.linewidth;Qt===void 0&&(Qt=1),_.setLineWidth(Qt*Nt()),H.isLineSegments?_t.setMode(N.LINES):H.isLineLoop?_t.setMode(N.LINE_LOOP):_t.setMode(N.LINE_STRIP)}else H.isPoints?_t.setMode(N.POINTS):H.isSprite&&_t.setMode(N.TRIANGLES);if(H.isBatchedMesh)if(dt.get("WEBGL_multi_draw"))_t.renderMultiDraw(H._multiDrawStarts,H._multiDrawCounts,H._multiDrawCount);else{const Qt=H._multiDrawStarts,ve=H._multiDrawCounts,an=H._multiDrawCount,st=Se?le.get(Se).bytesPerElement:1,Rn=V.get(z).currentProgram.getUniforms();for(let qn=0;qn<an;qn++)Rn.setValue(N,"_gl_DrawID",qn),_t.render(Qt[qn]/st,ve[qn])}else if(H.isInstancedMesh)_t.renderInstances(Ee,Ut,H.count);else if($.isInstancedBufferGeometry){const Qt=$._maxInstanceCount!==void 0?$._maxInstanceCount:1/0,ve=Math.min($.instanceCount,Qt);_t.renderInstances(Ee,Ut,ve)}else _t.render(Ee,Ut)};function Wc(x,D,$,z){U!==null&&x.isNodeMaterial&&U.setObject(z,x),rt===!0&&Ce.setState(x,$,!1),x.transparent===!0&&x.side===yn&&x.forceSinglePass===!1?(x.side=fn,x.needsUpdate=!0,Fr(x,D,z),x.side=Ji,x.needsUpdate=!0,Fr(x,D,z),x.side=yn):Fr(x,D,z)}this.compile=function(x,D,$=null){$===null&&($=x),U!==null&&U.renderStart(x,D,$),E=de.get($),E.init(D),v.push(E),$.traverseVisible(function(H){H.isLight&&H.layers.test(D.layers)&&(E.pushLight(H),H.castShadow&&E.pushShadow(H))}),x!==$&&x.traverseVisible(function(H){H.isLight&&H.layers.test(D.layers)&&(E.pushLight(H),H.castShadow&&E.pushShadow(H))}),E.setupLights(),U!==null&&U.updateLights(E.state.lightsArray),xt=this.localClippingEnabled,rt=Ce.init(this.clippingPlanes,xt),rt===!0&&Ce.setGlobalState(this.clippingPlanes,D),U!==null&&Ue.render(E.state.shadowsArray,$,D);const z=new Set;return x.traverse(function(H){if(!(H.isMesh||H.isPoints||H.isLine||H.isSprite))return;const ge=H.material;if(ge)if(Array.isArray(ge))for(let ye=0;ye<ge.length;ye++){const me=ge[ye];Wc(me,$,D,H),z.add(me)}else Wc(ge,$,D,H),z.add(ge)}),E=v.pop(),U!==null&&U.renderEnd(),z},this.compileAsync=function(x,D,$=null){const z=this.compile(x,D,$);return new Promise(H=>{function ge(){if(z.forEach(function(ye){const Se=V.get(ye).currentProgram;(Se===void 0||Se.isReady())&&z.delete(ye)}),z.size===0){H(x);return}setTimeout(ge,10)}dt.get("KHR_parallel_shader_compile")!==null?ge():setTimeout(ge,10)})};let uo=null;function Vh(x){uo&&uo(x)}function Xc(){Oi.stop()}function qc(){Oi.start()}const Oi=new Th;Oi.setAnimationLoop(Vh),typeof self<"u"&&Oi.setContext(self),this.setAnimationLoop=function(x){uo=x,Te.setAnimationLoop(x),x===null?Oi.stop():Oi.start()},Te.addEventListener("sessionstart",Xc),Te.addEventListener("sessionend",qc),this.render=function(x,D){if(D!==void 0&&D.isCamera!==!0){it("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;U!==null&&U.renderStart(x,D);const $=Te.enabled===!0&&Te.isPresenting===!0,z=T!==null&&(re===null||$)&&T.begin(C,re);if(x.matrixWorldAutoUpdate===!0&&x.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),Te.enabled===!0&&Te.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(Te.cameraAutoUpdate===!0&&Te.updateCamera(D),D=Te.getCamera()),x.isScene===!0&&x.onBeforeRender(C,x,D,re),E=de.get(x,v.length),E.init(D),E.state.textureUnits=q.getTextureUnits(),v.push(E),je.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),Ke.setFromProjectionMatrix(je,ei,D.reversedDepth),xt=this.localClippingEnabled,rt=Ce.init(this.clippingPlanes,xt),S=fe.get(x,w.length),S.init(),w.push(S),Te.enabled===!0&&Te.isPresenting===!0){const ye=C.xr.getDepthSensingMesh();ye!==null&&ho(ye,D,-1/0,C.sortObjects)}ho(x,D,0,C.sortObjects),S.finish(),U!==null&&U.updateLights(E.state.lightsArray),C.sortObjects===!0&&S.sort(be,He),Rt=Te.enabled===!1||Te.isPresenting===!1||Te.hasDepthSensing()===!1,Rt&&$e.addToRenderList(S,x),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),rt===!0&&Ce.beginShadows();const H=E.state.shadowsArray;if(Ue.render(H,x,D),rt===!0&&Ce.endShadows(),(z&&T.hasRenderPass())===!1){const ye=S.opaque,me=S.transmissive;if(E.setupLights(),D.isArrayCamera){const Se=D.cameras;if(me.length>0)for(let we=0,Xe=Se.length;we<Xe;we++){const Ze=Se[we];Kc(ye,me,x,Ze)}Rt&&$e.render(x);for(let we=0,Xe=Se.length;we<Xe;we++){const Ze=Se[we];Yc(S,x,Ze,Ze.viewport)}}else me.length>0&&Kc(ye,me,x,D),Rt&&$e.render(x),Yc(S,x,D)}re!==null&&X===0&&(q.updateMultisampleRenderTarget(re),q.updateRenderTargetMipmap(re)),z&&T.end(C),x.isScene===!0&&x.onAfterRender(C,x,D),_e.resetDefaultState(),Y=-1,te=null,v.pop(),v.length>0?(E=v[v.length-1],q.setTextureUnits(E.state.textureUnits),rt===!0&&Ce.setGlobalState(C.clippingPlanes,E.state.camera)):E=null,w.pop(),w.length>0?S=w[w.length-1]:S=null,U!==null&&U.renderEnd()};function ho(x,D,$,z){if(x.visible===!1)return;if(x.layers.test(D.layers)){if(x.isGroup)$=x.renderOrder;else if(x.isLOD)x.autoUpdate===!0&&x.update(D);else if(x.isLightProbeGrid)E.pushLightProbeGrid(x);else if(x.isLight)E.pushLight(x),x.castShadow&&E.pushShadow(x);else if(x.isSprite){if(!x.frustumCulled||x.intersectsFrustum(Ke)){z&&$t.setFromMatrixPosition(x.matrixWorld).applyMatrix4(je);const ye=Q.update(x),me=x.material;me.visible&&S.push(x,ye,me,$,$t.z,null,D)}}else if((x.isMesh||x.isLine||x.isPoints)&&(!x.frustumCulled||x.intersectsFrustum(Ke))){const ye=Q.update(x),me=x.material;if(z&&(x.boundingSphere!==void 0?(x.boundingSphere===null&&x.computeBoundingSphere(),$t.copy(x.boundingSphere.center)):(ye.boundingSphere===null&&ye.computeBoundingSphere(),$t.copy(ye.boundingSphere.center)),$t.applyMatrix4(x.matrixWorld).applyMatrix4(je)),Array.isArray(me)){const Se=ye.groups;for(let we=0,Xe=Se.length;we<Xe;we++){const Ze=Se[we],Ee=me[Ze.materialIndex];Ee&&Ee.visible&&S.push(x,ye,Ee,$,$t.z,Ze,D)}}else me.visible&&S.push(x,ye,me,$,$t.z,null,D)}}const ge=x.children;for(let ye=0,me=ge.length;ye<me;ye++)ho(ge[ye],D,$,z)}function Yc(x,D,$,z){const{opaque:H,transmissive:ge,transparent:ye}=x;E.setupLightsView($),rt===!0&&Ce.setGlobalState(C.clippingPlanes,$),z&&_.viewport(se.copy(z)),H.length>0&&Ur(H,D,$),ge.length>0&&Ur(ge,D,$),ye.length>0&&Ur(ye,D,$),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function Kc(x,D,$,z){if(($.isScene===!0?$.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[z.id]===void 0){const Ee=dt.has("EXT_color_buffer_half_float")||dt.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[z.id]=new Vn(1,1,{generateMipmaps:!0,type:Ee?ai:En,minFilter:$i,samples:Math.max(4,A.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:tt.workingColorSpace})}const ge=E.state.transmissionRenderTarget[z.id],ye=z.viewport||se;ge.setSize(ye.z*C.transmissionResolutionScale,ye.w*C.transmissionResolutionScale);const me=C.getRenderTarget(),Se=C.getActiveCubeFace(),we=C.getActiveMipmapLevel();C.setRenderTarget(ge),C.getClearColor(vt),nt=C.getClearAlpha(),nt<1&&C.setClearColor(16777215,.5),C.clear(),Rt&&$e.render($);const Xe=C.toneMapping;C.toneMapping=ii;const Ze=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),E.setupLightsView(z),rt===!0&&Ce.setGlobalState(C.clippingPlanes,z),Ur(x,$,z),q.updateMultisampleRenderTarget(ge),q.updateRenderTargetMipmap(ge),dt.has("WEBGL_multisampled_render_to_texture")===!1){let Ee=!1;for(let lt=0,Ut=D.length;lt<Ut;lt++){const St=D[lt],{object:_t,geometry:Qt,material:ve,group:an}=St;if(ve.side===yn&&_t.layers.test(z.layers)){const st=ve.side;ve.side=fn,ve.needsUpdate=!0,Zc(_t,$,z,Qt,ve,an),ve.side=st,ve.needsUpdate=!0,Ee=!0}}Ee===!0&&(q.updateMultisampleRenderTarget(ge),q.updateRenderTargetMipmap(ge))}C.setRenderTarget(me,Se,we),C.setClearColor(vt,nt),Ze!==void 0&&(z.viewport=Ze),C.toneMapping=Xe}function Ur(x,D,$){const z=D.isScene===!0?D.overrideMaterial:null;for(let H=0,ge=x.length;H<ge;H++){const ye=x[H],{object:me,geometry:Se,group:we}=ye;let Xe=ye.material;Xe.allowOverride===!0&&z!==null&&(Xe=z),me.layers.test($.layers)&&Zc(me,D,$,Se,Xe,we)}}function Zc(x,D,$,z,H,ge){U!==null&&H.isNodeMaterial&&U.setObject(x,H),x.onBeforeRender(C,D,$,z,H,ge),x.modelViewMatrix.multiplyMatrices($.matrixWorldInverse,x.matrixWorld),x.normalMatrix.getNormalMatrix(x.modelViewMatrix),H.onBeforeRender(C,D,$,z,x,ge),H.transparent===!0&&H.side===yn&&H.forceSinglePass===!1?(H.side=fn,H.needsUpdate=!0,C.renderBufferDirect($,D,z,H,x,ge),H.side=Ji,H.needsUpdate=!0,C.renderBufferDirect($,D,z,H,x,ge),H.side=yn):C.renderBufferDirect($,D,z,H,x,ge),x.onAfterRender(C,D,$,z,H,ge)}function Fr(x,D,$){D.isScene!==!0&&(D=gn);const z=V.get(x),H=E.state.lights,ge=E.state.shadowsArray,ye=H.state.version,me=ce.getParameters(x,H.state,ge,D,$,E.state.lightProbeGridArray),Se=ce.getProgramCacheKey(me);let we=z.programs;z.environment=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?D.environment:null,z.fog=D.fog;const Xe=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap;z.envMap=ae.get(x.envMap||z.environment,Xe),z.envMapRotation=z.environment!==null&&x.envMap===null?D.environmentRotation:x.envMapRotation,we===void 0&&(x.addEventListener("dispose",Xn),we=new Map,z.programs=we);let Ze=we.get(Se);if(Ze!==void 0){if(z.currentProgram===Ze&&z.lightsStateVersion===ye)return jc(x,me),Ze}else me.uniforms=ce.getUniforms(x),U!==null&&x.isNodeMaterial&&U.build(x,$,me),x.onBeforeCompile(me,C),Ze=ce.acquireProgram(me,Se),we.set(Se,Ze),z.uniforms=me.uniforms;const Ee=z.uniforms;return(!x.isShaderMaterial&&!x.isRawShaderMaterial||x.clipping===!0)&&(Ee.clippingPlanes=Ce.uniform),jc(x,me),z.needsLights=qh(x),z.lightsStateVersion=ye,z.needsLights&&(Ee.ambientLightColor.value=H.state.ambient,Ee.lightProbe.value=H.state.probe,Ee.sunLights.value=H.state.sun,Ee.sunLightShadows.value=H.state.sunShadow,Ee.directionalLights.value=H.state.directional,Ee.directionalLightShadows.value=H.state.directionalShadow,Ee.spotLights.value=H.state.spot,Ee.spotLightShadows.value=H.state.spotShadow,Ee.rectAreaLights.value=H.state.rectArea,Ee.ltc_1.value=H.state.rectAreaLTC1,Ee.ltc_2.value=H.state.rectAreaLTC2,Ee.pointLights.value=H.state.point,Ee.pointLightShadows.value=H.state.pointShadow,Ee.hemisphereLights.value=H.state.hemi,Ee.sunShadowMatrix.value=H.state.sunShadowMatrix,Ee.sunShadowCascade.value=H.state.sunShadowCascade,Ee.directionalShadowMatrix.value=H.state.directionalShadowMatrix,Ee.spotLightMatrix.value=H.state.spotLightMatrix,Ee.spotLightMap.value=H.state.spotLightMap,Ee.pointShadowMatrix.value=H.state.pointShadowMatrix),z.lightProbeGrid=E.state.lightProbeGridArray.length>0,z.currentProgram=Ze,z.uniformsList=null,Ze}function Jc(x){if(x.uniformsList===null){const D=x.currentProgram.getUniforms();x.uniformsList=Ca.seqWithValue(D.seq,x.uniforms)}return x.uniformsList}function jc(x,D){const $=V.get(x);$.outputColorSpace=D.outputColorSpace,$.batching=D.batching,$.batchingColor=D.batchingColor,$.instancing=D.instancing,$.instancingColor=D.instancingColor,$.instancingMorph=D.instancingMorph,$.skinning=D.skinning,$.morphTargets=D.morphTargets,$.morphNormals=D.morphNormals,$.morphColors=D.morphColors,$.morphTargetsCount=D.morphTargetsCount,$.numClippingPlanes=D.numClippingPlanes,$.numIntersection=D.numClipIntersection,$.vertexAlphas=D.vertexAlphas,$.vertexTangents=D.vertexTangents,$.toneMapping=D.toneMapping}function $h(x,D){if(x.length===0)return null;if(x.length===1)return x[0].texture!==null?x[0]:null;b.setFromMatrixPosition(D.matrixWorld);for(let $=0,z=x.length;$<z;$++){const H=x[$];if(H.texture!==null&&H.boundingBox.containsPoint(b))return H}return null}function Wh(x,D,$,z,H){D.isScene!==!0&&(D=gn),q.resetTextureUnits();const ge=D.fog,ye=z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial?D.environment:null,me=re===null?C.outputColorSpace:re.isXRRenderTarget===!0?re.texture.colorSpace:tt.workingColorSpace,Se=z.isMeshStandardMaterial||z.isMeshLambertMaterial&&!z.envMap||z.isMeshPhongMaterial&&!z.envMap,we=ae.get(z.envMap||ye,Se),Xe=z.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,Ze=!!$.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),Ee=!!$.morphAttributes.position,lt=!!$.morphAttributes.normal,Ut=!!$.morphAttributes.color;let St=ii;z.toneMapped&&(re===null||re.isXRRenderTarget===!0)&&(St=C.toneMapping);const _t=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,Qt=_t!==void 0?_t.length:0,ve=V.get(z),an=E.state.lights;if(rt===!0&&(xt===!0||x!==te)){const Mt=x===te&&z.id===Y;Ce.setState(z,x,Mt)}let st=!1;z.version===ve.__version?(ve.needsLights&&ve.lightsStateVersion!==an.state.version||ve.outputColorSpace!==me||H.isBatchedMesh&&ve.batching===!1||!H.isBatchedMesh&&ve.batching===!0||H.isBatchedMesh&&ve.batchingColor===!0&&H._colorsTexture===null||H.isBatchedMesh&&ve.batchingColor===!1&&H._colorsTexture!==null||H.isInstancedMesh&&ve.instancing===!1||!H.isInstancedMesh&&ve.instancing===!0||H.isSkinnedMesh&&ve.skinning===!1||!H.isSkinnedMesh&&ve.skinning===!0||H.isInstancedMesh&&ve.instancingColor===!0&&H.instanceColor===null||H.isInstancedMesh&&ve.instancingColor===!1&&H.instanceColor!==null||H.isInstancedMesh&&ve.instancingMorph===!0&&H.morphTexture===null||H.isInstancedMesh&&ve.instancingMorph===!1&&H.morphTexture!==null||ve.envMap!==we||z.fog===!0&&ve.fog!==ge||ve.numClippingPlanes!==void 0&&(ve.numClippingPlanes!==Ce.numPlanes||ve.numIntersection!==Ce.numIntersection)||ve.vertexAlphas!==Xe||ve.vertexTangents!==Ze||ve.morphTargets!==Ee||ve.morphNormals!==lt||ve.morphColors!==Ut||ve.toneMapping!==St||ve.morphTargetsCount!==Qt||!!ve.lightProbeGrid!=E.state.lightProbeGridArray.length>0)&&(st=!0):(st=!0,ve.__version=z.version);let Rn=ve.currentProgram;st===!0&&(Rn=Fr(z,D,H),U&&z.isNodeMaterial&&U.onUpdateProgram(z,Rn,ve));let qn=!1,yi=!1,ns=!1;const pt=Rn.getUniforms(),It=ve.uniforms;if(_.useProgram(Rn.program)&&(qn=!0,yi=!0,ns=!0),z.id!==Y&&(Y=z.id,yi=!0),ve.needsLights){const Mt=$h(E.state.lightProbeGridArray,H);ve.lightProbeGrid!==Mt&&(ve.lightProbeGrid=Mt,yi=!0)}if(qn||te!==x){_.buffers.depth.getReversed()&&x.reversedDepth!==!0&&(x._reversedDepth=!0,x.updateProjectionMatrix()),pt.setValue(N,"projectionMatrix",x.projectionMatrix),pt.setValue(N,"viewMatrix",x.matrixWorldInverse);const bi=pt.map.cameraPosition;bi!==void 0&&bi.setValue(N,wt.setFromMatrixPosition(x.matrixWorld)),A.logarithmicDepthBuffer&&pt.setValue(N,"logDepthBufFC",2/(Math.log(x.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&pt.setValue(N,"isOrthographic",x.isOrthographicCamera===!0),te!==x&&(te=x,yi=!0,ns=!0)}if(ve.needsLights&&(an.state.sunShadowMap.length>0&&pt.setValue(N,"sunShadowMap",an.state.sunShadowMap,q),an.state.directionalShadowMap.length>0&&pt.setValue(N,"directionalShadowMap",an.state.directionalShadowMap,q),an.state.spotShadowMap.length>0&&pt.setValue(N,"spotShadowMap",an.state.spotShadowMap,q),an.state.pointShadowMap.length>0&&pt.setValue(N,"pointShadowMap",an.state.pointShadowMap,q)),H.isSkinnedMesh){pt.setOptional(N,H,"bindMatrix"),pt.setOptional(N,H,"bindMatrixInverse");const Mt=H.skeleton;Mt&&(Mt.boneTexture===null&&Mt.computeBoneTexture(),pt.setValue(N,"boneTexture",Mt.boneTexture,q))}H.isBatchedMesh&&(pt.setOptional(N,H,"batchingTexture"),pt.setValue(N,"batchingTexture",H._matricesTexture,q),pt.setOptional(N,H,"batchingIdTexture"),pt.setValue(N,"batchingIdTexture",H._indirectTexture,q),pt.setOptional(N,H,"batchingColorTexture"),H._colorsTexture!==null&&pt.setValue(N,"batchingColorTexture",H._colorsTexture,q));const Mi=$.morphAttributes;if((Mi.position!==void 0||Mi.normal!==void 0||Mi.color!==void 0)&&I.update(H,$,Rn),(yi||ve.receiveShadow!==H.receiveShadow)&&(ve.receiveShadow=H.receiveShadow,pt.setValue(N,"receiveShadow",H.receiveShadow)),(z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial)&&z.envMap===null&&D.environment!==null&&(It.envMapIntensity.value=D.environmentIntensity),It.dfgLUT!==void 0&&(It.dfgLUT.value=Wv()),yi){if(pt.setValue(N,"toneMappingExposure",C.toneMappingExposure),ve.needsLights&&Xh(It,ns),ge&&z.fog===!0&&Re.refreshFogUniforms(It,ge),Re.refreshMaterialUniforms(It,z,ee,K,E.state.transmissionRenderTarget[x.id]),ve.needsLights&&ve.lightProbeGrid){const Mt=ve.lightProbeGrid;It.probesSH.value=Mt.texture,It.probesMin.value.copy(Mt.boundingBox.min),It.probesMax.value.copy(Mt.boundingBox.max),It.probesResolution.value.copy(Mt.resolution)}Ca.upload(N,Jc(ve),It,q)}if(z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(Ca.upload(N,Jc(ve),It,q),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&pt.setValue(N,"center",H.center),pt.setValue(N,"modelViewMatrix",H.modelViewMatrix),pt.setValue(N,"normalMatrix",H.normalMatrix),pt.setValue(N,"modelMatrix",H.matrixWorld),z.uniformsGroups!==void 0){const Mt=z.uniformsGroups;for(let bi=0,is=Mt.length;bi<is;bi++){const ed=Mt[bi];ie.update(ed,Rn),ie.bind(ed,Rn)}}return Rn}function Xh(x,D){x.ambientLightColor.needsUpdate=D,x.lightProbe.needsUpdate=D,x.sunLights.needsUpdate=D,x.sunLightShadows.needsUpdate=D,x.directionalLights.needsUpdate=D,x.directionalLightShadows.needsUpdate=D,x.pointLights.needsUpdate=D,x.pointLightShadows.needsUpdate=D,x.spotLights.needsUpdate=D,x.spotLightShadows.needsUpdate=D,x.rectAreaLights.needsUpdate=D,x.hemisphereLights.needsUpdate=D}function qh(x){return x.isMeshLambertMaterial||x.isMeshToonMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isShadowMaterial||x.isShaderMaterial&&x.lights===!0}this.getActiveCubeFace=function(){return J},this.getActiveMipmapLevel=function(){return X},this.getRenderTarget=function(){return re},this.setRenderTargetTextures=function(x,D,$){const z=V.get(x);z.__autoAllocateDepthBuffer=x.resolveDepthBuffer===!1,z.__autoAllocateDepthBuffer===!1&&(z.__useRenderToTexture=!1),V.get(x.texture).__webglTexture=D,V.get(x.depthTexture).__webglTexture=z.__autoAllocateDepthBuffer?void 0:$,z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(x,D){const $=V.get(x);$.__webglFramebuffer=D,$.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(x,D=0,$=0){re=x,J=D,X=$;let z=null,H=!1,ge=!1;if(x){const me=V.get(x);if(me.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(N.FRAMEBUFFER,me.__webglFramebuffer),se.copy(x.viewport),Ie.copy(x.scissor),Pe=x.scissorTest,_.viewport(se),_.scissor(Ie),_.setScissorTest(Pe),Y=-1;return}else if(me.__webglFramebuffer===void 0)q.setupRenderTarget(x);else if(me.__hasExternalTextures)q.rebindTextures(x,V.get(x.texture).__webglTexture,V.get(x.depthTexture).__webglTexture);else if(x.depthBuffer){const Xe=x.depthTexture;if(me.__boundDepthTexture!==Xe){if(Xe!==null&&V.has(Xe)&&(x.width!==Xe.image.width||x.height!==Xe.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");q.setupDepthRenderbuffer(x)}}const Se=x.texture;(Se.isData3DTexture||Se.isDataArrayTexture||Se.isCompressedArrayTexture)&&(ge=!0);const we=V.get(x).__webglFramebuffer;x.isWebGLCubeRenderTarget?(Array.isArray(we[D])?z=we[D][$]:z=we[D],H=!0):x.samples>0&&q.useMultisampledRTT(x)===!1?z=V.get(x).__webglMultisampledFramebuffer:Array.isArray(we)?z=we[$]:z=we,se.copy(x.viewport),Ie.copy(x.scissor),Pe=x.scissorTest}else se.copy(xe).multiplyScalar(ee).floor(),Ie.copy(Ye).multiplyScalar(ee).floor(),Pe=zt;if($!==0&&(z=G),_.bindFramebuffer(N.FRAMEBUFFER,z)&&_.drawBuffers(x,z),_.viewport(se),_.scissor(Ie),_.setScissorTest(Pe),H){const me=V.get(x.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+D,me.__webglTexture,$)}else if(ge){const me=D;for(let Se=0;Se<x.textures.length;Se++){const we=V.get(x.textures[Se]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+Se,we.__webglTexture,$,me)}}else if(x!==null&&$!==0){const me=V.get(x.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,me.__webglTexture,$)}Y=-1};function Qc(x){const D=V.get(x);return(D.__readFormat!==x.format||D.__readType!==x.type)&&(D.__readFormat=x.format,D.__readType=x.type,D.__formatReadable=A.textureFormatReadable(x.format),D.__typeReadable=A.textureTypeReadable(x.type)),D}this.readRenderTargetPixels=function(x,D,$,z,H,ge,ye,me=0){if(!(x&&x.isWebGLRenderTarget)){it("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Se=V.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&ye!==void 0&&(Se=Se[ye]),Se){_.bindFramebuffer(N.FRAMEBUFFER,Se);try{const we=x.textures[me],Xe=we.format,Ze=we.type;x.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+me);const Ee=Qc(we);if(Ee.__formatReadable===!1){it("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ee.__typeReadable===!1){it("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=x.width-z&&$>=0&&$<=x.height-H&&N.readPixels(D,$,z,H,he.convert(Xe),he.convert(Ze),ge)}finally{const we=re!==null?V.get(re).__webglFramebuffer:null;_.bindFramebuffer(N.FRAMEBUFFER,we)}}},this.readRenderTargetPixelsAsync=async function(x,D,$,z,H,ge,ye,me=0){if(!(x&&x.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Se=V.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&ye!==void 0&&(Se=Se[ye]),Se)if(D>=0&&D<=x.width-z&&$>=0&&$<=x.height-H){_.bindFramebuffer(N.FRAMEBUFFER,Se);const we=x.textures[me],Xe=we.format,Ze=we.type;x.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+me);const Ee=Qc(we);if(Ee.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ee.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const lt=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,lt),N.bufferData(N.PIXEL_PACK_BUFFER,ge.byteLength,N.STREAM_READ),N.readPixels(D,$,z,H,he.convert(Xe),he.convert(Ze),0),N.bindBuffer(N.PIXEL_PACK_BUFFER,null);const Ut=re!==null?V.get(re).__webglFramebuffer:null;_.bindFramebuffer(N.FRAMEBUFFER,Ut);const St=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await np(N,St,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,lt),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,ge),N.bindBuffer(N.PIXEL_PACK_BUFFER,null),N.deleteBuffer(lt),N.deleteSync(St),ge}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(x,D=null,$=0){const z=Math.pow(2,-$),H=Math.floor(x.image.width*z),ge=Math.floor(x.image.height*z),ye=D!==null?D.x:0,me=D!==null?D.y:0;q.setTexture2D(x,0),N.copyTexSubImage2D(N.TEXTURE_2D,$,0,0,ye,me,H,ge),_.unbindTexture()},this.copyTextureToTexture=function(x,D,$=null,z=null,H=0,ge=0){let ye,me,Se,we,Xe,Ze,Ee,lt,Ut;const St=x.isCompressedTexture?x.mipmaps[ge]:x.image;if($!==null)ye=$.max.x-$.min.x,me=$.max.y-$.min.y,Se=$.isBox3?$.max.z-$.min.z:1,we=$.min.x,Xe=$.min.y,Ze=$.isBox3?$.min.z:0;else{const It=Math.pow(2,-H);ye=Math.floor(St.width*It),me=Math.floor(St.height*It),x.isDataArrayTexture?Se=St.depth:x.isData3DTexture?Se=Math.floor(St.depth*It):Se=1,we=0,Xe=0,Ze=0}z!==null?(Ee=z.x,lt=z.y,Ut=z.z):(Ee=0,lt=0,Ut=0);const _t=he.convert(D.format),Qt=he.convert(D.type);let ve;D.isData3DTexture?(q.setTexture3D(D,0),ve=N.TEXTURE_3D):D.isDataArrayTexture||D.isCompressedArrayTexture?(q.setTexture2DArray(D,0),ve=N.TEXTURE_2D_ARRAY):(q.setTexture2D(D,0),ve=N.TEXTURE_2D),_.activeTexture(N.TEXTURE0),_.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,D.flipY),_.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),_.pixelStorei(N.UNPACK_ALIGNMENT,D.unpackAlignment);const an=_.getParameter(N.UNPACK_ROW_LENGTH),st=_.getParameter(N.UNPACK_IMAGE_HEIGHT),Rn=_.getParameter(N.UNPACK_SKIP_PIXELS),qn=_.getParameter(N.UNPACK_SKIP_ROWS),yi=_.getParameter(N.UNPACK_SKIP_IMAGES);_.pixelStorei(N.UNPACK_ROW_LENGTH,St.width),_.pixelStorei(N.UNPACK_IMAGE_HEIGHT,St.height),_.pixelStorei(N.UNPACK_SKIP_PIXELS,we),_.pixelStorei(N.UNPACK_SKIP_ROWS,Xe),_.pixelStorei(N.UNPACK_SKIP_IMAGES,Ze);const ns=x.isDataArrayTexture||x.isData3DTexture,pt=D.isDataArrayTexture||D.isData3DTexture;if(x.isDepthTexture){const It=V.get(x),Mi=V.get(D),Mt=V.get(It.__renderTarget),bi=V.get(Mi.__renderTarget);_.bindFramebuffer(N.READ_FRAMEBUFFER,Mt.__webglFramebuffer),_.bindFramebuffer(N.DRAW_FRAMEBUFFER,bi.__webglFramebuffer);for(let is=0;is<Se;is++)ns&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,V.get(x).__webglTexture,H,Ze+is),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,V.get(D).__webglTexture,ge,Ut+is)),N.blitFramebuffer(we,Xe,ye,me,Ee,lt,ye,me,N.DEPTH_BUFFER_BIT,N.NEAREST);_.bindFramebuffer(N.READ_FRAMEBUFFER,null),_.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(H!==0||x.isRenderTargetTexture||V.has(x)){const It=V.get(x),Mi=V.get(D);_.bindFramebuffer(N.READ_FRAMEBUFFER,O),_.bindFramebuffer(N.DRAW_FRAMEBUFFER,k);for(let Mt=0;Mt<Se;Mt++)ns?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,It.__webglTexture,H,Ze+Mt):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,It.__webglTexture,H),pt?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Mi.__webglTexture,ge,Ut+Mt):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,Mi.__webglTexture,ge),H!==0?N.blitFramebuffer(we,Xe,ye,me,Ee,lt,ye,me,N.COLOR_BUFFER_BIT,N.NEAREST):pt?N.copyTexSubImage3D(ve,ge,Ee,lt,Ut+Mt,we,Xe,ye,me):N.copyTexSubImage2D(ve,ge,Ee,lt,we,Xe,ye,me);_.bindFramebuffer(N.READ_FRAMEBUFFER,null),_.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else pt?x.isDataTexture||x.isData3DTexture?N.texSubImage3D(ve,ge,Ee,lt,Ut,ye,me,Se,_t,Qt,St.data):D.isCompressedArrayTexture?N.compressedTexSubImage3D(ve,ge,Ee,lt,Ut,ye,me,Se,_t,St.data):N.texSubImage3D(ve,ge,Ee,lt,Ut,ye,me,Se,_t,Qt,St):x.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,ge,Ee,lt,ye,me,_t,Qt,St.data):x.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,ge,Ee,lt,St.width,St.height,_t,St.data):N.texSubImage2D(N.TEXTURE_2D,ge,Ee,lt,ye,me,_t,Qt,St);_.pixelStorei(N.UNPACK_ROW_LENGTH,an),_.pixelStorei(N.UNPACK_IMAGE_HEIGHT,st),_.pixelStorei(N.UNPACK_SKIP_PIXELS,Rn),_.pixelStorei(N.UNPACK_SKIP_ROWS,qn),_.pixelStorei(N.UNPACK_SKIP_IMAGES,yi),ge===0&&D.generateMipmaps&&N.generateMipmap(ve),_.unbindTexture()},this.initRenderTarget=function(x){V.get(x).__webglFramebuffer===void 0&&q.setupRenderTarget(x)},this.initTexture=function(x){x.isCubeTexture?q.setTextureCube(x,0):x.isData3DTexture?q.setTexture3D(x,0):x.isDataArrayTexture||x.isCompressedArrayTexture?q.setTexture2DArray(x,0):q.setTexture2D(x,0),_.unbindTexture()},this.resetState=function(){J=0,X=0,re=null,_.reset(),_e.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ei}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=tt._getDrawingBufferColorSpace(e),t.unpackColorSpace=tt._getUnpackColorSpace()}}const _u={type:"change"},Ic={type:"start"},Ih={type:"end"},_a=new Lr,vu=new kn,qv=Math.cos(70*rp.DEG2RAD),Ht=new P,_n=2*Math.PI,ht={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Jo=1e-6;class Yv extends Yp{constructor(e,t=null){super(e,t),this.state=ht.NONE,this.target=new P,this.cursor=new P,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Ps.ROTATE,MIDDLE:Ps.DOLLY,RIGHT:Ps.PAN},this.touches={ONE:Es.ROTATE,TWO:Es.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new P,this._lastQuaternion=new Di,this._lastTargetPosition=new P,this._quat=new Di().setFromUnitVectors(e.up,new P(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new ic,this._sphericalDelta=new ic,this._scale=1,this._panOffset=new P,this._rotateStart=new Ae,this._rotateEnd=new Ae,this._rotateDelta=new Ae,this._panStart=new Ae,this._panEnd=new Ae,this._panDelta=new Ae,this._dollyStart=new Ae,this._dollyEnd=new Ae,this._dollyDelta=new Ae,this._dollyDirection=new P,this._mouse=new Ae,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Zv.bind(this),this._onPointerDown=Kv.bind(this),this._onPointerUp=Jv.bind(this),this._onContextMenu=sx.bind(this),this._onMouseWheel=ex.bind(this),this._onKeyDown=tx.bind(this),this._onTouchStart=nx.bind(this),this._onTouchMove=ix.bind(this),this._onMouseDown=jv.bind(this),this._onMouseMove=Qv.bind(this),this._interceptControlDown=rx.bind(this),this._interceptControlUp=ax.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=ht.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();const e=this.domElement.getRootNode();e.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),e.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(_u),this.update(),this.state=ht.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){const t=this.object.position;Ht.copy(t).sub(this.target),Ht.applyQuaternion(this._quat),this._spherical.setFromVector3(Ht),this.autoRotate&&this.state===ht.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=_n:i>Math.PI&&(i-=_n),s<-Math.PI?s+=_n:s>Math.PI&&(s-=_n),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(Ht.setFromSpherical(this._spherical),Ht.applyQuaternion(this._quatInverse),t.copy(this.target).add(Ht),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){const o=Ht.length();a=this._clampDistance(o*this._scale);const l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){const o=new P(this._mouse.x,this._mouse.y,0);o.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;const c=new P(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=Ht.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(_a.origin.copy(this.object.position),_a.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(_a.direction))<qv?this.object.lookAt(this.target):(vu.setFromNormalAndCoplanarPoint(this.object.up,this.target),_a.intersectPlane(vu,this.target))))}else if(this.object.isOrthographicCamera){const a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Jo||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Jo||this._lastTargetPosition.distanceToSquared(this.target)>Jo?(this.dispatchEvent(_u),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?_n/60*this.autoRotateSpeed*e:_n/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Ht.setFromMatrixColumn(t,0),Ht.multiplyScalar(-e),this._panOffset.add(Ht)}_panUp(e,t){this.screenSpacePanning===!0?Ht.setFromMatrixColumn(t,1):(Ht.setFromMatrixColumn(t,0),Ht.crossVectors(this.object.up,Ht)),Ht.multiplyScalar(e),this._panOffset.add(Ht)}_pan(e,t){const i=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;Ht.copy(s).sub(this.target);let r=Ht.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/i.clientHeight,this.object.matrix),this._panUp(2*t*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const i=this.domElement.getBoundingClientRect(),s=e-i.left,r=t-i.top,a=i.width,o=i.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(_n*this._rotateDelta.x/t.clientHeight),this._rotateUp(_n*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(_n*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-_n*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(_n*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-_n*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(i,s)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const i=this._getSecondPointerPosition(e),s=.5*(e.pageX+i.x),r=.5*(e.pageY+i.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(_n*this._rotateDelta.x/t.clientHeight),this._rotateUp(_n*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Ae,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}}function Kv(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function Zv(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function Jv(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Ih),this.state=ht.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function jv(n){let e;switch(n.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Ps.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=ht.DOLLY;break;case Ps.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=ht.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=ht.ROTATE}break;case Ps.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=ht.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=ht.PAN}break;default:this.state=ht.NONE}this.state!==ht.NONE&&this.dispatchEvent(Ic)}function Qv(n){switch(this.state){case ht.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case ht.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case ht.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function ex(n){this.enabled===!1||this.enableZoom===!1||this.state!==ht.NONE||(n.preventDefault(),this.dispatchEvent(Ic),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(Ih))}function tx(n){this.enabled!==!1&&this._handleKeyDown(n)}function nx(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case Es.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=ht.TOUCH_ROTATE;break;case Es.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=ht.TOUCH_PAN;break;default:this.state=ht.NONE}break;case 2:switch(this.touches.TWO){case Es.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=ht.TOUCH_DOLLY_PAN;break;case Es.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=ht.TOUCH_DOLLY_ROTATE;break;default:this.state=ht.NONE}break;default:this.state=ht.NONE}this.state!==ht.NONE&&this.dispatchEvent(Ic)}function ix(n){switch(this._trackPointer(n),this.state){case ht.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case ht.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case ht.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case ht.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=ht.NONE}}function sx(n){this.enabled!==!1&&n.preventDefault()}function rx(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function ax(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}const F=n=>{const e=document.getElementById(n);if(!e)throw new Error(`Missing 3D element: ${n}`);return e},Et=n=>String(n??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e),oe=(n,e=2)=>typeof n=="number"&&Number.isFinite(n)?n.toLocaleString(void 0,{maximumFractionDigits:e}):"—",br=n=>Math.abs(n)>0&&Math.abs(n)<.001?n.toExponential(3):oe(n,5),ox="OGLE-BLG-LPV-096697",lx=matchMedia("(prefers-reduced-motion: reduce)").matches;F("space-lab").innerHTML=`
  <div class="section-heading"><div><p class="eyebrow">THE CATALOGUE BECOMES A PLACE. THE COMPUTATION BECOMES A SHAPE.</p><h2>The 3D Observatory <span class="count-label">Every record has a viewpoint.</span></h2></div><span class="data-badge"><span class="status-dot"></span>C++ geometry · Python evidence · local WebGL</span></div>
  <p class="space-intro">Fly around the observed sky. Select any catalogue entry, enter its normalized star model, and explore survey density, measured workers, and computed frequency landscapes. Each view tells you exactly what its geometry means.</p>
  <div class="space-layout">
    <article class="card space-world">
      <div class="space-tabs" role="group" aria-label="Choose a three-dimensional view">
        <button type="button" data-space-view="sky" aria-pressed="true">Celestial sphere</button><button type="button" data-space-view="density" aria-pressed="false">Survey density</button><button type="button" data-space-view="period" aria-pressed="false">Period depth</button><button type="button" data-space-view="distance" aria-pressed="false">Candidate distances</button><button type="button" data-space-view="star" aria-pressed="false">Star reconstruction</button><button type="button" data-space-view="workers" aria-pressed="false">Compute cluster</button><button type="button" data-space-view="surface" aria-pressed="false">Math landscape</button>
      </div>
      <div class="space-viewport" id="space-viewport">
        <canvas id="space-canvas" tabindex="0" aria-label="Interactive 3D Mira sky. Drag to orbit, pinch or scroll to zoom. Use the record list and view controls for keyboard selection."></canvas>
        <div class="space-hud"><span id="space-view-label">CELESTIAL SPHERE / J2000 DIRECTIONS</span><strong id="space-hud-count">Opening the full catalogue…</strong></div>
        <div id="space-webgl-message" class="space-webgl-message" role="status" hidden></div>
        <div class="space-view-tools"><button type="button" id="space-reset" title="Reset this view">↺ Reset camera</button><button type="button" id="space-play" aria-pressed="false">▶ Orbit</button><button type="button" id="space-fullscreen">⛶ Expand</button></div>
        <div class="space-bottom-hud"><span id="space-render-status">Loading catalogue geometry</span><span id="space-gesture">Drag to orbit · scroll / pinch to zoom · tap a point</span></div>
      </div>
      <div class="space-options" id="space-map-options"><label>Coordinate frame<select id="space-frame"><option value="equatorial">Equatorial · RA / Dec</option><option value="galactic">Galactic · l / b</option></select></label><label class="space-check"><input id="space-grid" type="checkbox" checked>Coordinate grid</label><label class="space-check"><input id="space-groups" type="checkbox" checked>Survey centroids</label><label>Point size<input id="space-point-size" type="range" min="1" max="5" step=".25" value="2.25"></label><button id="space-export-sky" type="button" class="export-button">Geometry + sources JSON ↓</button></div>
      <div id="space-star-options" class="space-options" hidden><label>Cycle phase <strong id="space-phase-label">0.00</strong><input id="space-phase" type="range" min="0" max="1" step=".002" value="0"></label><label class="space-check"><input id="space-cutaway" type="checkbox">Reveal schematic layers</label><label class="space-check"><input id="space-wireframe" type="checkbox">Mesh edges</label><button id="space-model-fit" type="button" class="export-button">Infer from measured brightness</button></div>
      <div id="space-inference" class="space-inference" hidden><h4>One light curve. A family of 3D explanations.</h4><p>The native radiative model partitions measured flux changes between normalized radius and temperature at your assumed reference temperature T₀. Compare conditional hypotheses that reproduce the same observed brightness. Further measurements are needed to identify which geometry describes the star.</p><div class="space-hypotheses" role="group" aria-label="Choose a conditional radiative hypothesis"><button type="button" data-radius-fraction="0" aria-pressed="false">Fixed radius<br>Changing temperature</button><button type="button" data-radius-fraction="0.5" aria-pressed="true">Mixed<br>Radius + temperature</button><button type="button" data-radius-fraction="1" aria-pressed="false">Fixed temperature<br>Changing radius</button></div><label class="space-inference-slider">Fraction of flux change assigned to radius <strong id="space-radius-fraction-label">0.50</strong><input id="space-radius-fraction" type="range" min="0" max="1" step=".05" value=".5"></label><label class="space-reference-temperature">Assumed reference temperature T₀ / K<input id="space-reference-temperature" type="number" min="1500" max="10000" step="any" value="3000" required></label><div class="space-radiative-metrics"><span>CONDITIONAL RADIUS / R₀<strong id="space-radiative-radius">—</strong></span><span>CONDITIONAL T / K<strong id="space-radiative-temperature">—</strong></span><span>RECONSTRUCTED FLUX / F₀<strong id="space-radiative-flux">—</strong></span></div><div id="space-inference-chart"></div><p id="space-inference-status">Select a star and infer from available photometry to build this family.</p></div>
      <div id="space-distance-options" class="space-options" hidden><button id="space-refresh-distances" type="button" class="export-button">Reload acquired Gaia candidates</button><span id="space-distance-scale">Physical coordinate scale pending evidence</span></div>
      <div id="space-surface-options" class="space-options" hidden><label>Computed surface<select id="space-surface-kind"><option value="chirp">Frequency × frequency derivative</option><option value="localized">Time × frequency</option></select></label><label>Vertical scale<input id="space-height" type="range" min="1" max="5" step=".1" value="1"></label><button id="space-run-transform" type="button" class="export-button">Run current foundry experiment ↗</button></div>
      <div id="space-worker-options" class="space-options" hidden><button id="space-run-cluster" type="button" class="export-button">Run a real cluster experiment ↗</button><span>Nodes represent measured processes and their coordinator.</span></div>
      <p class="space-geometry-note" id="space-geometry-note">Directions lie on a unit celestial sphere. Shell radius is a display scale; individual distances are unavailable in this catalogue.</p>
      <div id="space-surface-readout" class="space-surface-readout" hidden><p id="space-cell-value" aria-live="polite"></p><label>Frequency column<input id="space-cell-frequency" type="range" min="0" max="0" step="1" value="0"></label><label>Second coordinate<input id="space-cell-row" type="range" min="0" max="0" step="1" value="0"></label></div>
      <div id="space-worker-ledger" class="space-worker-ledger" hidden></div>
    </article>
    <aside class="space-sidebar">
      <article class="card space-finder"><div class="card-heading"><div><p class="eyebrow">FIND YOUR PLACE IN THE SKY</p><h3>Every entry, reachable</h3></div></div><div class="space-sidebar-body">
        <label>Star name / catalogue ID<input id="space-search" type="search" placeholder="Mira, R Leo, OGLE…" autocomplete="off"></label>
        <div class="space-filter-pair"><label>Catalogue<select id="space-catalogue"><option value="">All catalogues</option></select></label><label>Survey region<select id="space-region"><option value="">All regions</option></select></label></div>
        <div class="space-filter-pair"><label>Minimum period / days<input id="space-min-period" type="number" min="0" placeholder="Any"></label><label>Maximum period / days<input id="space-max-period" type="number" min="0" placeholder="Any"></label></div>
        <div class="space-match-line"><strong id="space-match-count">Loading records</strong><button id="space-clear-filters" type="button">Reset</button></div>
        <div id="space-record-list" class="space-record-list" role="group" aria-label="Catalogue records; use previous and next to browse all matches"><p>Catalogue geometry is loading…</p></div>
        <div class="space-list-pages"><button id="space-prev-records" type="button" disabled>← Previous</button><span id="space-list-page">—</span><button id="space-next-records" type="button" disabled>Next →</button></div>
      </div></article>
      <article class="card space-selected"><div class="card-heading"><div><p class="eyebrow">A RECORD. A MODEL. AN OPEN QUESTION.</p><h3 id="space-star-name">Choose a star</h3></div><span class="subtle-pill amber-pill" id="space-selected-badge">Catalogue</span></div><div class="space-sidebar-body" id="space-inspector"><p class="space-muted">Tap any point or choose a catalogue record. The model is available for every entry; missing measurements stay visible.</p></div></article>
    </aside>
  </div>
  <div class="space-ledger" id="space-ledger"><span>Preparing native geometry…</span></div>
  <details class="space-evidence"><summary>What is real in these three dimensions? <span>+</span></summary><div><p>The sky uses published angular positions. Period depth encodes the period as a radial coordinate. Density describes catalogue coverage per steradian. Survey groups describe observing regions. Their centroids are directional summaries; they do not identify gravitational star clusters.</p><p>Star meshes have a normalized radius and schematic layers. A measured light curve can drive relative brightness; brightness alone does not determine a radius, temperature, mass, or interior. The compute graph uses actual process receipts. Math surfaces use the native search matrices and show missing cells as gaps.</p><div id="space-provenance"></div><ul id="space-caveats"></ul></div></details>
`;let Fe=null,Sn=[],Zn=0;const ir=8;let At=-1,Sr=null,ze=null,Pa=0,jo=!1,va=!1,Qe="sky",un=null,hi=null,xu=null,ur=null,vn=null,Ni=null,Ya=0,Ka=1350,Za=1;const ac=new Map,yu=new Set;let hr="",Pt=null,Gn,Xt,fi,Ve,pi,Is,Ns=null,Er=null,Ri=[],Pn=null,ni=null,Xi=null,Qn=null,Pi=null,Tr=null,Us=null,qi=null,Nh=[];const bs=new qp,Mu=new Ae;let oc=!0,Jt=!0,Yi=!1,Qo=0,el=0,tl=0,bu=0,xn={row:0,frequency:0};function Wn(n){F("space-render-status").textContent=n}function Uh(n){n.traverse(e=>{if(e instanceof Tt||e instanceof vh||e instanceof to||e instanceof Cc||e instanceof gh){e.geometry?.dispose();const t=Array.isArray(e.material)?e.material:[e.material];for(const i of t)"map"in i&&i.map instanceof Zt&&i.map.dispose(),i.dispose()}})}function cx(){Uh(Ve),fi.remove(Ve),Ve=new ti,fi.add(Ve),Ns=null,Er=null,Pn=null,ni=null,Xi=null,Qn=null,Pi=null,Tr=null,Us=null,qi=null,pi=new ti,Is=new ti}function hn(n,e="#a1b2c9",t=3.5){const i=document.createElement("canvas");i.width=640,i.height=112;const s=i.getContext("2d");s&&(s.fillStyle="rgba(3,10,21,.8)",s.fillRect(0,0,i.width,i.height),s.font="42px system-ui",s.textAlign="center",s.textBaseline="middle",s.fillStyle=e,s.fillText(n,i.width/2,i.height/2,i.width-24));const r=new Dp(i),a=new gh(new ph({map:r,transparent:!0,depthWrite:!1}));return a.scale.set(t,t*i.height/i.width,1),a}function wr(n,e,t=.4){return new Cc(new Dt().setFromPoints(n),new Dr({color:e,transparent:!0,opacity:t}))}function nl(n,e){const t=n*Math.PI/180,i=e*Math.PI/180;return new P(Math.cos(i)*Math.cos(t),Math.sin(i),-Math.cos(i)*Math.sin(t))}function Fh(){for(let i=-60;i<=60;i+=30){const s=Array.from({length:145},(r,a)=>nl(a*2.5,i).multiplyScalar(10));pi.add(wr(s,i===0?5479610:3229539,i===0?.48:.2))}for(let i=0;i<360;i+=30)pi.add(wr(Array.from({length:73},(s,r)=>nl(i,-90+r*2.5).multiplyScalar(10)),3229539,.2));const e=F("space-frame").value==="galactic";for(let i=0;i<360;i+=90){const s=`${e?"l":"RA"} ${i}°`,r=hn(s,"#8cacc5",2.5);r.position.copy(nl(i,0).multiplyScalar(10*1.06)),pi.add(r)}const t=hn(e?"b +90°":"Dec +90°","#8cacc5",2.5);t.position.set(0,11.1,0),pi.add(t),pi.visible=F("space-grid").checked,Ve.add(pi)}function dx(n){const e=n.period_days;return!e||!Number.isFinite(e)?new ke("#728298"):new ke().setHSL(.49+Math.min(1,Math.max(0,(Math.log10(e)-1.8)/1.4))*.28,.64,.66)}function Nc(n){if(!Fe)return new P;const t=(F("space-frame").value==="galactic"?Fe.galactic_positions:Fe.positions)[n];if(!t?.every(Number.isFinite))return new P;const i=Qe==="period"&&Fe.stars[n].period_days?6+Math.min(1,Math.max(0,Math.log10(Fe.stars[n].period_days)/Math.log10(1e5)))*8:10;return new P(t[0],t[1],t[2]).multiplyScalar(i)}function ux(){if(!Fe)return;Ri=Sn.filter(i=>Fe.positions[i]?.every(Number.isFinite));const n=new Float32Array(Ri.length*3),e=new Float32Array(Ri.length*3);for(let i=0;i<Ri.length;i++){const s=Nc(Ri[i]),r=dx(Fe.stars[Ri[i]]);n.set(s.toArray(),i*3),e.set(r.toArray(),i*3)}const t=new Dt;if(t.setAttribute("position",new rn(n,3)),t.setAttribute("color",new rn(e,3)),Er=new $n({uniforms:{size:{value:Number(F("space-point-size").value)*(Pt?.getPixelRatio()??1)}},vertexShader:"attribute vec3 color; varying vec3 tint; uniform float size; void main(){ tint=color; gl_PointSize=size; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",fragmentShader:"varying vec3 tint; void main(){ float r=length(gl_PointCoord-vec2(.5)); if(r>.5)discard; float a=smoothstep(.5,.05,r); gl_FragColor=vec4(tint,a); }",transparent:!0,depthWrite:!1,blending:fl}),Ns=new vh(t,Er),Ns.renderOrder=1,Ve.add(Ns),Fh(),F("space-frame").value==="equatorial")for(const i of Fe.groups){if(i.centroid.length!==3||!i.centroid.every(Number.isFinite))continue;const s=new P(...i.centroid).normalize().multiplyScalar(10.6),r=hn(`${i.name} · ${oe(i.count,0)}`,"#b6a2ed",3.8);r.position.copy(s),Is.add(r)}Is.visible=F("space-groups").checked,Ve.add(Is),Oh()}function Oh(){if(!Fe||!Pt||!["sky","period"].includes(Qe)||(Pn&&(Ve.remove(Pn),Uh(Pn),Pn=null),At<0||!Sn.includes(At)||!Fe.positions[At]))return;Pn=new ti;const n=new Tt(new si(.11,16,12),new pn({color:16763537}));Pn.add(n);const e=new Tt(new io(.19,.23,40),new pn({color:16759413,side:yn,transparent:!0,opacity:.85}));Pn.add(e),Pn.position.copy(Nc(At)),Ve.add(Pn),Jt=!0}function hx(n,e){const t=Number(n.geometry.longitude_bins),i=Number(n.geometry.latitude_bins),s=new Uint32Array(t*i);for(const r of e){const a=n.stars[r];if(!n.positions[r]||a.ra_deg===null||a.dec_deg===null||!Number.isFinite(a.ra_deg)||!Number.isFinite(a.dec_deg)||a.dec_deg<-90||a.dec_deg>90)continue;let o=a.ra_deg%360;o<0&&(o+=360);const l=Math.min(t-1,Math.floor(o/360*t)),c=Math.min(i-1,Math.floor((a.dec_deg+90)/180*i));s[c*t+l]++}return n.density_cells.map(r=>{const a=s[r.latitude_index*t+r.longitude_index];return{...r,count:a,density_per_sr:a/r.solid_angle_sr}})}function fx(){if(!Fe)return;Fh();const n=hx(Fe,Sn);Nh=n;const e=Math.max(1,...n.map(a=>a.density_per_sr));qi=new Cp(new Pc(.06,.13,1,6),new pn({color:16777215,transparent:!0,opacity:.8}),n.length);const t=new kt,i=new P(0,1,0);for(let a=0;a<n.length;a++){const o=n[a],l=new P(o.x,o.y,o.z).normalize(),c=Math.log1p(o.density_per_sr)/Math.log1p(e),p=.005+c*4;t.position.copy(l).multiplyScalar(10+p/2),t.quaternion.setFromUnitVectors(i,l),t.scale.set(1,p,1),t.updateMatrix(),qi.setMatrixAt(a,t.matrix),qi.setColorAt(a,new ke().setHSL(.52+c*.21,.68,.45+c*.18))}Ve.add(qi),Ve.add(new Tt(new si(9.98,48,32),new pn({color:463392,transparent:!0,opacity:.85})));const s=n.reduce((a,o)=>a+o.count,0),r=n.filter(a=>a.count>0).length;F("space-hud-count").textContent=`${oe(s,0)} filtered mapped entries · ${oe(r,0)} populated / ${oe(n.length,0)} angular cells`,F("space-geometry-note").textContent=`Current filter: ${oe(Sn.length,0)} matching entries, ${oe(s,0)} with coordinates. Counts and entries per steradian use these matches on the native equatorial grid. Heights are normalized to this filter’s density maximum; zero-count cells retain a display marker. ${Ar.density[1]}`}function px(){let n;ze?.mesh?.positions.length&&ze.mesh.indices.length?(n=new Dt,n.setAttribute("position",new gt(ze.mesh.positions.map(s=>s*4),3)),n.setIndex(ze.mesh.indices),ze.mesh.normals?.length?n.setAttribute("normal",new gt(ze.mesh.normals,3)):n.computeVertexNormals(),Za=ze.selected_model?.radius_relative??fr(ze.radiative_family?.radii_relative,ze.selected_phase??0)??1):(n=new si(4,96,64),Za=1);const e=new Float32Array(n.attributes.position.count*3);for(let s=0;s<n.attributes.position.count;s++){const a=.54+.08*n.attributes.position.getY(s)/4;e.set(new ke().setHSL(.065,.8,a).toArray(),s*3)}n.setAttribute("color",new rn(e,3)),ni=new Tt(n,new kp({vertexColors:!0,side:yn,clippingPlanes:[],shininess:8,specular:new ke("#754c2a"),emissive:new ke("#522107"),emissiveIntensity:.28})),Ve.add(ni),Qn=new to(new Mh(n),new Dr({color:16764547,transparent:!0,opacity:.14})),Ve.add(Qn),Xi=new Tt(new si(4.2,48,32),new pn({color:13658943,transparent:!0,opacity:.08,side:fn,depthWrite:!1})),Ve.add(Xi),Pi=new ti;for(const[s,r]of[[2.95,13126216],[1.7,16104309],[.65,16769709]])Pi.add(new Tt(new si(s,48,32),new pn({color:r,side:yn})));Ve.add(Pi);const t=[hn(ze?.radiative_family?"CONDITIONAL RADIUS · MEASURED FLUX MODEL":"NORMALIZED PHOTOSPHERE · R = 1","#ffc184",5.3),hn("SCHEMATIC INTERIOR · UNMEASURED","#a99bc8",5.3)];t[0].position.set(0,5,0),t[1].position.set(0,-5,0),Ve.add(...t);const i=new Tt(new io(4.8,4.83,120),new pn({color:6988980,side:yn,transparent:!0,opacity:.5}));i.rotation.x=Math.PI/2,Ve.add(i),ao()}function $s(){return ze?.phase_curve??ze?.phase_model??ze?.fit?.phase_model??ze?.photometry?.phase_curve??ze?.photometry?.phase_model??[]}function mx(n){const e=$s();if(!e.length)return null;const t=Math.min(e.length-1,Math.floor(n*(e.length-1))),i=Math.min(e.length-1,t+1),s=e[t],r=e[i],a=r.phase>s.phase?(n-s.phase)/(r.phase-s.phase):0;return s.magnitude+Math.max(0,Math.min(1,a))*(r.magnitude-s.magnitude)}function fr(n,e){if(!n?.length)return null;const t=$s(),i=Math.min(n.length-1,Math.floor(e*(n.length-1))),s=Math.min(n.length-1,i+1),r=t[i]?.phase??i/Math.max(1,n.length-1),a=t[s]?.phase??s/Math.max(1,n.length-1),o=a>r?Math.max(0,Math.min(1,(e-r)/(a-r))):0;return n[i]+o*(n[s]-n[i])}function ao(){const n=Number(F("space-phase").value),e=F("space-cutaway").checked;if(F("space-phase-label").textContent=oe(n,2),ni){const t=ni.material;t.clippingPlanes=e?[new kn(new P(1,0,0),0)]:[];const i=mx(n),s=$s(),r=s.length?Math.min(...s.map(u=>u.magnitude)):0,a=i===null?1:Math.pow(10,-.4*(i-r)),o=fr(ze?.radiative_family?.radii_relative,n),l=fr(ze?.radiative_family?.temperatures_k,n),c=fr(ze?.radiative_family?.reconstructed_fluxes,n),p=(o??1)/Za;ni.scale.setScalar(p),l!==null?t.color.setHSL(Math.max(0,Math.min(.13,(l-1800)/25e3)),.38,.45+.3*a):t.color.setRGB(.15+.85*a,.15+.85*a,.15+.85*a),Xi&&(Xi.material.opacity=.025+.09*a),Xi&&Xi.scale.setScalar(o??1),Qn&&Qn.scale.copy(ni.scale),Pi&&Pi.scale.setScalar(o??1),F("space-radiative-radius").textContent=oe(o,4),F("space-radiative-temperature").textContent=oe(l,1),F("space-radiative-flux").textContent=oe(c,4),Qe==="star"&&o!==null&&l!==null&&(F("space-hud-count").textContent=`${Fe?.stars[At]?.name??"Selected star"} · R/R₀ ${oe(o,3)} · conditional T ${oe(l,0)} K`);const m=document.getElementById("space-model-brightness");m&&(m.textContent=i===null?ze?"Measured phase evidence is unavailable for this entry; normalized geometry remains a template.":"Phase evidence is not loaded; normalized geometry remains a template.":`Phase ${oe(n)} · ${oe(i,3)} mag · ${oe(a*100,1)}% of brightest fitted flux`)}Qn&&(Qn.visible=F("space-wireframe").checked,Qn.material.clippingPlanes=e?[new kn(new P(1,0,0),0)]:[]),Pi&&(Pi.visible=e),Jt=!0}function gx(){const n=ur?.items??[],e=Math.max(1,...n.map(o=>o.distance_p84_pc)),t=12/e,i=new qa(28,14,3295589,1254203);i.position.y=-5,Ve.add(i),[new P(14,0,0),new P(0,14,0),new P(0,0,14)].forEach((o,l)=>{Ve.add(wr([o.clone().negate(),o],[6785739,5814953,12222885][l],.65));const c=hn(`${["X","Y","Z"][l]} / pc`,"#9db7d2",3);c.position.copy(o),Ve.add(c)});const r=new Tt(new si(.15,16,12),new pn({color:16777215}));Ve.add(r);const a=hn("OBSERVER / ORIGIN","#aebcd1",3.5);a.position.set(0,-.65,0),Ve.add(a);for(const o of n){if(!o.position_pc.every(Number.isFinite)||!o.direction.every(Number.isFinite))continue;const l=new P(...o.position_pc).multiplyScalar(t),c=new P(...o.direction),p=wr([c.clone().multiplyScalar(o.distance_p16_pc*t),c.clone().multiplyScalar(o.distance_p84_pc*t)],o.quality_flags.length?14192737:10851042,.8);Ve.add(p);const m=new Tt(new si(.18,20,12),new pn({color:o.quality_flags.length?15115636:12100591}));m.position.copy(l),m.userData.star_id=o.star_id,Ve.add(m);const u=hn(`${o.name} · ${oe(o.distance_median_pc,0)} pc`,"#bfcde1",5.5);u.position.copy(l).add(new P(0,.55,0)),Ve.add(u)}F("space-hud-count").textContent=`${oe(n.length,0)} unconfirmed positional associations · radial 16–84% intervals`,F("space-distance-scale").textContent=`One scene unit = ${oe(1/t,1)} pc · uniform Cartesian scale`,F("space-worker-ledger").hidden=!1,F("space-worker-ledger").innerHTML=n.length?`<p>Gaia DR3 positional candidates; source associations are unconfirmed. Distances are conditional on the parallax likelihood and an exponentially decreasing space-density prior of ${oe(ur?.prior_length_pc,0)} pc. Integration support: 0.001–20,000 pc.</p><table><thead><tr><th>POSITIONAL CANDIDATE</th><th>MEDIAN / pc</th><th>16–84% / pc</th></tr></thead><tbody>${n.map(o=>`<tr><td>${Et(o.name)}<small>Gaia ${Et(o.source_id)} · ${oe(o.separation_arcsec,2)}″ separation</small><small>${Et(o.quality_flags.join("; ")||"No quoted quality flag")}</small></td><td>${oe(o.distance_median_pc,0)}</td><td>${oe(o.distance_p16_pc,0)}–${oe(o.distance_p84_pc,0)}</td></tr>`).join("")}</tbody></table><ul class="space-distance-caveats">${ur?.caveats.map(o=>`<li>${Et(o)}</li>`).join("")??""}</ul>`:"<p>Acquire Gaia evidence for a selected star. A positional match requires identity and astrometric-quality review before treating it as the Mira distance.</p>"}function lc(n){const e=n.provenance?.name?.trim(),t=n.provenance?.star_id?.trim();return e&&t&&e!==t?`${e} (${t})`:e||t||"Source in the Transform Foundry report"}function _x(){const n=hi?.node_results??un?.ensemble.workers??[],e=hi?.node_results?hi.name||hi.star_id||"Source in the cluster experiment report":un?lc(un):null,t=hi?.node_results?hi.band:un?.provenance.band,i=hi?.node_results?hi.time_system:un?.provenance.time_system,s=e?`Workload observations: ${e}${t?` · ${t} band`:""}${i?` · ${i}`:""}.`:"",r=new Tt(new Xa(1.2,2),new pn({color:15245417,wireframe:!0}));Ve.add(r);const a=hn("PYTHON COORDINATOR","#ffbe8a",4.4);a.position.set(0,1.9,0),Ve.add(a);for(let l=0;l<n.length;l++){const c=n[l],p=l/n.length*Math.PI*2,m=new P(Math.cos(p)*7,(l%2?-1:1)*1.8,Math.sin(p)*7),u=new Tt(new Xa(.65+Math.min(.5,c.tasks_completed/30),1),new pn({color:l%2?10652135:7135193,wireframe:!0}));u.position.copy(m),u.userData.worker=c,Ve.add(u),Ve.add(wr([new P,m],l%2?8942269:5019289,.7));const d=hn(`${c.hostname} / PID ${c.worker_pid}`,"#b6cbdd",4.7);d.position.copy(m).add(new P(0,1.4,0)),Ve.add(d);const g=hn(`${c.tasks_completed} tasks · ${oe(c.compute_seconds)} s`,"#95a6bc",3.8);g.position.copy(m).add(new P(0,-1.3,0)),Ve.add(g)}const o=new qa(22,22,3425375,1319480);o.position.y=-3,Ve.add(o),F("space-worker-ledger").innerHTML=n.length?`<p>${Et(s)}</p><table><thead><tr><th>HOST / PID</th><th>TASKS</th><th>COMPUTE / s</th></tr></thead><tbody>${n.map(l=>`<tr><td>${Et(l.hostname)}<small>PID ${Et(l.worker_pid)}${l.mpi_rank!==void 0?` · rank ${Et(l.mpi_rank)}`:""}</small></td><td>${oe(l.tasks_completed,0)}</td><td>${oe(l.compute_seconds,3)}</td></tr>`).join("")}</tbody></table>`:"<p>Run the cluster experiment or Transform Foundry to place actual process receipts here. The empty coordinator represents the workflow; no workers have been invented.</p>",F("space-hud-count").textContent=n.length?`${e??"Source in the experiment report"} · ${oe(n.length,0)} measured worker processes`:"Awaiting measured process receipts",s&&(F("space-geometry-note").textContent=`${s} ${Ar.workers[1]}`)}function Uc(){return F("space-surface-kind").value==="localized"?un?.localized:un?.chirp}function cc(){const n=un?.job_id;return n?`${n}:${F("space-surface-kind").value}`:null}async function vx(){const n=cc();if(!n||ac.has(n)||yu.has(n))return;yu.add(n);const[e,t]=n.split(":");try{const i=await Bt(`/api/space/surfaces/${encodeURIComponent(e)}?kind=${encodeURIComponent(t)}`);ac.set(n,i),hr="",Qe==="surface"&&cc()===n&&mn("surface",!1)}catch(i){hr=`Browser triangulation of native power matrix; native mesh endpoint unavailable: ${bt(i)}`,Qe==="surface"&&Wn(hr)}}function xx(){const n=un,e=Uc();if(!n||!e){const d=new qa(18,18,3425375,1319480);Ve.add(d);const g=hn("RUN A NATIVE GRID TO BUILD THIS LANDSCAPE","#9bb4cd",12);g.position.y=2,Ve.add(g),F("space-hud-count").textContent="Awaiting a computed transform matrix",F("space-surface-readout").hidden=!0;return}const t=e.powers.length,i=e.frequencies.length,s=new Float32Array(t*i*3),r=new Float32Array(t*i*3),a=[],o=Number(F("space-height").value);for(let d=0;d<t;d++)for(let g=0;g<i;g++){const y=e.powers[d][g],f=d*i+g;if(s.set([(g/Math.max(1,i-1)-.5)*16,(y??0)*5*o,(d/Math.max(1,t-1)-.5)*10],f*3),r.set(new ke().setHSL(.72-Math.max(0,Math.min(1,y??0))*.23,.65,.38+Math.max(0,Math.min(1,y??0))*.27).toArray(),f*3),d<t-1&&g<i-1){const h=f,M=f+1,R=f+i,b=R+1,S=(E,w)=>e.powers[E][w]!==null&&Number.isFinite(e.powers[E][w]);S(d,g)&&S(d,g+1)&&S(d+1,g)&&a.push(h,R,M),S(d,g+1)&&S(d+1,g)&&S(d+1,g+1)&&a.push(M,R,b)}}const l=ac.get(cc()??"");if(l&&l.mesh.positions.length===s.length){for(let d=0;d<l.mesh.positions.length;d+=3)s.set([l.mesh.positions[d]*8,l.mesh.positions[d+1]*5*o,l.mesh.positions[d+2]*5],d);a.length=0;for(const d of l.mesh.indices)a.push(d)}const c=new Dt;c.setAttribute("position",new rn(s,3)),c.setAttribute("color",new rn(r,3)),c.setIndex(a),c.computeVertexNormals(),Tr=new Tt(c,new pn({vertexColors:!0,side:yn,transparent:!0,opacity:.91})),Ve.add(Tr);const p=new to(new Mh(c),new Dr({color:9485783,transparent:!0,opacity:.12}));Ve.add(p);const m=new qa(20,20,4346730,1780544);Ve.add(m);for(let d=0;d<=2;d++){const g=Math.round(d/2*(i-1)),y=(d/2-.5)*16,f=hn(`${br(e.frequencies[g])} d⁻¹`,"#9bd1d9",3.5);f.position.set(y,-.45,6.1),Ve.add(f);const h=Math.round(d/2*(t-1)),M=F("space-surface-kind").value==="localized"?n.localized.time_centers_jd[h]:n.chirp.frequency_derivatives[h],R=hn(F("space-surface-kind").value==="localized"?`HJD ${oe(M,1)}`:`${br(M)} d⁻²`,"#baa7ed",4);R.position.set(10.6,-.45,(d/2-.5)*10),Ve.add(R)}const u=hn("HEIGHT = RELATIVE χ² IMPROVEMENT","#c0a5f3",7);u.position.set(0,6*o+.5,0),Ve.add(u),Us=new Tt(new si(.13,16,12),new pn({color:16760443})),Ve.add(Us),F("space-cell-frequency").max=String(i-1),F("space-cell-row").max=String(t-1),xn.row=Math.min(xn.row,t-1),xn.frequency=Math.min(xn.frequency,i-1),F("space-cell-frequency").value=String(xn.frequency),F("space-cell-row").value=String(xn.row),F("space-surface-readout").hidden=!1,Fc(),F("space-hud-count").textContent=`${lc(n)} · ${oe(t*i,0)} computed cells · ${l?"C++ indexed mesh":"browser triangulation"} · ${oe(e.native_seconds,3)} native s`,F("space-geometry-note").textContent=`Computed observations: ${lc(n)} · ${n.provenance.band} band · ${n.provenance.time_system}. ${Ar.surface[1]}`,hr&&!l&&Wn(hr)}function Fc(){const n=Uc();if(!n||!un)return;xn={row:Number(F("space-cell-row").value),frequency:Number(F("space-cell-frequency").value)};const e=n.powers[xn.row]?.[xn.frequency];Us&&(Us.visible=e!=null,Us.position.set((xn.frequency/Math.max(1,n.frequencies.length-1)-.5)*16,(e??0)*5*Number(F("space-height").value)+.16,(xn.row/Math.max(1,n.powers.length-1)-.5)*10));const t=F("space-surface-kind").value==="localized",i=t?un.localized.time_centers_jd[xn.row]:un.chirp.frequency_derivatives[xn.row];F("space-cell-value").textContent=`f = ${br(n.frequencies[xn.frequency])} d⁻¹ · ${t?`HJD ${oe(i,3)}`:`ḟ = ${br(i)} d⁻²`} · improvement ${e===null?"unidentifiable":oe(e,5)}`,Jt=!0}const Ar={sky:["CELESTIAL SPHERE / PUBLISHED ANGULAR POSITIONS","Directions lie on a unit celestial sphere. Display radius is arbitrary; catalogue entries have no individual measured distances here. Color encodes published period; gray means a missing period."],density:["SURVEY COVERAGE / ENTRIES PER STERADIAN","Bar height uses log(1 + entries per steradian) in angular cells. This measures catalogue coverage and selection effects. It is not physical stellar density or a gravitational cluster map."],period:["PERIOD AS A RADIAL COORDINATE / DISPLAY ENCODING","Radius = 6 + 8 × clamp(log₁₀(period days) / 5, 0, 1). This depth encodes a measured period, not a physical distance. Entries with missing periods remain on the reference shell."],distance:["CANDIDATE DISTANCES / CONDITIONAL PARSEC COORDINATES","Positions use Gaia DR3 positional candidates and Bayesian distance posterior medians in a uniform parsec scale. Lines show 16–84% radial intervals. Associations are unconfirmed; negative or noisy parallaxes and flagged solutions can be prior dominated."],star:["PHOTOMETRIC 3D RECONSTRUCTION / CONDITIONAL RADIATIVE FAMILY","Native geometry follows a conditional radius / temperature family that reproduces a fitted measured phase curve. Reference radius is normalized; reference temperature is assumed. Display lighting and color provide depth cues and an illustrative temperature scale. The interior remains schematic."],workers:["MEASURED PROCESS GRAPH / COMPUTATIONAL TOPOLOGY","Each worker node comes from an actual process receipt: host, PID, task count, and compute time. Edges describe coordinator / worker flow; node positions are a diagram, not physical machine locations or measured network traffic."],surface:["NATIVE COMPUTATION / FREQUENCY LANDSCAPE","Horizontal coordinates come from the actual native search grid. Height is relative χ² improvement, multiplied by the selected display scale. Missing cells leave gaps. Peaks are empirical candidates, not calibrated probabilities."]};function mn(n,e=!0){Qe=n,document.querySelectorAll("[data-space-view]").forEach(t=>t.setAttribute("aria-pressed",String(t.dataset.spaceView===n))),F("space-view-label").textContent=Ar[n][0],F("space-geometry-note").textContent=Ar[n][1],F("space-map-options").hidden=!["sky","density","period"].includes(n),F("space-star-options").hidden=n!=="star",F("space-surface-options").hidden=n!=="surface",F("space-worker-options").hidden=n!=="workers",F("space-inference").hidden=n!=="star",F("space-distance-options").hidden=n!=="distance",F("space-worker-ledger").hidden=n!=="workers"&&n!=="distance",F("space-surface-readout").hidden=n!=="surface"||!un,F("space-frame").disabled=n==="density",F("space-groups").disabled=n==="density"||F("space-frame").value==="galactic",n==="density"&&(F("space-frame").value="equatorial"),F("space-hud-count").textContent=n==="star"?Sr?.name??Fe?.stars[At]?.name??"Select any catalogue star":`${oe(Sn.length,0)} mapped catalogue entries`,Pt&&(cx(),(n==="sky"||n==="period")&&ux(),n==="density"&&fx(),n==="distance"&&(gx(),ur||kc()),n==="star"&&px(),n==="workers"&&_x(),n==="surface"&&(xx(),vx()),e&&oo(),Jt=!0),F("space-play").textContent=Yi?"Ⅱ Pause":n==="star"?"▶ Cycle":"▶ Orbit"}function oo(){Pt&&(Gn.position.set(Qe==="surface"?18:Qe==="star"?7:17,Qe==="star"?3:Qe==="surface"?15:10,Qe==="star"?11:20),Xt.target.set(0,Qe==="surface"?1.5:0,0),Xt.minDistance=Qe==="star"?5:3,Xt.maxDistance=75,Xt.update(),Jt=!0)}function yx(){try{Pt=new Xv({canvas:F("space-canvas"),antialias:!0,powerPreference:"high-performance"}),Pt.setPixelRatio(Math.min(devicePixelRatio,1.5)),Pt.localClippingEnabled=!0,fi=new xp,fi.background=new ke("#030811"),fi.add(new $p(12568796,1.1));const n=new $d(16768950,1.65);n.position.set(-8,12,14),fi.add(n);const e=new $d(8036306,.35);e.position.set(8,-3,-10),fi.add(e),Gn=new Dn(45,1,.1,150),Ve=new ti,fi.add(Ve),Xt=new Yv(Gn,Pt.domElement),Xt.enableDamping=!0,Xt.dampingFactor=.09,Xt.autoRotate=!1,Xt.autoRotateSpeed=.35,Xt.addEventListener("change",()=>{Jt=!0});const t=()=>{if(!Pt)return;const i=F("space-viewport"),s=i.clientWidth,r=i.clientHeight;Pt.setSize(s,r,!1),Gn.aspect=s/Math.max(1,r),Gn.updateProjectionMatrix(),Jt=!0};new ResizeObserver(t).observe(F("space-viewport")),t(),F("space-canvas").addEventListener("webglcontextlost",i=>{i.preventDefault(),F("space-webgl-message").hidden=!1,F("space-webgl-message").textContent="The graphics context was lost. Reload this view to resume 3D; the record list and scientific tools remain available.",Pt=null}),new IntersectionObserver(i=>{oc=i[0]?.isIntersecting??!1,oc&&(Jt=!0)},{rootMargin:"100px"}).observe(F("space-viewport")),oo(),requestAnimationFrame(Bh)}catch(n){F("space-webgl-message").hidden=!1,F("space-webgl-message").textContent=`WebGL is unavailable on this device. Browse every catalogue entry below and use the scientific labs. ${bt(n)}`,F("space-canvas").hidden=!0,Wn("Accessible catalogue view · graphics unavailable"),Pt=null}}function Bh(n){if(requestAnimationFrame(Bh),!Pt||!oc||document.hidden||n-Qo<1e3/30)return;const e=Math.min(.1,(n-Qo)/1e3||1/30);Qo=n;const t=Xt.update();if(Yi?(Qe==="star"?(bu=(Number(F("space-phase").value)+e/15)%1,F("space-phase").value=String(bu),ao(),ni&&(ni.rotation.y+=e*.06),Qn&&(Qn.rotation.y=ni?.rotation.y??0)):Xt.autoRotate=!0,Jt=!0):Xt.autoRotate=!1,Pn&&Pn.children[1].quaternion.copy(Gn.quaternion),(Jt||t)&&(Pt.render(fi,Gn),Jt=!1,tl++,n-el>1800)){const i=tl/((n-el)/1e3);el=n,tl=0,Wn(`${Qe==="sky"||Qe==="period"?`${oe(Ri.length,0)} GPU points · `:""}${Yi||t?`${oe(i,0)} fps · `:""}${oe(Pt.info.render.calls,0)} draw calls · ${Pt.getPixelRatio()}× pixel ratio`)}}function Nr(){if(!Fe)return;Zn=Math.max(0,Math.min(Zn,Math.max(0,Math.ceil(Sn.length/ir)-1)));const n=Sn.slice(Zn*ir,(Zn+1)*ir);F("space-match-count").textContent=`${oe(Sn.length,0)} matching entries`,F("space-record-list").innerHTML=n.length?n.map(e=>{const t=Fe.stars[e];return`<button type="button" class="space-record ${e===At?"selected":""}" data-space-index="${e}" aria-pressed="${e===At}"><span>${Et(t.name)}<small>${Et(t.region||t.catalog)} · ${Et(t.id)}</small></span><b>${t.period_days?`${oe(t.period_days,1)} d`:"—"}</b></button>`}).join(""):"<p>No catalogue entries match these controls.</p>",F("space-list-page").textContent=Sn.length?`${Zn+1} / ${oe(Math.ceil(Sn.length/ir),0)}`:"0 / 0",F("space-prev-records").disabled=Zn===0,F("space-next-records").disabled=(Zn+1)*ir>=Sn.length}function Oc(){if(!Fe)return;const n=F("space-search").value.toLowerCase().trim(),e=F("space-catalogue").value,t=F("space-region").value,i=F("space-min-period").value,s=F("space-max-period").value,r=i?Number(i):0,a=s?Number(s):1/0;Sn=Fe.stars.flatMap((o,l)=>(!n||`${o.name} ${o.id} ${o.aliases?.join(" ")??""}`.toLowerCase().includes(n))&&(!e||o.catalog===e)&&(!t||o.region===t)&&(!i&&!s||o.period_days!==null&&o.period_days>=r&&o.period_days<=a)?[l]:[]),Zn=0,Nr(),Qe==="sky"||Qe==="period"?mn(Qe,!1):Qe==="density"&&mn("density",!1)}function dc(){const n=Fe?.stars[At];if(!n)return;const e=Sr??n;F("space-star-name").textContent=e.name,F("space-selected-badge").textContent=e.catalog;const t=Sr,i=[["Identifier",e.id],["Region / survey",e.region||"—"],["Published period",e.period_days?`${oe(e.period_days,4)} days`:"Unknown"],["RA / Dec J2000",t?`${oe(t.ra_deg,5)}° / ${oe(t.dec_deg,5)}°`:"Loading…"],["Mean I magnitude",oe(e.mean_i_mag,3)],["I amplitude",e.amplitude_i_mag?`${oe(e.amplitude_i_mag,3)} mag`:"Unknown"],["Distance / radius / mass","Unknown in bundled catalogue"]];F("space-inspector").innerHTML=`<dl class="space-star-facts">${i.map(([s,r])=>`<div><dt>${Et(s)}</dt><dd>${Et(r)}</dd></div>`).join("")}</dl><div class="space-selected-actions"><button type="button" id="space-enter-star" class="fit-button">Reconstruct this star →</button><button type="button" id="space-focus-star" class="export-button">Center its direction</button></div><div class="space-model-exports"><button id="space-export-model" type="button" class="export-button">Model + evidence JSON ↓</button><button id="space-export-obj" type="button" class="export-button">Native mesh OBJ ↓</button></div><p id="space-model-brightness" class="space-model-status">${$s().length?"Native empirical phase curve ready; scrub the star to inspect relative brightness.":"Normalized geometry ready. Measured phase brightness requires available photometry."}</p>${t?.source_url?`<a class="text-link" href="${Et(t.source_url)}" target="_blank" rel="noopener noreferrer">Inspect published source ↗</a>`:""}<div class="space-distance-evidence"><button type="button" id="space-acquire-evidence" class="export-button">Acquire Gaia DR3 evidence ↗</button><p id="space-gaia-status">Bring an unknown distance into a testable inference. A nearby Gaia source is a positional candidate until its identity and solution quality are verified.</p><div id="space-gaia-candidates"></div><div id="space-distance-result"></div></div><details class="space-selected-evidence"><summary>Model evidence &amp; geometry</summary><p>Reference radius: dimensionless 1. Conditional radiative family: measured flux with an assumed temperature scale. Interior layers: schematic. Physical radius, mass, interior, and unique radius / temperature evolution require independent measurements.</p>${ze?.caveats?.length?`<ul>${ze.caveats.map(s=>`<li>${Et(s)}</li>`).join("")}</ul>`:""}${ze?.computation?`<pre>${Et(JSON.stringify(ze.computation,null,2))}</pre>`:""}</details>`,F("space-enter-star").addEventListener("click",()=>{mn("star"),ze||lo()}),F("space-focus-star").addEventListener("click",()=>{if(!Pt)return;if(!Fe?.positions[At]){Wn("This record has no published coordinates; its model and evidence remain available.");return}["sky","period"].includes(Qe)||mn("sky");const s=Nc(At).normalize();Gn.position.copy(s.clone().multiplyScalar(24)),Xt.target.copy(s.clone().multiplyScalar(7)),Xt.update(),Jt=!0}),F("space-acquire-evidence").addEventListener("click",()=>{Sx()}),F("space-export-model").disabled=!ze,F("space-export-obj").disabled=!ze?.mesh,F("space-export-model").addEventListener("click",()=>{ze&&Bc(JSON.stringify({...ze,visualization_phase:Number(F("space-phase").value),gaia_evidence:vn,distance_posterior:Ni},null,2),`${uc(e.id)}-model.json`,"application/json")}),F("space-export-obj").addEventListener("click",Mx),kh()}function uc(n){return n.replace(/[^a-zA-Z0-9._-]/g,"_")}function Bc(n,e,t){const i=URL.createObjectURL(new Blob([n],{type:t})),s=document.createElement("a");s.href=i,s.download=e,s.hidden=!0,document.body.append(s),s.click(),s.remove(),setTimeout(()=>URL.revokeObjectURL(i),3e4)}function Mx(){const n=ze?.mesh,e=Fe?.stars[At];if(!n||!e)return;const t=Number(F("space-phase").value),i=fr(ze?.radiative_family?.radii_relative,t)??1,s=i/Za,r=["# THOTH v2 conditional normalized stellar envelope",`# Catalogue entry ${e.id}`,`# Phase ${t}; R/R0 ${i}; unknown absolute R0`,`# Radius/temperature fraction ${ze?.radiative_family?.radius_fraction??"unavailable"}; reference T0 ${ze?.radiative_family?.reference_temperature_k??"unavailable"} K assumed`,"# This is a conditional photometric reconstruction, not a resolved stellar image.",`o ${uc(e.id)}`];for(let o=0;o<n.positions.length;o+=3)r.push(`v ${n.positions[o]*s} ${n.positions[o+1]*s} ${n.positions[o+2]*s}`);const a=n.normals;if(a?.length===n.positions.length)for(let o=0;o<a.length;o+=3)r.push(`vn ${a[o]} ${a[o+1]} ${a[o+2]}`);for(let o=0;o<n.indices.length;o+=3)r.push(`f ${n.indices.slice(o,o+3).map(l=>a?.length===n.positions.length?`${l+1}//${l+1}`:String(l+1)).join(" ")}`);Bc(r.join(`
`)+`
`,`${uc(e.id)}-phase-${t.toFixed(3)}.obj`,"text/plain")}async function Rr(n){if(!Fe?.stars[n])return;At=n,Sr=null,ze=null,vn=null,Ni=null,Ya=0,Ka=1350,Pa++,F("space-phase").value="0",F("space-inference-chart").innerHTML="",F("space-inference-status").textContent="Select a star and infer from available photometry to build this family.",Nr(),dc(),Oh(),Qe==="star"&&mn("star",!1);const e=Fe.stars[n].id;try{const t=await Bt(`/api/stars/${encodeURIComponent(e)}`);if(At!==n)return;Sr=t,dc(),Qe==="star"&&(F("space-hud-count").textContent=t.name)}catch(t){At===n&&(F("space-model-brightness").textContent=`Detailed record unavailable: ${bt(t)}`)}}async function lo(){const n=Fe?.stars[At];if(!n)return;if(!F("space-reference-temperature").checkValidity()){F("space-inference-status").textContent="Choose an assumed reference temperature from 1,500 to 10,000 K before calculating the next hypothesis.";return}if(jo){va=!0,F("space-inference-status").textContent="Your latest hypothesis is queued behind the current native model calculation.";return}jo=!0;const e=++Pa,t=F("space-model-fit");t.disabled=!0,t.textContent="C++ fitting measured photometry…",F("space-inference-status").textContent=`Computing the conditional radiative family for η = ${oe(Number(F("space-radius-fraction").value),2)}…`,F("space-model-brightness").textContent="Loading actual photometry and computing an empirical phase curve…";try{const i=await Hs("/api/space/star",{star_id:n.id,phase:Number(F("space-phase").value),resolution:48,displacement:0,contrast:0,radius_fraction:Number(F("space-radius-fraction").value),reference_temperature_k:Number(F("space-reference-temperature").value)});if(e!==Pa)return;ze=i,dc(),Qe==="star"&&mn("star",!1),ao(),bx(),$s().length||(F("space-model-brightness").textContent=typeof i.photometry_message=="string"?i.photometry_message:"No measured phase curve is available for this record. Normalized geometry remains explorable."),Wn("Native star-model evidence received")}catch(i){e===Pa&&(F("space-model-brightness").textContent=`Measured brightness unavailable: ${bt(i)}`,F("space-inference-status").textContent=`The requested hypothesis was not calculated: ${bt(i)}`,ze?.radiative_family&&!va&&(ze.radiative_family.radius_fraction!==void 0&&(F("space-radius-fraction").value=String(ze.radiative_family.radius_fraction)),ze.radiative_family.reference_temperature_k!==void 0&&(F("space-reference-temperature").value=String(ze.radiative_family.reference_temperature_k)),co(!1)))}finally{jo=!1,t.disabled=!1,t.textContent="Infer from measured brightness",va&&(va=!1,lo())}}function bx(){const n=ze?.radiative_family,e=$s();if(!n||!e.length){F("space-inference-status").textContent=e.length?typeof ze?.radiative_message=="string"?ze.radiative_message:"The measured brightness fit is available; the passband does not identify a radiative model family under the current assumptions.":"Photometry is unavailable for this entry. A normalized 3D template remains available; a measured reconstruction needs observations.";return}const t=e.map(S=>S.relative_flux??Math.pow(10,-.4*(S.magnitude-e[0].magnitude))),i=[...t,...n.reconstructed_fluxes].filter(Number.isFinite),s=Math.max(1,...i),r=620,a=200,o=56,l=18,c=20,p=45,m=S=>o+S*(r-o-l),u=S=>a-p-S/s*(a-c-p);let d="";for(let S=0;S<=3;S++){const E=s*S/3,w=S/3;d+=`<line x1="${o}" x2="${r-l}" y1="${u(E)}" y2="${u(E)}" stroke="#273b55"/><text x="${o-8}" y="${u(E)+5}" text-anchor="end">${Et(oe(E,1))}</text><text x="${m(w)}" y="${a-p+23}" text-anchor="middle">${oe(w,2)}</text>`}const g=S=>S.map((E,w)=>`${w?"L":"M"}${m(e[w]?.phase??w/Math.max(1,S.length-1))},${u(E)}`).join(" ");d+=`<path d="${g(t)}" fill="none" stroke="#69d6d3" stroke-width="4"/><path d="${g(n.reconstructed_fluxes)}" fill="none" stroke="#edbd8e" stroke-width="2" stroke-dasharray="6 5"/><text x="${(o+r-l)/2}" y="${a-4}" text-anchor="middle">Cycle phase</text><text transform="translate(15 ${(c+a-p)/2}) rotate(-90)" text-anchor="middle">Relative flux</text>`;let y="";const f=n.counterfactual_predictions;if(f?.length){const S=f.flatMap(L=>L.delta_magnitudes.filter(U=>U!==null&&Number.isFinite(U))),E=Math.min(...S),w=Math.max(...S),v=w-E||1,T=L=>c+(L-E)/v*(a-c-p);let C="";for(let L=0;L<=3;L++){const U=E+v*L/3;C+=`<line x1="${o}" x2="${r-l}" y1="${T(U)}" y2="${T(U)}" stroke="#273b55"/><text x="${o-8}" y="${T(U)+5}" text-anchor="end">${oe(U,1)}</text><text x="${m(L/3)}" y="${a-p+23}" text-anchor="middle">${oe(L/3,2)}</text>`}f.forEach(L=>{let U=!0;const G=L.delta_magnitudes.map((O,k)=>{if(O===null||!Number.isFinite(O))return U=!0,"";const J=`${U?"M":"L"}${m(e[k]?.phase??k/Math.max(1,L.delta_magnitudes.length-1))},${T(O)}`;return U=!1,J}).join(" ");C+=`<path d="${G}" fill="none" stroke="${L.label==="I"?"#69d6d3":L.label==="K"?"#edbd8e":"#b398e5"}" stroke-width="2.5" ${L.label==="I"?"":'stroke-dasharray="5 4"'}/>`}),C+=`<text x="${(o+r-l)/2}" y="${a-4}" text-anchor="middle">Cycle phase</text><text transform="translate(15 ${(c+a-p)/2}) rotate(-90)" text-anchor="middle">Predicted Δ magnitude</text>`,y=`<h4 class="space-prediction-title">Which new measurement could distinguish the shapes?</h4><svg viewBox="0 0 ${r} ${a}" role="img" aria-label="Unmeasured V I and K monochromatic predictions for the selected conditional radius and temperature family">${C}</svg><p><span class="space-flux-key violet"></span>V proxy · 0.55 μm <span class="space-flux-key measured"></span>I proxy · 0.806 μm <span class="space-flux-key reconstructed"></span>K proxy · 2.2 μm</p><p>Compare the hypotheses above: their I-band brightness can coincide while predicted V and K behavior differs. These curves are unmeasured monochromatic predictions, with assumed reference temperature and no calibrated color zero point. Calibrated multiband observations could test the families.</p>`}F("space-inference-chart").innerHTML=`<svg viewBox="0 0 ${r} ${a}" role="img" aria-label="Measured Fourier phase flux and conditional reconstructed flux overlap for this hypothesis">${d}</svg><p><span class="space-flux-key measured"></span>Measured phase fit <span class="space-flux-key reconstructed"></span>Conditional reconstruction</p>${y}`;const h=n.reconstructed_fluxes.reduce((S,E,w)=>Math.max(S,Math.abs(E-t[w])/Math.max(1e-12,Math.abs(t[w]))),0),M=ze?.fit,R=ze?.provenance?.photometry?.input_observations,b=(M?.reduced_chi2??0)>10?" This periodic fit leaves residuals far above the reported photometric errors. Radiative flux closure validates consistency with the fitted curve, not agreement with every observation or the physical star. Examine residuals and evolving-period alternatives before interpreting this family physically. The reduced χ² > 10 display flag is not a formally calibrated quality test.":"";F("space-inference-status").textContent=`Fourier phase fit: P = ${oe(M?.period_days,4)} days · reduced χ² = ${oe(M?.reduced_chi2,3)} · ${oe(M?.n_observations,0)} used observations${R?` / ${oe(R,0)} supplied`:""}. η = ${oe(n.radius_fraction,2)} · assumed T₀ = ${oe(n.reference_temperature_k,0)} K. Maximum relative radiative flux closure ${br(h)} compares the reconstruction with the fitted phase curve; it is not an observational residual. Changing η alters radius and temperature while preserving that same fitted flux. This degeneracy needs independent measurements.${b}`}async function kc(){try{ur=await Bt("/api/space/astrometry"),Qe==="distance"&&mn("distance",!1)}catch(n){Qe==="distance"&&(F("space-worker-ledger").textContent=`Astrometric evidence unavailable: ${bt(n)}`)}}async function Sx(){const n=Fe?.stars[At];if(!n)return;const e=At,t=F("space-acquire-evidence");t.disabled=!0,t.textContent="Acquiring source evidence…",F("space-gaia-status").textContent="Retrieving positional candidates, astrometric uncertainties, and archive provenance…";try{const i=await Bt(`/api/space/evidence/${encodeURIComponent(n.id)}?radius_arcsec=3${vn?"&refresh=true":""}`);if(At!==e)return;vn=i,Ni=null,Ya=Math.max(0,i.candidates.findIndex(s=>s.distance_usable)),kh(),kc()}catch(i){At===e&&(F("space-gaia-status").textContent=`Gaia evidence unavailable: ${bt(i)}`)}finally{document.getElementById("space-acquire-evidence")===t&&(t.disabled=!1,t.textContent="Refresh Gaia DR3 evidence ↗")}}function kh(){if(!vn)return;const n=vn.candidates;if(F("space-gaia-status").textContent=`${oe(n.length,0)} Gaia positional candidates · ${vn.association_status.replaceAll("_"," ")} · retrieved ${vn.retrieved_utc}.`,F("space-gaia-candidates").innerHTML=n.length?`<label>Choose evidence to investigate<select id="space-gaia-source">${n.map((e,t)=>`<option value="${t}" ${t===Ya?"selected":""} ${e.distance_usable?"":"disabled"}>${Et(e.source_id)} · ${oe(e.separation_arcsec,2)}″ · ${oe(e.parallax,3)} ± ${oe(e.parallax_error,3)} mas</option>`).join("")}</select></label><p id="space-gaia-quality"></p><label>Distance prior length / parsecs<input id="space-prior-length" type="number" min="50" max="10000" step="50" value="${Ka}"></label><button type="button" id="space-infer-distance" class="export-button" ${n.some(e=>e.distance_usable)?"":"disabled"}>Compute distance posterior</button><details class="space-selected-evidence"><summary>Inspect archive evidence</summary><a href="${Et(vn.source_url)}" target="_blank" rel="noopener noreferrer" class="text-link">Gaia source archive ↗</a><p>${Et(vn.caveats.join(" "))}</p><pre>${Et(vn.adql_query)}
SHA-256 ${Et(vn.response_sha256)}</pre></details>`:"<p>No positional candidates were returned. A distance remains unknown.</p>",n.length){const e=()=>{const t=n[Number(F("space-gaia-source").value)];F("space-gaia-quality").textContent=t?`Gaia ${t.source_id} · RUWE ${oe(t.ruwe,3)} · ${t.quality_flags.join("; ")||"No quoted quality flag"}. Identity association is unconfirmed.`:"No candidate has usable astrometry."};F("space-gaia-source").addEventListener("change",()=>{Ya=Number(F("space-gaia-source").value),Ni=null,F("space-distance-result").innerHTML="",e()}),e(),F("space-infer-distance").addEventListener("click",()=>{Ex()})}Ni&&zh()}async function Ex(){const n=vn?.candidates[Number(F("space-gaia-source").value)];if(!n?.distance_usable||n.parallax===null||n.parallax_error===null)return;const e=At,t=n.source_id,i=F("space-infer-distance");i.disabled=!0,i.textContent="Native posterior integration…",Ka=Number(F("space-prior-length").value);try{const s=await Hs("/api/space/distance",{parallax_mas:n.parallax,parallax_error_mas:n.parallax_error,prior_length_pc:Ka,samples:1024,max_distance_pc:2e4});if(At!==e||vn?.candidates[Number(F("space-gaia-source").value)]?.source_id!==t)return;Ni=s,zh()}catch(s){At===e&&(F("space-distance-result").textContent=`Distance inference failed: ${bt(s)}`)}finally{i.disabled=!1,i.textContent="Compute distance posterior"}}function zh(){if(!Ni)return;const n=Ni,e=380,t=230,i=55,s=15,r=20,a=55,o=Math.max(n.p84_pc*1.6,n.median_pc*2,1),l=Math.max(...n.density_per_pc),c=d=>i+d/o*(e-i-s),p=d=>t-a-d/l*(t-r-a);let m=`<rect x="${c(n.p16_pc)}" y="${r}" width="${Math.min(e-s,c(n.p84_pc))-c(n.p16_pc)}" height="${t-r-a}" fill="#7965a1" opacity=".23"/>`;for(let d=0;d<=3;d++){const g=o*d/3;m+=`<text x="${c(g)}" y="${t-a+25}" text-anchor="middle">${oe(g,0)}</text>`}const u=n.distances_pc.flatMap((d,g)=>d<=o?[`${c(d)},${p(n.density_per_pc[g])}`]:[]);m+=`<polyline points="${u.join(" ")}" stroke="#b49adf" stroke-width="2.5" fill="none"/><line x1="${c(n.median_pc)}" x2="${c(n.median_pc)}" y1="${r}" y2="${t-a}" stroke="#e4b17b" stroke-dasharray="4 4"/><text x="${(i+e-s)/2}" y="${t-5}" text-anchor="middle">Conditional distance / pc</text><text transform="translate(17 ${(r+t-a)/2}) rotate(-90)" text-anchor="middle">Posterior density / pc⁻¹</text>`,F("space-distance-result").innerHTML=`<p><strong>${oe(n.median_pc,0)} pc</strong> median · 16–84% interval <strong>${oe(n.p16_pc,0)}–${oe(n.p84_pc,0)} pc</strong></p><svg viewBox="0 0 ${e} ${t}" role="img" aria-label="Conditional parallax distance posterior with median and 16–84 percent interval">${m}</svg><p>Prior length ${oe(n.prior_length_pc,0)} pc. Bounded integration support: ${oe(n.lower_bound_pc??.001,3)}–${oe(n.upper_bound_pc??2e4,0)} pc. This inference belongs to the chosen Gaia candidate; its Mira identity remains unconfirmed. Compare prior lengths when the parallax is weak or negative; the generic disk prior is unsuitable for treating weak Magellanic Cloud parallaxes as reliable galaxy distances.</p>`}async function Tx(){try{if(Fe=await Bt("/api/space"),Fe.positions.length!==Fe.stars.length||Fe.galactic_positions.length!==Fe.stars.length)throw new Error("Catalogue geometry and record arrays must have matching lengths.");for(const e of["catalog","region"]){const t=F(e==="catalog"?"space-catalogue":"space-region");[...new Set(Fe.stars.map(i=>i[e]).filter(Boolean))].sort().forEach(i=>t.add(new Option(i,i)))}Sn=Fe.stars.map((e,t)=>t),Nr(),F("space-ledger").innerHTML=`<span><strong>${oe(Fe.counts.catalog_entries,0)}</strong> catalogue records</span><span><strong>${oe(Fe.counts.mapped_entries,0)}</strong> native sky directions</span><span><strong>${oe(Fe.density_cells.length,0)}</strong> angular density cells</span><span><strong>${oe(Fe.groups.length,0)}</strong> survey groups</span><span><strong>${oe(Fe.counts.missing_coordinates,0)}</strong> missing coordinates</span>`,F("space-provenance").innerHTML=`<p><strong>Native computation receipt</strong></p><pre>${Et(JSON.stringify(Fe.computation,null,2))}</pre><p><strong>Source provenance</strong></p><pre>${Et(JSON.stringify(Fe.provenance,null,2))}</pre>`,F("space-caveats").innerHTML=Fe.caveats.map(e=>`<li>${Et(e)}</li>`).join(""),mn(Qe);const n=Fe.stars.findIndex(e=>e.id===ox);Rr(n>=0?n:0),Pt||Wn(`${oe(Fe.stars.length,0)} catalogue records available without WebGL`)}catch(n){F("space-record-list").textContent=`Catalogue geometry unavailable: ${bt(n)}`,F("space-hud-count").textContent="Geometry could not be loaded",Wn("Retry by reloading the observatory")}}let ar=null;F("space-canvas").addEventListener("pointerdown",n=>{const e=n;ar={x:e.clientX,y:e.clientY}});F("space-canvas").addEventListener("pointerup",n=>{const e=n;if(!Pt||!ar||Math.hypot(e.clientX-ar.x,e.clientY-ar.y)>7)return;ar=null;const t=Pt.domElement.getBoundingClientRect();if(Mu.set((e.clientX-t.left)/t.width*2-1,-(e.clientY-t.top)/t.height*2+1),bs.setFromCamera(Mu,Gn),bs.params.Points.threshold=.13,Ns){const i=bs.intersectObject(Ns)[0];i?.index!==void 0&&Rr(Ri[i.index])}else if(qi&&Fe){const i=bs.intersectObject(qi)[0];if(i?.instanceId===void 0)return;const s=Nh[i.instanceId];if(!s)return;F("space-hud-count").textContent=`Filtered cell: RA ${oe(s.ra_deg,1)}° / Dec ${oe(s.dec_deg,1)}° · ${oe(s.count,0)} matching entries · ${oe(s.density_per_sr,0)} sr⁻¹`}else if(Tr&&un){const i=bs.intersectObject(Tr)[0],s=Uc();if(!i||!s)return;F("space-cell-frequency").value=String(Math.max(0,Math.min(s.frequencies.length-1,Math.round((i.point.x/16+.5)*(s.frequencies.length-1))))),F("space-cell-row").value=String(Math.max(0,Math.min(s.powers.length-1,Math.round((i.point.z/10+.5)*(s.powers.length-1))))),Fc()}else if(Qe==="distance"&&Fe){const i=bs.intersectObjects(Ve.children,!1).find(s=>typeof s.object.userData.star_id=="string");if(i){const s=Fe.stars.findIndex(r=>r.id===i.object.userData.star_id);s>=0&&Rr(s)}}});F("space-canvas").addEventListener("keydown",n=>{const e=n.key;if(!Pt||!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","-","r"].includes(e))return;if(n.preventDefault(),e==="r"){oo();return}const t=Gn.position.clone().sub(Xt.target),i=new ic().setFromVector3(t);e==="ArrowLeft"&&(i.theta-=.1),e==="ArrowRight"&&(i.theta+=.1),e==="ArrowUp"&&(i.phi-=.1),e==="ArrowDown"&&(i.phi+=.1),e==="+"&&(i.radius*=.9),e==="-"&&(i.radius*=1.1),i.makeSafe(),Gn.position.copy(new P().setFromSpherical(i).add(Xt.target)),Xt.update(),Jt=!0});F("space-record-list").addEventListener("click",n=>{const e=n.target.closest("[data-space-index]");e&&Rr(Number(e.dataset.spaceIndex))});for(const n of document.querySelectorAll("[data-space-view]"))n.addEventListener("click",()=>mn(n.dataset.spaceView));for(const n of["space-search","space-min-period","space-max-period"])F(n).addEventListener("input",Oc);for(const n of["space-catalogue","space-region"])F(n).addEventListener("change",Oc);F("space-clear-filters").addEventListener("click",()=>{["space-search","space-catalogue","space-region","space-min-period","space-max-period"].forEach(n=>F(n).value=""),Oc()});F("space-prev-records").addEventListener("click",()=>{Zn--,Nr()});F("space-next-records").addEventListener("click",()=>{Zn++,Nr()});F("space-frame").addEventListener("change",()=>mn(Qe,!1));F("space-grid").addEventListener("change",()=>{pi&&(pi.visible=F("space-grid").checked),Jt=!0});F("space-groups").addEventListener("change",()=>{Is&&(Is.visible=F("space-groups").checked),Jt=!0});F("space-point-size").addEventListener("input",()=>{Er&&Pt&&(Er.uniforms.size.value=Number(F("space-point-size").value)*Pt.getPixelRatio()),Jt=!0});F("space-export-sky").addEventListener("click",()=>{Fe&&Bc(JSON.stringify(Fe),"THOTH-catalogue-directions-and-provenance.json","application/json")});F("space-reset").addEventListener("click",oo);F("space-play").addEventListener("click",()=>{Yi=!Yi,F("space-play").setAttribute("aria-pressed",String(Yi)),F("space-play").textContent=Yi?"Ⅱ Pause":Qe==="star"?"▶ Cycle":"▶ Orbit",Jt=!0});F("space-fullscreen").addEventListener("click",async()=>{try{document.fullscreenElement?await document.exitFullscreen():await F("space-viewport").requestFullscreen()}catch{F("space-viewport").classList.toggle("space-expanded"),F("space-fullscreen").textContent=F("space-viewport").classList.contains("space-expanded")?"⛶ Collapse":"⛶ Expand"}});for(const n of["space-phase","space-cutaway","space-wireframe"])F(n).addEventListener("input",ao);F("space-model-fit").addEventListener("click",()=>{lo()});let Su;function co(n){const e=Number(F("space-radius-fraction").value);if(F("space-radius-fraction-label").textContent=oe(e,2),document.querySelectorAll("[data-radius-fraction]").forEach(t=>t.setAttribute("aria-pressed",String(Number(t.dataset.radiusFraction)===e))),clearTimeout(Su),!F("space-reference-temperature").checkValidity()){F("space-inference-status").textContent="Choose an assumed reference temperature from 1,500 to 10,000 K before calculating the next hypothesis.";return}n&&ze?.radiative_family&&(Su=setTimeout(()=>{lo()},350))}for(const n of document.querySelectorAll("[data-radius-fraction]"))n.addEventListener("click",()=>{F("space-radius-fraction").value=n.dataset.radiusFraction??".5",co(!0)});F("space-radius-fraction").addEventListener("input",()=>co(!0));F("space-reference-temperature").addEventListener("input",()=>co(!0));F("space-refresh-distances").addEventListener("click",()=>{kc()});F("space-surface-kind").addEventListener("change",()=>mn("surface"));F("space-height").addEventListener("input",()=>mn("surface",!1));for(const n of["space-cell-frequency","space-cell-row"])F(n).addEventListener("input",Fc);F("space-run-transform").addEventListener("click",()=>{document.getElementById("transform-form")?.requestSubmit(),Wn("Current Transform Foundry experiment submitted; the surface appears when computed.")});F("space-run-cluster").addEventListener("click",()=>{document.getElementById("cluster-form")?.requestSubmit(),Wn("Real cluster experiment submitted; waiting for process receipts.")});window.addEventListener("thoth:transform-result",n=>{un=n.detail,(Qe==="surface"||Qe==="workers")&&mn(Qe,!1)});window.addEventListener("thoth:cluster-result",n=>{hi=n.detail,Qe==="workers"&&mn(Qe,!1)});window.addEventListener("thoth:simulation-result",n=>{xu=n.detail,Qe==="star"&&Wn(`Dimensionless oscillator available: ${oe(xu.times_days.length,0)} computed samples; brightness uses measured photometry independently.`)});window.addEventListener("thoth:star-selected",n=>{const e=n.detail.id,t=Fe?.stars.findIndex(i=>i.id===e);t!==void 0&&t>=0&&t!==At&&Rr(t)});yx();lx&&(F("space-gesture").textContent="Motion is paused · drag to orbit · pinch to zoom");Tx();
