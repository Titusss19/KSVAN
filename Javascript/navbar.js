// KSTREET/Javascript/navbar.js

class NavbarManager {
  constructor() {
    this.currentUser = null;
    this.dropdownOpen = false;
    this.init();
  }

  async init() {
    // Add page load animation
    this.handlePageLoad();

    await this.loadUserData();
    this.setupDropdown();
    this.setupNavigationEffects();

    // Setup account settings AFTER DOM is loaded
    this.setupAccountSettings();
  }

  // Handle smooth page load
  handlePageLoad() {
    // Fade in content on page load
    const content =
      document.querySelector("main") ||
      document.querySelector(".content-wrapper") ||
      document.body;

    if (content) {
      content.style.opacity = "0";
      content.style.transform = "translateY(10px)";

      setTimeout(() => {
        content.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        content.style.opacity = "1";
        content.style.transform = "translateY(0)";
      }, 50);
    }
  }

  // Fetch user data from backend
  async loadUserData() {
    try {
      const response = await fetch("backend/navbar_api.php", {
        method: "GET",
        credentials: "same-origin",
      });

      const data = await response.json();

      if (data.success && data.user) {
        this.currentUser = data.user;
        this.updateUserDisplay();
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }

  // Update user display in navbar
  updateUserDisplay() {
    if (!this.currentUser) return;

    // Update user avatar initials
    const avatarEl = document.querySelector(".user-avatar-text");
    if (avatarEl) {
      const initials = this.currentUser.username.substring(0, 2).toUpperCase();
      avatarEl.textContent = initials;
    }

    // Update username display
    const usernameEl = document.querySelector(".user-display-name");
    if (usernameEl) {
      usernameEl.textContent = this.currentUser.username;
    }

    // Update role display
    const roleEl = document.querySelector(".user-display-role");
    if (roleEl) {
      roleEl.textContent = this.currentUser.role;
    }

    // Update dropdown info
    this.updateDropdownInfo();
  }

  // Update dropdown menu with user info
  updateDropdownInfo() {
    const dropdownUsername = document.getElementById("dropdown-username");
    const dropdownEmail = document.getElementById("dropdown-email");

    if (dropdownUsername && this.currentUser) {
      dropdownUsername.textContent = this.currentUser.username;
    }

    if (dropdownEmail && this.currentUser) {
      dropdownEmail.textContent = this.currentUser.email;
    }
  }

  // Setup user dropdown functionality
  setupDropdown() {
    const userSection = document.getElementById("user-section");
    const dropdown = document.getElementById("user-dropdown");

    if (!userSection || !dropdown) return;

    // Toggle dropdown on click
    userSection.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!userSection.contains(e.target) && !dropdown.contains(e.target)) {
        this.closeDropdown();
      }
    });

    // Setup logout button
    const logoutBtn = document.getElementById("dropdown-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }
  }

  toggleDropdown() {
    const dropdown = document.getElementById("user-dropdown");
    if (!dropdown) return;

    this.dropdownOpen = !this.dropdownOpen;

    if (this.dropdownOpen) {
      dropdown.classList.remove("hidden");
      dropdown.classList.add("animate-fadeIn");
    } else {
      dropdown.classList.add("hidden");
      dropdown.classList.remove("animate-fadeIn");
    }
  }

  closeDropdown() {
    const dropdown = document.getElementById("user-dropdown");
    if (!dropdown) return;

    this.dropdownOpen = false;
    dropdown.classList.add("hidden");
    dropdown.classList.remove("animate-fadeIn");
  }

  // ========================================
  // ACCOUNT SETTINGS METHODS
  // ========================================

