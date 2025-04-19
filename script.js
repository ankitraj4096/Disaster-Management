// Modal handling functions
function openModal() {
    const modal = document.getElementById("myModal");
    if (modal) {
        modal.style.display = "flex";
        console.log("Modal opened successfully.");
    } else {
        console.error("Modal element with ID 'myModal' not found.");
    }
}

function closeModal(event = null) {
    const modal = document.getElementById("myModal");
    if (modal && (event === null || event.target === modal || event.target.id === 'closeModal')) {
        modal.style.display = "none";
        console.log("Modal closed successfully.");
    } else if (!modal) {
        console.error("Modal element with ID 'myModal' not found.");
    }
}

// Submit Request and Send to Server
function submitRequest() {
    console.log("Submit button clicked.");

    var locationName = document.getElementById("locationName").value;
    var emergencyType = document.getElementById("emergencyType").value;
    var lat = parseFloat(document.getElementById("latitude").value);
    var lng = parseFloat(document.getElementById("longitude").value);
    var radius = parseFloat(document.getElementById("radius").value);

    if (!locationName || !emergencyType || isNaN(lat) || isNaN(lng) || isNaN(radius)) {
        alert("Please fill in all fields correctly.");
        return;
    }

    var disasterDetails = {
        id: Date.now(),
        locationName: locationName,
        emergencyType: emergencyType,
        lat: lat,
        lng: lng,
        radius: radius,
        status: 'pending',
        timestamp: new Date().toISOString()
    };

    let disasterRequests = JSON.parse(localStorage.getItem('disasterRequests')) || [];
    
    // Check if this exact request exists in either pending or approved
    const allDisasters = [
        ...(JSON.parse(localStorage.getItem('disasterRequests')) || []),
        ...(JSON.parse(localStorage.getItem('approvedDisasters')) || [])
    ];
    
    const isDuplicate = allDisasters.some(request => 
        request.locationName === disasterDetails.locationName &&
        request.emergencyType === disasterDetails.emergencyType &&
        request.lat === disasterDetails.lat &&
        request.lng === disasterDetails.lng &&
        request.radius === disasterDetails.radius
    );
    
    if (!isDuplicate) {
        disasterRequests.push(disasterDetails);
        localStorage.setItem('disasterRequests', JSON.stringify(disasterRequests));
        
        // Check if this location has been requested 5+ times
        const sameLocationRequests = disasterRequests.filter(req => 
            req.locationName === disasterDetails.locationName &&
            req.emergencyType === disasterDetails.emergencyType
        );
        
        if (sameLocationRequests.length >= 5) {
            // Auto-approve
            let approvedDisasters = JSON.parse(localStorage.getItem('approvedDisasters')) || [];
            disasterDetails.status = 'approved';
            approvedDisasters.push(disasterDetails);
            localStorage.setItem('approvedDisasters', JSON.stringify(approvedDisasters));
            
            // Remove from pending
            disasterRequests = disasterRequests.filter(req => 
                !(req.locationName === disasterDetails.locationName && 
                  req.emergencyType === disasterDetails.emergencyType)
            );
            localStorage.setItem('disasterRequests', JSON.stringify(disasterRequests));
            
            alert('This location has been auto-approved due to multiple requests!');
        } else {
            alert('Disaster details saved successfully!');
        }
    } else {
        alert('This exact disaster request already exists!');
    }
    closeModal();
}

// Function to automatically populate lat/lng with user's current location
function fetchLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                document.getElementById("latitude").value = position.coords.latitude;
                document.getElementById("longitude").value = position.coords.longitude;
                alert("Your current location has been filled in the form!");
            },
            error => {
                alert("Unable to fetch your location. Please check your browser settings.");
            },
            { timeout: 10000 }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Initialize event listeners
document.getElementById("submitButton")?.addEventListener("click", submitRequest);
document.getElementById("currbutton")?.addEventListener("click", fetchLocation);
document.getElementById("requestButton")?.addEventListener("click", openModal);
document.getElementById("closeModal")?.addEventListener("click", closeModal);

// See changes button handler
document.getElementById("seeChanges")?.addEventListener("click", showAllDisasters);

function showAllDisasters() {
    const allDisasters = JSON.parse(localStorage.getItem('approvedDisasters')) || [];
    const pendingDisasters = JSON.parse(localStorage.getItem('disasterRequests')) || [];
    
    // Combine both approved and pending disasters
    const combinedDisasters = [...allDisasters, ...pendingDisasters];
    
    // Filter to show only unique disasters (by location/type/coordinates)
    const disasters = [];
    const seen = new Set();
    
    combinedDisasters.forEach(disaster => {
        const key = `${disaster.locationName}-${disaster.emergencyType}-${disaster.lat}-${disaster.lng}-${disaster.radius}`;
        if (!seen.has(key)) {
            seen.add(key);
            disasters.push(disaster);
        }
    });
    if (disasters.length === 0) {
        alert("No disasters recorded yet.");
        return;
    }

    const modal = document.createElement('div');
    modal.id = 'disastersModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    const content = document.createElement('div');
    content.style.backgroundColor = '#f8f9fa';
    content.style.padding = '25px';
    content.style.borderRadius = '10px';
    content.style.maxHeight = '80vh';
    content.style.overflowY = 'auto';
    content.style.width = '80%';
    content.style.maxWidth = '600px';
    content.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Close';
    closeBtn.style.marginTop = '20px';
    closeBtn.style.padding = '8px 16px';
    closeBtn.style.backgroundColor = '#dc3545';
    closeBtn.style.color = 'white';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '4px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => document.body.removeChild(modal);

    const title = document.createElement('h2');
    title.textContent = 'Disaster Alerts';
    title.style.color = '#343a40';
    title.style.marginBottom = '20px';
    title.style.textAlign = 'center';
    content.appendChild(title);

    disasters.forEach(disaster => {
        const item = document.createElement('div');
        item.style.padding = '15px';
        item.style.marginBottom = '10px';
        item.style.borderRadius = '5px';
        item.style.cursor = 'pointer';
        item.style.transition = 'all 0.3s ease';
        
        // Status-based styling
        if (disaster.status === 'approved') {
            item.style.backgroundColor = '#d4edda';
            item.style.borderLeft = '5px solid #28a745';
            // Solid green background for approved disasters
        } else {
            item.style.backgroundColor = '#fff3cd';
            item.style.borderLeft = '5px solid #ffc107';
        }

        item.innerHTML = `
            <div style="display: flex; justify-content: space-between;">
                <strong style="font-size: 1.1em;">${disaster.locationName}</strong>
                <span style="font-weight: bold; color: ${
                    disaster.status === 'approved' ? '#28a745' : '#6c757d'
                }">${disaster.status.toUpperCase()}</span>
            </div>
            <div style="margin-top: 8px;">
                <span style="display: inline-block; width: 80px;">Type:</span>
                <strong>${disaster.emergencyType}</strong>
            </div>
            <div style="margin-top: 5px; font-size: 0.9em; color: #6c757d;">
                Coordinates: ${disaster.lat}, ${disaster.lng} | Radius: ${disaster.radius}m
            </div>
        `;
        
        item.onclick = () => {
            console.log("Disaster clicked:", disaster); // Log the disaster object
            if (typeof displayApprovedDisaster === 'function') {
                displayApprovedDisaster(disaster);
            }
            document.body.removeChild(modal);
        };
        
        content.appendChild(item);
    });

    content.appendChild(closeBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);
}
