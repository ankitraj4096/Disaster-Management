// Disaster Map Functions
(function() {
    // Initialize map variables
    var map = L.map('map').setView([12.97, 77.59], 9);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var activeBlinkingCircle = null;
    var blinkingInterval = null;

    // Display approved disaster function
    window.displayApprovedDisaster = function(disaster) {
        // Clear existing
        if (activeBlinkingCircle) map.removeLayer(activeBlinkingCircle);
        if (blinkingInterval) clearInterval(blinkingInterval);

        // Validate and display
        if (disaster?.lat && disaster?.lng && disaster?.radius > 0) {
            map.setView([disaster.lat, disaster.lng], 13);
            activeBlinkingCircle = L.circle([disaster.lat, disaster.lng], {
                color: 'red',
                fillColor: 'red',
                fillOpacity: 0.5,
                radius: disaster.radius
            }).addTo(map);

            // Blinking effect
            let visible = true;
            blinkingInterval = setInterval(() => {
                visible = !visible;
                activeBlinkingCircle.setStyle({
                    opacity: visible ? 1 : 0,
                    fillOpacity: visible ? 0.5 : 0
                });
            }, 500);
        }
    };

    // Storage event listener
    window.addEventListener('storage', (e) => {
        if (e.key === 'approvedDisasters') {
            const approved = JSON.parse(e.newValue);
            if (approved?.length) displayApprovedDisaster(approved[approved.length-1]);
        }
    });

    // Load any existing approved disasters
    document.addEventListener('DOMContentLoaded', () => {
        const approved = JSON.parse(localStorage.getItem('approvedDisasters')) || [];
        if (approved.length) displayApprovedDisaster(approved[approved.length-1]);
    });
})();