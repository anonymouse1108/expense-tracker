"use strict";
const profilePageAvatar = document.getElementById("profilePageAvatar");
const profilePageName = document.getElementById("profilePageName");
const profilePageEmail = document.getElementById("profilePageEmail");
const profileImageInput = document.getElementById("profileImageInput");

const removeProfileImage = document.getElementById("removeProfileImage");
const editProfileButton = document.getElementById("editProfileButton");
const profileLogoutButton = document.getElementById("profileLogoutButton");
const changePasswordButton = document.getElementById("changePasswordButton");

/* EDIT PROFILE */

const editProfileModal = document.getElementById("editProfileModal");
const closeEditProfileModal = document.getElementById("closeEditProfileModal");
const cancelEditProfile = document.getElementById("cancelEditProfile");
const editProfileForm = document.getElementById("editProfileForm");
const editProfileName = document.getElementById("editProfileName");
const editProfileEmail = document.getElementById("editProfileEmail");

/* CHANGE PASSWORD */

const changePasswordModal = document.getElementById("changePasswordModal");
const closeChangePasswordModal = document.getElementById("closeChangePasswordModal");
const cancelChangePassword = document.getElementById("cancelChangePassword");
const changePasswordForm = document.getElementById("changePasswordForm");
const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");

if (!getCurrentUser()) {
    window.location.replace("login.html");
}

function renderProfilePage() {

    const user = getCurrentUser();

    if (!user) {
        return;
    }

    const name = user.name || "User";
    const email = user.email || "";
    const firstLetter = name.charAt(0).toUpperCase();

    profilePageName.textContent = name;
    profilePageEmail.textContent = email;

    if (user.profileImage) {

        profilePageAvatar.innerHTML = `
            <img
                src="${user.profileImage}"
                alt="Profile Picture">
        `;

    } else {

        profilePageAvatar.textContent =
            firstLetter;
    }
}

function openEditProfileModal() {
    const user = getCurrentUser();

    if (!user) {
        window.location.replace("login.html");
        return;
    }

    editProfileName.value = user.name || "";
    editProfileEmail.value = user.email || "";

    editProfileModal.classList.add("active");
    editProfileModal.setAttribute("aria-hidden", "false");

    editProfileName.focus();
}

function closeEditProfileModalFunction() {
    editProfileModal.classList.remove("active");
    editProfileModal.setAttribute("aria-hidden", "true");

    editProfileForm.reset();
}

function updateUserProfile(event) {
    event.preventDefault();

    const user = getCurrentUser();

    if (!user) {
        window.location.replace("login.html");
        return;
    }

    const newName = editProfileName.value.trim();
    const newEmail = editProfileEmail.value.trim().toLowerCase();

    if (newName.length < 2) {
        alert("Name must contain at least 2 characters.");
        return;
    }

    if (!newEmail) {
        alert("Please enter a valid email.");
        return;
    }

    const users = getUsers();

    const emailAlreadyUsed = users.some(
        item =>
            item.email === newEmail &&
            item.id !== user.id
    );

    if (emailAlreadyUsed) {
        alert(
            "This email is already being used by another account."
        );
        return;
    }

    const updatedUsers = users.map(item => {
        if (item.id !== user.id) {
            return item;
        }

        return {
            ...item,
            name: newName,
            email: newEmail
        };
    });

    saveUsers(updatedUsers);

    saveCurrentUser({
        ...user,
        name: newName,
        email: newEmail
    });

    renderProfilePage();
    closeEditProfileModalFunction();

    alert("Profile updated successfully.");
}
function openChangePasswordModal() {
    changePasswordForm.reset();

    changePasswordModal.classList.add("active");
    changePasswordModal.setAttribute("aria-hidden", "false");

    currentPasswordInput.focus();
}

function closeChangePasswordModalFunction() {
    changePasswordModal.classList.remove("active");
    changePasswordModal.setAttribute("aria-hidden", "true");

    changePasswordForm.reset();
}

