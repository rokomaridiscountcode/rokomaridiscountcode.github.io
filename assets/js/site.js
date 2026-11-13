(()=>{'use strict';const $=s=>document.querySelector(s);const menu=$('#menu-toggle'),nav=$('#main-nav');if(menu&&nav)menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
let indexPromise;const getIndex=()=>indexPromise||(indexPromise=fetch('/search-index.json').then(r=>{if(!r.ok)throw Error('Search index unavailable');return r.json()}));
const input=$('#site-search'),results=$('#search-results');const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderSearch(list,target){if(!target)return;target.innerHTML=list.slice(0,12).map(p=>`<a href="${esc(p.url)}"><img src="${esc(p.image)}" alt="" loading="lazy"><span><strong>${esc(p.title)}</strong><small>${esc(p.category||'Product')}${p.price?` · ৳${Number(p.price).toLocaleString('en-BD')}`:''}</small></span></a>`).join('')||'<p style="padding:12px">No matching products found.</p>';target.classList.add('show');}
if(input&&results){input.addEventListener('input',async()=>{const q=input.value.trim().toLowerCase();if(q.length<2){results.classList.remove('show');results.innerHTML='';return;}try{const data=await getIndex();const found=data.filter(p=>(p.title+' '+p.category+' '+p.author).toLowerCase().includes(q));renderSearch(found,results);}catch(e){results.innerHTML='';}});document.addEventListener('click',e=>{if(!e.target.closest('.search'))results.classList.remove('show');});input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();location.href='/search/?q='+encodeURIComponent(input.value.trim());}});}
const load=$('#load-more');if(load){const grid=$('#category-products');let all=[],shown=grid?grid.children.length:0;fetch(load.dataset.feed).then(r=>r.json()).then(d=>{all=Array.isArray(d)?d:(d.products||[]);load.hidden=all.length<=shown;}).catch(()=>load.hidden=true);load.addEventListener('click',()=>{const batch=all.slice(shown,shown+24);batch.forEach(p=>{const card=document.createElement('article');card.className='product-card';const price=Number(p.selling_price)>0?'৳'+Number(p.selling_price).toLocaleString('en-BD'):'';card.innerHTML=`<a href="/${String(p.product_url||'').replace(/^\//,'')}"><img src="/${String(p.image_small||p.image||'').replace(/^\//,'')}" alt="${esc(p.title)}" width="220" height="220" loading="lazy"></a><div class="product-card-body"><h3><a href="/${String(p.product_url||'').replace(/^\//,'')}">${esc(p.title)}</a></h3><p class="meta">${esc(p.category_scraped||'')}</p><p class="price">${price}</p><a class="card-button" href="/${String(p.product_url||'').replace(/^\//,'')}">View details</a></div>`;grid.appendChild(card);});shown+=batch.length;load.hidden=shown>=all.length;});}
const pageResults=$('#search-page-results');if(pageResults){const q=new URLSearchParams(location.search).get('q')||'';if(input)input.value=q;getIndex().then(data=>{const matches=data.filter(p=>(p.title+' '+p.category+' '+p.author).toLowerCase().includes(q.toLowerCase()));pageResults.innerHTML=matches.slice(0,100).map(p=>`<article class="product-card"><a href="${esc(p.url)}"><img src="${esc(p.image)}" alt="${esc(p.title)}" width="220" height="220" loading="lazy"></a><div class="product-card-body"><h3><a href="${esc(p.url)}">${esc(p.title)}</a></h3><p class="meta">${esc(p.category)}</p><p class="price">${p.price?'৳'+Number(p.price).toLocaleString('en-BD'):''}</p><a class="card-button" href="${esc(p.url)}">View details</a></div></article>`).join('')||'<p>No matching products found.</p>';});}

