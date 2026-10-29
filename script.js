/* 1) Live code wallpaper + parallax   2) JARVIS demo */
(function(){
  var root=document.documentElement,cv=document.getElementById('code'),cx=cv.getContext('2d'),img=document.getElementById('bgimg');
  var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var snip=['import speech_recognition as sr','def listen():','    with sr.Microphone() as src:','        audio = r.listen(src)','    return r.recognize_google(audio)','if "youtube" in cmd:','    webbrowser.open("youtube.com")','from langchain import LLMChain','plan = chain.run(tasks=todo)','SELECT name, score FROM results','WHERE year = 2026 ORDER BY score;','const res = await fetch(url);','df = pd.read_csv("data.csv")','model.fit(X_train, y_train)','git commit -m "ship it"','<div class="row flex">','display: grid; gap: 1rem;','while True: speak(reply)','print(datetime.now())','return {"status": "ok"}'];
  var re=/\b(import|from|def|return|if|in|while|True|const|await|SELECT|FROM|WHERE|ORDER|BY)\b|("[^"]*")|([A-Za-z_]+(?=\())/g;
  function segs(l){var o=[],i=0,m;re.lastIndex=0;l=l.slice(0,38);
    while((m=re.exec(l))){if(m.index>i)o.push({t:l.slice(i,m.index),c:'t'});o.push({t:m[0],c:m[1]?'k':m[2]?'s':'f'});i=m.index+m[0].length;}
    if(i<l.length)o.push({t:l.slice(i),c:'t'});return o;}
  var W,H,layers=[],conf=[{s:12,a:.10,sp:16,par:.18},{s:15,a:.12,sp:30,par:.4},{s:19,a:.12,sp:52,par:.75}];
  function dark(){return root.dataset.theme==='dark'||(root.dataset.theme!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);}
  function build(){
    W=innerWidth;H=innerHeight;var d=Math.min(devicePixelRatio||1,2);
    cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);layers=[];
    conf.forEach(function(c,li){
      cx.font=c.s+'px "JetBrains Mono",monospace';var cw=cx.measureText('M').width,colw=cw*40,n=Math.ceil(W/colw),L={c:c,cw:cw,lh:Math.round(c.s*1.5),font:cx.font,st:[]};
      for(var i=0;i<n;i++){var lines=[];for(var j=0;j<36;j++)lines.push(segs(snip[(i*7+j*3+li*5)%snip.length]));
        L.st.push({x:i*colw+(li*37)%colw*.3,lines:lines,k:.8+((i*13+li)%5)/10,o:(i*211+li*97)%900});}
      layers.push(L);});
  }
  function draw(t){
    var sy=scrollY,p=dark()?{t:'#B3ABDA',k:'#F2B632',s:'#6EE7B7',f:'#A99BFF'}:{t:'#4A3F8A',k:'#B45309',s:'#047857',f:'#5B2FD1'};
    cx.clearRect(0,0,W,H);
    layers.forEach(function(L){
      cx.font=L.font;cx.globalAlpha=L.c.a*(W<700?.6:1);
      L.st.forEach(function(S){
        var tot=S.lines.length*L.lh,off=((t*L.c.sp*S.k+sy*L.c.par+S.o)%tot+tot)%tot,first=Math.floor(off/L.lh),fy=-(off%L.lh),n=Math.ceil(H/L.lh)+1;
        for(var i=0;i<n;i++){var ln=S.lines[(first+i)%S.lines.length],x=S.x,y=fy+i*L.lh+L.c.s,fr=Math.min(1,Math.max(0,(H-y)/(H*.3))),tot=0,lim,k,tx;
          if(fr<=0)continue;for(k=0;k<ln.length;k++)tot+=ln[k].t.length;lim=Math.ceil(tot*fr);
          for(k=0;k<ln.length&&lim>0;k++){tx=ln[k].t.slice(0,lim);lim-=tx.length;cx.fillStyle=p[ln[k].c];cx.fillText(tx,x,y);x+=tx.length*L.cw;}
          if(fr<1){cx.fillStyle=p.k;cx.globalAlpha=Math.min(.55,L.c.a*4);cx.fillRect(x+1,y-L.c.s+2,L.cw*.6,L.c.s);cx.globalAlpha=L.c.a*(W<700?.6:1);}}
      });});
    cx.globalAlpha=1;
    if(!still&&img&&sy<H*1.6)img.style.transform='translate3d(0,'+(sy*.22).toFixed(1)+'px,0) scale(1.12)';
  }
  function loop(t){draw(t/1000);requestAnimationFrame(loop);}
  build();
  var rt;addEventListener('resize',function(){cancelAnimationFrame(rt);rt=requestAnimationFrame(function(){build();if(still)draw(0);});});
  if(still){draw(0);matchMedia('(prefers-color-scheme: dark)').addEventListener&&matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){draw(0);});}
  else requestAnimationFrame(loop);
})();

