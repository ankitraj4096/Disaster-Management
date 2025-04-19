document.addEventListener("DOMContentLoaded", () => {
    loadRequests();
    document.getElementById("clearDisastersButton").addEventListener("click", clearAllDisasters);
});

function clearAllDisasters() {
    localStorage.removeItem('disasterRequests');
    localStorage.removeItem('approvedDisasters');
    
    // Clear the tables
    document.querySelector("#pendingTable tbody").innerHTML = "";
    document.querySelector("#approvedTable tbody").innerHTML = "";
    
    alert("All disasters have been cleared!");
}

function loadRequests() {
    let requests = JSON.parse(localStorage.getItem('disasterRequests')) || [];
    let approvedDisasters = JSON.parse(localStorage.getItem('approvedDisasters')) || [];
    
    // Clear tables
    document.querySelector("#pendingTable tbody").innerHTML = "";
    document.querySelector("#approvedTable tbody").innerHTML = "";

    // Populate pending requests
    requests.forEach((req, index) => {
        if (req.status === "pending") {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${req.locationName}</td>
                <td>${req.emergencyType}</td>
                <td>${req.radius}</td>
                <td>${req.lat}</td>
                <td>${req.lng}</td>
                <td>
                    <button class="action-button approve" onclick="acceptRequest(${index})">Approve</button>
                    <button class="action-button deny" onclick="rejectRequest(${index})">Reject</button>
                </td>
            `;
            document.querySelector("#pendingTable tbody").appendChild(tr);
        }
    });

    // Populate approved requests
    approvedDisasters.forEach(req => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${req.locationName}</td>
            <td>${req.emergencyType}</td>
            <td>${req.radius}</td>
            <td>${req.lat}</td>
            <td>${req.lng}</td>
            <td>${req.status}</td>
        `;
        document.querySelector("#approvedTable tbody").appendChild(tr);
    });
}
  
function acceptRequest(index) {
    let requests = JSON.parse(localStorage.getItem('disasterRequests')) || [];
    let approvedDisasters = JSON.parse(localStorage.getItem('approvedDisasters')) || [];
    
    // Get the specific request, mark as approved
    let req = requests[index];
    req.status = "approved";
    approvedDisasters.push(req);
    
    // Remove this request from pending requests
    requests.splice(index, 1);
    localStorage.setItem('disasterRequests', JSON.stringify(requests));
    localStorage.setItem('approvedDisasters', JSON.stringify(approvedDisasters));
    
    alert("Disaster request approved!");
    loadRequests();
}

function rejectRequest(index) {
    let requests = JSON.parse(localStorage.getItem('disasterRequests')) || [];
    // Remove the request from the pending list
    requests.splice(index, 1);
    localStorage.setItem('disasterRequests', JSON.stringify(requests));
    
    alert("Disaster request rejected!");
    loadRequests();
}
  