// Horizontal category product carousels: one viewport is four cards on desktop.
document.querySelectorAll('.section').forEach(section=>{
 const track=section.querySelector('[data-carousel-track]');
 if(!track)return;
 section.querySelectorAll('.carousel-arrow').forEach(button=>{
  button.addEventListener('click',()=>{
   const first=track.querySelector('.product-card');
   const gap=parseFloat(getComputedStyle(track).columnGap||getComputedStyle(track).gap)||14;
   const cardWidth=first?first.getBoundingClientRect().width+gap:280;
   const visible=window.matchMedia('(max-width:760px)').matches?2:(window.matchMedia('(max-width:900px)').matches?3:4);
   track.scrollBy({left:(button.dataset.direction==='next'?1:-1)*cardWidth*visible,behavior:'smooth'});
  });
 });
});
// Copy the coupon code, then open Rokomari through the configured affiliate link.
const ROKOMARI_AFFILIATE_URL='https://www.rokomari.com/?affId=9A0ROR69O010Ai5&affs=72819&cma=604800';
document.querySelectorAll('.copy-coupon').forEach(button=>{
 button.addEventListener('click',async()=>{
  const code=button.dataset.code||'';
  const originalLabel=button.textContent;
  button.disabled=true;
  button.textContent='Copying…';
  let copied=false;
  try{
   if(navigator.clipboard&&window.isSecureContext){
    await navigator.clipboard.writeText(code);
    copied=true;
   }else{
    const field=document.createElement('textarea');
    field.value=code;field.setAttribute('readonly','');
    field.style.position='fixed';field.style.opacity='0';
    document.body.appendChild(field);field.select();
    copied=document.execCommand('copy');field.remove();
   }
  }catch(error){
   try{
    const field=document.createElement('textarea');
    field.value=code;field.setAttribute('readonly','');
    field.style.position='fixed';field.style.opacity='0';
    document.body.appendChild(field);field.select();
    copied=document.execCommand('copy');field.remove();
   }catch(fallbackError){copied=false;}
  }
  button.textContent=copied?'Copied! Redirecting…':'Opening Rokomari…';
  // Give the clipboard operation a moment to complete before navigating.
  const destination=button.dataset.redirectUrl||ROKOMARI_AFFILIATE_URL;
  window.setTimeout(()=>{window.location.assign(destination);},450);
 });
});
// Close mobile navigation after choosing a destination.
if(nav){nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');if(menu)menu.setAttribute('aria-expanded','false');}));}


// Hourly deterministic product rotation. Every visitor sees the same selection
// during a given local hour; the selection changes when the next hour begins.
const hourlyTracks=[...document.querySelectorAll('[data-hourly-rotate="true"][data-feed]')];
const hourlyCache=new Map();
const localHourSeed=()=>{
 const d=new Date();
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0'),String(d.getHours()).padStart(2,'0')].join('-');
};
const hashSeed=value=>{
 let h=2166136261;
 for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}
 return h>>>0;
};
const seededRandom=seed=>{
 let x=seed>>>0;
 return ()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
};
const hourlyShuffle=(items,seed)=>{
 const out=items.slice(),rand=seededRandom(seed);
 for(let i=out.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
 return out;
};
const makeProductCard=(product)=>{
 const article=document.createElement('article');article.className='product-card';
 const url='/'+String(product.product_url||'').replace(/^\/+/,'');
 const imageUrl='/'+String(product.image_small||product.image||'').replace(/^\/+/,'');
 const imageLink=document.createElement('a');imageLink.href=url;imageLink.setAttribute('aria-label',product.title||'View product');
 const image=document.createElement('img');image.src=imageUrl;image.alt=product.title||'Rokomari product';image.width=220;image.height=220;image.loading='lazy';image.decoding='async';imageLink.append(image);
 const body=document.createElement('div');body.className='product-card-body';
 const title=document.createElement('h3');const titleLink=document.createElement('a');titleLink.href=url;titleLink.textContent=product.title||'View product';title.append(titleLink);body.append(title);
 if(product.category_scraped){const meta=document.createElement('p');meta.className='meta';meta.textContent=product.category_scraped;body.append(meta);}
 const price=Number(product.selling_price||0);
 if(price>0){const priceEl=document.createElement('p');priceEl.className='price';priceEl.textContent='৳'+price.toLocaleString('en-BD');body.append(priceEl);}
 const details=document.createElement('a');details.className='card-button';details.href=url;details.textContent='View details';body.append(details);
 article.append(imageLink,body);return article;
};
const makeSeeMore=(url)=>{
 const a=document.createElement('a');a.className='product-card see-more-card';a.href=url||'/rokomari-best-seller/';
 const icon=document.createElement('span');icon.className='see-more-icon';icon.textContent='→';
 const strong=document.createElement('strong');strong.textContent='See more';
 const small=document.createElement('small');small.textContent='Explore all deals';
 a.append(icon,strong,small);return a;
};
const renderHourlyTrack=async track=>{
 const feed=track.dataset.feed;
 try{
  let products=hourlyCache.get(feed);
  if(!products){const response=await fetch(feed,{cache:'no-cache'});if(!response.ok)throw new Error('Feed unavailable');const data=await response.json();products=Array.isArray(data)?data:(data.products||[]);hourlyCache.set(feed,products);}
  const seed=hashSeed(localHourSeed()+'|'+feed);
  const chosen=hourlyShuffle(products,seed).slice(0,11);
  if(!chosen.length)return;
  const fragment=document.createDocumentFragment();
  chosen.forEach(product=>fragment.append(makeProductCard(product)));
  fragment.append(makeSeeMore(track.dataset.seeMore));
  track.replaceChildren(fragment);
  track.scrollLeft=0;
  track.dataset.rotationSeed=localHourSeed();
 }catch(error){console.warn('Hourly product rotation could not load:',feed,error);}
};
const refreshHourlyTracks=()=>hourlyTracks.forEach(renderHourlyTrack);
if(hourlyTracks.length){
 refreshHourlyTracks();
 const scheduleNextHour=()=>{
  const now=new Date(),next=new Date(now);
  next.setHours(now.getHours()+1,0,0,0);
  window.setTimeout(()=>{refreshHourlyTracks();scheduleNextHour();},Math.max(1000,next-now+150));
 };
 scheduleNextHour();
}

})();