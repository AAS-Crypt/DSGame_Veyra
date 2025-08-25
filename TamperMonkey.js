// ==UserScript==
// @name         Stamina Collector
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Collect stamina with dynamic chapter range based on current stamina
// @author       You
// @match        https://demonicscans.org/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Wait for the page to load completely
    window.addEventListener('load', function() {
        // Load saved values or use defaults
        let minChap = localStorage.getItem('staminaMinChap') || '1';
        let maxChap = localStorage.getItem('staminaMaxChap') || '10';

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
        container.style.minWidth = '250px';

        // Create title
        const title = document.createElement('h3');
        title.textContent = 'Stamina Collector';
        title.style.margin = '0 0 10px 0';
        title.style.fontSize = '14px';
        title.style.color = '#ffdd00';
        container.appendChild(title);

        // Create input fields container
        const inputContainer = document.createElement('div');
        inputContainer.style.marginBottom = '10px';
        inputContainer.style.display = 'flex';
        inputContainer.style.gap = '5px';
        inputContainer.style.alignItems = 'center';

        // Create min chapter input
        const minInput = document.createElement('input');
        minInput.type = 'number';
        minInput.id = 'min-chapter';
        minInput.placeholder = 'Min Chapter';
        minInput.value = minChap;
        minInput.style.width = '80px';
        minInput.style.padding = '4px';
        minInput.style.border = '1px solid #ccc';
        minInput.style.borderRadius = '3px';
        minInput.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        minInput.style.color = 'white';

        // Create max chapter input
        const maxInput = document.createElement('input');
        maxInput.type = 'number';
        maxInput.id = 'max-chapter';
        maxInput.placeholder = 'Max Chapter';
        maxInput.value = maxChap;
        maxInput.style.width = '80px';
        maxInput.style.padding = '4px';
        maxInput.style.border = '1px solid #ccc';
        maxInput.style.borderRadius = '3px';
        maxInput.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        maxInput.style.color = 'white';

        // Add inputs to container
        inputContainer.appendChild(minInput);
        inputContainer.appendChild(document.createTextNode(' to '));
        inputContainer.appendChild(maxInput);
        container.appendChild(inputContainer);

        // Create auto-detect button
        const autoDetectBtn = document.createElement('button');
        autoDetectBtn.innerHTML = 'Auto-Detect from Stamina';
        autoDetectBtn.style.padding = '6px 12px';
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
                
                // Calculate how many chapters we can process (2 stamina per chapter)
                const chaptersToProcess = Math.floor(staminaDifference / 2);
                
                if (chaptersToProcess <= 0) {
                    alert('Not enough stamina! You need at least 2 stamina to process chapters.');
                    return;
                }

                // Set the max chapter value
                const currentMinChapter = parseInt(minInput.value) || 1;
                maxInput.value = currentMinChapter + chaptersToProcess;
                
                alert(`Auto-detected: ${chaptersToProcess} chapters can be processed with ${staminaDifference} available stamina.`);
                
            } catch (error) {
                console.error('Error auto-detecting stamina:', error);
                alert('Error auto-detecting stamina. Check console for details.');
            }
        });

        container.appendChild(autoDetectBtn);

        // Create the main button
        const button = document.createElement('button');
        button.innerHTML = 'Get Stamina!';
        button.style.padding = '8px 16px';
        button.style.backgroundColor = '#4CAF50';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.width = '100%';
        button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

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
            const minChap = parseInt(minInput.value) || 1;
            const maxChap = parseInt(maxInput.value) || 10;
            
            if (minChap >= maxChap) {
                alert('Max chapter must be greater than min chapter!');
                return;
            }

            // Save values to localStorage
            localStorage.setItem('staminaMinChap', minChap);
            localStorage.setItem('staminaMaxChap', maxChap);

            button.disabled = true;
            button.textContent = 'Processing...';
            button.style.backgroundColor = '#999';

            let processed = 0;
            const total = maxChap - minChap;

            for (let index = minChap; index < maxChap; index++) {
                getStamina(index);
                processed++;
                
                // Update button text with progress
                if (processed % 5 === 0 || processed === total) {
                    button.textContent = 'Processing... (' + processed + '/' + total + ')';
                }
            }

            console.log('STAMINA GAINED (' + (2 * (maxChap - minChap)) + ') From chapters ' + minChap + ' to ' + maxChap);
            
            // Re-enable button after a short delay
            setTimeout(function() {
                button.disabled = false;
                button.textContent = 'Get Stamina!';
                button.style.backgroundColor = '#4CAF50';
                alert('Stamina collection complete! Processed ' + total + ' chapters.');
            }, 2000);
        });

        // Add button to container
        container.appendChild(button);

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