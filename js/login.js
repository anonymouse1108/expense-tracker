"use strict";

/* =========================
   ELEMENTS
========================= */

const authForm = document.getElementById("authForm");

const authNameGroup =
    document.getElementById("authNameGroup");

const authName =
    document.getElementById("authName");

const authEmail =
    document.getElementById("authEmail");

const authPassword =
    document.getElementById("authPassword");

const authPageTitle =
    document.getElementById("authPageTitle");

const authPageDescription =
    document.getElementById("authPageDescription");

const authSubmitButton =
    document.getElementById("authSubmitButton");

const authSwitchText =
    document.getElementById("authSwitchText");

const authSwitchButton =
    document.getElementById("authSwitchButton");

let loginMode = true;


/* =========================
   SWITCH LOGIN / REGISTER
========================= */

function updateAuthMode() {

    if (loginMode) {

        authPageTitle.textContent =
            "Welcome Back";

        authPageDescription.textContent =
            "Login to manage your personal finances.";

        authNameGroup.style.display =
            "none";

        authName.required = false;

        authPassword.autocomplete =
            "current-password";

        authSubmitButton.textContent =
            "Login";

        authSwitchText.textContent =
            "Don't have an account?";

        authSwitchButton.textContent =
            "Create Account";

    } else {

        authPageTitle.textContent =
            "Create Account";

        authPageDescription.textContent =
            "Create your account to start tracking your finances.";

        authNameGroup.style.display =
            "block";

        authName.required = true;

        authPassword.autocomplete =
            "new-password";

        authSubmitButton.textContent =
            "Create Account";

        authSwitchText.textContent =
            "Already have an account?";

        authSwitchButton.textContent =
            "Login";
    }
}


/* =========================
   SWITCH BUTTON
========================= */

authSwitchButton.addEventListener(
    "click",
    () => {

        loginMode = !loginMode;

        authForm.reset();

        updateAuthMode();

        authEmail.focus();
    }
);


/* =========================
   FORM SUBMIT
========================= */

authForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const email =
            authEmail.value.trim();

        const password =
            authPassword.value;

        let result;

        if (loginMode) {

            result = loginUser(
                email,
                password
            );

        } else {

            const name =
                authName.value.trim();

            result = registerUser(
                name,
                email,
                password
            );
        }

        if (!result.success) {

            alert(result.message);

            return;
        }

        alert(result.message);

        window.location.href =
            "index.html";
    }
);


/* =========================
   INITIALIZE
========================= */

updateAuthMode();