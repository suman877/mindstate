// Elements
const sky = document.getElementById('sky');
const moon = document.getElementById('moon');
const sun = document.getElementById('sun');
const starsEl = document.getElementById('stars');
const shootingStarsEl = document.getElementById('shootingStars');

const nameModal = document.getElementById('nameModal');
const userNameInput = document.getElementById('userNameInput');
const nameSubmit = document.getElementById('nameSubmit');

const entryModal = document.getElementById('entryModal');
const entryText = document.getElementById('entryText');
const entryBtn = document.getElementById('entryBtn');

const buildings = Array.from(document.querySelectorAll('.building'));

const statementCard = document.getElementById('statementCard');
const statementContent = document.getElementById('statementContent');
const statementFooter = document.getElementById('statementFooter');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

let isDay = false;
let userName = null;
let selectionOrder = [];

/* -------------------------
   Utility: create stars
   ------------------------- */
function createStars(count = 90){
  starsEl.innerHTML = '';
  for(let i=0;i<count;i++){
    const s = document.createElement('div');
    s.className = 'star';
    s.style.left = (Math.random()*100) + '%';
    s.style.top = (Math.random()*90) + '%';
    s.style.animationDuration = (1.5 + Math.random()*2) + 's';
    s.style.opacity = (0.2 + Math.random()*0.9).toString();
    starsEl.appendChild(s);
  }
}
createStars();

/* shooting stars (night only) */
function spawnShooting(){
  if(!sky.classList.contains('night')) return;
  const s = document.createElement('div');
  s.className = 'shootingStar';
  s.style.left = (Math.random()*20 - 5) + '%';
  s.style.top = (10 + Math.random()*40) + '%';
  const dur = 1.2 + Math.random()*1.2;
  s.style.animationDuration = dur + 's';
  shootingStarsEl.appendChild(s);
  setTimeout(()=> s.remove(), (dur+0.2)*1000);
}
setInterval(spawnShooting, 2200);

/* -------------------------
   Day/Night toggle
   ------------------------- */
function toggleDayNight(){
  isDay = !isDay;
  sky.classList.toggle('day', isDay);
  sky.classList.toggle('night', !isDay);
  sun.style.opacity = isDay ? '1' : '0';
  moon.style.opacity = isDay ? '0' : '1';
}
moon.addEventListener('click', toggleDayNight);
sun.addEventListener('click', toggleDayNight);

/* -------------------------
   Name modal logic (1 hour block)
   ------------------------- */
function showNameModal(){ nameModal.style.display = 'block'; userNameInput.focus(); }
function hideNameModal(){ nameModal.style.display = 'none'; userNameInput.value = ''; }

function canUseName(name){
  const stored = JSON.parse(localStorage.getItem('MindStateUser') || '{}');
  if(!stored[name]) return true;
  const elapsed = Date.now() - stored[name];
  return elapsed >= 3600000; // >= 1 hour
}

nameSubmit.addEventListener('click', ()=>{
  const name = userNameInput.value.trim();
  if(!name){ alert('Please enter a valid name'); userNameInput.focus(); return; }
  if(!canUseName(name)){
    const stored = JSON.parse(localStorage.getItem('MindStateUser') || '{}');
    const unlock = new Date(stored[name] + 3600000);
    alert(`The name "${name}" was already used within the last hour. Try again after ${unlock.toLocaleTimeString()}.`);
    return;
  }
  userName = name;
  hideNameModal();
});

/* show on load */
window.addEventListener('load', showNameModal);

/* -------------------------
   Building selection flow
   ------------------------- */
buildings.forEach((b, i) => {
  b.tabIndex = 0;
  b.setAttribute('role','button');
  b.addEventListener('click', () => {
    if(!userName){ alert('Please enter your name first.'); showNameModal(); return; }
    const el = b.dataset.element;
    entryText.innerText = `Enter the ${el} world?`;
    entryModal.style.display = 'block';
    entryBtn.onclick = () => {
      entryModal.style.display = 'none';
      // prevent duplicates
      if(selectionOrder.includes(el)) return;
      selectionOrder.push(el);
      b.style.opacity = '0.6';
      // first selection gives 100%, last gives 20% - generate when all buildings selected
      if(selectionOrder.length === buildings.length){
        generateMindState();
      }
    };
  });

  // mobile friendly: longpress alternative? keep simple click
});

