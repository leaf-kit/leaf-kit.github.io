/* ============================================
   Claude Code Design Patterns v4
   ============================================ */
(function(){
'use strict';

var PATTERNS = {
  instruction: {
    nodes:['user','cli','commands','prompts','context','sysprompt','engine','api'],
    flow:[['n-user','n-cli'],['n-cli','n-commands'],['n-cli','n-prompts'],['n-prompts','n-context'],['n-context','n-sysprompt'],['n-sysprompt','n-engine'],['n-engine','n-api']],
    badges:{'badge-user':'📝 프롬프트','badge-prompts':'🧩 15섹션','badge-context':'📄 CLAUDE.md','badge-engine':'⚡ API 호출','badge-api':'☁️ 스트리밍'},
    terminal:{input:'claude "이 코드 분석해줘"',lines:[
      {t:'// Instruction Following Pattern',c:'t-comment'},
      {t:'getSystemPrompt()',c:'t-fn'},{t:'  Static(7): tools, tone, security → global cache',c:''},{t:'  Dynamic(8): memory, env, MCP → ephemeral',c:''},
      {t:'buildEffectiveSystemPrompt()',c:'t-fn'},{t:'  Override → Coordinator → Agent → Custom → Default',c:'t-str'},
      {t:'getUserContext() → CLAUDE.md 4-layer loaded',c:'t-fn'},{t:'getSystemContext() → git:main, 5 commits',c:'t-fn'},
      {t:'→ API call with assembled prompt...',c:'t-kw'}
    ]}
  },
  memory: {
    nodes:['user','cli','claudemd','memory','memdir','extract','context','engine','api'],
    flow:[['n-user','n-cli'],['n-cli','n-claudemd'],['n-claudemd','n-context'],['n-cli','n-memory'],['n-memory','n-engine'],['n-memdir','n-engine'],['n-engine','n-api'],['n-api','n-extract'],['n-extract','n-memdir']],
    badges:{'badge-user':'🧠 이전 대화','badge-memory':'💾 9-section','badge-engine':'⚡ 주입'},
    terminal:{input:'claude --resume "이어서 작업해줘"',lines:[
      {t:'// Context Memory Pattern',c:'t-comment'},
      {t:'getClaudeMds() → 4-level hierarchy',c:'t-fn'},{t:'  /etc → ~/.claude → project → local',c:''},
      {t:'loadMemoryPrompt() → .claude/MEMORY.md',c:'t-fn'},
      {t:'SessionMemory → 9-section template',c:'t-fn'},{t:'  Title, State, Files, Workflow, Errors...',c:'t-str'},
      {t:'extractMemories() → feedback|patterns|workflow|tech',c:'t-fn'},
      {t:'→ Background sub-agent updating...',c:'t-kw'}
    ]}
  },
  planning: {
    nodes:['user','engine','api','coordinator','agent','tools','executor'],
    flow:[['n-user','n-engine'],['n-engine','n-api'],['n-api','n-coordinator'],['n-coordinator','n-agent'],['n-agent','n-engine'],['n-coordinator','n-tools'],['n-tools','n-executor']],
    badges:{'badge-user':'🗺️ 복잡한 작업','badge-engine':'⚡ 쿼리 루프','badge-api':'☁️ LLM'},
    terminal:{input:'claude "전체 리팩토링 수행해줘"',lines:[
      {t:'// Planning & Reasoning Pattern',c:'t-comment'},
      {t:'Coordinator Mode activated',c:'t-kw'},
      {t:'Phase 1: Research (parallel)',c:'t-fn'},{t:'  → Agent(Explore) scanning src/...',c:'t-str'},{t:'  → Agent(Explore) scanning tests/...',c:'t-str'},
      {t:'Phase 2: Synthesis',c:'t-fn'},{t:'  → Concrete spec: 12 files, 34 changes',c:'t-str'},
      {t:'Phase 3: Implement & Verify',c:'t-fn'},{t:'  → Agent(general) implementing...',c:'t-str'},{t:'  → Agent(verify) PASS ✓',c:'t-str'}
    ]}
  },
  tooluse: {
    nodes:['engine','api','tools','executor','perms','mcp'],
    flow:[['n-api','n-engine'],['n-engine','n-tools'],['n-tools','n-perms'],['n-perms','n-executor'],['n-executor','n-engine'],['n-mcp','n-tools']],
    badges:{'badge-engine':'⚡ tool_use','badge-tools':'🔧 40+'},
    terminal:{input:'→ Tool: FileReadTool("src/main.ts")',lines:[
      {t:'// Tool Execution Pattern',c:'t-comment'},
      {t:'findToolByName("Read") → FileReadTool',c:'t-fn'},
      {t:'checkPermissions()',c:'t-fn'},{t:'  Layer 1: allowlist → ✓ matched',c:'t-str'},{t:'  → ALLOW',c:'t-str'},
      {t:'StreamingToolExecutor.addTool()',c:'t-fn'},{t:'  concurrent-safe → parallel queue',c:''},
      {t:'tool.call() → reading 245 lines...',c:'t-fn'},{t:'→ ToolResult(success)',c:'t-str'}
    ]}
  },
  refinement: {
    nodes:['api','engine','query','compact','hooks','messages','ink','output'],
    flow:[['n-api','n-engine'],['n-engine','n-query'],['n-query','n-compact'],['n-compact','n-query'],['n-query','n-hooks'],['n-hooks','n-messages'],['n-messages','n-ink'],['n-ink','n-output']],
    badges:{'badge-api':'☁️ 스트리밍','badge-output':'✅ 응답'},
    terminal:{input:'→ Context: 180K/200K tokens',lines:[
      {t:'// Refinement & Output Pattern',c:'t-comment'},
      {t:'shouldCompact() → true',c:'t-fn'},{t:'compact() → 9-item preservation',c:'t-fn'},
      {t:'  1.Request 2.Concepts 3.Code 4.Errors',c:'t-str'},{t:'  5.Journey 6.Messages 7.Tasks 8.State 9.Next',c:'t-str'},
      {t:'  → 180K → 25K tokens',c:'t-num'},
      {t:'postSamplingHooks() → filtered',c:'t-fn'},{t:'→ Streaming to terminal...',c:'t-kw'}
    ]}
  },
  permission: {
    nodes:['engine','tools','perms','executor'],
    flow:[['n-engine','n-tools'],['n-tools','n-perms'],['n-perms','n-executor'],['n-executor','n-engine']],
    badges:{'badge-tools':'🔧 BashTool'},
    terminal:{input:'→ Tool: BashTool("rm -rf /")',lines:[
      {t:'// Permission & Security Pattern',c:'t-comment'},
      {t:'BashTool.checkPermissions("rm -rf /")',c:'t-fn'},
      {t:'  Layer 1: Rule check → no match',c:'t-warn'},
      {t:'  Layer 2: tree-sitter AST parse',c:'t-fn'},
      {t:'    → rm: recursive, force, root',c:'t-err'},
      {t:'    → DANGEROUS',c:'t-err'},
      {t:'  → DENY: Permission refused',c:'t-err'}
    ]}
  },
  session: {
    nodes:['user','cli','session','engine','memory','extract'],
    flow:[['n-user','n-cli'],['n-cli','n-session'],['n-session','n-engine'],['n-engine','n-memory'],['n-memory','n-extract'],['n-extract','n-session']],
    badges:{},
    terminal:{input:'claude --resume session_abc123',lines:[
      {t:'// Session Persistence Pattern',c:'t-comment'},
      {t:'getSessionIdFromLog("abc123")',c:'t-fn'},
      {t:'  → .claude/sessions/abc123.jsonl',c:'t-str'},{t:'  → 47 messages restored',c:'t-str'},
      {t:'recordTranscript() → auto-saving',c:'t-fn'},{t:'→ Session resumed',c:'t-kw'}
    ]}
  },
  mcp: {
    nodes:['engine','tools','mcp','executor','perms'],
    flow:[['n-engine','n-tools'],['n-mcp','n-tools'],['n-tools','n-perms'],['n-perms','n-executor'],['n-executor','n-engine']],
    badges:{},
    terminal:{input:'→ mcp__github__search_repos',lines:[
      {t:'// MCP Extension Pattern',c:'t-comment'},
      {t:'getMcpToolsCommandsAndResources()',c:'t-fn'},{t:'  → 3 servers connected',c:'t-str'},
      {t:'assembleToolPool() → merge',c:'t-fn'},
      {t:'MCPTool.call() → forwarding...',c:'t-fn'},{t:'→ 12 repos found',c:'t-str'}
    ]}
  },
  compaction: {
    nodes:['engine','query','compact','extract','memdir','messages'],
    flow:[['n-engine','n-query'],['n-query','n-compact'],['n-compact','n-extract'],['n-extract','n-memdir'],['n-compact','n-query'],['n-query','n-messages']],
    badges:{},
    terminal:{input:'→ Auto-compact (180K/200K)',lines:[
      {t:'// Context Compaction Pattern',c:'t-comment'},
      {t:'shouldCompact() → threshold exceeded',c:'t-fn'},
      {t:'compact() → NO_TOOLS_PREAMBLE',c:'t-warn'},
      {t:'  9 items preserved',c:'t-fn'},
      {t:'→ 180,000 → 25,000 tokens',c:'t-num'}
    ]}
  },
  spawning: {
    nodes:['engine','coordinator','agent','api','tools','executor'],
    flow:[['n-engine','n-coordinator'],['n-coordinator','n-agent'],['n-agent','n-api'],['n-api','n-agent'],['n-agent','n-tools'],['n-tools','n-executor'],['n-agent','n-engine']],
    badges:{},
    terminal:{input:'→ Agent(Explore)',lines:[
      {t:'// Agent Spawning Pattern',c:'t-comment'},
      {t:'AgentTool.call({type:"Explore"})',c:'t-fn'},
      {t:'  Fork (parent cache shared)',c:'t-str'},
      {t:'  Prompt: "READ-ONLY search"',c:'t-str'},
      {t:'  Tools: Glob, Grep, Read',c:''},
      {t:'  → Sub-QueryEngine created',c:'t-fn'},
      {t:'→ Text response → parent',c:'t-kw'}
    ]}
  }
};

var allNodes=[], activePat=null, termAbort=null;

function init(){
  document.querySelectorAll('.dg-node').forEach(function(n){allNodes.push(n.id);});
  initTheme(); initLang(); initPatterns(); initFlowCanvas(); initThree(); initTips();
  applyLang();
  setTimeout(function(){selectPattern('instruction');},300);
}

/* Theme */
function initTheme(){
  var s=localStorage.getItem('dp-theme');
  if(s) document.documentElement.setAttribute('data-theme',s);
  updThemeIcon();
  document.getElementById('btn-theme').onclick=function(){
    var c=document.documentElement.getAttribute('data-theme');
    var n=c==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme',n);
    localStorage.setItem('dp-theme',n); updThemeIcon();
  };
}
function updThemeIcon(){document.getElementById('theme-icon').textContent=document.documentElement.getAttribute('data-theme')==='dark'?'☀️':'🌙';}

/* Language */
function initLang(){
  var s=localStorage.getItem('dp-lang');
  if(s) document.documentElement.setAttribute('data-lang',s);
  updLangLabel();
  document.getElementById('btn-lang').onclick=function(){
    var c=document.documentElement.getAttribute('data-lang');
    var n=c==='en'?'kr':'en';
    document.documentElement.setAttribute('data-lang',n);
    localStorage.setItem('dp-lang',n); updLangLabel(); applyLang();
  };
}
function updLangLabel(){document.getElementById('lang-label').textContent=document.documentElement.getAttribute('data-lang')==='en'?'KR':'EN';}
function applyLang(){
  var l=document.documentElement.getAttribute('data-lang')||'kr';
  document.querySelectorAll('[data-kr][data-en]').forEach(function(el){
    if(['STRONG','H2','SPAN','P'].indexOf(el.tagName)!==-1) el.textContent=el.getAttribute('data-'+l)||'';
  });
}

/* Patterns */
function initPatterns(){
  document.querySelectorAll('.pl-item').forEach(function(i){i.onclick=function(){selectPattern(i.dataset.pat);};});
  document.querySelectorAll('.pl-ex').forEach(function(e){e.onclick=function(ev){ev.stopPropagation();selectPattern(e.closest('.pl-item').dataset.pat);};});
}

function selectPattern(key){
  if(!PATTERNS[key])return;
  activePat=key;
  var P=PATTERNS[key];
  document.querySelectorAll('.pl-item').forEach(function(i){i.classList.toggle('active',i.dataset.pat===key);});
  allNodes.forEach(function(nid){
    var el=document.getElementById(nid); if(!el)return;
    el.classList.remove('dimmed','active-node','flow-node');
    if(P.nodes.indexOf(el.dataset.mod)!==-1) el.classList.add('flow-node');
    else el.classList.add('dimmed');
  });
  var first=document.getElementById('n-'+P.nodes[0]);
  if(first){first.classList.remove('flow-node');first.classList.add('active-node');}
  document.querySelectorAll('.nd-badge').forEach(function(b){b.classList.remove('show');b.textContent='';});
  Object.keys(P.badges||{}).forEach(function(bid){
    var b=document.getElementById(bid);
    if(b){b.textContent=P.badges[bid];setTimeout(function(){b.classList.add('show');},100);}
  });
  runTerminal(P.terminal);
  applyLang();
}

/* Flow Canvas */
var fCtx,fCanvas,fW,fH,fTime=0;
function initFlowCanvas(){
  fCanvas=document.getElementById('flow-canvas'); if(!fCanvas)return;
  fCtx=fCanvas.getContext('2d'); resizeF();
  window.addEventListener('resize',resizeF);
  requestAnimationFrame(drawF);
}
function resizeF(){
  var a=document.getElementById('panel-center'); if(!a)return;
  var r=a.getBoundingClientRect(); fW=r.width;fH=r.height;
  fCanvas.width=fW*devicePixelRatio;fCanvas.height=fH*devicePixelRatio;
  fCanvas.style.width=fW+'px';fCanvas.style.height=fH+'px';
  fCtx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
}
function nc(id){
  var e=document.getElementById(id),a=document.getElementById('panel-center');
  if(!e||!a)return null;
  var ar=a.getBoundingClientRect(),er=e.getBoundingClientRect();
  return{x:er.left-ar.left+er.width/2,y:er.top-ar.top+er.height/2};
}
function drawF(){
  requestAnimationFrame(drawF); fTime+=.014;
  fCtx.clearRect(0,0,fW,fH);
  if(!activePat||!PATTERNS[activePat])return;
  var P=PATTERNS[activePat];
  var dk=document.documentElement.getAttribute('data-theme')==='dark';
  var la=dk?.35:.2, ga=dk?.7:.5;

  P.flow.forEach(function(c,ci){
    var a=nc(c[0]),b=nc(c[1]); if(!a||!b)return;
    var dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy);
    var off=Math.min(d*.12,25);
    var cx=(a.x+b.x)/2+(dy/d)*off*(ci%2?1:-1);
    var cy=(a.y+b.y)/2-(dx/d)*off*(ci%2?1:-1);

    fCtx.beginPath();fCtx.moveTo(a.x,a.y);fCtx.quadraticCurveTo(cx,cy,b.x,b.y);
    fCtx.strokeStyle='rgba(99,102,241,'+la+')';fCtx.lineWidth=2.5;fCtx.stroke();

    var sp=.45+(ci%3)*.12, t=((fTime*sp+ci*.35)%1.5)/1.5;
    if(t>1)return;
    var px=(1-t)*(1-t)*a.x+2*(1-t)*t*cx+t*t*b.x;
    var py=(1-t)*(1-t)*a.y+2*(1-t)*t*cy+t*t*b.y;

    var g=fCtx.createRadialGradient(px,py,0,px,py,18);
    g.addColorStop(0,'rgba(99,102,241,'+ga+')');g.addColorStop(1,'rgba(99,102,241,0)');
    fCtx.fillStyle=g;fCtx.fillRect(px-18,py-18,36,36);
    fCtx.beginPath();fCtx.arc(px,py,4.5,0,Math.PI*2);fCtx.fillStyle='#6366F1';fCtx.fill();

    var t2=t-.07;if(t2>0){
      var px2=(1-t2)*(1-t2)*a.x+2*(1-t2)*t2*cx+t2*t2*b.x;
      var py2=(1-t2)*(1-t2)*a.y+2*(1-t2)*t2*cy+t2*t2*b.y;
      fCtx.beginPath();fCtx.arc(px2,py2,3,0,Math.PI*2);fCtx.fillStyle='rgba(99,102,241,.3)';fCtx.fill();
    }
    if(t>.9){
      var ang=Math.atan2(b.y-cy,b.x-cx);
      fCtx.save();fCtx.translate(b.x,b.y);fCtx.rotate(ang);
      fCtx.beginPath();fCtx.moveTo(0,0);fCtx.lineTo(-10,-5);fCtx.lineTo(-10,5);fCtx.closePath();
      fCtx.fillStyle='rgba(99,102,241,.5)';fCtx.fill();fCtx.restore();
    }
  });
}

/* Three.js Background */
function initThree(){
  var cv=document.getElementById('three-canvas');
  if(!cv||typeof THREE==='undefined')return;
  var area=document.getElementById('panel-center');
  var W=area.clientWidth,H=area.clientHeight;
  var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,W/H,.1,500);
  cam.position.z=30;
  var ren=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});
  ren.setSize(W,H);ren.setPixelRatio(Math.min(devicePixelRatio,2));ren.setClearColor(0,0);

  var N=100,pos=new Float32Array(N*3),col=new Float32Array(N*3),vel=[];
  var pal=[new THREE.Color(0x6366F1),new THREE.Color(0x818CF8),new THREE.Color(0xA5B4FC),new THREE.Color(0x8B5CF6)];
  for(var i=0;i<N;i++){
    pos[i*3]=(Math.random()-.5)*50;pos[i*3+1]=(Math.random()-.5)*35;pos[i*3+2]=(Math.random()-.5)*12;
    vel.push({x:(Math.random()-.5)*.01,y:(Math.random()-.5)*.01,z:(Math.random()-.5)*.005});
    var c=pal[i%pal.length];col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;
  }
  var geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  scene.add(new THREE.Points(geo,new THREE.PointsMaterial({size:.45,vertexColors:true,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false})));

  var mL=300,lp=new Float32Array(mL*6),lg=new THREE.BufferGeometry();
  lg.setAttribute('position',new THREE.BufferAttribute(lp,3));
  scene.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x6366F1,transparent:true,opacity:.03,blending:THREE.AdditiveBlending,depthWrite:false})));

  var mx=0,my=0;
  document.addEventListener('mousemove',function(e){mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2;});

  (function anim(){
    requestAnimationFrame(anim);
    for(var i=0;i<N;i++){
      pos[i*3]+=vel[i].x;pos[i*3+1]+=vel[i].y;pos[i*3+2]+=vel[i].z;
      if(Math.abs(pos[i*3])>25)vel[i].x*=-1;
      if(Math.abs(pos[i*3+1])>18)vel[i].y*=-1;
      if(Math.abs(pos[i*3+2])>6)vel[i].z*=-1;
    }
    geo.attributes.position.needsUpdate=true;
    var li=0,la=lg.attributes.position.array;
    for(var i=0;i<N&&li<mL*6-6;i++){for(var j=i+1;j<N&&li<mL*6-6;j++){
      var dx=pos[i*3]-pos[j*3],dy=pos[i*3+1]-pos[j*3+1],dz=pos[i*3+2]-pos[j*3+2];
      if(dx*dx+dy*dy+dz*dz<36){la[li++]=pos[i*3];la[li++]=pos[i*3+1];la[li++]=pos[i*3+2];la[li++]=pos[j*3];la[li++]=pos[j*3+1];la[li++]=pos[j*3+2];}
    }}
    for(var k=li;k<mL*6;k++)la[k]=0;
    lg.attributes.position.needsUpdate=true;lg.setDrawRange(0,li/3);
    cam.position.x+=(mx*2-cam.position.x)*.01;cam.position.y+=(-my*1.2-cam.position.y)*.01;
    cam.lookAt(0,0,0);ren.render(scene,cam);
  })();

  window.addEventListener('resize',function(){W=area.clientWidth;H=area.clientHeight;cam.aspect=W/H;cam.updateProjectionMatrix();ren.setSize(W,H);});
}

