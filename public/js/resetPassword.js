document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("resetPasswordForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const message = document.getElementById("message");

        message.className = "message";
        message.style.display = "none";

        if (password !== confirmPassword) {
            message.className = "message error";
            message.innerHTML = "Passwords do not match.";
            message.style.display = "block";
            return;
        }

        const token = window.location.pathname.split("/").pop();

        try {
            const response = await fetch(`/api/auth/reset-password/${token}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    password
                })
            });

            const data = await response.json();

            if (data.success) {
                message.className = "message success";
                message.innerHTML = data.message;

                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            } else {
                message.className = "message error";
                message.innerHTML = data.message;
            }

            message.style.display = "block";

        } catch (err) {
            message.className = "message error";
            message.innerHTML = "Something went wrong.";
            message.style.display = "block";
        }
    });
});