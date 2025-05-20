// static/js/login.js
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = new URLSearchParams();
  data.append("username", form.username.value);
  data.append("password", form.password.value);

  try {
    const res = await fetch("http://localhost:8000/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: data,
    });

    if (!res.ok) {
      const errorText = await res.text();
      alert("Login failed: " + errorText);
      return; // Do not redirect
    }

    const json = await res.json();
    localStorage.setItem("token", json.access_token);
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Network or server error. Please try again.");
    console.error(err);
  }
});
