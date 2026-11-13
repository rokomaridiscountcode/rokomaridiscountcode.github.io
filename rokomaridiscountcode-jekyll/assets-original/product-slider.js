/* Reusable JSON Product Slider */
(function(){
  'use strict';

  function money(v){
    const n=Number(v)||0;
    return n ? '৳'+new Intl.NumberFormat('en-BD').format(Math.round(n)) : '';
  }

  function getBase(){
    const meta=document.querySelector('meta[name="site-base"]');
    if(meta && meta.content!==undefined) return meta.content.replace(/\/$/,'');
    if(window.SITE_BASE!==undefined) return String(window.SITE_BASE).replace(/\/$/,'');
    const el=document.querySelector('[data-site-base]');
    if(el) return String(el.dataset.siteBase||'').replace(/\/$/,'');
    return '';
  }

  function resolveSiteUrl(value){
    if(!value) return '';
    const raw=String(value).trim();
    if(/^https?:\/\//i.test(raw) || raw.startsWith('//')) return raw;
    const base=getBase();
    if(raw.startsWith('/')) return raw;
    return (base ? base+'/' : '/') + raw.replace(/^\/+/, '');
  }

  function normalisePayload(payload){
    if(Array.isArray(payload)) return payload;
    if(payload && Array.isArray(payload.products)) return payload.products;
    return [];
  }

  function makeCard(product, priority=false){
    const card=document.createElement('article');
    card.className='product-slider-card';

    const title=String(product.title||'Product').trim();
    const href=resolveSiteUrl(product.product_url || product.site_url || '');
    const rawImageSmall=product.image_small||product.image||product.image_url||'';
    const image=/^https?:\/\//i.test(String(rawImageSmall)) ? String(rawImageSmall) : resolveSiteUrl(rawImageSmall);
    const seller=String(product.seller||'').trim();
    const category=String(product.category||'').trim();
    const current=Number(product.selling_price)||0;
    const old=Number(product.original_price)||0;
    const discount=Number(product.discount)||0;
    const showPrices = window.SHOW_PRODUCT_PRICES !== false;

    card.innerHTML=`
      <span class="product-slider-badge">Promo</span>
      <a href="${escapeHtml(href)}" class="product-slider-image-link" aria-label="${escapeHtml(title)}">
        <div class="product-slider-image">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" width="240" height="240" loading="lazy" decoding="async" sizes="(max-width:480px) 82vw, (max-width:700px) 45vw, (max-width:980px) 30vw, 240px">
        </div>
      </a>
      <div class="product-slider-body">
        <h3 class="product-slider-title" title="${escapeHtml(title)}">${escapeHtml(title)}</h3>
        ${product.description ? `<p class="product-slider-description">${escapeHtml(String(product.description))}</p>` : ''}
        <p class="product-slider-meta">${escapeHtml([category,seller].filter(Boolean).join(' • '))}</p>
        ${showPrices ? `<div class="product-slider-price">
          ${current ? `<span class="product-slider-current">${escapeHtml(money(current))}</span>` : ''}
          ${old>current ? `<span class="product-slider-old">${escapeHtml(money(old))}</span>` : ''}
          ${discount>0 ? `<span class="product-slider-discount">${escapeHtml(discount+'% OFF')}</span>` : ''}
        </div>` : ''}
        ${href ? `<a class="product-slider-link" href="${escapeHtml(href)}">বিস্তারিত দেখুন</a>` : ''}
      </div>`;

    const img=card.querySelector('img');
    if(img){
      img.loading = priority ? 'eager' : 'lazy';
      img.decoding = 'async';
      if(priority) img.fetchPriority = 'high';
      img.addEventListener('error',()=>{img.style.visibility='hidden';});
    }
    return card;
  }

  function escapeHtml(value){
    return String(value==null?'':value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function makeSeeMoreCard(title, href){
    const card=document.createElement('article');
    card.className='product-slider-card product-slider-see-more';
    card.innerHTML=`
      <div class="product-slider-see-more-content">
        <span class="product-slider-see-more-icon" aria-hidden="true">→</span>
        <h3>আরও পণ্য দেখুন</h3>
        <p>${escapeHtml(title || 'এই ক্যাটাগরির আরও পণ্য দেখুন')}</p>
        <a class="product-slider-see-more-link" href="${escapeHtml(href)}">ক্যাটাগরি দেখুন</a>
      </div>`;
    return card;
  }

  const HOMEPAGE_PRODUCT_LIMIT = 10;

  // Stable randomization for each local hour: date + hour + category/source.
  function getHourlySeed(source){
    const now=new Date();
    const seedText=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}:${String(source||'')}`;
    let hash=2166136261;
    for(let i=0;i<seedText.length;i++){
      hash^=seedText.charCodeAt(i);
      hash=Math.imul(hash,16777619);
    }
    return hash>>>0;
  }

  function seededRandom(seed){
    return function(){
      seed|=0;
      seed=seed+0x6D2B79F5|0;
      let t=Math.imul(seed^(seed>>>15),1|seed);
      t=t+Math.imul(t^(t>>>7),61|t)^t;
      return ((t^(t>>>14))>>>0)/4294967296;
    };
  }

  function shuffleWithSeed(items,seed){
    const shuffled=items.slice();
    const random=seededRandom(seed);
    for(let i=shuffled.length-1;i>0;i--){
      const j=Math.floor(random()*(i+1));
      [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
    }
    return shuffled;
  }

  async function mount(root){
    const source=root.dataset.source;
    if(!source){root.innerHTML='<div class="product-slider-status">No product data source specified.</div>';return;}
    root.innerHTML='<div class="product-slider-loading" aria-label="পণ্য লোড হচ্ছে"><div class="product-slider-skeleton-heading"></div><div class="product-slider-skeleton-track">'+Array.from({length:4},()=>'<div class="product-slider-skeleton-card"><div class="skeleton skeleton-image"></div><div class="skeleton skeleton-line wide"></div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line short"></div><div class="skeleton skeleton-button"></div></div>').join('')+'</div></div>';
    try{
      const response=await fetch(resolveSiteUrl(source),{cache:'no-store',headers:{'Accept':'application/json','Cache-Control':'no-cache'}});
      if(!response.ok) throw new Error('HTTP '+response.status);
      const products=normalisePayload(await response.json());
      if(!products.length){root.innerHTML='<div class="product-slider-status">এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।</div>';return;}

      const title=root.dataset.title || 'Rokomari Promo Code For Best Seller';
      root.innerHTML=`<div class="product-slider-inner">
        <div class="product-slider-heading">
          <h2>${escapeHtml(title)}</h2>
          <div class="product-slider-controls">
            <button type="button" class="product-slider-control prev" aria-label="Previous products">‹</button>
            <button type="button" class="product-slider-control next" aria-label="Next products">›</button>
          </div>
        </div>
        <div class="product-slider-viewport"><div class="product-slider-track"></div></div>
      </div>`;
      const track=root.querySelector('.product-slider-track');

      // Homepage shows exactly 10 products, selected and ordered deterministically
      // from the current date + hour + category. The set changes once per hour.
      const hourlySeed=getHourlySeed(source);
      const previewProducts=shuffleWithSeed(products,hourlySeed).slice(0,HOMEPAGE_PRODUCT_LIMIT);
      previewProducts.forEach((p,i)=>track.appendChild(makeCard(p, i < 2)));

      const moreUrl=String(root.dataset.moreUrl || '').trim();
      if(moreUrl){
        track.appendChild(makeSeeMoreCard(title, moreUrl));
      }

      const sliderItems=[...track.children];
      let index=0;
      const prev=root.querySelector('.prev'),next=root.querySelector('.next');
      function visible(){
        if(window.innerWidth<=480) return 1;
        if(window.innerWidth<=700) return 2;
        if(window.innerWidth<=980) return 3;
        return 4;
      }
      function step(){
        const cards=sliderItems;
        if(!cards.length)return 0;
        const gap=parseFloat(getComputedStyle(track).gap)||12;
        return cards[0].getBoundingClientRect().width+gap;
      }
      function update(){
        const max=Math.max(0,sliderItems.length-visible());
        index=Math.min(index,max);
        track.style.transform=`translateX(-${index*step()}px)`;
        prev.disabled=index<=0; next.disabled=index>=max;
      }
      prev.addEventListener('click',()=>{index--;update();});
      next.addEventListener('click',()=>{index++;update();});
      const viewport=root.querySelector('.product-slider-viewport');
      let startX=0,lastX=0,dragging=false,didDrag=false,activePointerId=null;
      function finishDrag(){
        if(!dragging)return;
        dragging=false;viewport.classList.remove('is-dragging');
        const moved=lastX-startX;
        didDrag=Math.abs(moved)>35;
        if(didDrag) index += moved<0 ? 1 : -1;
        update();
      }
      viewport.addEventListener('pointerdown',event=>{
        // Horizontal dragging is intentionally touch-only. Desktop uses the
        // navigation buttons so links/buttons remain completely native.
        if(window.innerWidth > 700) return;
        // Links/buttons must always receive a normal click. Only empty/card
        // space starts the horizontal drag gesture.
        if(event.target.closest('a,button')) return;
        if(event.pointerType==='mouse') return;
        if(event.button!==undefined && event.button!==0)return;
        dragging=true;didDrag=false;activePointerId=event.pointerId;
        startX=lastX=event.clientX;viewport.classList.add('is-dragging');
        try{viewport.setPointerCapture(event.pointerId);}catch(e){}
      });
      viewport.addEventListener('pointermove',event=>{if(dragging && event.pointerId===activePointerId)lastX=event.clientX;});
      viewport.addEventListener('pointerup',event=>{if(event.pointerId===activePointerId)finishDrag();});
      viewport.addEventListener('pointercancel',event=>{if(event.pointerId===activePointerId)finishDrag();});
      viewport.addEventListener('click',event=>{
        if(didDrag){event.preventDefault();event.stopPropagation();didDrag=false;}
      },true);
      window.addEventListener('resize',update,{passive:true});

      // If the page stays open, refresh the selection exactly when the local
      // clock enters the next hour so the hourly randomizer is visible without
      // requiring a manual reload.
      clearTimeout(root._hourlyRefreshTimer);
      const now=new Date();
      const nextHour=new Date(now);
      nextHour.setMinutes(60,0,0);
      root._hourlyRefreshTimer=setTimeout(()=>mount(root),Math.max(1000,nextHour-now+500));

      update();
    }catch(error){
      console.error('Product slider:',error);
      root.innerHTML='<div class="product-slider-status">পণ্যগুলো লোড করা যায়নি।</div>';
    }
  }

  function init(){
    const roots=[...document.querySelectorAll('[data-product-slider]')];
    if(!roots.length) return;
    mount(roots[0]);
    if(roots.length===1) return;
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            observer.unobserve(entry.target);
            entry.target.classList.remove('is-deferred');
            mount(entry.target);
          }
        });
      },{rootMargin:'900px 0px'});
      roots.slice(1).forEach(root=>{
        root.classList.add('is-deferred');
        observer.observe(root);
      });
    }else{
      roots.slice(1).forEach(mount);
    }
  }
  window.ProductSlider={mount:mount,init:init};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
