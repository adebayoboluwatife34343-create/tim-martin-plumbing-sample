(function(){
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var strip=document.querySelector('.strip');
addEventListener('scroll',function(){strip.classList.toggle('solid',scrollY>40)},{passive:true});
// sheet nav
var btn=document.getElementById('sheetBtn'),sheet=document.getElementById('sheet');
function setSheet(o){btn.setAttribute('aria-expanded',o);if(o){sheet.hidden=false;requestAnimationFrame(function(){sheet.classList.add('open')});sheet.querySelector('a').focus()}else{sheet.classList.remove('open');setTimeout(function(){if(!sheet.classList.contains('open'))sheet.hidden=true},RM?0:600)}}
btn.onclick=function(){setSheet(btn.getAttribute('aria-expanded')!=='true')};
sheet.querySelectorAll('a').forEach(function(a){a.onclick=function(){setSheet(false)}});
addEventListener('keydown',function(e){if(e.key==='Escape'&&btn.getAttribute('aria-expanded')==='true'){setSheet(false);btn.focus()}});
var num=document.getElementById('sheetNum');
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var n=e.target.dataset.sheet;num.textContent='SHEET '+n+'/05';sheet.querySelectorAll('a').forEach(function(a){a.classList.toggle('cur',a.dataset.n===n)})}})},{rootMargin:'-45% 0px -50% 0px'});
document.querySelectorAll('[data-sheet]').forEach(function(s){io.observe(s)});
// accordion
var parts=document.querySelectorAll('#parts button');
parts.forEach(function(b){b.onclick=function(){var o=b.getAttribute('aria-expanded')==='true';parts.forEach(function(x){x.setAttribute('aria-expanded','false')});b.setAttribute('aria-expanded',String(!o))}});
// hours (Nextdoor): Mon-Fri 08-18, Sat 08-13, Sun closed. index 0=Sun
var H={0:null,1:[8,18],2:[8,18],3:[8,18],4:[8,18],5:[8,18],6:[8,13]};
var NAMES=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],FULL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function uk(){var p=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());var o={};p.forEach(function(x){o[x.type]=x.value});return{d:NAMES.indexOf(o.weekday),h:+o.hour%24,m:+o.minute,t:o.hour+':'+o.minute}}
window.__status=function(d,h,m){var now=h+m/60,r=H[d];if(r&&now>=r[0]&&now<r[1]){var left=r[1]-now;return{open:true,text:'Open now',sub:'Until '+r[1]+':00 today'+(left<1?', closing soon':'')}}
 if(r&&now<r[0])return{open:false,text:'Opens at 0'+r[0]+':00',sub:'Later today, '+FULL[d]};
 for(var i=1;i<8;i++){var dd=(d+i)%7;if(H[dd])return{open:false,text:'Closed now',sub:'Opens '+(i===1?'tomorrow':FULL[dd])+' at 0'+H[dd][0]+':00'}}};
var week=document.getElementById('week');
[1,2,3,4,5,6,0].forEach(function(d){var r=H[d],li=document.createElement('li');li.dataset.d=d;li.innerHTML='<b>'+NAMES[d]+'</b>'+(r?'0'+r[0]+'–'+r[1]:'Closed')+'<span class="bar">'+(r?'<i style="top:'+((r[0]-6)/14*100)+'%;bottom:'+((20-r[1])/14*100)+'%"></i>':'')+'</span>';week.appendChild(li)});
function tick(){var u=uk(),s=__status(u.d,u.h,u.m);
 document.getElementById('ukTime').textContent='UK time '+u.t+', '+FULL[u.d];
 document.getElementById('statusText').textContent=s.text;document.getElementById('statusSub').textContent=s.sub;
 ['bigDot'].forEach(function(id){document.getElementById(id).className='dot big '+(s.open?'open':'closed')});
 document.getElementById('liveTop').innerHTML='<i class="dot '+(s.open?'open':'closed')+'"></i><span>'+(s.open?'On the tools · until '+H[u.d][1]+':00':'Closed · '+s.sub.replace('Opens ','opens '))+'</span>';
 week.querySelectorAll('li').forEach(function(li){li.classList.toggle('today',+li.dataset.d===u.d);var old=li.querySelector('u');if(old)old.remove();if(+li.dataset.d===u.d){var y=(u.h+u.m/60-6)/14*100;if(y>=0&&y<=100){var n=document.createElement('u');n.style.top=y+'%';li.querySelector('.bar').appendChild(n)}}});
 var lb=document.getElementById('leakBtn');lb.textContent=s.open?'WhatsApp Tim about a leak, he is on now':'WhatsApp Tim, he will reply when back';
}
tick();setInterval(tick,30000);
// leak checklist feeds link
var steps=document.querySelectorAll('#steps input');
steps.forEach(function(c){c.onchange=function(){var done=[].filter.call(steps,function(x){return x.checked}).length;document.getElementById('leakBtn').href='https://wa.me/447496431395?text='+encodeURIComponent('Hi Tim, I have a leak. I have done '+done+' of 4 first steps (stopcock etc). Could you help?')}});
// counter
var st=document.querySelector('[data-count]');
new IntersectionObserver(function(es,o){if(es[0].isIntersecting){o.disconnect();var t=+st.dataset.count;if(RM){st.textContent=t;return}var s=performance.now();(function f(n){var k=Math.min(1,(n-s)/1400);st.textContent=Math.round(t*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(s)}}).observe(st);
// ticket form
var sel=document.getElementById('fDay');
(function(){var u=uk(),opts=['Any day'];for(var i=0;i<10&&opts.length<7;i++){var d=(u.d+i)%7;if(H[d])opts.push(i===0?'Today':i===1?'Tomorrow':FULL[d])}opts.forEach(function(o){var e=document.createElement('option');e.textContent=o;sel.appendChild(e)})})();
var f=document.getElementById('ticketForm'),pv=document.getElementById('preview');
function msg(){var job=f.querySelector('input[name=job]:checked').value;return 'Hi Tim, job ticket from your website:\nJob: '+job+'\nName: '+(fName.value||'...')+'\nArea: '+(fArea.value||'...')+'\nBest day: '+sel.value+(fMsg.value?'\nDetails: '+fMsg.value:'')}
function upd(){pv.textContent=msg()}f.addEventListener('input',upd);f.addEventListener('change',upd);upd();
f.onsubmit=function(e){e.preventDefault();var er=document.getElementById('err');if(!fName.value.trim()||!fArea.value.trim()){er.textContent='Please add your name and area so Tim knows who and where.';(fName.value.trim()?fArea:fName).focus();return}er.textContent='';window.__lastWa='https://wa.me/447496431395?text='+encodeURIComponent(msg());window.open(__lastWa,'_blank','noopener')};
})();