function updatePassword(event) {
    event.preventDefault();

    const user = getCurrentUser();

    if (!user) {
        window.location.replace("login.html");
        return;
    }

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    const users = getUsers();

    const storedUser = users.find(
        item => item.id === user.id
    );

    if (!storedUser) {
        alert("Unable to find your account.");
        return;
    }

    if (storedUser.password !== currentPassword) {
        alert("Current password is incorrect.");
        return;
    }

    if (newPassword.length < 6) {
        alert(
            "New password must contain at least 6 characters."
        );
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("New passwords do not match.");
        return;
    }

    if (newPassword === currentPassword) {
        alert(
            "New password must be different from your current password."
        );
        return;
    }

    const updatedUsers = users.map(item => {
        if (item.id !== user.id) {
            return item;
        }

        return {
            ...item,
            password: newPassword
        };
    });

    saveUsers(updatedUsers);

    closeChangePasswordModalFunction();

    alert("Password changed successfully.");
}

function handleProfileLogout() {
    logoutUser();
    window.location.replace("login.html");
}

/* =========================
   PROFILE IMAGE
========================= */

function handleProfileImageUpload(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {

        alert(
            "Please select a valid image."
        );

        return;
    }

    const reader =
        new FileReader();

    reader.onload = function () {

        const user =
            getCurrentUser();

        if (!user) {
            return;
        }

        const imageData =
            reader.result;

        const users =
            getUsers();

        const updatedUsers =
            users.map(
                item => {

                    if (item.id !== user.id) {
                        return item;
                    }

                    return {
                        ...item,
                        profileImage: imageData
                    };
                }
            );

        saveUsers(updatedUsers);

        saveCurrentUser({
            ...user,
            profileImage: imageData
        });

        renderProfilePage();
    };

    reader.readAsDataURL(file);
}

/* =========================
   REMOVE PROFILE IMAGE
========================= */

function handleRemoveProfileImage() {

    const user = getCurrentUser();

    if (!user || !user.profileImage) {
        return;
    }

    const confirmRemove =
        confirm(
            "Are you sure you want to remove your profile picture?"
        );

    if (!confirmRemove) {
        return;
    }

    const users = getUsers();

    const updatedUsers = users.map(
        item => {

            if (item.id !== user.id) {
                return item;
            }

            const updatedUser = {
                ...item
            };

            delete updatedUser.profileImage;

            return updatedUser;
        }
    );

    saveUsers(updatedUsers);

    const updatedCurrentUser = {
        ...user
    };

    delete updatedCurrentUser.profileImage;

    saveCurrentUser(
        updatedCurrentUser
    );

    renderProfilePage();

    if (profileImageInput) {
        profileImageInput.value = "";
    }
}

if (profileImageInput) {

    profileImageInput.addEventListener(
        "change",
        handleProfileImageUpload
    );
}

if (removeProfileImage) {

    removeProfileImage.addEventListener(
        "click",
        handleRemoveProfileImage
    );
}

editProfileButton.addEventListener(
    "click",
    openEditProfileModal
);

changePasswordButton.addEventListener(
    "click",
    openChangePasswordModal
);

profileLogoutButton.addEventListener(
    "click",
    handleProfileLogout
);

closeEditProfileModal.addEventListener(
    "click",
    closeEditProfileModalFunction
);

cancelEditProfile.addEventListener(
    "click",
    closeEditProfileModalFunction
);

editProfileForm.addEventListener(
    "submit",
    updateUserProfile
);

closeChangePasswordModal.addEventListener(
    "click",
    closeChangePasswordModalFunction
);

cancelChangePassword.addEventListener(
    "click",
    closeChangePasswordModalFunction
);

changePasswordForm.addEventListener(
    "submit",
    updatePassword
);

/* CLOSE MODALS WHEN CLICKING OUTSIDE */

editProfileModal.addEventListener("click", event => {
    if (event.target === editProfileModal) {
        closeEditProfileModalFunction();
    }
});

changePasswordModal.addEventListener("click", event => {
    if (event.target === changePasswordModal) {
        closeChangePasswordModalFunction();
    }
});



renderProfilePage();