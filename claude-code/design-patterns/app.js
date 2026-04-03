/* ============================================
   Claude Code Design Patterns v6
   Sequential stepping + synced terminal
   ============================================ */
(function(){
'use strict';

/* ===== PATTERN DATA (16) ===== */
var PATS={
instruction:{label:'📝',kr:'명령어 해석',en:'Instruction Following',
  descKr:'사용자가 프롬프트를 입력하면, 15개 섹션의 시스템 프롬프트로 조립되어 API에 전달됩니다. 정적 영역은 전역 캐싱되고, 동적 영역은 세션마다 갱신됩니다.',
  descEn:'When a user enters a prompt, it is assembled into a 15-section system prompt and sent to the API. Static sections are globally cached, dynamic sections refresh per session.',
  inputKr:'사용자 프롬프트 텍스트',inputEn:'User prompt text',
  outputKr:'완성된 System Prompt + API 스트리밍 응답',outputEn:'Assembled System Prompt + API streaming response',
  nodes:['user','cli','commands','prompts','context','sysprompt','engine','api'],
  steps:[
    {from:'n-user',to:'n-cli',data:'📝 "이 코드 분석해줘"',term:{t:'$ claude "이 코드 분석해줘"',c:'t-kw'}},
    {from:'n-cli',to:'n-commands',data:'📜 슬래시 명령 체크',term:{t:'  processUserInput() → not a slash command',c:'t-fn'}},
    {from:'n-cli',to:'n-prompts',data:'🧩 프롬프트 조립 시작',term:{t:'getSystemPrompt() → 15 sections',c:'t-fn'}},
    {from:'n-prompts',to:'n-context',data:'📄 CLAUDE.md 로드',term:{t:'  Static(7): global cache | Dynamic(8): ephemeral',c:'t-str'}},
    {from:'n-context',to:'n-sysprompt',data:'🎯 우선순위 적용',term:{t:'buildEffectiveSystemPrompt() → 5-tier priority',c:'t-fn'}},
    {from:'n-sysprompt',to:'n-engine',data:'✅ 최종 프롬프트',term:{t:'  Override → Coordinator → Agent → Custom → Default',c:'t-str'}},
    {from:'n-engine',to:'n-api',data:'☁️ API 호출',term:{t:'→ anthropic.messages.create() streaming...',c:'t-kw'}}
  ],
  exs:[{e:'📝',t:'claude "이 코드 분석해줘"'},{e:'⚙️',t:'claude --model opus'}],
  srcs:['prompts.ts — 15섹션|https://github.com/leaf-kit/claude-analysis/tree/main/src/constants/prompts.ts','systemPrompt.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/utils/systemPrompt.ts']},
memory:{label:'🧠',kr:'컨텍스트 메모리',en:'Context Memory',
  descKr:'CLAUDE.md 4단계 계층, 세션 메모리 9-section 템플릿, AI 관리 MEMORY.md가 유기적으로 연동되어 풍부한 컨텍스트를 제공합니다.',
  descEn:'4-layer CLAUDE.md hierarchy, 9-section session memory template, and AI-managed MEMORY.md work together to provide rich context.',
  inputKr:'이전 대화 히스토리 + CLAUDE.md 파일들',inputEn:'Previous conversation history + CLAUDE.md files',
  outputKr:'컨텍스트가 주입된 시스템 프롬프트',outputEn:'Context-injected system prompt',
  nodes:['user','cli','claudemd','memory','memdir','extract','context','engine','api'],
  steps:[
    {from:'n-user',to:'n-cli',data:'🧠 --resume 세션 재개',term:{t:'$ claude --resume "이어서 작업해줘"',c:'t-kw'}},
    {from:'n-cli',to:'n-claudemd',data:'📋 4-layer 계층 로드',term:{t:'getClaudeMds() → /etc → ~/.claude → project → local',c:'t-fn'}},
    {from:'n-claudemd',to:'n-context',data:'📄 계층 병합',term:{t:'  @include directives resolved (recursive)',c:'t-str'}},
    {from:'n-cli',to:'n-memory',data:'💾 세션 메모리 복원',term:{t:'SessionMemory → 9-section template loaded',c:'t-fn'}},
    {from:'n-memdir',to:'n-engine',data:'🗂️ MEMORY.md 로드',term:{t:'loadMemoryPrompt() → relevant memories prefetched',c:'t-fn'}},
    {from:'n-memory',to:'n-engine',data:'🧠 9-section 주입',term:{t:'  Title, State, Files, Workflow, Errors, Docs, Learn, Results, Log',c:'t-str'}},
    {from:'n-engine',to:'n-api',data:'☁️ 컨텍스트 주입 호출',term:{t:'→ API call with enriched context...',c:'t-kw'}},
    {from:'n-api',to:'n-extract',data:'💡 추출 트리거',term:{t:'extractMemories() → analyzing conversation...',c:'t-fn'}},
    {from:'n-extract',to:'n-memdir',data:'📝 4타입 저장',term:{t:'  → feedback | patterns | workflow | tech discoveries saved',c:'t-str'}}
  ],
  exs:[{e:'💾',t:'claude --resume'},{e:'📋',t:'CLAUDE.md 4-layer'}],
  srcs:['SessionMemory/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/SessionMemory','claudemd.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/utils/claudemd.ts']},
planning:{label:'🗺️',kr:'계획 수립 & 추론',en:'Planning & Reasoning',
  descKr:'코디네이터가 복잡한 작업을 3단계로 분해합니다: Research(병렬 탐색) → Synthesis(종합) → Implement & Verify. 6종 특화 에이전트가 협업합니다.',
  descEn:'Coordinator decomposes complex tasks in 3 phases: Research (parallel) → Synthesis → Implement & Verify. 6 specialized agents collaborate.',
  inputKr:'복잡한 작업 요청',inputEn:'Complex task request',
  outputKr:'검증된 구현 결과 (PASS/FAIL)',outputEn:'Verified implementation (PASS/FAIL)',
  nodes:['user','engine','api','coordinator','agent','tools','executor'],
  steps:[
    {from:'n-user',to:'n-engine',data:'🗺️ "전체 리팩토링"',term:{t:'$ claude "전체 리팩토링 수행해줘"',c:'t-kw'}},
    {from:'n-engine',to:'n-api',data:'☁️ LLM 추론',term:{t:'Coordinator Mode activated',c:'t-fn'}},
    {from:'n-api',to:'n-coordinator',data:'📋 작업 분석',term:{t:'Phase 1: Research (parallel)',c:'t-fn'}},
    {from:'n-coordinator',to:'n-agent',data:'🤖 병렬 탐색',parallel:true,term:{t:'  → Agent(Explore) ∥ Agent(Explore) scanning...',c:'t-str'}},
    {from:'n-coordinator',to:'n-engine',data:'📊 종합 스펙',term:{t:'Phase 2: Synthesis → 12 files, 34 changes',c:'t-fn'}},
    {from:'n-coordinator',to:'n-tools',data:'🔧 구현 실행',term:{t:'Phase 3: Agent(general) implementing...',c:'t-fn'}},
    {from:'n-tools',to:'n-executor',data:'⚙️ 도구 실행',term:{t:'  → Agent(verify) testing...',c:'t-str'}},
    {from:'n-agent',to:'n-engine',data:'✅ PASS',term:{t:'→ Verification: PASS ✓',c:'t-str'}}
  ],
  exs:[{e:'🗺️',t:'전체 리팩토링'}],
  srcs:['coordinatorMode.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/coordinator/coordinatorMode.ts','AgentTool/|https://github.com/leaf-kit/claude-analysis/tree/main/src/tools/AgentTool']},
tooluse:{label:'🔧',kr:'도구 실행',en:'Tool Execution',
  descKr:'40개 이상의 도구가 3계층 권한 검증을 거쳐 스트리밍 실행기에서 실행됩니다. 읽기 전용 도구는 병렬, 쓰기 도구는 순차 실행됩니다.',
  descEn:'40+ tools pass through 3-tier permission checks and run in the streaming executor. Read-only tools run in parallel, write tools run serially.',
  inputKr:'모델이 생성한 tool_use 블록',inputEn:'Model-generated tool_use block',
  outputKr:'ToolResultBlockParam (Success/Error/Canceled)',outputEn:'ToolResultBlockParam (Success/Error/Canceled)',
  nodes:['engine','api','tools','executor','perms','mcp'],
  steps:[
    {from:'n-api',to:'n-engine',data:'⚡ tool_use 블록 수신',term:{t:'→ Tool: FileReadTool("src/main.ts")',c:'t-kw'}},
    {from:'n-engine',to:'n-tools',data:'🔧 도구 검색',term:{t:'findToolByName("Read") → FileReadTool',c:'t-fn'}},
    {from:'n-tools',to:'n-perms',data:'🛡️ 권한 검증',term:{t:'checkPermissions() → Layer 1: allowlist ✓',c:'t-fn'}},
    {from:'n-perms',to:'n-executor',data:'✅ ALLOW → 실행 큐',term:{t:'  → ALLOW (concurrent-safe: parallel queue)',c:'t-str'}},
    {from:'n-executor',to:'n-engine',data:'📊 결과 반환',term:{t:'tool.call() → 245 lines read → ToolResult(success)',c:'t-str'}}
  ],
  exs:[{e:'🔧',t:'Read, Edit, Bash...'},{e:'💻',t:'Bash 명령 실행'}],
  srcs:['StreamingToolExecutor.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/tools/StreamingToolExecutor.ts','Tool.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/Tool.ts']},
refinement:{label:'✨',kr:'정제 & 출력',en:'Refinement & Output',
  descKr:'응답은 query() async generator 루프를 거쳐 컨텍스트 압축, 도구 결과 요약, 후처리 훅을 통과한 뒤 36개 메시지 컴포넌트로 렌더링됩니다.',
  descEn:'Responses pass through the query() async generator loop with context compaction, tool result summarization, and post-sampling hooks before rendering via 36 message components.',
  inputKr:'API 스트리밍 응답 (text + tool_use + thinking)',inputEn:'API streaming response (text + tool_use + thinking)',
  outputKr:'최종 터미널 렌더링 메시지',outputEn:'Final rendered terminal message',
  nodes:['api','engine','query','compact','hooks','messages','ink','output'],
  steps:[
    {from:'n-api',to:'n-engine',data:'☁️ 스트리밍 수신',term:{t:'→ API streaming response received',c:'t-kw'}},
    {from:'n-engine',to:'n-query',data:'🔄 generator 루프',term:{t:'query() async generator → processing blocks...',c:'t-fn'}},
    {from:'n-query',to:'n-compact',data:'📦 토큰 체크 (180K)',term:{t:'shouldCompact() → true (180K/200K = 90%)',c:'t-fn'}},
    {from:'n-compact',to:'n-query',data:'✅ 25K로 압축',term:{t:'  9-item preservation → 180K → 25K tokens',c:'t-num'}},
    {from:'n-query',to:'n-hooks',data:'🪝 후처리 적용',term:{t:'postSamplingHooks() → response filtered',c:'t-fn'}},
    {from:'n-hooks',to:'n-messages',data:'💬 컴포넌트 선택',term:{t:'AssistantTextMessage → markdown rendering',c:'t-fn'}},
    {from:'n-messages',to:'n-ink',data:'🖥️ Ink 렌더링',term:{t:'Ink.render() → terminal output',c:'t-fn'}},
    {from:'n-ink',to:'n-output',data:'✅ 최종 출력',term:{t:'→ Response streamed to user ✓',c:'t-str'}}
  ],
  exs:[{e:'✨',t:'스트리밍 + 압축'}],
  srcs:['query.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/query.ts','Messages/|https://github.com/leaf-kit/claude-analysis/tree/main/src/components/Messages']},
permission:{label:'🛡️',kr:'권한 & 보안',en:'Permission & Security',
  descKr:'모든 도구 호출은 3계층 권한 게이트를 통과합니다: 규칙 기반 → AI 분류기(Bash AST tree-sitter) → 사용자 확인. 위험한 명령은 자동 차단됩니다.',
  descEn:'All tool calls pass through a 3-tier permission gate: rule-based → AI classifier (Bash AST tree-sitter) → user dialog. Dangerous commands are auto-blocked.',
  inputKr:'도구 실행 요청 (예: rm -rf /)',inputEn:'Tool execution request (e.g., rm -rf /)',
  outputKr:'ALLOW / DENY / ASK 결정',outputEn:'ALLOW / DENY / ASK decision',
  nodes:['engine','tools','perms','executor'],
  steps:[
    {from:'n-engine',to:'n-tools',data:'🔧 BashTool("rm -rf /")',term:{t:'→ BashTool.checkPermissions("rm -rf /")',c:'t-kw'}},
    {from:'n-tools',to:'n-perms',data:'🛡️ Layer 1: 규칙 체크',term:{t:'  Layer 1: Rule check → ⚠ no match',c:'t-warn'}},
    {from:'n-perms',to:'n-perms',data:'🔍 Layer 2: AST 파싱',term:{t:'  Layer 2: tree-sitter AST → rm -r -f / → DANGEROUS',c:'t-err'}},
    {from:'n-perms',to:'n-executor',data:'🚫 DENY',term:{t:'  → DENY: destructive root operation blocked',c:'t-err'}},
    {from:'n-executor',to:'n-engine',data:'📊 거부 결과 반환',term:{t:'→ ToolResult: Permission refused',c:'t-err'}}
  ],
  exs:[{e:'🚫',t:'rm -rf / → DENY'}],
  srcs:['permissions/ 26 files|https://github.com/leaf-kit/claude-analysis/tree/main/src/utils/permissions']},
session:{label:'💾',kr:'세션 지속성',en:'Session Persistence',
  descKr:'모든 대화는 JSONL 형식으로 .claude/sessions/에 자동 저장되며, --resume 플래그로 이전 세션을 복원할 수 있습니다.',
  descEn:'All conversations auto-save in JSONL format to .claude/sessions/, and previous sessions can be restored with the --resume flag.',
  inputKr:'세션 ID 또는 --resume 플래그',inputEn:'Session ID or --resume flag',
  outputKr:'복원된 대화 상태',outputEn:'Restored conversation state',
  nodes:['user','cli','session','engine','memory','extract'],
  steps:[
    {from:'n-user',to:'n-cli',data:'💾 --resume abc123',term:{t:'$ claude --resume session_abc123',c:'t-kw'}},
    {from:'n-cli',to:'n-session',data:'📂 JSONL 로드',term:{t:'getSessionIdFromLog("abc123") → found',c:'t-fn'}},
    {from:'n-session',to:'n-engine',data:'🔄 47 메시지 복원',term:{t:'  → 47 messages restored from .jsonl',c:'t-str'}},
    {from:'n-engine',to:'n-memory',data:'🧠 상태 재구성',term:{t:'recordTranscript() → auto-saving enabled',c:'t-fn'}},
    {from:'n-memory',to:'n-extract',data:'💡 메모리 동기화',term:{t:'→ Session resumed ✓',c:'t-kw'}}
  ],
  exs:[{e:'💾',t:'--resume 세션 재개'}],
  srcs:['sessionStorage|https://github.com/leaf-kit/claude-analysis/tree/main/src/utils']},
memwrite:{label:'📝',kr:'메모리 저장 프로세스',en:'Memory Write Process',
  descKr:'세션 종료 시 포크된 서브에이전트가 대화를 분석하여 4가지 타입(피드백, 패턴, 워크플로우, 기술 발견)으로 분류하고 MEMORY.md 인덱스에 저장합니다. 24시간마다 autoDream이 과거 세션을 통합합니다.',
  descEn:'At session end, a forked sub-agent analyzes conversation into 4 types (feedback, patterns, workflow, tech discoveries) and saves to MEMORY.md index. autoDream consolidates past sessions every 24 hours.',
  inputKr:'세션 대화 내용',inputEn:'Session conversation content',
  outputKr:'분류된 메모리 파일 + MEMORY.md 인덱스',outputEn:'Classified memory files + MEMORY.md index',
  nodes:['engine','extract','memdir','memory','session'],
  steps:[
    {from:'n-engine',to:'n-extract',data:'💡 대화 분석 시작',term:{t:'→ Session end: extracting memories...',c:'t-kw'}},
    {from:'n-extract',to:'n-extract',data:'🔍 4타입 분류',term:{t:'extractMemoriesFromConversation() → forked agent',c:'t-fn'}},
    {from:'n-extract',to:'n-memdir',data:'📝 user_role.md',term:{t:'  → user_role.md: "senior engineer, Go expert"',c:'t-str'}},
    {from:'n-extract',to:'n-memdir',data:'📝 feedback_*.md',term:{t:'  → feedback_testing.md: "use real DB, not mocks"',c:'t-str'}},
    {from:'n-memdir',to:'n-memory',data:'🗂️ 인덱스 업데이트',term:{t:'MEMORY.md index updated (+3 entries)',c:'t-fn'}},
    {from:'n-memory',to:'n-session',data:'💾 세션 저장',term:{t:'→ autoDream: 7 sessions consolidated (24h batch)',c:'t-kw'}}
  ],
  exs:[{e:'📝',t:'자동 메모리 추출 & 저장'}],
  srcs:['extractMemories/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/extractMemories','memdir.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/memdir/memdir.ts']},
mcp:{label:'🔌',kr:'MCP 확장',en:'MCP Extension',
  descKr:'외부 MCP 서버의 도구/리소스를 built-in 도구 풀에 병합합니다. mcp__서버명__도구명 형식으로 통합되어 동일한 권한 게이트를 통과합니다.',
  descEn:'External MCP server tools/resources are merged into the built-in tool pool as mcp__serverName__toolName, passing through the same permission gate.',
  inputKr:'MCP 서버 설정 + 도구 호출 요청',inputEn:'MCP server config + tool call request',
  outputKr:'외부 도구 실행 결과',outputEn:'External tool execution result',
  nodes:['engine','tools','mcp','executor','perms'],
  steps:[
    {from:'n-engine',to:'n-tools',data:'🔧 도구 검색',term:{t:'→ mcp__github__search_repos',c:'t-kw'}},
    {from:'n-mcp',to:'n-tools',data:'🔌 MCP 도구 병합',term:{t:'getMcpTools() → 3 servers, assembleToolPool()',c:'t-fn'}},
    {from:'n-tools',to:'n-perms',data:'🛡️ 권한 검증',term:{t:'checkPermissions() → ALLOW',c:'t-fn'}},
    {from:'n-perms',to:'n-executor',data:'⚙️ 외부 전송',term:{t:'MCPTool.call() → forwarding to MCP server...',c:'t-fn'}},
    {from:'n-executor',to:'n-engine',data:'📊 12 repos',term:{t:'→ Result: 12 repositories found',c:'t-str'}}
  ],
  exs:[{e:'🔌',t:'외부 MCP 도구'}],
  srcs:['services/mcp/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/mcp']},
compaction:{label:'📦',kr:'컨텍스트 압축',en:'Context Compaction',
  descKr:'컨텍스트 토큰이 임계값(~80%)에 도달하면 9가지 핵심 항목을 보존하며 자동 압축합니다. 압축 중에는 도구 사용이 금지됩니다(NO_TOOLS_PREAMBLE).',
  descEn:'When context tokens reach ~80% threshold, auto-compaction preserves 9 critical items. Tool use is forbidden during compaction (NO_TOOLS_PREAMBLE).',
  inputKr:'180K 토큰 대화 컨텍스트',inputEn:'180K token conversation context',
  outputKr:'25K 토큰 압축 요약 + 추출된 메모리',outputEn:'25K token compressed summary + extracted memories',
  nodes:['engine','query','compact','extract','memdir','messages'],
  steps:[
    {from:'n-engine',to:'n-query',data:'🔄 토큰 체크',term:{t:'→ Auto-compact triggered (180K/200K = 90%)',c:'t-kw'}},
    {from:'n-query',to:'n-compact',data:'📦 압축 시작',term:{t:'shouldCompact() → true, NO_TOOLS_PREAMBLE',c:'t-warn'}},
    {from:'n-compact',to:'n-compact',data:'📋 9-item 보존',term:{t:'  Preserving: request, concepts, code, errors, journey,',c:'t-str'}},
    {from:'n-compact',to:'n-extract',data:'💡 동시 메모리 추출',term:{t:'  messages, tasks, state, next step',c:'t-str'}},
    {from:'n-extract',to:'n-memdir',data:'📝 메모리 저장',term:{t:'extractMemories() → running in parallel',c:'t-fn'}},
    {from:'n-compact',to:'n-query',data:'✅ 25K 완료',term:{t:'→ Context: 180,000 → 25,000 tokens compressed',c:'t-num'}}
  ],
  exs:[{e:'📦',t:'180K → 25K 압축'}],
  srcs:['compact/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/compact']},
spawning:{label:'🧬',kr:'에이전트 스포닝',en:'Agent Spawning',
  descKr:'서브에이전트를 Fork(부모 캐시 공유, 저비용) 또는 Fresh(독립 컨텍스트, 특화) 전략으로 생성합니다. 각 에이전트는 고유 시스템 프롬프트와 도구 세트를 가집니다.',
  descEn:'Sub-agents are spawned with Fork (shared cache, low cost) or Fresh (isolated context, specialized) strategy. Each has its own system prompt and tool set.',
  inputKr:'에이전트 타입 + 작업 프롬프트',inputEn:'Agent type + task prompt',
  outputKr:'서브에이전트 텍스트 응답',outputEn:'Sub-agent text response',
  nodes:['engine','coordinator','agent','api','tools','executor'],
  steps:[
    {from:'n-engine',to:'n-coordinator',data:'📋 스펙 생성',term:{t:'→ Agent(subagent_type: Explore)',c:'t-kw'}},
    {from:'n-coordinator',to:'n-agent',data:'🧬 Fork 전략 선택',term:{t:'AgentTool.call() → Fork (parent cache shared)',c:'t-fn'}},
    {from:'n-agent',to:'n-api',data:'☁️ Sub-API 호출',term:{t:'  System prompt: "READ-ONLY file search specialist"',c:'t-str'}},
    {from:'n-api',to:'n-agent',data:'📊 응답 수신',term:{t:'  Tools: Glob, Grep, Read, Bash(RO)',c:'t-str'}},
    {from:'n-agent',to:'n-tools',data:'🔧 도구 사용',term:{t:'  → Sub-QueryEngine: 3 tool calls completed',c:'t-fn'}},
    {from:'n-agent',to:'n-engine',data:'✅ 텍스트 반환',term:{t:'→ Text response returned to parent ✓',c:'t-str'}}
  ],
  exs:[{e:'🧬',t:'Fork / Fresh 전략'}],
  srcs:['AgentTool.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/tools/AgentTool/AgentTool.ts']},
cost:{label:'💰',kr:'비용 추적',en:'Cost Tracking',
  descKr:'모든 API 호출의 토큰 사용량을 모델별 단가로 계산하여 세션/생애 비용을 누적 추적합니다.',
  descEn:'Token usage from every API call is calculated at model-specific rates, tracking cumulative session and lifetime costs.',
  inputKr:'API 응답의 usage 데이터',inputEn:'API response usage data',
  outputKr:'누적 비용 (세션/전체)',outputEn:'Cumulative cost (session/lifetime)',
  nodes:['api','engine','cost','session'],
  steps:[
    {from:'n-api',to:'n-engine',data:'📊 usage: 1,245 tokens',term:{t:'→ API response: 847 input + 398 output tokens',c:'t-kw'}},
    {from:'n-engine',to:'n-cost',data:'💰 비용 계산',term:{t:'calculateModelCost() → sonnet: $0.003/1K in, $0.015/1K out',c:'t-fn'}},
    {from:'n-cost',to:'n-session',data:'💾 비용 저장',term:{t:'  this call: $0.003 | session: $0.085 | lifetime: $12.43',c:'t-num'}}
  ],
  exs:[{e:'💰',t:'토큰 비용 누적'}],
  srcs:['cost-tracker.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/cost-tracker.ts']},
retry:{label:'🔁',kr:'에러 복구 & 재시도',en:'Error Recovery & Retry',
  descKr:'API 오류 시 지수적 백오프(1s→2s→4s)와 jitter로 최대 3회 재시도합니다. 429(Rate Limit), 500(Server Error)은 재시도, 400(Bad Request)은 즉시 실패합니다.',
  descEn:'On API errors, exponential backoff (1s→2s→4s) with jitter retries up to 3 times. 429/500 are retryable, 400 fails immediately.',
  inputKr:'API 오류 응답',inputEn:'API error response',
  outputKr:'성공 응답 또는 최종 실패',outputEn:'Successful response or final failure',
  nodes:['engine','api','retry'],
  steps:[
    {from:'n-engine',to:'n-api',data:'☁️ API 호출',term:{t:'→ API call failed: 429 Too Many Requests',c:'t-err'}},
    {from:'n-api',to:'n-retry',data:'❌ 429 Rate Limit',term:{t:'isRetryable(429) → true',c:'t-fn'}},
    {from:'n-retry',to:'n-api',data:'🔁 1.2s 후 재시도',term:{t:'  Retry 1/3: waiting 1.2s (backoff + jitter)...',c:'t-warn'}},
    {from:'n-api',to:'n-retry',data:'❌ 또 실패',term:{t:'  Retry 2/3: waiting 2.4s...',c:'t-warn'}},
    {from:'n-retry',to:'n-api',data:'🔁 재시도 3',term:{t:'  Retry 3/3: waiting 4.8s...',c:'t-warn'}},
    {from:'n-api',to:'n-engine',data:'✅ 성공',term:{t:'→ Success on attempt 3 ✓',c:'t-str'}}
  ],
  exs:[{e:'🔁',t:'지수적 백오프'}],
  srcs:['withRetry|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/api']},
cache:{label:'🗄️',kr:'프롬프트 캐시 전략',en:'Prompt Cache Strategy',
  descKr:'시스템 프롬프트를 Static(30-40K, 전역 공유)과 Dynamic(세션별)으로 분리하여 API 비용을 절감합니다. 12차원 해싱으로 캐시 브레이크 원인을 추적합니다.',
  descEn:'System prompt is split into Static (30-40K, globally shared) and Dynamic (per-session) to reduce API costs. 12-dimensional hashing tracks cache break causes.',
  inputKr:'시스템 프롬프트 + 도구 스키마',inputEn:'System prompt + tool schemas',
  outputKr:'캐시 히트/미스 결과',outputEn:'Cache hit/miss result',
  nodes:['prompts','context','sysprompt','engine','api','cache'],
  steps:[
    {from:'n-prompts',to:'n-cache',data:'🗄️ Static 해싱',term:{t:'→ Cache status check',c:'t-kw'}},
    {from:'n-cache',to:'n-engine',data:'✅ 캐시 히트',term:{t:'splitSysPromptPrefix() → Static 30-40K (global)',c:'t-fn'}},
    {from:'n-engine',to:'n-api',data:'☁️ cache_control',term:{t:'  Dynamic 5-10K (ephemeral) + tool schemas pinned',c:'t-str'}},
    {from:'n-api',to:'n-engine',data:'📊 45K 절약',term:{t:'→ Cache hit: 45K tokens saved ($0.02 saved)',c:'t-num'}}
  ],
  exs:[{e:'🗄️',t:'글로벌 스코프 분할'}],
  srcs:['promptCacheBreak|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/api']},
skill:{label:'🎯',kr:'스킬 시스템',en:'Skill System',
  descKr:'YAML frontmatter로 정의된 스킬을 /skill 명령으로 실행합니다. 각 스킬은 허용 도구, 모델, 실행 컨텍스트(inline/fork)를 지정할 수 있습니다.',
  descEn:'Skills defined with YAML frontmatter are executed via /skill commands. Each skill specifies allowed tools, model, and execution context (inline/fork).',
  inputKr:'/skill 명령 + 스킬 정의',inputEn:'/skill command + skill definition',
  outputKr:'스킬 실행 결과',outputEn:'Skill execution result',
  nodes:['user','cli','commands','engine','agent','tools'],
  steps:[
    {from:'n-user',to:'n-cli',data:'🎯 /simplify 입력',term:{t:'$ /simplify',c:'t-kw'}},
    {from:'n-cli',to:'n-commands',data:'📜 스킬 파싱',term:{t:'loadSkill("simplify") → YAML frontmatter parsed',c:'t-fn'}},
    {from:'n-commands',to:'n-engine',data:'🧩 프롬프트 주입',term:{t:'  model: opus, context: fork, tools: Read, Grep, Glob',c:'t-str'}},
    {from:'n-engine',to:'n-agent',data:'🤖 Fork 실행',term:{t:'Running skill in forked agent...',c:'t-fn'}},
    {from:'n-agent',to:'n-tools',data:'🔧 제한 도구',term:{t:'  → 3 tool calls (Glob, Grep, Read)',c:'t-str'}},
    {from:'n-agent',to:'n-engine',data:'✅ 결과',term:{t:'→ 3 recommendations: consolidate, extract, simplify',c:'t-str'}}
  ],
  exs:[{e:'🎯',t:'/simplify 코드 정리'}],
  srcs:['skills/|https://github.com/leaf-kit/claude-analysis/tree/main/src/skills']},
worktree:{label:'🌿',kr:'워크트리 격리',en:'Worktree Isolation',
  descKr:'Git worktree를 사용하여 격리된 브랜치 환경에서 작업합니다. 메인 워킹트리에 영향 없이 독립적으로 파일을 수정하고, 완료 후 유지/삭제를 선택합니다.',
  descEn:'Uses Git worktree for isolated branch environments. Files are modified independently without affecting the main working tree, with keep/remove options on exit.',
  inputKr:'--worktree 플래그 + 브랜치명',inputEn:'--worktree flag + branch name',
  outputKr:'격리된 작업 환경 (유지/삭제 선택)',outputEn:'Isolated work environment (keep/remove option)',
  nodes:['user','cli','engine','session','tools','executor'],
  steps:[
    {from:'n-user',to:'n-cli',data:'🌿 --worktree feature',term:{t:'$ claude --worktree feature-xyz',c:'t-kw'}},
    {from:'n-cli',to:'n-engine',data:'📂 워크트리 생성',term:{t:'git worktree add .claude/worktrees/feature-xyz -b feature-xyz',c:'t-fn'}},
    {from:'n-engine',to:'n-tools',data:'🔧 격리 도구 실행',term:{t:'  CWD: /project/.claude/worktrees/feature-xyz',c:'t-str'}},
    {from:'n-tools',to:'n-executor',data:'⚙️ 브랜치 작업',term:{t:'  (isolated file modifications...)',c:''},},
    {from:'n-executor',to:'n-session',data:'💾 워크트리 저장',term:{t:'exit-worktree --keep → worktree preserved',c:'t-fn'}},
    {from:'n-session',to:'n-engine',data:'🔄 CWD 복원',term:{t:'→ CWD restored to /project ✓',c:'t-str'}}
  ],
  exs:[{e:'🌿',t:'Git 워크트리 격리'}],
  srcs:['worktree|https://github.com/leaf-kit/claude-analysis/tree/main/src/tools/AgentTool']}
};

var allNodes=[],activePat=null,termAbort=null,flowLabels=[],stepNums=[];
var activeFlowIdx=-1; // which flow connection is currently animating

function init(){
  document.querySelectorAll('.dg-node').forEach(function(n){allNodes.push(n.id);});
  buildPatternList();initTheme();initLang();initPatterns();initFlowCanvas();initThree();initTips();
  applyLang();
  setTimeout(function(){selectPattern('instruction');},400);
}

/* Build sidebar */
function buildPatternList(){
  var list=document.getElementById('pl-list');if(!list)return;
  var html='',idx=1;
  Object.keys(PATS).forEach(function(key){
    var P=PATS[key],num=String(idx++).padStart(2,'0');
    html+='<div class="pl-item" data-pat="'+key+'"><div class="pl-row"><span class="pl-num">'+num+'</span><span class="pl-emoji">'+P.label+'</span><strong data-kr="'+P.kr+'" data-en="'+P.en+'"></strong></div><div class="pl-exs">';
    (P.exs||[]).forEach(function(ex){html+='<div class="pl-ex" data-input="'+ex.t+'"><span>'+ex.e+'</span> <code>'+ex.t+'</code></div>';});
    (P.srcs||[]).forEach(function(s){var p=s.split('|');html+='<a class="pl-src" href="'+p[1]+'" target="_blank">📂 '+p[0]+'</a>';});
    html+='</div></div>';
  });
  list.innerHTML=html;
}

/* Theme (dark default) */
function initTheme(){
  var s=localStorage.getItem('dp-theme');
  if(s)document.documentElement.setAttribute('data-theme',s);
  updTI();
  document.getElementById('btn-theme').onclick=function(){
    var c=document.documentElement.getAttribute('data-theme'),n=c==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme',n);localStorage.setItem('dp-theme',n);updTI();
  };
}
function updTI(){document.getElementById('theme-icon').textContent=document.documentElement.getAttribute('data-theme')==='dark'?'☀️':'🌙';}

/* Lang */
function initLang(){
  var s=localStorage.getItem('dp-lang');if(s)document.documentElement.setAttribute('data-lang',s);updLL();
  document.getElementById('btn-lang').onclick=function(){
    var c=document.documentElement.getAttribute('data-lang'),n=c==='en'?'kr':'en';
    document.documentElement.setAttribute('data-lang',n);localStorage.setItem('dp-lang',n);updLL();applyLang();
  };
}
function updLL(){document.getElementById('lang-label').textContent=document.documentElement.getAttribute('data-lang')==='en'?'KR':'EN';}
function applyLang(){
  var l=document.documentElement.getAttribute('data-lang')||'kr';
  document.querySelectorAll('[data-kr][data-en]').forEach(function(el){
    if(['STRONG','H2','SPAN','P','DIV'].indexOf(el.tagName)!==-1)el.textContent=el.getAttribute('data-'+l)||'';
  });
}

/* Pattern selection */
function initPatterns(){
  document.getElementById('pl-list').addEventListener('click',function(e){
    var item=e.target.closest('.pl-item');if(item)selectPattern(item.dataset.pat);
  });
}

function selectPattern(key){
  if(!PATS[key])return;activePat=key;activeFlowIdx=-1;
  var P=PATS[key];
  var lang=document.documentElement.getAttribute('data-lang')||'kr';
  // Sidebar active
  document.querySelectorAll('.pl-item').forEach(function(i){i.classList.toggle('active',i.dataset.pat===key);});
  // Show pattern info
  var info=document.getElementById('pat-info');
  info.classList.add('show');
  document.getElementById('pat-info-icon').textContent=P.label;
  document.getElementById('pat-info-title').textContent=lang==='kr'?P.kr:P.en;
  document.getElementById('pat-info-desc').textContent=lang==='kr'?P.descKr:P.descEn;
  var tagsHtml='<span class="pat-info-tag in">INPUT: '+(lang==='kr'?P.inputKr:P.inputEn)+'</span>';
  tagsHtml+='<span class="pat-info-tag out">OUTPUT: '+(lang==='kr'?P.outputKr:P.outputEn)+'</span>';
  document.getElementById('pat-info-tags').innerHTML=tagsHtml;
  // Reset nodes
  allNodes.forEach(function(nid){
    var el=document.getElementById(nid);if(!el)return;
    el.classList.remove('dimmed','active-node','flow-node','done-node','stepping');
    if(P.nodes.indexOf(el.dataset.mod)!==-1)el.classList.add('flow-node');
    else el.classList.add('dimmed');
  });
  // Clear badges, labels, step nums
  document.querySelectorAll('.nd-badge').forEach(function(b){b.classList.remove('show');b.textContent='';});
  flowLabels.forEach(function(el){el.remove();});flowLabels=[];
  stepNums.forEach(function(el){el.remove();});stepNums=[];
  // Run synced stepping
  runSteppedAnimation(P);
  applyLang();
}

/* ===== SEQUENTIAL STEPPING ===== */
function runSteppedAnimation(P){
  if(termAbort)termAbort.stop=true;
  var ctrl={stop:false};termAbort=ctrl;
  var inp=document.getElementById('term-input'),out=document.getElementById('term-output');
  var stepInd=document.getElementById('term-step-ind');
  inp.textContent='';out.innerHTML='';stepInd.textContent='';

  var steps=P.steps||[];
  var currentStep=0;

  // Type first step's terminal input
  var firstInput=steps.length>0?steps[0].term.t:'';
  typeC(inp,P.steps[0]?P.steps[0].term.t.replace(/^[$>→]\s*/,''):'',22,ctrl,function(){
    if(ctrl.stop)return;
    stepThrough();
  });

  function stepThrough(){
    if(ctrl.stop||currentStep>=steps.length)return;
    var step=steps[currentStep];
    var stepNum=currentStep+1;
    activeFlowIdx=currentStep;

    // Update step indicator
    stepInd.textContent='Step '+stepNum+'/'+steps.length;

    // Highlight target node with step number
    var targetNode=document.getElementById(step.to);
    if(targetNode){
      // Remove previous stepping
      document.querySelectorAll('.stepping').forEach(function(n){n.classList.remove('stepping');n.classList.add('done-node');});
      targetNode.classList.add('stepping');
      targetNode.classList.remove('flow-node');
      // Add step number badge
      var badge=document.createElement('div');
      badge.className='step-num'+(step.parallel?' parallel':'');
      badge.textContent=step.parallel?'∥'+stepNum:stepNum;
      targetNode.appendChild(badge);
      stepNums.push(badge);
      setTimeout(function(){badge.classList.add('show');},50);
    }

    // Show flow label (speech bubble)
    if(step.data){
      showFlowLabel(step.from,step.to,step.data,step.parallel);
    }

    // Terminal line with step prefix
    var div=document.createElement('div');
    var prefix=document.createElement('span');
    prefix.className='tk t-step';
    prefix.textContent='['+stepNum+'] ';
    prefix.style.animationDelay='0s';
    div.appendChild(prefix);
    out.appendChild(div);
    tok(div,step.term.t,step.term.c,ctrl,function(){
      if(ctrl.stop)return;
      out.parentElement.scrollTop=out.parentElement.scrollHeight;
      currentStep++;
      if(currentStep<steps.length){
        setTimeout(stepThrough, 600);
      } else {
        activeFlowIdx=-1;
        stepInd.textContent='Complete ✓';
      }
    });
  }
}

function showFlowLabel(fromId,toId,text,isParallel){
  var area=document.getElementById('diagram-wrap');
  var from=document.getElementById(fromId),to=document.getElementById(toId);
  if(!area||!from||!to)return;
  var ar=area.getBoundingClientRect();
  var fr=from.getBoundingClientRect(),tr=to.getBoundingClientRect();
  var x=(fr.left+fr.width/2+tr.left+tr.width/2)/2-ar.left;
  var y=(fr.top+fr.height/2+tr.top+tr.height/2)/2-ar.top-20;
  var label=document.createElement('div');
  label.className='flow-label'+(isParallel?' parallel-label':'');
  label.textContent=text;
  label.style.left=x+'px';label.style.top=y+'px';
  area.appendChild(label);flowLabels.push(label);
  setTimeout(function(){label.classList.add('show');},30);
  setTimeout(function(){label.style.opacity='0';setTimeout(function(){if(label.parentNode)label.remove();},400);},2800);
}

/* ===== FLOW CANVAS — only current step animates ===== */
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
  requestAnimationFrame(drawF);fTime+=.016;fCtx.clearRect(0,0,fW,fH);
  if(!activePat||!PATS[activePat])return;
  var P=PATS[activePat];
  var dk=document.documentElement.getAttribute('data-theme')==='dark';

  P.steps.forEach(function(step,ci){
    var a=nc(step.from),b=nc(step.to);if(!a||!b)return;
    var dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy)||1;
    var off=Math.min(d*.1,20);
    var cx=(a.x+b.x)/2+(dy/d)*off*(ci%2?1:-1);
    var cy=(a.y+b.y)/2-(dx/d)*off*(ci%2?1:-1);

    var isActive=(ci===activeFlowIdx);
    var isDone=(ci<activeFlowIdx);

    // Draw line — dim for inactive, bright for active, medium for done
    fCtx.beginPath();fCtx.moveTo(a.x,a.y);fCtx.quadraticCurveTo(cx,cy,b.x,b.y);
    if(isActive){
      fCtx.strokeStyle=dk?'rgba(99,102,241,.6)':'rgba(99,102,241,.5)';fCtx.lineWidth=3;
    } else if(isDone){
      fCtx.strokeStyle=dk?'rgba(99,102,241,.2)':'rgba(99,102,241,.15)';fCtx.lineWidth=2;
    } else {
      fCtx.strokeStyle=dk?'rgba(99,102,241,.06)':'rgba(99,102,241,.05)';fCtx.lineWidth=1;
    }
    fCtx.stroke();

    // Only animate particle on ACTIVE step
    if(isActive){
      var t=(fTime*.6)%1;
      var px=(1-t)*(1-t)*a.x+2*(1-t)*t*cx+t*t*b.x;
      var py=(1-t)*(1-t)*a.y+2*(1-t)*t*cy+t*t*b.y;

      // Glow
      var g=fCtx.createRadialGradient(px,py,0,px,py,22);
      g.addColorStop(0,'rgba(99,102,241,'+(dk?.8:.6)+')');
      g.addColorStop(1,'rgba(99,102,241,0)');
      fCtx.fillStyle=g;fCtx.fillRect(px-22,py-22,44,44);

      // Main particle
      fCtx.beginPath();fCtx.arc(px,py,5,0,Math.PI*2);
      fCtx.fillStyle='#6366F1';fCtx.fill();

      // Trail
      var t2=t-.08;if(t2>0){
        var px2=(1-t2)*(1-t2)*a.x+2*(1-t2)*t2*cx+t2*t2*b.x;
        var py2=(1-t2)*(1-t2)*a.y+2*(1-t2)*t2*cy+t2*t2*b.y;
        fCtx.beginPath();fCtx.arc(px2,py2,3,0,Math.PI*2);fCtx.fillStyle='rgba(99,102,241,.3)';fCtx.fill();
      }
      var t3=t-.16;if(t3>0){
        var px3=(1-t3)*(1-t3)*a.x+2*(1-t3)*t3*cx+t3*t3*b.x;
        var py3=(1-t3)*(1-t3)*a.y+2*(1-t3)*t3*cy+t3*t3*b.y;
        fCtx.beginPath();fCtx.arc(px3,py3,2,0,Math.PI*2);fCtx.fillStyle='rgba(99,102,241,.15)';fCtx.fill();
      }

      // Arrow
      if(t>.85){
        var ang=Math.atan2(b.y-cy,b.x-cx);
        fCtx.save();fCtx.translate(b.x,b.y);fCtx.rotate(ang);
        fCtx.beginPath();fCtx.moveTo(0,0);fCtx.lineTo(-12,-6);fCtx.lineTo(-12,6);fCtx.closePath();
        fCtx.fillStyle='rgba(99,102,241,.6)';fCtx.fill();fCtx.restore();
      }

      // Signal line from active node to terminal
      var termEl=document.getElementById('terminal');
      if(termEl){
        var tr2=termEl.getBoundingClientRect();
        var wrap=document.getElementById('diagram-wrap').getBoundingClientRect();
        var termTop=tr2.top-wrap.top;
        var nodeBottom=b.y+30;
        if(termTop>nodeBottom){
          fCtx.beginPath();
          fCtx.moveTo(b.x,b.y+28);
          fCtx.lineTo(b.x,termTop-5);
          fCtx.strokeStyle='rgba(99,102,241,.15)';
          fCtx.lineWidth=1;
          fCtx.setLineDash([4,4]);
          fCtx.stroke();
          fCtx.setLineDash([]);
          // Small dot at terminal entry
          fCtx.beginPath();fCtx.arc(b.x,termTop-5,3,0,Math.PI*2);
          fCtx.fillStyle='rgba(99,102,241,.4)';fCtx.fill();
        }
      }
    }
  });
}