/* -------------------------
   MindState data + generation
   ------------------------- */
const elementsData = {
  Space: [
    "Subtlety and imagination — you conceive ideas before they take form.",
    "Non-resistance and expansion — open, flexible, and always curious.",
    "Calmness and detachment — inner stillness supports perception."
  ],
  Air: [
    "Movement & action orientation — energy, agility, spontaneity.",
    "Communication & curiosity — you seek knowledge and exchange ideas.",
    "Independence & adaptability — you value freedom and novelty."
  ],
  Fire: [
    "Passion & decisive action — willpower and transformative drive.",
    "Leadership & willpower — direct, bold, and forward-moving.",
    "Intensity & impulsivity — strong focus but watch impatience."
  ],
  Water: [
    "Empathy & emotional depth — sensitive, creative, and healing.",
    "Creativity & introspection — you process and transform feelings.",
    "Adaptability & emotional bonds — you form deep, lasting connections."
  ],
  Earth: [
    "Stability & groundedness — disciplined, practical, and reliable.",
    "Loyalty & nurturing — committed and protective relationships.",
    "Stubbornness & resistance — strong foundations, avoid rigidity."
  ]
};

function generateMindState(){
  // build a readable paragraph (combined)
  // priorities: first = 100, next = 80, 60, 40, 20 (for 5)
  const priorities = [100,80,60,40,20];
  let paraParts = [];
  selectionOrder.forEach((el, idx) => {
    const p = priorities[idx] || Math.max(20, 100 - idx*20);
    // choose the three bullets as a condensed sentence
    const traits = elementsData[el].join(' ');
    paraParts.push(`${el} (${p}%): ${traits}`);
  });

  const paragraph = `Namaste ${userName}, under the current ${isDay ? 'Day' : 'Night'} sky, your MindState (momentary) shows:\n\n` +
    paraParts.join("\n\n") +
    `\n\n⚠️ This statement is valid for 1 hour from now.`;

  statementContent.innerText = paragraph;
  const now = new Date();
  statementFooter.innerText = `Name: ${userName} • Generated: ${now.toLocaleString()} • Mode: ${isDay ? 'Day' : 'Night'}`;

  // show card
  statementCard.style.display = 'flex';
  statementCard.scrollIntoView({behavior:'smooth', block:'center'});

  // store name usage timestamp for 1-hour block
  const stored = JSON.parse(localStorage.getItem('MindStateUser') || '{}');
  stored[userName] = Date.now();
  localStorage.setItem('MindStateUser', JSON.stringify(stored));
}

/* -------------------------
   Download PNG of the statement card
   ------------------------- */
downloadBtn.addEventListener('click', ()=>{
  // ensure visible
  statementCard.style.display = 'flex';
  // use html2canvas to capture the card only
  html2canvas(statementCard, { scale: 2, backgroundColor: null }).then(canvas=>{
    // convert to blob and download
    canvas.toBlob(function(blob){
      const a = document.createElement('a');
      a.download = `MindState_${userName || 'guest'}_${Date.now()}.png`;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
      a.remove();
    }, 'image/png', 1.0);
  }).catch(err=>{
    alert('Download failed. Please try again.');
    console.error(err);
  });
});

/* -------------------------
   Reset button: allow new session/user
   ------------------------- */
resetBtn.addEventListener('click', ()=>{
  // clear selections and restore buildings look
  selectionOrder = [];
  buildings.forEach(b=> { b.style.opacity = '1'; });
  // hide statement card
  statementCard.style.display = 'none';
  // show name modal to accept a new user (note: previously used names remain blocked for 1 hour)
  userName = null;
  showNameModal();
});

/* -------------------------
   Accessibility: escape to close modals
   ------------------------- */
window.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    entryModal.style.display = 'none';
    nameModal.style.display = 'none';
  }
});
