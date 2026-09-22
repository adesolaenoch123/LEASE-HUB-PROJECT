document.addEventListener("DOMContentLoaded",function(){
 const listEl=document.getElementById("tenantApplicationList"), empty=document.getElementById("emptyTenantApplications"); if(!listEl)return;
 function render(){
  let apps=[];try{apps=JSON.parse(localStorage.getItem("rentalApplications")||"[]")}catch{}
  let user=null;try{user=JSON.parse(localStorage.getItem("leasehubCurrentUser")||"null")}catch{}
  apps=Array.isArray(apps)?apps.filter(a=>!user||!user.id||String(a.tenantId)===String(user.id)):[]; 
  if(!apps.length){listEl.innerHTML="";empty.hidden=false;return;} empty.hidden=true;
  listEl.innerHTML=apps.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(a=>{
    const status=String(a.status||"pending").toLowerCase(); const current=status==="accepted"?3:status==="rejected"?3:status==="under review"?2:1;
    const steps=["Submitted","Under Review","Accepted / Rejected"];
    return `<article class="viewing-card"><div class="viewing-card-top"><div><span class="section-label">APPLICATION</span><h3>${String(a.propertyTitle||"Property").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}</h3></div><span class="${status==="accepted"?"verified-badge":status==="rejected"?"rejected-badge":"pending-badge"}">${status==="accepted"?"Accepted":status==="rejected"?"Rejected":status==="under review"?"Under Review":"Submitted"}</span></div>
    <div class="leasehub-status-track">${steps.map((s,i)=>`<div class="leasehub-status-step ${i<current?"is-done":i===current-1?"is-current":""}"><span class="leasehub-status-dot">${i+1}</span><span>${s}</span></div>`).join("")}</div>
    <p style="color:#66706a;font-size:12px">Move-in: ${a.moveInDate||"Not specified"}</p>
    ${status==="accepted"?`<a class="primary-btn" href="rental-agreement.html?applicationId=${encodeURIComponent(a.id)}">Open rental agreement</a>`:""}</article>`;
  }).join("");
 }
 render();window.addEventListener("storage",render);
});