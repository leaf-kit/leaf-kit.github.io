/* ============================================
   Claude Code Design Patterns v8
   ============================================ */
(function(){'use strict';

var PAT_ORDER=['instruction','memory','planning','tooluse','refinement','permission','session','memwrite','mcp','compaction','spawning','cost','retry','cache','skill','worktree'];

var PATS={
instruction:{label:'',kr:'명령어 해석',en:'Instruction Following',
  descKr:'사용자가 "이 코드 분석해줘"라고 입력하면, Claude Code는 그 말을 이해하기 위해 15가지 규칙서를 조립합니다. 마치 선생님이 수업 전에 교안을 준비하는 것처럼, 어떤 도구를 쓸 수 있는지, 어떤 말투로 대답할지, 보안 규칙은 뭔지 등을 미리 정리해서 AI에게 보내줍니다.',
  descEn:'When you type "analyze this code", Claude Code assembles 15 rule sections — like a teacher preparing a lesson plan before class. It prepares which tools to use, what tone to speak in, security rules, etc., and sends it all to the AI.',
  inputKr:'사용자가 입력한 텍스트',inputEn:'Text entered by user',
  outputKr:'완성된 규칙서 + AI 응답 시작',outputEn:'Completed rulebook + AI response starts',
  nodes:['user','cli','commands','prompts','context','sysprompt','engine','api'],
  steps:[
    {from:'n-user',to:'n-cli',data:'User prompt text',term:{t:'$ claude "이 코드 분석해줘"',c:'t-kw'}},
    {from:'n-cli',to:'n-commands',data:'Slash command check',term:{t:'processUserInput() → not a slash command',c:'t-fn'}},
    {from:'n-cli',to:'n-prompts',data:'Start assembly',term:{t:'getSystemPrompt() → 15 sections assembling',c:'t-fn'}},
    {from:'n-prompts',to:'n-context',data:'Load CLAUDE.md',term:{t:'  Static(7): global cache | Dynamic(8): ephemeral',c:'t-str'}},
    {from:'n-context',to:'n-sysprompt',data:'Apply priority',term:{t:'buildEffectiveSystemPrompt() → 5-tier chain',c:'t-fn'}},
    {from:'n-sysprompt',to:'n-engine',data:'Final prompt',term:{t:'  Override > Coordinator > Agent > Custom > Default',c:'t-str'}},
    {from:'n-engine',to:'n-api',data:'API call',term:{t:'→ messages.create() streaming...',c:'t-kw'}}
  ],exs:[{t:'claude "analyze code"'}],srcs:['prompts.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/constants/prompts.ts']},

memory:{label:'',kr:'컨텍스트 메모리',en:'Context Memory',
  descKr:'Claude Code는 이전에 나눈 대화를 기억합니다. 마치 일기장처럼 CLAUDE.md 파일에 프로젝트 규칙을, MEMORY.md에 학습한 내용을, 세션 메모리에 현재 작업 상태를 저장합니다. 다음에 다시 물어볼 때 "아, 지난번에 이 작업 하고 있었지!" 하고 기억해냅니다.',
  descEn:'Claude Code remembers past conversations. Like a diary, it stores project rules in CLAUDE.md, learned knowledge in MEMORY.md, and current work state in session memory. Next time you ask, it remembers "Oh, we were working on this last time!"',
  inputKr:'이전 대화 + 설정 파일들',inputEn:'Past conversations + config files',
  outputKr:'기억이 담긴 풍부한 컨텍스트',outputEn:'Rich context with memories',
  nodes:['user','cli','claudemd','memory','memdir','extract','context','engine','api'],
  steps:[
    {from:'n-user',to:'n-cli',data:'Resume request',term:{t:'$ claude --resume "이어서 작업해줘"',c:'t-kw'}},
    {from:'n-cli',to:'n-claudemd',data:'4-layer load',term:{t:'getClaudeMds() → /etc > ~/.claude > project > local',c:'t-fn'}},
    {from:'n-claudemd',to:'n-context',data:'Merge layers',term:{t:'  @include directives resolved recursively',c:'t-str'}},
    {from:'n-cli',to:'n-memory',data:'Restore session',term:{t:'SessionMemory → 9-section template loaded',c:'t-fn'}},
    {from:'n-memdir',to:'n-engine',data:'Load MEMORY.md',term:{t:'loadMemoryPrompt() → relevant memories prefetched',c:'t-fn'}},
    {from:'n-engine',to:'n-api',data:'Context inject',term:{t:'→ API call with enriched context...',c:'t-kw'}},
    {from:'n-api',to:'n-extract',data:'Extract trigger',term:{t:'extractMemories() → 4-type classify & save',c:'t-fn'}},
    {from:'n-extract',to:'n-memdir',data:'Save 4 types',term:{t:'  feedback | patterns | workflow | tech saved',c:'t-str'}}
  ],exs:[{t:'claude --resume'}],srcs:['SessionMemory/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/SessionMemory']},

planning:{label:'',kr:'계획 수립 & 추론',en:'Planning & Reasoning',
  descKr:'"전체 리팩토링 해줘"처럼 복잡한 일을 시키면, Claude Code는 혼자 다 하지 않고 팀을 꾸립니다. 먼저 정찰팀(Explore)이 코드를 살펴보고, 그 결과를 종합해서 구체적인 계획을 세운 뒤, 실행팀(General)이 작업하고 검증팀(Verify)이 확인합니다.',
  descEn:'For complex tasks like "refactor everything", Claude Code builds a team. Scout agents (Explore) survey the code first, results are synthesized into a concrete plan, then execution agents (General) work while verification agents (Verify) check.',
  inputKr:'복잡한 작업 요청',inputEn:'Complex task request',
  outputKr:'검증 완료된 결과 (PASS/FAIL)',outputEn:'Verified result (PASS/FAIL)',
  nodes:['user','engine','api','coordinator','agent','tools','executor'],
  steps:[
    {from:'n-user',to:'n-engine',data:'Complex task',term:{t:'$ claude "전체 리팩토링 수행해줘"',c:'t-kw'}},
    {from:'n-engine',to:'n-api',data:'LLM reasoning',term:{t:'Coordinator Mode activated',c:'t-fn'}},
    {from:'n-api',to:'n-coordinator',data:'Task analysis',term:{t:'Phase 1: Research (parallel)',c:'t-fn'}},
    {from:'n-coordinator',to:'n-agent',data:'Parallel scouts',parallel:true,term:{t:'  Agent(Explore) || Agent(Explore) scanning...',c:'t-str'}},
    {from:'n-coordinator',to:'n-engine',data:'Synthesize spec',term:{t:'Phase 2: Synthesis → 12 files, 34 changes',c:'t-fn'}},
    {from:'n-coordinator',to:'n-tools',data:'Execute plan',term:{t:'Phase 3: Agent(general) implementing...',c:'t-fn'}},
    {from:'n-agent',to:'n-engine',data:'PASS verified',term:{t:'→ Agent(verify) PASS',c:'t-str'}}
  ],exs:[{t:'Full refactoring'}],srcs:['coordinatorMode.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/coordinator/coordinatorMode.ts']},

tooluse:{label:'',kr:'도구 실행',en:'Tool Execution',
  descKr:'Claude Code는 40개 이상의 도구를 가지고 있습니다. 파일을 읽고(Read), 수정하고(Edit), 터미널 명령을 실행하고(Bash), 웹을 검색하는(WebSearch) 등의 도구입니다. 각 도구는 사용 전에 "이거 해도 될까?" 하고 보안 검사를 거칩니다.',
  descEn:'Claude Code has 40+ tools: reading files (Read), editing (Edit), running terminal commands (Bash), web searching (WebSearch), etc. Each tool passes a security check ("Is this safe to do?") before execution.',
  inputKr:'AI가 생성한 도구 호출 요청',inputEn:'AI-generated tool call request',
  outputKr:'도구 실행 결과 (성공/실패)',outputEn:'Tool result (success/error)',
  nodes:['engine','api','tools','executor','perms','mcp'],
  steps:[
    {from:'n-api',to:'n-engine',data:'tool_use block',term:{t:'→ Tool: FileReadTool("src/main.ts")',c:'t-kw'}},
    {from:'n-engine',to:'n-tools',data:'Find tool',term:{t:'findToolByName("Read") → FileReadTool',c:'t-fn'}},
    {from:'n-tools',to:'n-perms',data:'Permission check',term:{t:'checkPermissions() → Layer 1: allowlist match',c:'t-fn'}},
    {from:'n-perms',to:'n-executor',data:'ALLOW → queue',term:{t:'  ALLOW → concurrent-safe, parallel queue',c:'t-str'}},
    {from:'n-executor',to:'n-engine',data:'Result return',term:{t:'→ tool.call() → 245 lines → ToolResult(success)',c:'t-str'}}
  ],exs:[{t:'Read, Edit, Bash'}],srcs:['StreamingToolExecutor.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/tools/StreamingToolExecutor.ts']},

refinement:{label:'',kr:'정제 & 출력',en:'Refinement & Output',
  descKr:'AI의 답변이 바로 화면에 나오는 게 아닙니다. 답변은 압축기(Compact)를 거쳐 불필요한 부분을 줄이고, 후처리 훅(Hooks)으로 다듬어진 뒤, 36가지 메시지 컴포넌트 중 알맞은 형태로 변환되어 터미널에 예쁘게 출력됩니다.',
  descEn:'AI responses don\'t appear directly on screen. They pass through a compressor (Compact) to trim unnecessary parts, get refined by post-processing hooks (Hooks), then are converted into the right format among 36 message components for pretty terminal output.',
  inputKr:'AI 스트리밍 응답',inputEn:'AI streaming response',
  outputKr:'터미널에 렌더링된 최종 메시지',outputEn:'Final rendered terminal message',
  nodes:['api','engine','query','compact','hooks','messages','ink','output'],
  steps:[
    {from:'n-api',to:'n-engine',data:'Stream received',term:{t:'→ API streaming response received',c:'t-kw'}},
    {from:'n-engine',to:'n-query',data:'Generator loop',term:{t:'query() async generator → processing blocks',c:'t-fn'}},
    {from:'n-query',to:'n-compact',data:'Token check',term:{t:'shouldCompact() → 9-item preservation',c:'t-fn'}},
    {from:'n-query',to:'n-hooks',data:'Post-process',term:{t:'postSamplingHooks() → response filtered',c:'t-fn'}},
    {from:'n-hooks',to:'n-messages',data:'Select component',term:{t:'AssistantTextMessage → markdown render',c:'t-fn'}},
    {from:'n-messages',to:'n-ink',data:'Ink render',term:{t:'Ink.render() → terminal output',c:'t-fn'}},
    {from:'n-ink',to:'n-output',data:'Final output',term:{t:'→ Response streamed to user',c:'t-str'}}
  ],exs:[{t:'Streaming output'}],srcs:['query.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/query.ts']},

permission:{label:'',kr:'권한 & 보안',en:'Permission & Security',
  descKr:'"rm -rf /" 같은 위험한 명령은 자동으로 차단됩니다. 3단계 보안 검사를 거칩니다: 1단계에서 규칙을 확인하고, 2단계에서 AI가 명령어의 구조(AST)를 분석하여 위험도를 판단하고, 3단계에서 사용자에게 최종 확인을 받습니다.',
  descEn:'Dangerous commands like "rm -rf /" are auto-blocked. 3-tier security: Layer 1 checks rules, Layer 2 has AI analyze command structure (AST) for danger, Layer 3 asks the user for final confirmation.',
  inputKr:'도구 실행 요청',inputEn:'Tool execution request',
  outputKr:'허용/거부/확인 요청',outputEn:'ALLOW / DENY / ASK',
  nodes:['engine','tools','perms','executor'],
  steps:[
    {from:'n-engine',to:'n-tools',data:'BashTool call',term:{t:'→ BashTool("rm -rf /")',c:'t-kw'}},
    {from:'n-tools',to:'n-perms',data:'Layer 1: Rules',term:{t:'  Layer 1: Rule check → no match',c:'t-warn'}},
    {from:'n-perms',to:'n-perms',data:'Layer 2: AST',term:{t:'  Layer 2: tree-sitter AST → DANGEROUS',c:'t-err'}},
    {from:'n-perms',to:'n-executor',data:'DENY blocked',term:{t:'  → DENY: destructive operation blocked',c:'t-err'}}
  ],exs:[{t:'rm -rf / → DENY'}],srcs:['permissions/|https://github.com/leaf-kit/claude-analysis/tree/main/src/utils/permissions']},

session:{label:'',kr:'세션 지속성',en:'Session Persistence',
  descKr:'대화 내용은 자동으로 저장됩니다. 마치 게임의 세이브 파일처럼, .claude/sessions/ 폴더에 JSONL 형식으로 기록됩니다. 나중에 --resume 명령으로 이전 대화를 불러와서 이어서 작업할 수 있습니다.',
  descEn:'Conversations auto-save like game save files in .claude/sessions/ as JSONL. Later, use --resume to load a previous conversation and continue where you left off.',
  inputKr:'세션 ID 또는 --resume',inputEn:'Session ID or --resume',
  outputKr:'복원된 대화 상태',outputEn:'Restored conversation state',
  nodes:['user','cli','session','engine','memory','extract'],
  steps:[
    {from:'n-user',to:'n-cli',data:'Resume flag',term:{t:'$ claude --resume session_abc123',c:'t-kw'}},
    {from:'n-cli',to:'n-session',data:'Load JSONL',term:{t:'→ .claude/sessions/abc123.jsonl loaded',c:'t-fn'}},
    {from:'n-session',to:'n-engine',data:'Restore 47 msgs',term:{t:'  47 messages restored',c:'t-str'}},
    {from:'n-engine',to:'n-memory',data:'Rebuild state',term:{t:'recordTranscript() → auto-saving enabled',c:'t-fn'}}
  ],exs:[{t:'--resume'}],srcs:[]},

memwrite:{label:'',kr:'메모리 저장',en:'Memory Write',
  descKr:'세션이 끝나면, 별도의 AI 에이전트가 대화 내용을 분석하여 중요한 내용을 4가지로 분류해서 저장합니다: "이 사용자는 시니어 개발자다"(피드백), "테스트에 실제 DB를 사용해야 한다"(패턴), "배포는 금요일 금지"(프로젝트). 24시간마다 과거 세션들을 통합합니다.',
  descEn:'When a session ends, a separate AI agent analyzes the conversation and saves important info into 4 categories: "user is a senior dev" (feedback), "use real DB for tests" (pattern), "no deploys on Friday" (project). Past sessions are consolidated every 24 hours.',
  inputKr:'세션 대화 내용',inputEn:'Session conversation',
  outputKr:'분류된 메모리 파일들',outputEn:'Classified memory files',
  nodes:['engine','extract','memdir','memory','session'],
  steps:[
    {from:'n-engine',to:'n-extract',data:'Analyze conversation',term:{t:'→ Session end: extractMemories() forked',c:'t-kw'}},
    {from:'n-extract',to:'n-memdir',data:'Save user_*.md',term:{t:'  user_role.md: "senior engineer"',c:'t-str'}},
    {from:'n-extract',to:'n-memdir',data:'Save feedback_*',term:{t:'  feedback_testing.md: "use real DB"',c:'t-str'}},
    {from:'n-memdir',to:'n-memory',data:'Update index',term:{t:'MEMORY.md index updated (+3 entries)',c:'t-fn'}},
    {from:'n-memory',to:'n-session',data:'Persist',term:{t:'→ autoDream: 7 sessions consolidated (24h)',c:'t-kw'}}
  ],exs:[{t:'Auto memory extract'}],srcs:['extractMemories/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/extractMemories']},

mcp:{label:'',kr:'MCP 확장',en:'MCP Extension',
  descKr:'MCP(Model Context Protocol)를 통해 외부 서버의 도구를 연결할 수 있습니다. 마치 스마트폰에 앱을 설치하는 것처럼, GitHub, Slack, 데이터베이스 등의 도구를 추가하면 Claude Code가 직접 사용할 수 있게 됩니다.',
  descEn:'MCP (Model Context Protocol) lets you connect external server tools. Like installing apps on a smartphone, you can add GitHub, Slack, database tools that Claude Code can directly use.',
  inputKr:'MCP 도구 호출 요청',inputEn:'MCP tool call request',
  outputKr:'외부 서버 실행 결과',outputEn:'External server result',
  nodes:['engine','tools','mcp','executor','perms'],
  steps:[
    {from:'n-engine',to:'n-tools',data:'Find tool',term:{t:'→ mcp__github__search_repos',c:'t-kw'}},
    {from:'n-mcp',to:'n-tools',data:'Merge MCP tools',term:{t:'assembleToolPool() → merge built-in + MCP',c:'t-fn'}},
    {from:'n-tools',to:'n-perms',data:'Permission',term:{t:'checkPermissions() → ALLOW',c:'t-fn'}},
    {from:'n-perms',to:'n-executor',data:'Forward to MCP',term:{t:'MCPTool.call() → forwarding to server...',c:'t-fn'}},
    {from:'n-executor',to:'n-engine',data:'12 results',term:{t:'→ 12 repositories found',c:'t-str'}}
  ],exs:[{t:'MCP server tools'}],srcs:['mcp/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/mcp']},

compaction:{label:'',kr:'컨텍스트 압축',en:'Context Compaction',
  descKr:'대화가 길어지면 AI가 기억할 수 있는 공간(토큰)이 부족해집니다. 마치 노트가 가득 찼을 때 핵심만 요약하는 것처럼, 180,000 토큰을 25,000 토큰으로 압축합니다. 이때 9가지 핵심 항목(요청, 코드, 오류, 진행 상태 등)은 반드시 보존합니다.',
  descEn:'As conversations grow, the AI runs out of memory space (tokens). Like summarizing a full notebook to key points, it compresses 180K tokens to 25K. Nine critical items (request, code, errors, current state, etc.) are always preserved.',
  inputKr:'180K 토큰 대화',inputEn:'180K token conversation',
  outputKr:'25K 토큰 압축 요약',outputEn:'25K compressed summary',
  nodes:['engine','query','compact','extract','memdir','messages'],
  steps:[
    {from:'n-engine',to:'n-query',data:'Token check',term:{t:'→ 180K/200K = 90% → compact triggered!',c:'t-kw'}},
    {from:'n-query',to:'n-compact',data:'Start compress',term:{t:'shouldCompact() → NO_TOOLS_PREAMBLE',c:'t-warn'}},
    {from:'n-compact',to:'n-extract',data:'Extract memories',term:{t:'  9 items: request, concepts, code, errors, journey...',c:'t-str'}},
    {from:'n-compact',to:'n-query',data:'25K done',term:{t:'→ 180,000 → 25,000 tokens compressed',c:'t-num'}}
  ],exs:[{t:'180K → 25K'}],srcs:['compact/|https://github.com/leaf-kit/claude-analysis/tree/main/src/services/compact']},

spawning:{label:'',kr:'에이전트 스포닝',en:'Agent Spawning',
  descKr:'Claude Code는 혼자 일하지 않습니다. 필요하면 "분신"을 만들어서 병렬로 작업합니다. Fork 방식은 부모의 기억을 공유하고(저비용), Fresh 방식은 독립적으로 동작합니다(특화). 각 분신은 고유한 능력(도구 세트)을 가집니다.',
  descEn:'Claude Code doesn\'t work alone. It creates "clones" for parallel work when needed. Fork mode shares parent memory (low cost), Fresh mode works independently (specialized). Each clone has its own capabilities (tool set).',
  inputKr:'에이전트 타입 + 작업',inputEn:'Agent type + task',
  outputKr:'서브에이전트 결과',outputEn:'Sub-agent result',
  nodes:['engine','coordinator','agent','api','tools','executor'],
  steps:[
    {from:'n-engine',to:'n-coordinator',data:'Create spec',term:{t:'→ Agent(subagent_type: Explore)',c:'t-kw'}},
    {from:'n-coordinator',to:'n-agent',data:'Fork strategy',term:{t:'AgentTool.call() → Fork (parent cache shared)',c:'t-fn'}},
    {from:'n-agent',to:'n-api',data:'Sub-API call',term:{t:'  System prompt: "READ-ONLY search specialist"',c:'t-str'}},
    {from:'n-agent',to:'n-tools',data:'Use tools',term:{t:'  3 tool calls (Glob, Grep, Read)',c:'t-str'}},
    {from:'n-agent',to:'n-engine',data:'Return text',term:{t:'→ Text response returned to parent',c:'t-str'}}
  ],exs:[{t:'Fork / Fresh'}],srcs:['AgentTool.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/tools/AgentTool/AgentTool.ts']},

cost:{label:'',kr:'비용 추적',en:'Cost Tracking',
  descKr:'AI를 사용할 때마다 토큰 비용이 발생합니다. Claude Code는 모든 API 호출의 토큰 수를 세고, 모델별 단가(예: Sonnet은 입력 $0.003/1K, 출력 $0.015/1K)로 계산하여 세션별, 전체 누적 비용을 추적합니다.',
  descEn:'Every AI call costs tokens. Claude Code counts tokens for every API call, calculates costs at model-specific rates (e.g., Sonnet: $0.003/1K input, $0.015/1K output), and tracks cumulative session and lifetime costs.',
  inputKr:'API 응답의 토큰 사용량',inputEn:'API response token usage',
  outputKr:'누적 비용',outputEn:'Cumulative cost',
  nodes:['api','engine','cost','session'],
  steps:[
    {from:'n-api',to:'n-engine',data:'Usage data',term:{t:'→ 847 input + 398 output = 1,245 tokens',c:'t-kw'}},
    {from:'n-engine',to:'n-cost',data:'Calculate',term:{t:'sonnet: $0.003/1K in, $0.015/1K out → $0.009',c:'t-fn'}},
    {from:'n-cost',to:'n-session',data:'Save cost',term:{t:'  session: $0.085 | lifetime: $12.43',c:'t-num'}}
  ],exs:[{t:'Token cost tracking'}],srcs:['cost-tracker.ts|https://github.com/leaf-kit/claude-analysis/tree/main/src/cost-tracker.ts']},

retry:{label:'',kr:'에러 복구',en:'Error Recovery',
  descKr:'API 호출이 실패하면 자동으로 재시도합니다. 마치 전화가 안 되면 잠시 기다렸다 다시 거는 것처럼, 1초 → 2초 → 4초로 점점 더 오래 기다리면서(지수적 백오프) 최대 3번 시도합니다. 서버 과부하(429)나 오류(500)만 재시도하고, 잘못된 요청(400)은 바로 포기합니다.',
  descEn:'Failed API calls auto-retry. Like redialing a busy phone, it waits increasingly longer: 1s → 2s → 4s (exponential backoff), up to 3 attempts. Only server overload (429) and errors (500) are retried; bad requests (400) fail immediately.',
  inputKr:'API 오류 응답',inputEn:'API error response',
  outputKr:'성공 또는 최종 실패',outputEn:'Success or final failure',
  nodes:['engine','api','retry'],
  steps:[
    {from:'n-engine',to:'n-api',data:'API call',term:{t:'→ 429 Too Many Requests',c:'t-err'}},
    {from:'n-api',to:'n-retry',data:'429 error',term:{t:'isRetryable(429) → true',c:'t-fn'}},
    {from:'n-retry',to:'n-api',data:'Retry 1.2s',term:{t:'  Retry 1/3: waiting 1.2s...',c:'t-warn'}},
    {from:'n-retry',to:'n-api',data:'Retry 2.4s',term:{t:'  Retry 2/3: waiting 2.4s...',c:'t-warn'}},
    {from:'n-api',to:'n-engine',data:'Success!',term:{t:'→ Success on attempt 3',c:'t-str'}}
  ],exs:[{t:'Exponential backoff'}],srcs:[]},

cache:{label:'',kr:'프롬프트 캐시',en:'Prompt Cache',
  descKr:'시스템 프롬프트의 앞부분(30-40K 토큰)은 전 세계 모든 사용자가 공유하는 "교과서" 같은 내용입니다. 이 부분을 캐싱하면 매번 다시 보낼 필요가 없어서 API 비용을 크게 절약할 수 있습니다. 뒷부분(5-10K)만 세션마다 갱신됩니다.',
  descEn:'The first part of the system prompt (30-40K tokens) is shared globally — like a textbook everyone uses. Caching this part means it doesn\'t need resending every time, greatly saving API costs. Only the latter part (5-10K) refreshes per session.',
  inputKr:'시스템 프롬프트',inputEn:'System prompt',
  outputKr:'캐시 절약 결과',outputEn:'Cache savings result',
  nodes:['prompts','context','sysprompt','engine','api','cache'],
  steps:[
    {from:'n-prompts',to:'n-cache',data:'Hash static',term:{t:'→ splitSysPromptPrefix()',c:'t-kw'}},
    {from:'n-cache',to:'n-engine',data:'Cache hit',term:{t:'  Static 30-40K tokens → global cache HIT',c:'t-fn'}},
    {from:'n-engine',to:'n-api',data:'cache_control',term:{t:'  Dynamic 5-10K tokens → ephemeral',c:'t-str'}},
    {from:'n-api',to:'n-engine',data:'45K saved',term:{t:'→ Cache hit: 45K tokens saved ($0.02)',c:'t-num'}}
  ],exs:[{t:'Global scope split'}],srcs:[]},

skill:{label:'',kr:'스킬 시스템',en:'Skill System',
  descKr:'/simplify처럼 미리 정의된 "기술"을 실행할 수 있습니다. 각 스킬은 YAML 파일로 정의되어 있고, 사용할 도구, 실행 모델, 포크 방식 등을 지정합니다. 마치 레시피북에서 요리법을 꺼내 따라하는 것과 같습니다.',
  descEn:'You can run pre-defined "skills" like /simplify. Each skill is defined in a YAML file specifying tools, model, and fork mode. It\'s like following a recipe from a cookbook.',
  inputKr:'/skill 명령',inputEn:'/skill command',
  outputKr:'스킬 실행 결과',outputEn:'Skill execution result',
  nodes:['user','cli','commands','engine','agent','tools'],
  steps:[
    {from:'n-user',to:'n-cli',data:'/simplify',term:{t:'$ /simplify',c:'t-kw'}},
    {from:'n-cli',to:'n-commands',data:'Parse skill',term:{t:'loadSkill("simplify") → YAML parsed',c:'t-fn'}},
    {from:'n-commands',to:'n-engine',data:'Inject prompt',term:{t:'  model:opus, fork, tools:Read,Grep,Glob',c:'t-str'}},
    {from:'n-engine',to:'n-agent',data:'Fork agent',term:{t:'Running in forked agent...',c:'t-fn'}},
    {from:'n-agent',to:'n-engine',data:'Result',term:{t:'→ 3 recommendations generated',c:'t-str'}}
  ],exs:[{t:'/simplify'}],srcs:['skills/|https://github.com/leaf-kit/claude-analysis/tree/main/src/skills']},

worktree:{label:'',kr:'워크트리 격리',en:'Worktree Isolation',
  descKr:'새 기능을 만들 때 원래 코드를 건드리지 않고 별도의 "작업실"에서 작업할 수 있습니다. Git의 worktree 기능을 활용하여 격리된 브랜치 환경을 만들고, 작업이 끝나면 유지하거나 삭제할 수 있습니다.',
  descEn:'When building new features, you can work in a separate "workshop" without touching the original code. Using Git worktree, it creates an isolated branch environment. When done, you can keep or remove it.',
  inputKr:'--worktree 플래그',inputEn:'--worktree flag',
  outputKr:'격리된 작업 환경',outputEn:'Isolated work environment',
  nodes:['user','cli','engine','session','tools','executor'],
  steps:[
    {from:'n-user',to:'n-cli',data:'Worktree flag',term:{t:'$ claude --worktree feature-xyz',c:'t-kw'}},
    {from:'n-cli',to:'n-engine',data:'Create worktree',term:{t:'git worktree add .claude/worktrees/xyz',c:'t-fn'}},
    {from:'n-engine',to:'n-tools',data:'Isolated tools',term:{t:'  CWD: isolated worktree environment',c:'t-str'}},
    {from:'n-tools',to:'n-executor',data:'Branch work',term:{t:'  (file modifications in isolation)',c:''}},
    {from:'n-executor',to:'n-session',data:'Preserve',term:{t:'exit-worktree --keep → worktree preserved',c:'t-fn'}},
    {from:'n-session',to:'n-engine',data:'Restore CWD',term:{t:'→ CWD restored to original path',c:'t-str'}}
  ],exs:[{t:'Git worktree'}],srcs:[]}
};

var allNodes=[],activePat=null,termAbort=null,flowLabels=[],stepNums=[];
var activeFlowIdx=-1,autoPlaying=false,autoPlayIdx=0;
var speedMultiplier=1.5;

function init(){
  document.querySelectorAll('.dg-node').forEach(function(n){allNodes.push(n.id);});
  buildPatternList();initTheme();initLang();initPatterns();initSpeed();initAutoplay();
  initFlowCanvas();initThree();initTips();initModal();applyLang();
  setTimeout(function(){
    autoPlaying=true;autoPlayIdx=0;
    document.getElementById('btn-autoplay').classList.add('active-btn');
    document.getElementById('autoplay-icon').textContent='||';
    runAutoPlay();
  },500);
}

function buildPatternList(){
  var list=document.getElementById('pl-list');if(!list)return;
  var html='',idx=1;
  PAT_ORDER.forEach(function(key){
    var P=PATS[key];if(!P)return;var num=String(idx++).padStart(2,'0');
    html+='<div class="pl-item" data-pat="'+key+'"><div class="pl-row"><span class="pl-num">'+num+'</span><strong data-kr="'+P.kr+'" data-en="'+P.en+'"></strong></div><div class="pl-exs">';
    (P.exs||[]).forEach(function(ex){html+='<div class="pl-ex" data-input="'+ex.t+'"><code>'+ex.t+'</code></div>';});
    (P.srcs||[]).forEach(function(s){var p=s.split('|');html+='<a class="pl-src" href="'+p[1]+'" target="_blank">'+p[0]+'</a>';});
    html+='</div></div>';
  });
  list.innerHTML=html;
}

function initSpeed(){
  var slider=document.getElementById('speed-slider');
  var label=document.getElementById('speed-label');
  slider.value='3';
  function update(){
    var v=parseInt(slider.value);
    speedMultiplier=4/v;
    var names=['','Very Slow','Slow','Slightly Slow','Slightly Slow','Normal','Normal','Fast','Fast','Very Fast','Very Fast'];
    label.textContent=names[v]||'Normal';
  }
  slider.addEventListener('input',update);update();
}
function getDelay(base){return base*speedMultiplier;}

function initTheme(){
  var s=localStorage.getItem('dp-theme');if(s)document.documentElement.setAttribute('data-theme',s);updTI();
  document.getElementById('btn-theme').onclick=function(){var c=document.documentElement.getAttribute('data-theme'),n=c==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);localStorage.setItem('dp-theme',n);updTI();};
}
function updTI(){document.getElementById('theme-icon').textContent=document.documentElement.getAttribute('data-theme')==='dark'?'Sun':'Moon';}

function initLang(){
  var s=localStorage.getItem('dp-lang');
  if(s){document.documentElement.setAttribute('data-lang',s);}
  else{var bl=(navigator.language||'en').toLowerCase();document.documentElement.setAttribute('data-lang',bl.startsWith('ko')?'kr':'en');}
  updLL();
  document.getElementById('btn-lang').onclick=function(){var c=document.documentElement.getAttribute('data-lang'),n=c==='en'?'kr':'en';document.documentElement.setAttribute('data-lang',n);localStorage.setItem('dp-lang',n);updLL();applyLang();};
}
function updLL(){document.getElementById('lang-label').textContent=document.documentElement.getAttribute('data-lang')==='en'?'KR':'EN';}
function applyLang(){
  var l=document.documentElement.getAttribute('data-lang')||'en';
  document.querySelectorAll('[data-kr][data-en]').forEach(function(el){
    if(['STRONG','H2','SPAN','P','DIV','LABEL','A'].indexOf(el.tagName)!==-1)el.textContent=el.getAttribute('data-'+l)||'';
  });
}

function initAutoplay(){
  document.getElementById('btn-autoplay').onclick=function(){toggleAutoplay();};
}
function toggleAutoplay(){
  autoPlaying=!autoPlaying;
  document.getElementById('btn-autoplay').classList.toggle('active-btn',autoPlaying);
  document.getElementById('autoplay-icon').textContent=autoPlaying?'||':'>';
  if(autoPlaying){
    if(activePat){var idx=PAT_ORDER.indexOf(activePat);if(idx>=0)autoPlayIdx=idx+1;}
    runAutoPlay();
  }
}
function runAutoPlay(){
  if(!autoPlaying)return;
  if(autoPlayIdx>=PAT_ORDER.length){
    autoPlayIdx=0;
    document.querySelectorAll('.pl-item.done-pat').forEach(function(el){el.classList.remove('done-pat');});
  }
  var key=PAT_ORDER[autoPlayIdx];
  if(autoPlayIdx>0){
    var prev=document.querySelector('.pl-item[data-pat="'+PAT_ORDER[autoPlayIdx-1]+'"]');
    if(prev)prev.classList.add('done-pat');
  }
  selectPattern(key,function(){
    autoPlayIdx++;
    if(autoPlaying)setTimeout(runAutoPlay,getDelay(600));
  });
}

function initPatterns(){
  document.getElementById('pl-list').addEventListener('click',function(e){
    var item=e.target.closest('.pl-item');if(!item)return;
    var key=item.dataset.pat;
    if(autoPlaying){
      autoPlaying=false;document.getElementById('btn-autoplay').classList.remove('active-btn');document.getElementById('autoplay-icon').textContent='>';
      selectPattern(key);
    } else if(activePat===key){
      var idx=PAT_ORDER.indexOf(key);if(idx>=0)autoPlayIdx=idx;toggleAutoplay();
    } else {selectPattern(key);}
  });
}

var tokenCount=0,timerStart=0,timerInterval=null;

function selectPattern(key,onComplete){
  if(!PATS[key])return;activePat=key;activeFlowIdx=-1;tokenCount=0;
  var P=PATS[key];var lang=document.documentElement.getAttribute('data-lang')||'en';
  document.querySelectorAll('.pl-item').forEach(function(i){i.classList.toggle('active',i.dataset.pat===key);});
  // Big overlay label
  var patIdx=PAT_ORDER.indexOf(key)+1;
  document.getElementById('current-pattern-label').textContent=String(patIdx).padStart(2,'0')+'. '+(lang==='kr'?P.kr:P.en);
  document.getElementById('current-step-label').textContent='';
  // Hero
  var hero=document.getElementById('pat-hero');hero.classList.add('show');
  document.getElementById('pat-hero-title').textContent=(lang==='kr'?P.kr:P.en);
  document.getElementById('pat-hero-desc').textContent=lang==='kr'?P.descKr:P.descEn;
  document.getElementById('pat-hero-tags').innerHTML='<span class="tag-in">IN: '+(lang==='kr'?P.inputKr:P.inputEn)+'</span><span class="tag-out">OUT: '+(lang==='kr'?P.outputKr:P.outputEn)+'</span>';
  timerStart=Date.now();
  if(timerInterval)clearInterval(timerInterval);
  timerInterval=setInterval(function(){document.getElementById('tb-timer').textContent=((Date.now()-timerStart)/1000).toFixed(1)+'s';},100);
  var est=(P.steps.length*getDelay(600)/1000).toFixed(0);
  document.getElementById('tb-step-info').textContent='~'+est+'s | '+P.steps.length+' steps';
  allNodes.forEach(function(nid){var el=document.getElementById(nid);if(!el)return;el.classList.remove('dimmed','active-node','flow-node','done-node','stepping');if(P.nodes.indexOf(el.dataset.mod)!==-1)el.classList.add('flow-node');else el.classList.add('dimmed');});
  document.querySelectorAll('.nd-badge').forEach(function(b){b.classList.remove('show');b.textContent='';});
  flowLabels.forEach(function(el){el.remove();});flowLabels=[];
  stepNums.forEach(function(el){el.remove();});stepNums=[];
  runSteppedAnimation(P,onComplete);applyLang();
}

function runSteppedAnimation(P,onComplete){
  if(termAbort)termAbort.stop=true;
  var ctrl={stop:false};termAbort=ctrl;
  var inp=document.getElementById('term-input'),out=document.getElementById('term-output');
  var stepInd=document.getElementById('term-step-ind'),tokensEl=document.getElementById('tb-tokens');
  inp.textContent='';out.innerHTML='';stepInd.textContent='';tokenCount=0;tokensEl.textContent='0 tokens';
  var steps=P.steps||[],cur=0;
  var firstText=steps[0]?steps[0].term.t.replace(/^[$>]\s*/,''):'';
  typeC(inp,firstText,getDelay(18),ctrl,function(){if(ctrl.stop)return;go();});

  function go(){
    if(ctrl.stop||cur>=steps.length){
      if(timerInterval){clearInterval(timerInterval);timerInterval=null;}
      stepInd.textContent='Complete';tokensEl.classList.remove('streaming');activeFlowIdx=-1;
      if(onComplete)setTimeout(onComplete,getDelay(300));return;
    }
    var step=steps[cur],num=cur+1;activeFlowIdx=cur;
    stepInd.textContent='Step '+num+'/'+steps.length;
    // Update right overlay with current step action
    document.getElementById('current-step-label').textContent='Step '+num+': '+(step.data||'');
    var words=(step.term.t||'').split(/\s+/).length;tokenCount+=words*3;tokensEl.textContent=tokenCount+' tk';tokensEl.classList.add('streaming');
    setTimeout(function(){tokensEl.classList.remove('streaming');},400);
    var tgt=document.getElementById(step.to);
    if(tgt){document.querySelectorAll('.stepping').forEach(function(n){n.classList.remove('stepping');n.classList.add('done-node');});
      tgt.classList.add('stepping');tgt.classList.remove('flow-node');
      var b=document.createElement('div');b.className='step-num'+(step.parallel?' parallel':'');b.textContent=step.parallel?'||'+num:num;
      tgt.appendChild(b);stepNums.push(b);setTimeout(function(){b.classList.add('show');},50);
    }
    if(step.data)showFlowLabel(step.from,step.to,step.data,step.parallel);
    var div=document.createElement('div');
    var pfx=document.createElement('span');pfx.className='tk t-step';pfx.textContent='['+num+'] ';pfx.style.animationDelay='0s';
    div.appendChild(pfx);out.appendChild(div);
    tok(div,step.term.t,step.term.c,ctrl,function(){if(ctrl.stop)return;out.parentElement.scrollTop=out.parentElement.scrollHeight;cur++;setTimeout(go,getDelay(500));});
  }
}

function showFlowLabel(f,t,text,isP){
  var area=document.getElementById('diagram-wrap'),fe=document.getElementById(f),te=document.getElementById(t);
  if(!area||!fe||!te)return;
  var ar=area.getBoundingClientRect(),fr=fe.getBoundingClientRect(),tr=te.getBoundingClientRect();
  var x=(fr.left+fr.width/2+tr.left+tr.width/2)/2-ar.left,y=(fr.top+fr.height/2+tr.top+tr.height/2)/2-ar.top-16;
  var l=document.createElement('div');l.className='flow-label'+(isP?' parallel-label':'');l.textContent=text;
  l.style.left=x+'px';l.style.top=y+'px';area.appendChild(l);flowLabels.push(l);
  setTimeout(function(){l.classList.add('show');},30);
  setTimeout(function(){l.style.opacity='0';setTimeout(function(){if(l.parentNode)l.remove();},400);},getDelay(2000));
}

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
      var tb=document.getElementById('terminal');if(tb){var wr=document.getElementById('diagram-wrap').getBoundingClientRect(),tr2=tb.getBoundingClientRect();
        var tt=tr2.top-wr.top;if(b.y+30<tt){fCtx.beginPath();fCtx.moveTo(b.x,b.y+26);fCtx.lineTo(b.x,tt-4);fCtx.strokeStyle='rgba(99,102,241,.12)';fCtx.lineWidth=1;fCtx.setLineDash([3,3]);fCtx.stroke();fCtx.setLineDash([]);}}
    }
  });
}

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
function tok(el,t,cls,c,cb){
  var ts=t.match(/\S+|\s+/g)||[],i=0;var ctEl=document.getElementById('tb-current-token');
  (function n(){if(c&&c.stop)return;if(i<ts.length){var s=document.createElement('span');s.className='tk '+(cls||'');s.textContent=ts[i];s.style.animationDelay=(i*.012)+'s';el.appendChild(s);if(ctEl&&ts[i].trim())ctEl.textContent='> '+ts[i].trim();i++;setTimeout(n,getDelay(10));}else{el.appendChild(document.createTextNode('\n'));if(ctEl)ctEl.textContent='';if(cb)cb();}})();
}

