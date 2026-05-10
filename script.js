/* =========================================================
   QuantumLab Beginner — vanilla JS app logic
   ========================================================= */
(() => {

const MODULES = ['qubits','superposition','entanglement','measurement','circuits','algorithms','noise','qec'];
const STORAGE_KEY = 'quantumlab.progress.v1';

// ---------- Persistent state ----------
const defaultProgress = () => {
  const s = {};
  MODULES.forEach(m => s[m] = {done:false, score:0});
  s.challenge = {done:false, score:0};
  return s;
};
let progress = load();

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultProgress();
    return Object.assign(defaultProgress(), JSON.parse(raw));
  }catch{ return defaultProgress(); }
}
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }

// ---------- Toast ----------
const toast = msg => {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2400);
};

// ---------- Glossary data ----------
const GLOSSARY = {
  bit:'A classical unit of information. Either 0 or 1.',
  qubit:'A quantum bit. Can be |0⟩, |1⟩, or a superposition of both.',
  superposition:'A combination of multiple quantum states at the same time.',
  entanglement:'A link between qubits where measuring one tells you about the other.',
  measurement:'The act of reading a qubit, which forces it to choose 0 or 1.',
  gate:'An operation that changes the state of one or more qubits.',
  bloch:'A sphere used to picture the state of a single qubit.',
  hadamard:'The H gate. Turns |0⟩ into a 50/50 superposition.',
  cnot:'A 2-qubit gate that flips the target if the control is 1. Creates entanglement.',
  noise:'Unwanted disturbances that can flip or smear qubit states.',
  pulse:'A precisely shaped energy burst used to apply a gate.',
};

const FAQ = [
  {q:'Do I need math to start?', a:'No! This whole tour avoids equations. We use sliders, bars, and pictures.'},
  {q:'Is a qubit just a fancy bit?', a:'No — a qubit can be 0, 1, or both at once. That extra freedom is where quantum power comes from.'},
  {q:'Can I build a real quantum computer at home?', a:'Not realistically — but you can run real circuits on cloud quantum hardware (e.g. IBM Quantum, IonQ).'},
  {q:'Why is noise such a big deal?', a:'Quantum information is delicate. Tiny disturbances scramble it, so engineers spend huge effort isolating qubits.'},
  {q:'What is a "gate"?', a:'A gate is a tiny operation, like a rotation, that changes a qubit. Stack gates to make a circuit.'},
  {q:'Where do I go after this?', a:'Try IBM Quantum Composer, Microsoft Quantum Katas, or Q-CTRL Black Opal for deeper hands-on practice.'},
];

// ---------- Quiz data ----------
const QUIZ_DATA = {
  qubits:[
    {q:'How many states can one qubit hold *before* it is measured?',
     choices:['Only 0','Only 1','A blend of 0 and 1','Always exactly 2 simultaneously'],
     answer:2,
     explain:'A qubit can be in a superposition — a blend of |0⟩ and |1⟩ — until measurement.'},
    {q:'A classical bit is most like which state of a qubit?',
     choices:['Superposition','|0⟩ or |1⟩ (a definite state)','An entangled qubit','A measured qubit only'],
     answer:1,
     explain:'A bit is always in a definite 0 or 1, similar to a qubit in a clean |0⟩ or |1⟩.'},
    {q:'What does the Bloch arrow pointing straight up represent?',
     choices:['|1⟩','|0⟩','Equal superposition','An error'],
     answer:1,
     explain:'By convention, the +z (up) pole is |0⟩ and the −z (down) pole is |1⟩.'},
  ],
  superposition:[
    {q:'If P(0) = 70%, what is P(1)?',
     choices:['70%','30%','0%','100%'],
     answer:1,
     explain:'Probabilities for a single qubit must add to 100%, so P(1) = 100 − 70 = 30.'},
    {q:'A 50/50 superposition means…',
     choices:['You always get 0','You always get 1','Each measurement is fair-coin random','Both 0 and 1 at once after measuring'],
     answer:2,
     explain:'You see 0 or 1 randomly, with equal chance, every time you measure.'},
    {q:'Which gate creates a balanced superposition from |0⟩?',
     choices:['X','H','CNOT','Measure'],
     answer:1,
     explain:'The Hadamard (H) gate turns |0⟩ into an equal superposition of |0⟩ and |1⟩.'},
  ],
  entanglement:[
    {q:'Two entangled qubits in a Bell state always measure…',
     choices:['Independent random results','Correlated results','Both 0','Both 1'],
     answer:1,
     explain:'In the Bell |Φ+⟩ state, both measurements give the same outcome — they are correlated.'},
    {q:'Entanglement requires the qubits to be…',
     choices:['Touching each other','Linked through prior interaction','Always at room temperature','Made of the same atom'],
     answer:1,
     explain:'They must have interacted in a way that ties their fates together; afterwards distance does not matter.'},
    {q:'What is a CNOT gate good for?',
     choices:['Resetting a qubit','Adding noise','Creating entanglement','Measuring a qubit'],
     answer:2,
     explain:'CNOT (controlled-NOT) is the standard gate for entangling two qubits.'},
  ],
  measurement:[
    {q:'After measurement, a superposed qubit becomes…',
     choices:['Still superposed','Definitely 0 or definitely 1','An entangled state','Erased'],
     answer:1,
     explain:'Measurement collapses the qubit to a single classical outcome.'},
    {q:'Repeated measurements with P(1)=70% give…',
     choices:['Always 1','Always 0','About 70% ones over many trials','Exactly 7 ones, never more'],
     answer:2,
     explain:'Probabilities show up as long-run frequencies — about 70% of many shots will be 1.'},
    {q:'Why not just measure all the time?',
     choices:['It is too slow','It destroys the superposition we want to use','It costs energy','It is illegal'],
     answer:1,
     explain:'Measurement collapses the rich quantum state, losing the parallelism that powers algorithms.'},
  ],
  circuits:[
    {q:'In a circuit, gates are applied…',
     choices:['All at once randomly','In a defined sequence over time','Only once per qubit','In secret'],
     answer:1,
     explain:'A circuit is read left-to-right; each gate acts in order.'},
    {q:'Which gate flips |0⟩ to |1⟩?',
     choices:['H','X','CNOT','Measure'],
     answer:1,
     explain:'X is the bit-flip (NOT) gate.'},
    {q:'Where is the measurement usually placed?',
     choices:['At the very start','At the very end','Both ends','It does not matter'],
     answer:1,
     explain:'You typically run all gates first, then measure to read the answer.'},
  ],
  noise:[
    {q:'Higher noise usually means…',
     choices:['More accurate results','Less accurate results','Faster computation','No effect'],
     answer:1,
     explain:'Noise corrupts qubit states, smearing the measurement statistics away from the ideal.'},
    {q:'A noisy bit-flip has roughly which effect?',
     choices:['Adds a random colour','Flips 0↔1 with some probability','Doubles the qubit','Creates a new qubit'],
     answer:1,
     explain:'A bit-flip channel turns 0 into 1 (or vice-versa) at random with some probability.'},
    {q:'How do we fight noise in real machines?',
     choices:['Ignore it','Better isolation, calibration, and error correction','Use more electricity','Run the circuit louder'],
     answer:1,
     explain:'Engineers cool, shield, calibrate, and add error correction to protect qubits.'},
  ],
  qec:[
    {q:'The 3-qubit bit-flip code can correct how many flips per code block?',
     choices:['0','1','2','3'],
     answer:1,
     explain:'A majority vote handles up to 1 flip out of 3. Two or three flips overwhelm it.'},
    {q:'Above what physical-error rate does the 3-qubit code stop helping?',
     choices:['10%','25%','50%','99%'],
     answer:2,
     explain:'At p = 50% the coded and bare error rates are equal. Above 50%, redundancy makes things worse — that is the code\'s break-even point.'},
    {q:'The main idea of quantum error correction is to…',
     choices:['Make perfect qubits','Encode 1 logical qubit into many physical qubits and detect/fix errors','Run every circuit twice','Replace qubits with classical bits'],
     answer:1,
     explain:'QEC spreads logical information across redundant physical qubits and uses syndrome measurements to detect and fix errors without disturbing the encoded state.'},
  ],
  algorithms:[
    {q:'A quantum coin flip uses which gate before measuring?',
     choices:['X','H','CNOT','None'],
     answer:1,
     explain:'H makes a 50/50 superposition; measuring it produces a fair random bit.'},
    {q:'Grover’s algorithm offers what kind of speed-up?',
     choices:['No speed-up','Linear (×2)','Quadratic (√N)','Exponential'],
     answer:2,
     explain:'Grover finds the marked item in roughly √N steps versus N classically.'},
    {q:'Deutsch–Jozsa decides constant vs balanced in how many quantum queries?',
     choices:['1','log N','N/2','N'],
     answer:0,
     explain:'It needs only 1 quantum query for an answer that classically may require N/2 + 1.'},
  ],
};

const FINAL_QUIZ = [
  {q:'Which of these is unique to quantum, not classical, computing?',
   choices:['Bits','Wires','Superposition + entanglement','Loops'],
   answer:2,
   explain:'Superposition and entanglement together give quantum its edge.'},
  {q:'You apply H to |0⟩ and measure. What do you see over many shots?',
   choices:['Always 0','Always 1','≈50% 0, 50% 1','A new qubit'],
   answer:2,
   explain:'H creates a fair superposition.'},
  {q:'Two qubits in a Bell state show which measurement pattern?',
   choices:['Independent','Always equal (or always opposite)','Always 00','Always 11'],
   answer:1,
   explain:'They are perfectly correlated.'},
  {q:'Increasing noise from 0% to 50% generally…',
   choices:['Sharpens results','Flattens results toward random','Boosts speed','Removes gates'],
   answer:1,
   explain:'High noise pushes outcomes toward 50/50 randomness.'},
  {q:'Why do quantum engineers care so much about pulse calibration?',
   choices:['It looks cool','To get accurate gates','To save battery','To shorten wires'],
   answer:1,
   explain:'Mis-tuned pulses → wrong rotation angle → wrong gate → wrong answer.'},
];

// ---------- Hash router ----------
const sections = document.querySelectorAll('.module');
const navLinks = document.querySelectorAll('.nav-list a');

function showSection(id){
  sections.forEach(s => s.classList.toggle('active', s.id === id));
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
  document.getElementById('sidebar').classList.remove('open');
  window.scrollTo({top:0, behavior:'smooth'});
}
window.addEventListener('hashchange', () => showSection((location.hash||'#qubits').slice(1)));

// ---------- Sidebar mobile toggle ----------
document.getElementById('menu-toggle').onclick = () =>
  document.getElementById('sidebar').classList.toggle('open');

// ---------- Reset ----------
document.getElementById('reset-btn').onclick = () => {
  if(!confirm('Reset all progress?')) return;
  localStorage.removeItem(STORAGE_KEY);
  progress = defaultProgress();
  save();
  toast('Progress reset.');
  setTimeout(()=>location.reload(), 600);
};

// ---------- Render: progress, badges, scores ----------
function render(){
  const done = MODULES.filter(m => progress[m].done).length;
  document.getElementById('progress-text').textContent = `${done} / ${MODULES.length}`;
  document.getElementById('progress-fill').style.width = (done/MODULES.length*100) + '%';

  navLinks.forEach(a => {
    const m = a.dataset.mod;
    if(m && progress[m].done) a.classList.add('done');
    else a.classList.remove('done');
  });

  // badges
  const icons = {qubits:'⚛',superposition:'🌊',entanglement:'🔗',measurement:'📏',
    circuits:'🔲',noise:'📡',qec:'🛡',algorithms:'🧮'};
  const badgesEl = document.getElementById('badges');
  badgesEl.innerHTML = '';
  MODULES.forEach(m => {
    const b = document.createElement('div');
    b.className = 'badge' + (progress[m].done ? ' earned' : '');
    b.title = m + (progress[m].done ? ' — completed' : ' — locked');
    b.textContent = icons[m];
    badgesEl.appendChild(b);
  });

  const totalScore = MODULES.reduce((s,m) => s + (progress[m].score||0), 0) + (progress.challenge.score||0);
  document.getElementById('total-score').textContent = totalScore;

  // challenge nav lock
  document.getElementById('nav-challenge').classList.toggle('locked', done < 6);
}

// ---------- Glossary panels ----------
function renderGlossary(){
  const list = document.getElementById('glossary-list');
  const quick = document.getElementById('quick-glossary');
  list.innerHTML = '';
  quick.innerHTML = '';
  Object.entries(GLOSSARY).forEach(([k,v]) => {
    const cap = k[0].toUpperCase() + k.slice(1);
    const item = document.createElement('div');
    item.className = 'g-item';
    item.innerHTML = `<b>${cap}</b><br><span class="muted">${v}</span>`;
    list.appendChild(item);

    const small = document.createElement('div');
    small.innerHTML = `<b>${cap}</b> — ${v}`;
    quick.appendChild(small);
  });

  // attach tooltips to .term spans
  document.querySelectorAll('.term').forEach(t => {
    const k = t.dataset.term;
    if(GLOSSARY[k]) t.dataset.tip = GLOSSARY[k];
  });
}

function renderFaq(){
  const wrap = document.getElementById('faq-list');
  wrap.innerHTML = '';
  FAQ.forEach(({q,a}) => {
    const d = document.createElement('details');
    d.innerHTML = `<summary>${q}</summary><p>${a}</p>`;
    wrap.appendChild(d);
  });
}

