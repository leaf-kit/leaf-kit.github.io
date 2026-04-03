/* ============================================
   Claude Code Design Patterns v5
   Synced diagram stepping + terminal output
   ============================================ */
(function(){
'use strict';

/* ===== PATTERNS (16개) ===== */
var PATS={
instruction:{label:'📝',kr:'명령어 해석',en:'Instruction Following',
  nodes:['user','cli','commands','prompts','context','sysprompt','engine','api'],
  flow:[['n-user','n-cli','📝 argv'],['n-cli','n-commands','📜 slash?'],['n-cli','n-prompts','🧩 조립 시작'],['n-prompts','n-context','📄 CLAUDE.md'],['n-context','n-sysprompt','🎯 우선순위'],['n-sysprompt','n-engine','✅ 최종 프롬프트'],['n-engine','n-api','☁️ API 호출']],
  badges:{'badge-prompts':'🧩 15섹션','badge-context':'📄 CLAUDE.md','badge-api':'☁️ 스트리밍'},
  exs:[{e:'📝',t:'claude "이 코드 분석해줘"'},{e:'⚙️',t:'claude --model opus'}],
  srcs:['prompts.ts — 15섹션 조립|https://github.com/leaf-kit/claude-analysis/tree/main/src/constants/prompts.ts','systemPrompt.ts — 우선순위|https://github.com/leaf-kit/claude-analysis/tree/main/src/utils/systemPrompt.ts'],
  term:{input:'claude "이 코드 분석해줘"',lines:[
    {t:'// Instruction Following',c:'t-comment'},{t:'getSystemPrompt()',c:'t-fn'},{t:'  Static(7): tools, tone, security → global cache',c:''},{t:'  Dynamic(8): memory, env, MCP → ephemeral',c:''},
    {t:'buildEffectiveSystemPrompt()',c:'t-fn'},{t:'  Override → Coordinator → Agent → Custom → Default',c:'t-str'},
    {t:'getUserContext() → CLAUDE.md 4-layer loaded',c:'t-fn'},{t:'getSystemContext() → git:main',c:'t-fn'},{t:'→ API call with assembled prompt...',c:'t-kw'}
  ]}},
memory:{label:'🧠',kr:'컨텍스트 메모리',en:'Context Memory',
  nodes:['user','cli','claudemd','memory','memdir','extract','context','engine','api'],
  flow:[['n-user','n-cli','🧠 이전 대화'],['n-cli','n-claudemd','📋 4-layer'],['n-claudemd','n-context','📄 계층 병합'],['n-cli','n-memory','💾 세션 복원'],['n-memory','n-engine','🧠 9-section'],['n-memdir','n-engine','🗂️ MEMORY.md'],['n-engine','n-api','☁️ 컨텍스트 주입'],['n-api','n-extract','💡 추출 트리거'],['n-extract','n-memdir','📝 4타입 저장']],
  badges:{'badge-memory':'💾 9-section','badge-engine':'⚡ 주입'},
  exs:[{e:'💾',t:'claude --resume'},{e:'📋',t:'CLAUDE.md 4-layer'}],
  srcs:['SessionMemory/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/SessionMemory','extractMemories/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/extractMemories','claudemd.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/utils/claudemd.ts'],
  term:{input:'claude --resume "이어서 작업해줘"',lines:[
    {t:'// Context Memory',c:'t-comment'},{t:'getClaudeMds() → 4-level hierarchy',c:'t-fn'},{t:'  /etc → ~/.claude → project → local',c:''},
    {t:'loadMemoryPrompt() → .claude/MEMORY.md',c:'t-fn'},{t:'SessionMemory → 9-section template',c:'t-fn'},{t:'extractMemories() → feedback|patterns|workflow|tech',c:'t-fn'},{t:'→ Background sub-agent updating...',c:'t-kw'}
  ]}},
planning:{label:'🗺️',kr:'계획 수립 & 추론',en:'Planning & Reasoning',
  nodes:['user','engine','api','coordinator','agent','tools','executor'],
  flow:[['n-user','n-engine','🗺️ 복잡한 작업'],['n-engine','n-api','☁️ LLM 추론'],['n-api','n-coordinator','📋 코디네이터'],['n-coordinator','n-agent','🤖 Phase 1: 탐색'],['n-agent','n-engine','📊 결과 수집'],['n-coordinator','n-tools','🔧 Phase 3: 실행'],['n-tools','n-executor','⚙️ 도구 실행']],
  badges:{'badge-engine':'⚡ 쿼리 루프','badge-api':'☁️ LLM'},
  exs:[{e:'🗺️',t:'전체 리팩토링'}],
  srcs:['coordinatorMode.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/coordinator/coordinatorMode.ts','AgentTool/|https://github.com/leaf-kit/claude-analysis/tree/main/src/tools/AgentTool'],
  term:{input:'claude "전체 리팩토링 수행해줘"',lines:[
    {t:'// Planning & Reasoning',c:'t-comment'},{t:'Coordinator Mode activated',c:'t-kw'},
    {t:'Phase 1: Research (parallel)',c:'t-fn'},{t:'  → Agent(Explore) scanning src/...',c:'t-str'},{t:'  → Agent(Explore) scanning tests/...',c:'t-str'},
    {t:'Phase 2: Synthesis',c:'t-fn'},{t:'  → Concrete spec: 12 files, 34 changes',c:'t-str'},
    {t:'Phase 3: Implement & Verify',c:'t-fn'},{t:'  → Agent(general) implementing...',c:'t-str'},{t:'  → Agent(verify) PASS ✓',c:'t-str'}
  ]}},
tooluse:{label:'🔧',kr:'도구 실행',en:'Tool Execution',
  nodes:['engine','api','tools','executor','perms','mcp'],
  flow:[['n-api','n-engine','⚡ tool_use 블록'],['n-engine','n-tools','🔧 도구 검색'],['n-tools','n-perms','🛡️ 권한 검증'],['n-perms','n-executor','⚙️ 실행 큐'],['n-executor','n-engine','📊 결과 반환'],['n-mcp','n-tools','🔌 외부 도구']],
  badges:{'badge-tools':'🔧 40+'},
  exs:[{e:'🔧',t:'Read, Edit, Bash...'},{e:'💻',t:'Bash 명령 실행'}],
  srcs:['StreamingToolExecutor.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/tools/StreamingToolExecutor.ts','Tool.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/Tool.ts'],
  term:{input:'→ Tool: FileReadTool("src/main.ts")',lines:[
    {t:'// Tool Execution',c:'t-comment'},{t:'findToolByName("Read") → FileReadTool',c:'t-fn'},
    {t:'checkPermissions()',c:'t-fn'},{t:'  Layer 1: allowlist → ✓ matched → ALLOW',c:'t-str'},
    {t:'StreamingToolExecutor.addTool()',c:'t-fn'},{t:'  concurrent-safe → parallel',c:''},{t:'tool.call() → 245 lines read',c:'t-fn'},{t:'→ ToolResult(success)',c:'t-str'}
  ]}},
refinement:{label:'✨',kr:'정제 & 출력',en:'Refinement & Output',
  nodes:['api','engine','query','compact','hooks','messages','ink','output'],
  flow:[['n-api','n-engine','☁️ 스트리밍'],['n-engine','n-query','🔄 generator'],['n-query','n-compact','📦 압축 체크'],['n-compact','n-query','✅ 9-item 보존'],['n-query','n-hooks','🪝 후처리'],['n-hooks','n-messages','💬 렌더링'],['n-messages','n-ink','🖥️ 터미널'],['n-ink','n-output','✅ 최종 응답']],
  badges:{'badge-output':'✅ 응답'},
  exs:[{e:'✨',t:'스트리밍 + 압축'}],
  srcs:['query.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/query.ts','Messages/|https://github.com/leaf-kit/claude-analysis/tree/main/src/components/Messages'],
  term:{input:'→ Context: 180K/200K tokens',lines:[
    {t:'// Refinement & Output',c:'t-comment'},{t:'shouldCompact() → true',c:'t-fn'},{t:'compact() → 9-item preservation',c:'t-fn'},
    {t:'  1.Request 2.Concepts 3.Code 4.Errors 5.Journey',c:'t-str'},{t:'  6.Messages 7.Tasks 8.State 9.Next',c:'t-str'},
    {t:'  → 180K → 25K tokens',c:'t-num'},{t:'postSamplingHooks()',c:'t-fn'},{t:'→ Streaming to terminal...',c:'t-kw'}
  ]}},
permission:{label:'🛡️',kr:'권한 & 보안',en:'Permission & Security',
  nodes:['engine','tools','perms','executor'],
  flow:[['n-engine','n-tools','🔧 BashTool'],['n-tools','n-perms','🛡️ AST 파싱'],['n-perms','n-executor','🚫 DENY'],['n-executor','n-engine','📊 거부 결과']],
  badges:{'badge-tools':'🔧 BashTool'},
  exs:[{e:'🚫',t:'rm -rf / → DENY'}],
  srcs:['permissions/ — 26 files|https://github.com/leaf-kit/claude-analysis/tree/main/src/utils/permissions'],
  term:{input:'→ BashTool("rm -rf /")',lines:[
    {t:'// Permission & Security',c:'t-comment'},{t:'checkPermissions("rm -rf /")',c:'t-fn'},
    {t:'  Layer 1: Rule check → no match',c:'t-warn'},{t:'  Layer 2: tree-sitter AST',c:'t-fn'},
    {t:'    → rm: recursive, force, root',c:'t-err'},{t:'    → DANGEROUS',c:'t-err'},{t:'  → DENY: Permission refused',c:'t-err'}
  ]}},
session:{label:'💾',kr:'세션 지속성',en:'Session Persistence',
  nodes:['user','cli','session','engine','memory','extract'],
  flow:[['n-user','n-cli','💾 재개 요청'],['n-cli','n-session','📂 JSONL 로드'],['n-session','n-engine','🔄 47 메시지 복원'],['n-engine','n-memory','🧠 상태 복원'],['n-memory','n-extract','💡 추출'],['n-extract','n-session','💾 저장']],
  badges:{},
  exs:[{e:'💾',t:'--resume 세션 재개'}],
  srcs:['sessionStorage.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/utils'],
  term:{input:'claude --resume session_abc123',lines:[
    {t:'// Session Persistence',c:'t-comment'},{t:'getSessionIdFromLog("abc123")',c:'t-fn'},
    {t:'  → .claude/sessions/abc123.jsonl',c:'t-str'},{t:'  → 47 messages restored',c:'t-str'},
    {t:'recordTranscript() → auto-saving',c:'t-fn'},{t:'→ Session resumed',c:'t-kw'}
  ]}},
memwrite:{label:'📝',kr:'메모리 저장 프로세스',en:'Memory Write Process',
  nodes:['engine','extract','memdir','memory','session'],
  flow:[['n-engine','n-extract','💡 대화 분석'],['n-extract','n-memdir','📝 user_*.md 저장'],['n-extract','n-memdir','📝 feedback_*.md'],['n-memdir','n-memory','🗂️ MEMORY.md 인덱스'],['n-memory','n-session','💾 세션 저장']],
  badges:{},
  exs:[{e:'📝',t:'자동 메모리 추출 & 저장'}],
  srcs:['extractMemories/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/extractMemories','memdir.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/memdir/memdir.ts'],
  term:{input:'→ Session end: extracting memories',lines:[
    {t:'// Memory Write Process',c:'t-comment'},{t:'extractMemoriesFromConversation()',c:'t-fn'},
    {t:'  → Analyzing last 24 messages...',c:''},{t:'  → user_role.md: "senior engineer"',c:'t-str'},
    {t:'  → feedback_testing.md: "use real DB"',c:'t-str'},{t:'  → project_deploy.md: "freeze Mar 5"',c:'t-str'},
    {t:'MEMORY.md index updated (+3 entries)',c:'t-fn'},{t:'autoDream: 7 sessions consolidated',c:'t-kw'}
  ]}},
mcp:{label:'🔌',kr:'MCP 확장',en:'MCP Extension',
  nodes:['engine','tools','mcp','executor','perms'],
  flow:[['n-engine','n-tools','🔧 도구 검색'],['n-mcp','n-tools','🔌 MCP 도구 병합'],['n-tools','n-perms','🛡️ 권한'],['n-perms','n-executor','⚙️ 외부 실행'],['n-executor','n-engine','📊 결과']],
  badges:{},
  exs:[{e:'🔌',t:'외부 MCP 서버 도구'}],
  srcs:['services/mcp/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/mcp'],
  term:{input:'→ mcp__github__search_repos',lines:[
    {t:'// MCP Extension',c:'t-comment'},{t:'getMcpTools() → 3 servers',c:'t-fn'},
    {t:'assembleToolPool() → merge built-in + MCP',c:'t-fn'},{t:'MCPTool.call() → forwarding...',c:'t-fn'},{t:'→ 12 repos found',c:'t-str'}
  ]}},
compaction:{label:'📦',kr:'컨텍스트 압축',en:'Context Compaction',
  nodes:['engine','query','compact','extract','memdir','messages'],
  flow:[['n-engine','n-query','🔄 토큰 체크'],['n-query','n-compact','📦 180K > threshold'],['n-compact','n-extract','💡 동시 추출'],['n-extract','n-memdir','📝 메모리 저장'],['n-compact','n-query','✅ 25K 압축완료'],['n-query','n-messages','💬 재개']],
  badges:{},
  exs:[{e:'📦',t:'180K → 25K 압축'}],
  srcs:['compact/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/compact'],
  term:{input:'→ Auto-compact (180K/200K)',lines:[
    {t:'// Context Compaction',c:'t-comment'},{t:'shouldCompact() → threshold exceeded',c:'t-fn'},
    {t:'compact() → NO_TOOLS_PREAMBLE',c:'t-warn'},{t:'  9 items preserved',c:'t-fn'},
    {t:'  요청, 개념, 코드, 오류, 여정, 메시지, 작업, 상태, 다음',c:'t-str'},
    {t:'→ 180,000 → 25,000 tokens',c:'t-num'}
  ]}},
spawning:{label:'🧬',kr:'에이전트 스포닝',en:'Agent Spawning',
  nodes:['engine','coordinator','agent','api','tools','executor'],
  flow:[['n-engine','n-coordinator','📋 스펙 생성'],['n-coordinator','n-agent','🧬 Fork 전략'],['n-agent','n-api','☁️ 하위 API'],['n-api','n-agent','📊 응답'],['n-agent','n-tools','🔧 도구 사용'],['n-tools','n-executor','⚙️ 실행'],['n-agent','n-engine','✅ 텍스트 반환']],
  badges:{},
  exs:[{e:'🧬',t:'Fork / Fresh 전략'}],
  srcs:['AgentTool.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/tools/AgentTool/AgentTool.ts'],
  term:{input:'→ Agent(Explore)',lines:[
    {t:'// Agent Spawning',c:'t-comment'},{t:'AgentTool.call({type:"Explore"})',c:'t-fn'},
    {t:'  Fork (parent cache shared)',c:'t-str'},{t:'  Prompt: "READ-ONLY search"',c:'t-str'},
    {t:'  → Sub-QueryEngine created',c:'t-fn'},{t:'  → 3 tool calls',c:'t-str'},{t:'→ Text response → parent',c:'t-kw'}
  ]}},
cost:{label:'💰',kr:'비용 추적',en:'Cost Tracking',
  nodes:['api','engine','cost','session'],
  flow:[['n-api','n-engine','☁️ usage 데이터'],['n-engine','n-cost','💰 토큰×단가'],['n-cost','n-session','💾 비용 저장']],
  badges:{},
  exs:[{e:'💰',t:'토큰 비용 누적'}],
  srcs:['cost-tracker.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/cost-tracker.ts'],
  term:{input:'→ API response received',lines:[
    {t:'// Cost Tracking',c:'t-comment'},{t:'usage: 847 in + 398 out = 1,245 tokens',c:'t-fn'},
    {t:'model: claude-sonnet-4',c:''},{t:'cost: $0.003 (this call)',c:'t-num'},
    {t:'session total: $0.085 | lifetime: $12.43',c:'t-num'}
  ]}},
retry:{label:'🔁',kr:'에러 복구 & 재시도',en:'Error Recovery & Retry',
  nodes:['engine','api','retry'],
  flow:[['n-engine','n-api','☁️ API 호출'],['n-api','n-retry','❌ 429 Rate Limit'],['n-retry','n-api','🔁 1.2s 대기 후 재시도']],
  badges:{},
  exs:[{e:'🔁',t:'지수적 백오프 재시도'}],
  srcs:['withRetry.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/api'],
  term:{input:'→ API Error: 429 Rate Limited',lines:[
    {t:'// Error Recovery',c:'t-comment'},{t:'isRetryable(429) → true',c:'t-fn'},
    {t:'Retry 1/3: waiting 1.2s...',c:'t-warn'},{t:'Retry 2/3: waiting 2.4s...',c:'t-warn'},
    {t:'Success on attempt 3 ✓',c:'t-str'}
  ]}},
cache:{label:'🗄️',kr:'프롬프트 캐시 전략',en:'Prompt Cache Strategy',
  nodes:['prompts','context','sysprompt','engine','api','cache'],
  flow:[['n-prompts','n-cache','🗄️ Static 해싱'],['n-cache','n-engine','✅ 캐시 히트'],['n-engine','n-api','☁️ cache_control'],['n-api','n-engine','📊 45K 캐시 절약']],
  badges:{},
  exs:[{e:'🗄️',t:'글로벌 스코프 분할'}],
  srcs:['promptCacheBreak|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/api'],
  term:{input:'→ Cache status check',lines:[
    {t:'// Prompt Cache Strategy',c:'t-comment'},{t:'splitSysPromptPrefix()',c:'t-fn'},
    {t:'  Static: 30-40K tokens (global cache)',c:'t-str'},{t:'  Dynamic: 5-10K tokens (ephemeral)',c:''},
    {t:'computeSystemPromptHash() → 12-dim check',c:'t-fn'},{t:'→ Cache hit: 45K tokens saved',c:'t-num'}
  ]}},
skill:{label:'🎯',kr:'스킬 시스템',en:'Skill System',
  nodes:['user','cli','commands','engine','agent','tools'],
  flow:[['n-user','n-cli','🎯 /skill 명령'],['n-cli','n-commands','📜 스킬 파싱'],['n-commands','n-engine','🧩 프롬프트 주입'],['n-engine','n-agent','🤖 Fork 실행'],['n-agent','n-tools','🔧 제한 도구']],
  badges:{},
  exs:[{e:'🎯',t:'/simplify 코드 정리'}],
  srcs:['skills/|https://github.com/leaf-kit/claude-analysis/tree/main/src/skills'],
  term:{input:'/simplify',lines:[
    {t:'// Skill System',c:'t-comment'},{t:'loadSkill("simplify")',c:'t-fn'},
    {t:'  YAML frontmatter parsed',c:''},{t:'  allowed_tools: Read, Grep, Glob',c:'t-str'},
    {t:'  context: fork (isolated agent)',c:'t-str'},{t:'Running skill in forked agent...',c:'t-fn'},
    {t:'→ 3 recommendations generated',c:'t-kw'}
  ]}},
worktree:{label:'🌿',kr:'워크트리 격리',en:'Worktree Isolation',
  nodes:['user','cli','engine','session','tools','executor'],
  flow:[['n-user','n-cli','🌿 --worktree'],['n-cli','n-engine','📂 격리 환경'],['n-engine','n-tools','🔧 격리 도구'],['n-tools','n-executor','⚙️ 브랜치 작업'],['n-executor','n-session','💾 워크트리 저장']],
  badges:{},
  exs:[{e:'🌿',t:'Git 워크트리 격리'}],
  srcs:['worktree.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/tools/AgentTool'],
  term:{input:'claude --worktree feature-xyz',lines:[
    {t:'// Worktree Isolation',c:'t-comment'},{t:'git worktree add .claude/worktrees/feature-xyz',c:'t-fn'},
    {t:'  Branch: feature-xyz (from main)',c:'t-str'},{t:'  CWD changed to isolated worktree',c:''},
    {t:'(작업 수행 후)',c:'t-comment'},{t:'exit-worktree --keep',c:'t-fn'},{t:'→ Worktree preserved, CWD restored',c:'t-kw'}
  ]}}
};

var allNodes=[],activePat=null,termAbort=null,flowLabels=[];

/* ===== INIT ===== */
function init(){
  document.querySelectorAll('.dg-node').forEach(function(n){allNodes.push(n.id);});
  buildPatternList();
  initTheme();initLang();initPatterns();initFlowCanvas();initThree();initTips();
  applyLang();
  setTimeout(function(){selectPattern('instruction');},300);
}

/* Build sidebar from PATS data */
function buildPatternList(){
  var list=document.getElementById('pl-list');if(!list)return;
  var html='';var idx=1;
  Object.keys(PATS).forEach(function(key){
    var P=PATS[key];
    var num=String(idx).padStart(2,'0');idx++;
    html+='<div class="pl-item" data-pat="'+key+'">';
    html+='<div class="pl-row"><span class="pl-num">'+num+'</span><span class="pl-emoji">'+P.label+'</span><strong data-kr="'+P.kr+'" data-en="'+P.en+'"></strong></div>';
    html+='<div class="pl-exs">';
    (P.exs||[]).forEach(function(ex){
      html+='<div class="pl-ex" data-input="'+ex.t+'"><span>'+ex.e+'</span> <code>'+ex.t+'</code></div>';
    });
    (P.srcs||[]).forEach(function(s){
      var parts=s.split('|');
      html+='<a class="pl-src" href="'+parts[1]+'" target="_blank">📂 '+parts[0]+'</a>';
    });
    html+='</div></div>';
  });
  list.innerHTML=html;
}

/* Theme */
function initTheme(){
  var s=localStorage.getItem('dp-theme');if(s)document.documentElement.setAttribute('data-theme',s);
  updTI();
  document.getElementById('btn-theme').onclick=function(){
    var c=document.documentElement.getAttribute('data-theme'),n=c==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme',n);localStorage.setItem('dp-theme',n);updTI();
  };
}
function updTI(){document.getElementById('theme-icon').textContent=document.documentElement.getAttribute('data-theme')==='dark'?'☀️':'🌙';}

/* Lang */
function initLang(){
  var s=localStorage.getItem('dp-lang');if(s)document.documentElement.setAttribute('data-lang',s);
  updLL();
  document.getElementById('btn-lang').onclick=function(){
    var c=document.documentElement.getAttribute('data-lang'),n=c==='en'?'kr':'en';
    document.documentElement.setAttribute('data-lang',n);localStorage.setItem('dp-lang',n);updLL();applyLang();
  };
}
function updLL(){document.getElementById('lang-label').textContent=document.documentElement.getAttribute('data-lang')==='en'?'KR':'EN';}
function applyLang(){
  var l=document.documentElement.getAttribute('data-lang')||'kr';
  document.querySelectorAll('[data-kr][data-en]').forEach(function(el){
    if(['STRONG','H2','SPAN','P'].indexOf(el.tagName)!==-1)el.textContent=el.getAttribute('data-'+l)||'';
  });
}

/* Pattern selection */
function initPatterns(){
  document.getElementById('pl-list').addEventListener('click',function(e){
    var item=e.target.closest('.pl-item');if(item)selectPattern(item.dataset.pat);
  });
}

function selectPattern(key){
  if(!PATS[key])return;activePat=key;var P=PATS[key];
  document.querySelectorAll('.pl-item').forEach(function(i){i.classList.toggle('active',i.dataset.pat===key);});
  // Reset all nodes
  allNodes.forEach(function(nid){
    var el=document.getElementById(nid);if(!el)return;
    el.classList.remove('dimmed','active-node','flow-node','stepping');
    if(P.nodes.indexOf(el.dataset.mod)!==-1)el.classList.add('flow-node');
    else el.classList.add('dimmed');
  });
  // Badges
  document.querySelectorAll('.nd-badge').forEach(function(b){b.classList.remove('show');b.textContent='';});
  Object.keys(P.badges||{}).forEach(function(bid){
    var b=document.getElementById(bid);if(b){b.textContent=P.badges[bid];setTimeout(function(){b.classList.add('show');},100);}
  });
  // Clear flow labels
  flowLabels.forEach(function(el){el.remove();});flowLabels=[];
  // Sync: step through nodes + terminal
  runSyncedAnimation(P);
  applyLang();
}

/* ===== SYNCED ANIMATION: diagram steps + terminal ===== */
function runSyncedAnimation(P){
  if(termAbort)termAbort.stop=true;
  var ctrl={stop:false};termAbort=ctrl;
  var inp=document.getElementById('term-input'),out=document.getElementById('term-output');
  inp.textContent='';out.innerHTML='';

  var flowSteps=P.flow||[];
  var termLines=P.term.lines||[];
  var stepIdx=0;
  var lineIdx=0;

  // Type input first
  typeC(inp,P.term.input,25,ctrl,function(){
    if(ctrl.stop)return;
    // Then step through flow + terminal lines simultaneously
    function nextStep(){
      if(ctrl.stop)return;
      // Highlight current flow step
      if(stepIdx<flowSteps.length){
        var fs=flowSteps[stepIdx];
        var targetNode=document.getElementById(fs[1]);
        if(targetNode){
          targetNode.classList.add('stepping');
          setTimeout(function(){if(!ctrl.stop&&targetNode)targetNode.classList.remove('stepping');},600);
        }
        // Show flow label
        if(fs[2]){
          showFlowLabel(fs[0],fs[1],fs[2]);
        }
        stepIdx++;
      }
      // Show corresponding terminal line(s)
      var linesToShow=Math.ceil(termLines.length/Math.max(flowSteps.length,1));
      for(var i=0;i<linesToShow&&lineIdx<termLines.length;i++){
        var line=termLines[lineIdx++];
        var div=document.createElement('div');out.appendChild(div);
        tok(div,line.t,line.c,ctrl,null);
      }
      out.parentElement.scrollTop=out.parentElement.scrollHeight;

      if(stepIdx<flowSteps.length||lineIdx<termLines.length){
        setTimeout(nextStep,400);
      }
    }
    setTimeout(nextStep,200);
  });
}

function showFlowLabel(fromId,toId,text){
  var area=document.getElementById('diagram-wrap');
  var from=document.getElementById(fromId),to=document.getElementById(toId);
  if(!area||!from||!to)return;
  var ar=area.getBoundingClientRect();
  var fr=from.getBoundingClientRect(),tr=to.getBoundingClientRect();
  var x=(fr.left+fr.width/2+tr.left+tr.width/2)/2-ar.left;
  var y=(fr.top+fr.height/2+tr.top+tr.height/2)/2-ar.top-16;
  var label=document.createElement('div');
  label.className='flow-label';
  label.textContent=text;
  label.style.left=x+'px';label.style.top=y+'px';label.style.transform='translate(-50%,-50%) scale(.7)';
  area.appendChild(label);
  flowLabels.push(label);
  setTimeout(function(){label.classList.add('show');label.style.transform='translate(-50%,-50%) scale(1)';},50);
  setTimeout(function(){label.style.opacity='0';setTimeout(function(){if(label.parentNode)label.remove();},300);},2500);
}

/* Flow Canvas */
var fCtx,fCan,fW,fH,fTime=0;
function initFlowCanvas(){
  fCan=document.getElementById('flow-canvas');if(!fCan)return;
  fCtx=fCan.getContext('2d');resizeF();window.addEventListener('resize',resizeF);
  requestAnimationFrame(drawF);
}
function resizeF(){
  var a=document.getElementById('diagram-wrap');if(!a)return;
  var r=a.getBoundingClientRect();fW=r.width;fH=r.height;
  fCan.width=fW*devicePixelRatio;fCan.height=fH*devicePixelRatio;
  fCan.style.width=fW+'px';fCan.style.height=fH+'px';
  fCtx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
}
function nc(id){var e=document.getElementById(id),a=document.getElementById('diagram-wrap');if(!e||!a)return null;var ar=a.getBoundingClientRect(),er=e.getBoundingClientRect();return{x:er.left-ar.left+er.width/2,y:er.top-ar.top+er.height/2};}
function drawF(){
  requestAnimationFrame(drawF);fTime+=.014;fCtx.clearRect(0,0,fW,fH);
  if(!activePat||!PATS[activePat])return;
  var P=PATS[activePat],dk=document.documentElement.getAttribute('data-theme')==='dark';
  P.flow.forEach(function(c,ci){
    var a=nc(c[0]),b=nc(c[1]);if(!a||!b)return;
    var dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy)||1;
    var off=Math.min(d*.12,25);
    var cx=(a.x+b.x)/2+(dy/d)*off*(ci%2?1:-1);
    var cy=(a.y+b.y)/2-(dx/d)*off*(ci%2?1:-1);
    fCtx.beginPath();fCtx.moveTo(a.x,a.y);fCtx.quadraticCurveTo(cx,cy,b.x,b.y);
    fCtx.strokeStyle='rgba(99,102,241,'+(dk?.35:.2)+')';fCtx.lineWidth=2.5;fCtx.stroke();
    var sp=.45+(ci%3)*.12,t=((fTime*sp+ci*.35)%1.5)/1.5;if(t>1)return;
    var px=(1-t)*(1-t)*a.x+2*(1-t)*t*cx+t*t*b.x;
    var py=(1-t)*(1-t)*a.y+2*(1-t)*t*cy+t*t*b.y;
    var g=fCtx.createRadialGradient(px,py,0,px,py,18);
    g.addColorStop(0,'rgba(99,102,241,'+(dk?.7:.5)+')');g.addColorStop(1,'rgba(99,102,241,0)');
    fCtx.fillStyle=g;fCtx.fillRect(px-18,py-18,36,36);
    fCtx.beginPath();fCtx.arc(px,py,4.5,0,Math.PI*2);fCtx.fillStyle='#6366F1';fCtx.fill();
    if(t>.92){var ang=Math.atan2(b.y-cy,b.x-cx);fCtx.save();fCtx.translate(b.x,b.y);fCtx.rotate(ang);fCtx.beginPath();fCtx.moveTo(0,0);fCtx.lineTo(-10,-5);fCtx.lineTo(-10,5);fCtx.closePath();fCtx.fillStyle='rgba(99,102,241,.5)';fCtx.fill();fCtx.restore();}
  });
}

/* Three.js */
function initThree(){
  var cv=document.getElementById('three-canvas');if(!cv||typeof THREE==='undefined')return;
  var area=document.getElementById('diagram-wrap');var W=area.clientWidth,H=area.clientHeight;
  var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,W/H,.1,500);cam.position.z=30;
  var ren=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});
  ren.setSize(W,H);ren.setPixelRatio(Math.min(devicePixelRatio,2));ren.setClearColor(0,0);
  var N=80,pos=new Float32Array(N*3),col=new Float32Array(N*3),vel=[];
  var pal=[new THREE.Color(0x6366F1),new THREE.Color(0x818CF8),new THREE.Color(0xA5B4FC)];
  for(var i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*50;pos[i*3+1]=(Math.random()-.5)*35;pos[i*3+2]=(Math.random()-.5)*10;vel.push({x:(Math.random()-.5)*.008,y:(Math.random()-.5)*.008,z:(Math.random()-.5)*.004});var c=pal[i%pal.length];col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
  var geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  scene.add(new THREE.Points(geo,new THREE.PointsMaterial({size:.5,vertexColors:true,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false})));
  var mL=200,lp=new Float32Array(mL*6),lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(lp,3));
  scene.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x6366F1,transparent:true,opacity:.03,blending:THREE.AdditiveBlending,depthWrite:false})));
  (function anim(){requestAnimationFrame(anim);
    for(var i=0;i<N;i++){pos[i*3]+=vel[i].x;pos[i*3+1]+=vel[i].y;pos[i*3+2]+=vel[i].z;if(Math.abs(pos[i*3])>25)vel[i].x*=-1;if(Math.abs(pos[i*3+1])>18)vel[i].y*=-1;if(Math.abs(pos[i*3+2])>5)vel[i].z*=-1;}
    geo.attributes.position.needsUpdate=true;
    var li=0,la=lg.attributes.position.array;for(var i=0;i<N&&li<mL*6-6;i++){for(var j=i+1;j<N&&li<mL*6-6;j++){var dx=pos[i*3]-pos[j*3],dy=pos[i*3+1]-pos[j*3+1],dz=pos[i*3+2]-pos[j*3+2];if(dx*dx+dy*dy+dz*dz<36){la[li++]=pos[i*3];la[li++]=pos[i*3+1];la[li++]=pos[i*3+2];la[li++]=pos[j*3];la[li++]=pos[j*3+1];la[li++]=pos[j*3+2];}}}
    for(var k=li;k<mL*6;k++)la[k]=0;lg.attributes.position.needsUpdate=true;lg.setDrawRange(0,li/3);
    ren.render(scene,cam);
  })();
  window.addEventListener('resize',function(){W=area.clientWidth;H=area.clientHeight;cam.aspect=W/H;cam.updateProjectionMatrix();ren.setSize(W,H);});
}

/* Terminal helpers */
function typeC(el,t,s,c,cb){var i=0;(function n(){if(c.stop)return;if(i<t.length){el.textContent+=t[i++];setTimeout(n,s);}else if(cb)cb();})();}
function tok(el,t,cls,c,cb){var ts=t.match(/\S+|\s+/g)||[],i=0;(function n(){if(c&&c.stop)return;if(i<ts.length){var s=document.createElement('span');s.className='tk '+(cls||'');s.textContent=ts[i];s.style.animationDelay=(i*.02)+'s';el.appendChild(s);i++;setTimeout(n,15);}else{el.appendChild(document.createTextNode('\n'));if(cb)cb();}})();}

/* Tooltips */
function initTips(){
  var tip=document.getElementById('hover-tip');
  document.addEventListener('mouseover',function(e){
    var ex=e.target.closest('.pl-ex');
    if(ex){tip.textContent=ex.dataset.input;tip.classList.add('show');}
    else tip.classList.remove('show');
  });
  document.addEventListener('mousemove',function(e){
    if(tip.classList.contains('show')){tip.style.left=(e.clientX+14)+'px';tip.style.top=(e.clientY-40)+'px';}
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
