/* ============================================================
   GRAMMAR DETECTIVE — Activity 1 Game Logic
   activity1.js
   ============================================================
   Page    : Countable & Uncountable Nouns
   Depends : auth.js (GD object)
   ============================================================ */

const Activity1 = (() => {

  /* ----------------------------------------------------------
     DATA — directly from PDF
     ---------------------------------------------------------- */

  // Exercise 1: Coloring Fun (PDF page 3 — items on the suitcase)
  const COLOR_DATA = [
    { emoji: '🍎', label: 'Apple',    ans: 'red'  },  // countable
    { emoji: '🧂', label: 'Salt',     ans: 'blue' },  // uncountable
    { emoji: '🥛', label: 'Milk',     ans: 'blue' },  // uncountable
    { emoji: '🍔', label: 'Burger',   ans: 'red'  },  // countable
    { emoji: '🌂', label: 'Umbrella', ans: 'red'  },  // countable
    { emoji: '🌾', label: 'Flour',    ans: 'blue' },  // uncountable
    { emoji: '🍪', label: 'Cookie',   ans: 'red'  },  // countable
    { emoji: '💧', label: 'Water',    ans: 'blue' },  // uncountable
    { emoji: '🥚', label: 'Egg',      ans: 'red'  },  // countable
  ];

  // Exercise 2: Let's Find (PDF page 4 — 12 food images)
  const FIND_DATA = [
    { emoji: '🥕', label: 'Carrots',      ans: 'C' },
    { emoji: '🍅', label: 'Tomatoes',     ans: 'C' },
    { emoji: '🥦', label: 'Broccoli',     ans: 'C' },
    { emoji: '🥔', label: 'Potatoes',     ans: 'C' },
    { emoji: '🍚', label: 'Rice',         ans: 'U' },
    { emoji: '🫑', label: 'Peppers',      ans: 'C' },
    { emoji: '🍓', label: 'Strawberries', ans: 'C' },
    { emoji: '🥚', label: 'Eggs',         ans: 'C' },
    { emoji: '🍒', label: 'Cherries',     ans: 'C' },
    { emoji: '🧀', label: 'Cheese',       ans: 'U' },
    { emoji: '🍎', label: 'Apples',       ans: 'C' },
    { emoji: '🍲', label: 'Soup',         ans: 'U' },
  ];

  // Exercise 3: Drag into jar (PDF page 5 — exactly 5 items)
  const JAR_DATA = [
    { emoji: '🌾', label: 'flour',   num: '1', ans: 'uncountable' },
    { emoji: '💧', label: 'water',   num: '2', ans: 'uncountable' },
    { emoji: '📚', label: 'books',   num: '3', ans: 'countable'   },
    { emoji: '🍪', label: 'cookies', num: '4', ans: 'countable'   },
    { emoji: '🍚', label: 'rice',    num: '5', ans: 'uncountable' },
  ];

  /* ----------------------------------------------------------
     STATE
     ---------------------------------------------------------- */
  let colorState = {};         // { index: 'red'|'blue'|'' }
  let findState  = {};         // { index: 'C'|'U'|null }
  let jarDropped = { countable: [], uncountable: [] }; // [index, ...]
  let dragIdx    = null;

  let doneColor = false;
  let doneFind  = false;
  let doneJar   = false;

  /* ----------------------------------------------------------
     EXERCISE 1 — COLORING FUN
     ---------------------------------------------------------- */
  function buildColor() {
    colorState = {};
    const grid = document.getElementById('color-grid');
    if (!grid) return;

    grid.innerHTML = COLOR_DATA.map((d, i) => `
      <div class="color-item" id="ci-${i}" onclick="Activity1.cycleColor(${i})">
        <span class="ci-emoji">${d.emoji}</span>
        <span class="ci-label">${d.label}</span>
        <span class="ci-tag" id="ct-${i}">?</span>
      </div>
    `).join('');

    const r = document.getElementById('result-color');
    if (r) r.style.display = 'none';
  }

  function cycleColor(i) {
    const cur  = colorState[i] || '';
    const next = cur === ''    ? 'red'
               : cur === 'red' ? 'blue'
               :                 '';
    colorState[i] = next;

    const card = document.getElementById('ci-' + i);
    const tag  = document.getElementById('ct-' + i);
    card.classList.remove('state-red', 'state-blue', 'is-correct', 'is-wrong');
    if (next === 'red')  { card.classList.add('state-red');  tag.textContent = 'C'; }
    if (next === 'blue') { card.classList.add('state-blue'); tag.textContent = 'U'; }
    if (next === '')     { tag.textContent = '?'; tag.style.color = ''; }
  }

  function checkColor() {
    let correct = 0;
    COLOR_DATA.forEach((d, i) => {
      const card = document.getElementById('ci-' + i);
      card.classList.remove('is-correct', 'is-wrong');
      if ((colorState[i] || '') === d.ans) {
        correct++;
        card.classList.add('is-correct');
      } else {
        card.classList.add('is-wrong');
      }
    });
    showResult('result-color', correct, COLOR_DATA.length);
    doneColor = true;
    tryShowFinal();
  }

  /* ----------------------------------------------------------
     EXERCISE 2 — LET'S FIND (C / U)
     ---------------------------------------------------------- */
  function buildFind() {
    findState = {};
    const grid = document.getElementById('find-grid');
    if (!grid) return;

    grid.innerHTML = FIND_DATA.map((d, i) => `
      <div class="find-item">
        <span class="find-num">${i + 1}</span>
        <span class="fi-emoji">${d.emoji}</span>
        <span class="fi-label">${d.label}</span>
        <div class="cu-btns">
          <button class="cu-btn" id="fb-${i}-C" onclick="Activity1.pickCU(${i},'C')">C</button>
          <button class="cu-btn" id="fb-${i}-U" onclick="Activity1.pickCU(${i},'U')">U</button>
        </div>
      </div>
    `).join('');

    const r = document.getElementById('result-find');
    if (r) r.style.display = 'none';
  }

  function pickCU(i, val) {
    findState[i] = val;
    ['C', 'U'].forEach(v => {
      const b = document.getElementById('fb-' + i + '-' + v);
      if (!b) return;
      b.className = 'cu-btn' + (v === val ? ' active-' + v : '');
    });
  }

  function checkFind() {
    let correct = 0;
    FIND_DATA.forEach((d, i) => {
      const chosen = findState[i];
      // Reset
      ['C', 'U'].forEach(v => {
        const b = document.getElementById('fb-' + i + '-' + v);
        if (b) b.className = 'cu-btn';
      });
      if (chosen === d.ans) {
        correct++;
        const b = document.getElementById('fb-' + i + '-' + chosen);
        if (b) b.classList.add('is-correct');
      } else {
        // Mark correct answer green, chosen answer red
        const rightBtn = document.getElementById('fb-' + i + '-' + d.ans);
        if (rightBtn) rightBtn.classList.add('is-correct');
        if (chosen) {
          const wrongBtn = document.getElementById('fb-' + i + '-' + chosen);
          if (wrongBtn) wrongBtn.classList.add('is-wrong');
        }
      }
    });
    showResult('result-find', correct, FIND_DATA.length);
    doneFind = true;
    tryShowFinal();
  }

  /* ----------------------------------------------------------
     EXERCISE 3 — DRAG INTO JARS
     ---------------------------------------------------------- */
  function buildJar() {
    jarDropped = { countable: [], uncountable: [] };
    dragIdx    = null;

    const bank = document.getElementById('jar-bank');
    if (!bank) return;

    bank.innerHTML =
      `<div class="jar-bank-label">📦 Items — drag into the correct jar:</div>` +
      JAR_DATA.map((d, i) => `
        <div class="jar-word" id="jw-${i}"
             draggable="true"
             ondragstart="Activity1.dragStart(event, ${i})"
             ondragend="Activity1.dragEnd(event)">
          <span class="jw-emoji">${d.emoji}</span>
          <span class="jw-num">${d.num}.</span>
          <span class="jw-name">${d.label}</span>
        </div>
      `).join('');

    renderJar('countable');
    renderJar('uncountable');

    const r = document.getElementById('result-jar');
    if (r) r.style.display = 'none';
  }

  function dragStart(e, i) {
    dragIdx = i;
    e.dataTransfer.setData('text/plain', String(i));
    setTimeout(() => {
      const el = document.getElementById('jw-' + i);
      if (el) el.style.opacity = '0.4';
    }, 0);
  }

  function dragEnd(e) {
    if (dragIdx !== null) {
      const el = document.getElementById('jw-' + dragIdx);
      if (el) el.style.opacity = '';
    }
    dragIdx = null;
  }

  function jarOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }

  function jarLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  function jarDrop(e, col) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const idx = parseInt(e.dataTransfer.getData('text/plain'));
    if (isNaN(idx)) return;

    // Remove from both columns first
    ['countable', 'uncountable'].forEach(c => {
      jarDropped[c] = jarDropped[c].filter(x => x !== idx);
      renderJar(c);
    });

    // Add to target column
    jarDropped[col].push(idx);
    renderJar(col);

    // Mark source word as placed
    const src = document.getElementById('jw-' + idx);
    if (src) src.classList.add('placed');
  }

  function renderJar(col) {
    const jar = document.getElementById('jar-' + col);
    const ph  = document.getElementById('jph-' + col);
    if (!jar) return;

    // Remove existing chips only
    jar.querySelectorAll('.jar-chip').forEach(el => el.remove());

    jarDropped[col].forEach(idx => {
      const d    = JAR_DATA[idx];
      const chip = document.createElement('span');
      chip.className = 'jar-chip' + (col === 'uncountable' ? ' chip-blue' : '');
      chip.innerHTML = `${d.emoji} ${d.label} <span class="chip-remove" onclick="Activity1.removeChip(${idx},'${col}')">✕</span>`;
      jar.appendChild(chip);
    });

    if (ph) ph.style.opacity = jarDropped[col].length ? '0' : '1';
  }

  function removeChip(idx, col) {
    jarDropped[col] = jarDropped[col].filter(x => x !== idx);
    renderJar(col);
    // Restore word in bank
    const el = document.getElementById('jw-' + idx);
    if (el) el.classList.remove('placed');
  }

  function checkJar() {
    let correct = 0;
    JAR_DATA.forEach((d, i) => {
      if (jarDropped[d.ans].includes(i)) correct++;
    });
    showResult('result-jar', correct, JAR_DATA.length);
    doneJar = true;
    tryShowFinal();
  }

  /* ----------------------------------------------------------
     RESULT HELPER
     ---------------------------------------------------------- */
  function showResult(id, correct, total) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'block';
    if (correct === total) {
      el.className = 'ex-result ok';
      el.textContent = '✅ Perfect! ' + correct + '/' + total + ' correct!';
    } else {
      el.className = 'ex-result err';
      el.textContent = '❌ ' + correct + '/' + total + ' correct. Check the highlighted items and try again.';
    }
  }

  /* ----------------------------------------------------------
     FINAL SCORE
     ---------------------------------------------------------- */
  function tryShowFinal() {
    if (doneColor && doneFind && doneJar) showFinalScore();
  }

  function showFinalScore() {
    let correct = 0, total = 0;

    // Tally color
    COLOR_DATA.forEach((d, i) => {
      total++;
      if ((colorState[i] || '') === d.ans) correct++;
    });
    // Tally find
    FIND_DATA.forEach((d, i) => {
      total++;
      if (findState[i] === d.ans) correct++;
    });
    // Tally jar
    JAR_DATA.forEach((d, i) => {
      total++;
      if (jarDropped[d.ans].includes(i)) correct++;
    });

    // Save score
    GD.saveActivityScore('act1', correct, total);

    // Render panel
    const pct = correct / total;
    const el  = id => document.getElementById(id);
    el('sp-stars').textContent = pct >= 0.9 ? '⭐⭐⭐' : pct >= 0.6 ? '⭐⭐' : '⭐';
    el('sp-num').textContent   = correct;
    el('sp-sub').textContent   = 'out of ' + total + ' questions';
    el('sp-msg').textContent   = GD.scoreMsg(correct, total);

    const panel = el('score-panel');
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth' });
  }

  /* ----------------------------------------------------------
     RESET ALL
     ---------------------------------------------------------- */
  function resetAll() {
    doneColor = doneFind = doneJar = false;

    const panel = document.getElementById('score-panel');
    if (panel) panel.style.display = 'none';

    buildColor();
    buildFind();
    buildJar();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ----------------------------------------------------------
     INIT
     ---------------------------------------------------------- */
  function init() {
    GD.requireAuth(true); // redirect to login if not logged in

    buildColor();
    buildFind();
    buildJar();

    // Wire up check buttons
    const btnColor = document.getElementById('btn-check-color');
    const btnFind  = document.getElementById('btn-check-find');
    const btnJar   = document.getElementById('btn-check-jar');

    if (btnColor) btnColor.addEventListener('click', checkColor);
    if (btnFind)  btnFind.addEventListener('click',  checkFind);
    if (btnJar)   btnJar.addEventListener('click',   checkJar);
  }

  // Run after DOM is ready
  document.addEventListener('DOMContentLoaded', init);

  /* ----------------------------------------------------------
     Public API (called from HTML inline events)
     ---------------------------------------------------------- */
  return {
    cycleColor,
    pickCU,
    dragStart,
    dragEnd,
    jarOver,
    jarLeave,
    jarDrop,
    removeChip,
    resetAll,
  };

})();