// ---------- Quiz engine ----------
function renderQuiz(moduleId, questions, mountEl, onComplete){
  let idx = 0, score = 0;
  function step(){
    if(idx >= questions.length){
      const passed = score >= Math.ceil(questions.length * 0.66);
      mountEl.innerHTML = `<div class="quiz-result ${passed?'pass':'fail'}">
        ${passed?'✅ Passed':'❌ Try again'} — ${score} / ${questions.length}
      </div>
      <button class="primary-btn" id="retry-${moduleId}">Retake quiz</button>`;
      mountEl.querySelector('#retry-'+moduleId).onclick = () => renderQuiz(moduleId, questions, mountEl, onComplete);
      if(passed) onComplete(score);
      return;
    }
    const Q = questions[idx];
    mountEl.innerHTML = `
      <div class="q-num muted">Question ${idx+1} of ${questions.length}</div>
      <div class="q-text">${Q.q}</div>
      <div class="choices"></div>
      <div class="feedback" style="display:none"></div>
      <button class="primary-btn next-btn" style="display:none;margin-top:10px">Next →</button>
    `;
    const choicesEl = mountEl.querySelector('.choices');
    const fb = mountEl.querySelector('.feedback');
    const next = mountEl.querySelector('.next-btn');

    Q.choices.forEach((c,i) => {
      const btn = document.createElement('button');
      btn.className = 'choice';
      btn.textContent = c;
      btn.onclick = () => {
        Array.from(choicesEl.children).forEach(b => b.disabled = true);
        if(i === Q.answer){
          btn.classList.add('correct');
          score++;
          fb.innerHTML = `<b style="color:var(--success)">Correct.</b> ${Q.explain}`;
        }else{
          btn.classList.add('wrong');
          choicesEl.children[Q.answer].classList.add('correct');
          fb.innerHTML = `<b style="color:var(--danger)">Not quite.</b> ${Q.explain}`;
        }
        fb.style.display = 'block';
        next.style.display = 'inline-block';
      };
      choicesEl.appendChild(btn);
    });
    next.onclick = () => { idx++; step(); };
  }
  step();
}

function attachQuizzes(){
  document.querySelectorAll('.quiz').forEach(card => {
    const id = card.dataset.quiz;
    const body = card.querySelector('.quiz-body');
    renderQuiz(id, QUIZ_DATA[id], body, score => {
      const prev = progress[id].score || 0;
      if(score > prev) progress[id].score = score;
      if(!progress[id].done){
        progress[id].done = true;
        save(); render();
        toast(`🎉 ${id} module complete!`);
      }else{ save(); render(); }
    });
  });
}

// ============================================================
// Module widgets
// ============================================================

// ----- Qubits: Bloch toggle -----
function initQubits(){
  const arrow = document.getElementById('bloch-arrow');
  const explain = document.getElementById('bloch-explain');
  const setActive = el => document.querySelectorAll('.state-btn').forEach(b => b.classList.toggle('active', b===el));
  document.querySelectorAll('.state-btn').forEach(btn => {
    btn.onclick = () => {
      setActive(btn);
      arrow.classList.remove('spin');
      const s = btn.dataset.state;
      if(s==='0'){
        arrow.style.transform='translate(-50%,-100%) rotate(0deg)';
        explain.textContent='Pure |0⟩ — points up. Measurement always returns 0.';
      } else if(s==='1'){
        arrow.style.transform='translate(-50%,-100%) rotate(180deg)';
        explain.textContent='Pure |1⟩ — points down. Measurement always returns 1.';
      } else {
        arrow.style.transform='translate(-50%,-100%) rotate(90deg)';
        explain.textContent='Equal superposition — sweeping the equator. 50/50 on measurement.';
        arrow.classList.add('spin');
      }
    };
  });
}