/* Three.js — LLM-inspired neural background */
function initThree(){
  var cv=document.getElementById('three-canvas');if(!cv||typeof THREE==='undefined')return;
  var area=document.getElementById('diagram-wrap');
  var W=area.clientWidth,H=area.clientHeight;
  var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(55,W/H,.1,500);cam.position.z=35;
  var ren=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});
  ren.setSize(W,H);ren.setPixelRatio(Math.min(devicePixelRatio,2));ren.setClearColor(0,0);

  // Neural network-like particle layers
  var layers=[],N=120;
  var pos=new Float32Array(N*3),col=new Float32Array(N*3),vel=[];
  var pal=[new THREE.Color(0x4338CA),new THREE.Color(0x6366F1),new THREE.Color(0x818CF8),new THREE.Color(0x312E81)];
  for(var i=0;i<N;i++){
    // Distribute in layers (like neural network layers)
    var layer=Math.floor(i/(N/5));
    pos[i*3]=-20+layer*10+(Math.random()-.5)*6;
    pos[i*3+1]=(Math.random()-.5)*30;
    pos[i*3+2]=(Math.random()-.5)*15;
    vel.push({x:(Math.random()-.5)*.003,y:(Math.random()-.5)*.008,z:(Math.random()-.5)*.003});
    var c=pal[i%pal.length];col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;
  }
  var geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  scene.add(new THREE.Points(geo,new THREE.PointsMaterial({size:.5,vertexColors:true,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false})));

  // Connections between nearby particles
  var mL=300,lp=new Float32Array(mL*6),lg=new THREE.BufferGeometry();
  lg.setAttribute('position',new THREE.BufferAttribute(lp,3));
  scene.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x6366F1,transparent:true,opacity:.025,blending:THREE.AdditiveBlending,depthWrite:false})));

  // Slow rotation
  var time=0;
  (function anim(){
    requestAnimationFrame(anim);time+=.003;
    for(var i=0;i<N;i++){
      pos[i*3+1]+=vel[i].y;pos[i*3+2]+=vel[i].z;
      if(Math.abs(pos[i*3+1])>15)vel[i].y*=-1;
      if(Math.abs(pos[i*3+2])>8)vel[i].z*=-1;
      // Gentle wave
      pos[i*3+1]+=Math.sin(time*2+i*.1)*.003;
    }
    geo.attributes.position.needsUpdate=true;
    var li=0,la=lg.attributes.position.array;
    for(var i=0;i<N&&li<mL*6-6;i++){for(var j=i+1;j<N&&li<mL*6-6;j++){
      var dx=pos[i*3]-pos[j*3],dy=pos[i*3+1]-pos[j*3+1],dz=pos[i*3+2]-pos[j*3+2];
      if(dx*dx+dy*dy+dz*dz<30){la[li++]=pos[i*3];la[li++]=pos[i*3+1];la[li++]=pos[i*3+2];la[li++]=pos[j*3];la[li++]=pos[j*3+1];la[li++]=pos[j*3+2];}
    }}
    for(var k=li;k<mL*6;k++)la[k]=0;
    lg.attributes.position.needsUpdate=true;lg.setDrawRange(0,li/3);
    // Slow orbit
    cam.position.x=Math.sin(time*.3)*3;
    cam.position.y=Math.cos(time*.2)*2;
    cam.lookAt(0,0,0);
    ren.render(scene,cam);
  })();
  window.addEventListener('resize',function(){W=area.clientWidth;H=area.clientHeight;cam.aspect=W/H;cam.updateProjectionMatrix();ren.setSize(W,H);});
}

/* Terminal helpers */
function typeC(el,t,s,c,cb){var i=0;(function n(){if(c.stop)return;if(i<t.length){el.textContent+=t[i++];setTimeout(n,s);}else if(cb)cb();})();}
function tok(el,t,cls,c,cb){var ts=t.match(/\S+|\s+/g)||[],i=0;(function n(){if(c&&c.stop)return;if(i<ts.length){var s=document.createElement('span');s.className='tk '+(cls||'');s.textContent=ts[i];s.style.animationDelay=(i*.018)+'s';el.appendChild(s);i++;setTimeout(n,12);}else{el.appendChild(document.createTextNode('\n'));if(cb)cb();}})();}

/* Tooltips */
function initTips(){
  var tip=document.getElementById('hover-tip');
  document.addEventListener('mouseover',function(e){
    var ex=e.target.closest('.pl-ex');
    if(ex){tip.textContent=ex.dataset.input;tip.classList.add('show');}
    else tip.classList.remove('show');
  });
  document.addEventListener('mousemove',function(e){if(tip.classList.contains('show')){tip.style.left=(e.clientX+14)+'px';tip.style.top=(e.clientY-40)+'px';}});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
