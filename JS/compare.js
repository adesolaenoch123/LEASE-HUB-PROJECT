document.addEventListener("DOMContentLoaded",function(){
 const table=document.getElementById("comparePageTable"), empty=document.getElementById("comparePageEmpty"); if(!table)return;
 let ids=[]; try{ids=JSON.parse(localStorage.getItem("compareProperties")||"[]").map(Number)}catch{}
 const list=(window.properties||[]).filter(p=>ids.includes(Number(p.id))).slice(0,3);
 if(list.length<2){table.hidden=true;empty.hidden=false;return;} empty.hidden=true;table.hidden=false;
 const rows=[["Price",p=>`₦${new Intl.NumberFormat("en-NG").format(Number(p.price)||0)} / ${p.period||"year"}`],["Location",p=>p.location||p.city||"—"],["Type",p=>p.type||"—"],["Bedrooms",p=>p.bedrooms||"—"],["Bathrooms",p=>p.bathrooms||"—"],["Size",p=>p.size||"—"],["Amenities",p=>(p.amenities||[]).slice(0,4).join(", ")||"—"],["Verification",p=>p.verified?"Verified":"Pending"],["Availability",p=>p.availability?.status||"Available"]];
 table.innerHTML=`<div class="compare-row compare-properties"><span>Property</span>${list.map(p=>`<strong>${p.title}</strong>`).join("")}</div>`+rows.map(([label,fn])=>`<div class="compare-row"><strong>${label}</strong>${list.map(p=>`<span>${fn(p)}</span>`).join("")}</div>`).join("");
});