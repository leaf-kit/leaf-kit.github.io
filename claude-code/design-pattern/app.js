/* ============================================
   Claude Code Design Patterns v3
   Diagram-First Interactive Architecture
   ============================================ */
(function(){
'use strict';

/* ============================================
   Pattern → Module mapping + flow data
   ============================================ */
var PATTERNS = {
  instruction: {
    nodes: ['user','cli','commands','prompts','context','sysprompt','engine','api'],
    flow: [
      ['n-user','n-cli'],['n-cli','n-commands'],['n-cli','n-prompts'],
      ['n-prompts','n-context'],['n-context','n-sysprompt'],
      ['n-sysprompt','n-engine'],['n-engine','n-api']
    ],
    dataLabels: {
      'n-user': '📝 프롬프트',
      'n-cli': '⌨️ argv 파싱',
      'n-prompts': '🧩 15섹션',
      'n-context': '📄 CLAUDE.md + Git',
      'n-sysprompt': '🎯 최종 프롬프트',
      'n-engine': '⚡ API 호출',
      'n-api': '☁️ 스트리밍'
    },
    terminal: {
      input: 'claude "이 코드 분석해줘"',
      lines: [
        {t:'// Pattern: Instruction Following', c:'t-comment'},
        {t:'getSystemPrompt() → 15 sections assembled', c:'t-fn'},
        {t:'  Static(7): tools, tone, security → global cache', c:''},
        {t:'  Dynamic(8): memory, env, MCP → ephemeral', c:''},
        {t:'buildEffectiveSystemPrompt()', c:'t-fn'},
        {t:'  → Override → Coordinator → Agent → Custom → Default', c:'t-str'},
        {t:'getUserContext() → CLAUDE.md 4-layer loaded', c:'t-fn'},
        {t:'getSystemContext() → git branch: main, 5 commits', c:'t-fn'},
        {t:'→ API call with assembled prompt...', c:'t-kw'},
      ]
    }
  },
  memory: {
    nodes: ['user','cli','claudemd','memory','memdir','extract','context','engine','api'],
    flow: [
      ['n-user','n-cli'],['n-cli','n-claudemd'],['n-claudemd','n-context'],
      ['n-cli','n-memory'],['n-memory','n-engine'],
      ['n-memdir','n-engine'],['n-engine','n-api'],
      ['n-api','n-extract'],['n-extract','n-memdir']
    ],
    dataLabels: {
      'n-user': '🧠 이전 대화',
      'n-claudemd': '📋 4-level 계층',
      'n-memory': '💾 9-section',
      'n-memdir': '🗂️ MEMORY.md',
      'n-extract': '💡 4타입 추출',
      'n-engine': '⚡ 컨텍스트 주입'
    },
    terminal: {
      input: 'claude --resume "이어서 작업해줘"',
      lines: [
        {t:'// Pattern: Context Memory', c:'t-comment'},
        {t:'getClaudeMds() → 4-level hierarchy', c:'t-fn'},
        {t:'  /etc → ~/.claude → project → local', c:''},
        {t:'loadMemoryPrompt() → .claude/MEMORY.md', c:'t-fn'},
        {t:'SessionMemory → 9-section template loaded', c:'t-fn'},
        {t:'  Title, State, Files, Workflow, Errors...', c:'t-str'},
        {t:'→ Background sub-agent updating memory...', c:'t-kw'},
        {t:'extractMemories() → feedback | patterns | workflow | tech', c:'t-fn'},
      ]
    }
  },
  planning: {
    nodes: ['user','engine','api','coordinator','agent','tools','executor'],
    flow: [
      ['n-user','n-engine'],['n-engine','n-api'],['n-api','n-coordinator'],
      ['n-coordinator','n-agent'],['n-agent','n-engine'],
      ['n-coordinator','n-tools'],['n-tools','n-executor']
    ],
    dataLabels: {
      'n-user': '🗺️ 복잡한 작업',
      'n-coordinator': '📋 3-Phase',
      'n-agent': '🤖 6종 에이전트',
      'n-engine': '⚡ 쿼리 루프',
      'n-api': '☁️ LLM 추론'
    },
    terminal: {
      input: 'claude "전체 리팩토링 수행해줘"',
      lines: [
        {t:'// Pattern: Planning & Reasoning', c:'t-comment'},
        {t:'Coordinator Mode activated', c:'t-kw'},
        {t:'Phase 1: Research (parallel)', c:'t-fn'},
        {t:'  → Agent(Explore) scanning src/...', c:'t-str'},
        {t:'  → Agent(Explore) scanning tests/...', c:'t-str'},
        {t:'Phase 2: Synthesis', c:'t-fn'},
        {t:'  → Concrete spec: 12 files, 34 changes', c:'t-str'},
        {t:'Phase 3: Implement & Verify', c:'t-fn'},
        {t:'  → Agent(general) implementing...', c:'t-str'},
        {t:'  → Agent(verify) PASS ✓', c:'t-str'},
      ]
    }
  },
  tooluse: {
    nodes: ['engine','api','tools','executor','perms','mcp'],
    flow: [
      ['n-api','n-engine'],['n-engine','n-tools'],['n-tools','n-perms'],
      ['n-perms','n-executor'],['n-executor','n-engine'],
      ['n-mcp','n-tools']
    ],
    dataLabels: {
      'n-engine': '⚡ tool_use 블록',
      'n-tools': '🔧 40+ 레지스트리',
      'n-perms': '🛡️ 3계층 검증',
      'n-executor': '⚙️ 병렬/순차',
      'n-mcp': '🔌 외부 도구'
    },
    terminal: {
      input: '→ Tool: FileReadTool("src/main.ts")',
      lines: [
        {t:'// Pattern: Tool & Code Execution', c:'t-comment'},
        {t:'findToolByName("Read") → FileReadTool', c:'t-fn'},
        {t:'checkPermissions()', c:'t-fn'},
        {t:'  Layer 1: allowlist → ✓ matched', c:'t-str'},
        {t:'  → ALLOW', c:'t-str'},
        {t:'StreamingToolExecutor.addTool()', c:'t-fn'},
        {t:'  isConcurrencySafe: true → parallel queue', c:''},
        {t:'tool.call() → reading 245 lines...', c:'t-fn'},
        {t:'→ ToolResultBlockParam(success)', c:'t-str'},
      ]
    }
  },
  refinement: {
    nodes: ['api','engine','query','compact','hooks','messages','ink','output'],
    flow: [
      ['n-api','n-engine'],['n-engine','n-query'],['n-query','n-compact'],
      ['n-compact','n-query'],['n-query','n-hooks'],
      ['n-hooks','n-messages'],['n-messages','n-ink'],['n-ink','n-output']
    ],
    dataLabels: {
      'n-api': '☁️ 스트리밍',
      'n-query': '🔄 async generator',
      'n-compact': '📦 9-item 보존',
      'n-hooks': '🪝 후처리',
      'n-messages': '💬 36 컴포넌트',
      'n-output': '✅ 최종 응답'
    },
    terminal: {
      input: '→ Context: 180K/200K tokens (90%)',
      lines: [
        {t:'// Pattern: Refinement & Output', c:'t-comment'},
        {t:'shouldCompact() → true (threshold exceeded)', c:'t-fn'},
        {t:'compact() → 9-item preservation strategy', c:'t-fn'},
        {t:'  1.Request 2.Concepts 3.Code 4.Errors', c:''},
        {t:'  5.Journey 6.Messages 7.Tasks 8.State 9.Next', c:''},
        {t:'  → 180K compressed to 25K tokens', c:'t-str'},
        {t:'extractMemories() → 4-type saved', c:'t-fn'},
        {t:'postSamplingHooks() → response filtered', c:'t-fn'},
        {t:'→ Streaming to terminal...', c:'t-kw'},
      ]
    }
  },
  permission: {
    nodes: ['engine','tools','perms','executor'],
    flow: [
      ['n-engine','n-tools'],['n-tools','n-perms'],['n-perms','n-executor'],
      ['n-executor','n-engine']
    ],
    dataLabels: {
      'n-tools': '🔧 BashTool',
      'n-perms': '🛡️ AST 파싱',
      'n-executor': '⚙️ DENY'
    },
    terminal: {
      input: '→ Tool: BashTool("rm -rf /")',
      lines: [
        {t:'// Pattern: Permission & Security', c:'t-comment'},
        {t:'BashTool.checkPermissions("rm -rf /")', c:'t-fn'},
        {t:'  Layer 1: Rule check → ⚠ no match', c:'t-warn'},
        {t:'  Layer 2: AI classifier + tree-sitter AST', c:'t-fn'},
        {t:'    → parseAST: rm command detected', c:'t-warn'},
        {t:'    → flags: -r (recursive) -f (force)', c:'t-warn'},
        {t:'    → path: / (root filesystem)', c:'t-err'},
        {t:'    → DANGEROUS: destructive root operation', c:'t-err'},
        {t:'  → DENY: Permission refused', c:'t-err'},
      ]
    }
  },
  session: {
    nodes: ['user','cli','session','engine','memory','extract'],
    flow: [
      ['n-user','n-cli'],['n-cli','n-session'],['n-session','n-engine'],
      ['n-engine','n-memory'],['n-memory','n-extract'],['n-extract','n-session']
    ],
    dataLabels: {
      'n-session': '💾 JSONL 저장',
      'n-engine': '⚡ 대화 재개',
      'n-memory': '🧠 상태 복원',
      'n-extract': '💡 메모리 추출'
    },
    terminal: {
      input: 'claude --resume session_abc123',
      lines: [
        {t:'// Pattern: Session Persistence', c:'t-comment'},
        {t:'getSessionIdFromLog("session_abc123")', c:'t-fn'},
        {t:'  → .claude/sessions/abc123.jsonl loaded', c:'t-str'},
        {t:'  → 47 messages restored', c:'t-str'},
        {t:'recordTranscript() → auto-saving enabled', c:'t-fn'},
        {t:'cacheSessionTitle() → "리팩토링 작업"', c:'t-fn'},
        {t:'→ Session resumed, context restored', c:'t-kw'},
      ]
    }
  },
  mcp: {
    nodes: ['engine','tools','mcp','executor','perms'],
    flow: [
      ['n-engine','n-tools'],['n-mcp','n-tools'],['n-tools','n-perms'],
      ['n-perms','n-executor'],['n-executor','n-engine']
    ],
    dataLabels: {
      'n-mcp': '🔌 MCP 서버',
      'n-tools': '🔧 mcp__서버__도구',
      'n-executor': '⚙️ 외부 실행'
    },
    terminal: {
      input: '→ Tool: mcp__github__search_repos',
      lines: [
        {t:'// Pattern: MCP Server Extension', c:'t-comment'},
        {t:'getMcpToolsCommandsAndResources()', c:'t-fn'},
        {t:'  → 3 MCP servers connected', c:'t-str'},
        {t:'assembleToolPool() → merge built-in + MCP tools', c:'t-fn'},
        {t:'  → mcp__github__search_repos found', c:'t-str'},
        {t:'MCPTool.call() → forwarding to MCP server...', c:'t-fn'},
        {t:'→ Result: 12 repositories found', c:'t-str'},
      ]
    }
  },
  compaction: {
    nodes: ['engine','query','compact','extract','memdir','messages'],
    flow: [
      ['n-engine','n-query'],['n-query','n-compact'],['n-compact','n-extract'],
      ['n-extract','n-memdir'],['n-compact','n-query'],['n-query','n-messages']
    ],
    dataLabels: {
      'n-query': '🔄 토큰 체크',
      'n-compact': '📦 180K→25K',
      'n-extract': '💡 동시 추출',
      'n-memdir': '🗂️ 메모리 저장'
    },
    terminal: {
      input: '→ Auto-compact triggered (180K/200K)',
      lines: [
        {t:'// Pattern: Context Compaction', c:'t-comment'},
        {t:'shouldCompact() → tokens 180K > threshold', c:'t-fn'},
        {t:'compact() → NO_TOOLS_PREAMBLE (도구 사용 금지)', c:'t-warn'},
        {t:'  Preserving 9 items:', c:'t-fn'},
        {t:'  1.요청 2.개념 3.코드 4.오류 5.여정', c:'t-str'},
        {t:'  6.메시지 7.작업 8.상태 9.다음단계', c:'t-str'},
        {t:'extractMemories() → running in parallel', c:'t-fn'},
        {t:'→ Context: 180,000 → 25,000 tokens', c:'t-kw'},
      ]
    }
  },
  spawning: {
    nodes: ['engine','coordinator','agent','api','tools','executor'],
    flow: [
      ['n-engine','n-coordinator'],['n-coordinator','n-agent'],
      ['n-agent','n-api'],['n-api','n-agent'],
      ['n-agent','n-tools'],['n-tools','n-executor'],
      ['n-agent','n-engine']
    ],
    dataLabels: {
      'n-coordinator': '📋 스펙 생성',
      'n-agent': '🤖 Fork/Fresh',
      'n-api': '☁️ 하위 호출',
      'n-engine': '⚡ 결과 수집'
    },
    terminal: {
      input: '→ Spawning Agent(subagent_type: Explore)',
      lines: [
        {t:'// Pattern: Agent Spawning', c:'t-comment'},
        {t:'AgentTool.call({type: "Explore", prompt: "..."})', c:'t-fn'},
        {t:'  Strategy: Fork (parent cache shared)', c:'t-str'},
        {t:'  Agent system prompt: "READ-ONLY file search"', c:'t-str'},
        {t:'  Available tools: Glob, Grep, Read, Bash(RO)', c:''},
        {t:'  → Sub-QueryEngine created', c:'t-fn'},
        {t:'  → Sub-agent executing in isolation...', c:'t-kw'},
        {t:'  → 3 tool calls completed', c:'t-str'},
        {t:'→ Text response returned to parent', c:'t-str'},
      ]
    }
  }
};

/* ============================================
   State
   ============================================ */
var activePattern = null;
var allNodeIds = [];

/* ============================================
   Init
   ============================================ */
function init(){
  // Collect all node IDs
  document.querySelectorAll('.d-node').forEach(function(n){
    allNodeIds.push(n.id);
  });

  initPatternList();
  initFlowCanvas();
  initExampleTooltips();

  // Auto-select first pattern
  setTimeout(function(){
    selectPattern('instruction');
  }, 400);
}

/* ============================================
   Pattern List Interaction
   ============================================ */
function initPatternList(){
  document.querySelectorAll('.pat-item').forEach(function(item){
    item.addEventListener('click', function(){
      selectPattern(item.dataset.pattern);
    });
  });

  // Example click → also activates pattern + shows specific input
  document.querySelectorAll('.pat-ex').forEach(function(ex){
    ex.addEventListener('click', function(e){
      e.stopPropagation();
      var pat = ex.closest('.pat-item').dataset.pattern;
      selectPattern(pat);
    });
  });
}

function selectPattern(patternKey){
  if(!PATTERNS[patternKey]) return;
  activePattern = patternKey;
  var P = PATTERNS[patternKey];

  // Update sidebar active
  document.querySelectorAll('.pat-item').forEach(function(item){
    item.classList.toggle('active', item.dataset.pattern === patternKey);
  });

  // Dim/activate nodes
  allNodeIds.forEach(function(nid){
    var el = document.getElementById(nid);
    if(!el) return;
    var mod = el.dataset.module;
    var isActive = P.nodes.indexOf(mod) !== -1;
    el.classList.remove('dimmed','active-node','flow-node');
    if(isActive){
      el.classList.add('flow-node');
    } else {
      el.classList.add('dimmed');
    }
  });

  // Show data labels
  document.querySelectorAll('.d-data').forEach(function(d){ d.classList.remove('show'); d.textContent=''; });
  Object.keys(P.dataLabels).forEach(function(nid){
    var dataEl = document.querySelector('#'+nid+' .d-data');
    if(!dataEl){
      // Create data badge if not exists
      var node = document.getElementById(nid);
      if(node){
        dataEl = document.createElement('div');
        dataEl.className = 'd-data';
        node.appendChild(dataEl);
      }
    }
    if(dataEl){
      dataEl.textContent = P.dataLabels[nid];
      setTimeout(function(){ dataEl.classList.add('show'); }, 100);
    }
  });

  // Highlight source of data (first node as active-node)
  var firstNode = document.getElementById('n-'+P.nodes[0]);
  if(firstNode) firstNode.classList.add('active-node');

  // Run terminal
  runTerminal(P.terminal);
}

/* ============================================
   Flow Canvas — Animated connections
   ============================================ */
var flowCtx, flowCanvas, flowW, flowH;
var flowTime = 0;

function initFlowCanvas(){
  flowCanvas = document.getElementById('flow-canvas');
  if(!flowCanvas) return;
  flowCtx = flowCanvas.getContext('2d');
  resizeFlowCanvas();
  window.addEventListener('resize', resizeFlowCanvas);
  requestAnimationFrame(drawFlow);
}

function resizeFlowCanvas(){
  var area = document.getElementById('diagram-area');
  if(!area) return;
  var r = area.getBoundingClientRect();
  flowW = r.width;
  flowH = r.height;
  flowCanvas.width = flowW * window.devicePixelRatio;
  flowCanvas.height = flowH * window.devicePixelRatio;
  flowCanvas.style.width = flowW+'px';
  flowCanvas.style.height = flowH+'px';
  flowCtx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function getNodeCenter(id){
  var el = document.getElementById(id);
  var area = document.getElementById('diagram-area');
  if(!el||!area) return null;
  var ar = area.getBoundingClientRect();
  var er = el.getBoundingClientRect();
  return { x: er.left - ar.left + er.width/2, y: er.top - ar.top + er.height/2 };
}

function drawFlow(){
  requestAnimationFrame(drawFlow);
  flowTime += 0.012;
  flowCtx.clearRect(0, 0, flowW, flowH);

  if(!activePattern || !PATTERNS[activePattern]) return;
  var P = PATTERNS[activePattern];

  P.flow.forEach(function(conn, ci){
    var a = getNodeCenter(conn[0]);
    var b = getNodeCenter(conn[1]);
    if(!a||!b) return;

    // Curved connection
    var mx = (a.x+b.x)/2;
    var my = (a.y+b.y)/2;
    var dx = b.x-a.x, dy = b.y-a.y;
    var dist = Math.sqrt(dx*dx+dy*dy);
    // Perpendicular offset for curve
    var off = Math.min(dist*0.15, 30);
    var cx = mx + (dy/dist)*off * (ci%2===0?1:-1);
    var cy = my - (dx/dist)*off * (ci%2===0?1:-1);

    // Draw line
    flowCtx.beginPath();
    flowCtx.moveTo(a.x, a.y);
    flowCtx.quadraticCurveTo(cx, cy, b.x, b.y);
    flowCtx.strokeStyle = 'rgba(99,102,241,0.25)';
    flowCtx.lineWidth = 2;
    flowCtx.stroke();

    // Animated particle
    var speed = 0.4 + (ci%3)*0.15;
    var t = ((flowTime * speed + ci*0.3) % 1.4) / 1.4;
    if(t > 1) return; // gap between particles

    var px = (1-t)*(1-t)*a.x + 2*(1-t)*t*cx + t*t*b.x;
    var py = (1-t)*(1-t)*a.y + 2*(1-t)*t*cy + t*t*b.y;

    // Glow
    var grad = flowCtx.createRadialGradient(px, py, 0, px, py, 12);
    grad.addColorStop(0, 'rgba(99,102,241,0.6)');
    grad.addColorStop(1, 'rgba(99,102,241,0)');
    flowCtx.fillStyle = grad;
    flowCtx.fillRect(px-12, py-12, 24, 24);

    // Particle
    flowCtx.beginPath();
    flowCtx.arc(px, py, 3.5, 0, Math.PI*2);
    flowCtx.fillStyle = '#6366F1';
    flowCtx.fill();

    // Trail
    var t2 = t - 0.06;
    if(t2 > 0){
      var px2 = (1-t2)*(1-t2)*a.x + 2*(1-t2)*t2*cx + t2*t2*b.x;
      var py2 = (1-t2)*(1-t2)*a.y + 2*(1-t2)*t2*cy + t2*t2*b.y;
      flowCtx.beginPath();
      flowCtx.arc(px2, py2, 2, 0, Math.PI*2);
      flowCtx.fillStyle = 'rgba(99,102,241,0.3)';
      flowCtx.fill();
    }

    // Arrow head at end
    if(t > 0.9){
      var angle = Math.atan2(b.y-cy, b.x-cx);
      flowCtx.save();
      flowCtx.translate(b.x, b.y);
      flowCtx.rotate(angle);
      flowCtx.beginPath();
      flowCtx.moveTo(0,0);
      flowCtx.lineTo(-8,-4);
      flowCtx.lineTo(-8,4);
      flowCtx.closePath();
      flowCtx.fillStyle = 'rgba(99,102,241,0.5)';
      flowCtx.fill();
      flowCtx.restore();
    }
  });
}

/* ============================================
   Terminal — Token-by-token typing
   ============================================ */
var terminalRunning = false;
var termAbort = null;

function runTerminal(config){
  // Abort previous
  if(termAbort) termAbort.abort = true;
  var ctrl = { abort: false };
  termAbort = ctrl;

  var inputEl = document.getElementById('term-input');
  var outputEl = document.getElementById('term-output');
  inputEl.textContent = '';
  outputEl.innerHTML = '';

  terminalRunning = true;

  // Type input
  typeChars(inputEl, config.input, 30, ctrl, function(){
    if(ctrl.abort) return;
    // Show output line by line, token by token
    var lineIdx = 0;
    function nextLine(){
      if(ctrl.abort || lineIdx >= config.lines.length) return;
      var line = config.lines[lineIdx++];
      var lineEl = document.createElement('div');
      outputEl.appendChild(lineEl);

      tokenize(lineEl, line.t, line.c, ctrl, function(){
        if(ctrl.abort) return;
        setTimeout(nextLine, 60);
      });
    }
    setTimeout(nextLine, 200);
  });
}

function typeChars(el, text, speed, ctrl, cb){
  var i = 0;
  function next(){
    if(ctrl.abort) return;
    if(i < text.length){
      el.textContent += text[i++];
      setTimeout(next, speed);
    } else if(cb) cb();
  }
  next();
}

function tokenize(container, text, cls, ctrl, cb){
  // Split into tokens (words + spaces)
  var tokens = text.match(/\S+|\s+/g) || [];
  var i = 0;
  function next(){
    if(ctrl.abort) return;
    if(i < tokens.length){
      var span = document.createElement('span');
      span.className = 'tk ' + (cls||'');
      span.textContent = tokens[i++];
      span.style.animationDelay = (i*0.03)+'s';
      container.appendChild(span);
      setTimeout(next, 25);
    } else if(cb){
      // Add newline
      container.appendChild(document.createTextNode('\n'));
      cb();
    }
  }
  next();
}

/* ============================================
   Example tooltips (hover on pat-ex)
   ============================================ */
function initExampleTooltips(){
  var tip = document.getElementById('hover-tip');
  document.querySelectorAll('.pat-ex').forEach(function(ex){
    ex.addEventListener('mouseenter', function(e){
      tip.textContent = ex.dataset.input || '';
      tip.classList.add('show');
    });
    ex.addEventListener('mousemove', function(e){
      tip.style.left = (e.clientX+12)+'px';
      tip.style.top = (e.clientY-36)+'px';
    });
    ex.addEventListener('mouseleave', function(){
      tip.classList.remove('show');
    });
  });
}

/* ============================================
   Boot
   ============================================ */
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
