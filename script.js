const themeToggle = document.getElementById("theme-toggle");

const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
    document.documentElement.dataset.theme = savedTheme;
}

themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme;

    const newTheme =
        currentTheme === "dark"
            ? "light"
            : "dark";

    document.documentElement.dataset.theme = newTheme;

    localStorage.setItem("theme", newTheme);
});