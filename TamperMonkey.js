// ==UserScript==
// @name         Stamina Collector
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Collect specific amount of stamina with auto-detection
// @author       You
// @match        https://demonicscans.org/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let url = document.location.href;
    const currentUrl = new URL(url);
    const currentPath = currentUrl.pathname;

    const allowedPaths = [
        '/game_dash.php',
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
        '/guide.php',
        '/achievements.php',
        '/merchant.php'
    ];

    if (allowedPaths.includes(currentPath)) {
        window.addEventListener('load', function() {
            // Load saved values or use defaults
            let targetStamina = localStorage.getItem('staminaTarget') || '80';
            let minChap = localStorage.getItem('staminaMinChap') || '1';
            let userID = parseInt(getCookieByName('demon'));

            // Check if button is blocked
            const blockUntil = localStorage.getItem('staminaBlockUntil');
            const isBlocked = blockUntil && new Date().getTime() < parseInt(blockUntil);

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
            container.style.position = 'fixed';
            container.style.top = '100px';
            container.style.right = '50px';
            container.style.zIndex = '9999';
            container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            container.style.padding = '10px';
            container.style.borderRadius = '8px';
            container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
            container.style.color = 'white';
            container.style.fontFamily = 'Arial, sans-serif';
            container.style.maxWidth = '180px';

            // Create title
            const title = document.createElement('h3');
            title.textContent = 'Stamina Collector';
            title.style.margin = '0 0 10px 0';
            title.style.fontSize = '14px';
            title.style.color = '#ffdd00';
            container.appendChild(title);

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
                } catch (error) {
                    console.error('Error auto-detecting stamina:', error);
                    alert('Error auto-detecting stamina. Check console for details.');
                }
            });

            container.appendChild(autoDetectBtn);

            // Create the main button
            const button = document.createElement('button');
            button.innerHTML = isBlocked ? 'Blocked for 12h' : 'Get Stamina!';
            button.style.padding = '10px 16px';
            button.style.backgroundColor = isBlocked ? '#999' : '#4CAF50';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.cursor = isBlocked ? 'not-allowed' : 'pointer';
            button.style.fontSize = '14px';
            button.style.width = '100%';
            button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            button.style.fontWeight = 'bold';
            button.disabled = isBlocked;

            // Add hover effect only if not blocked
            if (!isBlocked) {
                button.style.transition = 'background-color 0.3s';
                button.onmouseover = function() {
                    this.style.backgroundColor = '#45a049';
                };
                button.onmouseout = function() {
                    this.style.backgroundColor = '#4CAF50';
                };
            }

            // Add click handler
            button.addEventListener('click', async function() {
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

                // Calculate how many chapters to process
                const chaptersToProcess = targetStaminaValue / 2;
                const endChapter = startChapter + chaptersToProcess;

                // Save values to localStorage
                localStorage.setItem('staminaTarget', targetStaminaValue);
                localStorage.setItem('staminaMinChap', endChapter);

                button.disabled = true;
                button.textContent = 'Processing...';
                button.style.backgroundColor = '#999';

                let processed = 0;
                const total = chaptersToProcess;
                let maxStaminaReached = false;

                for (let index = startChapter; index < endChapter; index++) {
                    const success = await getStamina(index);

                    if (!success) {
                        maxStaminaReached = true;
                        break;
                    }

                    processed++;

                    // Update button text with progress
                    if (processed % 5 === 0 || processed === total) {
                        button.textContent = `Processing... (${processed}/${total})`;
                    }

                    // Add a small delay between requests
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                if (maxStaminaReached) {
                    // Block the button for 12 hours (43200000 milliseconds)
                    const blockUntil = new Date().getTime() + 12 * 60 * 60 * 1000;
                    localStorage.setItem('staminaBlockUntil', blockUntil.toString());

                    // Increase the min chapter for next time
                    const newMinChapter = parseInt(minInput.value) + processed + 1;
                    localStorage.setItem('staminaMinChap', newMinChapter.toString());
                    minInput.value = newMinChapter;

                    button.disabled = true;
                    button.textContent = 'Blocked for 12h';
                    button.style.backgroundColor = '#999';
                    button.style.cursor = 'not-allowed';

                    alert(`MAX_STAMINA_FARM_REACHED! Processed ${processed} chapters. Button blocked for 12 hours.`);
                } else {
                    console.log(`STAMINA GAINED: ${targetStaminaValue} from chapters ${startChapter} to ${endChapter-1}`);

                    // Re-enable button
                    button.disabled = false;
                    button.textContent = 'Get Stamina!';
                    button.style.backgroundColor = '#4CAF50';
                    alert(`Stamina collection complete! Gained ${targetStaminaValue} stamina from ${total} chapters.`);
                }
            });

            // Add button to container
            container.appendChild(button);

            // Add validation to target input
            targetInput.addEventListener('change', function() {
                const value = parseInt(this.value);
                if (!isNaN(value) && value % 2 !== 0) {
                    this.style.borderColor = '#f44336';
                    alert('Stamina amount must be divisible by 2!');
                } else {
                    this.style.borderColor = '#ccc';
                }
            });

            const fullAttack = document.createElement('button');
            fullAttack.innerHTML = 'Using ALL STAMINA';
            fullAttack.style.padding = '8px 12px';
            fullAttack.style.backgroundColor = '#ff0000';
            fullAttack.style.color = 'white';
            fullAttack.style.border = 'none';
            fullAttack.style.borderRadius = '4px';
            fullAttack.style.cursor = 'pointer';
            fullAttack.style.fontSize = '12px';
            fullAttack.style.marginBottom = '10px';
            fullAttack.style.width = '100%';
            fullAttack.addEventListener('click', fullDamage);
            container.appendChild(fullAttack);

            const preciseAttack = document.createElement('button');
            preciseAttack.innerHTML = 'Making 70K DMG';
            preciseAttack.style.padding = '8px 12px';
            preciseAttack.style.backgroundColor = '#990099';
            preciseAttack.style.color = 'white';
            preciseAttack.style.border = 'none';
            preciseAttack.style.borderRadius = '4px';
            preciseAttack.style.cursor = 'pointer';
            preciseAttack.style.fontSize = '12px';
            preciseAttack.style.marginBottom = '10px';
            preciseAttack.style.width = '100%';
            preciseAttack.addEventListener('click', preciseDamage);
            container.appendChild(preciseAttack);

            document.body.appendChild(container);

            function fullDamage(monsterIDs = 0) {
                let monsterID = document.location.href.split("id=")[1];
                try {
                    for (let index = 0; index < currentStamina; index++) {
                        damage(monsterID);
                    }
                } catch (error) {
                    console.error('Error auto-detecting stamina:', error);
                    alert('Error auto-detecting stamina. Check console for details.');
                }
                setTimeout(function() {
                    document.location.href = document.location.href;
                }, Math.max(1000, 1 * 100));
            }

            function preciseDamage(monsterIDs = 0) {
                let monsterID = document.location.href.split("id=")[1];
                try {
                    fetch('https://demonicscans.org/damage.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: 'user_id=' + userID + '&monster_id=' + monsterID + '&skill_id=0'
                    }).catch(function(error) {
                        console.error('Error : ', error);
                    }).then(response => response.json()).then(data => {
                        let damageINT = (data.message.split('<strong>')[1].split('</strong>')[0]).replace(/,/g, "");
                        let enemyHIT = Math.ceil(71000 / damageINT);
                        if (enemyHIT > maxStamina) {
                            alert('Not enough STAMINA!');
                        }
                        for (let index = 0; index < enemyHIT; index++) {
                            damage(monsterID);
                        }
                    });
                } catch (error) {
                    console.error('Error: ', error);
                }
                setTimeout(function() {
                    document.location.href = document.location.href;
                }, Math.max(1000, 1 * 100));
            }

            function damage(monsterID = 0) {
                fetch('https://demonicscans.org/damage.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'user_id=' + userID + '&monster_id=' + monsterID + '&skill_id=0'
                });
            }

            function getStamina(chapID = 0) {
                return fetch('https://demonicscans.org/submitcmnt.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'userid=' + userID + '&chapterid=' + chapID + '&commentcontent=Give%20me%20stamina!&replyto=0'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(responseText => {
                    // Check if the response contains the success message for stamina farming
                    if (responseText.includes("MAX_STAMINA_FARM_REACHED")) {
                        console.log("Max stamina farm reached for chapter " + chapID);
                        return false;
                    } else if (responseText.includes("success")) {
                        console.log("Stamina successfully farmed for chapter " + chapID);
                        return true;
                    }
                    console.log("Unexpected response: " + responseText);
                    return false;
                })
                .catch(error => {
                    console.error('Error posting to chapter ' + chapID + ':', error);
                    return false;
                });
            }
        });

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
    }
})();