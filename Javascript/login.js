document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("messageAlert");
  const btn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  const identifier = document.getElementById("identifier");
  const password = document.getElementById("password");
  const remember = document.getElementById("remember");

  if (!form) return;

  // Load remembered identifier
  const rememberedIdentifier = localStorage.getItem("rememberedIdentifier");
  if (rememberedIdentifier) {
    identifier.value = rememberedIdentifier;
    remember.checked = true;
  }

  // Form submit
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const identifierVal = identifier.value.trim();
    const passwordVal = password.value;
    const rememberVal = remember.checked;

    if (!identifierVal || !passwordVal) {
      showMsg("Please enter email/username and password", "error");
      return;
    }

    btn.disabled = true;
    btnText.textContent = "Signing in...";

    try {
      console.log("Sending login to: backend/login_api.php");

      const response = await axios.post("backend/login_api.php", {
        identifier: identifierVal,
        password: passwordVal,
      });

      console.log("Response:", response.data);

      if (response.data.success) {
        showMsg("Login successful!", "success");

        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("isLoggedIn", "true");

        if (rememberVal) {
          localStorage.setItem("rememberedIdentifier", identifierVal);
        } else {
          localStorage.removeItem("rememberedIdentifier");
        }

        // Redirect immediately
        window.location.href = "dashboard.php";
      } else {
        showMsg(response.data.message || "Login failed", "error");
        btn.disabled = false;
        btnText.textContent = "Sign In";
      }
    } catch (error) {
      console.error("Login error:", error);

      let errorMsg = "Server error. Please try again.";
      if (error.response) {
        console.log("Error response:", error.response.data);
        errorMsg = error.response.data.message || "Server error";
      } else if (error.request) {
        errorMsg = "Cannot connect to server. Check if backend is running.";
        console.log("No response received");
      }

      showMsg(errorMsg, "error");
      btn.disabled = false;
      btnText.textContent = "Sign In";
    }
  });

  function showMsg(text, type) {
    message.textContent = text;
    message.className = "p-3 mb-4 rounded text-center ";
    message.classList.add(
      type === "success"
        ? "bg-green-100 text-green-700 border border-green-200"
        : "bg-red-100 text-red-700 border border-red-200"
    );
    message.classList.remove("hidden");

    setTimeout(() => {
      message.classList.add("hidden");
    }, 5000);
  }
});
