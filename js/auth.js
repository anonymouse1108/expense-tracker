"use strict";

const USERS_STORAGE_KEY = "expenseTrackerUsers";
const CURRENT_USER_KEY = "expenseTrackerCurrentUser";

let authMode = "login";

function getUsers() {
    try {
        const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);

        if (!savedUsers) {
            return [];
        }

        const users = JSON.parse(savedUsers);

        return Array.isArray(users) ? users : [];
    } catch (error) {
        console.error("Unable to load users:", error);
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(
        USERS_STORAGE_KEY,
        JSON.stringify(users)
    );
}

function getCurrentUser() {
    try {
        const savedUser =
            localStorage.getItem(CURRENT_USER_KEY);

        if (!savedUser) {
            return null;
        }

        return JSON.parse(savedUser);
    } catch (error) {
        console.error("Unable to load current user:", error);
        return null;
    }
}

function saveCurrentUser(user) {
    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(user)
    );
}

function clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

function validateRegistration(name, email, password) {
    if (!name) {
        return "Please enter your full name.";
    }

    if (name.length < 2) {
        return "Name must contain at least 2 characters.";
    }

    if (!email) {
        return "Please enter your email.";
    }

    if (!password) {
        return "Please enter a password.";
    }

    if (password.length < 6) {
        return "Please enter a password with at least 6 characters.";
    }

    return null;
}

function validateLogin(email, password) {
    if (!email) {
        return "Please enter your email.";
    }

    if (!password) {
        return "Please enter your password.";
    }

    return null;
}

function registerUser(name, email, password) {
    const validationError =
        validateRegistration(
            name,
            email,
            password
        );

    if (validationError) {
        return {
            success: false,
            message: validationError
        };
    }

    const users = getUsers();

    const normalizedEmail =
        email.toLowerCase().trim();

    const existingUser = users.find(
        user => user.email === normalizedEmail
    );

    if (existingUser) {
        return {
            success: false,
            message:
                "An account with this email already exists."
        };
    }

    const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        password: password,
        profileImage: ""
    };

    users.push(newUser);

    saveUsers(users);

    const loggedInUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        profileImage: newUser.profileImage
    };

    saveCurrentUser(loggedInUser);

    return {
        success: true,
        message: "Account created successfully.",
        user: loggedInUser
    };
}

function loginUser(email, password) {
    const validationError =
        validateLogin(
            email,
            password
        );

    if (validationError) {
        return {
            success: false,
            message: validationError
        };
    }

    const users = getUsers();

    const normalizedEmail =
        email.toLowerCase().trim();

    const user = users.find(
        item =>
            item.email === normalizedEmail &&
            item.password === password
    );

    if (!user) {
        return {
            success: false,
            message: "Invalid email or password."
        };
    }

    const loggedInUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || ""
    };

    saveCurrentUser(loggedInUser);

    return {
        success: true,
        message: "Login successful.",
        user: loggedInUser
    };
}

function logoutUser() {
    clearCurrentUser();
}

function isUserLoggedIn() {
    return getCurrentUser() !== null;
}