function initTips(){
  var tip=document.getElementById('hover-tip');
  document.addEventListener('mouseover',function(e){var ex=e.target.closest('.pl-ex');if(ex){tip.textContent=ex.dataset.input;tip.classList.add('show');}else tip.classList.remove('show');});
  document.addEventListener('mousemove',function(e){if(tip.classList.contains('show')){tip.style.left=(e.clientX+14)+'px';tip.style.top=(e.clientY-40)+'px';}});
}

function initModal(){
  var overlay=document.getElementById('modal-overlay');
  document.getElementById('modal-close').onclick=function(){overlay.classList.remove('show');};
  overlay.onclick=function(e){if(e.target===overlay)overlay.classList.remove('show');};
  document.getElementById('diagram').addEventListener('click',function(e){
    var node=e.target.closest('.dg-node');if(!node||e.target.closest('a'))return;
    var lang=document.documentElement.getAttribute('data-lang')||'en';
    var learn=node.getAttribute('data-learn-'+lang)||node.getAttribute('data-learn-en');
    var code=node.getAttribute('data-code');var src=node.querySelector('.nd-src');
    if(!learn&&!code)return;
    var name=node.querySelector('.nd-info strong');
    document.getElementById('modal-header').textContent=name?name.textContent:'';
    document.getElementById('modal-body').textContent=learn||'';
    document.getElementById('modal-code').textContent=code||'';
    document.getElementById('modal-code').style.display=code?'block':'none';
    var srcLink=document.getElementById('modal-src-link');
    if(src){srcLink.href=src.href;srcLink.style.display='inline';}else{srcLink.style.display='none';}
    overlay.classList.add('show');applyLang();
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
