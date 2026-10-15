/* MVC Modular Van Racking microsite — behaviour */
(function(){
  'use strict';
  var doc=document, root=doc.documentElement, body=doc.body;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $=function(s,c){return (c||doc).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||doc).querySelectorAll(s))};
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};


  /* ---------- light / dark ----------
     Same behaviour and storage key as the MVC configurator, and both sit on
     mackworthvc.github.io, so a choice made on one carries to the other. */
  (function(){
    var KEY='mvcs-theme';
    var mq=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
    function rd(){try{return localStorage.getItem(KEY)}catch(e){return null}}
    function wr(v){try{localStorage.setItem(KEY,v)}catch(e){}}
    function apply(mode){
      var dark=(mode==='dark');
      root.setAttribute('data-theme',dark?'dark':'light');
      var b=$('#theme-toggle');
      if(b){b.setAttribute('aria-checked',String(dark));b.title=dark?'Switch to light mode':'Switch to dark mode'}
    }
    apply(rd() || ((mq&&mq.matches)?'dark':'light'));
    if(mq&&mq.addEventListener)mq.addEventListener('change',function(e){if(!rd())apply(e.matches?'dark':'light')});
    var b=$('#theme-toggle');
    if(b)b.addEventListener('click',function(){
      var next=root.getAttribute('data-theme')==='dark'?'light':'dark';
      wr(next);apply(next);
    });
  })();

  /* ---------- tile menu ---------- */
  var menuBtn=$('#menu-btn'), menu=$('#menu');
  function setMenu(open){
    body.classList.toggle('menu-open',open);
    menuBtn.setAttribute('aria-expanded',String(open));
    menu.setAttribute('aria-hidden',String(!open));
    $('#menu-label').textContent=open?'Close':'Menu';
  }
  if(menuBtn&&menu){
    menuBtn.addEventListener('click',function(){setMenu(!body.classList.contains('menu-open'))});
    $$('a',menu).forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
    doc.addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});
  }

  /* ---------- process line draw-in ---------- */
  if('IntersectionObserver' in window){
    var po=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');po.unobserve(e.target)}})},{threshold:.3});
    $$('.process').forEach(function(el){po.observe(el)});
  } else { $$('.process').forEach(function(el){el.classList.add('is-in')}) }

  /* ---------- current chapter in the nav ---------- */
  var chapLbl=$('#nav-chapter b');
  if(chapLbl&&'IntersectionObserver' in window){
    var cho=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting) chapLbl.textContent=e.target.getAttribute('data-chapter') });
    },{rootMargin:'-45% 0px -50% 0px'});
    $$('[data-chapter]').forEach(function(s){cho.observe(s)});
  }

  /* ---------- pinned sequences ----------
     Any [data-seq] section: the stage stays pinned while the track scrolls,
     and scroll position picks the active step. Steps are [data-step] buttons;
     images [data-seq-img] and panels [data-seq-panel] follow by index.        */
  var seqs=$$('[data-seq]').map(function(sec){
    var s={sec:sec,track:$('.seq__track',sec),imgs:$$('[data-seq-img]',sec),btns:$$('[data-step]',sec),panels:$$('[data-seq-panel]',sec),idx:-1};
    var n=s.imgs.length;
    s.btns.forEach(function(b){
      b.addEventListener('click',function(){
        var i=parseInt(b.getAttribute('data-step'),10);
        var top=s.track.getBoundingClientRect().top+scrollY, span=s.track.offsetHeight-innerHeight;
        scrollTo({top:top+span*((i+.5)/n),behavior:reduce?'auto':'smooth'});
        setSeq(s,i);
      });
    });
    setSeq(s,0);
    return s;
  });
  function setSeq(s,i){
    if(i===s.idx)return; s.idx=i;
    s.imgs.forEach(function(im,k){im.classList.toggle('is-on',k===i)});
    s.btns.forEach(function(b){ if(parseInt(b.getAttribute('data-step'),10)===i)b.setAttribute('aria-current','step'); else b.removeAttribute('aria-current') });
    s.panels.forEach(function(p,k){p.hidden=k!==i});
    var d=s.imgs[i].dataset, sec=s.sec, el;
    if((el=$('.js-l',sec)))el.textContent=d.l;
    if((el=$('.js-h',sec)))el.textContent=d.h;
    if((el=$('.js-d',sec)))el.textContent=d.d;
    if((el=$('.ruler',sec))){el.style.setProperty('--h',s.imgs[i].style.getPropertyValue('--h'));$('.ruler__lbl',sec).textContent=d.h+' mm'}
    var dl=$('.dim--l b',sec);
    if(dl)dl.textContent=d.l+' mm';
    measure(s,i);
  }

  /* the rendered image is centred and sized by its own aspect, so read its real
     box and hand the width/offset to the dimension lines */
  function measure(s,i){
    var box=$('.seq__imgs',s.sec); if(!box)return;
    var im=s.imgs[i];
    var go=function(){
      var br=box.getBoundingClientRect(), ir=im.getBoundingClientRect();
      if(!ir.width)return;
      box.style.setProperty('--iw',Math.round(ir.width)+'px');
      box.style.setProperty('--il',Math.round(ir.left-br.left)+'px');
      box.style.setProperty('--itop',Math.round(ir.top-br.top)+'px');
      box.style.setProperty('--dw',Math.round(Math.min(90,Math.max(50,ir.width*.18)))+'px');
      box.classList.add('is-measured');
    };
    /* the image animates in with a scale, so read it again once that settles */
    var run=function(){requestAnimationFrame(go);clearTimeout(s._mt);s._mt=setTimeout(go,950)};
    if(im.complete)run(); else im.addEventListener('load',run,{once:true});
  }

  /* ---------- scroll loop: progress, hero, parallax, sequences ---------- */
  var bar=$('.progress span'), nav=$('.nav'), heroImg=$('.hero__img img'), heroC=$('.hero__content');
  var plx=$$('[data-parallax]');
  var ticking=false;
  function frame(){
    ticking=false;
    var y=scrollY, vh=innerHeight, max=root.scrollHeight-vh;
    if(bar)bar.style.transform='scaleX('+(max>0?y/max:0)+')';
    if(nav)nav.classList.toggle('is-solid',y>40);
    if(!reduce){
      if(heroImg&&y<vh*1.2){
        var p=clamp(y/vh,0,1);
        heroImg.style.transform='translateY('+(p*8)+'%)';
        if(heroC){heroC.style.transform='translateY('+(-p*60)+'px)';heroC.style.opacity=String(1-p*1.1)}
      }
      for(var i=0;i<plx.length;i++){
        var el=plx[i], r=el.parentElement.getBoundingClientRect();
        if(r.bottom<-200||r.top>vh+200)continue;
        el.style.transform='translateY('+((r.top+r.height/2-vh/2)*parseFloat(el.getAttribute('data-parallax')))+'px)';
      }
    }
    for(var k=0;k<seqs.length;k++){
      var s=seqs[k], tr=s.track.getBoundingClientRect();
      if(tr.bottom<0||tr.top>vh)continue;
      var sp=clamp(-tr.top/(tr.height-vh),0,.9999);
      setSeq(s,Math.floor(sp*s.imgs.length));
    }
  }
  function onScroll(){ if(!ticking){ticking=true;requestAnimationFrame(frame)} }
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',function(){for(var i=0;i<seqs.length;i++)measure(seqs[i],seqs[i].idx);onScroll()});
  frame();
})();
