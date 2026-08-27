"use strict";

const currentUser = getCurrentUser();

if (!currentUser) {
    window.location.replace("login.html");
}