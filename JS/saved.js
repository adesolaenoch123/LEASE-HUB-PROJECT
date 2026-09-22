document.addEventListener("DOMContentLoaded",function(){
 const grid=document.getElementById("savedGrid"),empty=document.getElementById("savedEmpty"),count=document.getElementById("savedCountLabel");
 if(!grid)return;
 function render(){
   let ids=typeof getSavedProperties==="function"?getSavedProperties():[];
   const list=(window.properties||[]).filter(p=>ids.map(Number).includes(Number(p.id)) && !(typeof isPropertyRejected==="function"&&isPropertyRejected(p)));
   count.textContent=`${list.length} ${list.length===1?"property":"properties"} saved`;
   grid.innerHTML=list.map(createLeaseHubPropertyCard).join("");
   empty.hidden=!!list.length; grid.hidden=!list.length;
   if(typeof bindSaved==="function")bindSaved();
 }
 window.bindSaved=function(){
   grid.querySelectorAll(".save-btn").forEach(btn=>btn.addEventListener("click",function(e){
     e.stopPropagation(); let ids=getSavedProperties().map(Number).filter(x=>x!==Number(btn.dataset.id)); saveSavedProperties(ids); render(); leaseHubToast("Removed from saved");
   }));
   grid.querySelectorAll(".compare-card-btn").forEach(btn=>btn.addEventListener("click",function(e){e.stopPropagation();}));
 };
 render();
 window.addEventListener("storage",render);
});