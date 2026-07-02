// Store selected timezones
let selectedTimezones = JSON.parse(localStorage.getItem('selectedTimezones')) || [];

// Get city names from timezone
const timezoneToCity = {
    'UTC': 'UTC',
    'America/New_York': 'New York',
    'America/Chicago': 'Chicago',
    'America/Denver': 'Denver',
    'America/Los_Angeles': 'Los Angeles',
    'America/Anchorage': 'Anchorage',
    'Pacific/Honolulu': 'Honolulu',
    'Europe/London': 'London',
    'Europe/Paris': 'Paris',
    'Europe/Berlin': 'Berlin',
    'Europe/Moscow': 'Moscow',
    'Asia/Dubai': 'Dubai',
    'Asia/Kolkata': 'New Delhi',
    'Asia/Bangkok': 'Bangkok',
    'Asia/Shanghai': 'Shanghai',
    'Asia/Hong_Kong': 'Hong Kong',
    'Asia/Tokyo': 'Tokyo',
    'Asia/Seoul': 'Seoul',
    'Asia/Singapore': 'Singapore',
    'Australia/Sydney': 'Sydney',
    'Australia/Melbourne': 'Melbourne',
    'Pacific/Auckland': 'Auckland',
    'America/Toronto': 'Toronto',
    'America/Mexico_City': 'Mexico City',
    'America/Sao_Paulo': 'São Paulo',
    'America/Buenos_Aires': 'Buenos Aires',
    'Africa/Cairo': 'Cairo',
    'Africa/Johannesburg': 'Johannesburg',
    'Africa/Lagos': 'Lagos'
};

// Preset groups
const presets = {
    'major-cities': [
        'UTC',
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo',
        'Australia/Sydney'
    ],
    'us-zones': [
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Pacific/Honolulu'
    ],
    'europe-asia': [
        'Europe/London',
        'Europe/Paris',
        'Europe/Moscow',
        'Asia/Dubai',
        'Asia/Tokyo',
        'Australia/Sydney'
    ]
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderClocks();
    updateClocks();
    setInterval(updateClocks, 1000);

    // Event listeners
    document.getElementById('add-btn').addEventListener('click', addTimezone);
    document.getElementById('timezone-select').addEventListener('change', (e) => {
        if (e.target.value) {
            addTimezoneFromSelect(e.target.value);
            e.target.value = '';
        }
    });
    document.getElementById('reset-btn').addEventListener('click', resetAllClocks);

    // Preset buttons
    document.querySelectorAll('.preset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const presetName = e.target.getAttribute('data-preset');
            loadPreset(presetName);
        });
    });

    // Prevent default zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
});

// Add timezone from button
function addTimezone() {
    const select = document.getElementById('timezone-select');
    const timezone = select.value;

    if (!timezone) {
        showNotification('Please select a timezone', 'error');
        return;
    }

    addTimezoneFromSelect(timezone);
    select.value = '';
}

// Add timezone from select
function addTimezoneFromSelect(timezone) {
    if (selectedTimezones.includes(timezone)) {
        showNotification('This timezone is already added', 'warning');
        return;
    }

    if (selectedTimezones.length >= 10) {
        showNotification('Maximum 10 timezones allowed', 'warning');
        return;
    }

    selectedTimezones.push(timezone);
    saveTimezones();
    renderClocks();
}

// Remove timezone
function removeTimezone(timezone) {
    selectedTimezones = selectedTimezones.filter(tz => tz !== timezone);
    saveTimezones();
    renderClocks();
}

// Reset all clocks
function resetAllClocks() {
    if (confirm('Remove all clocks?')) {
        selectedTimezones = [];
        saveTimezones();
        renderClocks();
    }
}

// Load preset
function loadPreset(presetName) {
    selectedTimezones = [...presets[presetName]];
    saveTimezones();
    renderClocks();
    updateClocks();
}

// Save to localStorage
function saveTimezones() {
    localStorage.setItem('selectedTimezones', JSON.stringify(selectedTimezones));
}

// Show notification
function showNotification(message, type = 'info') {
    // Simple notification - can be enhanced with a toast library
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#4CAF50'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Render all clocks
function renderClocks() {
    const grid = document.getElementById('clock-grid');

    if (selectedTimezones.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <p>📍 No time zones selected yet.<br>Add a timezone or try a preset!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = selectedTimezones.map(timezone => `
        <div class="clock-card">
            <button class="close-btn" onclick="removeTimezone('${timezone}')">×</button>
            <div class="timezone-name">${timezone}</div>
            <div class="timezone-city">${timezoneToCity[timezone] || timezone}</div>
            <div class="digital-time" data-timezone="${timezone}">--:--:--</div>
            <div class="period" data-period="${timezone}"></div>
            <div class="date-display" data-date="${timezone}"></div>
        </div>
    `).join('');
}

// Update all clocks
function updateClocks() {
    selectedTimezones.forEach(timezone => {
        updateClockForTimezone(timezone);
    });
}

// Update single clock
function updateClockForTimezone(timezone) {
    try {
        const now = new Date();
        
        // Get time in timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const parts = formatter.formatToParts(now);
        const timeObj = {};
        
        parts.forEach(part => {
            if (part.type !== 'literal') {
                timeObj[part.type] = part.value;
            }
        });

        const time = `${timeObj.hour}:${timeObj.minute}:${timeObj.second}`;

        // Update time display
        const timeElement = document.querySelector(`[data-timezone="${timezone}"]`);
        if (timeElement) {
            timeElement.textContent = time;
        }

        // Update date display
        const dateFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const dateElement = document.querySelector(`[data-date="${timezone}"]`);
        if (dateElement) {
            dateElement.textContent = dateFormatter.format(now);
        }

        // Update period (AM/PM equivalent for 24-hour display)
        const periodFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: 'numeric',
            hour12: true
        });

        const periodStr = periodFormatter.format(now);
        const period = periodStr.includes('AM') ? 'AM' : 'PM';
        
        const periodElement = document.querySelector(`[data-period="${timezone}"]`);
        if (periodElement) {
            periodElement.textContent = period;
        }
    } catch (error) {
        console.error(`Error updating timezone ${timezone}:`, error);
    }
}

// Handle timezone select change
document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('timezone-select');
    select.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('add-btn').click();
        }
    });
});

// Add keyboard shortcut support
document.addEventListener('keydown', (e) => {
    // Ctrl+R or Cmd+R to reset (with confirmation)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && selectedTimezones.length > 0) {
        e.preventDefault();
        resetAllClocks();
    }
});

// Handle visibility change to update clock when app comes back to focus
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateClocks();
    }
});