// ----- Bloch Sphere (3D, interactive) -----
function initBloch(){
  let theta = 0;     // polar from |0⟩, 0..π
  let phi   = 0;     // azimuth, 0..2π
  let viewX = -22;   // current view rotation in degrees
  let viewY = -30;
  const R = 120;     // px, sphere radius for vector

  const cube  = document.getElementById('bloch-cube');
  const tEl   = document.getElementById('bloch-theta');
  const pEl   = document.getElementById('bloch-phi');
  const tV    = document.getElementById('bloch-theta-v');
  const pV    = document.getElementById('bloch-phi-v');
  const vec   = document.getElementById('bloch-vec');
  const tip   = document.getElementById('bloch-tip');
  const stEl  = document.getElementById('bloch-state');
  if(!cube) return;

  // Complex helpers
  const c     = (re, im=0) => [re, im];
  const cAdd  = (a, b) => [a[0]+b[0], a[1]+b[1]];
  const cMul  = (a, b) => [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]];
  const cAbs  = (z) => Math.hypot(z[0], z[1]);
  const cArg  = (z) => Math.atan2(z[1], z[0]);

  const I = c(1), Z0 = c(0);
  const GATES = {
    X: [[Z0, c(1)], [c(1), Z0]],
    Y: [[Z0, c(0,-1)], [c(0,1), Z0]],
    Z: [[I, Z0], [Z0, c(-1)]],
    H: (() => { const s = 1/Math.SQRT2; return [[c(s),c(s)],[c(s),c(-s)]]; })(),
    S: [[I, Z0], [Z0, c(0,1)]],
    T: [[I, Z0], [Z0, c(Math.cos(Math.PI/4), Math.sin(Math.PI/4))]],
  };

  function update(){
    // Display angle text
    const tDeg = theta * 180 / Math.PI;
    const pDeg = phi   * 180 / Math.PI;
    tV.textContent = tDeg.toFixed(0);
    pV.textContent = pDeg.toFixed(0);
    tEl.value = tDeg.toFixed(0);
    pEl.value = pDeg.toFixed(0);

    // Tip position in CSS coords (physics x → css x; physics y → css z; physics z → −css y).
    const sx =  R * Math.sin(theta) * Math.cos(phi);
    const sy = -R * Math.cos(theta);
    const sz =  R * Math.sin(theta) * Math.sin(phi);
    tip.style.transform = `translate3d(${sx}px, ${sy}px, ${sz}px)`;

    // Vector orientation: rotateY(−φ) then rotateZ(θ−π/2). Length R.
    vec.style.transform = `rotateY(${-phi}rad) rotateZ(${theta - Math.PI/2}rad)`;

    // Dirac notation
    const cT = Math.cos(theta/2), sT = Math.sin(theta/2);
    const phaseStr = (Math.abs(phi) < 1e-3 || Math.abs(sT) < 1e-6)
      ? ''
      : ` · e<sup>i·${pDeg.toFixed(0)}°</sup>`;
    stEl.innerHTML = `
      <span class="label">State |ψ⟩</span>
      <div class="eq">|ψ⟩ = <span class="alpha">${cT.toFixed(3)}</span>·|0⟩ + <span class="beta">${sT.toFixed(3)}${phaseStr}</span>·|1⟩</div>
      <span class="approx">θ = ${tDeg.toFixed(0)}°, &nbsp; φ = ${pDeg.toFixed(0)}°
        &nbsp;·&nbsp; |α|² = ${(cT*cT*100).toFixed(1)}%, &nbsp; |β|² = ${(sT*sT*100).toFixed(1)}%</span>`;
  }

  function applyView(){
    cube.style.transform = `rotateX(${viewX}deg) rotateY(${viewY}deg)`;
  }

  function applyGate(M){
    // Current state ψ = [cos(θ/2), e^(iφ) sin(θ/2)]
    const cT = Math.cos(theta/2), sT = Math.sin(theta/2);
    const psi = [
      [cT, 0],
      [Math.cos(phi)*sT, Math.sin(phi)*sT],
    ];
    const out = [
      cAdd(cMul(M[0][0], psi[0]), cMul(M[0][1], psi[1])),
      cAdd(cMul(M[1][0], psi[0]), cMul(M[1][1], psi[1])),
    ];
    // Recover (θ, φ) modulo a global phase.
    const m0 = cAbs(out[0]);
    const m1 = cAbs(out[1]);
    theta = 2 * Math.atan2(m1, m0);
    if(m0 < 1e-9){
      phi = ((cArg(out[1]) % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
    } else {
      const dphi = cArg(out[1]) - cArg(out[0]);
      phi = ((dphi % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
    }
    update();
  }

  function setPreset(name){
    switch(name){
      case '0':  theta = 0;          phi = 0; break;
      case '1':  theta = Math.PI;    phi = 0; break;
      case '+':  theta = Math.PI/2;  phi = 0; break;
      case '-':  theta = Math.PI/2;  phi = Math.PI; break;
      case 'i':  theta = Math.PI/2;  phi = Math.PI/2; break;
      case '-i': theta = Math.PI/2;  phi = 3*Math.PI/2; break;
    }
    update();
  }

  tEl.oninput = () => { theta = +tEl.value * Math.PI/180; update(); };
  pEl.oninput = () => { phi   = +pEl.value * Math.PI/180; update(); };

  document.querySelectorAll('#bloch .bloch-gate').forEach(b => {
    b.onclick = () => {
      if(b.dataset.gate)   applyGate(GATES[b.dataset.gate]);
      if(b.dataset.preset) setPreset(b.dataset.preset);
    };
  });

  // Drag to rotate view
  let dragging = false, lastX = 0, lastY = 0;
  cube.addEventListener('pointerdown', (e) => {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    cube.setPointerCapture(e.pointerId);
  });
  cube.addEventListener('pointermove', (e) => {
    if(!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    viewY += dx * 0.5;
    viewX -= dy * 0.5;
    viewX = Math.max(-85, Math.min(85, viewX));
    lastX = e.clientX; lastY = e.clientY;
    applyView();
  });
  cube.addEventListener('pointerup',   () => { dragging = false; });
  cube.addEventListener('pointercancel',() => { dragging = false; });

  applyView();
  update();
}

// ----- Superposition: slider + bars + wave -----
function initSuperposition(){
  const slider = document.getElementById('sp-slider');
  const p0=document.getElementById('sp-p0'), p1=document.getElementById('sp-p1');
  const b0=document.getElementById('sp-bar0'), b1=document.getElementById('sp-bar1');
  const dirac = document.getElementById('sp-dirac');
  const cv = document.getElementById('sp-wave'); const ctx = cv.getContext('2d');

  // Render Dirac notation:  |ψ⟩ = α|0⟩ + β|1⟩, where α=√P(0), β=√P(1).
  // Pretty-prints familiar fractions (1/√2, 1, 0) and shows decimal approximations.
  const FRAC_1_SQRT2 = '<span class="frac"><span class="num">1</span><span class="den">√2</span></span>';
  function prettyAmp(p){
    if(p === 0) return '0';
    if(p === 100) return '1';
    if(p === 50) return FRAC_1_SQRT2;
    return `√<span style="font-style:normal">${(p/100).toFixed(2)}</span>`;
  }
  function renderDirac(p1pct){
    const p0pct = 100 - p1pct;
    const a = Math.sqrt(p0pct/100);
    const b = Math.sqrt(p1pct/100);
    const aStr = prettyAmp(p0pct);
    const bStr = prettyAmp(p1pct);

    // build expression, hiding zero terms cleanly
    let main;
    if(p0pct === 0)      main = `<span class="beta">${bStr}</span><span class="ket">|1⟩</span>`;
    else if(p1pct === 0) main = `<span class="alpha">${aStr}</span><span class="ket">|0⟩</span>`;
    else
      main = `<span class="alpha">${aStr}</span><span class="ket">|0⟩</span> + ` +
             `<span class="beta">${bStr}</span><span class="ket">|1⟩</span>`;

    dirac.innerHTML = `
      <span class="label">Dirac notation</span>
      <div class="eq">|ψ⟩ = ${main}</div>
      <span class="approx">≈ ${a.toFixed(3)} |0⟩ + ${b.toFixed(3)} |1⟩
        &nbsp;·&nbsp; |α|² = ${(p0pct).toFixed(0)}%, &nbsp; |β|² = ${(p1pct).toFixed(0)}%</span>`;
  }

  function update(){
    const v = +slider.value;          // probability of 1 in %
    p1.textContent = v; p0.textContent = 100-v;
    b0.style.width = (100-v)+'%';
    b1.style.width = v + '%';
    renderDirac(v);
  }
  slider.oninput = update; update();

  // animated wave
  let t = 0;
  function frame(){
    const w = cv.width = cv.clientWidth, h = cv.height;
    ctx.clearRect(0,0,w,h);
    const v = +slider.value/100;
    const ampMix = Math.sin(Math.PI * v);  // peak at 50%
    ctx.lineWidth = 2;
    // |0> wave (cyan)
    ctx.strokeStyle = 'rgba(6,182,212,.85)';
    ctx.beginPath();
    for(let x=0;x<w;x++){
      const y = h/2 + Math.sin((x*0.04)+t) * (h/3) * (1-v);
      x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.stroke();
    // |1> wave (pink)
    ctx.strokeStyle = 'rgba(236,72,153,.85)';
    ctx.beginPath();
    for(let x=0;x<w;x++){
      const y = h/2 + Math.cos((x*0.04)+t*1.3) * (h/3) * v;
      x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.stroke();
    // mix glow
    ctx.fillStyle = `rgba(124,58,237,${0.04 + 0.18*ampMix})`;
    ctx.fillRect(0,0,w,h);
    t += 0.06;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ----- Entanglement -----
function initEntanglement(){
  const a = document.getElementById('qa'), b = document.getElementById('qb');
  const av = a.querySelector('.qval'), bv = b.querySelector('.qval');
  const msg = document.getElementById('ent-msg');
  const formula = document.getElementById('ent-formula');
  const ampsEl = document.getElementById('ent-amps');
  const note = document.getElementById('ent-note');

  // amplitudes for the four 2-qubit basis states  |00>, |01>, |10>, |11>
  const labels = ['|00⟩','|01⟩','|10⟩','|11⟩'];

  function renderState(amps){
    ampsEl.innerHTML = '';
    amps.forEach((amp, i) => {
      const p = amp*amp;
      const row = document.createElement('div');
      row.className = 'sv-row' + (Math.abs(amp) < 1e-6 ? ' zero' : '');
      row.innerHTML = `
        <span class="sv-label">${labels[i]}</span>
        <div class="sv-bar"><div style="width:${(p*100).toFixed(0)}%"></div></div>
        <span class="sv-amp">${formatAmp(amp)}</span>`;
      ampsEl.appendChild(row);
    });
  }

  function formatAmp(a){
    if(Math.abs(a) < 1e-6) return '0';
    if(Math.abs(a - 1) < 1e-6) return '1';
    if(Math.abs(a - 1/Math.SQRT2) < 1e-6) return F12;
    if(Math.abs(a + 1/Math.SQRT2) < 1e-6) return '−' + F12;
    return a.toFixed(3);
  }

  const F12 = '<span class="frac"><span class="num">1</span><span class="den">√2</span></span>';

  function setBell(){
    av.textContent = '?'; bv.textContent = '?';
    a.classList.remove('measured'); b.classList.remove('measured');
    formula.innerHTML = `|Φ⁺⟩ = ${F12}·|00⟩ + ${F12}·|11⟩`;
    note.textContent = 'An equal superposition of |00⟩ and |11⟩. Notice |01⟩ and |10⟩ have amplitude 0 — the qubits are perfectly correlated, never opposite.';
    renderState([1/Math.SQRT2, 0, 0, 1/Math.SQRT2]);
    msg.textContent = 'Pair entangled. Press “Measure A” to collapse it.';
  }

  function collapse(r){
    av.textContent = r; bv.textContent = r;
    a.classList.add('measured'); b.classList.add('measured');
    if(r === '0'){
      formula.innerHTML = '|00⟩  (collapsed)';
      note.textContent = 'Measurement projected the state onto |00⟩. Both qubits read 0 — every time you re-measure them now, you keep getting 0.';
      renderState([1, 0, 0, 0]);
    } else {
      formula.innerHTML = '|11⟩  (collapsed)';
      note.textContent = 'Measurement projected the state onto |11⟩. Both qubits read 1 — the entanglement was “used up” by the measurement.';
      renderState([0, 0, 0, 1]);
    }
    msg.textContent = `Both collapsed to ${r}. Bell |Φ⁺⟩ correlations always agree.`;
  }

  document.getElementById('ent-measure').onclick = () =>
    collapse(Math.random() < 0.5 ? '0' : '1');
  document.getElementById('ent-reset').onclick = setBell;

  setBell();
}

// ----- Phase Kickback -----
function initKickback(){
  // Index convention for the 4-amp vector:  index = 2·c + t   (c = control, t = target)
  // Cases: target ∈ {|0⟩, |1⟩, |+⟩, |−⟩}.  Control starts |+⟩ = (|0⟩+|1⟩)/√2.
  const S = 1/Math.SQRT2;
  const KB = {
    '0': {
      initLabel:  '|+⟩ ⊗ |0⟩',
      init:       [S, 0, S, 0],
      finalLabel: '<span class="frac"><span class="num">|00⟩ + |11⟩</span><span class="den">√2</span></span>  =  |Φ⁺⟩',
      final:      [S, 0, 0, S],
      cls:        'entangle',
      verdict:    'No clean kickback. Target |0⟩ is not an eigenstate of X (the operation CNOT applies), so the qubits become entangled into the Bell state |Φ⁺⟩.'
    },
    '1': {
      initLabel:  '|+⟩ ⊗ |1⟩',
      init:       [0, S, 0, S],
      finalLabel: '<span class="frac"><span class="num">|01⟩ + |10⟩</span><span class="den">√2</span></span>  =  |Ψ⁺⟩',
      final:      [0, S, S, 0],
      cls:        'entangle',
      verdict:    'No kickback. Target |1⟩ is not an eigenstate of X — the qubits entangle into the Bell state |Ψ⁺⟩.'
    },
    '+': {
      initLabel:  '|+⟩ ⊗ |+⟩',
      init:       [0.5, 0.5, 0.5, 0.5],
      finalLabel: '|+⟩ ⊗ |+⟩',
      final:      [0.5, 0.5, 0.5, 0.5],
      cls:        'identity',
      verdict:    'Kickback with phase +1 (trivial). X|+⟩ = +|+⟩, so the phase that kicks back is +1 — nothing visibly changes.'
    },
    '-': {
      initLabel:  '|+⟩ ⊗ |−⟩',
      init:       [0.5, -0.5, 0.5, -0.5],
      finalLabel: '|−⟩ ⊗ |−⟩',
      final:      [0.5, -0.5, -0.5, 0.5],
      cls:        'kick',
      verdict:    '✨ Phase kickback! X|−⟩ = −|−⟩, so a −1 phase gets kicked onto the control\'s |1⟩ branch. The control flips |+⟩ → |−⟩ — the target is unchanged, yet the "control" is what moved.'
    },
  };
  const labels = ['|00⟩','|01⟩','|10⟩','|11⟩'];

  const initEl  = document.getElementById('kb-init');
  const finalEl = document.getElementById('kb-final');
  const initAmps  = document.getElementById('kb-init-amps');
  const finalAmps = document.getElementById('kb-final-amps');
  const verdict   = document.getElementById('kb-verdict');

  const F12 = '<span class="frac"><span class="num">1</span><span class="den">√2</span></span>';
  const F1_2 = '<span class="frac"><span class="num">1</span><span class="den">2</span></span>';
  function fmt(a){
    if(Math.abs(a) < 1e-6) return '0';
    if(Math.abs(a - 1) < 1e-6) return '1';
    if(Math.abs(a + 1) < 1e-6) return '−1';
    if(Math.abs(a - S) < 1e-6) return F12;
    if(Math.abs(a + S) < 1e-6) return '−' + F12;
    if(Math.abs(a - 0.5) < 1e-6) return F1_2;
    if(Math.abs(a + 0.5) < 1e-6) return '−' + F1_2;
    return a.toFixed(3);
  }

  function renderAmps(host, vec){
    host.innerHTML = '';
    vec.forEach((a, i) => {
      const p = a*a;
      const row = document.createElement('div');
      row.className = 'sv-row' + (Math.abs(a) < 1e-6 ? ' zero' : '');
      row.innerHTML = `
        <span class="sv-label">${labels[i]}</span>
        <div class="sv-bar"><div style="width:${(p*100).toFixed(0)}%"></div></div>
        <span class="sv-amp">${fmt(a)}</span>`;
      host.appendChild(row);
    });
  }

  function show(stateKey){
    const c = KB[stateKey];
    initEl.innerHTML = c.initLabel;
    finalEl.innerHTML = c.finalLabel;
    renderAmps(initAmps, c.init);
    renderAmps(finalAmps, c.final);
    verdict.className = 'kb-verdict ' + c.cls;
    verdict.textContent = c.verdict;
    document.querySelectorAll('.kb-target').forEach(b =>
      b.classList.toggle('active', b.dataset.state === stateKey));
  }

  document.querySelectorAll('.kb-target').forEach(b =>
    b.onclick = () => show(b.dataset.state));

  show('-');
}

// ----- Quantum Paradoxes -----
function initParadox(){
  // Tab switching
  document.querySelectorAll('.pdx-tab').forEach(b => {
    b.onclick = () => {
      document.querySelectorAll('.pdx-tab').forEach(x => x.classList.toggle('active', x===b));
      document.querySelectorAll('.pdx-panel').forEach(p => p.classList.add('hidden'));
      const panel = document.getElementById('pdx-' + b.dataset.pdx);
      if(panel) panel.classList.remove('hidden');
    };
  });

  // -------- Schrödinger's Cat --------
  (() => {
    const box = document.getElementById('cat-box');
    const lbl = document.getElementById('cat-label');
    const msg = document.getElementById('cat-msg');
    const time = document.getElementById('cat-time');
    const timeV = document.getElementById('cat-time-v');

    function update(){
      const p = +time.value;
      timeV.textContent = p;
      if(box.classList.contains('opened')) return;
      const a = Math.sqrt((100-p)/100), b = Math.sqrt(p/100);
      lbl.innerHTML = `${a.toFixed(2)}·|alive⟩ + ${b.toFixed(2)}·|dead⟩`;
      msg.textContent = p === 0  ? 'No time has passed — cat is definitely alive (decay impossible).'
                       : p === 100 ? 'Definitely decayed — cat is dead (no superposition needed).'
                       : `Closed box. Cat is in superposition: ${(100-p)}% alive amplitude², ${p}% dead.`;
    }
    time.oninput = update;

    document.getElementById('cat-open').onclick = () => {
      const p = +time.value / 100;
      const dead = Math.random() < p;
      box.classList.remove('closed');
      box.classList.add('opened', dead ? 'dead' : 'alive');
      lbl.innerHTML = dead ? '|dead⟩  (collapsed)' : '|alive⟩  (collapsed)';
      msg.textContent = dead
        ? '☠ Cat collapsed to |dead⟩. The atom had decayed.'
        : '😺 Cat collapsed to |alive⟩. The atom had not decayed.';
    };
    document.getElementById('cat-reset').onclick = () => {
      box.classList.remove('opened','alive','dead');
      box.classList.add('closed');
      update();
    };
    update();
  })();

  // -------- Wigner's Friend --------
  (() => {
    const friendEl = document.getElementById('wig-friend');
    const wignerEl = document.getElementById('wig-wigner');
    const msg      = document.getElementById('wig-msg');
    let stage = 0, friendOutcome = null;

    function setState(s){
      stage = s;
      if(s === 0){
        friendEl.textContent = '|+⟩ — superposition';
        wignerEl.textContent = '(qubit ⊗ Friend) in |+⟩ ⊗ |neutral⟩';
        msg.innerHTML = 'Initial: the qubit is in <b>|+⟩ = (|0⟩+|1⟩)/√2</b>. Both observers describe it the same way.';
        document.querySelectorAll('.wig-actor').forEach(a => a.classList.remove('measured'));
      } else if(s === 1){
        friendOutcome = Math.random() < 0.5 ? 0 : 1;
        friendEl.innerHTML = `|${friendOutcome}⟩ &nbsp;<span style="color:var(--muted)">(I saw a definite outcome!)</span>`;
        wignerEl.innerHTML = `<span style="color:var(--accent-3)">(|0⟩|sees-0⟩ + |1⟩|sees-1⟩)/√2</span><br><small style="color:var(--muted)">Friend &amp; qubit jointly entangled</small>`;
        document.querySelectorAll('.wig-actor')[0].classList.add('measured');
        msg.innerHTML = `<b>The paradox.</b> Friend says: "I measured ${friendOutcome}, the qubit collapsed." But Wigner — outside the lab — has no way to tell collapse happened. To him, Friend + qubit are now in a 2-qubit superposition. Two valid descriptions of the same event.`;
      } else if(s === 2){
        wignerEl.innerHTML = `|${friendOutcome}⟩ &nbsp;<span style="color:var(--muted)">(I see the same answer)</span>`;
        document.querySelectorAll('.wig-actor')[1].classList.add('measured');
        msg.innerHTML = `Wigner finally measures the lab. He gets ${friendOutcome}, agreeing with Friend. The two pictures finally reconcile — but only retrospectively, and only because Wigner trusts that Friend's record is correct.`;
      }
    }

    document.getElementById('wig-step1').onclick = () => stage === 0 && setState(1);
    document.getElementById('wig-step2').onclick = () => stage === 1 && setState(2);
    document.getElementById('wig-reset').onclick = () => setState(0);
    setState(0);
  })();

  // -------- Double-Slit (Wave-Particle Duality) --------
  (() => {
    const detEl = document.getElementById('ds-detector');
    const cv    = document.getElementById('ds-screen');
    const msg   = document.getElementById('ds-msg');
    const icon  = document.getElementById('ds-det-icon');
    if(!cv) return;
    const ctx   = cv.getContext('2d');
    let hits = [];

    function clear(){
      hits = []; draw();
      msg.textContent = 'Screen cleared. Click "Send" to fire photons.';
    }

    function draw(){
      const w = cv.width = cv.clientWidth, h = cv.height;
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = 'rgba(168,85,247,.04)';
      ctx.fillRect(0,0,w,h);
      // Histogram
      const BINS = 64;
      const bins = new Array(BINS).fill(0);
      hits.forEach(p => bins[Math.min(BINS-1, Math.max(0, Math.floor(p.x*BINS)))]++);
      const max = Math.max(1, ...bins);
      const bw = w / BINS;
      ctx.fillStyle = 'rgba(124,58,237,.55)';
      bins.forEach((c, i) => {
        const bh = (c/max) * (h * 0.5);
        ctx.fillRect(i*bw, h - bh, bw - 0.5, bh);
      });
      // Individual photon dots in the upper band
      ctx.fillStyle = 'rgba(168,85,247,.95)';
      hits.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x*w, p.y, 2, 0, Math.PI*2);
        ctx.fill();
      });
      // Top label
      ctx.fillStyle = '#8b93a7';
      ctx.font = '11px system-ui';
      ctx.fillText(`${hits.length} photon${hits.length===1?'':'s'}`, 10, 16);
    }

    function sample(detector){
      // Photon-screen position x ∈ [0,1].
      if(!detector){
        // Wave behaviour: cos²(5πx) interference pattern (rejection sampling).
        for(let i=0;i<200;i++){
          const x = Math.random();
          if(Math.random() < Math.cos(5*Math.PI*x)**2) return x;
        }
        return Math.random();
      } else {
        // Particle behaviour: 50/50 between two slit-centred Gaussians.
        const slit = Math.random() < 0.5 ? 0.35 : 0.65;
        const g = slit + (Math.random()+Math.random()+Math.random()-1.5) * 0.07;
        return Math.min(0.99, Math.max(0.01, g));
      }
    }

    function shoot(n){
      const det = detEl.checked;
      const h = cv.height;
      for(let i=0;i<n;i++){
        const x = sample(det);
        const y = h*0.18 + Math.random() * (h*0.25);
        hits.push({x, y});
      }
      draw();
      const total = hits.length;
      msg.innerHTML = det
        ? `Sent ${n} photon${n===1?'':'s'} with detector ON (slit A peek). After ${total} total → <b>two clumps</b> from each slit. No interference. Photons act as <b>particles</b>.`
        : `Sent ${n} photon${n===1?'':'s'} with detector OFF. After ${total} total → <b>interference fringes</b> appear (cos² pattern). Each photon interfered with itself as a <b>wave</b>.`;
    }

    document.getElementById('ds-shoot1').onclick  = () => shoot(1);
    document.getElementById('ds-shootN').onclick  = () => shoot(200);
    document.getElementById('ds-clear').onclick   = clear;

    detEl.onchange = () => {
      icon.classList.toggle('active', detEl.checked);
      msg.innerHTML = detEl.checked
        ? '👁 Detector ON — measuring which slit forces the photon to act as a particle. Existing screen data preserved; new photons will land in two clumps.'
        : '🌊 Detector OFF — no path measurement. Photons interfere with themselves and build a wave pattern.';
    };

    window.addEventListener('resize', draw);
    clear();
  })();

  // -------- Quantum Eraser --------
  (() => {
    const detEl = document.getElementById('er-detector');
    const eraEl = document.getElementById('er-eraser');
    const cv    = document.getElementById('er-screen');
    const ctx   = cv.getContext('2d');
    const msg   = document.getElementById('er-msg');
    let hits = [];

    function clear(){ hits = []; draw(); }
    function draw(){
      const w = cv.width = cv.clientWidth, h = cv.height;
      ctx.clearRect(0,0,w,h);
      // backdrop
      ctx.fillStyle = 'rgba(124,58,237,.05)'; ctx.fillRect(0,0,w,h);
      // bin into histogram
      const BINS = 60;
      const bins = new Array(BINS).fill(0);
      hits.forEach(x => bins[Math.min(BINS-1, Math.max(0, Math.floor(x*BINS)))]++);
      const max = Math.max(1, ...bins);
      const bw = w / BINS;
      bins.forEach((c, i) => {
        const bh = (c/max) * (h - 20);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(i*bw, h - bh, bw - 1, bh);
      });
      // recent hits as dots
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      hits.slice(-20).forEach(x => {
        ctx.beginPath();
        ctx.arc(x*w, h - 6, 2, 0, Math.PI*2);
        ctx.fill();
      });
    }

    function sample(detector, eraser){
      const interfering = !detector || (detector && eraser);
      if(interfering){
        // P(x) ∝ cos²(5πx) on x ∈ [0,1] — rejection sampling
        for(let i=0;i<200;i++){
          const x = Math.random();
          const p = Math.cos(5*Math.PI*x) ** 2;
          if(Math.random() < p) return x;
        }
        return Math.random();
      } else {
        // No interference: sum of two gaussians (one per slit)
        const slit = Math.random() < 0.5 ? 0.35 : 0.65;
        const g = slit + (Math.random()+Math.random()+Math.random()-1.5) * 0.07;
        return Math.min(0.99, Math.max(0.01, g));
      }
    }

    document.getElementById('er-run').onclick = () => {
      const det = detEl.checked, era = eraEl.checked;
      for(let i=0;i<800;i++) hits.push(sample(det, era));
      draw();
      msg.textContent = !det        ? `Detector OFF → interference fringes (cos² pattern).`
                       : det && era ? `Detector ON, eraser ON → fringes restored. The which-path information was washed out.`
                       :              `Detector ON, no eraser → no fringes. Two clumps from the two slits.`;
    };
    document.getElementById('er-clear').onclick = clear;
    window.addEventListener('resize', draw);
    clear();
  })();

  // -------- Delayed-Choice Quantum Eraser --------
  (() => {
    const grid = document.getElementById('dl-grid');
    const msg  = document.getElementById('dl-msg');

    function drawCanvas(host, samples){
      const cv = document.createElement('canvas');
      cv.className = 'dl-canvas';
      host.appendChild(cv);
      const w = cv.width = host.clientWidth - 24, h = cv.height = 80;
      const ctx = cv.getContext('2d');
      const BINS = 50;
      const bins = new Array(BINS).fill(0);
      samples.forEach(x => bins[Math.min(BINS-1, Math.max(0, Math.floor(x*BINS)))]++);
      const max = Math.max(1, ...bins);
      const bw = w / BINS;
      ctx.fillStyle = '#7c3aed';
      bins.forEach((c, i) => {
        const bh = (c/max) * h;
        ctx.fillRect(i*bw, h - bh, bw - 1, bh);
      });
    }

    function panel(title, samples, sub){
      const p = document.createElement('div');
      p.className = 'dl-panel';
      p.innerHTML = `<h5>${title}</h5>`;
      grid.appendChild(p);
      drawCanvas(p, samples);
      const note = document.createElement('div');
      note.className = 'muted';
      note.style.fontSize = '.78rem';
      note.style.marginTop = '4px';
      note.textContent = sub;
      p.appendChild(note);
    }

    document.getElementById('dl-run').onclick = () => {
      grid.innerHTML = '';
      // Generate paired data: each photon has a path label and an eraser-outcome label.
      // "Erased+" subset shows cos²; "erased−" shows sin² (shifted pattern).
      const N = 1500;
      const all = [];
      const erasedPlus = [];
      const erasedMinus = [];
      for(let i=0;i<N;i++){
        const which = Math.random() < 0.5 ? 0 : 1;
        const eraseOutcome = Math.random() < 0.5 ? '+' : '-';
        let x;
        if(eraseOutcome === '+'){
          // cos²(5πx)
          for(let k=0;k<200;k++){ const t = Math.random(); if(Math.random() < Math.cos(5*Math.PI*t)**2){ x=t; break; } }
          erasedPlus.push(x);
        } else {
          // sin²(5πx) — shifted fringes
          for(let k=0;k<200;k++){ const t = Math.random(); if(Math.random() < Math.sin(5*Math.PI*t)**2){ x=t; break; } }
          erasedMinus.push(x);
        }
        if(x === undefined) x = Math.random();
        all.push(x);
      }
      panel('All photons (raw screen)', all, 'No fringes — interference appears washed out.');
      panel('Subset: eraser outcome "+"', erasedPlus, 'Conditioning on later "+" reveals cos² fringes.');
      panel('Subset: eraser outcome "−"', erasedMinus, 'The "−" subset shows complementary fringes (shifted by π).');
      msg.innerHTML = `<b>The trick:</b> the raw screen looks fringe-free. The "delayed choice" doesn't physically alter past photons — it labels them. Sorting the data on the eraser outcome <i>reveals</i> two fringe patterns that were always hidden in the data, summing to the smeared-out total.`;
    };
  })();

  // -------- Quantum Zeno --------
  (() => {
    const slider = document.getElementById('zeno-int');
    const lbl    = document.getElementById('zeno-int-v');
    const cv     = document.getElementById('zeno-canvas');
    const ctx    = cv.getContext('2d');
    const msg    = document.getElementById('zeno-msg');
    slider.oninput = () => lbl.textContent = slider.value;

    function run(){
      const TOTAL = 60;
      const interval = +slider.value;
      const dθ = Math.PI / TOTAL; // would reach |1⟩ after TOTAL steps unmeasured

      const trajectory = [];
      let angle = 0, decayed = false;
      for(let i=1;i<=TOTAL;i++){
        angle += dθ;
        if(i % interval === 0){
          const p1 = Math.sin(angle/2)**2;
          if(Math.random() < p1){
            trajectory.push({i, p:1, m:true, dec:true}); decayed = true; break;
          } else {
            trajectory.push({i, p:0, m:true, dec:false});
            angle = 0; // collapsed to |0⟩
          }
        } else {
          trajectory.push({i, p:Math.sin(angle/2)**2, m:false, dec:false});
        }
      }

      // draw
      const w = cv.width = cv.clientWidth, h = cv.height;
      ctx.clearRect(0,0,w,h);
      // axes
      ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(40, 10); ctx.lineTo(40, h-26); ctx.lineTo(w-10, h-26); ctx.stroke();
      ctx.fillStyle = 'var(--muted)'; ctx.font = '11px system-ui';
      ctx.fillStyle = '#8b93a7';
      ctx.fillText('P(|1⟩)', 6, 18);
      ctx.fillText('1', 24, 14);
      ctx.fillText('0', 24, h-22);
      ctx.fillText('time →', w-60, h-8);

      // free-evolution reference (no measurements): sin²(i·dθ/2)
      ctx.strokeStyle = 'rgba(124,58,237,.35)';
      ctx.setLineDash([4,4]);
      ctx.beginPath();
      for(let i=0;i<=TOTAL;i++){
        const p = Math.sin(i*dθ/2)**2;
        const x = 40 + (i/TOTAL) * (w-50);
        const y = (h-26) - p*(h-40);
        i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // measured trajectory
      ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2;
      ctx.beginPath();
      let prevP = 0;
      ctx.moveTo(40, h-26);
      trajectory.forEach(pt => {
        const x = 40 + (pt.i/TOTAL) * (w-50);
        const y = (h-26) - pt.p*(h-40);
        ctx.lineTo(x, y);
        prevP = pt.p;
      });
      ctx.stroke();
      // measurement markers
      trajectory.forEach(pt => {
        if(!pt.m) return;
        const x = 40 + (pt.i/TOTAL) * (w-50);
        const y = (h-26) - pt.p*(h-40);
        ctx.fillStyle = pt.dec ? '#ef4444' : '#10b981';
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill();
      });

      msg.innerHTML = decayed
        ? `Qubit decayed at step ${trajectory[trajectory.length-1].i}. Dashed = free evolution; solid cyan = measured trajectory; green dots = "still |0⟩" projections; red dot = first time it was caught in |1⟩.`
        : `Qubit stayed in |0⟩ for the full 60 steps. ✨ The Zeno effect — frequent measurements freeze the evolution. With interval = ${interval} steps, P(decay per check) = sin²(${interval}·π/120) ≈ ${(Math.sin(interval*Math.PI/120)**2*100).toFixed(2)}%.`;
    }

    document.getElementById('zeno-run').onclick = run;
    run();
    window.addEventListener('resize', run);
  })();
}

// ----- Quantum Cryptography (QKD overview + BB84) -----
function initCrypto(){
  // Tab switching
  document.querySelectorAll('.qc-tab').forEach(b => {
    b.onclick = () => {
      document.querySelectorAll('.qc-tab').forEach(x => x.classList.toggle('active', x===b));
      document.querySelectorAll('.qc-panel').forEach(p => p.classList.add('hidden'));
      const panel = document.getElementById('qc-' + b.dataset.qc);
      if(panel) panel.classList.remove('hidden');
    };
  });

  const nSlider = document.getElementById('bb-n');
  const nLbl    = document.getElementById('bb-n-v');
  const eveBox  = document.getElementById('bb-eve');
  const tableEl = document.getElementById('bb-table');
  const sumEl   = document.getElementById('bb-summary');
  nSlider.oninput = () => nLbl.textContent = nSlider.value;

  // bit + basis → state symbol
  const stateSym = (bit, bas) => {
    if(bas === 'Z') return bit === 0 ? '|0⟩' : '|1⟩';
    return bit === 0 ? '|+⟩' : '|−⟩';
  };

  function simulate(N, evePresent){
    const rows = [];
    let kept = 0, errs = 0;
    const keyA = [], keyB = [];
    for(let i=0;i<N;i++){
      const aBit = Math.random() < 0.5 ? 0 : 1;
      const aBas = Math.random() < 0.5 ? 'Z' : 'X';
      let chBit = aBit, chBas = aBas, eve = null;
      if(evePresent){
        const eBas = Math.random() < 0.5 ? 'Z' : 'X';
        const eBit = (eBas === aBas) ? aBit : (Math.random() < 0.5 ? 0 : 1);
        eve = {bit:eBit, bas:eBas};
        chBit = eBit; chBas = eBas;        // Eve resends in her basis with her result
      }
      const bBas = Math.random() < 0.5 ? 'Z' : 'X';
      const bBit = (bBas === chBas) ? chBit : (Math.random() < 0.5 ? 0 : 1);
      const match = (bBas === aBas);
      const error = match && (aBit !== bBit);
      if(match){ kept++; keyA.push(aBit); keyB.push(bBit); if(error) errs++; }
      rows.push({i, aBit, aBas, eve, bBas, bBit, match, error});
    }
    return {rows, kept, errs, keyA, keyB};
  }

  function render(N, evePresent){
    const {rows, kept, errs, keyA, keyB} = simulate(N, evePresent);
    tableEl.innerHTML = '';

    // header
    const cols = evePresent
      ? ['#','A bit','A basis','Qubit','Eve basis','Eve bit','B basis','B bit','Status']
      : ['#','A bit','A basis','Qubit','B basis','B bit','Status'];
    const colTmpl = evePresent
      ? '36px 60px 70px 70px 80px 60px 70px 60px 1fr'
      : '36px 60px 70px 70px 70px 60px 1fr';

    const hdr = document.createElement('div');
    hdr.className = 'bb-row hdr';
    hdr.style.gridTemplateColumns = colTmpl;
    cols.forEach(c => {
      const span = document.createElement('div');
      span.className = 'bb-cell';
      span.textContent = c;
      hdr.appendChild(span);
    });
    tableEl.appendChild(hdr);

    rows.forEach(r => {
      const row = document.createElement('div');
      row.className = 'bb-row ' +
        (r.error ? 'error' : (r.match ? 'match' : 'discard'));
      row.style.gridTemplateColumns = colTmpl;

      const tag = r.error ? '<span class="tag err">✗ ERROR</span>'
                : r.match ? '<span class="tag kept">✓ kept</span>'
                : '<span class="tag">discarded</span>';

      let html = `
        <div class="bb-cell idx">${r.i + 1}</div>
        <div class="bb-cell bit">${r.aBit}</div>
        <div class="bb-cell"><span class="basis ${r.aBas==='X'?'x':''}">${r.aBas}</span></div>
        <div class="bb-cell"><span class="qubit">${stateSym(r.aBit, r.aBas)}</span></div>`;
      if(evePresent){
        html += `
          <div class="bb-cell"><span class="basis ${r.eve.bas==='X'?'x':''}">${r.eve.bas}</span></div>
          <div class="bb-cell bit">${r.eve.bit}</div>`;
      }
      html += `
        <div class="bb-cell"><span class="basis ${r.bBas==='X'?'x':''}">${r.bBas}</span></div>
        <div class="bb-cell bit">${r.bBit}</div>
        <div class="bb-cell">${tag}</div>`;
      row.innerHTML = html;
      tableEl.appendChild(row);
    });

    // summary
    const errRate = kept ? errs/kept : 0;
    let verdictHTML;
    if(evePresent){
      if(errRate > 0.10){
        verdictHTML = `<div class="bb-verdict danger">🚨 Eavesdropper detected — ${(errRate*100).toFixed(1)}% mismatches in the sifted key (well above the noise threshold). Abort and retry.</div>`;
      } else if(errs > 0){
        verdictHTML = `<div class="bb-verdict warn">⚠ ${errs} mismatch${errs===1?'':'es'} (${(errRate*100).toFixed(1)}%). With more bits, Eve's interference would become statistically obvious.</div>`;
      } else {
        verdictHTML = `<div class="bb-verdict warn">Eve was unlucky — no mismatches in this small run. With more bits her ~25% disturbance becomes unmistakable.</div>`;
      }
    } else {
      verdictHTML = errs === 0
        ? `<div class="bb-verdict safe">✓ Channel clean. Sifted key of ${kept} bits — every kept bit matches.</div>`
        : `<div class="bb-verdict danger">Unexpected mismatches without Eve — would indicate channel noise in a real link.</div>`;
    }

    const keyStr = keyA.join('');
    sumEl.classList.add('show');
    sumEl.innerHTML = `
      <h4>Protocol summary</h4>
      <div class="bb-stat">
        <span>Bits sent:</span>
        <div class="bb-stat-bar"><div class="bb-stat-fill good" style="width:100%"></div></div>
        <span><b>${rows.length}</b></span>
      </div>
      <div class="bb-stat">
        <span>Sifted (basis match):</span>
        <div class="bb-stat-bar"><div class="bb-stat-fill good" style="width:${rows.length?(kept/rows.length*100):0}%"></div></div>
        <span><b>${kept}</b></span>
      </div>
      <div class="bb-stat">
        <span>Error rate in sifted key:</span>
        <div class="bb-stat-bar"><div class="bb-stat-fill bad" style="width:${(errRate*100)}%"></div></div>
        <span><b>${(errRate*100).toFixed(1)}%</b></span>
      </div>
      <div><b>Alice's sifted key:</b> <span class="bb-key">${keyStr || '(empty)'}</span></div>
      <div><b>Bob's sifted key:</b>&nbsp;&nbsp; <span class="bb-key">${keyB.join('') || '(empty)'}</span></div>
      ${verdictHTML}`;
  }

  document.getElementById('bb-run').onclick = () => {
    render(+nSlider.value, eveBox.checked);
  };
}

// ----- Bell's inequality / CHSH demo -----
function initBell(){
  // Alice's two angles, Bob's two angles. Standard CHSH choice → max |S| = 2√2 for |Φ+⟩.
  const aA = [0,            Math.PI/2];
  const aB = [Math.PI/4, 3*Math.PI/4];
  const labels = [
    ['⟨a₀ · b₀⟩ &nbsp; (0°, 45°)',  '⟨a₀ · b₁⟩ &nbsp; (0°, 135°)'],
    ['⟨a₁ · b₀⟩ &nbsp; (90°, 45°)', '⟨a₁ · b₁⟩ &nbsp; (90°, 135°)'],
  ];

  let cells;
  const grid = document.getElementById('bell-grid');
  const sEl = document.getElementById('bell-S');
  const sAbsEl = document.getElementById('bell-Sabs');
  const needle = document.getElementById('bell-needle');
  const verdict = document.getElementById('bell-verdict');
  const msg = document.getElementById('bell-msg');

  function buildGrid(){
    grid.innerHTML = '';
    for(let i=0;i<2;i++) for(let j=0;j<2;j++){
      const cell = document.createElement('div');
      cell.className = 'bell-cell';
      cell.innerHTML = `
        <div class="bell-cell-label">${labels[i][j]}</div>
        <div class="bell-cell-bar"><div class="bell-bar-fill" id="bf-${i}${j}"></div></div>
        <div class="bell-cell-stats">E = <b id="be-${i}${j}">—</b>
          <span class="muted">(<span id="bn-${i}${j}">0</span> trials)</span></div>`;
      grid.appendChild(cell);
    }
  }

  function reset(){
    cells = [[{s:0,d:0},{s:0,d:0}],[{s:0,d:0},{s:0,d:0}]];
    render();
    verdict.className = 'bell-verdict';
    verdict.textContent = 'Press a button to start.';
    msg.textContent = 'Quantum prediction: |S| → 2√2 ≈ 2.828. Classical max: |S| ≤ 2.';
  }

  function E(i,j){
    const c = cells[i][j], total = c.s + c.d;
    return total ? (c.s - c.d) / total : 0;
  }

  function render(){
    let any = false;
    for(let i=0;i<2;i++) for(let j=0;j<2;j++){
      const total = cells[i][j].s + cells[i][j].d;
      if(total) any = true;
      const e = E(i,j);
      const eEl = document.getElementById(`be-${i}${j}`);
      const bf  = document.getElementById(`bf-${i}${j}`);
      document.getElementById(`bn-${i}${j}`).textContent = total;
      eEl.textContent = total ? e.toFixed(3) : '—';
      const mag = Math.abs(e) * 50;          // % of half-bar
      if(e >= 0){ bf.style.left = '50%'; bf.style.width = mag + '%'; bf.className = 'bell-bar-fill pos'; }
      else      { bf.style.left = (50 - mag) + '%'; bf.style.width = mag + '%'; bf.className = 'bell-bar-fill neg'; }
    }
    const s = E(0,0) - E(0,1) + E(1,0) + E(1,1);
    const abs = Math.abs(s);
    sEl.textContent = s.toFixed(3);
    sAbsEl.textContent = abs.toFixed(3);
    // meter scale 0..4
    needle.style.left = Math.min(100, abs/4 * 100) + '%';

    if(!any) return;
    if(abs <= 2.001){
      verdict.className = 'bell-verdict classical';
      verdict.textContent = `|S| = ${abs.toFixed(3)} ≤ 2 — within the classical (Bell) bound. No quantum violation.`;
    } else if(abs <= 2*Math.SQRT2 + 0.05){
      verdict.className = 'bell-verdict quantum';
      verdict.textContent = `|S| = ${abs.toFixed(3)} > 2 — Bell's inequality violated! Welcome to genuinely quantum territory.`;
    } else {
      verdict.className = 'bell-verdict over';
      verdict.textContent = `|S| = ${abs.toFixed(3)} above the Tsirelson bound — sampling fluctuation, expected for small N.`;
    }
  }

  function trial(quantum){
    const i = Math.random() < 0.5 ? 0 : 1;
    const j = Math.random() < 0.5 ? 0 : 1;
    let same;
    if(quantum){
      // |Φ+⟩ correlation: P(same) = (1 + cos(α − β)) / 2
      const p = (1 + Math.cos(aA[i] - aB[j])) / 2;
      same = Math.random() < p;
    } else {
      // Local hidden-variable model: shared random axis λ; each side outputs sign(cos(angle − λ)).
      const lam = Math.random() * 2 * Math.PI;
      const A = Math.cos(aA[i] - lam) > 0 ? 1 : -1;
      const B = Math.cos(aB[j] - lam) > 0 ? 1 : -1;
      same = (A === B);
    }
    if(same) cells[i][j].s++;
    else     cells[i][j].d++;
  }

  document.getElementById('bell-run-q').onclick = () => {
    for(let k=0;k<1000;k++) trial(true);
    render();
    msg.textContent = `+1000 quantum trials. Theoretical |S| → 2√2 ≈ 2.828.`;
  };
  document.getElementById('bell-run-c').onclick = () => {
    for(let k=0;k<1000;k++) trial(false);
    render();
    msg.textContent = `+1000 classical hidden-variable trials. Theoretical max |S| ≤ 2.`;
  };
  document.getElementById('bell-reset').onclick = reset;

  buildGrid();
  reset();
}

// ----- Gates reference -----
const GATES = [
  {sym:'I', name:'Identity', sub:'do nothing',
   matrix:[['1','0'],['0','1']],
   expl:'Leaves the qubit untouched. Sometimes used as a "wait" placeholder.',
   effect:'I|0⟩ = |0⟩,  I|1⟩ = |1⟩'},
  {sym:'X', name:'Pauli-X', sub:'bit flip / NOT',
   matrix:[['0','1'],['1','0']],
   expl:'Classical NOT: flips |0⟩ ↔ |1⟩. A π rotation around the X-axis of the Bloch sphere.',
   effect:'X|0⟩ = |1⟩,  X|1⟩ = |0⟩'},
  {sym:'Y', name:'Pauli-Y', sub:'flip + phase',
   matrix:[['0','−i'],['i','0']],
   expl:'Bit-flip combined with a phase change. A π rotation around the Y-axis.',
   effect:'Y|0⟩ = i·|1⟩,  Y|1⟩ = −i·|0⟩'},
  {sym:'Z', name:'Pauli-Z', sub:'phase flip',
   matrix:[['1','0'],['0','−1']],
   expl:'Leaves |0⟩ alone but flips the sign of |1⟩. A π rotation around the Z-axis.',
   effect:'Z|0⟩ = |0⟩,  Z|1⟩ = −|1⟩'},
  {sym:'H', name:'Hadamard', sub:'create superposition',
   matrix:[['1/√2','1/√2'],['1/√2','−1/√2']],
   expl:'Turns a definite state into an equal superposition. The most important "quantum-only" 1-qubit gate.',
   effect:'H|0⟩ = (|0⟩+|1⟩)/√2,  H|1⟩ = (|0⟩−|1⟩)/√2'},
  {sym:'S', name:'S — phase π/2', sub:'√Z',
   matrix:[['1','0'],['0','i']],
   expl:'Adds a 90° phase to |1⟩. Squaring it gives Z.',
   effect:'S|0⟩ = |0⟩,  S|1⟩ = i·|1⟩'},
  {sym:'T', name:'T — phase π/4', sub:'√S',
   matrix:[['1','0'],['0','e^(iπ/4)']],
   expl:'Adds a 45° phase to |1⟩. Together with H and CNOT it forms a universal gate set.',
   effect:'T|1⟩ = e^(iπ/4)·|1⟩'},
  {sym:'Rx', name:'Rx(θ)', sub:'X-axis rotation', rot:true,
   matrix:[['cos(θ/2)','−i·sin(θ/2)'],['−i·sin(θ/2)','cos(θ/2)']],
   expl:'Rotates by angle θ around the X-axis of the Bloch sphere.',
   effect:'Rx(π) = X  (up to a global phase)'},
  {sym:'Ry', name:'Ry(θ)', sub:'Y-axis rotation', rot:true,
   matrix:[['cos(θ/2)','−sin(θ/2)'],['sin(θ/2)','cos(θ/2)']],
   expl:'Rotates by angle θ around the Y-axis. Real-valued — handy for state preparation.',
   effect:'Ry(π) = Y  (up to a global phase)'},
  {sym:'Rz', name:'Rz(θ)', sub:'Z-axis rotation', rot:true,
   matrix:[['e^(−iθ/2)','0'],['0','e^(iθ/2)']],
   expl:'Rotates by angle θ around the Z-axis. Adds a relative phase between |0⟩ and |1⟩.',
   effect:'Rz(π) = Z  (up to a global phase)'},
  {sym:'CNOT', name:'Controlled-NOT', sub:'2-qubit · entangling', two:true,
   matrix:[['1','0','0','0'],['0','1','0','0'],['0','0','0','1'],['0','0','1','0']],
   expl:'If the control qubit is 1, flip the target. The workhorse 2-qubit gate — combined with H it creates Bell pairs.',
   effect:'CNOT|00⟩=|00⟩,  CNOT|01⟩=|01⟩,  CNOT|10⟩=|11⟩,  CNOT|11⟩=|10⟩'},
  {sym:'M', name:'Measurement', sub:'collapse', meas:true,
   matrix:null,
   expl:'Not unitary — it projects the qubit onto |0⟩ or |1⟩ with probabilities given by the squared amplitudes. The result is classical.',
   effect:'measure(α|0⟩+β|1⟩) → 0 with prob |α|²,  1 with prob |β|²'},
];

function initGates(){
  const grid = document.getElementById('gates-grid');
  if(!grid) return;
  grid.innerHTML = '';
  GATES.forEach(g => {
    const card = document.createElement('div');
    card.className = 'gate-card';
    const symClasses = ['gate-symbol'];
    if(g.rot) symClasses.push('rot');
    if(g.two || g.sym.length > 2) symClasses.push('two');
    let matrixHTML = '';
    if(g.matrix){
      const cols = g.matrix[0].length;
      const cells = g.matrix.flat().map(v => `<span>${v}</span>`).join('');
      matrixHTML = `
        <div class="matrix">
          <span class="br l"></span>
          <div class="grid" style="grid-template-columns:repeat(${cols},auto)">${cells}</div>
          <span class="br r"></span>
        </div>`;
    }
    card.innerHTML = `
      <div class="gate-head">
        <div class="${symClasses.join(' ')}">${g.sym}</div>
        <div class="gate-name">${g.name}<small>${g.sub}</small></div>
      </div>
      ${matrixHTML}
      <div class="gate-expl">${g.expl}</div>
      <div class="gate-effect">${g.effect}</div>`;
    grid.appendChild(card);
  });
}

// ----- Measurement chart -----
function initMeasurement(){
  let counts = {0:0, 1:0};
  const slider = document.getElementById('m-slider');
  const pv = document.getElementById('m-pval');
  const c0 = document.getElementById('m-c0'), c1 = document.getElementById('m-c1');
  const cv = document.getElementById('m-chart'); const ctx = cv.getContext('2d');
  const dirac = document.getElementById('m-dirac');

  const FRAC_1_SQRT2 = '<span class="frac"><span class="num">1</span><span class="den">√2</span></span>';
  function prettyAmp(p){
    if(p === 0)   return '0';
    if(p === 100) return '1';
    if(p === 50)  return FRAC_1_SQRT2;
    return `√<span style="font-style:normal">${(p/100).toFixed(2)}</span>`;
  }
  function renderDirac(p1pct){
    const p0pct = 100 - p1pct;
    const a = Math.sqrt(p0pct/100);
    const b = Math.sqrt(p1pct/100);
    let main;
    if(p0pct === 0)      main = `<span class="beta">${prettyAmp(p1pct)}</span><span class="ket">|1⟩</span>`;
    else if(p1pct === 0) main = `<span class="alpha">${prettyAmp(p0pct)}</span><span class="ket">|0⟩</span>`;
    else
      main = `<span class="alpha">${prettyAmp(p0pct)}</span><span class="ket">|0⟩</span> + ` +
             `<span class="beta">${prettyAmp(p1pct)}</span><span class="ket">|1⟩</span>`;
    dirac.innerHTML = `
      <span class="label">State before measurement</span>
      <div class="eq">|ψ⟩ = ${main}</div>
      <span class="approx">≈ ${a.toFixed(3)} |0⟩ + ${b.toFixed(3)} |1⟩
        &nbsp;·&nbsp; |α|² = ${p0pct}%, &nbsp; |β|² = ${p1pct}%</span>`;
  }

  slider.oninput = () => { pv.textContent = slider.value; renderDirac(+slider.value); };
  renderDirac(+slider.value);

  function shoot(n){
    const p = +slider.value / 100;
    for(let i=0;i<n;i++) counts[Math.random() < p ? 1 : 0]++;
    c0.textContent = counts[0]; c1.textContent = counts[1];
    draw();
  }
  function draw(){
    const w = cv.width = cv.clientWidth, h = cv.height;
    ctx.clearRect(0,0,w,h);
    const total = counts[0] + counts[1] || 1;
    const bar = (i, color, val) => {
      const bw = w/2 - 30, bh = (h-30) * (val/total);
      ctx.fillStyle = color;
      ctx.fillRect(20 + i*(bw+30), h - bh - 20, bw, bh);
      ctx.fillStyle = '#e6e8ef';
      ctx.font = '12px system-ui';
      ctx.fillText(`|${i}⟩  ${val}`, 20 + i*(bw+30), h - 6);
    };
    bar(0, '#06b6d4', counts[0]);
    bar(1, '#ec4899', counts[1]);
  }
  document.getElementById('m-once').onclick = () => shoot(1);
  document.getElementById('m-many').onclick = () => shoot(100);
  document.getElementById('m-reset').onclick = () => { counts={0:0,1:0}; c0.textContent='0'; c1.textContent='0'; draw(); };
  draw();
  window.addEventListener('resize', draw);
}

// ----- Circuits (IBM Composer-style: column-aligned, multi-qubit, full gate set) -----
function initCircuits(){
  let nQ = 2;
  // ops: array of {type, qubits:[...], params:{angle?}}
  // Each op occupies its own column (simple model — easy to align CNOT rows).
  let ops = [];
  let pending = null;       // {type, qubits:[]}  — gate awaiting placement
  const out = document.getElementById('cir-output');
  const canvas = document.getElementById('circuit-canvas');
  const hint = document.getElementById('cir-hint');
  const qLabel = document.getElementById('qcount-label');
  const paletteBtns = () => document.querySelectorAll('#circuits .gate-btn');

  const setHint = m => hint.textContent = m;

  // Format radians as a multiple of π (e.g. π/2, 3π/4, -π).
  function formatPi(rad){
    if(rad === 0) return '0';
    const k = rad / Math.PI;                  // value in units of π
    const denoms = [1,2,3,4,6,8,12];
    const eps = 1e-3;
    for(const d of denoms){
      const num = Math.round(k * d);
      if(Math.abs(k * d - num) < eps && num !== 0){
        const sign = num < 0 ? '-' : '';
        const n = Math.abs(num);
        if(d === 1) return `${sign}${n === 1 ? '' : n}π`;
        return `${sign}${n === 1 ? '' : n}π/${d}`;
      }
    }
    return `${k.toFixed(2)}π`;
  }
  // Accept "0.5" (→ 0.5π), "0.5π", or "1.2 rad".
  function parseAngle(raw){
    const s = String(raw).trim().toLowerCase().replace(/\s+/g,'');
    if(!s) return null;
    if(s.endsWith('rad')){
      const v = parseFloat(s.slice(0,-3));
      return isNaN(v) ? null : v;
    }
    const stripped = s.replace(/π|pi/g,'');
    const v = parseFloat(stripped);
    if(isNaN(v)) return null;
    return v * Math.PI;
  }
  const clearPending = () => {
    pending = null;
    paletteBtns().forEach(b => b.classList.remove('active'));
    setHint('Drag a gate to a wire — or click the gate, then click a wire.');
  };

  // Arm a gate for placement (used by both click and drag start).
  // Preserves a partially-placed CNOT (after control was set) so the user can finish via drag.
  function startPending(type){
    const isTwoQubit = (t) => t === 'CNOT' || t === 'CZ';
    if(pending && isTwoQubit(pending.type) && pending.qubits.length === 1 && pending.type === type){
      paletteBtns().forEach(b => b.classList.toggle('active', b.dataset.gate === type));
      setHint(`Now drop on the second wire to complete the ${type}.`);
      return;
    }
    paletteBtns().forEach(b => b.classList.toggle('active', b.dataset.gate === type));
    pending = {type, qubits:[]};
    if(type === 'CNOT')          setHint('Drop on a wire to set the CONTROL qubit.');
    else if(type === 'CZ')       setHint('Drop on a wire to set the first CZ qubit (CZ is symmetric).');
    else if(type === 'BARRIER')  setHint('Drop on any wire to insert a barrier.');
    else if(type === 'M')        setHint('Drop on a wire to add a measurement.');
    else if(['Rx','Ry','Rz'].includes(type)) setHint(`Drop ${type} on a wire — you'll be asked for an angle.`);
    else                         setHint(`Drop ${type} on a wire.`);
  }

  // ---------- Render ----------
  function render(){
    qLabel.textContent = `${nQ} qubit${nQ>1?'s':''}`;
    canvas.innerHTML = '';
    for(let q=0; q<nQ; q++){
      const wire = document.createElement('div');
      wire.className = 'qwire';
      const lbl = document.createElement('span');
      lbl.className = 'wire-label';
      lbl.textContent = 'q'+q;
      wire.appendChild(lbl);

      const cells = document.createElement('div');
      cells.className = 'cells';

      ops.forEach((op, i) => {
        const cell = document.createElement('div');
        cell.className = 'cell';

        if(op.type === 'BARRIER'){
          cell.classList.add('barrier-cell');
        } else if(op.type === 'CNOT' || op.type === 'CZ'){
          const [c, t] = op.qubits;
          const lo = Math.min(c,t), hi = Math.max(c,t);
          if(q === c){
            cell.classList.add('ctrl');
            cell.innerHTML = '<div class="ctrl-dot" title="Click to remove"></div>';
            cell.onclick = () => { ops.splice(i,1); render(); };
          } else if(q === t){
            if(op.type === 'CNOT'){
              cell.classList.add('target');
              cell.innerHTML = '<div class="xor" title="Click to remove">⊕</div>';
            } else {
              // CZ: target also drawn as a control dot (CZ is symmetric)
              cell.classList.add('ctrl');
              cell.innerHTML = '<div class="ctrl-dot" title="Click to remove · CZ"></div>';
            }
            cell.onclick = () => { ops.splice(i,1); render(); };
          }
          if(q > lo && q < hi) cell.classList.add('cnot-line');
        } else if(op.qubits.includes(q)){
          cell.classList.add('gate-cell');
          let label = op.type;
          if(op.params && op.params.angle !== undefined){
            label = `${op.type}(${formatPi(op.params.angle)})`;
          }
          const box = document.createElement('div');
          box.className = 'gate-box';
          const isRot = ['Rx','Ry','Rz'].includes(op.type);
          if(isRot) box.classList.add('rot');
          if(op.type === 'M') box.classList.add('meas');
          box.textContent = label;
          box.title = isRot ? 'Click to remove · Right-click to edit angle' : 'Click to remove';
          box.onclick = () => { ops.splice(i,1); render(); };
          if(isRot){
            box.oncontextmenu = (ev) => {
              ev.preventDefault();
              const cur = (op.params.angle / Math.PI).toFixed(4).replace(/\.?0+$/,'');
              const raw = prompt(
                `Edit angle for ${op.type} (units of π).  Examples: 0.5 → π/2, 1 → π.\nAdd "rad" suffix to enter raw radians.`,
                cur
              );
              if(raw === null) return;
              const a = parseAngle(raw);
              if(a === null){ setHint('Invalid angle — kept previous value.'); return; }
              op.params.angle = a;
              render();
            };
          }
          cell.appendChild(box);
        }
        cells.appendChild(cell);
      });

      // tail / placement zone
      const tail = document.createElement('div');
      tail.className = 'cell tail' + (pending ? ' armed' : '');
      tail.onclick = () => placeOnWire(q);
      cells.appendChild(tail);

      // Drag-and-drop target: dropping a gate anywhere on this wire places it on q.
      wire.addEventListener('dragover', (ev) => {
        if(!pending) return;
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'copy';
        wire.classList.add('drag-over');
      });
      wire.addEventListener('dragleave', () => wire.classList.remove('drag-over'));
      wire.addEventListener('drop', (ev) => {
        ev.preventDefault();
        wire.classList.remove('drag-over');
        placeOnWire(q);
      });

      wire.appendChild(cells);
      canvas.appendChild(wire);
    }
  }

  function placeOnWire(q){
    if(!pending){ setHint('First pick a gate from the palette above.'); return; }
    const t = pending.type;

    if(t === 'CNOT' || t === 'CZ'){
      pending.qubits.push(q);
      if(pending.qubits.length === 1){
        setHint(t === 'CZ'
          ? `First qubit set on q${q}. Now click the second wire (CZ is symmetric).`
          : `Control set on q${q}. Now click the TARGET wire.`);
      } else {
        if(pending.qubits[0] === pending.qubits[1]){
          setHint('The two qubits must be different. Pick again.');
          pending.qubits.pop();
          return;
        }
        ops.push({type:t, qubits:pending.qubits.slice()});
        clearPending();
      }
    } else if(t === 'BARRIER'){
      ops.push({type:'BARRIER', qubits:Array.from({length:nQ}, (_,i)=>i)});
      clearPending();
    } else {
      const params = {};
      if(['Rx','Ry','Rz'].includes(t)){
        const raw = prompt(
          `Angle for ${t}. Enter in units of π — e.g.  0.5  →  π/2,  1  →  π,  0.25  →  π/4.\nOr type a raw number with "rad" suffix (e.g. "1.2 rad").`,
          '0.5'
        );
        if(raw === null){ clearPending(); return; }
        const a = parseAngle(raw);
        if(a === null){ setHint('Invalid angle — cancelled.'); clearPending(); return; }
        params.angle = a;
      }
      ops.push({type:t, qubits:[q], params});
      clearPending();
    }
    render();
  }

  // ---------- Palette wiring (click + drag) ----------
  paletteBtns().forEach(btn => {
    btn.draggable = true;
    btn.onclick = () => {
      // Toggle off if user clicks the already-active gate (and it is not mid-CNOT)
      if(btn.classList.contains('active') && !(pending && pending.type === 'CNOT' && pending.qubits.length === 1)){
        clearPending(); render(); return;
      }
      startPending(btn.dataset.gate);
      render();
    };
    btn.addEventListener('dragstart', (ev) => {
      startPending(btn.dataset.gate);
      ev.dataTransfer.effectAllowed = 'copy';
      ev.dataTransfer.setData('text/plain', btn.dataset.gate);
      render();
    });
    btn.addEventListener('dragend', () => {
      // Refresh wire highlights after drag ends
      document.querySelectorAll('#circuits .qwire.drag-over').forEach(w => w.classList.remove('drag-over'));
    });
  });

  document.getElementById('add-qubit').onclick = () => {
    if(nQ < 6){ nQ++; render(); }
  };
  document.getElementById('rm-qubit').onclick = () => {
    if(nQ > 1){
      nQ--;
      ops = ops.filter(o => o.qubits.every(q => q < nQ));
      render();
    }
  };

  document.getElementById('cir-clear').onclick = () => {
    ops = []; clearPending(); render();
    out.textContent = `State: |${'0'.repeat(nQ)}⟩`;
  };

  // ---------- Simulator (complex amplitudes) ----------
  const c = (re, im=0) => [re, im];
  const cAdd = (a,b) => [a[0]+b[0], a[1]+b[1]];
  const cMul = (a,b) => [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]];

  function apply1(state, q, M, N){
    const dim = 1 << N;
    const out = new Array(dim);
    for(let i=0;i<dim;i++) out[i] = [0,0];
    for(let i=0;i<dim;i++){
      const bit = (i >> q) & 1;
      const partner = i ^ (1 << q);
      const i0 = bit === 0 ? i : partner;
      const i1 = bit === 0 ? partner : i;
      out[i] = cAdd(cMul(M[bit][0], state[i0]), cMul(M[bit][1], state[i1]));
    }
    return out;
  }
  function applyCNOT(state, ctrl, tgt, N){
    const dim = 1 << N;
    const r = state.slice();
    for(let i=0;i<dim;i++){
      if(((i >> ctrl) & 1) === 1){
        const j = i ^ (1 << tgt);
        if(j > i){ const tmp = r[i]; r[i] = r[j]; r[j] = tmp; }
      }
    }
    return r;
  }

  function applyCZ(state, q1, q2, N){
    // CZ flips the sign of basis states where both q1 and q2 are 1.
    const dim = 1 << N;
    const r = state.slice();
    for(let i=0;i<dim;i++){
      if((((i >> q1) & 1) === 1) && (((i >> q2) & 1) === 1)){
        r[i] = [-r[i][0], -r[i][1]];
      }
    }
    return r;
  }

  function gateMatrix(op){
    const I = c(1), Z0 = c(0);
    switch(op.type){
      case 'X': return [[Z0, c(1)], [c(1), Z0]];
      case 'Y': return [[Z0, c(0,-1)], [c(0,1), Z0]];
      case 'Z': return [[I, Z0], [Z0, c(-1)]];
      case 'H': { const s = 1/Math.SQRT2; return [[c(s),c(s)],[c(s),c(-s)]]; }
      case 'S': return [[I, Z0], [Z0, c(0,1)]];
      case 'T': return [[I, Z0], [Z0, c(Math.cos(Math.PI/4), Math.sin(Math.PI/4))]];
      case 'Rx': { const th=op.params.angle, cc=Math.cos(th/2), ss=Math.sin(th/2);
        return [[c(cc), c(0,-ss)], [c(0,-ss), c(cc)]]; }
      case 'Ry': { const th=op.params.angle, cc=Math.cos(th/2), ss=Math.sin(th/2);
        return [[c(cc), c(-ss)], [c(ss), c(cc)]]; }
      case 'Rz': { const th=op.params.angle, cc=Math.cos(th/2), ss=Math.sin(th/2);
        return [[c(cc,-ss), Z0], [Z0, c(cc, ss)]]; }
    }
    return null;
  }

  document.getElementById('cir-run').onclick = () => {
    const N = nQ;
    const dim = 1 << N;
    let state = new Array(dim);
    for(let i=0;i<dim;i++) state[i] = [0,0];
    state[0] = [1,0];

    let measured = false;
    for(const op of ops){
      if(op.type === 'BARRIER') continue;
      if(op.type === 'M'){ measured = true; continue; }
      if(op.type === 'CNOT'){
        state = applyCNOT(state, op.qubits[0], op.qubits[1], N);
      } else if(op.type === 'CZ'){
        state = applyCZ(state, op.qubits[0], op.qubits[1], N);
      } else {
        const M = gateMatrix(op);
        if(M) state = apply1(state, op.qubits[0], M, N);
      }
    }

    const probs = state.map(a => a[0]*a[0] + a[1]*a[1]);
    const lines = [];
    for(let i=0;i<dim;i++){
      if(probs[i] > 1e-6){
        const bin = i.toString(2).padStart(N,'0');
        lines.push(`|${bin}⟩  ${(probs[i]*100).toFixed(2)}%`);
      }
    }
    let result = `Outcome probabilities (${N} qubit${N>1?'s':''}):\n  ` +
      (lines.length ? lines.join('\n  ') : '(zero — empty circuit)');
    if(measured){
      const rnd = Math.random();
      let acc = 0, pick = 0;
      for(let i=0;i<dim;i++){ acc += probs[i]; if(rnd < acc){ pick = i; break; } }
      result += `\n→ Measured: |${pick.toString(2).padStart(N,'0')}⟩`;
    }
    out.textContent = result;
  };

  render();
}

// ----- Noise on a quantum channel -----
function initNoise(){
  const pSlider = document.getElementById('n-slider');
  const pLbl    = document.getElementById('n-val');
  const lenSlider = document.getElementById('n-len');
  const lenLbl    = document.getElementById('n-len-v');
  const channel = document.getElementById('n-channel');
  const out     = document.getElementById('n-output');
  const shotMsg = document.getElementById('n-shot-msg');

  pSlider.oninput   = () => { pLbl.textContent = pSlider.value; renderEmpty(); };
  lenSlider.oninput = () => { lenLbl.textContent = lenSlider.value; renderEmpty(); };

  function renderEmpty(){
    const N = +lenSlider.value;
    channel.innerHTML = '';
    for(let i=0;i<N;i++){
      const seg = document.createElement('div');
      seg.className = 'n-seg';
      seg.title = 'channel step ' + (i+1);
      channel.appendChild(seg);
    }
    out.textContent = '?';
    out.className = 'n-end out';
  }

  function renderShot(flips, finalState){
    const N = flips.length;
    channel.innerHTML = '';
    flips.forEach((f, i) => {
      const seg = document.createElement('div');
      seg.className = 'n-seg' + (f ? ' flipped' : '');
      seg.title = `step ${i+1}: ${f ? 'flip!' : 'no flip'}`;
      seg.textContent = f ? '⚡' : '';
      seg.style.animationDelay = (i * 30) + 'ms';
      channel.appendChild(seg);
    });
    out.textContent = `|${finalState}⟩`;
    out.className = 'n-end out ' + (finalState === 0 ? 'good' : 'bad');
  }

  document.getElementById('n-shot').onclick = () => {
    const N = +lenSlider.value;
    const p = +pSlider.value / 100;
    const flips = [];
    let state = 0;
    for(let i=0;i<N;i++){
      const f = Math.random() < p;
      flips.push(f);
      if(f) state = 1 - state;
    }
    renderShot(flips, state);
    const flipCount = flips.filter(x => x).length;
    shotMsg.textContent = state === 0
      ? `✓ Survived. ${flipCount} flip${flipCount===1?'':'s'} along the way — even number, errors cancelled out.`
      : `✗ Output is |1⟩ — ${flipCount} flip${flipCount===1?'':'s'} (odd), so the qubit ended up wrong.`;
  };

  document.getElementById('n-run').onclick = () => {
    const N = +lenSlider.value;
    const p = +pSlider.value / 100;
    const M = 1000;
    let counts = {0:0, 1:0};
    for(let s=0; s<M; s++){
      let state = 0;
      for(let i=0;i<N;i++) if(Math.random() < p) state = 1 - state;
      counts[state]++;
    }
    document.getElementById('n-c0').textContent = counts[0];
    document.getElementById('n-c1').textContent = counts[1];
    document.getElementById('n-c0pct').textContent = (counts[0]/M*100).toFixed(1) + '%';
    document.getElementById('n-c1pct').textContent = (counts[1]/M*100).toFixed(1) + '%';
    document.getElementById('n-bar0').style.width = (counts[0]/M*100) + '%';
    document.getElementById('n-bar1').style.width = (counts[1]/M*100) + '%';
    const theo = (1 - Math.pow(1 - 2*p, N)) / 2;
    document.getElementById('n-theo').textContent = (theo*100).toFixed(2) + '%';
    shotMsg.textContent = `Sent 1000 qubits. ${counts[1]} arrived flipped (${(counts[1]/M*100).toFixed(1)}% error).`;
  };

  renderEmpty();
}

// ----- Quantum Error Correction (3-qubit bit-flip code) -----
function initQEC(){
  let logical = '1';
  const noiseSlider = document.getElementById('qec-noise');
  const noiseLbl    = document.getElementById('qec-noise-v');
  const channel = document.getElementById('qec-channel');
  const decoded = document.getElementById('qec-decoded');
  const msg     = document.getElementById('qec-msg');

  noiseSlider.oninput = () => noiseLbl.textContent = noiseSlider.value;

  document.querySelectorAll('.qec-bit').forEach(b => {
    b.onclick = () => {
      logical = b.dataset.bit;
      document.querySelectorAll('.qec-bit').forEach(x => x.classList.toggle('active', x===b));
      runOnce();
    };
  });

  function runOnce(){
    const bit = +logical;
    const p = +noiseSlider.value / 100;
    const phys = [bit, bit, bit];
    const flips = phys.map(() => Math.random() < p);
    const after = phys.map((b, i) => flips[i] ? 1-b : b);
    const sum = after.reduce((a, b) => a + b, 0);
    const dec = sum >= 2 ? 1 : 0;

    channel.innerHTML = '';
    for(let i=0;i<3;i++){
      const row = document.createElement('div');
      row.className = 'qec-row';
      const flipped = flips[i];
      row.innerHTML = `
        <span class="qec-label">q${i}</span>
        <span class="qec-state in">|${bit}⟩</span>
        <span class="qec-track${flipped?' flip':''}">${flipped ? '⚡ bit-flip' : 'clean'}</span>
        <span class="qec-state${flipped?' err':''}">|${after[i]}⟩</span>`;
      channel.appendChild(row);
    }

    decoded.textContent = `|${dec}⟩`;
    decoded.className = 'qec-decoded ' + (dec === bit ? 'ok' : 'err');

    const flipCount = flips.filter(f => f).length;
    msg.textContent = dec === bit
      ? `✓ Decoded correctly. ${flipCount} of 3 qubits flipped — majority vote saved the logical bit.`
      : `✗ Decoding failed. ${flipCount} of 3 qubits flipped — too many for the 3-qubit code (it can only fix 1 flip).`;
  }

  document.getElementById('qec-run').onclick = runOnce;

  document.getElementById('qec-stats').onclick = () => {
    const p = +noiseSlider.value / 100;
    const N = 1000;
    let bare = 0, code = 0;
    for(let i=0;i<N;i++){
      if(Math.random() < p) bare++;
      let f = 0;
      for(let k=0;k<3;k++) if(Math.random() < p) f++;
      if(f >= 2) code++;
    }
    const bareRate = bare/N, codeRate = code/N;
    const theo = 3*p*p*(1-p) + p*p*p;
    document.getElementById('qec-bare').textContent  = (bareRate*100).toFixed(1) + '%';
    document.getElementById('qec-coded').textContent = (codeRate*100).toFixed(1) + '%';
    document.getElementById('qec-bare-bar').style.width  = Math.min(100, bareRate*100) + '%';
    document.getElementById('qec-coded-bar').style.width = Math.min(100, codeRate*100) + '%';
    document.getElementById('qec-theo').textContent = (theo*100).toFixed(2) + '%';
  };

  runOnce();
}

// ----- Mini-circuit renderer (used by Algorithms) -----
// Each spec: { rows:[label,...], steps:[ [placement, ...], ... ] }
// placement: {q, gate, cls?} | {cnot:[c,t]} | {span:[from,to], gate, cls?}
function renderMiniCircuit(host, spec, caption){
  const nQ = spec.rows.length;
  const nC = spec.steps.length;
  host.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'mc-grid';
  grid.style.setProperty('--cols', nC);

  spec.rows.forEach((label, q) => {
    const lbl = document.createElement('div');
    lbl.className = 'mc-rowlabel';
    lbl.style.gridRow = (q+1);
    lbl.style.gridColumn = 1;
    lbl.textContent = label;
    grid.appendChild(lbl);

    // wire background line per qubit, spanning all step columns
    const wire = document.createElement('div');
    wire.className = 'mc-wirebg';
    wire.style.gridRow = (q+1);
    wire.style.gridColumn = `2 / ${nC + 2}`;
    grid.appendChild(wire);
  });

  spec.steps.forEach((step, ci) => {
    const col = ci + 2;
    step.forEach(p => {
      if(p.cnot){
        const [c, t] = p.cnot;
        const lo = Math.min(c, t), hi = Math.max(c, t);
        const v = document.createElement('div');
        v.className = 'mc-vline';
        v.style.gridRow = `${lo+1} / ${hi+2}`;
        v.style.gridColumn = col;
        grid.appendChild(v);
        const ctrl = document.createElement('div');
        ctrl.className = 'mc-cell';
        ctrl.style.gridRow = c+1;
        ctrl.style.gridColumn = col;
        ctrl.innerHTML = '<span class="mc-ctrl"></span>';
        grid.appendChild(ctrl);
        const targ = document.createElement('div');
        targ.className = 'mc-cell';
        targ.style.gridRow = t+1;
        targ.style.gridColumn = col;
        if(p.label){
          const cls = 'mc-gate' + (p.cls ? ' ' + p.cls : '');
          targ.innerHTML = `<span class="${cls}">${p.label}</span>`;
        } else {
          targ.innerHTML = '<span class="mc-targ">⊕</span>';
        }
        grid.appendChild(targ);
      } else if(p.swap){
        const [a, b] = p.swap;
        const lo = Math.min(a, b), hi = Math.max(a, b);
        const v = document.createElement('div');
        v.className = 'mc-vline';
        v.style.gridRow = `${lo+1} / ${hi+2}`;
        v.style.gridColumn = col;
        grid.appendChild(v);
        [a, b].forEach(qq => {
          const cell = document.createElement('div');
          cell.className = 'mc-cell';
          cell.style.gridRow = qq+1;
          cell.style.gridColumn = col;
          cell.innerHTML = '<span class="mc-cross">×</span>';
          grid.appendChild(cell);
        });
      } else if(p.span){
        const [from, to] = p.span;
        const cell = document.createElement('div');
        cell.className = 'mc-cell mc-spangate';
        cell.style.gridRow = `${from+1} / ${to+2}`;
        cell.style.gridColumn = col;
        const box = document.createElement('span');
        box.className = 'mc-gate ' + (p.cls || 'oracle');
        box.textContent = p.gate;
        cell.appendChild(box);
        grid.appendChild(cell);
      } else {
        const cell = document.createElement('div');
        cell.className = 'mc-cell';
        cell.style.gridRow = p.q+1;
        cell.style.gridColumn = col;
        const box = document.createElement('span');
        box.className = 'mc-gate' + (p.cls ? ' ' + p.cls : '');
        box.textContent = p.gate;
        cell.appendChild(box);
        grid.appendChild(cell);
      }
    });
  });

  host.appendChild(grid);
  if(caption){
    const cap = document.createElement('div');
    cap.className = 'mc-caption';
    cap.textContent = caption;
    host.appendChild(cap);
  }
}

const ALGO_CIRCUITS = {
  coin: {
    spec: {
      rows: ['q₀: |0⟩'],
      steps: [
        [{q:0, gate:'H'}],
        [{q:0, gate:'M', cls:'meas'}],
      ],
    },
    caption: 'H rotates |0⟩ into an equal superposition; measurement collapses to 0 or 1 with 50/50 probability.',
  },
  grover: {
    spec: {
      rows: ['q₀: |0⟩', 'q₁: |0⟩'],
      steps: [
        [{q:0, gate:'H'}, {q:1, gate:'H'}],
        [{span:[0,1], gate:'Oracle Uω', cls:'oracle'}],
        [{span:[0,1], gate:'Diffusion', cls:'diff'}],
        [{q:0, gate:'M', cls:'meas'}, {q:1, gate:'M', cls:'meas'}],
      ],
    },
    caption: 'Hadamards prepare an even superposition over all 4 inputs. Oracle marks the target by flipping its phase; the diffusion operator amplifies the marked amplitude. One iteration is enough for N = 4.',
  },
  dj: {
    spec: {
      rows: ['q₀: |0⟩', 'q₁: |1⟩'],
      steps: [
        [{q:0, gate:'H'}, {q:1, gate:'H'}],
        [{span:[0,1], gate:'Uf', cls:'oracle'}],
        [{q:0, gate:'H'}],
        [{q:0, gate:'M', cls:'meas'}],
      ],
    },
    caption: 'The query qubit goes through H–Uf–H. Phase kickback from the |1⟩ ancilla makes the final measurement read 0 if f is constant and 1 if balanced — settled in just one query.',
  },
  tele: {
    spec: {
      rows: ['q₀: |ψ⟩', 'q₁: |0⟩', 'q₂: |0⟩'],
      steps: [
        [{q:1, gate:'H'}],
        [{cnot:[1,2]}],
        [{cnot:[0,1]}],
        [{q:0, gate:'H'}],
        [{q:0, gate:'M', cls:'meas'}],
        [{q:1, gate:'M', cls:'meas'}],
        [{q:2, gate:'X^m₂', cls:'cond'}],
        [{q:2, gate:'Z^m₁', cls:'cond'}],
      ],
    },
    caption: 'Cols 1–2 build the shared Bell pair on q₁/q₂. Cols 3–4 are Alice\'s Bell-basis change. Cols 5–6 measure Alice\'s qubits → m₁,m₂. Cols 7–8 are Bob\'s classically-controlled corrections — q₂ now holds |ψ⟩.',
  },
  qft: {
    spec: {
      rows: ['q₀: |x₀⟩', 'q₁: |x₁⟩', 'q₂: |x₂⟩'],
      steps: [
        [{q:0, gate:'H'}],
        [{cnot:[1,0], label:'R₂', cls:'qft'}],
        [{cnot:[2,0], label:'R₃', cls:'qft'}],
        [{q:1, gate:'H'}],
        [{cnot:[2,1], label:'R₂', cls:'qft'}],
        [{q:2, gate:'H'}],
        [{swap:[0,2]}],
      ],
    },
    caption: 'For each qubit: a Hadamard followed by controlled-phase rotations Rₖ = diag(1, e^(2πi/2ᵏ)) from every later qubit. A final SWAP reverses the bit order. The whole circuit needs only O(n²) gates for an n-qubit register.',
  },
  shor: {
    spec: {
      rows: ['Reg₁: |0⟩ⁿ', 'Reg₂: |0⟩ᵐ'],
      steps: [
        [{q:0, gate:'H⊗ⁿ'}],
        [{span:[0,1], gate:'aˣ mod N', cls:'oracle'}],
        [{q:0, gate:'QFT⁻¹', cls:'qft'}],
        [{q:0, gate:'M', cls:'meas'}],
      ],
    },
    caption: 'Register 1 is put into a uniform superposition over x. The modular-exponentiation oracle entangles Reg₁ with f(x)=aˣ mod N. Inverse QFT extracts the period r — the rest of Shor is classical post-processing (gcds).',
  },
};

// ----- Algorithms -----
function initAlgorithms(){
  // Render one circuit per tab.
  Object.entries(ALGO_CIRCUITS).forEach(([key, info]) => {
    const host = document.getElementById('circ-' + key);
    if(host) renderMiniCircuit(host, info.spec, info.caption);
  });
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.onclick = () => {
      document.querySelectorAll('.tab-btn').forEach(x => x.classList.toggle('active', x===b));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
      document.getElementById('tab-' + b.dataset.tab).classList.remove('hidden');
    };
  });

  // Coin flip
  const coinEl = document.getElementById('coin-result');
  document.getElementById('coin-flip').onclick = () => {
    coinEl.classList.remove('flipping');
    void coinEl.offsetWidth;
    coinEl.classList.add('flipping');
    setTimeout(() => coinEl.textContent = Math.random() < 0.5 ? '0' : '1', 700);
  };

  // Grover
  const boxes = document.getElementById('grover-boxes');
  const gMsg = document.getElementById('grover-msg');
  function paintBoxes(target=-1){
    boxes.innerHTML = '';
    for(let i=0;i<4;i++){
      const d = document.createElement('div');
      d.className = 'grover-box' + (i===target ? ' target':'');
      d.textContent = i===target ? '★' : '·';
      boxes.appendChild(d);
    }
  }
  paintBoxes();
  document.getElementById('grover-run').onclick = () => {
    const target = Math.floor(Math.random()*4);
    paintBoxes();
    gMsg.textContent = 'Searching… amplitude amplification…';
    setTimeout(() => {
      paintBoxes(target);
      gMsg.textContent = `Found ★ at box ${target} in just 1 quantum step. Classical search would peek up to 4 times.`;
    }, 700);
  };

  // Deutsch-Jozsa
  let djFn = null;
  const djMsg = document.getElementById('dj-msg');
  document.getElementById('dj-new').onclick = () => {
    const isConstant = Math.random() < 0.5;
    if(isConstant){
      const c = Math.random() < 0.5 ? 0 : 1;
      djFn = {type:'constant', value:c};
    }else{
      const flip = Math.random() < 0.5;
      djFn = {type:'balanced', flip};
    }
    djMsg.textContent = 'Hidden function generated. Click Run.';
  };
  document.getElementById('dj-run').onclick = () => {
    if(!djFn){ djMsg.textContent = 'Generate a function first.'; return; }
    djMsg.textContent = `One quantum query → answer: ${djFn.type.toUpperCase()}.`;
  };

  // Teleportation
  document.getElementById('tele-run').onclick = () => {
    const stepsEl = document.getElementById('tele-steps');
    stepsEl.innerHTML = '';
    const m1 = Math.random() < 0.5 ? 0 : 1;
    const m2 = Math.random() < 0.5 ? 0 : 1;
    const correction = (m1 ? 'Z' : 'I') + ' · ' + (m2 ? 'X' : 'I');
    const steps = [
      '① Alice has a mystery qubit |ψ⟩ she wants to send to Bob.',
      '② They share an entangled Bell pair: H on q1, then CNOT(q1→q2). q1 stays with Alice, q2 goes to Bob.',
      '③ Alice applies CNOT(ψ → her half) and then H on ψ.',
      `④ Alice measures both her qubits → m₁ = ${m1}, m₂ = ${m2}. Sends these 2 classical bits to Bob.`,
      `⑤ Bob applies correction (${correction}) on his qubit. It is now in state |ψ⟩.`,
      '✓ Teleportation complete. Alice\'s original collapsed (no-cloning) — only the *state* moved.',
    ];
    steps.forEach((s,i) => setTimeout(() => {
      const d = document.createElement('div');
      d.className = 'tele-step' + (i === steps.length-1 ? ' last' : '');
      d.textContent = s;
      stepsEl.appendChild(d);
    }, i*650));
  };

  // QFT — 3-qubit Quantum Fourier Transform on a single basis state |x⟩.
  (() => {
    const N = 8; // 2³
    const inputsHost = document.getElementById('qft-inputs');
    const resultsEl  = document.getElementById('qft-results');
    const msg        = document.getElementById('qft-msg');
    if(!inputsHost) return;
    inputsHost.innerHTML = '';
    for(let x=0; x<N; x++){
      const b = document.createElement('button');
      b.className = 'qft-input' + (x===1 ? ' active' : '');
      b.dataset.x = x;
      b.textContent = `|${x}⟩`;
      b.onclick = () => {
        document.querySelectorAll('.qft-input').forEach(z =>
          z.classList.toggle('active', z === b));
        run(x);
      };
      inputsHost.appendChild(b);
    }

    function fmtPhase(theta){
      // Show phase as a multiple of π/4 (since 2π·xk/8 always lands on multiples of π/4).
      const k = Math.round(theta / (Math.PI/4)) % 8;
      const m = ((k % 8) + 8) % 8;
      const tab = ['0', 'π/4', 'π/2', '3π/4', 'π', '5π/4', '3π/2', '7π/4'];
      return tab[m];
    }

    function run(x){
      resultsEl.innerHTML = '';
      const mag = 1/Math.sqrt(N);
      for(let k=0; k<N; k++){
        const theta = (2 * Math.PI * x * k / N) % (2*Math.PI);
        const deg = theta * 180 / Math.PI;
        const bin = document.createElement('div');
        bin.className = 'qft-bin';
        bin.innerHTML = `
          <div class="qft-clock"><div class="qft-clock-arm" style="transform:translate(0,-50%) rotate(${-deg}deg)"></div></div>
          <div class="qft-phase">e^(i·${fmtPhase(theta)})</div>
          <div class="qft-bar"><div class="qft-bar-fill" style="height:${mag*mag*N*100}%"></div></div>
          <div class="qft-label">|${k}⟩</div>`;
        resultsEl.appendChild(bin);
      }
      msg.innerHTML = x === 0
        ? `QFT|0⟩ = (1/√8)·Σ|k⟩ — uniform superposition with all phases 0.`
        : `QFT|${x}⟩ = (1/√8)·Σ e^(2πi·${x}k/8)·|k⟩ — uniform magnitudes, phases winding by ${x}·2π/8 per step. The "speed" of the phase rotation encodes x.`;
    }

    run(1);
  })();

  // Shor (factor 15)
  const gcd = (a,b) => { a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a; };
  document.getElementById('shor-run').onclick = () => {
    const out = document.getElementById('shor-out');
    const N = 15;
    const candidates = [2,4,7,8,11,13,14].filter(a => gcd(a,N) === 1);
    const a = candidates[Math.floor(Math.random()*candidates.length)];

    // Find period r classically (the quantum part finds it exponentially faster)
    let r = 1, val = a % N;
    while(val !== 1){ val = (val*a) % N; r++; if(r>50){ break; } }

    let txt = `Step 1 · Pick random a coprime with N=15 → a = ${a}.\n`;
    txt += `Step 2 · Quantum period-finding (the magic) returns r = ${r},\n`;
    txt += `         the smallest r with a^r mod 15 = 1.\n`;
    if(r % 2 !== 0){
      txt += `Step 3 · r is odd — restart with a different a.`;
    } else {
      const half = Math.pow(a, r/2);
      const f1 = gcd(half - 1, N);
      const f2 = gcd(half + 1, N);
      txt += `Step 3 · Compute  gcd(${a}^${r/2} − 1, 15) = ${f1}\n`;
      txt += `                  gcd(${a}^${r/2} + 1, 15) = ${f2}\n`;
      if(f1 > 1 && f1 < N && f2 > 1 && f2 < N){
        txt += `\n✓ Factors of 15 found:  15 = ${f1} × ${f2}.`;
      } else {
        txt += `\n…trivial factor — restart with another a.`;
      }
    }
    out.textContent = txt;
  };
}

// ----- Final challenge -----
function initChallenge(){
  const status = document.getElementById('challenge-status');
  const area = document.getElementById('challenge-area');
  const done = MODULES.filter(m => progress[m].done).length;
  if(done < 6){
    status.textContent = `Locked — complete ${6-done} more module(s) to unlock.`;
    area.innerHTML = '';
    return;
  }
  status.textContent = 'Unlocked! 5 mixed questions await.';
  renderQuiz('challenge', FINAL_QUIZ, area, score => {
    if(!progress.challenge.done){
      progress.challenge.done = true;
      progress.challenge.score = score;
      save(); render();
      toast('🏆 Quantum Explorer badge earned!');
    } else {
      progress.challenge.score = Math.max(progress.challenge.score, score);
      save(); render();
    }
  });
}

// ============================================================
// Init
// ============================================================
function init(){
  renderGlossary();
  renderFaq();
  initQubits();
  initBloch();
  initSuperposition();
  initEntanglement();
  initBell();
  initMeasurement();
  initGates();
  initCircuits();
  initKickback();
  initNoise();
  initQEC();
  initAlgorithms();
  initParadox();
  initCrypto();
  attachQuizzes();
  initChallenge();
  render();

  // Re-init challenge when navigated to (in case progress changed)
  window.addEventListener('hashchange', () => {
    if(location.hash === '#challenge') initChallenge();
  });

  showSection((location.hash || '#qubits').slice(1));
}

document.addEventListener('DOMContentLoaded', init);

})();