/* Terminal */
function runTerminal(cfg){
  if(termAbort)termAbort.stop=true;
  var ctrl={stop:false};termAbort=ctrl;
  var inp=document.getElementById('pr-input'),out=document.getElementById('pr-output');
  inp.textContent='';out.innerHTML='';
  typeC(inp,cfg.input,28,ctrl,function(){
    if(ctrl.stop)return;var li=0;
    (function nl(){
      if(ctrl.stop||li>=cfg.lines.length)return;
      var l=cfg.lines[li++],d=document.createElement('div');out.appendChild(d);
      tok(d,l.t,l.c,ctrl,function(){if(!ctrl.stop)setTimeout(nl,50);});
      out.parentElement.scrollTop=out.parentElement.scrollHeight;
    })();
  });
}
function typeC(el,t,s,c,cb){var i=0;(function n(){if(c.stop)return;if(i<t.length){el.textContent+=t[i++];setTimeout(n,s);}else if(cb)cb();})();}
function tok(el,t,cls,c,cb){var ts=t.match(/\S+|\s+/g)||[],i=0;(function n(){if(c.stop)return;if(i<ts.length){var s=document.createElement('span');s.className='tk '+(cls||'');s.textContent=ts[i];s.style.animationDelay=(i*.025)+'s';el.appendChild(s);i++;setTimeout(n,20);}else{el.appendChild(document.createTextNode('\n'));if(cb)cb();}})();}

/* Tooltips */
function initTips(){
  var tip=document.getElementById('hover-tip');
  document.querySelectorAll('.pl-ex').forEach(function(ex){
    ex.onmouseenter=function(){tip.textContent=ex.dataset.input;tip.classList.add('show');};
    ex.onmousemove=function(e){tip.style.left=(e.clientX+14)+'px';tip.style.top=(e.clientY-40)+'px';};
    ex.onmouseleave=function(){tip.classList.remove('show');};
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
