// Repo URL fetch and populate fields
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
        const latestCommit = commits[0] ? commits[0].commit.message : "Initial commit";

        // Populate fields with smart defaults
        document.getElementById("project_name").value = repoData.name || "My Awesome Project";
        document.getElementById("description").value = repoData.description || 
            `A ${primaryLang} project to ${inferPurpose(files, latestCommit)}.`;
        document.getElementById("installation").value = 
            `Clone the repo:\ngit clone ${url}\n${installSteps(primaryLang, files)}`;
        document.getElementById("usage").value = usageSteps(primaryLang, files);
        document.getElementById("license").value = repoData.license ? repoData.license.name : "MIT";
        document.getElementById("dependencies").value = guessDependencies(primaryLang, files);
        document.getElementById("contributing").value = 
            "Fork it, make a PR, or open an issue—let’s build this together!";
        document.getElementById("tests").value = "Tests coming soon—stay tuned!";
        document.getElementById("authors").value = repoData.owner ? repoData.owner.login : "You!";
        document.getElementById("acknowledgments").value = 
            "Shoutout to [P.D.R.G.] for pimping this README!";

        // Trigger the preview after fields are populated
        renderPreview();
    } catch (error) {
        console.error("Error:", error);
        alert("Couldn’t fetch repo—check the URL or try manual input!");
    }
});

// Form submission to generate README
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

    // Render the preview
    document.getElementById("output").innerHTML = marked.parse(readmeContent);

    // Download the file
    const blob = new Blob([readmeContent], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "README.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Load saved inputs on page load
window.addEventListener("load", function() {
    document.getElementById("project_name").value = localStorage.getItem("project_name") || "";
    document.getElementById("description").value = localStorage.getItem("description") || "";
    document.getElementById("installation").value = localStorage.getItem("installation") || "";
    document.getElementById("usage").value = localStorage.getItem("usage") || "";
    document.getElementById("license").value = localStorage.getItem("license") || "";
    document.getElementById("dependencies").value = localStorage.getItem("dependencies") || "";
    document.getElementById("contributing").value = localStorage.getItem("contributing") || "";
    document.getElementById("tests").value = localStorage.getItem("tests") || "";
    document.getElementById("authors").value = localStorage.getItem("authors") || "";
    document.getElementById("acknowledgments").value = localStorage.getItem("acknowledgments") || "";
    renderPreview(); // Show saved data in preview
});

// Save inputs as they change
document.getElementById("readmeForm").addEventListener("input", function() {
    localStorage.setItem("project_name", document.getElementById("project_name").value);
    localStorage.setItem("description", document.getElementById("description").value);
    localStorage.setItem("installation", document.getElementById("installation").value);
    localStorage.setItem("usage", document.getElementById("usage").value);
    localStorage.setItem("license", document.getElementById("license").value);
    localStorage.setItem("dependencies", document.getElementById("dependencies").value);
    localStorage.setItem("contributing", document.getElementById("contributing").value);
    localStorage.setItem("tests", document.getElementById("tests").value);
    localStorage.setItem("authors", document.getElementById("authors").value);
    localStorage.setItem("acknowledgments", document.getElementById("acknowledgments").value);
    renderPreview(); // Update preview on input
});

// Render the markdown preview
function renderPreview() {
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
    document.getElementById("output").innerHTML = marked.parse(readmeContent);
}

// Clear form function
function clearForm() {
    localStorage.clear();
    document.getElementById("readmeForm").reset();
    document.getElementById("output").innerHTML = "";
}

// Helper functions for smart defaults
function inferPurpose(files, commit) {
    if (files.includes("index.html")) return "build a slick web app with HTML/CSS";
    if (files.includes("main.py")) return "automate tasks with Python";
    if (files.includes("app.js")) return "create a Node.js backend or CLI tool";
    if (files.includes("Dockerfile")) return "deploy a containerized app";
    return "streamline your workflow (based on commit: " + commit.split(" ").slice(0, 3).join(" ") + ")";
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

