const GITHUB_USERNAME = "I-Fardeen";

const themeToggle = document.getElementById("theme-toggle");
const featuredProjectsContainer =
    document.getElementById("featured-projects");
const githubStatsContainer =
    document.getElementById("github-stats");

/* =========================================
   THEME
========================================= */

const savedTheme =
    localStorage.getItem("theme");

const initialTheme =
    savedTheme === "light"
        ? "light"
        : "dark";

document.documentElement.dataset.theme =
    initialTheme;


function updateThemeIcon() {
    const themeIcon =
        document.getElementById("theme-icon");

    if (!themeIcon) {
        return;
    }

    const currentTheme =
        document.documentElement.dataset.theme;

    themeIcon.textContent =
        currentTheme === "dark"
            ? "☀"
            : "☾";
}


updateThemeIcon();


if (themeToggle) {
    themeToggle.addEventListener("click", () => {

        const currentTheme =
            document.documentElement.dataset.theme ||
            "dark";

        const newTheme =
            currentTheme === "dark"
                ? "light"
                : "dark";

        document.documentElement.dataset.theme =
            newTheme;

        localStorage.setItem(
            "theme",
            newTheme
        );

        updateThemeIcon();

    });
}
/* =========================================
   GITHUB API
========================================= */

async function getGitHub(url) {

    try {

        const response = await fetch(url);

        if (!response.ok) {
            return null;
        }

        return await response.json();

    } catch (error) {

        console.warn(
            "GitHub API unavailable:",
            error
        );

        return null;
    }
}


async function getRepository(repoName) {

    return getGitHub(
        `https://api.github.com/repos/` +
        `${GITHUB_USERNAME}/${repoName}`
    );
}


/* =========================================
   FORMATTING
========================================= */

function formatNumber(number) {

    return new Intl.NumberFormat("en-US").format(
        number
    );
}


function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    return new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).format(
        new Date(dateString)
    );
}


/* =========================================
   GITHUB IMPACT STATS
========================================= */

/*
 * These are portfolio baseline figures.
 *
 * We intentionally do NOT calculate commits
 * through the public GitHub API because the
 * unauthenticated statistics endpoint can be
 * rate-limited.
 *
 * Update these periodically when desired.
 */

const githubImpact = {

    commits: 958,

    stars: 21,

    forks: 3,

    repositories: 12,

    technicalResources: 100

};


function renderGitHubStats() {

    if (!githubStatsContainer) {
        return;
    }


    githubStatsContainer.innerHTML = `

        <div class="github-stat">

            <strong>
                ${formatNumber(
                    githubImpact.commits
                )}+
            </strong>

            <span>
                Commits
            </span>

        </div>


        <div class="github-stat">

            <strong>
                ${formatNumber(
                    githubImpact.stars
                )}
            </strong>

            <span>
                Stars
            </span>

        </div>


        <div class="github-stat">

            <strong>
                ${formatNumber(
                    githubImpact.forks
                )}
            </strong>

            <span>
                Forks
            </span>

        </div>


        <div class="github-stat">

            <strong>
                ${formatNumber(
                    githubImpact.repositories
                )}
            </strong>

            <span>
                Repositories
            </span>

        </div>

        <div class="github-stat">
    <strong>
        ${formatNumber(
            githubImpact.technicalResources
        )}+
    </strong>
    <span>
        Technical Resources Authored
    </span>
</div>

    `;
}


/* =========================================
   PROJECT CARD
========================================= */

function createProjectCard(
    project,
    repository,
    index
) {
    const card =
        document.createElement("article");

    card.className =
        "featured-project";

    const githubUrl =
        project.url ||
        (
            repository
                ? repository.html_url
                : `https://github.com/` +
                  `${GITHUB_USERNAME}/${project.repo}`
        );

    const projectNumber =
        String(index + 1).padStart(2, "0");

    let repositoryStats;

    if (repository) {
        repositoryStats = `
            <div class="project-stats">
                <span>
                    ★ ${formatNumber(
                        repository.stargazers_count
                    )}
                </span>

                <span>
                    Forks ${formatNumber(
                        repository.forks_count
                    )}
                </span>

                ${
                    repository.language
                        ? `
                            <span>
                                ${repository.language}
                            </span>
                        `
                        : ""
                }

                <span>
                    Updated ${formatDate(
                        repository.updated_at
                    )}
                </span>
            </div>
        `;
    } else if (
        project.name ===
        "FAK Log Analyzer"
    ) {
        repositoryStats = `
            <div class="project-stats">
                <span>
                    Repository coming soon
                </span>
            </div>
        `;
    } else {
        repositoryStats = `
            <div class="project-stats">
                <span>
                    GitHub project
                </span>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="project-number">
            ${projectNumber}
        </div>

        <div class="project-content">
            <p class="project-type">
                ${project.category}
            </p>

            <h3>
                ${project.name}
            </h3>

            <p>
                ${project.description}
            </p>

            <div class="tags">
                ${project.technologies
                    .map(
                        (technology) =>
                            `<span>${technology}</span>`
                    )
                    .join("")}
            </div>

            ${repositoryStats}

            <a
                href="${githubUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="project-link"
            >
                ${
                    repository
                        ? "View repository →"
                        : project.name ===
                          "FAK Log Analyzer"
                            ? "Repository coming soon →"
                            : "Explore on GitHub →"
                }
            </a>
        </div>
    `;

    return card;
}

/* =========================================
   LOAD FEATURED PROJECTS
========================================= */
async function loadFeaturedProjects() {
    if (!featuredProjectsContainer) {
        return;
    }

    featuredProjectsContainer.innerHTML = "";

    for (
        const [index, project]
        of featuredProjects.entries()
    ) {
        let repository = null;

        if (
            project.name !==
            "Data Science Reading Material"
        ) {
            repository =
                await getRepository(
                    project.repo
                );
        }

        const card =
            createProjectCard(
                project,
                repository,
                index
            );

        featuredProjectsContainer.appendChild(
            card
        );
    }
}


/* =========================================
   INITIALISE
========================================= */

async function initialisePortfolio() {

    /*
     * Render impact numbers immediately.
     */

    renderGitHubStats();


    /*
     * Load project cards independently.
     */

    await loadFeaturedProjects();

}


/* =========================================
   START
========================================= */

initialisePortfolio();