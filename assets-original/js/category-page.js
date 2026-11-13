(function(){
"use strict";
const root=document.querySelector("[data-category-grid]");if(!root)return;
const cards=root.querySelector("[data-category-cards]"),empty=root.querySelector("[data-category-empty]"),more=root.querySelector("[data-load-more]"),count=root.querySelector("[data-category-count]"),loading=root.querySelector("[data-category-loading]");
const base=(root.dataset.siteBase||"").replace(/\/$/,""),source=root.dataset.source||"",showPrices=root.dataset.showPrices!=="0";
let products=[],shown=0;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const url=v=>{const x=String(v||"").trim();if(/^https?:\/\//i.test(x))return x;return (base?base+"/":"/")+x.replace(/^\/+/, "")};
const price=v=>{const n=Number(v);return n>0?"৳"+Math.round(n).toLocaleString("en-BD"):""};
function hourlySeed(source){const now=new Date();const text=`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}-${now.getHours()}:${source||""}`;let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function seededRandom(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=t+Math.imul(t^(t>>>7),61|t)^t;return((t^(t>>>14))>>>0)/4294967296}}
function shuffleWithSeed(items,seed){const out=items.slice(),random=seededRandom(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}

function setLoading(v){root.setAttribute("aria-busy",v?"true":"false");if(loading)loading.hidden=!v}
function render(){
 if(shown===0)cards.innerHTML="";
 const batch=products.slice(shown,shown+10);
 batch.forEach((p,i)=>{
  const item=document.createElement("article");item.className="category-card";
  const href=url(p.product_url||p.site_url||p.affiliate_url||"");
  const raw=String(p.image_url||p.image||"").trim(),image=/^https?:\/\//i.test(raw)?raw:url(raw);
  item.innerHTML='<a class="category-card-image" href="'+esc(href)+'"><img src="'+esc(image)+'" alt="'+esc(p.title||"Rokomari product")+'" loading="'+(i<5?"eager":"lazy")+'" width="240" height="240" decoding="async"></a><div class="category-card-body"><h3>'+esc(p.title||"Product")+'</h3><p class="category-card-meta">'+esc([p.category_scraped,p.seller].filter(Boolean).join(" • "))+'</p>'+(showPrices?'<div class="category-card-price">'+esc(price(p.selling_price))+"</div>":"")+'<a class="category-card-button" href="'+esc(href)+'">বিস্তারিত দেখুন</a></div>';
  cards.appendChild(item);
 });
 shown=Math.min(shown+batch.length,products.length);if(more)more.hidden=shown>=products.length;
}
function skeleton(){cards.innerHTML='<div class="category-skeleton-grid" aria-label="পণ্য লোড হচ্ছে">'+Array.from({length:6},()=>'<article class="category-skeleton-card"><div class="skeleton skeleton-image"></div><div class="skeleton skeleton-line wide"></div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line short"></div><div class="skeleton skeleton-button"></div></article>').join("")+"</div>"}
function normalize(data){const list=Array.isArray(data)?data:(data&&Array.isArray(data.products)?data.products:[]);return list.filter(p=>p&&p.title&&(p.product_url||p.site_url||p.affiliate_url))}
if(!cards.children.length)skeleton();setLoading(true);
fetch(url(source),{cache:"no-store",headers:{Accept:"application/json","Cache-Control":"no-cache"}})
.then(r=>r.ok?r.json():Promise.reject(new Error("HTTP "+r.status)))
.then(data=>{products=normalize(data);products=shuffleWithSeed(products,hourlySeed(source));count.textContent=products.length?products.length+"টি পণ্য":"";if(!products.length){cards.innerHTML="";empty.hidden=false;return}empty.hidden=true;cards.innerHTML="";shown=0;render();})
.catch(()=>{cards.innerHTML="";empty.hidden=false;count.textContent=""})
.finally(()=>setLoading(false));
if(more)more.addEventListener("click",render);
const now=new Date(),nextHour=new Date(now);nextHour.setMinutes(60,0,0);setTimeout(()=>location.reload(),Math.max(1000,nextHour-now+500));
})();