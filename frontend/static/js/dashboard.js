async function uploadCSV() {
  const file = document.getElementById("csvFile").files[0];
  if (!file) {
    alert("Please select a file.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:8000/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (res.status === 401) {
    alert("Unauthorized. Please log in again.");
    logout();
    return;
  }

  if (!res.ok) {
    const errorText = await res.text();
    alert("Upload failed: " + errorText);
    return;
  }

  const json = await res.json();
  alert(`Score: ${json.score}`);
  loadResults();
}

async function loadResults() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const res = await fetch("http://localhost:8000/user/results", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    alert("Session expired or unauthorized. Please log in again.");
    logout();
    return;
  }

  const results = await res.json();
  const list = document.getElementById("resultsList");
  list.innerHTML = "";

  results.forEach(r => {
    const row = document.createElement("tr");

    const scoreCell = document.createElement("td");
    scoreCell.className = "px-4 py-2 font-medium text-gray-900";
    scoreCell.textContent = r.score;

    const dateCell = document.createElement("td");
    dateCell.className = "px-4 py-2 text-gray-700";

    const date = new Date(r.uploaded_at);
    dateCell.textContent = date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) + ' at ' + date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });

    row.appendChild(scoreCell);
    row.appendChild(dateCell);
    list.appendChild(row);
  });
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// Load results on page load
loadResults();
