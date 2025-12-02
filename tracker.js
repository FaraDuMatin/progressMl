/**
 * IFT3395 Resources Tracker
 * Tracks which resources have been read using localStorage
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'ift3395_resources_tracker';

    /**
     * Load completed resources from localStorage
     */
    function loadCompletedResources() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    }

    /**
     * Save completed resources to localStorage
     */
    function saveCompletedResources(completed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    }

    /**
     * Update progress bars for each section
     */
    function updateProgress() {
        const sections = document.querySelectorAll('.resource-section');
        
        sections.forEach((section, sectionIndex) => {
            const rows = section.querySelectorAll('.form-row[role="row"]');
            const checkboxes = section.querySelectorAll('.resource-checkbox');
            const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
            const total = checkboxes.length;
            
            if (total === 0) return;

            // Find or create progress container
            let progressContainer = section.querySelector('.progress-container');
            if (!progressContainer) {
                progressContainer = document.createElement('div');
                progressContainer.className = 'progress-container';
                progressContainer.innerHTML = `
                    <div class="progress-text">Progress: <span class="progress-count">0 / 0</span></div>
                    <div class="progress-bar-wrapper">
                        <div class="progress-bar-fill" style="width: 0%">0%</div>
                    </div>
                `;
                
                // Insert after section header
                const header = section.querySelector('.mb-2.sorting-line');
                if (header && header.nextSibling) {
                    header.parentNode.insertBefore(progressContainer, header.nextSibling);
                }
            }

            const percentage = Math.round((checked / total) * 100);
            const progressFill = progressContainer.querySelector('.progress-bar-fill');
            const progressCount = progressContainer.querySelector('.progress-count');

            progressFill.style.width = percentage + '%';
            progressFill.textContent = percentage + '%';
            progressCount.textContent = `${checked} / ${total}`;
        });

        // Update overall progress in document title
        const allCheckboxes = document.querySelectorAll('.resource-checkbox');
        const allChecked = Array.from(allCheckboxes).filter(cb => cb.checked).length;
        const allTotal = allCheckboxes.length;
        const overallPercentage = allTotal > 0 ? Math.round((allChecked / allTotal) * 100) : 0;
        document.title = `Resources (${overallPercentage}% Complete) - IFT3395`;
    }

    /**
     * Handle checkbox change
     */
    function handleCheckboxChange(event) {
        const checkbox = event.target;
        const row = checkbox.closest('.form-row[role="row"]');
        const resourceId = row.id;

        const completed = loadCompletedResources();

        if (checkbox.checked) {
            completed[resourceId] = true;
            row.classList.add('completed');
        } else {
            delete completed[resourceId];
            row.classList.remove('completed');
        }

        saveCompletedResources(completed);
        updateProgress();
    }

    /**
     * Add checkboxes to all resource rows
     */
    function addCheckboxes() {
        const rows = document.querySelectorAll('.form-row[role="row"]');
        const completed = loadCompletedResources();

        rows.forEach((row) => {
            const resourceId = row.id;
            
            // Skip if checkbox already exists
            if (row.querySelector('.resource-checkbox')) return;

            // Create checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'resource-checkbox';
            checkbox.id = `checkbox_${resourceId}`;
            
            // Check if this resource was previously completed
            if (completed[resourceId]) {
                checkbox.checked = true;
                row.classList.add('completed');
            }

            // Add event listener
            checkbox.addEventListener('change', handleCheckboxChange);

            // Insert checkbox at the beginning of the row
            const firstCell = row.querySelector('[role="cell"]');
            if (firstCell) {
                const titleDiv = firstCell.querySelector('.d-flex');
                if (titleDiv) {
                    titleDiv.insertBefore(checkbox, titleDiv.firstChild);
                }
            }
        });
    }

    /**
     * Add reset button
     */
    function addResetButton() {
        const resetContainer = document.createElement('div');
        resetContainer.style.cssText = 'text-align: center; padding: 30px; background: #f8f9fa; border-top: 2px solid #e9ecef;';
        
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset All Progress';
        resetButton.className = 'btn';
        resetButton.style.cssText = 'background: #dc3545; color: white; padding: 12px 24px; font-size: 1rem;';
        
        resetButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                localStorage.removeItem(STORAGE_KEY);
                
                // Uncheck all checkboxes
                document.querySelectorAll('.resource-checkbox').forEach(cb => {
                    cb.checked = false;
                });
                
                // Remove completed class from all rows
                document.querySelectorAll('.form-row[role="row"]').forEach(row => {
                    row.classList.remove('completed');
                });
                
                updateProgress();
                alert('All progress has been reset!');
            }
        });

        resetContainer.appendChild(resetButton);
        
        const resourcesDiv = document.getElementById('resources');
        if (resourcesDiv) {
            resourcesDiv.appendChild(resetContainer);
        }
    }

    /**
     * Initialize the tracker
     */
    function init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        addCheckboxes();
        updateProgress();
        addResetButton();

        console.log('✓ IFT3395 Resources Tracker initialized');
    }

    // Start initialization
    init();
})();
