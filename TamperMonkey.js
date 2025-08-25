// ==UserScript==
// @name         Stamina Collector
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Collect specific amount of stamina with auto-detection
// @author       You
// @match        https://demonicscans.org/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Wait for the page to load completely
    window.addEventListener('load', function() {
        // Load saved values or use defaults
        let targetStamina = localStorage.getItem('staminaTarget') || '80';
        let minChap = localStorage.getItem('staminaMinChap') || '1';

        // Create the UI container
        const container = document.createElement('div');
        container.id = 'stamina-container';
        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.right = '10px';
        container.style.zIndex = '9999';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        container.style.padding = '10px';
        container.style.borderRadius = '8px';
        container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
        container.style.color = 'white';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.minWidth = '280px';

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
        targetInput.style.width = '100%';
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
        minInput.style.width = '100%';
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
                // Find stamina elements
                const staminaElement = document.querySelector('.gtb-value');
                if (!staminaElement) {
                    alert('Stamina element not found! Make sure you\'re on a page that displays stamina.');
                    return;
                }

                // Parse stamina values
                const Staminas = staminaElement.textContent.trim().split(' / ');
                const currentStamina = parseInt(Staminas[0]);
                const maxStamina = parseInt(Staminas[1]);

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
            this.style.backgroundColor = '#45a049';
        };
        button.onmouseout = function() {
            this.style.backgroundColor = '#4CAF50';
        };

        // Add click handler
        button.addEventListener('click', function() {
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

            for (let index = startChapter; index < endChapter; index++) {
                getStamina(index);
                processed++;

                // Update button text with progress
                if (processed % 5 === 0 || processed === total) {
                    button.textContent = `Processing... (${processed}/${total})`;
                }
            }

            console.log(`STAMINA GAINED: ${targetStaminaValue} from chapters ${startChapter} to ${endChapter-1}`);

            // Re-enable button after a short delay
            setTimeout(function() {
                button.disabled = false;
                button.textContent = 'Get Stamina!';
                button.style.backgroundColor = '#4CAF50';
                // localStorage.setItem('staminaMinChap', endChapter);
                alert(`Stamina collection complete! Gained ${targetStaminaValue} stamina from ${total} chapters.`);
            }, Math.max(2000, total * 100)); // Longer delay for more chapters
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

        // Add the container to the page
        document.body.appendChild(container);

        function getStamina(chapID = 0) {
            fetch('https://demonicscans.org/submitcmnt.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'userid=73553&chapterid=' + chapID + '&commentcontent=Give%20me%20stamina!&replyto=0'
            }).catch(function(error) {
                console.error('Error posting to chapter ' + chapID + ':', error);
            });
        }
    });
})();