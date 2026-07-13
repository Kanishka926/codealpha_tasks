document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("forgotPasswordForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message");

        message.className = "message";
        message.style.display = "none";

        if (!email) {
            message.className = "message error";
            message.innerHTML = "Please enter your email.";
            message.style.display = "block";
            return;
        }

        message.className = "message success";
        message.innerHTML =
            "Password reset feature is under development. Please contact the administrator.";
        message.style.display = "block";

        form.reset();
    });
});