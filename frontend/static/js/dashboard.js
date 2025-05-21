let pollingInterval = null;

function formatDate(dateString) {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) +
    " at " +
    date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

let uploading = false;
let controller = null;

async function uploadCSV() {
  const file = document.getElementById("csvFile").files[0];
  if (!file) {
    alert("Please select a file.");
    return;
  }

  // Prevent re-uploads
  if (uploading) return;

  uploading = true;
  showSpinner(true);

  controller = new AbortController();
  const signal = controller.signal;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("http://localhost:8000/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
      signal,
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
    alert("Upload received. We'll update the results shortly.");
    pollForResult(); // start polling
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error(err);
      alert("Upload failed: " + err.message);
    }
  } finally {
    uploading = false;
    showSpinner(false);
  }
}

window.addEventListener("beforeunload", () => {
  if (controller) {
    controller.abort();
  }
});


async function loadResults() {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:8000/user/results", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    alert("Session expired. Please log in again.");
    logout();
    return [];
  }

  const results = await res.json();
  const list = document.getElementById("resultsList");
  list.innerHTML = "";

  results.forEach((r) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="px-4 py-2 font-medium text-gray-900">${r.score}</td>
      <td class="px-4 py-2 text-gray-700">${formatDate(r.uploaded_at)}</td>
    `;
    list.appendChild(row);
  });

  return results;
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }

  localStorage.removeItem("uploadInProgress");
  localStorage.removeItem("lastResultId");

  document.getElementById("uploadSpinner").classList.add("hidden");
  document.getElementById("uploadButton").disabled = false;
}

function pollForResults() {
  if (pollingInterval) return; // Prevent duplicate intervals

  const spinner = document.getElementById("uploadSpinner");
  spinner.classList.remove("hidden");

  pollingInterval = setInterval(async () => {
    const lastId = localStorage.getItem("lastResultId");
    const currentResults = await loadResults();
    const latestId = currentResults[0]?.id || "";

    if (lastId && latestId && lastId !== latestId) {
      stopPolling(); // new result arrived
    }
  }, 2000);
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadResults();

  const uploadInProgress = localStorage.getItem("uploadInProgress");
  if (uploadInProgress === "true") {
    pollForResults();
  } else {
    document.getElementById("uploadSpinner").classList.add("hidden");
    document.getElementById("uploadButton").disabled = false;
  }
});
function showSpinner(show) {
  const spinner = document.getElementById("uploadSpinner");
  const button = document.getElementById("uploadButton");
  if (show) {
    spinner.classList.remove("hidden");
    button.disabled = true;
  } else {
    spinner.classList.add("hidden");
    button.disabled = false;
  }
}