(function(){
  var out=document.getElementById('out'),inp=document.getElementById('inp'),term=document.getElementById('term'),stat=document.getElementById('stat'),mic=document.getElementById('mic'),vo=document.getElementById('vo'),timer=null,listening=false;
  var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sites={youtube:'https://www.youtube.com',facebook:'https://www.facebook.com',instagram:'https://www.instagram.com'};
  function state(s){stat.textContent=s;term.classList.toggle('live',s!=='idle');}
  function answer(raw){
    var c=raw.toLowerCase(),d=new Date(),k;
    if(/\b(hi|hello|hey)\b/.test(c)||c.indexOf('who are you')>-1)return{t:'Hello, I’m JARVIS, a voice assistant built by Shushant. Say “help” to see what I can do.'};
    if(c.indexOf('plan')>-1||c.indexOf('study')>-1)return{t:'Here’s a sample study plan:\nMon  DSA practice (2h), DBMS revision (1h)\nTue  Project sprint (3h)\nWed  Operating Systems notes (2h)\nThu  SQL practice (1.5h), mock test\nFri  Review and catch-up'};
    for(k in sites)if(c.indexOf(k)>-1)return{t:'Opening '+k+'…',link:{label:'Open '+k,href:sites[k]}};
    if(c.indexOf('time')>-1)return{t:'It’s '+d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+'.'};
    if(/\bday\b/.test(c)&&c.indexOf('date')<0)return{t:'Today is '+d.toLocaleDateString([],{weekday:'long'})+'.'};
    if(/date|today|calendar|month/.test(c))return{t:'It’s '+d.toLocaleDateString([],{weekday:'long',day:'numeric',month:'long',year:'numeric'})+'.'};
    if(c.indexOf('help')>-1)return{t:'Try: “what time is it”, “what day is it”, “what’s the date”, “open youtube”, “open instagram” or “plan my study week”.'};
    return{t:'I don’t know that one yet. Say “help” to see what I can do.'};
  }
  function run(raw,gesture){
    raw=(raw||'').trim();if(!raw)return;
    if(timer)clearInterval(timer);
    var a=answer(raw),i=0;
    if(window.speechSynthesis)speechSynthesis.cancel();
    out.innerHTML='';
    var p1=document.createElement('span');p1.className='p';p1.textContent='you> ';
    var p2=document.createElement('span');p2.className='p';p2.textContent='jarvis> ';
    var body=document.createTextNode(''),caret=document.createElement('span');caret.className='caret';
    out.append(p1,document.createTextNode(raw+'\n'),p2,body,caret);
    if(a.link&&gesture)try{window.open(a.link.href,'_blank','noopener');}catch(e){}
    state('thinking');
    function done(){
      body.nodeValue=a.t;
      if(a.link){var l=document.createElement('a');l.href=a.link.href;l.target='_blank';l.rel='noopener';l.textContent=a.link.label;out.append(document.createTextNode('\n'),l);}
      if(vo.checked&&window.speechSynthesis){var u=new SpeechSynthesisUtterance(a.t);u.onend=function(){state('idle');};u.onerror=u.onend;state('speaking');speechSynthesis.speak(u);}
      else state('idle');
    }
    if(still){done();return;}
    timer=setInterval(function(){i+=2;body.nodeValue=a.t.slice(0,i);if(i>=a.t.length){clearInterval(timer);done();}},22);
  }
  document.getElementById('cmds').addEventListener('click',function(e){var b=e.target.closest('button');if(b){inp.value=b.getAttribute('data-c');run(b.getAttribute('data-c'),true);}});
  document.getElementById('send').addEventListener('click',function(){run(inp.value,true);});
  inp.addEventListener('keydown',function(e){if(e.key==='Enter')run(inp.value,true);});
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(SR){
    mic.hidden=false;var rec=new SR();rec.lang='en-IN';rec.interimResults=false;
    rec.onresult=function(e){var t=e.results[0][0].transcript;inp.value=t;listening=false;run(t,false);};
    rec.onerror=function(){listening=false;state('idle');out.textContent='I couldn’t use the microphone here. Type a command instead.';};
    rec.onend=function(){if(listening){listening=false;state('idle');}};
    mic.addEventListener('click',function(){
      if(listening){rec.stop();return;}
      try{rec.start();listening=true;state('listening');out.textContent='Listening…';}catch(e){}
    });
  }
})();