  setupAccountSettings() {
    const accountBtn = document.getElementById("dropdown-account-settings");
    const modal = document.getElementById("account-settings-modal");
    const closeBtn = document.getElementById("close-modal");
    const cancelBtn = document.getElementById("cancel-btn");
    const saveBtn = document.getElementById("save-settings-btn");

 

    if (!accountBtn || !modal) {
      console.error("Account settings elements not found!");
      return;
    }

    // Open modal
    accountBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
     
      this.openAccountSettings();
      this.closeDropdown();
    });

    // Close modal - Multiple ways
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
      
        this.closeAccountSettings();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
       
        this.closeAccountSettings();
      });
    }

    // Close on outside click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
      
        this.closeAccountSettings();
      }
    });

    // Save changes
    if (saveBtn) {
      saveBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
     
        this.saveAccountSettings();
      });
    }

    // ESC key to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        this.closeAccountSettings();
      }
    });
  }

  openAccountSettings() {
    const modal = document.getElementById("account-settings-modal");
    if (!modal || !this.currentUser) {
      console.error("Cannot open modal:", {
        modal,
        currentUser: this.currentUser,
      });
      return;
    }

    

    // Clear all fields first
    document.getElementById("edit-username").value =
      this.currentUser.username || "";
    document.getElementById("edit-email").value = this.currentUser.email || "";
    document.getElementById("edit-role").value = this.currentUser.role || "";
    document.getElementById("edit-branch").value =
      this.currentUser.branch || "";
    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("confirm-password").value = "";

    // Hide new password fields initially
    document.getElementById("new-password-group").classList.add("hidden");
    document.getElementById("confirm-password-group").classList.add("hidden");

    // Show/hide password fields on input
    const currentPwdInput = document.getElementById("current-password");
    const handlePasswordInput = (e) => {
      const newPwdGroup = document.getElementById("new-password-group");
      const confirmPwdGroup = document.getElementById("confirm-password-group");

      if (e.target.value.length > 0) {
        newPwdGroup.classList.remove("hidden");
        confirmPwdGroup.classList.remove("hidden");
      } else {
        newPwdGroup.classList.add("hidden");
        confirmPwdGroup.classList.add("hidden");
      }
    };

    // Remove old listener and add new one
    currentPwdInput.removeEventListener("input", handlePasswordInput);
    currentPwdInput.addEventListener("input", handlePasswordInput);

    // Show void PIN section if manager/admin
    const voidPinSection = document.getElementById("void-pin-section");
    const voidPinInput = document.getElementById("edit-void-pin");

    if (
      this.currentUser.role === "manager" ||
      this.currentUser.role === "admin"
    ) {
      voidPinSection.classList.remove("hidden");
      if (voidPinInput) voidPinInput.value = "";
    } else {
      voidPinSection.classList.add("hidden");
    }

    // Show modal
    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");

   
  }

  closeAccountSettings() {
    const modal = document.getElementById("account-settings-modal");
    if (!modal) return;

    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");

   
  }

  async saveAccountSettings() {
    const username = document.getElementById("edit-username").value.trim();
    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const voidPin = document.getElementById("edit-void-pin")?.value || "";

    // Validation
    if (!username) {
      alert("Username cannot be empty");
      return;
    }

    // If changing password
    if (currentPassword) {
      if (newPassword.length < 6) {
        alert("New password must be at least 6 characters");
        return;
      }
      if (newPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
    }

    // Validate void PIN if provided
    if (voidPin && (voidPin.length < 4 || voidPin.length > 6)) {
      alert("Void PIN must be 4-6 digits");
      return;
    }

    try {
      const response = await fetch("backend/update_profile.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          username,
          current_password: currentPassword,
          new_password: newPassword,
          void_pin: voidPin,
        }),
      });

      const text = await response.text();
      

      const data = JSON.parse(text);

      if (data.success) {
        this.currentUser.username = username;
        this.updateUserDisplay();
        this.closeAccountSettings();
        alert("Settings updated successfully!");

        // Reload if password changed
        if (currentPassword) {
          setTimeout(() => location.reload(), 1000);
        }
      } else {
        alert(data.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update settings. Check console for details.");
    }
  }

  // ========================================
  // NAVIGATION & LOGOUT METHODS
  // ========================================

  handleLogout() {
    const content =
      document.querySelector("main") ||
      document.querySelector(".content-wrapper") ||
      document.body;

    if (content) {
      content.style.transition = "opacity 0.2s ease";
      content.style.opacity = "0";

      setTimeout(() => {
        window.location.href = "logout.php";
      }, 200);
    } else {
      window.location.href = "logout.php";
    }
  }

  setupNavigationEffects() {
    const navLinks = document.querySelectorAll('nav a[href$=".php"]');

    navLinks.forEach((link) => {
      // Skip logout
      if (link.getAttribute("href") === "logout.php") return;

      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");

        // Check if not already on this page
        const currentPage = window.location.pathname.split("/").pop();
        if (currentPage === href) {
          e.preventDefault();
          return;
        }

        // Add fade out effect before navigation
        e.preventDefault();
        this.navigateWithTransition(href);
      });
    });
  }

  navigateWithTransition(href) {
    const content =
      document.querySelector("main") ||
      document.querySelector(".content-wrapper") ||
      document.body;

    if (content) {
      // Fade out
      content.style.transition = "opacity 0.2s ease, transform 0.2s ease";
      content.style.opacity = "0";
      content.style.transform = "translateY(-10px)";

      // Navigate after fade
      setTimeout(() => {
        window.location.href = href;
      }, 200);
    } else {
      // Fallback: immediate navigation
      window.location.href = href;
    }
  }
}

// Initialize navbar when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.navbarManager = new NavbarManager();
});

// Prevent flash of unstyled content
document.addEventListener("DOMContentLoaded", () => {
  const content =
    document.querySelector("main") ||
    document.querySelector(".content-wrapper");
  if (content) {
    content.style.opacity = "1";
  }
});
