/* LeaseHub Add Property wizard */
document.addEventListener("DOMContentLoaded",function(){
 const form=document.getElementById("addPropertyForm"); if(!form)return;
 const sections=Array.from(form.querySelectorAll(".form-section"));
 if(sections.length<2)return;
 const bar=document.createElement("div"); bar.className="leasehub-wizard-bar"; bar.setAttribute("aria-label","Add property progress");
 bar.innerHTML=sections.map((s,i)=>`<button type="button" class="${i===0?"active":""}" data-step="${i}"><span>${String(i+1).padStart(2,"0")}</span>${s.querySelector("h2")?.textContent.trim()||"Step"}</button>`).join("");
 form.parentNode.insertBefore(bar,form);
 const controls=document.createElement("div"); controls.className="leasehub-wizard-controls";
 controls.innerHTML=`<button type="button" class="leasehub-secondary-btn" id="wizardBack"><i class="bx bx-arrow-back"></i> Back</button><span id="wizardStepLabel">Step 1 of ${sections.length}</span><button type="button" class="primary-btn" id="wizardNext">Next <i class="bx bx-arrow-right"></i></button>`;
 form.appendChild(controls);
 let current=0;
 function validCurrent(){let ok=true;sections[current].querySelectorAll("input,select,textarea").forEach(el=>{if(!el.checkValidity()){el.reportValidity();ok=false;}});return ok;}
 function render(){sections.forEach((s,i)=>s.classList.toggle("wizard-hidden",i!==current));bar.querySelectorAll("button").forEach((b,i)=>b.classList.toggle("active",i===current));document.getElementById("wizardStepLabel").textContent=`Step ${current+1} of ${sections.length}`;document.getElementById("wizardBack").disabled=current===0;const submitBox=form.querySelector(".form-submit"); if(submitBox) submitBox.style.display=current===sections.length-1?"flex":"none"; const next=document.getElementById("wizardNext");next.innerHTML=current===sections.length-1?`Review complete <i class="bx bx-check"></i>`:`Next <i class="bx bx-arrow-right"></i>`; }
 document.getElementById("wizardBack").onclick=()=>{if(current>0){current--;render();form.scrollIntoView({behavior:"smooth",block:"start"});}};
 document.getElementById("wizardNext").onclick=()=>{if(current<sections.length-1){if(!validCurrent())return;current++;render();form.scrollIntoView({behavior:"smooth",block:"start"});}else{if(validCurrent())form.requestSubmit();}};
 bar.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{const target=Number(b.dataset.step);if(target<=current||validCurrent()){current=target;render();}}));
 render();
});