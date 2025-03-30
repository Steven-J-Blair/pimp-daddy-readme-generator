document.getElementById("repo_url").addEventListener("change", async function() {
    const url = this.value.trim();
    if (!url) return;

    try {
        const repo = url.split('/').slice(-2).join('/');
        const baseApi = `https://api.github.com/repos/${repo}`;
        
        // Fetch basic repo data
        const repoResponse = await fetch(baseApi);
        if (!repoResponse.ok) throw new Error("Repo not found");
        const repoData = await repoResponse.json();

        // Fetch languages
        const langResponse = await fetch(`${baseApi}/languages`);
        const languages = await langResponse.json();
        const primaryLang = Object.keys(languages)[0] || "Unknown";

        // Fetch contents (top-level files)
        const contentsResponse = await fetch(`${baseApi}/contents`);
        const contents = await contentsResponse.json();
        const files = Array.isArray(contents) ? contents.map(file => file.name) : [];

        // Fetch latest commit (optional context)
        const commitResponse = await fetch(`${baseApi}/commits?per_page=1`);
        const commits = await commitResponse.json();
        const latestCommit = commits[0]?.commit.message || "Initial commit";

        // Populate fields with smart defaults
        document.getElementById("project_name").value = repoData.name || "My Awesome Project";
        document.getElementById("description").value = repoData.description || 
            `A ${primaryLang} project to ${inferPurpose(files, latestCommit)}.`;
        document.getElementById("installation").value = 
            `Clone the repo:\ngit clone ${url}\n${installSteps(primaryLang, files)}`;
        document.getElementById("usage").value = usageSteps(primaryLang, files);
        document.getElementById("license").value = repoData.license?.name || "MIT";
        document.getElementById("dependencies").value = guessDependencies(primaryLang, files);
        document.getElementById("contributing").value = 
            "Fork it, make a PR, or open an issue—let’s build this together!";
        document.getElementById("tests").value = "Tests coming soon—stay tuned!";
        document.getElementById("authors").value = repoData.owner.login || "You!";
        document.getElementById("acknowledgments").value = 
            "Shoutout to [P.D.R.G.] for pimping this README!";
    } catch (error) {
        console.error("Error:", error);
        alert("Couldn’t fetch repo—check the URL or try manual input!");
    }
});

// Helper functions for smart defaults
function inferPurpose(files, commit) {
    if (files.includes("index.html")) return "build a slick web app";
    if (files.includes("main.py")) return "automate cool stuff";
    if (files.includes("app.js")) return "create a dope Node.js tool";
    return commit.split(" ").slice(0, 3).join(" ") || "do awesome things";
}

function installSteps(lang, files) {
    if (lang === "Python") return "pip install -r requirements.txt";
    if (lang === "JavaScript" && files.includes("package.json")) return "npm install";
    if (lang === "Ruby") return "bundle install";
    return "Follow the setup instructions in the repo.";
}

function usageSteps(lang, files) {
    if (lang === "Python" && files.includes("main.py")) return "python main.py";
    if (lang === "JavaScript" && files.includes("index.js")) return "node index.js";
    if (files.includes("index.html")) return "Open index.html in your browser.";
    return "Check the docs or source code to get started.";
}

function guessDependencies(lang, files) {
    if (lang === "Python") return "See requirements.txt (if present)";
    if (lang === "JavaScript") return "Listed in package.json";
    return "None specified—add as needed!";
}

// Form submit logic below...

document.getElementById("readmeForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const readmeContent = `# ${document.getElementById("project_name").value}

## Description
${document.getElementById("description").value}

## Installation
${document.getElementById("installation").value}

## Usage
${document.getElementById("usage").value}

## License
${document.getElementById("license").value}

## Dependencies
${document.getElementById("dependencies").value}

## Contributing
${document.getElementById("contributing").value}

## Tests
${document.getElementById("tests").value}

## Authors
${document.getElementById("authors").value}

## Acknowledgments
${document.getElementById("acknowledgments").value}
`;

    // Display output
    document.getElementById("output").textContent = readmeContent;

    // Create a downloadable README file
    const blob = new Blob([readmeContent], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "README.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Fetch repo data and populate fields:
document.getElementById("repo_url").addEventListener("change", async function() {
    const url = this.value.trim();
    if (!url) return;

    try {
        const repo = url.split('/').slice(-2).join('/'); // e.g., "username/repo"
        const apiUrl = `https://api.github.com/repos/${repo}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Repo not found");
        const data = await response.json();

        document.getElementById("project_name").value = data.name || "";
        document.getElementById("description").value = data.description || "";
        document.getElementById("installation").value = `Clone the repo:\ngit clone ${url}` || "";
        document.getElementById("license").value = data.license?.name || "MIT";
        document.getElementById("authors").value = data.owner.login || "";
        // Leave others blank for manual tweaks
    } catch (error) {
        console.error("Error fetching repo:", error);
        alert("Couldn’t fetch repo—check the URL!");
    }
});