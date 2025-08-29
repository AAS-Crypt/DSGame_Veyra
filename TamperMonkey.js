// ==UserScript==
// @name         Veyra Helper Widget
// @namespace    http://tampermonkey.net/
// @version      1.14
// @description  Collect specific amount of stamina with auto-detection
// @author       You
// @match        https://demonicscans.org/*
// @grant        none
// ==/UserScript==

/*

*/


(function() {
    'use strict';
    if(localStorage.getItem('game.styles') == null){
        localStorage.setItem('game.styles', '.header,.howto-info-header h2{font-size:22px;text-align:center}.events-header,.gate-card,.header,h1{text-align:center}.event-cta,.event-title,.events-header,.gate-card-name,.header{font-weight:700}.container{margin:auto;padding:20px}h1{margin-bottom:20px;color:#fff}.section{margin-bottom:30px}.header{margin-bottom:10px;color:#ddd}.events-grid,.gates-flex{display:flex;flex-wrap:wrap;gap:20px;justify-content:center}.gate-card{background:#1e1e1e;border-radius:10px;overflow:hidden;transition:transform .2s;cursor:pointer;width:250px;box-shadow:0 2px 6px rgba(0,0,0,.4)}.howto-info,.panel{background:#1a1b25}.gate-card:hover{transform:scale(1.03)}.gate-card img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}.gate-card-name{padding:12px;font-size:16px;color:#f1f1f1}a.gate-link{text-decoration:none;color:inherit}.panel{border:1px solid #232437;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,.35);padding:16px;margin:20px auto}.howto-info{max-width:900px;margin:0 auto 24px;border:1px solid #232437;border-radius:14px;box-shadow:0 8px 20px rgba(0,0,0,.35);overflow:hidden}.howto-info-header{padding:14px 18px;border-bottom:1px solid #232437;background:#191a24}.howto-info-header h2{margin:0;color:#ffd369}.howto-info-scroll{max-height:360px;overflow:auto}.howto-info-body{padding:16px;font-size:15px;line-height:1.7;color:#ddd}.howto-info-body ul{margin:8px 0 8px 20px;padding:0;list-style:disc}.howto-info-scroll::-webkit-scrollbar{width:10px}.howto-info-scroll::-webkit-scrollbar-thumb{background:#2b2d44;border-radius:10px}.howto-info-scroll::-webkit-scrollbar-track{background:#1a1b25}.events-section{margin:0 auto 28px}.events-header{font-size:22px;color:#ffd369;margin:0 0 14px}.event-card{position:relative;width:340px;background:#10131a;border:1px solid #232437;border-radius:16px;overflow:hidden;cursor:pointer;box-shadow:0 10px 24px rgba(0,0,0,.45);transition:transform .2s,box-shadow .2s}.event-card:hover{transform:translateY(-4px);box-shadow:0 16px 32px rgba(0,0,0,.55)}.event-media{position:relative;width:100%;aspect-ratio:1/1;background:#0e0f17}.event-media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}.event-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.55) 15%,rgba(0,0,0,0) 55%);pointer-events:none}.event-body{padding:14px 14px 16px}.event-title{font-size:18px;color:#f1f1f1;margin:0 0 10px;line-height:1.25;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.event-cta{display:inline-flex;align-items:center;gap:8px;font-size:14px;padding:10px 14px;border-radius:10px;background:#2b2d44;color:#eaeaea;border:1px solid #393b58;text-decoration:none;transition:background .2s,transform .2s}.event-cta:hover{background:#33365a;transform:translateY(-1px)}.event-badge{position:absolute;top:10px;left:10px;background:#e24a4a;color:#fff;font-size:12px;font-weight:800;letter-spacing:.3px;padding:6px 10px;border-radius:999px;box-shadow:0 6px 16px rgba(0,0,0,.35);text-transform:uppercase}@media (max-width:600px){.gate-card{width:90%;margin:auto}.event-card{width:100%;max-width:520px}}');
    }


    function getCookieByName(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                return cookie.substring(name.length + 1);
            }
        }
        return null;
    }

    let ignoreList = [];
    // Load saved values or use defaults
    let targetStamina = localStorage.getItem('staminaTarget') || '80';
    let minChap = localStorage.getItem('staminaMinChap') || '1';
    let userID = parseInt(getCookieByName('demon'));
    let dailyLimit = 1000;
    if(localStorage.getItem('dailyStamina') == null){
        localStorage.setItem('dailyStamina', 0);
    }

    let dailyStamina = parseInt(localStorage.getItem('dailyStamina'));
    let reactID = getCookieByName('useruid');

    var t; // Timer/Interval ID

    const enemies = ['Goblin Slinger', 'Goblin Skirmisher', 'Orc Grunt', 'Orc Bonecrusher', 'Hobgoblin Spearman', 'Troll Ravager', 'Lizardman Flamecaster', 'Lizardman Shadowclaw', 'Troll Brawler'];

    let url = document.location.href;
    const currentUrl = new URL(url);
    const currentPath = currentUrl.pathname;

    const allowedPaths = [
        '/game_dash.php',
        '/pvparena.php',
        '/monsterwiki.php',
        '/active_wave.php',
        '/battle.php',
        '/user_join_battle.php',
        '/loot.php',
        '/inventory.php',
        '/pets.php',
        '/stats.php',
        '/blacksmith.php',
        '/player.php',
        '/chat.php',
        '/weekly.php',
        '/event_goblin_feast.php',
        '/guide.php',
        '/achievements.php',
        '/merchant.php'
    ];


    function updateChat() {
        const logEl = document.getElementById("chatLog");
        const wasNearBottom = (logEl.scrollHeight - logEl.scrollTop - logEl.clientHeight) < 120;
        let xmlhttp;
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp=new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange=function() {
            if (this.readyState==4 && this.status==200) {
                document.getElementById("chatLog").innerHTML=this.responseText;
                if (wasNearBottom) {
                    logEl.scrollTop = logEl.scrollHeight; // auto-scroll if user was near bottom
                }
            }
        }
        xmlhttp.open("POST","updatechat.php",true);
        xmlhttp.send();
    }
    if (document.location.href.includes("https://demonicscans.org/active_wave.php")){
        document.querySelector('.monster-container').innerHTML = "";
    } 
    
    if (allowedPaths.includes(currentPath)) {
        window.addEventListener('load', async function() {
            if (document.location.href == ("https://demonicscans.org/pvparena.php")) {
                fetch('')
            } else if (document.location.href == ("https://demonicscans.org/monsterwiki.php")) {
                let status = await fetch('https://demonicscans.org/stats.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                })
                    .then(response => response.text())
                    .then(html => {
                    let parser = new DOMParser();
                    return parser.parseFromString(html, 'text/html');
                });
                console.log(status.querySelector('body > style').outerHTML);
                document.head.innerHTML = `<style>
                                            body{background:#12131A;color:#EDEFF6;font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:0}
                                            .wrap{max-width:1100px;margin:0 auto;padding:16px}
                                            .btn{padding:8px 12px;background:#2A2B3A;color:#EDEFF6;border:none;border-radius:8px;cursor:pointer;text-decoration:none;display:inline-block}
                                            .btn:hover{background:#34364A}
                                            .panel{background:#1A1B25;border:1px solid #232437;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,.35);padding:18px;margin:16px 0}
                                            .title{margin:8px 0 12px;font-size:28px;color:#FFD369;text-align:center}
                                            .toc{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
                                            .toc a{background:#171923;border:1px solid #2B2D44;border-radius:8px;padding:8px 10px;color:#EDEFF6;text-decoration:none}
                                            .toc a:hover{background:#202235}
                                            h2{margin:18px 0 8px;color:#FFD369}
                                            h3{margin:16px 0 6px;color:#EDEFF6}
                                            p{line-height:1.6;color:#C8CCE8;margin:6px 0}
                                            ul{margin:8px 0 14px 18px}
                                            code, .mono{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace}
                                            .note{background:#171923;border:1px solid #2B2D44;border-radius:8px;padding:10px;margin:10px 0;color:#D7DAF7}
                                            .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
                                            .card{background:#171923;border:1px solid #2B2D44;border-radius:10px;padding:12px}
                                            .muted{color:#9aa0be}
                                          </style>`;
                document.head.innerHTML += status.querySelector('head > style').outerHTML;
                document.head.innerHTML += status.querySelector('body > style').outerHTML;
                document.body.innerHTML = status.querySelector('.game-topbar').outerHTML;

                (function(){
                    let secs = 3272;
                    const refillAmt = 20;
                    const maxStam = 20;

                    const tEl = document.getElementById('stamina_timer');
                    const sEl = document.getElementById('stamina_span');

                    function fmt(n){ return n.toLocaleString(); }
                    function mmss(total){
                        const m = Math.floor(total / 60);
                        const s = total % 60;
                        return (m<10?'0':'')+m+':' + (s<10?'0':'')+s;
                    }

                    function tick(){
                        tEl.textContent = '⏳ ' + mmss(secs);

                        if (secs <= 0){
                            // Apply +10 stamina visually (server already did at HH:00:00)
                            const current = parseInt((sEl.textContent || '0').replace(/[^0-9]/g,''), 10) || 0;
                            const next = Math.min(maxStam, current + refillAmt);
                            if (next !== current){
                                sEl.textContent = fmt(next);
                            }
                            secs = 3600;
                        }
                        secs--;
                    }

                    tick();
                    setInterval(tick, 1000);
                })();

document.head.innerHTML +=`
<style>.monster-header img {object-fit: fill; width:100%}.monster-loot img {object-fit: fill; width:45%} body{background:#12131a;color:#edeff6;font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:0}.wrap{max-width:1100px;margin:0 auto;padding:16px}.btn{padding:8px 12px;background:#2a2b3a;color:#edeff6;border:none;border-radius:8px;cursor:pointer;text-decoration:none;display:inline-block}.btn:hover{background:#34364a}.panel{background:#1a1b25;border:1px solid #232437;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,.35);padding:18px;margin:16px 0}.title{margin:8px 0 12px;font-size:28px;color:#ffd369;text-align:center}.toc{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}.toc a{background:#171923;border:1px solid #2b2d44;border-radius:8px;padding:8px 10px;color:#edeff6;text-decoration:none}.toc a:hover{background:#202235}h2{margin:18px 0 8px;color:#ffd369}h3{margin:16px 0 6px;color:#edeff6}p{line-height:1.6;color:#c8cce8;margin:6px 0}ul{margin:8px 0 14px 18px}.mono,code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace}.note{background:#171923;border:1px solid #2b2d44;border-radius:8px;padding:10px;margin:10px 0;color:#d7daf7}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}.card{background:#171923;border:1px solid #2b2d44;border-radius:10px;padding:12px}.muted{color:#9aa0be}.wave-header{background:linear-gradient(to right,#2a2b3a,#34364a);color:#ffd369;padding:15px 20px;border-radius:12px;margin:30px 0 20px;display:flex;justify-content:space-between;align-items:center}.wave-title{font-size:24px;font-weight:700}.wave-level{background-color:#ffd369;color:#12131a;padding:5px 15px;border-radius:20px;font-weight:600}.monsters-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(350px,1fr));gap:20px;margin-bottom:40px}.monster-card{background:#1a1b25;border:1px solid #232437;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,.35)}.monster-header{position:relative;background-color:#2a2b3a;color:#edeff6;padding:15px;border-bottom:1px solid #232437}.monster-name{font-size:2.5vh;font-weight:600;margin-bottom:5px;color:#ffd369;position:absolute;bottom:20%;left:8%;text-shadow:0 0 20px black;}.monster-stats{margin:10px 0;font-size:2vh;color:#c8cce8;position:absolute;bottom:4%;left:8%;text-shadow:0 0 7px black;}.hp-bar{height:10px;background-color:#171923;border-radius:5px;overflow:hidden;margin:10px 0}.hp-fill{height:100%;background:linear-gradient(to right,#4caf50,#8bc34a);border-radius:5px}.monster-actions{padding:10px 15px;background-color:#171923;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #232437}.monster-loot{padding:15px}.loot-title{font-weight:700;margin-bottom:10px;color:#ffd369}.loot-item{padding:10px;border-bottom:1px solid #232437;display:flex;justify-content:space-between;align-items:center}.loot-rarity{font-weight:600;padding:2px 8px;border-radius:4px;font-size:12px;flex-shrink:0;margin-right:10px}.legendary{background-color:gold;color:#856404}.epic{background-color:#9370db;color:#fff}.rare{background-color:#007bff;color:#fff}.common{background-color:#6c757d;color:#fff}.loot-info{flex-grow:1}.loot-name{font-weight:600;color:#edeff6}.loot-desc{font-size:12px;color:#9aa0be;margin-top:3px}.loot-stats{text-align:right;font-size:12px;color:#c8cce8;flex-shrink:0;margin-left:10px}.locked{opacity:.7;position:relative}.locked::after{content:"🔒";position:absolute;right:10px;top:50%;transform:translateY(-50%)}@media (max-width:768px){.monsters-grid{grid-template-columns:1fr}.wave-header{flex-direction:column;gap:10px;text-align:center}}</style>
`;
                function createWaveMonstersInfo(){
                    let waves = [{num : 1, req : 1},{num:2, req:50}];
                    let monsterEntities = [{
                        wave : 1,
                        name : "Goblin Skirmisher",
                        img : "https://demonicscans.org/images/monsters/monster_689bea482aecd5.59004851.webp",
                        maxHP : "1,100,000",
                        maxPC : 20,
                        loot : [
                            {
                                name : "Goblin Essence",
                                desc : "A swirling green vial containing the raw life force of a goblin. It smells faintly of moss and iron, and hums with chaotic energy.",
                                img : "https://demonicscans.org/images/items/1755224465_Goblin%20Essence.webp",
                                dropRate : "6%",
                                damageReq : "70,000",
                                rarity : {
                                    name : "Legendary",
                                    background : "#ffd86a",
                                }
                            },{
                                name : "Goblin Ear",
                                desc : "A grisly trophy favored by bountry hunters in Veyra.",
                                img : "https://demonicscans.org/images/items/1755224533_Goblin%20ears.webp",
                                dropRate : "30%",
                                damageReq : "15,000",
                                rarity : {
                                    name : "Rare",
                                    background : "#6ac3ff",
                                }
                            },{
                                name : "Rusty Shortsword",
                                desc : "A dull, pitted blade stolen from some unlucky traveler. Barely sharp, but quick to wield..",
                                img : "https://demonicscans.org/images/items/1755223589_rusty_shortsword.webp",
                                dropRate : "90%",
                                damageReq : "10,000",
                                rarity : {
                                    name : "Common",
                                    background : "#cfd4ff",
                                }
                            }
                        ]
                    }]
                    waves.forEach(wave => {
                        let wavesDIV = document.createElement('div');
                        wavesDIV.id = 'waves';
                        wavesDIV.classList = 'panel';
                        wavesDIV.innerHTML = `<h2>Monster Waves</h2><p>Monsters are organized into waves with increasing difficulty. Higher waves require higher levels and offer better rewards.</p>`;
                        wavesDIV.innerHTML += `<!-- Wave ${wave.num} --><div class="wave-header"><div class="wave-title">🌊 WAVE ${wave.num}</div><div class="wave-level">Required Level: ${wave.req}</div></div>`;

                        let monstersGRID = document.createElement('div');
                        monstersGRID.classList = 'monsters-grid';
                        monsterEntities.forEach(monster => {
                            monstersGRID.innerHTML += `<!-- ${monster.name} -->`;
                            let monsterCARD = document.createElement('div');
                            monsterCARD.classList = 'monster-card';

                            let monsterHEADER = document.createElement('div');
                            monsterHEADER.classList = 'monster-header';
                            monsterHEADER.innerHTML += `<img src="${monster.img}" alt="${monster.name}"><div class="monster-name">${monster.name}</div><div class=monster-stats><span>❤️ Maximum HP : ${monster.maxHP} </span><br><span>👥 Maximum Players : ${monster.maxPC} </span></div>`;

                            let monsterLOOT = document.createElement('div');
                            monsterLOOT.classList = 'monster-loot';
                            monsterLOOT.innerHTML += `<div class="monster-loot"><div class="loot-title">🎁 Possible Loot</div>`;
                            monster.loot.forEach(loot =>{
                                monsterLOOT.innerHTML +=
                                `<div class="loot-item">
                                 <img src="${loot.img}" alt="${loot.name}">
                                 <span class="loot-rarity ${loot.rarity.name.toLowerCase()}" style="background:${loot.rarity.background}!important">${loot.rarity.name.toUpperCase()}</span>
                                 <div class="loot-info"><div class="loot-name">${loot.name}</div><div class="loot-desc">${loot.desc}</div></div>
                                 <div class="loot-stats"><div>Drop: ${loot.dropRate}</div>
                                 <div>DMG req: ${loot.damageReq}</div></div>
                                </div>`
                            });
                            monsterLOOT.innerHTML += `</div>`;
                            monsterCARD.appendChild(monsterHEADER);
                            monsterCARD.appendChild(monsterLOOT);
                            monstersGRID.appendChild(monsterCARD);
                        });
                        wavesDIV.appendChild(monstersGRID);
                        document.querySelector('div#waves.panel').innerHTML = wavesDIV.innerHTML;
                    });
                }
document.body.innerHTML += `
<div class="wrap">
 <div style="margin: 8px 0 16px;">
  <a href="game_dash.php" class="btn" style="text-decoration:none;">⬅ Back to Dashboard</a>
 </div>
 <div class="panel">
  <div class="title">📖 Monster Wiki</div>
  <p class="muted" style="text-align:center;">Everything you need to know about Monsters</p>
  <div class="toc">
   <a href="#getting-started">Getting Started</a>
   <a href="#waves">Waves</a>
   <a href="#combat">Combat & Damage</a>
   <a href="#loot">Loot & Drops</a>
   <a href="#pets">Pets</a>
   <a href="#stamina">Stamina</a>
   <a href="#weekly">Weekly Leaderboard & Rewards</a>
   <a href="#tips">Tips</a>
  </div>
 </div>
 <div id="getting-started" class="panel">
  <h2>Getting Started</h2>
  <div class="grid">
   <div class="card">
    <h3>1) Find a Gate</h3>
    <p>Head to an active gate, open its current <em>wave</em>, and pick a monster. </p>
   </div>
   <div class="card">
    <h3>2) Join the Battle</h3>
    <p>Click <span class="mono">⚔️ Join the Battle</span> to enter. If you've already joined, you'll see <span class="mono">🟠 Continue the Battle</span>. If a monster is full, you'll see <span class="mono">Full</span> unless you're already in that fight. </p>
   </div>
   <div class="card">
    <h3>3) Attack</h3>
    <p>Spend stamina to use a basic attack or a class skill. Each hit contributes to your total damage.</p>
   </div>
   <div class="card">
    <h3>4) Loot</h3>
    <p>When the monster dies, players who joined can click <span class="mono">💰 Loot</span> on that monster. If you didn't join, the loot button won't appear. If you already looted, it also won't appear. </p>
   </div>
  </div>
  <div class="note">If there are no living monsters left in a wave, the system automatically spawns the next set for that wave.</div>
 </div>
 <div id="waves" class="panel">
 </div>
 <div id="combat" class="panel">
  <h2>Combat & Damage</h2>
  <p>Your damage per hit is influenced by your stats, equipped items, equipped pets, and any skill used.</p>
  <h3>Damage Formula (overview)</h3>
  <p class="mono">base = 225 + (itemsATK × 15) + (petsATK × 10) + skillDamage + 1000 × max(0, (UserATK − MonsterDEF))^0.25</p>
  <ul>
   <li>If your <span class="mono">UserATK < MonsterDEF </span>, damage is <strong>0</strong>. </li>
   <li>After base is computed, a <strong>damage multiplier</strong> from certain pet powers is applied. </li>
   <li>
    <strong>Criticals:</strong> Some pets raise crit chance or crit damage. On crit, damage is multiplied further.
   </li>
  </ul>
  <h3>What contributes to ATK?</h3>
  <ul>
   <li>
    <strong>Your ATTACK stat</strong> (from your user profile).
   </li>
   <li>
    <strong>Equipped items</strong> (sum of equipped inventory attack values).
   </li>
   <li>
    <strong>Equipped pets</strong> (sum of pets' ATTACK).
   </li>
   <li>
    <strong>Skill damage</strong> (varies per skill).
   </li>
  </ul>
  <div class="note">Each attack consumes stamina and grants a small amount of XP. Level ups can refill stamina (details below).</div>
 </div>
 <div id="loot" class="panel">
  <h2>Loot & Drops</h2>
  <ul>
   <li>You must have <strong>joined the battle</strong> before the monster died to be eligible for loot. </li>
   <li>Eligible drops depend on your <strong>damage dealt</strong> meeting each item's <span class="mono">Damage Requirement</span>. </li>
   <li>Each eligible item rolls against its <strong>DROP_RATIO</strong> (supports 0–1 or 0–100%). </li>
   <li>Once you loot a dead monster, the button disappears for you.</li>
   <li>On the monsters list, dead monsters you joined but <strong>haven't looted yet</strong> are moved to the top for visibility. </li>
  </ul>
  <h3>EXP & Gold from Kills</h3>
  <p>When you loot, you also receive EXP and Gold scaled by your share of the boss's HP. These rewards are <strong>capped at 20%</strong> of the boss's base EXP/Gold values per player. </p>
  <div class="note">Leveling up during loot processing grants stat points and may fully restore stamina if you were below max.</div>
 </div>
 <div id="pets" class="panel">
  <h2>Pets</h2>
  <p>Pets provide additional ATK, special powers, and can be leveled and promoted.</p>
  <h3>Leveling</h3>
  <ul>
   <li>Feed pets with <strong>Pet Food</strong> to gain EXP. Each level increases pet ATK and sometimes power rates. </li>
   <li>Pets can also <strong>evolve</strong> at certain levels, changing their stage art and granting extra bonuses. </li>
  </ul>
  <h3>Promotions (Stars)</h3>
  <ul>
   <li>Promote a pet by consuming <strong>copies</strong>. Copy requirements follow a Fibonacci-like curve (e.g., 1→2★ needs 1 copy, 2→3★ needs 2, … up to 7→8★ needs 21). </li>
  </ul>
  <h3>Pet Powers</h3>
  <ul>
   <li>
    <strong>Power 1:</strong> Increases <em>crit rate</em>.
   </li>
   <li>
    <strong>Power 2:</strong> Increases <em>crit damage</em>.
   </li>
   <li>
    <strong>Power 3:</strong> Increases <em>overall damage multiplier</em>.
   </li>
  </ul>
  <div class="note">Power tooltips display the current rate (e.g., "+15% crit chance") and update when your pet levels up.</div>
 </div>
 <div id="stamina" class="panel">
  <h2>Stamina</h2>
  <ul>
   <li>Each attack consumes <strong>1 stamina</strong>. </li>
   <li>
    <strong>Level Up:</strong> If you level up and were below max, your stamina is fully restored.
   </li>
   <li>
    <strong>Potions:</strong> Some items (e.g., Full Stamina Potion) restore stamina instantly.
   </li>
   <li>
    <strong>Comments Bonus:</strong> Posting your <em>first</em> comment on a chapter awards <strong>+2 stamina</strong> (up to your Max Stamina). You'll see a notice when this triggers.
   </li>
   <li>
    <strong>Daily Stamina Farming Cap:</strong> Stamina earned from "farming" sources (like reacting to chapters) is tracked and <strong>capped at 1000 per day</strong>.
   </li>
  </ul>
  <div class="note">Stamina farming progress resets daily. Potion restores and level-up refills are not counted against the farming cap.</div>
 </div>
 <div id="weekly" class="panel">
  <h2>Weekly Leaderboard & Rewards</h2>
  <p>We rank players by total damage each ISO week (Mon–Sun). Top players earn rewards:</p>
  <ul>
   <li>
    <strong>1st:</strong> 500 Gold, 2× Fenrir Eggs, 2× Full Stamina Potion
   </li>
   <li>
    <strong>2nd–3rd:</strong> 300 Gold, 1× Fenrir Egg, 1× Full Stamina Potion
   </li>
   <li>
    <strong>4th–10th:</strong> 200 Gold, 1× Full Stamina Potion
   </li>
   <li>
    <strong>11th–50th:</strong> 100 Gold
   </li>
   <li>
    <strong>51st–100th:</strong> 50 Gold
   </li>
  </ul>
  <p class="muted">Rewards are granted after the week closes by an admin action.</p>
 </div>
 <div id="tips" class="panel">
  <h2>Tips</h2>
  <ul>
   <li>Join battles early to qualify for drops. If you skip joining, the loot button won't appear for you.</li>
   <li>Level pets and promote key ones for crit and multiplier boosts.</li>
   <li>Keep an eye on stamina—use potions or level up to restore when needed.</li>
   <li>Target monsters where your <span class="mono">ATTACK ≥ DEFENSE</span> for consistent damage. </li>
  </ul>
 </div>
</div>
`;
                createWaveMonstersInfo();
            }
            const staminaElement = document.querySelector('.gtb-value');
            if (!staminaElement) {
                alert('Stamina element not found! Make sure you\'re on a page that displays stamina.');
                return;
            }
            const Staminas = staminaElement.textContent.trim().split(' / ');
            const currentStamina = parseInt(Staminas[0]);
            const maxStamina = parseInt(Staminas[1]);

            // Create the UI container
            const container = document.createElement('div');
            container.id = 'stamina-container';
            const savedPosition = JSON.parse(localStorage.getItem('staminaContainerPosition') || '{"top": "100px", "right": "50px"}');
            container.style.position = 'fixed';
            container.style.top = savedPosition.top;
            container.style.left = savedPosition.left || 'calc(100% - 230px)';
            container.style.right = 'auto';
            container.style.zIndex = '9999';
            container.style.backgroundColor = 'rgb(167 137 202 / 80%)';
            container.style.padding = '10px';
            container.style.borderRadius = '8px';
            container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
            container.style.color = 'white';
            container.style.fontFamily = 'Arial, sans-serif';
            container.style.maxWidth = '180px';
            container.style.cursor = 'move';

            let isDragging = false;
            let dragOffsetX, dragOffsetY;

            container.addEventListener('mousedown', function(e) {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
                    return;
                }

                isDragging = true;
                const rect = container.getBoundingClientRect();
                dragOffsetX = e.clientX - rect.left;
                dragOffsetY = e.clientY - rect.top;
                container.style.cursor = 'grabbing';
                e.preventDefault();
            });

            document.addEventListener('mousemove', function(e) {
                if (!isDragging) return;

                const x = e.clientX - dragOffsetX;
                const y = e.clientY - dragOffsetY;

                // Keep within viewport bounds
                const maxX = window.innerWidth - container.offsetWidth;
                const maxY = window.innerHeight - container.offsetHeight;

                const boundedX = Math.max(0, Math.min(x, maxX));
                const boundedY = Math.max(0, Math.min(y, maxY));

                container.style.top = boundedY + 'px';
                container.style.left = boundedX + 'px';
                container.style.right = 'auto';
                e.preventDefault();
            });

            document.addEventListener('mouseup', function() {
                if (!isDragging) return;

                isDragging = false;
                container.style.cursor = 'move';

                // Save position to localStorage
                const position = {
                    top: container.style.top,
                    left: container.style.left,
                    // top: rect.top + 'px',
                    // right: (window.innerWidth - rect.right) + 'px'
                };
                console.log(JSON.stringify(position));
                localStorage.setItem('staminaContainerPosition', JSON.stringify(position));
            });


            // Create title
            const title = document.createElement('h3');
            title.textContent = 'Veyra Helper Widget';
            title.style.margin = '0 0 10px 0';
            title.style.fontSize = '14px';
            title.style.color = '#ffdd00';
            container.appendChild(title);

            console.log(this.document.location.href);
            if (document.location.href == "https://demonicscans.org/chat.php"){
                clearInterval(t);
                t=setInterval(updateChat,1000 * 2);
            } else if (document.location.href == "https://demonicscans.org/game_dash.php"){
                let pvpArena = document.createElement('a');
                pvpArena.href='pvparena.php';
                pvpArena.classList='gate-link';

                let pvpArena_div = document.createElement('div');
                pvpArena_div.classList="gate-card";

                let pvpArena_img = document.createElement('img');
                pvpArena_img.src = "/images/events/goblin_fest/compressed_goblin_feast.webp";
                pvpArena_img.alt = "Fight Players";
                pvpArena_div.appendChild(pvpArena_img);
                pvpArena_div.innerHTML += `<div class="gate-card-name">PvP Arena</div>`;

                pvpArena.appendChild(pvpArena_div);
                document.querySelectorAll('div.gates-flex')[0].appendChild(pvpArena);

                let monsterWiki = document.createElement('a');
                monsterWiki.href='monsterwiki.php';
                monsterWiki.classList='gate-link';

                let monsterWiki_div = document.createElement('div');
                monsterWiki_div.classList="gate-card";

                let monsterWiki_img = document.createElement('img');
                monsterWiki_img.src = "https://upload.wikimedia.org/wikipedia/commons/c/c8/Black_W_for_promotion.png";
                monsterWiki_img.style.objectFit = 'contain';
                monsterWiki_img.style.background = '#b4e7ff';
                monsterWiki_img.alt = "Monster WIKI";
                monsterWiki_div.appendChild(monsterWiki_img);
                monsterWiki_div.innerHTML += `<div class="gate-card-name">Monster WIKI</div>`;

                monsterWiki.appendChild(monsterWiki_div);
                document.querySelectorAll('div.gates-flex')[1].appendChild(monsterWiki);
            } else if (document.location.href == ("https://demonicscans.org/pvparena.php")) {
                alert(document.location.href);
                alert("HEHEHE");
                console.log('herrou');
            } else if (document.location.href == ("https://demonicscans.org/monsterwiki.php")) {
                //console.log("HHHH");
                //alert(document.location.href);
                //alert("HEHEHE");
                console.log('herrou');
            } else if (document.location.href.includes("https://demonicscans.org/weekly.php") ||
                       document.location.href.includes("https://demonicscans.org/event_goblin_feast.php")){
                let findMe = document.querySelector('a[href="player.php?pid=73553"]').parentElement.parentElement;
                findMe.style.background = "rgb(76 113 151)";

                const findMeDIV = document.createElement('div');
                findMeDIV.style.marginBottom = '10px';

                const findMeLabel = document.createElement('label');
                findMeLabel.textContent = 'Find me in Leadership:';
                findMeLabel.style.display = 'block';
                findMeLabel.style.marginBottom = '5px';
                findMeLabel.style.fontWeight = 'bold';
                findMeLabel.style.color = 'black';
                findMeDIV.appendChild(findMeLabel);

                const findMeInput = document.createElement('input');
                findMeInput.type = 'button';
                findMeInput.id = 'find-me';
                findMeInput.value = 'Scroll';
                findMeInput.style.width = 'auto';
                findMeInput.style.padding = '8px';
                findMeInput.style.border = '1px solid #ccc';
                findMeInput.style.borderRadius = '4px';
                findMeInput.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                findMeInput.style.color = 'white';
                findMeDIV.appendChild(findMeInput);

                // Add validation to target input
                findMeInput.addEventListener('click', function(el) {
                    findMe.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center', // or 'start', 'end', 'nearest'
                        inline: 'nearest'
                    });
                });

                container.appendChild(findMeDIV);

                document.body.appendChild(container);
            } else if (document.location.href.includes("https://demonicscans.org/active_wave.php") || 
                       document.location.href.includes("https://demonicscans.org/battle.php") ){
                // Create target stamina input
                const targetContainer = document.createElement('div');
                targetContainer.style.marginBottom = '10px';

                const targetLabel = document.createElement('label');
                targetLabel.textContent = 'Stamina to Gain:';
                targetLabel.style.display = 'block';
                targetLabel.style.marginBottom = '5px';
                targetLabel.style.fontWeight = 'bold';
                targetLabel.style.color = '#ffdd00';
                targetContainer.appendChild(targetLabel);

                const targetInput = document.createElement('input');
                targetInput.type = 'number';
                targetInput.id = 'stamina-target';
                targetInput.placeholder = 'Must be divisible by 2';
                targetInput.value = targetStamina;
                targetInput.min = '2';
                targetInput.step = '2';
                targetInput.style.width = 'auto';
                targetInput.style.padding = '8px';
                targetInput.style.border = '1px solid #ccc';
                targetInput.style.borderRadius = '4px';
                targetInput.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                targetInput.style.color = 'white';
                targetContainer.appendChild(targetInput);

                // Add validation to target input
                targetInput.addEventListener('change', function() {
                    const value = parseInt(this.value);
                    if (!isNaN(value) && value % 2 !== 0) {
                        this.style.borderColor = '#f44336';
                        alert('Stamina amount must be divisible by 2!');
                    } else {
                        this.style.borderColor = '#ccc';
                    }
                    localStorage.setItem('staminaTarget', targetInput.value);
                });

                container.appendChild(targetContainer);

                // Create min chapter input
                const minContainer = document.createElement('div');
                minContainer.style.marginBottom = '10px';

                const minLabel = document.createElement('label');
                minLabel.textContent = 'Starting Chapter:';
                minLabel.style.display = 'block';
                minLabel.style.marginBottom = '5px';
                minLabel.style.fontWeight = 'bold';
                minLabel.style.color = '#ffdd00';
                minContainer.appendChild(minLabel);

                const minInput = document.createElement('input');
                minInput.type = 'number';
                minInput.id = 'min-chapter';
                minInput.placeholder = 'Start from chapter';
                minInput.value = minChap;
                minInput.min = '1';
                minInput.style.width = 'auto';
                minInput.style.padding = '8px';
                minInput.style.border = '1px solid #ccc';
                minInput.style.borderRadius = '4px';
                minInput.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                minInput.style.color = 'white';
                minContainer.appendChild(minInput);

                container.appendChild(minContainer);

                // Create auto-detect button
                const autoDetectBtn = document.createElement('button');
                autoDetectBtn.innerHTML = 'Auto-Detect Max Possible';
                autoDetectBtn.style.padding = '8px 12px';
                autoDetectBtn.style.backgroundColor = '#2196F3';
                autoDetectBtn.style.color = 'white';
                autoDetectBtn.style.border = 'none';
                autoDetectBtn.style.borderRadius = '4px';
                autoDetectBtn.style.cursor = 'pointer';
                autoDetectBtn.style.fontSize = '12px';
                autoDetectBtn.style.marginBottom = '10px';
                autoDetectBtn.style.width = '100%';

                // Add hover effect to auto-detect button
                autoDetectBtn.style.transition = 'background-color 0.3s';
                autoDetectBtn.onmouseover = function() {
                    this.style.backgroundColor = '#0b7dda';
                };
                autoDetectBtn.onmouseout = function() {
                    this.style.backgroundColor = '#2196F3';
                };

                // Auto-detect button click handler
                autoDetectBtn.addEventListener('click', function() {
                    try {
                        if (isNaN(currentStamina) || isNaN(maxStamina)) {
                            alert('Could not parse stamina values!');
                            return;
                        }

                        // Calculate available stamina (difference)
                        const staminaDifference = maxStamina - currentStamina;

                        // Round down to nearest even number
                        const maxPossibleStamina = Math.floor(staminaDifference / 2) * 2;

                        if (maxPossibleStamina <= 0) {
                            alert('Not enough stamina! You need at least 2 stamina to process chapters.');
                            return;
                        }

                        // Set the target stamina value
                        targetInput.value = maxPossibleStamina;

                        alert(`Auto-detected: You can gain ${maxPossibleStamina} stamina (${maxPossibleStamina/2} chapters)`);
                        localStorage.setItem('staminaTarget', targetInput.value);
                    } catch (error) {
                        console.error('Error auto-detecting stamina:', error);
                        alert('Error auto-detecting stamina. Check console for details.');
                    }
                });

                container.appendChild(autoDetectBtn);

                // Create the main button
                const button = document.createElement('button');
                button.id = 'stamina-button';
                button.innerHTML = 'Get Stamina!';
                button.style.padding = '10px 16px';
                button.style.backgroundColor = '#4CAF50';
                button.style.color = 'white';
                button.style.border = 'none';
                button.style.borderRadius = '4px';
                button.style.cursor = 'pointer';
                button.style.fontSize = '14px';
                button.style.width = '100%';
                button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                button.style.fontWeight = 'bold';

                // Add hover effect
                button.style.transition = 'background-color 0.3s';
                button.onmouseover = function() {
                    if (!this.disabled) {
                        this.style.backgroundColor = '#45a049';
                    }
                };
                button.onmouseout = function() {
                    if (!this.disabled) {
                        this.style.backgroundColor = '#4CAF50';
                    }
                };

                // Check if daily limit is reached and update button accordingly
                function updateButtonState() {
                    //console.log(`Local : ${dailyStamina} | Storage : ${localStorage.getItem('dailyStamina')}`);
                    if (dailyStamina >= dailyLimit) {
                        button.disabled = true;
                        button.style.backgroundColor = '#999';
                        button.style.cursor = 'not-allowed';
                        startCountdown();
                    } else {
                        button.disabled = false;
                        button.style.backgroundColor = '#4CAF50';
                        button.style.cursor = 'pointer';
                        button.textContent = 'Get Stamina!';
                    }
                }

                // Start countdown timer until midnight
                function startCountdown() {
                    function updateCountdown() {
                        const now = new Date();
                        const localOffset = now.getTimezoneOffset() * 60 * 1000;
                        const istOffset = 5.5 * 60 * 60 * 1000;
                        const currentIST = new Date(now.getTime() + localOffset + istOffset);
                        const midnightIST = new Date(currentIST);
                        midnightIST.setHours(24, 0, 0, 0);

                        const timeLeft = midnightIST - currentIST;
                        console.log(`Time until reset : ${parseInt(timeLeft/1000)}s`);
                        if (timeLeft <= 6000) {
                            // Reset daily stamina at midnight
                            console.log("Reseting stamina, because there is 6 seconds left.");
                            dailyStamina = 0;
                            localStorage.setItem('dailyStamina', '0');
                            updateButtonState();
                        } else {
                            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                            button.innerText = `Resets in: \r\n ${hours}h ${minutes}m ${seconds}s \r\n Daily Limit Reached`;
                            setTimeout(updateCountdown, 1000);
                        }
                    }

                    updateCountdown();
                }

                // Initial button state check
                updateButtonState();

                // Add click handler
                button.addEventListener('click', async function() { await getStaminaButton() });

                // Add button to container
                container.appendChild(button);
                
                document.body.appendChild(container);
                // Target Inputs and check boxes
                // Create target stamina input 
                if (document.location.href.includes("https://demonicscans.org/active_wave.php")){
                    renderMonsters(document.querySelector('.wave-chip.active').href.split('php')[1])
                    // t = setInterval(function(){renderMonsters(document.querySelector('.wave-chip.active').href.split('php')[1])}, 1000 * 3);
                }

                function getRandomDelay(minMs, maxMs) {
                    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
                }

                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                
                function getStamina(chapID = 0) {
                    return fetch('https://demonicscans.org/postreaction.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: 'useruid=' + reactID + '&chapterid=' + chapID + '&reaction=' + (Math.floor(Math.random() * 5) + 1),
                    })
                        .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.text();
                    })
                        .then(responseText => {
                        // Check if the response contains the success message for stamina farming
                        if (responseText.includes("updated")) {
                            console.log("You've already reacted to this chapter :  " + chapID);
                            return responseText;
                        } else if (responseText.includes("added")) {
                            console.log("Stamina successfully farmed for chapter " + chapID);
                            return responseText;
                        }
                        console.log("Unexpected response: " + responseText);
                        return responseText;
                    })
                        .catch(error => {
                        console.error('Error posting to chapter ' + chapID + ':', error);
                        throw error;
                    });
                }

                async function getStaminaButton(){
                    const targetStaminaValue = parseInt(targetInput.value);
                    const startChapter = parseInt(minInput.value) || 1;

                    // Validate input
                    if (isNaN(targetStaminaValue) || targetStaminaValue < 2) {
                        alert('Please enter a valid amount of stamina to gain (minimum 2)');
                        return;
                    }

                    if (targetStaminaValue % 2 !== 0) {
                        alert('Stamina amount must be divisible by 2!');
                        return;
                    }

                    // Check if we would exceed daily limit
                    if (dailyStamina + targetStaminaValue >= dailyLimit) {
                        const remainingStamina = dailyLimit - dailyStamina;
                        if (remainingStamina > 0) {
                            /*
                        if (!confirm(`You can only gain ${remainingStamina} more stamina today (${dailyStamina}/${dailyLimit}). Would you like to proceed with this amount?`)) {
                            return;
                        }
                        // Adjust target to remaining stamina
                        targetInput.value = Math.floor(remainingStamina / 2) * 2;
                        */
                        } else {
                            return alert('Daily stamina limit reached! Please try again after midnight.');
                        }
                    }
                    if (dailyStamina >= dailyLimit){
                        updateButtonState();
                        console.log(`STAMINA GAINED: ${staminaGained} from chapters ${startChapter} to ${startChapter + processed - 1}`);
                        //alert(`Stamina collection stopped! \n Gained ${staminaGained} stamina from ${processed} chapters.\n Any more and it would waste your stamina gains!`);
                        return alert('Daily stamina limit reached! Please try again after midnight.222');
                    }
                    // Calculate how many chapters to process
                    const chaptersToProcess = targetStaminaValue / 2;
                    const endChapter = startChapter + chaptersToProcess;

                    // Save values to localStorage
                    localStorage.setItem('staminaTarget', targetInput.value);
                    localStorage.setItem('staminaMinChap', endChapter);

                    button.disabled = true;
                    button.textContent = 'Processing...';
                    button.style.backgroundColor = '#999';

                    let processed = 0;
                    const total = chaptersToProcess;
                    let staminaGained = 0;

                    let staminaDifference = maxStamina - currentStamina;

                    for (let index = startChapter; index < endChapter; index++) {
                        if (staminaGained >= staminaDifference){
                            updateButtonState();
                            console.log(`STAMINA GAINED: ${staminaGained} from chapters ${startChapter} to ${startChapter + processed - 1}`);
                            //alert(`Stamina collection stopped! \n Gained ${staminaGained} stamina from ${processed} chapters.\n Any more and it would waste your stamina gains!`);
                            break;
                        }
                        try {
                            const response = await getStamina(index);
                            await sleep(getRandomDelay(1000,5000));
                            if (response && response.includes("added")) {
                                staminaGained += 2;
                                dailyStamina += 2;
                                localStorage.setItem('dailyStamina', dailyStamina.toString());
                            }
                        } catch (error) {
                            console.error('Error processing chapter ' + index + ':', error);
                        }

                        processed++;

                        // Update button text with progress
                        if (processed % 5 === 0 || processed === total) {
                            button.textContent = `Processing... (${processed}/${total})`;
                        }

                        // Check if we hit daily limit during processing
                        if (dailyStamina >= dailyLimit) {
                            console.log(`Daily limit reached during processing. Processed ${processed} chapters.`);
                            break;
                        }

                        // Add a small delay between requests
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }


                    // Update button state after processing
                    updateButtonState();

                    if (dailyStamina >= dailyLimit) {
                        //alert(`MAX_STAMINA_FARM_REACHED! Processed ${processed} chapters. Daily limit reached.`);
                    } else {
                        console.log(`STAMINA GAINED: ${staminaGained} from chapters ${startChapter} to ${startChapter + processed - 1}`);
                        //alert(`Stamina collection complete! Gained ${staminaGained} stamina from ${processed} chapters.`);
                    }

                    // Increase the min chapter for next time
                    const newMinChapter = parseInt(minInput.value) + processed;
                    localStorage.setItem('staminaMinChap', newMinChapter.toString());
                    minInput.value = newMinChapter;
                }

                async function renderMonsters(gateNumber = "?gate=3&wave=3") {
                    if (document.location.href != gateNumber){
                        gateNumber = document.location.href;
                    }
                    let monsters = [];
                    let lootMonsters = [];
                    let activeMonsters = [];

                    let doc = await fetch("https://demonicscans.org/active_wave.php" + gateNumber, {
                        "method": "POST",
                        "headers": {
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    })
                    .then(response => response.text())
                    .then(html => {
                        let parser = new DOMParser();
                        return parser.parseFromString(html, 'text/html');
                    });
                    let allCards = Array.from(doc.querySelector('.monster-container').children);
                    let position;

                    // Process non-grayscale monsters
                    let images = doc.querySelectorAll('img.monster-img:not(.grayscale)');
                    for (let index = 0; index < images.length; index++){
                        let el = images[index]
                        let monster = el.parentElement;
                        let monsterHP = monster.querySelector(':nth-child(4)').textContent.split(' ');
                        let monsterPlayers = parseInt(monster.querySelector(':nth-child(5)').textContent.split(' ')[3].split('/')[0]);
                        if (monster.querySelector(':nth-child(7)').innerText != "FULL" && monster.querySelector(':nth-child(7)').innerText != "Requires Level 50") {
                            let monsterId = monster.querySelector('a').href.split('id=')[1];
                            monsters.push({
                                id: monsterId,
                                name: monster.querySelector('h3').innerText,
                                image: monster.querySelector('img').src,
                                action: monster.querySelector(":nth-child(7)").innerText,
                                HP_Cur: monsterHP[1],
                                HP_Max: monsterHP[3],
                                Players_Cur: (monsterPlayers || 0),
                                Players_Max: 20
                            });
                        } else if (monster.querySelector(':nth-child(7)').innerText.includes("Continue the Battle")) {
                            activeMonsters.push({
                                id: monster.querySelector('a').href.split('id=')[1],
                                name: monster.querySelector('h3').innerText,
                                image: monster.querySelector('img').src,
                                action: monster.querySelector(":nth-child(7)").innerText,
                                HP_Cur: monsterHP[1],
                                HP_Max: monsterHP[3],
                                Players_Cur: (monsterPlayers || 0),
                                Players_Max: 20
                            });
                        }
                        position = allCards.indexOf(monster) + 1;
                    };

                    // Process grayscale monsters (loot monsters)
                    doc.querySelectorAll('img.monster-img.grayscale').forEach(async (el) => {
                        let monster = el.parentElement;
                        let monsterHP = monster.querySelector(':nth-child(4)').textContent.split(' ');
                        let monsterPlayers = parseInt(monster.querySelector(':nth-child(5)').textContent.split(' ')[3].split('/')[0]);
                        if (monster.querySelector(':nth-child(7)') != null){
                            let monsterId = monster.querySelector('a').href.split('id=')[1];
                            if (monster.querySelector(':nth-child(7)').innerText.includes("Loot") && (position >= allCards.indexOf(monster) + 1) && (ignoreList.includes(monsterId) == false) ) {
                                await sleep(getRandomDelay(1000,5000));
                                await fetch("https://demonicscans.org/loot.php", {
                                    "headers": {
                                        "content-type": "application/x-www-form-urlencoded",
                                    },
                                    "referrer": "https://demonicscans.org/battle.php?id=" + monsterId,
                                    "body": "monster_id=" + monsterId + "&user_id="+ userID,
                                    "method": "POST",
                                }).then(res => res.json()).then(data => {
                                    if(data.message.includes('You already claimed your loot.')){
                                        ignoreList.push(monsterId);
                                    }
                                });
                                lootMonsters.push({
                                    id: monsterId,
                                    name: monster.querySelector('h3').innerText,
                                    image: monster.querySelector('img').src,
                                    action: monster.querySelector(":nth-child(7)").innerText,
                                    HP_Cur: monsterHP[1],
                                    HP_Max: monsterHP[3],
                                    Players_Cur: (monsterPlayers || 0),
                                    Players_Max: 20
                                });
                            }
                        }
                    });

                    let sortedMonsters = [
                        ...lootMonsters.sort((a, b) => a.id - b.id),
                        ...activeMonsters.sort((a, b) => a.id - b.id),
                        ...monsters.sort((a, b) => a.id - b.id)
                    ];

                    // return sortedMonsters;
                    let monsterContainer = document.querySelector('.monster-container');
                    let monstersHTML = ""
                    sortedMonsters.forEach((el) => {
                        let monster = el;
                        let monsterDiv = `<div class="monster-card"> <img src="${monster.image}" class="monster-img ${(monster.action.includes('Loot')) ? 'grayscale' : '' }"alt="Monster"> <h3>${monster.name}</h3><div class="hp-bar"><div class="hp-fill" style="width:${(monster.HP_Cur == 0) ? 0 : (parseFloat(monster.HP_Cur.replaceAll(',', '')/monster.HP_Max.replaceAll(',', '')) ) * 100}%"></div></div> <div>❤️ ${monster.HP_Cur} / ${monster.HP_Max} HP</div><div>👥 Players Joined ${monster.Players_Cur}/${monster.Players_Max}</div><br> <a href="battle.php?id=${monster.id}"><button class="join-btn" ${(monster.action.includes('Continue the Battle')) ? 'style="background:#e67e22;"' : ''}>${monster.action}</button></a></div>`;
                        monstersHTML += monsterDiv;
                    })

                    document.querySelector('.gtb-inner').innerHTML = doc.querySelector('.gtb-inner').innerHTML;
                    (function() {
                        // Get the current time in IST (UTC+5:30)
                        const now = new Date();
                        const utcOffset = now.getTimezoneOffset() * 60 * 1000;
                        const istOffset = 5.5 * 60 * 60 * 1000;
                        const istTime = new Date(now.getTime() + utcOffset + istOffset);

                        // Calculate seconds until next full hour in IST
                        const currentMinutes = istTime.getMinutes();
                        const currentSeconds = istTime.getSeconds();
                        const secsUntilNextHour = (59 - currentMinutes) * 60 + (60 - currentSeconds);

                        let secs = secsUntilNextHour;
                        const tEl = document.getElementById('stamina_timer');

                        function mmss(total) {
                            const m = Math.floor(total / 60);
                            const s = total % 60;
                            return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
                        }

                        function tick() {
                            tEl.textContent = '⏳ ' + mmss(secs);

                            if (secs <= 0) {
                                // Reset timer for the next hour
                                secs = 3600;
                            }
                            secs--;
                        }

                        // Initial update
                        tick();

                        // Set up the interval
                        setInterval(tick, 1000);
                    })();

                    monsterContainer.innerHTML = monstersHTML;
                    monsterContainer.querySelectorAll('.join-btn').forEach((el) => {
                        if (el.innerText.includes("Join the Battle")) {
                            el.parentElement.parentElement.children[0].addEventListener('click', function (){
                                document.location.href = el.parentElement.href;
                            });
                            el.parentElement.parentElement.children[1].addEventListener('click', function (){
                                document.location.href = el.parentElement.href;
                            });
                            el.addEventListener('click', function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                fetch('https://demonicscans.org/user_join_battle.php', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                    body: 'monster_id=' + el.parentElement.href.split('=')[1] + '&user_id=' + userID,
                                })
                                    .then(res => res.text())
                                    .then(data => {
                                    window.location.href = el.parentElement.href;
                                })
                                    .catch(() => console.error("Server error"));
                            });
                        }
                    });
                }
            }
        });
    }
})();