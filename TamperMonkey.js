// ==UserScript==
// @name         Veyra Helper Widget
// @namespace    http://tampermonkey.net/
// @version      1.14
// @description  Collect specific amount of stamina with auto-detection
// @author       You
// @match        https://demonicscans.org/*
// @grant        none
// ==/UserScript==

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
    if(localStorage.getItem('enemy-targets') == null){
        localStorage.setItem('enemy-targets', 'false,false,false,false,false')
    }
    let tempArray = localStorage.getItem('enemy-targets');

    let dailyStamina = parseInt(localStorage.getItem('dailyStamina'));
    let reactID = getCookieByName('useruid');

    var t; // Timer/Interval ID

    const enemies = ['Goblin Slinger', 'Goblin Skirmisher', 'Orc Grunt', 'Orc Bonecrusher', 'Hobgoblin Spearman', 'Troll Ravager', 'Lizardman Flamecaster', 'Lizardman Shadowclaw', 'Troll Brawler'];

    function getEnemyStatus(targetName) {
        const booleanValues = tempArray.split(',').map(val => val.toLowerCase() === 'true');
        const index = enemies.indexOf(targetName);
        if (index === -1) {
            return null;
        }
        return booleanValues[index];
    }


    function setEnemyStatusToFalse(targetName) {
        const index = enemies.indexOf(targetName);
        if (index === -1) {
            return null;
        }

        // Split, modify, and update
        tempArray = tempArray.split(',');
        tempArray[index] = 'false';
        document.getElementById('enemy-target-'+index).checked = false;
        tempArray = tempArray.join(',');

        // Save to localStorage
        localStorage.setItem('enemy-targets', tempArray);

        return tempArray;
    }

    let url = document.location.href;
    const currentUrl = new URL(url);
    const currentPath = currentUrl.pathname;

    const allowedPaths = [
        '/game_dash.php',
        '/pvparena.php',
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
    //if (document.location.href.includes("https://demonicscans.org/active_wave.php") ? document.querySelector('.monster-container').innerHTML = ""; : return null
    if (allowedPaths.includes(currentPath)) {
        window.addEventListener('load', function() {
            if (document.location.href == ("https://demonicscans.org/pvparena.php")) {
                //fetch('')
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
                const rect = container.getBoundingClientRect();
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
                document.querySelector('.gates-flex').appendChild(pvpArena);
            } else if (document.location.href == ("https://demonicscans.org/pvparena.php")) {
                alert(document.location.href);
                alert("HEHEHE");
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
            }
            else if (document.location.href.includes("https://demonicscans.org/active_wave.php") ||
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
                        if (timeLeft <= 60) {
                            // Reset daily stamina at midnight
                            //console.log("Reseting stamina");
                            return setTimeout( () => {
                                dailyStamina = 0;
                                localStorage.setItem('dailyStamina', '0');
                                updateButtonState();
                            }, 1000 * 60)
                        }

                        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                        button.innerText = `Resets in: \r\n ${hours}h ${minutes}m ${seconds}s \r\n Daily Limit Reached`;

                        setTimeout(updateCountdown, 1000);
                    }

                    updateCountdown();
                }

                // Initial button state check
                updateButtonState();

                // Add click handler
                button.addEventListener('click', async function() { await getStaminaButton() });

                // Add button to container
                container.appendChild(button);


                const fullAttack = document.createElement('button');
                fullAttack.innerHTML = 'Using ALL STAMINA';
                fullAttack.style.padding = '8px 12px';
                fullAttack.style.backgroundColor = '#ff0000';
                fullAttack.style.color = 'white';
                fullAttack.style.border = 'none';
                fullAttack.style.borderRadius = '4px';
                fullAttack.style.cursor = 'pointer';
                fullAttack.style.fontSize = '12px';
                fullAttack.style.marginTop = '10px';
                fullAttack.style.marginBottom = '10px';
                fullAttack.style.width = '100%';
                fullAttack.addEventListener('click', ()=>{
                    let tempID = parseInt(document.location.href.split('id=')[1]);
                    console.log(tempID);
                    fullDamage(tempID);
                });
                container.appendChild(fullAttack);

                // Create target stamina input
                const damageContainer = document.createElement('div');
                targetContainer.style.marginBottom = '10px';

                const damageLabel = document.createElement('label');
                damageLabel.textContent = 'Damage to deal:';
                damageLabel.style.display = 'block';
                damageLabel.style.marginBottom = '5px';
                damageLabel.style.fontWeight = 'bold';
                damageLabel.style.color = '#ffdd00';
                damageContainer.appendChild(damageLabel);

                const damageInput = document.createElement('input');
                damageInput.type = 'number';
                damageInput.id = 'damage-target';
                damageInput.value = parseInt(localStorage.getItem('lastDamage')) || 71000;
                damageInput.min = '1000';
                damageInput.step = '100';
                damageInput.style.width = 'auto';
                damageInput.style.padding = '8px';
                damageInput.style.border = '1px solid #ccc';
                damageInput.style.borderRadius = '4px';
                damageInput.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                damageInput.style.color = 'white';
                damageInput.addEventListener('change', function(){
                    localStorage.setItem('lastDamage', this.value);
                    preciseAttack.innerHTML = 'Making ' + formatNumberCompact(this.value) + ' DMG';
                });
                damageContainer.appendChild(damageInput);

                container.appendChild(damageContainer);

                const preciseAttack = document.createElement('button');
                preciseAttack.innerHTML = `Making ${formatNumberCompact(parseInt(localStorage.getItem('lastDamage')))} DMG`;
                preciseAttack.style.padding = '8px 12px';
                preciseAttack.style.backgroundColor = '#990099';
                preciseAttack.style.color = 'white';
                preciseAttack.style.border = 'none';
                preciseAttack.style.borderRadius = '4px';
                preciseAttack.style.cursor = 'pointer';
                preciseAttack.style.fontSize = '12px';
                preciseAttack.style.marginTop = '10px';
                preciseAttack.style.marginBottom = '10px';
                preciseAttack.style.width = '100%';
                preciseAttack.addEventListener('click', () => {preciseDamage(document.location.href.split("id=")[1]);});
                container.appendChild(preciseAttack);

                document.body.appendChild(container);

                // Target Inputs and check boxes
                // Create target stamina input
                const markingContainer = document.createElement('div');
                markingContainer.style.display = 'flex';
                markingContainer.style.flexWrap = 'wrap';
                markingContainer.style.marginTop = '10px';
                markingContainer.style.marginBottom = '10px';

                if (document.location.href.includes("https://demonicscans.org/active_wave.php")){
                    renderMonsters(document.querySelector('.wave-chip.active').href.split('php')[1])
                    t=setInterval(function(){renderMonsters(document.querySelector('.wave-chip.active').href.split('php')[1])}, 1000 * 3);

                    let boxDiv;
                    enemies.forEach(function(entity, index) {
                        boxDiv = document.createElement('div');
                        boxDiv.style.display = 'flex';
                        let markCheckBox = document.createElement('input');
                        markCheckBox.type = 'checkbox';
                        markCheckBox.id = 'enemy-target-' + index;
                        markCheckBox.checked = tempArray.split(',')[index] === 'true';
                        markCheckBox.value = tempArray.split(',')[index];
                        markCheckBox.style.padding = '8px';
                        markCheckBox.style.border = '1px solid #ccc';
                        markCheckBox.style.borderRadius = '4px';
                        markCheckBox.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        markCheckBox.style.color = 'white';
                        markCheckBox.addEventListener('change', function(e){
                            tempArray = tempArray.split(',');
                            tempArray[index] = e.target.checked.toString();
                            tempArray = tempArray.join(',');
                            localStorage.setItem('enemy-targets', tempArray);
                        });
                        boxDiv.appendChild(markCheckBox);

                        const markLabel = document.createElement('label');
                        markLabel.textContent = entity;
                        markLabel.style.width = 'auto';
                        markLabel.style.display = 'block';
                        markLabel.style.marginBottom = '5px';
                        markLabel.style.fontWeight = 'bold';
                        markLabel.style.color = '#ffdd00';
                        boxDiv.appendChild(markLabel);
                        markingContainer.appendChild(boxDiv);
                    })
                    container.appendChild(markingContainer);
                }


                function formatNumberCompact(num) {
                    if (num >= 1000000) {
                        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
                    } else if (num >= 1000) {
                        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
                    }
                    return num.toString();
                }

                async function fullDamage(monsterID = 0) {
                    try {
                        for (let index = 0; index < currentStamina; index++) {
                            let status = await damage(monsterID);
                            console.log(status);
                        }
                    } catch (error) {
                        console.error('Error auto-detecting stamina:', error);
                        alert('Error auto-detecting stamina. Check console for details.');
                    }
                    setTimeout(function() {
                        if(document.location.href.includes("battle.php?id=")){
                            document.location.href = document.location.href;
                        }
                    }, Math.max(1000, 1 * 100));
                }

                async function preciseDamage(monsterID = 0) {
                    let damageVAL = parseInt(document.getElementById('damage-target').value);
                    let tempData = await fetch('https://demonicscans.org/damage.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: 'user_id=' + userID + '&monster_id=' + monsterID + '&skill_id=0&stamina_cost=1'
                    }).catch(function(error) {
                        console.error('Error : ', error);
                    }).then(response => {return response.json();});
                    let damageINT = parseInt(tempData.message.split('<strong>')[1].split('</strong>')[0].replace(/,/g, ""));
                    damageVAL -= damageINT;
                    while (damageVAL > 0 ) {
                        if (damageVAL + damageINT <= damageINT){
                            console.log("Precise Damage have been dealt")
                            return true;
                            //return document.location.href = document.location.href;
                        } else {
                            damageVAL -= await damage(monsterID);
                        }
                    }
                    setTimeout(function() {
                        if(document.location.href.includes("battle.php?id=")){
                            document.location.href = document.location.href;
                        }
                    }, Math.max(1000, 1 * 100));
                }

                async function damage(monsterID = 0) {
                    return fetch('https://demonicscans.org/damage.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: 'user_id=' + userID + '&monster_id=' + monsterID + '&skill_id=0&stamina_cost=1'
                    }).then(res => res.json())
                        .then(data => {
                        if(data.status == "success"){
                            return parseInt(data.message.split('<strong>')[1].split('</strong>')[0].match(/[0-9]+/g).join(''));
                        } else if (data.message.includes("Not enough stamina.") ) {
                            let temptargetStaminaValue = parseInt(targetInput.value);
                            targetInput.value = 2;
                            document.getElementById('stamina-button').click();
                            targetInput.value = temptargetStaminaValue;
                            return parseInt(0);
                        } else if (data.message.includes("Monster is already dead")) {
                            return parseInt(999999999);
                        }
                    });
                }


                function getStamina(chapID = 0) {
                    return fetch('https://demonicscans.org/postreaction.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: 'useruid=' + reactID + '&chapterid=' + chapID + '&reaction=1'
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

                async function renderMonsters(gateNumber = "?gate=3") {
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
                            if (getEnemyStatus(monster.querySelector('h3').innerText.trim()) && monster.querySelector(":nth-child(7)").innerText.includes("Join the Battle")){
                                let tempData = await fetch('https://demonicscans.org/user_join_battle.php', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                    body: 'monster_id=' + monsterId + '&user_id=' + userID,
                                }).then(res => {return res.text()});
                                //console.log(tempData);
                                if(tempData.includes("You have successfully joined the battle.") || tempData.includes("You are already part of this battle.")){
                                    let status = await preciseDamage(parseInt(monsterId));
                                    //setEnemyStatusToFalse(monster.querySelector('h3').innerText.trim());
                                    console.log((status == true) ? "Precise Damage have been dealt to " + monster.querySelector('h3').innerText.trim() : "")
                                    await new Promise(resolve => setTimeout(resolve, 1000 * 3));
                                } else if (tempData.includes("You can only join 3 monsters at a time.")){
                                    //console.log("waiting");
                                }
                            }
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

                    if (document.getElementById('stamina_span').innerText.includes('0')) {
                        let temptargetStaminaValue = parseInt(targetInput.value);
                        targetInput.value = 2;
                        document.getElementById('stamina-button').click();
                        targetInput.value = temptargetStaminaValue;
                    } else {
                        console.log("Restoring some stamina");
                    }

                    monsterContainer.innerHTML = monstersHTML;
                    monsterContainer.querySelectorAll('.join-btn').forEach((el) => {
                        if (el.innerText.includes("Join the Battle")) {
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