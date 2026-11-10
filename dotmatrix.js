/*!
 * Dotmatrix v0.4.1 - dot-matrix web components for LED panel control pages.
 * The page is one grid of dots, like the HUB75 panels it controls.
 * Surfaces: <dot-matrix>, <dot-app>
 * Text:     <dot-heading>, <dot-text>, <dot-value>, <dot-icon>, <dot-marquee>
 * Controls: <dot-button>, <dot-slider>, <dot-toggle>, <dot-input>
 * Status:   <dot-led>, <dot-badge>, <dot-status>
 * Layout:   <dot-bar>, <dot-panel>, <dot-grid>, <dot-rule>
 * No dependencies. Drop in with <script src="dotmatrix.js"></script>
 */
(() => {
  'use strict';

  /* ------------------------------------------------------------------
   * HEAD font: 5x7 capitals. Each glyph is 7 comma-separated rows, each
   * row a 5-bit number (16 = leftmost column). Lookup ignores case.
   * Letters and digits are 5 wide; punctuation is trimmed to its columns.
   * ------------------------------------------------------------------ */
  const RAW = {
    A: '14,17,17,31,17,17,17', B: '30,17,17,30,17,17,30', C: '14,17,16,16,16,17,14',
    D: '28,18,17,17,17,18,28', E: '31,16,16,30,16,16,31', F: '31,16,16,30,16,16,16',
    G: '14,17,16,23,17,17,15', H: '17,17,17,31,17,17,17', I: '14,4,4,4,4,4,14',
    J: '7,2,2,2,2,18,12',      K: '17,18,20,24,20,18,17', L: '16,16,16,16,16,16,31',
    M: '17,27,21,21,17,17,17', N: '17,17,25,21,19,17,17', O: '14,17,17,17,17,17,14',
    P: '30,17,17,30,16,16,16', Q: '14,17,17,17,21,18,13', R: '30,17,17,30,20,18,17',
    S: '15,16,16,14,1,1,30',   T: '31,4,4,4,4,4,4',       U: '17,17,17,17,17,17,14',
    V: '17,17,17,17,17,10,4',  W: '17,17,17,21,21,21,10', X: '17,17,10,4,10,17,17',
    Y: '17,17,10,4,4,4,4',     Z: '31,1,2,4,8,16,31',
    0: '14,17,19,21,25,17,14', 1: '4,12,4,4,4,4,14',      2: '14,17,1,2,4,8,31',
    3: '31,2,4,2,1,17,14',     4: '2,6,10,18,31,2,2',     5: '31,16,30,1,1,17,14',
    6: '6,8,16,30,17,17,14',   7: '31,1,2,4,8,8,8',       8: '14,17,17,14,17,17,14',
    9: '14,17,17,15,1,2,12',
    ' ': '0,0,0,0,0,0,0', '.': '0,0,0,0,0,0,4', ',': '0,0,0,0,0,4,8',
    ':': '0,0,4,0,0,4,0', ';': '0,0,4,0,0,4,8', '-': '0,0,0,14,0,0,0',
    '+': '0,4,4,31,4,4,0', '=': '0,0,31,0,31,0,0', '/': '0,1,2,4,8,16,0',
    '!': '4,4,4,4,4,0,4', '?': '14,17,1,2,4,0,4', '%': '24,25,2,4,8,19,3',
    "'": '4,4,0,0,0,0,0', '"': '10,10,0,0,0,0,0', '(': '2,4,8,8,8,4,2',
    ')': '8,4,2,2,2,4,8', '[': '14,8,8,8,8,8,14', ']': '14,2,2,2,2,2,14',
    '_': '0,0,0,0,0,0,31', '#': '10,10,31,10,31,10,10', '&': '12,18,20,8,21,18,13',
    '*': '0,4,21,14,21,4,0', '<': '2,4,8,16,8,4,2', '>': '8,4,2,1,2,4,8',
    '@': '14,17,23,21,23,16,14', '$': '4,15,20,14,5,30,4', '|': '4,4,4,4,4,4,4',
    '^': '4,10,17,0,0,0,0', '{': '6,4,4,8,4,4,6', '}': '12,4,4,2,4,4,12', '~': '0,0,8,21,2,0,0',
    '\\': '0,16,8,4,2,1,0', '`': '8,4,0,0,0,0,0',
    // ° × → ←, ‘ ’ “ ” – — … « » · • € Œ Æ: non-ASCII keys are escaped so the font
    // survives a server that sends this file without a charset.
    '\u00b0': '12,18,18,12,0,0,0', '\u00d7': '0,17,10,4,10,17,0',
    '\u2192': '0,4,2,31,2,4,0', '\u2190': '0,4,8,31,8,4,0',
    '\u2018': '4,8,8,0,0,0,0', '\u2019': '4,4,8,0,0,0,0', '\u201c': '10,20,20,0,0,0,0',
    '\u201d': '10,10,20,0,0,0,0', '\u2013': '0,0,0,30,0,0,0', '\u2014': '0,0,0,31,0,0,0',
    '\u2026': '0,0,0,0,0,0,21', '\u00ab': '0,0,10,20,10,0,0', '\u00bb': '0,0,20,10,20,0,0',
    '\u00b7': '0,0,0,4,0,0,0', '\u2022': '0,0,14,14,14,0,0', '\u20ac': '6,9,30,8,30,9,6',
    '\u0152': '15,20,20,23,20,20,15', '\u00c6': '15,20,20,31,20,20,23'
  };

  /* ------------------------------------------------------------------
   * BODY font: mixed case in a 5x9 cell. Capitals, digits and punctuation
   * come from RAW (rows 0-6); lowercase is drawn below with x-height rows
   * 2-6 (baseline row 6) and descenders in rows 7-8, along with the
   * punctuation that sits on the x-height or hangs below. '#' is a lit dot.
   * Letters and punctuation are trimmed to the columns they use; digits
   * stay 5 wide so numbers line up.
   * ------------------------------------------------------------------ */
  const LOWER = {
    a: ['.....', '.....', '.###.', '....#', '.####', '#...#', '.####'],
    b: ['#....', '#....', '#.##.', '##..#', '#...#', '#...#', '####.'],
    c: ['.....', '.....', '.###.', '#....', '#....', '#...#', '.###.'],
    d: ['....#', '....#', '.##.#', '#..##', '#...#', '#...#', '.####'],
    e: ['.....', '.....', '.###.', '#...#', '#####', '#....', '.###.'],
    f: ['..##.', '.#...', '####.', '.#...', '.#...', '.#...', '.#...'],
    g: ['.....', '.....', '.####', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
    h: ['#....', '#....', '#.##.', '##..#', '#...#', '#...#', '#...#'],
    i: ['#....', '.....', '#....', '#....', '#....', '#....', '#....'],
    j: ['..#..', '.....', '..#..', '..#..', '..#..', '..#..', '..#..', '#.#..', '.#...'],
    k: ['#....', '#....', '#..#.', '#.#..', '##...', '#.#..', '#..#.'],
    l: ['#....', '#....', '#....', '#....', '#....', '#....', '.#...'],
    m: ['.....', '.....', '##.#.', '#.#.#', '#.#.#', '#.#.#', '#.#.#'],
    n: ['.....', '.....', '#.##.', '##..#', '#...#', '#...#', '#...#'],
    o: ['.....', '.....', '.###.', '#...#', '#...#', '#...#', '.###.'],
    p: ['.....', '.....', '####.', '#...#', '#...#', '#...#', '####.', '#....', '#....'],
    q: ['.....', '.....', '.####', '#...#', '#...#', '#...#', '.####', '....#', '....#'],
    r: ['.....', '.....', '#.##.', '##...', '#....', '#....', '#....'],
    s: ['.....', '.....', '.####', '#....', '.###.', '....#', '####.'],
    t: ['.....', '.#...', '###..', '.#...', '.#...', '.#...', '..##.'],
    u: ['.....', '.....', '#...#', '#...#', '#...#', '#..##', '.##.#'],
    v: ['.....', '.....', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
    w: ['.....', '.....', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
    x: ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
    y: ['.....', '.....', '#...#', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
    z: ['.....', '.....', '#####', '...#.', '..#..', '.#...', '#####'],
    // The oe and ae ligatures, 7 columns: the two letters share their middle stroke.
    '\u0153': ['.......', '.......', '.##.##.', '#..#..#', '#..####', '#..#...', '.##.##.'],
    '\u00e6': ['.......', '.......', '.##.##.', '...#..#', '.######', '#..#...', '.#####.'],
    // Comma and semicolon can hang into the descender rows.
    ',': ['.....', '.....', '.....', '.....', '.....', '.#...', '.#...', '#....'],
    ';': ['.....', '.....', '.....', '.#...', '.....', '.#...', '.#...', '#....'],
    // Guillemets, middle dot and bullet centred on the x-height.
    '\u00ab': ['.....', '.....', '.....', '.#.#.', '#.#..', '.#.#.'],
    '\u00bb': ['.....', '.....', '.....', '#.#..', '.#.#.', '#.#..'],
    '\u00b7': ['.....', '.....', '.....', '.....', '..#..'],
    '\u2022': ['.....', '.....', '.....', '.###.', '.###.', '.###.']
  };

  /* ------------------------------------------------------------------
   * 7x7 icons. Each row is a 7-bit number (64 = leftmost column).
   * ------------------------------------------------------------------ */
  const RAW_ICONS = {
    back: '8,16,32,127,32,16,8', forward: '8,4,2,127,2,4,8', up: '8,28,42,73,8,8,8',
    down: '8,8,8,73,42,28,8', chevron: '0,0,65,34,20,8,0', close: '65,34,20,8,20,34,65',
    plus: '8,8,8,127,8,8,8', minus: '0,0,0,127,0,0,0', check: '0,1,2,68,40,16,0',
    menu: '0,127,0,127,0,127,0', gear: '20,62,119,34,119,62,20', power: '8,42,73,73,65,34,28',
    wifi: '0,62,65,28,34,8,0', sun: '8,34,28,93,28,34,8', moon: '28,48,96,96,96,48,28',
    lock: '28,34,34,127,119,119,127', unlock: '28,34,32,127,119,119,127', warn: '8,20,20,42,34,73,127',
    info: '8,0,24,8,8,8,28', refresh: '29,35,71,64,65,34,28', play: '32,48,56,60,56,48,32',
    pause: '54,54,54,54,54,54,54', stop: '0,62,62,62,62,62,0', bolt: '6,12,24,62,12,24,48',
    clock: '28,42,73,77,65,34,28', home: '8,20,34,127,34,42,42', matrix: '85,0,85,0,85,0,85',
    thermo: '8,20,20,20,42,42,28', bell: '8,28,34,34,34,127,8', trash: '28,127,42,42,42,42,28',
    download: '8,8,42,28,8,0,127', upload: '127,0,8,28,42,8,8', eye: '0,28,34,73,34,28,0',
    edit: '2,7,14,28,56,96,64'
  };

  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const BIT = [16, 8, 4, 2, 1];
  const rows7 = s => s.split(',').map(Number).concat([0, 0]);
  const HEAD_ROWS = {};
  for (const k in RAW) HEAD_ROWS[k] = rows7(RAW[k]);
  const BODY_ROWS = {};
  // A body glyph is 5 columns wide unless its art is wider (the oe and ae ligatures are 7);
  // a wider one carries its width on the rows array as `n`.
  for (const k in LOWER) {
    const n = Math.max(...LOWER[k].map(r => r.length));
    const rows = Array.from({ length: 9 }, (_, r) =>
      [...(LOWER[k][r] || '')].reduce((m, p, j) => (p === '#' ? m | (1 << (n - 1 - j)) : m), 0));
    if (n !== 5) rows.n = n;
    BODY_ROWS[k] = rows;
  }
  const ICON = Object.create(null);
  for (const k in RAW_ICONS) ICON[k] = RAW_ICONS[k].split(',').map(Number);

  /* ------------------------------------------------------------------
   * Accents are built, not drawn: normalize('NFD') splits a letter into
   * its base and marks, and each mark is two 5-bit rows centred on
   * column 2. Over a lowercase letter the mark stays one row clear of it,
   * its lower row on row 0 in place of the dot of i and j (a one-row mark
   * sits there alone). Over a capital it takes the two rows above the
   * glyph, in the space between lines, so capitals keep their full height.
   * The cedilla takes rows 7-8, below the capitals font's cell too.
   * ------------------------------------------------------------------ */
  const MARKS = {
    '\u0300': [8, 4],     // grave       .#... ..#..
    '\u0301': [2, 4],     // acute       ...#. ..#..
    '\u0302': [4, 10],    // circumflex  ..#.. .#.#.
    '\u0303': [13, 18],   // tilde       .##.# #..#.
    '\u0308': [10, 0],    // diaeresis   .#.#. .....
    '\u0327': [4, 8]      // cedilla     ..#.. .#...  (below the letter)
  };
  /* Stand-ins for characters the fonts lack, tried before the character's
   * compatibility form (NFKD: a ligature becomes its letters, a superscript
   * its digit). Anything still missing draws MISSING, a box, painted in the
   * error colour when the page sets --dot-check. */
  const ALIAS = {
    '\u2010': '-', '\u2011': '-', '\u2012': '\u2013', '\u2015': '\u2014', '\u2212': '-',
    '\u2032': "'", '\u2033': '"', '\u2044': '/', '\u00a9': '(C)', '\u00ae': '(R)'
  };
  const MISSING = rows7('31,17,17,17,17,17,31');
  const EMPTY = rows7('0,0,0,0,0,0,0'), NO_TOP = [0, 0];

  /** A character's rows if the fonts draw it as is: the body font's own art, else the capitals. */
  function drawn(ch, font) {
    if (font === 'body' && has(BODY_ROWS, ch)) return BODY_ROWS[ch];
    if (has(HEAD_ROWS, ch)) return HEAD_ROWS[ch];
    const c = ch.toUpperCase();
    return has(HEAD_ROWS, c) ? HEAD_ROWS[c] : null;
  }
  function build(ch, font) {
    if (ch === ' ' || ch === '\u00a0') return { rows: EMPTY, top: NO_TOP, x0: 0, w: 2, n: 5, miss: false };
    if (ch === '\u202f') return { rows: EMPTY, top: NO_TOP, x0: 0, w: 1, n: 5, miss: false };   // narrow no-break space
    let rows = drawn(ch, font), top = NO_TOP, miss = false;
    if (!rows) {
      const d = ch.normalize('NFD'), base = d.length > 1 && drawn(d[0], font);
      if (base) {
        // Centre a narrow letter (i) under its marks.
        const bm = base.reduce((a, r) => a | r, 0);
        let lo = 0, hi = 4;
        while (lo < 4 && !(bm & BIT[lo])) lo++;
        while (hi > 0 && !(bm & BIT[hi])) hi--;
        const sh = (4 - lo - hi) >> 1;
        rows = base.map(r => (sh >= 0 ? r >> sh : (r << -sh) & 31));
        // A lowercase letter with nothing in rows 0-1 but the dot of i or j.
        const low = font === 'body' && has(BODY_ROWS, d[0]) && (/[ij]/.test(d[0]) || !(base[0] | base[1]));
        for (const mk of d.slice(1)) {
          const mr = has(MARKS, mk) ? MARKS[mk] : null;
          if (!mr) miss = true;
          else if (mk === '\u0327') { rows[7] |= mr[0]; rows[8] |= mr[1]; }
          else if (low) { rows[0] = mr[1] || mr[0]; top = mr[1] ? [0, mr[0]] : NO_TOP; }
          else top = mr;
        }
      } else { rows = MISSING; miss = true; }
    }
    const n = rows.n || 5, bit = j => 1 << (n - 1 - j);
    if (font === 'body' ? /^[0-9]$/.test(ch) : /^[\p{L}\p{N}]$/u.test(ch)) return { rows, top, x0: 0, w: n, n, miss };
    const m = rows.reduce((a, r) => a | r, top[0] | top[1]);
    if (!m) return { rows, top, x0: 0, w: 5, n, miss };
    let lo = 0, hi = n - 1;
    while (!(m & bit(lo))) lo++;
    while (!(m & bit(hi))) hi--;
    return { rows, top, x0: lo, w: hi - lo + 1, n, miss };
  }
  const GLYPHS = { head: new Map(), body: new Map() }, SPELT = { head: new Map(), body: new Map() };
  /**
   * One glyph of font 'head' or 'body': 9 row masks (n bits, leftmost highest; n is 5 but for the
   * ligatures), `top` (2 more rows above the cell, for accents), first used column, width, n, and
   * `miss` when the fonts lack the character (it then draws a box, or its base letter when only
   * the accent is unknown).
   */
  function glyph(ch, font = 'head') {
    font = font === 'body' ? 'body' : 'head';
    let g = GLYPHS[font].get(ch);
    if (!g) GLYPHS[font].set(ch, (g = build(ch, font)));
    return g;
  }
  /** The characters drawn for ch: itself, or stand-ins (ALIAS, then NFKD) when the fonts lack it. */
  function spell(ch, font) {
    const cache = SPELT[font === 'body' ? 'body' : 'head'];
    let s = cache.get(ch);
    if (!s) {
      s = [ch];
      if (glyph(ch, font).miss) {
        const alt = has(ALIAS, ch) ? ALIAS[ch] : ch.normalize('NFKD');
        if (alt !== ch) {
          const parts = [...alt].flatMap(c => spell(c, font));
          if (parts.every(c => !glyph(c, font).miss)) s = parts;
        }
      }
      cache.set(ch, s);
    }
    return s;
  }

  /**
   * chars [{ch, a}] -> columns [{m, t, a, x}]: bit y of m is row y, bit y of t is row y - 2 (an
   * accent over a capital), `a` marks accent text and `x` a character the fonts lack. One blank
   * column between glyphs.
   */
  function layout(chars, font = 'head') {
    const cols = [];
    let n = 0;
    for (const c of chars) {
      for (const ch of spell(c.ch, font)) {
        if (n++) cols.push({ m: 0, t: 0, a: false });
        const g = glyph(ch, font);
        for (let k = 0; k < g.w; k++) {
          const b = 1 << (g.n - 1 - g.x0 - k);
          let m = 0;
          for (let y = 0; y < 9; y++) if (g.rows[y] & b) m |= 1 << y;
          cols.push({ m, t: (g.top[0] & b ? 1 : 0) | (g.top[1] & b ? 2 : 0), a: !!c.a, x: g.miss });
        }
      }
    }
    return cols;
  }

  // One character per grapheme where the browser can tell, so an emoji draws one box, not several.
  const SEG = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
  const units = s => (SEG ? Array.from(SEG.segment(s), u => u.segment) : [...s]);
  // Soft hyphens, zero-width characters and variation selectors draw nothing.
  const INVISIBLE = /[\u00ad\u200b-\u200d\u2060\ufeff\ufe00-\ufe0f]/g;
  /**
   * Read light-DOM text; <em>, <mark>, <b>, <strong> become accent dots. Whitespace collapses,
   * except no-break spaces, which keep the words either side on one line.
   */
  function charsFrom(node) {
    const raw = [];
    const walk = (n, a) => {
      for (const k of n.childNodes) {
        if (k.nodeType === 3) {
          for (let ch of units(k.data.normalize('NFC'))) {
            if (!(ch = ch.replace(INVISIBLE, ''))) continue;
            raw.push({ ch: ch !== '\u00a0' && ch !== '\u202f' && /\s/.test(ch) ? ' ' : ch, a });
          }
        } else if (k.nodeType === 1) walk(k, a || /^(EM|MARK|B|STRONG)$/.test(k.tagName));
      }
    };
    walk(node, false);
    const out = [];
    for (const c of raw) {
      if (c.ch === ' ' && (!out.length || out[out.length - 1].ch === ' ')) continue;
      out.push(c);
    }
    while (out.length && out[out.length - 1].ch === ' ') out.pop();
    return out;
  }
  const textChars = s => charsFrom({ childNodes: [document.createTextNode(s)] });
  /** A component's text: its `text` (or other named) attribute, or its light-DOM content. */
  const readChars = (el, a = 'text') => (el.hasAttribute(a) ? textChars(el.getAttribute(a)) : charsFrom(el));
  const SPACE = { ch: ' ', a: false };
  const splitWords = chars => {
    const words = [[]];
    for (const c of chars) c.ch === ' ' ? words.push([]) : words[words.length - 1].push(c);
    return words.filter(w => w.length);
  };

  /** Split chars into lines no wider than max columns at scale k. A word wider than a line is broken. */
  function wrapLines(chars, max, font, k) {
    const fits = cs => layout(cs, font).length * k <= max;
    const lines = [];
    let cur = [];
    for (let w of splitWords(chars)) {
      const next = cur.length ? [...cur, SPACE, ...w] : w;
      if (fits(next)) { cur = next; continue; }
      if (cur.length) lines.push(cur);
      while (w.length > 1 && !fits(w)) {
        let n = w.length - 1;
        while (n > 1 && !fits(w.slice(0, n))) n--;
        lines.push(w.slice(0, n));
        w = w.slice(n);
      }
      cur = w;
    }
    if (cur.length) lines.push(cur);
    return lines;
  }

  /* ------------------------------------------------------------------
   * The grid. One pitch for the whole page, in whole device pixels:
   * pitch = max(3, round(target * devicePixelRatio)), target 2 CSS px.
   * Dots are rounded squares filling 65% of the pitch; unlit dots show at
   * 12% of the text colour. :root may override --dot-target (CSS px),
   * --dot-fill and --dot-unlit (0-1 or %), then call Dotmatrix.refresh().
   * --dot-check: 1 paints characters the fonts lack in the error colour.
   * ------------------------------------------------------------------ */
  const G = { dpr: 0, pdp: 0, pcss: 0, dot: 0, unlit: -1, check: 0 };
  const reg = new Set();        // painted components
  const surfaces = new Set();   // <dot-matrix> and <dot-app>
  const sprites = new Map();    // colour -> one lit dot, pdp x pdp
  const tiles = new Map();      // colour -> unlit-dot background tile

  function readLook() {
    const cs = getComputedStyle(document.documentElement);
    const n = (name, d, lo, hi) => {
      const s = cs.getPropertyValue(name).trim();
      let v = parseFloat(s);
      if (s.endsWith('%')) v /= 100;
      return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;
    };
    return { target: n('--dot-target', 2, 1, 16), fill: n('--dot-fill', 0.65, 0.2, 1), unlit: n('--dot-unlit', 0.12, 0, 1),
      check: n('--dot-check', 0, 0, 1) };
  }

  function updatePitch() {
    const look = readLook(), dpr = window.devicePixelRatio || 1;
    const pdp = Math.max(3, Math.round(look.target * dpr));
    const dot = Math.max(1, Math.min(pdp, Math.round(pdp * look.fill)));
    if (pdp === G.pdp && dpr === G.dpr && dot === G.dot && look.unlit === G.unlit && look.check === G.check) return;
    Object.assign(G, { dpr, pdp, pcss: pdp / dpr, dot, unlit: look.unlit, check: look.check });
    document.documentElement.style.setProperty('--dot-pitch', G.pcss + 'px');
    sprites.clear();
    tiles.clear();
    for (const s of surfaces) s._skin();
    for (const el of reg) el._dirty = true;
    schedule();
  }

  /* Colours: any CSS colour, normalised through a canvas so it can be mixed. */
  const cx = document.createElement('canvas').getContext('2d');
  function rgb(s, d) {
    for (const v of [s, d]) {
      if (!v) continue;
      cx.fillStyle = '#010203';
      cx.fillStyle = v;
      const n = cx.fillStyle;
      if (n === '#010203' && v.toLowerCase() !== '#010203') continue;   // did not parse
      if (n[0] === '#') return [1, 3, 5].map(i => parseInt(n.slice(i, i + 2), 16));
      const m = n.match(/[\d.]+/g);
      return [+m[0], +m[1], +m[2]];
    }
    return [0, 0, 0];
  }
  const hex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => a.map((v, i) => v * t + b[i] * (1 - t));

  // Colour roles a component paints with: an index into its palette.
  const FG = 1, MUTED = 2, DIM = 3, ACCENT = 4, ACCENT_DIM = 5, OK = 6, WARN = 7, ERR = 8, BLANK = 9, TONE = 10,
    TONE_DIM = 11, ACCENT_MID = 12;
  /** Palette from the element's --dot-* properties. TONE is its tone colour, or the text colour. */
  function paletteOf(el) {
    const cs = getComputedStyle(el), v = n => cs.getPropertyValue(n).trim();
    const bg = rgb(v('--dot-bg'), '#000000'), fg = rgb(v('--dot-fg'), '#F2F2EE'), ac = rgb(v('--dot-accent'), '#FF2E2E');
    const t = v('--_t'), tone = t ? rgb(t, '#F2F2EE') : fg;
    return [null, fg, mix(fg, bg, 0.62), mix(fg, bg, 0.3), ac, mix(ac, bg, 0.3),
      rgb(v('--dot-ok'), '#2BE36F'), rgb(v('--dot-warn'), '#FFB01F'), rgb(v('--dot-err'), '#FF2E2E'),
      bg, tone, mix(tone, bg, 0.3), mix(ac, bg, 0.55)].map(c => c && hex(c));
  }

  function dotShape(g, x, y) {
    const d = G.dot, o = Math.floor((G.pdp - d) / 2);
    g.beginPath();
    if (g.roundRect) g.roundRect(x + o, y + o, d, d, Math.max(0.5, d * 0.3));
    else g.rect(x + o, y + o, d, d);
    g.fill();
  }
  function sprite(col) {
    let s = sprites.get(col);
    if (!s) {
      s = document.createElement('canvas');
      s.width = s.height = G.pdp;
      const g = s.getContext('2d');
      g.fillStyle = col;
      dotShape(g, 0, 0);
      sprites.set(col, s);
    }
    return s;
  }
  // The unlit grid is a CSS background. One tile holds 32 x 32 dots, so at a
  // fractional CSS pitch the browser's rounding cannot drift across the page.
  const TILE = 32;
  function tileURL(col) {
    let url = tiles.get(col);
    if (!url) {
      const c = document.createElement('canvas');
      c.width = c.height = TILE * G.pdp;
      const g = c.getContext('2d');
      g.fillStyle = col;
      for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) dotShape(g, x * G.pdp, y * G.pdp);
      url = c.toDataURL('image/png');
      tiles.set(col, url);
    }
    return url;
  }

  /**
   * A component's dots: one colour index per dot (0 = unlit), drawn in dot units. It reaches
   * REACH rows above and below the w x h box, for marks outside a line's rows (an accent over a
   * capital, a cedilla under the capitals font: 2 rows at up to x4); the canvas grows to show them.
   */
  const REACH = 8;
  class Painter {
    constructor(w, h) {
      this.w = Math.max(0, w | 0);
      this.h = Math.max(0, h | 0);
      this.fb = new Uint8Array(this.w * (this.h + 2 * REACH));
      this.clip();
    }
    /** Limit drawing to a rectangle of dots; with no arguments, to everything the painter reaches. */
    clip(x = 0, y = -REACH, w = this.w, h = this.h + 2 * REACH) {
      this._cl = [Math.max(0, x), Math.max(-REACH, y), Math.min(this.w, x + w), Math.min(this.h + REACH, y + h)];
    }
    set(x, y, c) { const b = this._cl; if (x >= b[0] && y >= b[1] && x < b[2] && y < b[3]) this.fb[(y + REACH) * this.w + x] = c; }
    rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); }
    /** Columns from layout() at scale k; accent columns use colour ca. */
    text(cols, x, y, k, c, ca = ACCENT) {
      cols.forEach((col, i) => {
        if (!col.m && !col.t) return;
        const ink = col.x && G.check ? ERR : col.a ? ca : c;
        for (let r = 0; r < 9; r++) if (col.m & (1 << r)) this.rect(x + i * k, y + r * k, k, k, ink);
        for (let r = 0; r < 2; r++) if (col.t & (1 << r)) this.rect(x + i * k, y + (r - 2) * k, k, k, ink);
      });
    }
    /** A 7x7 icon at scale k; flip draws it upside down. Unknown names draw `info`. */
    icon(name, x, y, c, k = 1, flip = false) {
      const rows = ICON[name] || ICON.info;
      rows.forEach((row, r) => {
        const ry = flip ? 6 - r : r;
        for (let j = 0; j < 7; j++) if ((row >> (6 - j)) & 1) this.rect(x + j * k, y + ry * k, k, k, c);
      });
    }
    /* Rounded rectangles in dots, the corners sampled at dot centres. */
    _insets(w, h, r) {
      r = Math.min(r, Math.floor(h / 2), Math.floor(w / 2));
      const a = [];
      for (let i = 0; i < h; i++) {
        const t = Math.min(i, h - 1 - i), d = r - t - 0.5;
        a.push(t < r ? Math.round(r - Math.sqrt(r * r - d * d)) : 0);
      }
      return a;
    }
    fillRound(x, y, w, h, r, c) {
      const a = this._insets(w, h, r);
      for (let i = 0; i < h; i++) for (let j = a[i]; j < w - a[i]; j++) this.set(x + j, y + i, c);
    }
    strokeRound(x, y, w, h, r, c) {
      const a = this._insets(w, h, r), inside = (i, j) => i >= 0 && i < h && j >= a[i] && j < w - a[i];
      for (let i = 0; i < h; i++) {
        for (let j = a[i]; j < w - a[i]; j++) {
          if (j === a[i] || j === w - 1 - a[i] || !inside(i - 1, j) || !inside(i + 1, j)) this.set(x + j, y + i, c);
        }
      }
    }
    dotted(x, y, w, c) { for (let j = 0; j < w; j += 2) this.set(x + j, y, c); }
  }

  /** Paint p onto canvas cv: the box, plus any rows lit above or below it. Returns the rows it starts above the box. */
  function blit(cv, p, pal) {
    const w = p.w, fb = p.fb;
    let r0 = REACH, r1 = REACH + p.h;   // painter rows shown
    for (let i = 0; i < REACH * w; i++) if (fb[i]) { r0 = (i / w) | 0; break; }
    for (let i = fb.length - 1; i >= (REACH + p.h) * w; i--) if (fb[i]) { r1 = ((i / w) | 0) + 1; break; }
    const W = w * G.pdp, H = (r1 - r0) * G.pdp;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    cv.style.width = W / G.dpr + 'px';
    cv.style.height = H / G.dpr + 'px';
    if (!W || !H) return 0;
    const g = cv.getContext('2d'), seen = [];
    g.clearRect(0, 0, W, H);
    for (let i = r0 * w; i < r1 * w; i++) {
      const c = fb[i];
      if (!c) continue;
      g.drawImage(seen[c] || (seen[c] = sprite(pal[c])), (i % w) * G.pdp, (((i / w) | 0) - r0) * G.pdp);
    }
    return REACH - r0;
  }

  /** Nearest <dot-matrix>/<dot-app> around el, crossing shadow roots. */
  function surfaceOf(el) {
    let n = el;
    while ((n = n.parentNode || n.host)) if (n._isSurface) return n;
    return null;
  }

  /* ------------------------------------------------------------------
   * Layout pass, once per frame when anything may have moved. Each
   * component lays out its dots for the width it has, sizes its box in
   * whole dots, and places its canvas on the first grid dot at or after
   * its top-left corner, so every component shares its surface's grid.
   * ------------------------------------------------------------------ */
  let raf = 0;
  function schedule() { if (!raf) raf = requestAnimationFrame(flush); }
  const ro = new ResizeObserver(schedule);

  function flush() {
    raf = 0;
    if (!reg.size) return;
    const P = G.pdp, dpr = G.dpr;
    const origins = () => {
      const seen = new Map();
      return s => {
        let o = seen.get(s);
        if (!o) {
          if (s) { const r = s.getBoundingClientRect(); o = [Math.round(r.left * dpr), Math.round(r.top * dpr)]; }
          else o = [Math.round(-scrollX * dpr), Math.round(-scrollY * dpr)];
          seen.set(s, o);
        }
        return o;
      };
    };
    const snap = (v, o) => o + Math.ceil((v - o) / P - 1e-3) * P;   // device px

    // 1. Read: the whole dots each box has across (x and width do not depend on the heights set next).
    const oA = origins();
    const items = [...reg].map(el => {
      const s = surfaceOf(el), r = el._box.getBoundingClientRect(), x = r.left * dpr;
      return { el, s, wd: Math.max(0, Math.floor((x + r.width * dpr - snap(x, oA(s)[0])) / P + 1e-3)) };
    });
    // 2. Write: lay out content and size each box in whole dots.
    const resize = (el, wd, sz) => {
      el._wd = wd;
      el._dirty = true;
      el._sz = sz;
      const h = sz.h * P / dpr + 'px';
      if (el._box.style.height !== h) el._box.style.height = h;
      if (el._inline) { const w = sz.w * P / dpr + 'px'; if (el._box.style.width !== w) el._box.style.width = w; }
    };
    const late = [];
    for (const it of items) {
      const el = it.el;
      if (el._late) { late.push(it); continue; }
      // An inline component sizes itself, so the width it is given does not matter.
      if (!el._dirty && (el._inline || it.wd === el._wd)) continue;
      resize(el, it.wd, el._measure(it.wd));
    }
    // 2b. A frame (panel) measures the content sized above, so it goes last and never draws the
    // content's old height. Read every frame, then write; its own box is out of flow.
    late.map(it => it.el._measure(it.wd)).forEach((sz, i) => {
      const it = late[i], el = it.el;
      if (el._dirty || it.wd !== el._wd || sz.h !== el._sz.h) resize(el, it.wd, sz);
    });
    // 3. Read again (heights may have moved things), then place canvases on the grid and paint.
    const oB = origins();
    const places = items.map(it => {
      const r = it.el._box.getBoundingClientRect(), o = oB(it.s), x = r.left * dpr, y = r.top * dpr;
      return [(snap(x, o[0]) - x) / dpr, (snap(y, o[1]) - y) / dpr];
    });
    items.forEach((it, i) => {
      const el = it.el, [lx, ly] = places[i];
      if (lx !== el._lx || ly !== el._ly) {
        el._lx = lx;
        el._ly = ly;
        el._cv.style.left = lx + 'px';
        el._cv.style.top = ly - el._over * G.pcss + 'px';
        if (el._moved) el._moved();
      }
      if (el._dirty) { el._dirty = false; el._paint(); }
    });
  }

  let started = false, dprQuery = null;
  function onResize() { updatePitch(); schedule(); }
  function watchDpr() {
    if (dprQuery) dprQuery.removeEventListener('change', onDpr);
    dprQuery = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    dprQuery.addEventListener('change', onDpr);
  }
  function onDpr() { watchDpr(); onResize(); }
  function start() {
    if (started) return;
    started = true;
    updatePitch();
    // Anything that can move a component: DOM changes, page size, window size, zoom.
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });
    ro.observe(document.documentElement);
    addEventListener('resize', onResize);
    watchDpr();
  }

  /* ------------------------------------------------------------------
   * Animation: blinking LEDs, loading buttons, carets and scrolling text
   * share one clock that runs on animation frames. Each animated
   * component returns a frame number from _frame(now), and a new number
   * repaints it in the same frame. With reduced motion they draw a
   * still frame.
   * ------------------------------------------------------------------ */
  const motionOff = matchMedia('(prefers-reduced-motion: reduce)');
  const anim = new Set();
  let animT = 0;
  function tick() {
    animT = anim.size ? requestAnimationFrame(tick) : 0;
    // performance.now(), not the frame time: _frame() compares it with times taken in event handlers.
    const now = performance.now();
    let changed = false;
    for (const el of anim) {
      const f = el._frame(now);
      if (f !== el._f) { el._f = f; el._dirty = true; changed = true; }
    }
    if (changed) { cancelAnimationFrame(raf); flush(); }
  }
  function animate(el, on) {
    if (on && el.isConnected) anim.add(el);
    else if (anim.delete(el)) { el._f = 0; el._dirty = true; schedule(); }
    if (anim.size && !animT) animT = requestAnimationFrame(tick);
  }
  // Switching reduced motion on or off redraws everything at once (the marquee also changes shape).
  motionOff.addEventListener('change', () => { for (const el of reg) el.invalidate(); });

  /* Helpers for the components. */
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const decimals = s => { const t = String(s), i = t.indexOf('.'); return i < 0 ? 0 : t.length - i - 1; };
  const fire = (el, type) => el.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
  /** CSS px -> whole dots at the current pitch: touch targets and padding stay fixed in CSS px. */
  const px = n => Math.max(1, Math.round(n / (G.pcss || 2)));
  const odd = n => (n % 2 ? n : n + 1);
  /** A string's columns in font 'body' (default) or 'head'. */
  const colsOf = (s, font = 'body') => layout(textChars(s || ''), font);
  const FOCUS = 'outline:2px solid var(--dot-accent,#FF2E2E);outline-offset:3px';
  // Grows a control's hit area to 44 CSS px tall without moving its dots.
  const HIT = 'content:"";position:absolute;left:0;right:0;top:calc(50% - 22px);bottom:calc(50% - 22px)';

  /* ------------------------------------------------------------------
   * The house theme: dark only. <dot-app> applies it, or call
   * Dotmatrix.theme(). It sits in @layer dotmatrix, so any unlayered page
   * style overrides it. Every --dot-* property also has a fallback in code.
   * ------------------------------------------------------------------ */
  const THEME_CSS = `@layer dotmatrix{
    :root{color-scheme:dark;--dot-bg:#000000;--dot-fg:#ffffff;--dot-accent:#FF2E2E;
      --dot-ok:#2BE36F;--dot-warn:#FFB01F;--dot-err:#FF2E2E}
    html,body{background:var(--dot-bg)}
    body{margin:0}
  }`;
  /** Add a stylesheet to the page itself, outside every shadow root. */
  function addSheet(css) {
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    } catch (e) {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.append(style);
    }
  }
  let themed = false;
  /** Apply the house palette and page background. Safe to call more than once. */
  function theme() {
    if (themed) return;
    themed = true;
    addSheet(THEME_CSS);
    for (const s of surfaces) s._skin();
    for (const el of reg) el._dirty = true;
    schedule();
  }

  const SR = 'position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0';
  const define = (name, cls) => { if (!customElements.get(name)) customElements.define(name, cls); };

  /** Status tones. A component's tone attribute sets --_t; --_t:initial stops it leaking into nested components. */
  const TONES = {
    accent: 'var(--dot-accent,#FF2E2E)', ok: 'var(--dot-ok,#2BE36F)',
    warn: 'var(--dot-warn,#FFB01F)', err: 'var(--dot-err,#FF2E2E)'
  };
  const HOST_TONES = ':host{--_t:initial}' +
    Object.keys(TONES).map(k => `:host([tone=${k}]){--_t:${TONES[k]}}`).join('') +
    `:host([accent]){--_t:${TONES.accent}}`;

  /* ==================================================================
   * Surfaces: <dot-matrix> is a black area showing the unlit grid, and
   * the grid every component inside it snaps to. <dot-app> is the
   * full-page one, with the centred column layout.
   * ================================================================== */
  const SURFACE_CSS = `
    :host{display:block;position:relative;background-color:var(--dot-bg,#000);
      background-origin:border-box;background-repeat:repeat;image-rendering:pixelated}
    :host([hidden]){display:none}
  `;
  class DotMatrix extends HTMLElement {
    constructor() {
      super();
      this._isSurface = true;
      const C = this.constructor;
      this.attachShadow({ mode: 'open' }).innerHTML =
        `<style>${SURFACE_CSS}${C.css || ''}</style><style class="skin"></style>${C.tpl || '<slot></slot>'}`;
      this._skinEl = this.shadowRoot.querySelector('.skin');
    }
    connectedCallback() { surfaces.add(this); start(); this._skin(); schedule(); }
    disconnectedCallback() { surfaces.delete(this); }
    /** Draw the unlit grid in this surface's colours. Call after changing its --dot-fg or --dot-bg. */
    _skin() {
      if (!G.pdp) return;
      const cs = getComputedStyle(this), v = n => cs.getPropertyValue(n).trim();
      const bg = rgb(v('--dot-bg'), '#000000'), fg = rgb(v('--dot-fg'), '#F2F2EE');
      const size = TILE * G.pcss + 'px';
      this._skinEl.textContent = G.unlit > 0
        ? `:host{background-image:url(${tileURL(hex(mix(fg, bg, G.unlit)))});background-size:${size} ${size}}`
        : '';
    }
  }

  const APP_CSS = `
    :host{box-sizing:border-box;min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;
      gap:calc(var(--dot-pitch,2px) * 12);--dot-width:1080px;
      padding-top:calc(var(--dot-pitch,2px) * 12 + env(safe-area-inset-top,0px));
      padding-bottom:calc(var(--dot-pitch,2px) * 24 + env(safe-area-inset-bottom,0px));
      padding-left:max(16px,env(safe-area-inset-left,0px));
      padding-right:max(16px,env(safe-area-inset-right,0px))}
    ::slotted(*){box-sizing:border-box;width:100%;max-width:var(--dot-width);margin-inline:auto}
    ::slotted(dot-bar){width:auto;max-width:none;
      margin-left:calc(-1 * max(16px,env(safe-area-inset-left,0px)));
      margin-right:calc(-1 * max(16px,env(safe-area-inset-right,0px)))}
    ::slotted(dot-bar:first-child){margin-top:calc(-12 * var(--dot-pitch,2px) - env(safe-area-inset-top,0px))}
  `;
  class DotApp extends DotMatrix {
    static css = APP_CSS;
    connectedCallback() { theme(); super.connectedCallback(); }
  }

  /* ==================================================================
   * Painted components share this base. Each has a .box sized in whole
   * dots and a canvas inside it that the layout pass snaps to the grid.
   * Subclasses implement _measure(dotsAcross) -> {w, h} and _draw(painter).
   * ================================================================== */
  const BOX = '<div class="box" part="dots"><canvas aria-hidden="true"></canvas></div>';
  const BASE_CSS = `
    :host{display:block;position:relative}
    :host([hidden]){display:none}
    .box{position:relative;height:0}
    canvas{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none}
    .sr{${SR}}
  `;
  class DotElement extends HTMLElement {
    constructor() {
      super();
      const C = this.constructor;
      this.attachShadow({ mode: 'open', delegatesFocus: !!C.delegatesFocus }).innerHTML =
        `<style>${BASE_CSS}${HOST_TONES}${C.css || ''}</style>${C.tpl || BOX}`;
      this._box = this.shadowRoot.querySelector('.box');
      this._cv = this._box.querySelector('canvas');
      this._dirty = true;
      this._wd = -1;
      this._sz = { w: 0, h: 0 };
      this._over = 0;   // rows the canvas starts above the box
    }
    $(sel) { return this.shadowRoot.querySelector(sel); }
    connectedCallback() { reg.add(this); start(); ro.observe(this); this.invalidate(); }
    disconnectedCallback() { reg.delete(this); ro.unobserve(this); animate(this, false); }
    attributeChangedCallback() { this.invalidate(); }
    /** Redraw on the next frame. */
    render() { this.invalidate(); }
    invalidate() {
      if (this._sync) this._sync();
      this._dirty = true;
      schedule();
    }
    _measure() { return { w: 0, h: 0 }; }
    _draw() {}
    _paint() {
      const p = new Painter(this._sz.w, this._sz.h);
      this._draw(p);
      this._over = blit(this._cv, p, paletteOf(this));
      this._cv.style.top = (this._ly || 0) - this._over * G.pcss + 'px';
    }
  }

  /** A painted component whose text comes from an attribute (static textAttr, default `text`) or its light DOM. */
  class DotTextual extends DotElement {
    constructor() { super(); this._mo = new MutationObserver(() => this.invalidate()); this._chars = []; }
    connectedCallback() { this._mo.observe(this, { childList: true, characterData: true, subtree: true }); super.connectedCallback(); }
    disconnectedCallback() { this._mo.disconnect(); super.disconnectedCallback(); }
    _sync() {
      this._chars = readChars(this, this.constructor.textAttr);
      this.$('.sr').textContent = this._chars.map(c => c.ch).join('');
    }
  }

  /* ==================================================================
   * <dot-heading>: the capitals font at x1 (s), x2 (m, default), x3 (l)
   * or x4 (xl). Wraps at word boundaries; when its longest word does not
   * fit the width, it steps down a size instead of breaking the word.
   * ================================================================== */
  const HEAD_SCALE = { s: 1, m: 2, l: 3, xl: 4 };
  class DotHeading extends DotTextual {
    static observedAttributes = ['text', 'level', 'size', 'tone', 'accent'];
    static tpl = `<div class="h" role="heading" aria-level="2" part="heading"><span class="sr"></span>${BOX}</div>`;
    _sync() {
      super._sync();
      const lv = Math.min(6, Math.max(1, parseInt(this.getAttribute('level'), 10) || 2));
      this.$('.h').setAttribute('aria-level', lv);
    }
    _measure(wd) {
      const longest = Math.max(0, ...splitWords(this._chars).map(w => layout(w, 'head').length));
      let k = HEAD_SCALE[this.getAttribute('size')] || 2;
      while (k > 1 && longest * k > wd) k--;
      this._k = k;
      this._lines = wd > 0 ? wrapLines(this._chars, wd, 'head', k).map(l => layout(l, 'head')) : [];
      const n = this._lines.length;
      return { w: Math.max(0, ...this._lines.map(l => l.length * k)), h: n ? (n * 10 - 3) * k : 0 };
    }
    _draw(p) {
      const k = this._k;
      this._lines.forEach((cols, i) => p.text(cols, 0, i * 10 * k, k, TONE));
    }
  }

  /* ==================================================================
   * <dot-text>: the mixed-case body font, wrapped to the width it has.
   * `muted` dims it for labels and notes; size="l" draws it at x2.
   * ================================================================== */
  class DotText extends DotTextual {
    static observedAttributes = ['text', 'size', 'tone', 'accent', 'muted'];
    static tpl = `<div class="t" part="text"><span class="sr"></span>${BOX}</div>`;
    _measure(wd) {
      const k = this._k = this.getAttribute('size') === 'l' ? 2 : 1;
      this._lines = wd > 0 ? wrapLines(this._chars, wd, 'body', k).map(l => layout(l, 'body')) : [];
      const n = this._lines.length;
      // 9 rows per line (7 + 2 for descenders), 3 rows between lines.
      return { w: Math.max(0, ...this._lines.map(l => l.length * k)), h: n ? (n * 12 - 3) * k : 0 };
    }
    _draw(p) {
      const k = this._k, c = this.hasAttribute('muted') ? MUTED : TONE;
      this._lines.forEach((cols, i) => p.text(cols, 0, i * 12 * k, k, c));
    }
  }

  /* ==================================================================
   * <dot-value>: a labelled readout. The value is in the capitals font
   * at x3 (size s: x2, l: x4) and steps down to fit; `unit` follows it
   * at half size, `note` sits below. Value from `value` or light DOM.
   * ================================================================== */
  const VALUE_SCALE = { s: 2, m: 3, l: 4 };
  class DotValue extends DotTextual {
    static textAttr = 'value';
    static observedAttributes = ['value', 'unit', 'label', 'note', 'size', 'tone', 'accent'];
    static tpl = `<div part="value"><span class="sr"></span>${BOX}</div>`;
    get value() { return this.getAttribute('value'); }
    set value(v) { this.setAttribute('value', v); }
    _sync() {
      super._sync();
      const a = n => (this.getAttribute(n) || '').trim(), unit = a('unit');
      const v = this._chars.map(c => c.ch).join('') + (unit ? ' ' + unit : '');
      this.$('.sr').textContent = [a('label'), v, a('note')].filter(Boolean).join(', ');
      this._labC = colsOf(a('label'));
      this._unitC = colsOf(unit);
      this._noteChars = textChars(a('note'));
    }
    _measure(wd) {
      const vc = this._vc = layout(this._chars, 'head'), uc = this._unitC;
      const width = k => vc.length * k + (uc.length ? k + uc.length * Math.max(1, k >> 1) : 0);
      let k = VALUE_SCALE[this.getAttribute('size')] || 3;
      while (k > 1 && width(k) > wd) k--;
      this._k = k;
      this._ku = Math.max(1, k >> 1);
      let y = this._labC.length ? 9 + px(6) : 0;
      this._vy = y;
      y += 7 * k;
      if (uc.some(c => c.m > 127)) y += 2 * this._ku;   // the unit has a descender
      this._note = wd > 0 && this._noteChars.length ? wrapLines(this._noteChars, wd, 'body', 1).map(l => layout(l, 'body')) : [];
      this._ny = y + px(8);
      if (this._note.length) y = this._ny + this._note.length * 12 - 3;
      return { w: wd, h: y };
    }
    _draw(p) {
      const k = this._k, ku = this._ku, y = this._vy;
      p.text(this._labC, 0, 0, 1, MUTED);
      p.text(this._vc, 0, y, k, TONE);
      p.text(this._unitC, this._vc.length * k + k, y + 7 * k - 7 * ku, ku, MUTED);
      this._note.forEach((cols, i) => p.text(cols, 0, this._ny + i * 12, 1, MUTED));
    }
  }

  /* ==================================================================
   * <dot-icon>: one 7x7 icon at x1 (size l: x2, xl: x3). With `label`
   * it is an image with that name; without, it is decoration.
   * ================================================================== */
  const ICON_SCALE = { l: 2, xl: 3 };
  class DotIcon extends DotElement {
    static observedAttributes = ['name', 'label', 'size', 'tone', 'accent'];
    static css = ':host{display:inline-block;vertical-align:middle}';
    static tpl = `<div class="i" part="icon">${BOX}</div>`;
    constructor() { super(); this._inline = true; }
    _sync() {
      const label = this.getAttribute('label'), i = this.$('.i');
      if (label) { i.setAttribute('role', 'img'); i.setAttribute('aria-label', label); i.removeAttribute('aria-hidden'); }
      else { i.removeAttribute('role'); i.removeAttribute('aria-label'); i.setAttribute('aria-hidden', 'true'); }
    }
    _measure() { const k = this._k = ICON_SCALE[this.getAttribute('size')] || 1; return { w: 7 * k, h: 7 * k }; }
    _draw(p) { p.icon(this.getAttribute('name'), 0, 0, TONE, this._k); }
  }

  /* ==================================================================
   * <dot-marquee>: text moving right to left through a framed window,
   * one dot per step, like a message on the panel. It starts at the
   * left, scrolls off, and comes back in from the right. Capitals at x2
   * (size s: x1, l: x3, xl: x4); font="body" uses the mixed-case font.
   * `speed` is in the font's own pixels per second (default 20), so the
   * text reads at the same pace at every size. `paused` holds it, and so
   * does a mouse over it. With reduced motion it stands still, wrapped.
   * ================================================================== */
  class DotMarquee extends DotTextual {
    static observedAttributes = ['text', 'size', 'font', 'speed', 'paused', 'tone', 'accent'];
    static tpl = `<div part="marquee"><span class="sr"></span>${BOX}</div>`;
    constructor() {
      super();
      this._pos = 0;    // dots travelled
      this._t = 0;      // time of the last frame; 0 while stopped
      this._step = 0;
      this.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') this._hover = true; });
      this.addEventListener('pointerleave', () => { this._hover = false; });
    }
    get speed() { return Math.min(500, Math.max(0, num(this.getAttribute('speed'), 20))); }
    set speed(v) { this.setAttribute('speed', v); }
    get paused() { return this.hasAttribute('paused'); }
    set paused(v) { this.toggleAttribute('paused', !!v); }
    _sync() {
      super._sync();
      this._font = this.getAttribute('font') === 'body' ? 'body' : 'head';
      this._cols = layout(this._chars, this._font);
      this._k = HEAD_SCALE[this.getAttribute('size')] || 2;
      this._rate = this.speed * this._k;   // dots per second
      const run = !motionOff.matches && !this.paused && this._rate > 0;
      if (!run) this._t = 0;
      animate(this, run);
    }
    _frame(now) {
      // A long gap (a hidden tab) counts as one short frame, so the text does not jump.
      if (this._t && !this._hover) this._pos += Math.min(100, now - this._t) * this._rate / 1000;
      this._t = now;
      return (this._step = Math.floor(this._pos));
    }
    _measure(wd) {
      const pad = this._pad = Math.max(2, px(8)), rows = this._font === 'body' ? 9 : 7, font = this._font;
      // Rows inside the frame above and below the text: room for an accent over a capital (2 rows
      // at its scale, clear of the frame) and, in the capitals font, a cedilla under it.
      const room = k => { const r = this._top = Math.max(pad, 2 * k + 1); return r + (font === 'body' ? pad : r); };
      let k = this._k;
      this._still = motionOff.matches;
      if (!this._still) { this._kd = k; return { w: wd, h: 2 + room(k) + rows * k }; }
      // Still: wrapped inside the frame, a size smaller if a word would not fit.
      const iw = Math.max(0, wd - 2 - 2 * pad);
      const longest = Math.max(0, ...splitWords(this._chars).map(w => layout(w, font).length));
      while (k > 1 && longest * k > iw) k--;
      this._kd = k;
      this._lines = iw > 0 ? wrapLines(this._chars, iw, font, k).map(l => layout(l, font)) : [];
      const n = this._lines.length, lh = (rows + 3) * k;
      return { w: wd, h: 2 + room(k) + Math.max(rows * k, n * lh - 3 * k) };
    }
    _draw(p) {
      const { w, h } = this._sz, pad = this._pad, k = this._kd, y = 1 + this._top;
      p.strokeRound(0, 0, w, h, 2, DIM);
      if (this._still) {
        const lh = (this._font === 'body' ? 12 : 10) * k;
        this._lines.forEach((cols, i) => p.text(cols, 1 + pad, y + i * lh, k, TONE));
        return;
      }
      // The window is inside the frame with one blank dot each side. The text starts as far
      // from the frame as it sits from the top, and comes back in once it has left.
      const L = 2, W = w - 4, cols = this._cols, n = cols.length, span = W + n * k;
      if (W <= 0 || !n) return;
      const m = (((this._step + W - (pad - 1)) % span) + span) % span;
      const x = L + W - m;
      // Only the columns in view, the ones on the edges clipped to the window.
      const i0 = Math.max(0, Math.floor((L - x) / k)), i1 = Math.min(n, Math.ceil((L + W - x) / k));
      p.clip(L, 0, W, h);
      p.text(cols.slice(i0, i1), x + i0 * k, y, k, TONE);
      p.clip();
    }
  }

  /* ==================================================================
   * <dot-button>: a pill of dots around a real <button>. Default is an
   * outline; primary a dim accent fill with an accent edge; ghost the
   * label alone. Pressed, it fills and knocks the label out. With an
   * icon and no text it is round, and its title names it. It is
   * form-associated: type="submit" or "reset" acts on its form.
   * ================================================================== */
  const BUTTON_H = { s: 32, m: 40, l: 52 };
  // Browsers submit a form on Enter only through a native submit button. When a form's first
  // submit button is a <dot-button>, Enter in one of the form's fields presses it instead.
  let enterReady = false;
  function readyEnter() {
    if (enterReady) return;
    enterReady = true;
    document.addEventListener('keydown', e => {
      const t = e.target;
      if (e.key !== 'Enter' || e.defaultPrevented || e.isComposing || !t || t.localName !== 'input' || !t.form) return;
      if (/^(button|submit|reset|image|checkbox|radio|file|color|range|hidden)$/.test(t.type)) return;
      const first = [...t.form.elements].find(el => el.type === 'submit' || el.type === 'image' ||
        (el.localName === 'dot-button' && el.getAttribute('type') === 'submit'));
      if (!first || first.localName !== 'dot-button') return;   // a native default button: the browser handles it
      e.preventDefault();
      if (!first.disabled && !first.loading) t.form.requestSubmit();
    });
  }
  class DotButton extends DotTextual {
    static textAttr = 'label';
    static delegatesFocus = true;
    static formAssociated = true;
    static observedAttributes = ['label', 'icon', 'title', 'variant', 'size', 'disabled', 'loading'];
    static css = `
      :host{display:inline-block;vertical-align:middle}
      button{all:unset;display:block;position:relative;cursor:pointer;border-radius:999px;
        touch-action:manipulation;-webkit-tap-highlight-color:transparent}
      button::before{${HIT}}
      button:focus-visible{${FOCUS}}
      button:disabled{cursor:default}
      :host([loading]) button{cursor:progress}
    `;
    static tpl = `<button part="button" type="button"><span class="sr"></span>${BOX}</button>`;
    constructor() {
      super();
      this._inline = true;
      this._int = this.attachInternals ? this.attachInternals() : null;
      readyEnter();
      // Registered first, so it can swallow clicks while disabled or loading.
      this.addEventListener('click', e => {
        if (this.disabled || this.loading) { e.preventDefault(); e.stopImmediatePropagation(); return; }
        const form = this._int && this._int.form, type = this.getAttribute('type');
        if (form && type === 'submit') form.requestSubmit();
        if (form && type === 'reset') form.reset();
      });
      const b = this._btn = this.$('button');
      const set = (k, v) => { if (this[k] !== v) { this[k] = v; this._dirty = true; schedule(); } };
      b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') set('_hover', true); });
      b.addEventListener('pointerleave', () => { set('_hover', false); set('_down', false); });
      b.addEventListener('pointerdown', e => { if (e.button === 0) set('_down', true); });
      for (const t of ['pointerup', 'pointercancel', 'keyup', 'blur']) b.addEventListener(t, () => set('_down', false));
      b.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') set('_down', true); });
    }
    get disabled() { return this.hasAttribute('disabled'); }
    set disabled(v) { this.toggleAttribute('disabled', !!v); }
    get loading() { return this.hasAttribute('loading'); }
    set loading(v) { this.toggleAttribute('loading', !!v); }
    get form() { return this._int ? this._int.form : null; }
    _sync() {
      super._sync();
      const text = this._chars.map(c => c.ch).join('');
      this.$('.sr').textContent = text || this.getAttribute('title') || this.getAttribute('icon') || '';
      this._btn.disabled = this.disabled;
      this._btn.setAttribute('aria-busy', String(this.loading));
      animate(this, this.loading && !this.disabled);
    }
    _frame(now) { return Math.floor(now / 200) % 3; }
    _measure() {
      // Odd heights centre the 7-row text; descenders still clear the edge.
      const H = this._H = odd(Math.max(13, px(BUTTON_H[this.getAttribute('size')] || 40)));
      const icon = this.getAttribute('icon'), cols = this._cols = layout(this._chars, 'body'), n = cols.length;
      this._cw = (icon ? 7 : 0) + (icon && n ? 4 : 0) + n;
      if (icon && !n) return { w: H, h: H };
      return { w: Math.max(this._cw, 11) + 2 * Math.max(5, Math.round(H * 0.45)), h: H };
    }
    _draw(p) {
      const { w, h } = this._sz, r = h >> 1, v = this.getAttribute('variant'), prim = v === 'primary';
      const dis = this.disabled, busy = this.loading && !dis;
      const down = this._down && !dis && !busy, hover = this._hover && !dis && !busy;
      let edge = v === 'ghost' ? 0 : prim ? ACCENT : FG, fill = prim ? ACCENT_DIM : 0, ink = FG;
      if (hover) fill = prim ? ACCENT_MID : DIM;
      if (down) { fill = prim ? ACCENT : FG; ink = BLANK; }
      if (dis) { edge = edge && DIM; fill = 0; ink = MUTED; }
      if (fill) p.fillRound(0, 0, w, h, r, fill);
      if (edge) p.strokeRound(0, 0, w, h, r, edge);
      const y = (h - 7) >> 1;
      if (busy) {
        // Three blocks in turn; a still row with reduced motion.
        const x0 = (w - 11) >> 1, f = motionOff.matches ? -1 : (this._f || 0);
        for (let i = 0; i < 3; i++) p.rect(x0 + i * 4, y + 2, 3, 3, f < 0 ? MUTED : i === f ? FG : DIM);
        return;
      }
      let x = (w - this._cw) >> 1;
      const icon = this.getAttribute('icon');
      if (icon) { p.icon(icon, x, y, ink); x += 11; }
      p.text(this._cols, x, y, 1, ink, down || dis ? ink : ACCENT);
    }
  }

  /* ==================================================================
   * <dot-slider>: label and value on one line, a rail below. The rail
   * is accent up to the thumb; variant="level" draws a rising bar graph
   * instead. role="slider" sits on a .track overlay 44 px tall. Fires
   * input while moving and change on release, like a native range.
   * ================================================================== */
  class DotSlider extends DotElement {
    static delegatesFocus = true;
    static formAssociated = true;
    static observedAttributes = ['min', 'max', 'step', 'value', 'label', 'unit', 'variant', 'disabled'];
    static css = `
      .track{position:absolute;left:0;right:0;cursor:pointer;outline:none;border-radius:999px;
        touch-action:pan-y;-webkit-tap-highlight-color:transparent}
      .track:focus-visible{${FOCUS}}
      :host([disabled]) .track{cursor:default}
    `;
    static tpl = '<div class="box" part="dots"><canvas aria-hidden="true"></canvas>' +
      '<div class="track" part="track" role="slider" tabindex="0" aria-orientation="horizontal"></div></div>';
    constructor() {
      super();
      this._int = this.attachInternals ? this.attachInternals() : null;
      this._v = null;   // the dirty value; null means "use the value attribute"
      const t = this._track = this.$('.track');
      t.addEventListener('pointerdown', e => {
        if (this.disabled || e.button !== 0) return;
        t.setPointerCapture(e.pointerId);
        this._drag = true;
        this._start = this.value;
        this._fromX(e.clientX);
        t.focus();
        e.preventDefault();
      });
      t.addEventListener('pointermove', e => { if (this._drag) this._fromX(e.clientX); });
      const end = () => {
        if (!this._drag) return;
        this._drag = false;
        if (this.value !== this._start) fire(this, 'change');
      };
      t.addEventListener('pointerup', end);
      t.addEventListener('pointercancel', end);
      t.addEventListener('keydown', e => {
        if (this.disabled) return;
        const { min, max, step } = this, s = step > 0 ? step : (max - min) / 100, big = Math.max(s, (max - min) / 10);
        let v = this.value;
        switch (e.key) {
          case 'ArrowRight': case 'ArrowUp': v += s; break;
          case 'ArrowLeft': case 'ArrowDown': v -= s; break;
          case 'PageUp': v += big; break;
          case 'PageDown': v -= big; break;
          case 'Home': v = min; break;
          case 'End': v = max; break;
          default: return;
        }
        e.preventDefault();
        const before = this.value;
        this._set(v, true);
        if (this.value !== before) fire(this, 'change');
      });
    }
    get min() { return num(this.getAttribute('min'), 0); }
    get max() { return Math.max(this.min, num(this.getAttribute('max'), 100)); }
    get step() { return num(this.getAttribute('step'), 1); }
    get value() { return this._v != null ? this._v : this._snap(num(this.getAttribute('value'), (this.min + this.max) / 2)); }
    set value(v) { this._set(v, false); }
    get disabled() { return this.hasAttribute('disabled'); }
    set disabled(v) { this.toggleAttribute('disabled', !!v); }
    get name() { return this.getAttribute('name'); }
    get form() { return this._int ? this._int.form : null; }
    attributeChangedCallback(name) {
      if (name === 'value' && !this._drag) this._v = null;
      if ((name === 'min' || name === 'max' || name === 'step') && this._v != null) this._v = this._snap(this._v);
      super.attributeChangedCallback();
    }
    formResetCallback() { this._v = null; this.invalidate(); }
    _snap(v) {
      const { min, max, step } = this;
      v = Math.min(max, Math.max(min, +v));
      if (step > 0) v = min + Math.round((v - min) / step) * step;
      return +Math.min(max, v).toFixed(step > 0 ? decimals(step) : 2);
    }
    _set(v, emit) {
      const nv = this._snap(v);
      if (nv === this.value && this._v != null) return;
      this._v = nv;
      this.invalidate();
      if (emit) fire(this, 'input');
    }
    _fromX(cx) {
      const r = this._cv.getBoundingClientRect(), P = G.pcss, span = (this._sz.w - this._thW) * P;
      const f = span > 0 ? (cx - r.left - this._thW * P / 2) / span : 0;
      this._set(this.min + Math.min(1, Math.max(0, f)) * (this.max - this.min), true);
    }
    _sync() {
      const { min, max, step } = this, v = this.value, t = this._track, label = this.getAttribute('label') || '';
      const text = v.toFixed(step > 0 ? decimals(step) : 0) + (this.getAttribute('unit') || '');
      t.setAttribute('aria-valuemin', min);
      t.setAttribute('aria-valuemax', max);
      t.setAttribute('aria-valuenow', v);
      t.setAttribute('aria-valuetext', text);
      t.setAttribute('aria-label', label || 'Slider');
      t.setAttribute('aria-disabled', String(this.disabled));
      t.tabIndex = this.disabled ? -1 : 0;
      if (this._int) this._int.setFormValue(String(v));
      this._labC = colsOf(label);
      this._valC = colsOf(text);
    }
    _measure(wd) {
      const top = this._top = 9 + px(10);
      let h, cy;
      if (this.getAttribute('variant') === 'level') {
        this._rows = Math.max(5, px(16));
        this._thW = 0;
        h = top + this._rows;
        cy = top + this._rows / 2;
      } else {
        this._rail = Math.max(1, px(4));
        this._ext = Math.max(2, px(6));
        this._thW = Math.max(2, px(6));
        h = top + 2 * this._ext + this._rail;
        cy = top + this._ext + this._rail / 2;
      }
      // The track is 44 px tall around the rail, but never covers the label line.
      const P = G.pcss, c = cy * P, t0 = Math.max(9 * P, c - 22);
      this._track.style.top = t0 + 'px';
      this._track.style.height = (c + 22 - t0) + 'px';
      return { w: wd, h };
    }
    _draw(p) {
      const w = this._sz.w, dis = this.disabled, { min, max } = this;
      const f = max > min ? (this.value - min) / (max - min) : 0, y = this._top;
      p.text(this._labC, 0, 0, 1, dis ? DIM : MUTED);
      p.text(this._valC, w - this._valC.length, 0, 1, dis ? MUTED : FG);
      if (!this._thW) {
        // Level: one column every other dot, rising left to right; the last lit one is white.
        const n = Math.max(2, (w + 1) >> 1), lit = Math.round(f * n), R = this._rows;
        for (let i = 0; i < n; i++) {
          const ch = 1 + Math.round(i / (n - 1) * (R - 1));
          p.rect(i * 2, y + R - ch, 1, ch, i >= lit ? DIM : dis ? MUTED : i === lit - 1 ? FG : ACCENT);
        }
        return;
      }
      const R = this._rail, E = this._ext, T = this._thW, tx = Math.round(f * (w - T)), ry = y + E;
      p.rect(0, ry, tx - 1, R, dis ? DIM : ACCENT);
      p.rect(tx + T + 1, ry, w - tx - T - 1, R, DIM);
      p.rect(tx, y, T, R + 2 * E, dis ? MUTED : FG);
    }
  }

  /* ==================================================================
   * <dot-toggle>: a switch row. Label on the left; On/Off and a pill
   * switch on the right. The whole row is one role="switch" button.
   * Form-associated like a checkbox: it submits `value` (default "on")
   * only while checked, and reports type "checkbox" so htmx does too.
   * ================================================================== */
  class DotToggle extends DotElement {
    static delegatesFocus = true;
    static formAssociated = true;
    static observedAttributes = ['checked', 'disabled', 'label', 'value'];
    static css = `
      button{all:unset;display:block;box-sizing:border-box;width:100%;position:relative;cursor:pointer;border-radius:2px;
        touch-action:manipulation;-webkit-tap-highlight-color:transparent}
      button::before{${HIT}}
      button:focus-visible{${FOCUS}}
      button:disabled{cursor:default}
    `;
    static tpl = `<button part="switch" type="button" role="switch">${BOX}</button>`;
    constructor() {
      super();
      this._int = this.attachInternals ? this.attachInternals() : null;
      this._c = null;   // the dirty state; null means "use the checked attribute"
      this._btn = this.$('button');
      this._btn.addEventListener('click', () => {
        if (this.disabled) return;
        this._c = !this.checked;
        this.invalidate();
        fire(this, 'input');
        fire(this, 'change');
      });
    }
    get checked() { return this._c != null ? this._c : this.hasAttribute('checked'); }
    set checked(v) { this._c = !!v; this.invalidate(); }
    get value() { return this.getAttribute('value') || 'on'; }
    set value(v) { this.setAttribute('value', v); }
    get type() { return 'checkbox'; }
    get disabled() { return this.hasAttribute('disabled'); }
    set disabled(v) { this.toggleAttribute('disabled', !!v); }
    get name() { return this.getAttribute('name'); }
    get form() { return this._int ? this._int.form : null; }
    attributeChangedCallback(name) {
      if (name === 'checked') this._c = null;
      super.attributeChangedCallback();
    }
    formResetCallback() { this._c = null; this.invalidate(); }
    _sync() {
      const on = this.checked, b = this._btn, label = this.getAttribute('label') || '';
      b.setAttribute('aria-checked', String(on));
      b.setAttribute('aria-label', label || 'Toggle');
      b.disabled = this.disabled;
      if (this._int) this._int.setFormValue(on ? this.value : null);
      this._labC = colsOf(label);
      this._word = colsOf(on ? 'On' : 'Off');
    }
    _measure(wd) {
      const th = this._th = Math.max(7, odd(px(22)));
      this._tw = Math.max(13, px(40));
      return { w: wd, h: Math.max(th, ((th - 7) >> 1) + 9) };   // room for label descenders
    }
    _draw(p) {
      const w = this._sz.w, th = this._th, tw = this._tw, on = this.checked, dis = this.disabled;
      const ly = (th - 7) >> 1, sx = w - tw, kd = th - 4;
      p.text(this._labC, 0, ly, 1, dis ? DIM : MUTED);
      p.strokeRound(sx, 0, tw, th, th >> 1, on && !dis ? ACCENT : DIM);
      p.fillRound(on ? sx + tw - 2 - kd : sx + 2, 2, kd, kd, kd >> 1, dis ? (on ? ACCENT_DIM : DIM) : on ? ACCENT : MUTED);
      p.text(this._word, sx - px(10) - this._word.length, ly, 1, dis ? DIM : on ? FG : MUTED);
    }
  }

  /* ==================================================================
   * <dot-input>: a text field in dots around a native <input> child.
   * The input stays in the page and does the real work (typing, IME,
   * selection, autofill, password managers, validation, form data), so
   * forms and htmx see it as they see any input. Its own text is hidden;
   * the dots draw the label, frame, text, caret and selection. Field
   * text is monospaced, one 6-dot cell per character, and the hidden
   * input's letter-spacing makes its characters the same width, so a
   * click puts the caret on the same character in both. `note` adds a
   * line below; a tone colours the frame and note.
   * ================================================================== */
  const MONO = 'ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono","DejaVu Sans Mono",monospace';
  const INPUT_EVENTS = ['input', 'change', 'focus', 'blur', 'select', 'keydown', 'keyup',
    'pointerdown', 'pointerup', 'pointermove', 'selectionchange', 'animationstart'];
  // Page rules a shadow root cannot reach: the native selection, autofill, and built-in buttons.
  const INPUT_PAGE_CSS = `
    dot-input > input::selection{background:transparent!important;color:transparent!important}
    dot-input > input:-webkit-autofill{animation:dot-autofill 1ms}
    @keyframes dot-autofill{from{opacity:1}to{opacity:1}}
    dot-input > input::-webkit-search-cancel-button{-webkit-appearance:none;display:none}
    dot-input > input::-webkit-inner-spin-button{-webkit-appearance:none;display:none}
  `;
  let monoAdv = 0, inputsReady = false;
  function readyInputs() {
    if (inputsReady) return;
    inputsReady = true;
    addSheet(INPUT_PAGE_CSS);
    // Some browsers report a caret move only on the document.
    document.addEventListener('selectionchange', () => {
      const a = document.activeElement, h = a && a.parentElement;
      if (h && h._poke) h._poke();
    });
    // Chrome hides a value it autofilled on load until the user first interacts with the page.
    const reveal = () => setTimeout(() => { for (const el of reg) if (el._st && el._st.auto) el._poke(); });
    addEventListener('pointerdown', reveal, true);
    addEventListener('keydown', reveal, true);
  }

  class DotInput extends DotElement {
    static observedAttributes = ['label', 'note', 'tone', 'accent'];
    static css = `
      canvas{z-index:1}
      .box{--_x:0px;--_y:0px;--_w:100%;--_h:44px;--_pl:0px;--_pr:0px;--_ls:0px}
      /* Measures the input font's character width; clipped so it never widens the page. */
      .mw{position:absolute;left:0;top:0;width:0;height:0;overflow:hidden;visibility:hidden}
      .m{white-space:pre;font:16px/1 ${MONO};letter-spacing:0}
      ::slotted(:not(input)){display:none!important}
      ::slotted(input){position:absolute!important;z-index:0!important;display:block!important;box-sizing:border-box!important;
        left:var(--_x)!important;top:var(--_y)!important;width:var(--_w)!important;height:var(--_h)!important;
        min-width:0!important;max-width:none!important;min-height:0!important;max-height:none!important;
        margin:0!important;padding:0 var(--_pr) 0 var(--_pl)!important;border:0!important;border-radius:0!important;
        outline:none!important;box-shadow:none!important;-webkit-appearance:none!important;appearance:none!important;
        background:transparent!important;color:transparent!important;-webkit-text-fill-color:transparent!important;
        caret-color:transparent!important;text-shadow:none!important;text-align:left!important;text-indent:0!important;
        text-transform:none!important;font:16px/1 ${MONO}!important;font-variant-ligatures:none!important;
        letter-spacing:var(--_ls)!important;word-spacing:0!important;cursor:text;
        transition:background-color 600000s 0s,color 600000s 0s!important}
      ::slotted(input:disabled){cursor:default}
    `;
    static tpl = '<div class="box" part="dots"><canvas aria-hidden="true"></canvas><slot></slot></div>' +
      `<div class="mw" aria-hidden="true"><span class="m">${'0'.repeat(50)}</span></div>`;
    constructor() {
      super();
      this._in = null;
      this._scroll = 0;   // first character shown, when the text is wider than the field
      this._t0 = 0;
      this._mine = {};    // ARIA attributes this component set on the input
      // Any change to the input: repaint, and restart the caret blink so it shows while typing.
      this._poke = () => { this._t0 = performance.now(); this._f = 0; this._dirty = true; schedule(); };
      this._onEv = e => { if (e.type !== 'pointermove' || e.buttons) this._poke(); };
      this._onReset = () => setTimeout(this._poke);
      this._lmo = new MutationObserver(() => this.invalidate());
      // The label and note are dots in the shadow root; a click there focuses the input.
      this.addEventListener('click', e => { if (e.target === this && this._in) this._in.focus(); });
      this.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { this._hover = true; this._poke(); } });
      this.addEventListener('pointerleave', () => { if (this._hover) { this._hover = false; this._poke(); } });
    }
    get value() { return this._in ? this._in.value : ''; }
    set value(v) { if (this._in) { this._in.value = v; this._poke(); } }
    focus(o) { if (this._in) this._in.focus(o); }
    connectedCallback() {
      readyInputs();
      this._lmo.observe(this, { childList: true, subtree: true, attributes: true,
        attributeFilter: ['type', 'placeholder', 'disabled', 'readonly', 'value'] });
      super.connectedCallback();
    }
    disconnectedCallback() { this._lmo.disconnect(); super.disconnectedCallback(); }
    _bind() {
      const inp = this.querySelector(':scope > input');
      if (inp === this._in) return;
      if (this._in) for (const t of INPUT_EVENTS) this._in.removeEventListener(t, this._onEv);
      if (this._form) this._form.removeEventListener('reset', this._onReset);
      this._in = inp;
      this._form = inp && inp.form;
      if (inp) for (const t of INPUT_EVENTS) inp.addEventListener(t, this._onEv);
      if (this._form) this._form.addEventListener('reset', this._onReset);
    }
    /** Name or describe the input from `label` or `note`, unless the page already did. */
    _aria(a, v) {
      const inp = this._in, mine = this._mine[a] === inp;
      if (!mine && (inp.hasAttribute(a) || (a === 'aria-label' &&
        ((inp.labels && inp.labels.length) || inp.hasAttribute('aria-labelledby'))))) return;
      if (v) { inp.setAttribute(a, v); this._mine[a] = inp; }
      else if (mine) { inp.removeAttribute(a); this._mine[a] = null; }
    }
    _sync() {
      this._bind();
      const label = this.getAttribute('label') || '', note = this.getAttribute('note') || '';
      this._labC = colsOf(label);
      this._noteChars = textChars(note);
      if (this._in) { this._aria('aria-label', label); this._aria('aria-description', note); }
    }
    _measure(wd) {
      const inp = this._in;
      const H = this._fh = odd(Math.max(13, px(44)));
      const pad = this._pad = Math.max(3, px(12));
      const fy = this._fy = this._labC.length ? 9 + px(6) : 0;
      const cells = this._cells = Math.max(1, Math.floor((wd - 2 * pad + 1) / 6));
      const st = this._st = { v: '', pw: false, dis: false, ro: false, on: false, s: 0, e: 0, c: 0, ph: '', auto: false };
      if (inp) {
        Object.assign(st, { v: inp.value, pw: inp.type === 'password', dis: inp.matches(':disabled'), ro: inp.readOnly,
          on: document.activeElement === inp, ph: inp.placeholder || '' });
        try { st.auto = inp.matches(':autofill'); } catch (e) {
          try { st.auto = inp.matches(':-webkit-autofill'); } catch (e2) { st.auto = false; }
        }
        // email and number inputs have no selection API: draw the caret at the end.
        let s = null, e = null, back = false;
        try { s = inp.selectionStart; e = inp.selectionEnd; back = inp.selectionDirection === 'backward'; } catch (x) { s = null; }
        if (s == null) s = e = st.v.length;
        Object.assign(st, { s, e, c: back ? s : e });
      }
      // Scroll in whole characters, just far enough to keep the caret in view.
      let sc = st.on ? Math.min(this._scroll, Math.max(0, st.v.length - cells)) : 0;
      if (st.c < sc) sc = st.c;
      if (st.c > sc + cells) sc = st.c - cells;
      this._scroll = sc;
      this._caret = st.on && st.s === st.e && !st.ro && !st.dis;
      animate(this, this._caret);
      this._note = wd > 0 && this._noteChars.length
        ? wrapLines(this._noteChars, wd, 'body', 1).map(l => layout(l, 'body')) : [];
      this._ny = fy + H + px(6);
      this._place(wd);
      return { w: wd, h: this._note.length ? this._ny + this._note.length * 12 - 3 : fy + H };
    }
    _frame(now) { return Math.floor((now - this._t0) / 500) % 2; }
    /** Lay the hidden input over the drawn field, its characters on the same 6-dot cells. */
    _place(wd = this._sz.w) {
      const inp = this._in;
      if (!inp) return;
      if (!monoAdv) { const r = this.$('.m').getBoundingClientRect().width / 50; if (r > 0) monoAdv = r; }
      const P = G.pcss, cell = 6 * P, b = this._box.style, set = (k, v) => b.setProperty(k, v + 'px');
      set('--_x', this._lx || 0);
      set('--_y', (this._ly || 0) + this._fy * P);
      set('--_w', wd * P);
      set('--_h', this._fh * P);
      // Character i's centre lands on the centre of dot cell i, and the visible text area is
      // exactly the drawn cells wide, so the input scrolls as far as the dots do.
      set('--_pl', (this._pad - 0.5) * P);
      set('--_pr', (wd - this._pad + 0.5 - this._cells * 6) * P);
      set('--_ls', cell - (monoAdv || 9.6));
      inp.scrollLeft = this._st && this._st.on ? this._scroll * cell : 0;
    }
    _moved() { this._place(); }
    _draw(p) {
      const st = this._st, w = this._sz.w, H = this._fh, fy = this._fy, pad = this._pad, sc = this._scroll;
      const toned = this.hasAttribute('tone') || this.hasAttribute('accent');
      p.text(this._labC, 0, 0, 1, st.dis ? DIM : MUTED);
      p.strokeRound(0, fy, w, H, 2, st.dis ? DIM : toned ? TONE : st.on ? ACCENT : this._hover ? FG : MUTED);
      const ty = fy + ((H - 7) >> 1), ink = st.dis ? MUTED : FG;
      if (!st.v.length) {
        // Chrome may not reveal an autofilled value yet; say the field is filled rather than look empty.
        const hint = st.auto ? colsOf('Filled by the browser') : colsOf(st.ph);
        p.text(hint.slice(0, this._cells * 6 - 1), pad, ty, 1, DIM);
      }
      const lo = Math.min(st.s, st.e), hi = Math.max(st.s, st.e), end = Math.min(st.v.length, sc + this._cells);
      for (let i = sc; i < end; i++) {
        const x = pad + (i - sc) * 6;
        // Selection and caret run from the accent rows over a capital to the bottom of the descenders.
        if (st.on && i >= lo && i < hi) p.rect(x - 1, ty - 2, 7, 11, DIM);
        if (st.pw) { p.rect(x + 1, ty + 2, 3, 3, ink); continue; }
        const cols = layout([{ ch: st.v[i], a: false }], 'body');
        p.text(cols, x + ((5 - cols.length) >> 1), ty, 1, ink);
      }
      if (this._caret && (!this._f || motionOff.matches)) p.rect(pad + (st.c - sc) * 6 - 1, ty - 2, 1, 11, FG);
      this._note.forEach((cols, i) => p.text(cols, 0, this._ny + i * 12, 1, toned ? TONE : MUTED));
    }
  }

  /* ==================================================================
   * <dot-led>: an indicator light (3x3 dots; size s: 1, l: 5) in its
   * tone, with optional text beside it. tone="off" draws it dim.
   * `blink` (or blink="fast") flashes it; `label` names it for readers.
   * ================================================================== */
  const LED_SIZE = { s: 1, m: 3, l: 5 };
  class DotLed extends DotTextual {
    static observedAttributes = ['text', 'label', 'tone', 'accent', 'blink', 'size'];
    static css = ':host{display:inline-block;vertical-align:middle}';
    static tpl = `<div part="led"><span class="sr"></span>${BOX}</div>`;
    constructor() { super(); this._inline = true; }
    _sync() {
      super._sync();
      const label = this.getAttribute('label');
      if (label) this.$('.sr').textContent = label;
      this._cols = layout(this._chars, 'body');
      animate(this, this.hasAttribute('blink'));
    }
    _frame(now) { return Math.floor(now / (this.getAttribute('blink') === 'fast' ? 200 : 500)) % 2; }
    _measure() {
      const s = this._s = LED_SIZE[this.getAttribute('size')] || 3, n = this._cols.length;
      return { w: s + (n ? 3 + n : 0), h: n ? 9 : 7 };
    }
    _draw(p) {
      const s = this._s, dark = this.getAttribute('tone') === 'off' || (this._f && !motionOff.matches);
      p.rect(0, (7 - s) >> 1, s, s, dark ? DIM : TONE);
      p.text(this._cols, s + 3, 0, 1, FG);
    }
  }

  /* ==================================================================
   * <dot-badge>: a short tag on a dim pill. With a tone, the pill and
   * text take that tone.
   * ================================================================== */
  class DotBadge extends DotTextual {
    static observedAttributes = ['text', 'tone', 'accent'];
    static css = ':host{display:inline-block;vertical-align:middle}';
    static tpl = `<div part="badge"><span class="sr"></span>${BOX}</div>`;
    constructor() { super(); this._inline = true; }
    _sync() {
      super._sync();
      this._cols = layout(this._chars, 'body');
      this._toned = this.hasAttribute('tone') || this.hasAttribute('accent');
    }
    _measure() { return { w: this._cols.length + 10, h: 11 }; }
    _draw(p) {
      const { w, h } = this._sz;
      p.fillRound(0, 0, w, h, 5, this._toned ? TONE_DIM : DIM);
      p.text(this._cols, 5, 2, 1, this._toned ? TONE : FG);
    }
  }

  /* ==================================================================
   * <dot-status>: connection state as a coloured light and word.
   * state = online | connecting | offline | error (unknown reads as
   * offline); `label` replaces the word. A role="status" live region.
   * ================================================================== */
  const STATES = {
    online: [OK, 'Online'], connecting: [WARN, 'Connecting'],
    offline: [MUTED, 'Offline'], error: [ERR, 'Error']
  };
  class DotStatus extends DotElement {
    static observedAttributes = ['state', 'label'];
    static css = ':host{display:inline-block;vertical-align:middle}';
    static tpl = `<div part="status" role="status"><span class="sr"></span>${BOX}</div>`;
    constructor() { super(); this._inline = true; }
    get state() { const s = this.getAttribute('state'); return has(STATES, s) ? s : 'offline'; }
    set state(v) { this.setAttribute('state', v); }
    _sync() {
      const text = this.getAttribute('label') || STATES[this.state][1];
      this.$('.sr').textContent = text;
      this._cols = colsOf(text);
      animate(this, this.state === 'connecting');
    }
    _frame(now) { return Math.floor(now / 500) % 2; }
    _measure() { return { w: 5 + this._cols.length, h: 9 }; }
    _draw(p) {
      const c = STATES[this.state][0];
      p.rect(0, 2, 3, 3, this._f && !motionOff.matches ? DIM : c);
      p.text(this._cols, 5, 0, 1, c);
    }
  }

  /* ==================================================================
   * <dot-rule>: a one-dot divider across the width it has. `dotted`
   * lights every other dot; a tone colours it.
   * ================================================================== */
  class DotRule extends DotElement {
    static observedAttributes = ['dotted', 'tone', 'accent'];
    static tpl = `<div role="separator" part="rule">${BOX}</div>`;
    _measure(wd) { return { w: wd, h: 1 }; }
    _draw(p) {
      const c = this.hasAttribute('tone') || this.hasAttribute('accent') ? TONE : DIM, w = this._sz.w;
      if (this.hasAttribute('dotted')) p.dotted(0, 0, w, c);
      else p.rect(0, 0, w, 1, c);
    }
  }

  /* ==================================================================
   * <dot-grid>: lays out its children in columns at least --dot-min
   * wide (cols="n" caps the count), or in a wrapping row with `row`.
   * Gaps are in dots, so they scale with the pitch.
   * ================================================================== */
  const GRID_CSS = `
    :host{display:grid;--_gap:var(--dot-gap,calc(var(--dot-pitch,2px) * 8));gap:var(--_gap);
      --_min:min(100%,var(--dot-min,140px));grid-template-columns:repeat(auto-fit,minmax(var(--_min),1fr))}
    :host([hidden]){display:none}
    :host([cols]){grid-template-columns:repeat(auto-fill,
      minmax(max(var(--_min),(100% - (var(--_n) - 1) * var(--_gap)) / var(--_n)),1fr))}
    :host([cols="1"]){--_n:1} :host([cols="2"]){--_n:2} :host([cols="3"]){--_n:3}
    :host([cols="4"]){--_n:4} :host([cols="5"]){--_n:5} :host([cols="6"]){--_n:6}
    :host([row]){display:flex;flex-wrap:wrap;align-items:center;gap:var(--dot-gap,calc(var(--dot-pitch,2px) * 5))}
    /* Block components (text, sliders...) have no natural width: in a row they share what is left. */
    :host([row]) ::slotted(:not(dot-button):not(dot-icon):not(dot-led):not(dot-badge):not(dot-status)){flex:1 1 10em;min-width:0}
  `;
  class DotGrid extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }).innerHTML = `<style>${GRID_CSS}</style><slot></slot>`; }
  }

  /* ==================================================================
   * <dot-panel>: a card drawn as a one-dot frame, its title set into
   * the top edge. `note` adds a muted line under it. With `collapsible`
   * the title line is a <summary>; closed, the panel is that line alone.
   * The frame sizes itself from its content, so it repaints on resize.
   * ================================================================== */
  const PANEL_CSS = `
    .frame{position:relative}
    .frame > .box{position:absolute;left:0;right:0;top:0;pointer-events:none}
    .head{display:block;position:relative;height:calc(var(--dot-pitch,2px) * 7);list-style:none;outline:none}
    .head::-webkit-details-marker{display:none}
    summary.head{cursor:pointer;-webkit-tap-highlight-color:transparent}
    summary.head::before{${HIT}}
    summary.head:focus-visible{${FOCUS}}
    .body{display:flex;flex-direction:column;gap:calc(var(--dot-pitch,2px) * 10);min-width:0;
      padding:calc(var(--dot-pitch,2px) * 6) calc(var(--dot-pitch,2px) * 8) calc(var(--dot-pitch,2px) * 8)}
  `;
  class DotPanel extends DotElement {
    static observedAttributes = ['label', 'note', 'level', 'collapsible', 'open', 'tone', 'accent'];
    static css = PANEL_CSS;
    static tpl = `<div class="frame" part="panel">${BOX}<div class="wrap"></div></div>`;
    constructor() {
      super();
      this._shown = false;
      // Measured after everything else on every layout pass, so the frame always matches its content.
      // The host is the frame's size, so the shared ResizeObserver schedules that pass.
      this._late = true;
      this._wrap = this.$('.wrap');
    }
    get open() { return this.hasAttribute('open'); }
    set open(v) { this.toggleAttribute('open', !!v); }
    _build() {
      const coll = this._coll = this.hasAttribute('collapsible');
      const body = '<div class="body" part="body"><dot-text muted class="note" part="note"></dot-text><slot></slot></div>';
      this._wrap.innerHTML = coll
        ? `<details><summary class="head" part="head"><span class="sr"></span></summary>${body}</details>`
        : `<section><div class="head" part="head"><span class="sr"></span></div>${body}</section>`;
      const d = this._details = this.$('details');
      if (d) {
        d.open = this.open;
        // Mirror the open state onto the host. A rebuild makes a new <details>, so only a real change fires toggle.
        d.addEventListener('toggle', () => {
          if (d.open !== this.open) this.open = d.open;
          if (d.open !== this._shown) { this._shown = d.open; this.dispatchEvent(new Event('toggle')); }
        });
      }
    }
    _sync() {
      if (this._coll !== this.hasAttribute('collapsible')) this._build();
      if (this._details && this._details.open !== this.open) this._details.open = this.open;
      const label = this.getAttribute('label') || '', note = this.getAttribute('note') || '', h = this.$('.head');
      this.$('.sr').textContent = label;
      if (!this._coll) {
        if (label) {
          h.setAttribute('role', 'heading');
          h.setAttribute('aria-level', Math.min(6, Math.max(1, parseInt(this.getAttribute('level'), 10) || 2)));
        } else h.removeAttribute('role');
      }
      const n = this.$('.note');
      n.hidden = !note;
      n.setAttribute('text', note);
      this._title = colsOf(label, 'head');
    }
    _measure(wd) {
      const H = this.$('.frame').getBoundingClientRect().height * G.dpr;
      return { w: wd, h: Math.max(7, Math.floor(H / G.pdp + 1e-3)) };
    }
    _draw(p) {
      const { w, h } = this._sz, t = this._title, tx = 8;
      // The frame's top edge runs through the middle of the 7-row title line.
      if ((!this._coll || this.open) && h > 7) p.strokeRound(0, 3, w, h - 3, 2, DIM);
      else p.rect(0, 3, w, 1, DIM);
      if (t.length) { p.rect(tx - 2, 3, t.length + 4, 1, 0); p.text(t, tx, 0, 1, TONE); }
      if (this._coll) {
        const cx = w - 15;
        p.rect(cx - 2, 3, 11, 1, 0);
        p.icon('chevron', cx, 0, MUTED, 1, this.open);
      }
    }
  }

  /* ==================================================================
   * <dot-bar>: the app's top bar. A heading from `label`, slots start,
   * default and end, and a rule across the page below. As the first
   * child of <dot-app> it spans the page and clears the notch.
   * ================================================================== */
  const BAR_CSS = `
    :host{display:block;--_g:max(16px,env(safe-area-inset-left,0px),env(safe-area-inset-right,0px))}
    :host([hidden]){display:none}
    .bar{box-sizing:border-box;display:flex;align-items:center;gap:calc(var(--dot-pitch,2px) * 8);margin:0 auto;
      max-width:calc(var(--dot-width,1080px) + 2 * var(--_g));
      padding:calc(var(--dot-pitch,2px) * 7 + env(safe-area-inset-top,0px)) var(--_g) calc(var(--dot-pitch,2px) * 7)}
    .mid{flex:1;min-width:0;display:flex;align-items:center;gap:calc(var(--dot-pitch,2px) * 8)}
    .title{flex:1;min-width:0}
    .title[hidden]{display:none}
    ::slotted(*){flex:none}
  `;
  class DotBar extends HTMLElement {
    static observedAttributes = ['label', 'level'];
    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).innerHTML = `<style>${BAR_CSS}</style>` +
        '<header class="bar" part="bar"><slot name="start"></slot>' +
        '<div class="mid"><dot-heading class="title" part="title"></dot-heading><slot></slot></div>' +
        '<slot name="end"></slot></header><dot-rule part="rule" aria-hidden="true"></dot-rule>';
      this._title = this.shadowRoot.querySelector('.title');
    }
    connectedCallback() { this._render(); }
    attributeChangedCallback() { this._render(); }
    _render() {
      const label = this.getAttribute('label') || '';
      this._title.hidden = !label;
      this._title.setAttribute('level', this.getAttribute('level') || '1');
      this._title.setAttribute('text', label);
    }
  }

  window.Dotmatrix = {
    version: '0.4.1',
    theme,
    glyph,
    layout,
    icons: Object.keys(ICON),
    /** The current grid: devicePixelRatio, pitch in device and CSS px, dot size in device px. */
    get pitch() { return { dpr: G.dpr, device: G.pdp, css: G.pcss, dot: G.dot }; },
    /** Re-read --dot-target, --dot-fill, --dot-unlit and colours, and redraw everything. */
    refresh() {
      G.pdp = 0;
      updatePitch();
      for (const s of surfaces) s._skin();
      for (const el of reg) el._dirty = true;
      schedule();
    }
  };

  // Surfaces first, so components can find them when they connect; then
  // anything another component renders in its shadow root (heading, text, rule).
  define('dot-matrix', DotMatrix);
  define('dot-app', DotApp);
  define('dot-heading', DotHeading);
  define('dot-text', DotText);
  define('dot-rule', DotRule);
  define('dot-value', DotValue);
  define('dot-icon', DotIcon);
  define('dot-marquee', DotMarquee);
  define('dot-button', DotButton);
  define('dot-slider', DotSlider);
  define('dot-toggle', DotToggle);
  define('dot-input', DotInput);
  define('dot-led', DotLed);
  define('dot-badge', DotBadge);
  define('dot-status', DotStatus);
  define('dot-grid', DotGrid);
  define('dot-panel', DotPanel);
  define('dot-bar', DotBar);
})();
