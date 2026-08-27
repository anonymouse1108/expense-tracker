"use strict";

const profileButton = document.getElementById("profileButton");
const profileWrapper = document.querySelector(".profile-wrapper");
const profileAvatar = document.getElementById("profileAvatar");
const profileName = document.getElementById("profileName");
const profileDropdown = document.getElementById("profileDropdown");
const dropdownAvatar = document.getElementById("dropdownAvatar");
const dropdownName = document.getElementById("dropdownName");
const dropdownEmail = document.getElementById("dropdownEmail");
const profileDetailsButton = document.getElementById("profileDetailsButton");
const logoutButton = document.getElementById("logoutButton");

function showAvatar(element, user, defaultLetter = "G") {
    if (!element) {
        return;
    }

    if (user && user.profileImage) {
        element.innerHTML = "";

        const image = document.createElement("img");

        image.src = user.profileImage;
        image.alt = "Profile Picture";

        element.appendChild(image);

        return;
    }

    element.textContent = defaultLetter;
}

function updateProfile() {
    if (
        !profileAvatar ||
        !profileName ||
        !profileDropdown ||
        !dropdownAvatar ||
        !dropdownName ||
        !dropdownEmail ||
        !profileDetailsButton ||
        !logoutButton
    ) {
        console.error("Profile elements are missing from the page.");
        return;
    }

    const currentUser = getCurrentUser();

    if (!currentUser) {
        showAvatar(profileAvatar, null, "G");
        showAvatar(dropdownAvatar, null, "G");

        profileName.textContent = "Guest";
        dropdownName.textContent = "Guest";
        dropdownEmail.textContent = "Not logged in";

        logoutButton.style.display = "none";
        profileDetailsButton.style.display = "none";

        return;
    }

    const name = currentUser.name || "User";
    const email = currentUser.email || "";
    const firstLetter = name.charAt(0).toUpperCase();

    showAvatar(
        profileAvatar,
        currentUser,
        firstLetter
    );

    showAvatar(
        dropdownAvatar,
        currentUser,
        firstLetter
    );

    profileName.textContent = name;
    dropdownName.textContent = name;
    dropdownEmail.textContent = email;

    logoutButton.style.display = "flex";
    profileDetailsButton.style.display = "flex";
}

function toggleProfileDropdown(event) {
    event.stopPropagation();

    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    const isOpen = profileWrapper.classList.toggle("open");

    profileButton.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

    profileDropdown.setAttribute(
        "aria-hidden",
        String(!isOpen)
    );
}

function closeProfileDropdown() {
    if (
        !profileWrapper ||
        !profileDropdown ||
        !profileButton
    ) {
        return;
    }

    profileWrapper.classList.remove("open");

    profileButton.setAttribute(
        "aria-expanded",
        "false"
    );

    profileDropdown.setAttribute(
        "aria-hidden",
        "true"
    );
}

function handleLogout() {
    logoutUser();

    closeProfileDropdown();

    window.location.href = "login.html";
}

function handleProfileDetails() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    window.location.href = "profile.html";
}

if (profileButton) {
    profileButton.addEventListener(
        "click",
        toggleProfileDropdown
    );
}

if (logoutButton) {
    logoutButton.addEventListener(
        "click",
        handleLogout
    );
}

if (profileDetailsButton) {
    profileDetailsButton.addEventListener(
        "click",
        handleProfileDetails
    );
}

document.addEventListener(
    "click",
    closeProfileDropdown
);

updateProfile();