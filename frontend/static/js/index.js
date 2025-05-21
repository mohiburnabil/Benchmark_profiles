
  document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const authButtons = document.getElementById("authButtons");

    if (token) {
      authButtons.innerHTML = `
        <a href="dashboard.html"
           class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg shadow transition duration-300">
          Go to Dashboard
        </a>
        <button 
          onclick="logout()"
          class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg shadow transition duration-300">
          Logout
        </button>
      `;
    } else {
      authButtons.innerHTML = `
        <a href="register.html" 
           class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg shadow transition duration-300">
          Create Account
        </a>
        <a href="login.html" 
           class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg shadow transition duration-300">
          Login
        </a>
      `;
    }
  });

  function logout() {
    localStorage.removeItem("token");
    location.reload();
  }
