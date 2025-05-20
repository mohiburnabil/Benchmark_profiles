// frontend/static/js/leaderboard.js

let leaderboardData = [];
let currentPage = 1;
const rowsPerPage = 5;

const leaderboardTable = document.getElementById("leaderboard");
const searchInput = document.getElementById("searchInput");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");

// Fetch leaderboard data from the server
fetch("http://localhost:8000/leaderboard")
  .then(res => res.json())
  .then(data => {
    leaderboardData = data;
    renderTable();
  });

// Render the leaderboard table based on current page and search query
function renderTable() {
  const searchQuery = searchInput.value.toLowerCase();
  const filteredData = leaderboardData.filter(entry =>
    entry.username.toLowerCase().includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  currentPage = Math.min(currentPage, totalPages) || 1;

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  leaderboardTable.innerHTML = "";

  paginatedData.forEach((entry, index) => {
    const row = document.createElement("tr");

    const rankCell = document.createElement("td");
    rankCell.className = "px-4 py-2 font-semibold text-blue-700";
    const overallRank = startIndex + index + 1;
    rankCell.textContent = getRankEmoji(overallRank);

    const userCell = document.createElement("td");
    userCell.className = "px-4 py-2 text-gray-800";
    userCell.textContent = entry.username;

    const scoreCell = document.createElement("td");
    scoreCell.className = "px-4 py-2 text-gray-800";
    scoreCell.textContent = entry.score;

    row.appendChild(rankCell);
    row.appendChild(userCell);
    row.appendChild(scoreCell);

    leaderboardTable.appendChild(row);
  });

  pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Return emoji for top 3 ranks, else the rank number
function getRankEmoji(rank) {
  switch(rank) {
    case 1: return "🥇";
    case 2: return "🥈";
    case 3: return "🥉";
    default: return rank;
  }
}

// Event listeners
searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderTable();
});

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

nextBtn.addEventListener("click", () => {
  const searchQuery = searchInput.value.toLowerCase();
  const filteredData = leaderboardData.filter(entry =>
    entry.username.toLowerCase().includes(searchQuery)
  );
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
  }
});
