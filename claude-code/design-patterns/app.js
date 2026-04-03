/* ============================================
   Claude Code Design Patterns v7
   Auto-play + speed control + token counter
   ============================================ */
(function(){
'use strict';

/* ===== ORDERED pattern keys for auto-play ===== */
var PAT_ORDER=['instruction','memory','planning','tooluse','refinement','permission','session','memwrite','mcp','compaction','spawning','cost','retry','cache','skill','worktree'];

/* ===== PATTERN DATA ===== */
var PATS={
instruction:{label:'📝',kr:'명령어 해석',en:'Instruction Following',heroAnim:'📝→🧩→☁️',
  descKr:'사용자가 프롬프트를 입력하면, 15개 섹션의 시스템 프롬프트로 조립되어 API에 전달됩니다.',descEn:'User prompt is assembled into a 15-section system prompt and sent to the API.',
  inputKr:'사용자 프롬프트 텍스트',inputEn:'User prompt text',outputKr:'완성된 System Prompt + API 응답',outputEn:'Assembled System Prompt + API response',
  nodes:['user','cli','commands','prompts','context','sysprompt','engine','api'],
  steps:[
    {from:'n-user',to:'n-cli',data:'📝 "이 코드 분석해줘"',term:{t:'$ claude "이 코드 분석해줘"',c:'t-kw'}},
    {from:'n-cli',to:'n-commands',data:'📜 슬래시 체크',term:{t:'processUserInput() → not a slash command',c:'t-fn'}},
    {from:'n-cli',to:'n-prompts',data:'🧩 조립 시작',term:{t:'getSystemPrompt() → 15 sections',c:'t-fn'}},
    {from:'n-prompts',to:'n-context',data:'📄 CLAUDE.md',term:{t:'  Static(7): global | Dynamic(8): ephemeral',c:'t-str'}},
    {from:'n-context',to:'n-sysprompt',data:'🎯 우선순위',term:{t:'buildEffectiveSystemPrompt() → 5-tier',c:'t-fn'}},
    {from:'n-sysprompt',to:'n-engine',data:'✅ 최종 프롬프트',term:{t:'  Override→Coordinator→Agent→Custom→Default',c:'t-str'}},
    {from:'n-engine',to:'n-api',data:'☁️ API 호출',term:{t:'→ messages.create() streaming...',c:'t-kw'}}
  ],exs:[{e:'📝',t:'claude "코드 분석"'}],srcs:['prompts.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/constants/prompts.ts']},
memory:{label:'🧠',kr:'컨텍스트 메모리',en:'Context Memory',heroAnim:'📋→🧠→💡',
  descKr:'CLAUDE.md 4계층 + 세션 메모리 + MEMORY.md가 유기적으로 연동됩니다.',descEn:'4-layer CLAUDE.md + session memory + MEMORY.md work together.',
  inputKr:'이전 대화 + CLAUDE.md',inputEn:'History + CLAUDE.md',outputKr:'컨텍스트 주입된 프롬프트',outputEn:'Context-injected prompt',
  nodes:['user','cli','claudemd','memory','memdir','extract','context','engine','api'],
  steps:[
    {from:'n-user',to:'n-cli',data:'🧠 --resume',term:{t:'$ claude --resume "이어서"',c:'t-kw'}},
    {from:'n-cli',to:'n-claudemd',data:'📋 4-layer',term:{t:'getClaudeMds() → /etc→~/.claude→project→local',c:'t-fn'}},
    {from:'n-claudemd',to:'n-context',data:'📄 병합',term:{t:'  @include resolved (recursive)',c:'t-str'}},
    {from:'n-cli',to:'n-memory',data:'💾 세션 복원',term:{t:'SessionMemory → 9-section loaded',c:'t-fn'}},
    {from:'n-memdir',to:'n-engine',data:'🗂️ MEMORY.md',term:{t:'loadMemoryPrompt() → relevant prefetched',c:'t-fn'}},
    {from:'n-engine',to:'n-api',data:'☁️ 컨텍스트 주입',term:{t:'→ API call with enriched context...',c:'t-kw'}},
    {from:'n-api',to:'n-extract',data:'💡 추출',term:{t:'extractMemories() → 4-type classify',c:'t-fn'}},
    {from:'n-extract',to:'n-memdir',data:'📝 저장',term:{t:'  feedback|patterns|workflow|tech saved',c:'t-str'}}
  ],exs:[{e:'💾',t:'--resume'}],srcs:['SessionMemory/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/SessionMemory']},
planning:{label:'🗺️',kr:'계획 수립 & 추론',en:'Planning & Reasoning',heroAnim:'🗺️→🤖→✅',
  descKr:'코디네이터가 3단계로 분해: Research(병렬)→Synthesis→Implement&Verify',descEn:'Coordinator: Research(∥)→Synthesis→Implement&Verify',
  inputKr:'복잡한 작업 요청',inputEn:'Complex task',outputKr:'검증된 결과 (PASS/FAIL)',outputEn:'Verified result (PASS/FAIL)',
  nodes:['user','engine','api','coordinator','agent','tools','executor'],
  steps:[
    {from:'n-user',to:'n-engine',data:'🗺️ 리팩토링',term:{t:'$ claude "전체 리팩토링"',c:'t-kw'}},
    {from:'n-engine',to:'n-api',data:'☁️ LLM',term:{t:'Coordinator Mode activated',c:'t-fn'}},
    {from:'n-api',to:'n-coordinator',data:'📋 분석',term:{t:'Phase 1: Research (parallel)',c:'t-fn'}},
    {from:'n-coordinator',to:'n-agent',data:'🤖 병렬',parallel:true,term:{t:'  Agent(Explore) ∥ Agent(Explore) scanning...',c:'t-str'}},
    {from:'n-coordinator',to:'n-engine',data:'📊 종합',term:{t:'Phase 2: Synthesis → 12 files spec',c:'t-fn'}},
    {from:'n-coordinator',to:'n-tools',data:'🔧 실행',term:{t:'Phase 3: Agent(general) implementing',c:'t-fn'}},
    {from:'n-agent',to:'n-engine',data:'✅ PASS',term:{t:'→ Agent(verify) PASS ✓',c:'t-str'}}
  ],exs:[{e:'🗺️',t:'리팩토링'}],srcs:['coordinatorMode.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/coordinator/coordinatorMode.ts']},
tooluse:{label:'🔧',kr:'도구 실행',en:'Tool Execution',heroAnim:'🔧→🛡️→⚙️',
  descKr:'40+ 도구가 3계층 권한을 거쳐 스트리밍 실행됩니다.',descEn:'40+ tools pass 3-tier permissions then stream-execute.',
  inputKr:'tool_use 블록',inputEn:'tool_use block',outputKr:'ToolResult',outputEn:'ToolResult',
  nodes:['engine','api','tools','executor','perms','mcp'],
  steps:[
    {from:'n-api',to:'n-engine',data:'⚡ tool_use',term:{t:'→ Tool: FileReadTool("src/main.ts")',c:'t-kw'}},
    {from:'n-engine',to:'n-tools',data:'🔧 검색',term:{t:'findToolByName("Read") → FileReadTool',c:'t-fn'}},
    {from:'n-tools',to:'n-perms',data:'🛡️ 권한',term:{t:'checkPermissions() → Layer 1: ✓',c:'t-fn'}},
    {from:'n-perms',to:'n-executor',data:'✅ ALLOW',term:{t:'  ALLOW → parallel queue',c:'t-str'}},
    {from:'n-executor',to:'n-engine',data:'📊 결과',term:{t:'→ 245 lines → ToolResult(success)',c:'t-str'}}
  ],exs:[{e:'🔧',t:'Read, Edit, Bash'}],srcs:['StreamingToolExecutor.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/tools/StreamingToolExecutor.ts']},
refinement:{label:'✨',kr:'정제 & 출력',en:'Refinement & Output',heroAnim:'☁️→🔄→✅',
  descKr:'query() generator로 압축·요약·훅을 거쳐 36개 컴포넌트로 렌더링',descEn:'query() generator: compaction→summary→hooks→36 components',
  inputKr:'API 스트리밍',inputEn:'API stream',outputKr:'터미널 렌더링',outputEn:'Terminal render',
  nodes:['api','engine','query','compact','hooks','messages','ink','output'],
  steps:[
    {from:'n-api',to:'n-engine',data:'☁️ 스트리밍',term:{t:'→ API streaming received',c:'t-kw'}},
    {from:'n-engine',to:'n-query',data:'🔄 generator',term:{t:'query() processing blocks...',c:'t-fn'}},
    {from:'n-query',to:'n-compact',data:'📦 체크',term:{t:'shouldCompact() → 9-item preserve',c:'t-fn'}},
    {from:'n-query',to:'n-hooks',data:'🪝 후처리',term:{t:'postSamplingHooks() applied',c:'t-fn'}},
    {from:'n-hooks',to:'n-messages',data:'💬 렌더',term:{t:'AssistantTextMessage → markdown',c:'t-fn'}},
    {from:'n-messages',to:'n-ink',data:'🖥️ Ink',term:{t:'Ink.render() → terminal',c:'t-fn'}},
    {from:'n-ink',to:'n-output',data:'✅ 출력',term:{t:'→ Response streamed ✓',c:'t-str'}}
  ],exs:[{e:'✨',t:'스트리밍 출력'}],srcs:['query.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/query.ts']},
permission:{label:'🛡️',kr:'권한 & 보안',en:'Permission & Security',heroAnim:'🛡️→🔍→🚫',
  descKr:'3계층 게이트: 규칙→AI(Bash AST)→사용자 확인',descEn:'3-tier: rules→AI(Bash AST)→user dialog',
  inputKr:'도구 실행 요청',inputEn:'Tool exec request',outputKr:'ALLOW/DENY/ASK',outputEn:'ALLOW/DENY/ASK',
  nodes:['engine','tools','perms','executor'],
  steps:[
    {from:'n-engine',to:'n-tools',data:'🔧 rm -rf /',term:{t:'→ BashTool("rm -rf /")',c:'t-kw'}},
    {from:'n-tools',to:'n-perms',data:'🛡️ Layer 1',term:{t:'  Layer 1: no match',c:'t-warn'}},
    {from:'n-perms',to:'n-perms',data:'🔍 AST',term:{t:'  Layer 2: tree-sitter → DANGEROUS',c:'t-err'}},
    {from:'n-perms',to:'n-executor',data:'🚫 DENY',term:{t:'  → DENY: blocked',c:'t-err'}}
  ],exs:[{e:'🚫',t:'rm -rf / → DENY'}],srcs:['permissions/|https://github.com/leaf-kit/claude-analysis/tree/main/src/utils/permissions']},
session:{label:'💾',kr:'세션 지속성',en:'Session Persistence',heroAnim:'💾→📂→🔄',
  descKr:'JSONL로 .claude/sessions/에 자동 저장, --resume으로 복원',descEn:'Auto-save JSONL to .claude/sessions/, restore with --resume',
  inputKr:'세션 ID',inputEn:'Session ID',outputKr:'복원된 상태',outputEn:'Restored state',
  nodes:['user','cli','session','engine','memory','extract'],
  steps:[
    {from:'n-user',to:'n-cli',data:'💾 --resume',term:{t:'$ claude --resume abc123',c:'t-kw'}},
    {from:'n-cli',to:'n-session',data:'📂 JSONL',term:{t:'→ 47 messages restored',c:'t-fn'}},
    {from:'n-session',to:'n-engine',data:'🔄 복원',term:{t:'recordTranscript() → auto-saving',c:'t-fn'}},
    {from:'n-engine',to:'n-memory',data:'🧠 상태',term:{t:'→ Session resumed ✓',c:'t-str'}}
  ],exs:[{e:'💾',t:'--resume'}],srcs:[]},
memwrite:{label:'📝',kr:'메모리 저장',en:'Memory Write',heroAnim:'💡→📝→🗂️',
  descKr:'세션 종료 시 4타입 분류 추출 → MEMORY.md 인덱스 저장 → 24h autoDream 통합',descEn:'Session end: 4-type extraction → MEMORY.md index → 24h autoDream consolidation',
  inputKr:'세션 대화',inputEn:'Session conversation',outputKr:'분류된 메모리 파일',outputEn:'Classified memory files',
  nodes:['engine','extract','memdir','memory','session'],
  steps:[
    {from:'n-engine',to:'n-extract',data:'💡 분석',term:{t:'→ extractMemories() forked agent',c:'t-kw'}},
    {from:'n-extract',to:'n-memdir',data:'📝 user_*.md',term:{t:'  user_role.md: "senior engineer"',c:'t-str'}},
    {from:'n-extract',to:'n-memdir',data:'📝 feedback_*',term:{t:'  feedback_testing.md: "use real DB"',c:'t-str'}},
    {from:'n-memdir',to:'n-memory',data:'🗂️ 인덱스',term:{t:'MEMORY.md updated (+3)',c:'t-fn'}},
    {from:'n-memory',to:'n-session',data:'💾 저장',term:{t:'→ autoDream: 7 sessions consolidated',c:'t-kw'}}
  ],exs:[{e:'📝',t:'자동 메모리 추출'}],srcs:['extractMemories/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/extractMemories']},
mcp:{label:'🔌',kr:'MCP 확장',en:'MCP Extension',heroAnim:'🔌→🔧→📊',
  descKr:'외부 MCP 서버 도구를 built-in 풀에 병합',descEn:'Merge external MCP server tools into built-in pool',
  inputKr:'MCP 도구 호출',inputEn:'MCP tool call',outputKr:'외부 실행 결과',outputEn:'External result',
  nodes:['engine','tools','mcp','executor','perms'],
  steps:[
    {from:'n-engine',to:'n-tools',data:'🔧 검색',term:{t:'→ mcp__github__search',c:'t-kw'}},
    {from:'n-mcp',to:'n-tools',data:'🔌 병합',term:{t:'assembleToolPool() → merge',c:'t-fn'}},
    {from:'n-tools',to:'n-perms',data:'🛡️ 권한',term:{t:'checkPermissions() → ALLOW',c:'t-fn'}},
    {from:'n-perms',to:'n-executor',data:'⚙️ 실행',term:{t:'MCPTool.call() → forwarding',c:'t-fn'}},
    {from:'n-executor',to:'n-engine',data:'📊 결과',term:{t:'→ 12 repos found',c:'t-str'}}
  ],exs:[{e:'🔌',t:'외부 MCP'}],srcs:['mcp/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/mcp']},
compaction:{label:'📦',kr:'컨텍스트 압축',en:'Context Compaction',heroAnim:'📦→📋→✅',
  descKr:'180K→25K 압축, 9항목 보존, 도구 사용 금지(NO_TOOLS)',descEn:'180K→25K, 9-item preserve, NO_TOOLS during compaction',
  inputKr:'180K 토큰 컨텍스트',inputEn:'180K token context',outputKr:'25K 압축 + 메모리',outputEn:'25K compressed + memories',
  nodes:['engine','query','compact','extract','memdir','messages'],
  steps:[
    {from:'n-engine',to:'n-query',data:'🔄 체크',term:{t:'→ 180K/200K = 90% → compact!',c:'t-kw'}},
    {from:'n-query',to:'n-compact',data:'📦 압축',term:{t:'shouldCompact() → NO_TOOLS',c:'t-warn'}},
    {from:'n-compact',to:'n-extract',data:'💡 동시 추출',term:{t:'  9 items preserved',c:'t-str'}},
    {from:'n-compact',to:'n-query',data:'✅ 25K',term:{t:'→ 180K → 25K tokens',c:'t-num'}}
  ],exs:[{e:'📦',t:'180K→25K'}],srcs:['compact/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/compact']},
spawning:{label:'🧬',kr:'에이전트 스포닝',en:'Agent Spawning',heroAnim:'🧬→🤖→✅',
  descKr:'Fork(캐시 공유) / Fresh(독립) 전략으로 서브에이전트 생성',descEn:'Fork(shared cache) / Fresh(isolated) sub-agent spawn',
  inputKr:'에이전트 타입 + 프롬프트',inputEn:'Agent type + prompt',outputKr:'텍스트 응답',outputEn:'Text response',
  nodes:['engine','coordinator','agent','api','tools','executor'],
  steps:[
    {from:'n-engine',to:'n-coordinator',data:'📋 스펙',term:{t:'→ Agent(Explore)',c:'t-kw'}},
    {from:'n-coordinator',to:'n-agent',data:'🧬 Fork',term:{t:'Fork (parent cache shared)',c:'t-fn'}},
    {from:'n-agent',to:'n-api',data:'☁️ Sub-API',term:{t:'  "READ-ONLY search specialist"',c:'t-str'}},
    {from:'n-agent',to:'n-tools',data:'🔧 도구',term:{t:'  3 tool calls (Glob,Grep,Read)',c:'t-str'}},
    {from:'n-agent',to:'n-engine',data:'✅ 반환',term:{t:'→ Text response → parent ✓',c:'t-str'}}
  ],exs:[{e:'🧬',t:'Fork/Fresh'}],srcs:['AgentTool.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/tools/AgentTool/AgentTool.ts']},
cost:{label:'💰',kr:'비용 추적',en:'Cost Tracking',heroAnim:'💰→📊→💾',
  descKr:'토큰×모델단가로 세션/생애 비용 누적',descEn:'tokens×rate = cumulative session/lifetime cost',
  inputKr:'API usage 데이터',inputEn:'API usage data',outputKr:'누적 비용',outputEn:'Cumulative cost',
  nodes:['api','engine','cost','session'],
  steps:[
    {from:'n-api',to:'n-engine',data:'📊 1,245tk',term:{t:'→ 847in + 398out = 1,245 tokens',c:'t-kw'}},
    {from:'n-engine',to:'n-cost',data:'💰 $0.003',term:{t:'sonnet: $0.003/1K → $0.003',c:'t-fn'}},
    {from:'n-cost',to:'n-session',data:'💾 저장',term:{t:'session: $0.085 | lifetime: $12.43',c:'t-num'}}
  ],exs:[{e:'💰',t:'비용 추적'}],srcs:['cost-tracker.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/cost-tracker.ts']},
retry:{label:'🔁',kr:'에러 복구',en:'Error Recovery',heroAnim:'❌→🔁→✅',
  descKr:'지수 백오프(1s→2s→4s) + jitter, 최대 3회 재시도',descEn:'Exponential backoff (1s→2s→4s) + jitter, max 3 retries',
  inputKr:'API 오류',inputEn:'API error',outputKr:'성공 또는 실패',outputEn:'Success or failure',
  nodes:['engine','api','retry'],
  steps:[
    {from:'n-engine',to:'n-api',data:'☁️ 호출',term:{t:'→ 429 Rate Limited',c:'t-err'}},
    {from:'n-api',to:'n-retry',data:'❌ 429',term:{t:'isRetryable → true',c:'t-fn'}},
    {from:'n-retry',to:'n-api',data:'🔁 1.2s',term:{t:'  Retry 1/3: 1.2s...',c:'t-warn'}},
    {from:'n-retry',to:'n-api',data:'🔁 2.4s',term:{t:'  Retry 2/3: 2.4s...',c:'t-warn'}},
    {from:'n-api',to:'n-engine',data:'✅ 성공',term:{t:'→ Success on attempt 3 ✓',c:'t-str'}}
  ],exs:[{e:'🔁',t:'백오프 재시도'}],srcs:[]},
cache:{label:'🗄️',kr:'프롬프트 캐시',en:'Prompt Cache',heroAnim:'🗄️→✅→💰',
  descKr:'Static(30-40K 전역) + Dynamic(세션별) 분리로 API 비용 절감',descEn:'Static(30-40K global) + Dynamic(session) split saves API cost',
  inputKr:'시스템 프롬프트',inputEn:'System prompt',outputKr:'캐시 히트/미스',outputEn:'Cache hit/miss',
  nodes:['prompts','context','sysprompt','engine','api','cache'],
  steps:[
    {from:'n-prompts',to:'n-cache',data:'🗄️ 해싱',term:{t:'→ splitSysPromptPrefix()',c:'t-kw'}},
    {from:'n-cache',to:'n-engine',data:'✅ 히트',term:{t:'  Static 30-40K (global cache)',c:'t-fn'}},
    {from:'n-engine',to:'n-api',data:'☁️ cache_ctrl',term:{t:'  Dynamic 5-10K (ephemeral)',c:'t-str'}},
    {from:'n-api',to:'n-engine',data:'💰 45K 절약',term:{t:'→ Cache hit: 45K saved ($0.02)',c:'t-num'}}
  ],exs:[{e:'🗄️',t:'캐시 분할'}],srcs:[]},
skill:{label:'🎯',kr:'스킬 시스템',en:'Skill System',heroAnim:'🎯→🤖→✅',
  descKr:'YAML 프론트매터로 정의된 스킬을 /skill로 실행, 제한 도구+Fork 에이전트',descEn:'YAML-defined skills via /skill, restricted tools + forked agent',
  inputKr:'/skill 명령',inputEn:'/skill command',outputKr:'스킬 결과',outputEn:'Skill result',
  nodes:['user','cli','commands','engine','agent','tools'],
  steps:[
    {from:'n-user',to:'n-cli',data:'🎯 /simplify',term:{t:'$ /simplify',c:'t-kw'}},
    {from:'n-cli',to:'n-commands',data:'📜 파싱',term:{t:'loadSkill() → YAML parsed',c:'t-fn'}},
    {from:'n-commands',to:'n-engine',data:'🧩 주입',term:{t:'  model:opus, fork, tools:Read,Grep',c:'t-str'}},
    {from:'n-engine',to:'n-agent',data:'🤖 Fork',term:{t:'Running in forked agent...',c:'t-fn'}},
    {from:'n-agent',to:'n-engine',data:'✅ 결과',term:{t:'→ 3 recommendations ✓',c:'t-str'}}
  ],exs:[{e:'🎯',t:'/simplify'}],srcs:['skills/|https://github.com/leaf-kit/claude-analysis/tree/main/src/skills']},
worktree:{label:'🌿',kr:'워크트리 격리',en:'Worktree Isolation',heroAnim:'🌿→📂→🔄',
  descKr:'Git worktree로 격리 브랜치 환경 작업, 유지/삭제 선택',descEn:'Git worktree isolated branch work, keep/remove on exit',
  inputKr:'--worktree 플래그',inputEn:'--worktree flag',outputKr:'격리 환경',outputEn:'Isolated env',
  nodes:['user','cli','engine','session','tools','executor'],
  steps:[
    {from:'n-user',to:'n-cli',data:'🌿 worktree',term:{t:'$ claude --worktree feature-xyz',c:'t-kw'}},
    {from:'n-cli',to:'n-engine',data:'📂 생성',term:{t:'git worktree add .claude/worktrees/xyz',c:'t-fn'}},
    {from:'n-engine',to:'n-tools',data:'🔧 격리',term:{t:'  CWD: isolated worktree',c:'t-str'}},
    {from:'n-tools',to:'n-executor',data:'⚙️ 작업',term:{t:'  (file modifications in isolation)',c:''}},
    {from:'n-executor',to:'n-session',data:'💾 보존',term:{t:'exit-worktree --keep',c:'t-fn'}},
    {from:'n-session',to:'n-engine',data:'🔄 복원',term:{t:'→ CWD restored ✓',c:'t-str'}}
  ],exs:[{e:'🌿',t:'워크트리'}],srcs:[]}
};

var allNodes=[],activePat=null,termAbort=null,flowLabels=[],stepNums=[];
var activeFlowIdx=-1,autoPlaying=false,autoPlayIdx=0;
var speedMultiplier=2; // default slow

function init(){
  document.querySelectorAll('.dg-node').forEach(function(n){allNodes.push(n.id);});
  buildPatternList();initTheme();initLang();initPatterns();initSpeed();initAutoplay();
  initFlowCanvas();initThree();initTips();applyLang();
  setTimeout(function(){selectPattern('instruction');},400);
}

/* Build sidebar */
function buildPatternList(){
  var list=document.getElementById('pl-list');if(!list)return;
  var html='',idx=1;
  PAT_ORDER.forEach(function(key){
    var P=PATS[key];if(!P)return;var num=String(idx++).padStart(2,'0');
    html+='<div class="pl-item" data-pat="'+key+'"><div class="pl-row"><span class="pl-num">'+num+'</span><span class="pl-emoji">'+P.label+'</span><strong data-kr="'+P.kr+'" data-en="'+P.en+'"></strong></div><div class="pl-exs">';
    (P.exs||[]).forEach(function(ex){html+='<div class="pl-ex" data-input="'+ex.t+'"><span>'+ex.e+'</span> <code>'+ex.t+'</code></div>';});
    (P.srcs||[]).forEach(function(s){var p=s.split('|');html+='<a class="pl-src" href="'+p[1]+'" target="_blank">📂 '+p[0]+'</a>';});
    html+='</div></div>';
  });
  list.innerHTML=html;
}

/* Speed */
function initSpeed(){
  var slider=document.getElementById('speed-slider');
  var label=document.getElementById('speed-label');
  function update(){
    var v=parseInt(slider.value);
    // 1=slowest(×3), 5=normal(×1), 10=fastest(×0.3)
    speedMultiplier=3/v;
    var display=v<=3?'느림':v<=6?'보통':'빠름';
    label.textContent=display;
  }
  slider.addEventListener('input',update);
  update();
}
function getDelay(base){return base*speedMultiplier;}

/* Theme */
function initTheme(){
  var s=localStorage.getItem('dp-theme');if(s)document.documentElement.setAttribute('data-theme',s);updTI();
  document.getElementById('btn-theme').onclick=function(){var c=document.documentElement.getAttribute('data-theme'),n=c==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);localStorage.setItem('dp-theme',n);updTI();};
}
function updTI(){document.getElementById('theme-icon').textContent=document.documentElement.getAttribute('data-theme')==='dark'?'☀️':'🌙';}

/* Lang */
function initLang(){
  var s=localStorage.getItem('dp-lang');if(s)document.documentElement.setAttribute('data-lang',s);updLL();
  document.getElementById('btn-lang').onclick=function(){var c=document.documentElement.getAttribute('data-lang'),n=c==='en'?'kr':'en';document.documentElement.setAttribute('data-lang',n);localStorage.setItem('dp-lang',n);updLL();applyLang();};
}
function updLL(){document.getElementById('lang-label').textContent=document.documentElement.getAttribute('data-lang')==='en'?'KR':'EN';}
function applyLang(){
  var l=document.documentElement.getAttribute('data-lang')||'kr';
  document.querySelectorAll('[data-kr][data-en]').forEach(function(el){
    if(['STRONG','H2','SPAN','P','DIV','LABEL'].indexOf(el.tagName)!==-1)el.textContent=el.getAttribute('data-'+l)||'';
  });
}

/* Autoplay */
function initAutoplay(){
  document.getElementById('btn-autoplay').onclick=function(){
    autoPlaying=!autoPlaying;
    this.classList.toggle('active-btn',autoPlaying);
    document.getElementById('autoplay-icon').textContent=autoPlaying?'⏸':'▶';
    if(autoPlaying){autoPlayIdx=0;runAutoPlay();}
  };
}
function runAutoPlay(){
  if(!autoPlaying||autoPlayIdx>=PAT_ORDER.length){
    autoPlaying=false;
    document.getElementById('btn-autoplay').classList.remove('active-btn');
    document.getElementById('autoplay-icon').textContent='▶';
    return;
  }
  var key=PAT_ORDER[autoPlayIdx];
  // Mark previous as done
  if(autoPlayIdx>0){
    var prevItem=document.querySelector('.pl-item[data-pat="'+PAT_ORDER[autoPlayIdx-1]+'"]');
    if(prevItem)prevItem.classList.add('done-pat');
  }
  selectPattern(key,function(){
    autoPlayIdx++;
    if(autoPlaying)setTimeout(runAutoPlay,getDelay(800));
  });
}

/* Pattern */
function initPatterns(){
  document.getElementById('pl-list').addEventListener('click',function(e){
    var item=e.target.closest('.pl-item');
    if(item){autoPlaying=false;document.getElementById('btn-autoplay').classList.remove('active-btn');document.getElementById('autoplay-icon').textContent='▶';selectPattern(item.dataset.pat);}
  });
}

var tokenCount=0,timerStart=0,timerInterval=null;

function selectPattern(key,onComplete){
  if(!PATS[key])return;activePat=key;activeFlowIdx=-1;tokenCount=0;
  var P=PATS[key];var lang=document.documentElement.getAttribute('data-lang')||'kr';
  document.querySelectorAll('.pl-item').forEach(function(i){i.classList.toggle('active',i.dataset.pat===key);});
  // Hero
  var hero=document.getElementById('pat-hero');hero.classList.add('show');
  document.getElementById('pat-hero-anim').textContent=P.heroAnim||P.label;
  document.getElementById('pat-hero-title').textContent=P.label+' '+(lang==='kr'?P.kr:P.en);
  document.getElementById('pat-hero-desc').textContent=lang==='kr'?P.descKr:P.descEn;
  document.getElementById('pat-hero-tags').innerHTML='<span class="tag-in">IN: '+(lang==='kr'?P.inputKr:P.inputEn)+'</span><span class="tag-out">OUT: '+(lang==='kr'?P.outputKr:P.outputEn)+'</span>';
  // Timer
  timerStart=Date.now();
  if(timerInterval)clearInterval(timerInterval);
  timerInterval=setInterval(function(){
    var s=((Date.now()-timerStart)/1000).toFixed(1);
    document.getElementById('tb-timer').textContent=s+'s';
  },100);
  // Estimate
  var est=(P.steps.length*getDelay(600)/1000).toFixed(0);
  document.getElementById('tb-step-info').textContent='~'+est+'s · '+P.steps.length+' steps';
  // Reset nodes
  allNodes.forEach(function(nid){var el=document.getElementById(nid);if(!el)return;el.classList.remove('dimmed','active-node','flow-node','done-node','stepping');if(P.nodes.indexOf(el.dataset.mod)!==-1)el.classList.add('flow-node');else el.classList.add('dimmed');});
  document.querySelectorAll('.nd-badge').forEach(function(b){b.classList.remove('show');b.textContent='';});
  flowLabels.forEach(function(el){el.remove();});flowLabels=[];
  stepNums.forEach(function(el){el.remove();});stepNums=[];
  runSteppedAnimation(P,onComplete);
  applyLang();
}

function runSteppedAnimation(P,onComplete){
  if(termAbort)termAbort.stop=true;
  var ctrl={stop:false};termAbort=ctrl;
  var inp=document.getElementById('term-input'),out=document.getElementById('term-output');
  var stepInd=document.getElementById('term-step-ind');
  var tokensEl=document.getElementById('tb-tokens');
  inp.textContent='';out.innerHTML='';stepInd.textContent='';tokenCount=0;tokensEl.textContent='0 tokens';
  var steps=P.steps||[],currentStep=0;

  var firstText=steps[0]?steps[0].term.t.replace(/^[$→>]\s*/,''):'';
  typeC(inp,firstText,getDelay(20),ctrl,function(){
    if(ctrl.stop)return;stepThrough();
  });

  function stepThrough(){
    if(ctrl.stop||currentStep>=steps.length){
      if(timerInterval){clearInterval(timerInterval);timerInterval=null;}
      stepInd.textContent='Complete ✓';
      tokensEl.classList.remove('streaming');
      activeFlowIdx=-1;
      if(onComplete)setTimeout(onComplete,getDelay(300));
      return;
    }
    var step=steps[currentStep];
    var stepNum=currentStep+1;
    activeFlowIdx=currentStep;
    stepInd.textContent='Step '+stepNum+'/'+steps.length;

    // Token count
    var words=(step.term.t||'').split(/\s+/).length;
    tokenCount+=words*3;
    tokensEl.textContent=tokenCount+' tokens';
    tokensEl.classList.add('streaming');
    setTimeout(function(){tokensEl.classList.remove('streaming');},400);

    // Highlight node
    var targetNode=document.getElementById(step.to);
    if(targetNode){
      document.querySelectorAll('.stepping').forEach(function(n){n.classList.remove('stepping');n.classList.add('done-node');});
      targetNode.classList.add('stepping');targetNode.classList.remove('flow-node');
      var badge=document.createElement('div');
      badge.className='step-num'+(step.parallel?' parallel':'');
      badge.textContent=step.parallel?'∥'+stepNum:stepNum;
      targetNode.appendChild(badge);stepNums.push(badge);
      setTimeout(function(){badge.classList.add('show');},50);
    }
    if(step.data)showFlowLabel(step.from,step.to,step.data,step.parallel);

    // Terminal
    var div=document.createElement('div');
    var prefix=document.createElement('span');prefix.className='tk t-step';prefix.textContent='['+stepNum+'] ';prefix.style.animationDelay='0s';
    div.appendChild(prefix);out.appendChild(div);
    tok(div,step.term.t,step.term.c,ctrl,function(){
      if(ctrl.stop)return;
      out.parentElement.scrollTop=out.parentElement.scrollHeight;
      currentStep++;
      setTimeout(stepThrough,getDelay(500));
    });
  }
}

function showFlowLabel(fromId,toId,text,isP){
  var area=document.getElementById('diagram-wrap'),from=document.getElementById(fromId),to=document.getElementById(toId);
  if(!area||!from||!to)return;
  var ar=area.getBoundingClientRect(),fr=from.getBoundingClientRect(),tr=to.getBoundingClientRect();
  var x=(fr.left+fr.width/2+tr.left+tr.width/2)/2-ar.left,y=(fr.top+fr.height/2+tr.top+tr.height/2)/2-ar.top-18;
  var label=document.createElement('div');label.className='flow-label'+(isP?' parallel-label':'');label.textContent=text;
  label.style.left=x+'px';label.style.top=y+'px';area.appendChild(label);flowLabels.push(label);
  setTimeout(function(){label.classList.add('show');},30);
  setTimeout(function(){label.style.opacity='0';setTimeout(function(){if(label.parentNode)label.remove();},400);},getDelay(2000));
}

/* Flow Canvas */
var fCtx,fCan,fW,fH,fTime=0;
function initFlowCanvas(){fCan=document.getElementById('flow-canvas');if(!fCan)return;fCtx=fCan.getContext('2d');resizeF();window.addEventListener('resize',resizeF);requestAnimationFrame(drawF);}
function resizeF(){var a=document.getElementById('diagram-wrap');if(!a)return;var r=a.getBoundingClientRect();fW=r.width;fH=r.height;fCan.width=fW*devicePixelRatio;fCan.height=fH*devicePixelRatio;fCan.style.width=fW+'px';fCan.style.height=fH+'px';fCtx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);}
function nc(id){var e=document.getElementById(id),a=document.getElementById('diagram-wrap');if(!e||!a)return null;var ar=a.getBoundingClientRect(),er=e.getBoundingClientRect();return{x:er.left-ar.left+er.width/2,y:er.top-ar.top+er.height/2};}
function drawF(){
  requestAnimationFrame(drawF);fTime+=.016;fCtx.clearRect(0,0,fW,fH);
  if(!activePat||!PATS[activePat])return;
  var P=PATS[activePat],dk=document.documentElement.getAttribute('data-theme')==='dark';
  P.steps.forEach(function(step,ci){
    var a=nc(step.from),b=nc(step.to);if(!a||!b)return;
    var dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy)||1;
    var off=Math.min(d*.1,18),cx=(a.x+b.x)/2+(dy/d)*off*(ci%2?1:-1),cy=(a.y+b.y)/2-(dx/d)*off*(ci%2?1:-1);
    var isA=ci===activeFlowIdx,isD=ci<activeFlowIdx;
    fCtx.beginPath();fCtx.moveTo(a.x,a.y);fCtx.quadraticCurveTo(cx,cy,b.x,b.y);
    fCtx.strokeStyle=isA?(dk?'rgba(99,102,241,.6)':'rgba(99,102,241,.5)'):isD?(dk?'rgba(99,102,241,.18)':'rgba(99,102,241,.12)'):(dk?'rgba(99,102,241,.04)':'rgba(99,102,241,.03)');
    fCtx.lineWidth=isA?3:isD?2:1;fCtx.stroke();
    if(isA){
      var t=(fTime*.5)%1,px=(1-t)*(1-t)*a.x+2*(1-t)*t*cx+t*t*b.x,py=(1-t)*(1-t)*a.y+2*(1-t)*t*cy+t*t*b.y;
      var g=fCtx.createRadialGradient(px,py,0,px,py,20);g.addColorStop(0,'rgba(99,102,241,'+(dk?.8:.6)+')');g.addColorStop(1,'rgba(99,102,241,0)');
      fCtx.fillStyle=g;fCtx.fillRect(px-20,py-20,40,40);
      fCtx.beginPath();fCtx.arc(px,py,5,0,Math.PI*2);fCtx.fillStyle='#6366F1';fCtx.fill();
      // Terminal signal
      var tb=document.getElementById('terminal');if(tb){var wr=document.getElementById('diagram-wrap').getBoundingClientRect(),tr2=tb.getBoundingClientRect();
        var tt=tr2.top-wr.top;if(b.y+30<tt){fCtx.beginPath();fCtx.moveTo(b.x,b.y+26);fCtx.lineTo(b.x,tt-4);fCtx.strokeStyle='rgba(99,102,241,.12)';fCtx.lineWidth=1;fCtx.setLineDash([3,3]);fCtx.stroke();fCtx.setLineDash([]);
        fCtx.beginPath();fCtx.arc(b.x,tt-4,2.5,0,Math.PI*2);fCtx.fillStyle='rgba(99,102,241,.35)';fCtx.fill();}}
    }
  });
}

/* Three.js */
function initThree(){
  var cv=document.getElementById('three-canvas');if(!cv||typeof THREE==='undefined')return;
  var area=document.getElementById('diagram-wrap'),W=area.clientWidth,H=area.clientHeight;
  var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(55,W/H,.1,500);cam.position.z=35;
  var ren=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});ren.setSize(W,H);ren.setPixelRatio(Math.min(devicePixelRatio,2));ren.setClearColor(0,0);
  var N=100,pos=new Float32Array(N*3),col=new Float32Array(N*3),vel=[];
  var pal=[new THREE.Color(0x4338CA),new THREE.Color(0x6366F1),new THREE.Color(0x818CF8),new THREE.Color(0x312E81)];
  for(var i=0;i<N;i++){var layer=Math.floor(i/(N/5));pos[i*3]=-20+layer*10+(Math.random()-.5)*6;pos[i*3+1]=(Math.random()-.5)*28;pos[i*3+2]=(Math.random()-.5)*12;vel.push({x:0,y:(Math.random()-.5)*.006,z:(Math.random()-.5)*.003});var c=pal[i%pal.length];col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
  var geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  scene.add(new THREE.Points(geo,new THREE.PointsMaterial({size:.45,vertexColors:true,transparent:true,opacity:.25,blending:THREE.AdditiveBlending,depthWrite:false})));
  var mL=200,lp=new Float32Array(mL*6),lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(lp,3));
  scene.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x6366F1,transparent:true,opacity:.02,blending:THREE.AdditiveBlending,depthWrite:false})));
  var time=0;
  (function anim(){requestAnimationFrame(anim);time+=.002;
    for(var i=0;i<N;i++){pos[i*3+1]+=vel[i].y+Math.sin(time*2+i*.1)*.002;pos[i*3+2]+=vel[i].z;if(Math.abs(pos[i*3+1])>14)vel[i].y*=-1;if(Math.abs(pos[i*3+2])>6)vel[i].z*=-1;}
    geo.attributes.position.needsUpdate=true;
    var li=0,la=lg.attributes.position.array;for(var i=0;i<N&&li<mL*6-6;i++){for(var j=i+1;j<N&&li<mL*6-6;j++){var dx=pos[i*3]-pos[j*3],dy=pos[i*3+1]-pos[j*3+1],dz=pos[i*3+2]-pos[j*3+2];if(dx*dx+dy*dy+dz*dz<28){la[li++]=pos[i*3];la[li++]=pos[i*3+1];la[li++]=pos[i*3+2];la[li++]=pos[j*3];la[li++]=pos[j*3+1];la[li++]=pos[j*3+2];}}}
    for(var k=li;k<mL*6;k++)la[k]=0;lg.attributes.position.needsUpdate=true;lg.setDrawRange(0,li/3);
    cam.position.x=Math.sin(time*.3)*2;cam.position.y=Math.cos(time*.2)*1.5;cam.lookAt(0,0,0);ren.render(scene,cam);
  })();
  window.addEventListener('resize',function(){W=area.clientWidth;H=area.clientHeight;cam.aspect=W/H;cam.updateProjectionMatrix();ren.setSize(W,H);});
}

function typeC(el,t,s,c,cb){var i=0;(function n(){if(c.stop)return;if(i<t.length){el.textContent+=t[i++];setTimeout(n,s);}else if(cb)cb();})();}
function tok(el,t,cls,c,cb){var ts=t.match(/\S+|\s+/g)||[],i=0;(function n(){if(c&&c.stop)return;if(i<ts.length){var s=document.createElement('span');s.className='tk '+(cls||'');s.textContent=ts[i];s.style.animationDelay=(i*.015)+'s';el.appendChild(s);i++;setTimeout(n,getDelay(10));}else{el.appendChild(document.createTextNode('\n'));if(cb)cb();}})();}

function initTips(){
  var tip=document.getElementById('hover-tip');
  document.addEventListener('mouseover',function(e){var ex=e.target.closest('.pl-ex');if(ex){tip.textContent=ex.dataset.input;tip.classList.add('show');}else tip.classList.remove('show');});
  document.addEventListener('mousemove',function(e){if(tip.classList.contains('show')){tip.style.left=(e.clientX+14)+'px';tip.style.top=(e.clientY-40)+'px';}});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
