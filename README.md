# Jupyter Book Template for Data Science Projects

**A Jupyter Book template for data science projects with GitHub Pages deployment and automated portfolio integration/updating using GitHub Actions.**

*Author: Arham Naqvi*

*Last Updated: November 13th, 2025*

---
## 🎯 Overview
This repository serves as a **template** for creating professional data science project documentation using Jupyter Book. Clone this repository to quickly set up new projects with:
- ✅ Pre-configured Jupyter Book structure
- ✅ Automated GitHub Pages deployment
- ✅ Date auto-update on deployment
---
## 🚀 Quick Start
### 1. Clone This Template
```bash
git clone https://github.com/Syed-A-Naqvi/sample_jupyter_book.git your-project-name
git remote remove origin
### 2. Customize Project Metadata
Edit `_config.yml` with your project information:
description: "Brief one-line description of your project"
logo: "logo.jpg"  # Path MUST be relative to project root
project_metadata:
**Important:** All metadata (title, description, author, tags, logoURL) is managed in `_config.yml`. This data will be:
- Automatically sent to your portfolio website on deployment
### 3. Replace Logo
Replace `logo.jpg` with your project logo (recommended size: 200x200px).
### 4. Customize Book Landing Page
The `README.md` is set as `root:` in the `toc.yml` file and serves as the book landing page. The *header* comprises all lines before the first `---` and is automatically updated by *github actions* using the current date and the `title`, `author` and `description` key values from the `_config.yml` file.
*Last Updated: [d-m-y]*
- Add Jupyter Notebooks (`.ipynb`) for interactive analysis
2. **Organize your assets** within this directory:
   Jupyter-Book-Root/
   │   ├── figures/
   │   │   └── figure2.jpg
   │   │   └── demo.mp4
   │   │   └── results.csv
   │       └── analysis.py
   ```markdown
   
     <source src="assets/videos/demo.mp4" type="video/mp4">
   
   
   **In Jupyter Notebooks:**
   from IPython.display import Image, Video
   Video('assets/videos/demo.mp4')
   ```
   - Jupyter Book will copy the entire directory to `_build/html/` during the build
   - Only exclude directories you don't want in the final build (e.g., `scripts/`, raw data processing code)
**What to Exclude:**
```yaml
exclude_patterns: 
  - "raw_data/*"          # Unprocessed data files
  - "venv/*"              # Virtual environment
- Asset directories (`assets/`, `project/`, `figures/`, etc.)
- Static files like `_static/` (needed for custom CSS/JS)
---
## 📖 Jupyter Book Basics
### Table of Contents Structure (`_toc.yml`)
The `_toc.yml` file defines your book's structure with chapters and sections:
```yaml
root: overview              # Landing page (overview.md)
  - file: intro             # Chapter 1: intro.md
    sections:               # Subsections under methodology
      - file: preprocessing
    sections:
      - file: modeling
  - file: conclusion        # Chapter 5: conclusion.md
- `root` is your landing page (usually `overview.md` or `intro.md`)
- Use `sections` to create subsections under a chapter
:::{note}
This is a note admonition.
:::{warning}
This is a warning!
:::{tip}
Helpful tip here.
:::{important}
Important information.
:::{dropdown} Click to expand
Hidden content goes here.
:::
:::
:::
::::{tab-set}
:::{tab-item} Python
```python
print("Hello from Python")
:::
:::{tab-item} R
```r
print("Hello from R")
```
:::
::::
:::{figure} assets/figures/plot.png
:width: 80%
This is the figure caption. You can reference this as {numref}`fig-plot`.
:::
```
:::{figure} modelfit_animation.gif
:width: 80%
This is the figure caption. You can reference this as {numref}`fig-plot`.
:::



```

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$



```

```{code-block} python
:linenos:
:emphasize-lines: 2,3
:caption: Example code

import pandas as pd
df = pd.read_csv('data.csv')
print(df.head())
```



```markdown
(section-label)=
```

(section-label)=


To refer to targets:

```markdown

```

See {ref}`section-label` for more details.

Check out {numref}`fig-plot` and {numref}`table-results`.

### Citations & Bibliography

#### Setup `references.bib`

Create or edit `references.bib` in your project root:

```bibtex

@inproceedings{holdgraf_evidence_2014,
	title = {Evidence for {Predictive} {Coding} in {Human} {Auditory} {Cortex}},
	publisher = {Frontiers in Neuroscience},
	year = {2014}

	title = {Rapid tuning shifts in human auditory cortex enhance speech intelligibility},
	issn = {2041-1723},
	doi = {10.1038/ncomms13654},
	journal = {Nature Communications},
	year = {2016},
	file = {Holdgraf et al. - 2016 - Rapid tuning shifts in human auditory cortex enhance speech intelligibility.pdf:C\:\\Users\\chold\\Zotero\\storage\\MDQP3JWE\\Holdgraf et al. - 2016 - Rapid tuning shifts in human auditory cortex enhance speech intelligibility.pdf:application/pdf}

  title     = {The Ruby Programming Language},
  year      = {2008},
```


```yaml
bibtex_bibfiles:
```

#### Generate Bibliography

Add a bibliography section at the end of your document (**required for proper citation resolution**):

````markdown

```

````

**Filter by citation:**

````markdown

```{bibliography}
```

````

#### Cite in Your Content

**Single citation:**

```markdown
```

According to book {cite}`ruby`, there is a programming language called `ruby`.

**Multiple citations:**

```markdown
```

Multiple studies {cite}`holdgraf_rapid_2016,holdgraf_evidence_2014` support this claim.

**Narrative citation:**

```markdown
```

{cite:t}`holdgraf_rapid_2016` found that...

### Jupyter Notebook Integration

#### Cell Tags for Control

Add tags to notebook cells to control execution and display:

- `remove-input` - Hide code, show output
- `remove-cell` - Hide entire cell
- `hide-output` - Collapsible output

In Jupyter: View → Cell Toolbar → Tags

#### Execute Notebooks on Build

Configure in `_config.yml`:

```yaml
  execute_notebooks: auto    # auto, force, cache, or off
  exclude_patterns:
```

**Options:**
- `cache` - Use cached outputs, execute if missing
- `force` - Always re-execute

#### Notebook Metadata

Add cell metadata for MyST features:

```json
  "tags": ["hide-input"],
    "image": {
      "align": "center"
  }
}
```

### Useful Resources

- **[Official Jupyter Book Documentation](https://jupyterbook.org/)** - Comprehensive guide
- **[Sphinx Design](https://sphinx-design.readthedocs.io/)** - Advanced components (cards, grids, tabs)

---

## 📁 Repository Structure

```
jupyter-book-root/
├── README.md                   # Main landing page (edit this)
├── _config.yml                 # Project metadata (edit this)
├── _toc.yml                    # Table of contents structure (edit this)
├── logo.jpg                    # Project logo (replace this)
├── requirements.txt            # Python dependencies
├── *.md                        # Markdown pages (include in _toc.yml)
├── *.ipynb                     # Jupyter notebooks (include in _toc.yml)
├── _static/                    # Custom css and js inserted into final html build
├─── scripts/                   # Custom scripts
├── _build/                     # Generated HTML (auto-created)
├─── .github/
│   └── workflows/
│       └── deploy.yml          # Automated deployment workflow
```

---

## 🎨 Styling & Theming

### Portfolio Color Palette

The template includes custom CSS (`_static/portfolio-sync.css`) with a professional color scheme consistent with that of the portfolio:

**Light Mode:**

- Primary: Deep Burgundy Red
- Secondary: Rich Gold
- Background: Warm Cream

**Dark Mode:**

- Primary: Muted Warm Gold
- Secondary: Bright Deep Red
- Background: Deep Charcoal Brown

**IMPORTANT:** Do not change path or name of `_static/portfolio-sync.css`.

### Available Card Header Colors

Use these classes in MyST directives (e.g., `:class-header: bg-primary`):

- `bg-primary` - Burgundy/Gold (theme primary color -- redefined in portfolio-sync.css)
- `bg-secondary` - Gold/Red (theme secondary color)
- `bg-success` - Green
- `bg-info` - Blue
- `bg-warning` - Orange
- `bg-danger` - Red
- `bg-light` - Light gray/beige
- `bg-dark` - Dark gray/brown
- `bg-muted` - Muted gray

### iFrame Integration Features

This template is designed to work seamlessly when embedded in an iframe on your portfolio website. The `_static/portfolio-sync.js` script provides several iframe-specific enhancements:

#### Theme Synchronization

When the book is displayed through an `iframe`, the parent webpage can send `postMessage` requests to synchronize the theme:

```javascript
// From parent window
iframe.contentWindow.postMessage(
  { type: "update-theme", theme: "dark" },
  "https://username.github.io"
);
```

**Trusted Origins**: The script only accepts theme updates from pre-configured trusted origins for security.

#### Custom ScrollSpy Implementation

Bootstrap's native ScrollSpy relies on scroll events, which don't properly propagate in iframe contexts. This template includes a **custom IntersectionObserver-based ScrollSpy** that:

- Works reliably in both standalone and iframe contexts
- Monitors section visibility using the IntersectionObserver API (O(n) complexity)
- Maintains hierarchical active states (parent sections remain active when child is active)
- Provides smooth scrolling when clicking TOC links
- Automatically disables during programmatic scrolls to prevent conflicts

**Technical Details**: See `SCROLLSPY_EXPLANATION.md` for a complete explanation of the implementation.

#### UI Cleanup

When loaded in an iframe, the script automatically:

- Removes theme toggle buttons (theme controlled by parent)
- Removes fullscreen buttons (not relevant in iframe context)
- Prevents horizontal scrolling for better iframe display

All iframe integration code is in `_static/portfolio-sync.js`.

---

(hot-reload-workflow)=

## 🔧 Building Locally with Hot-Reload Functionality

### Prerequisites

```bash
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Update pip
python -m pip install --upgrade pip

# Install dependencies
pip install jupyter-book<2.0
# Install additional dependencies as needed during book execution
```

### Build Commands

Execute commands in jupyter-book root directory:

```bash
# Clean previous builds (if needed)
jupyter-book clean . --all

# Build the book
jupyter-book build . --all

# Generate sphinx config
jupyter-book config sphinx .

# View the book live in browser at port 127.0.0.1:8000
sphinx-autobuild . _build/html --open-browser
```

---

## 🚢 Deployment Workflow

### Setup GitHub Pages

1. Go to your repository **Settings** → **Pages**
2. Under "Source", select **GitHub Actions**
3. The workflow will automatically deploy on the next push

### Configure Actions Environment Variables

**Required for portfolio integration:**

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Create a **secret** named **PORTFOLIO_PAT** set to the **portfolio personal access token** for portfolio workflow dispatch authentication
3. Create a **variable** named **PORTFOLIO_REPO** set to the portfolio repository name in the format {*username*}/{*portfolio_repo*}
4. These environment secrets are required for portfolio auto-updating functionality

**Note:** If you don't have a portfolio to integrate with, the deployment will still work but the metadata notification step will fail (this is expected and won't prevent deployment).

### Automated GitHub Pages Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically:

1. **Updates README Header** - Updates the header (up to the first `---`) using current date and metadata from `_config.yml`
2. **Commits Changes** - The runner checks for changes (new, modified, or deleted files) before committing, using `[skip ci]` to prevent recursive triggers
3. **Builds HTML** - Runs `jupyter-book build .` to generate static HTML pages
4. **Deploys to GitHub Pages** - Publishes the book to `https://your-username.github.io/your-project-name`
5. **Notifies Portfolio** - Sends project metadata via repository dispatch to trigger portfolio gallery updates (requires PORTFOLIO_PAT and PORTFOLIO_REPO configuration)

### Workflow Trigger

The workflow runs automatically on every push to the `main` branch:

```yaml
on:
  push:
    branches:
      - main
```


---

## 🔗 Portfolio Integration

### How It Works

After the book is deployed to GitHub Pages, the GitHub Actions runner executes the `scripts/send-metadata.py` script. This script sends project metadata via a POST request to your portfolio's repository dispatch API endpoint using the event type `"project-updated"`.

**GitHub Repository Dispatch** is a feature that allows external systems to trigger workflows in other repositories via authenticated API calls.

### Metadata Sent

The following data is extracted from `_config.yml` and sent to your portfolio:

```json
{
  "title": "Your Book Title",
  "description": "Brief book description/caption/subtitle",
  "author": "Your Name",
  "tags": ["tag1", "tag2", "tag3"],
  "url": "https://your-username.github.io/your-project-name",
  "logo_path": "https://your-username.github.io/your-project-name/logo.jpg",
  "date": "2025-11-12"
}
```

**Important Fields:**

- `logo_path`: Full URL to the logo image at the deployed site
- `url`: The live GitHub Pages URL for the deployed book
- `date`: Current date in YYYY-MM-DD format (auto-generated on deployment)

### Portfolio Workflow

Your portfolio repository should:

1. Listen for the `project-updated` repository dispatch event
2. Extract the metadata payload from the request
3. Use the metadata to update the portfolio project gallery
4. Redeploy to GitHub Pages with the updated content

**Setup Requirements:**

- Portfolio must have a workflow that triggers on `repository_dispatch` events
- The PORTFOLIO_PAT token must have `repo` scope permissions
- The token must be authorized to trigger workflows in the portfolio repository

---

## 🐛 Troubleshooting

### Build Errors

:::{warning}
This project requires `jupyter-book<2.0`. Installing version 2.0 or higher will cause build failures.
:::

**Issue:** `jupyter-book` command not found

```bash
# Ensure virtual environment is activated
source venv/bin/activate
pip install "jupyter-book<2.0"
```

**Issue:** YAML syntax errors in `_config.yml`

- Check indentation (use spaces, not tabs)
- Validate YAML syntax online: <https://www.yamllint.com/>

**Issue:** Module not found during build

```bash
# Install book-specific dependencies
pip install -r book_requirements.txt
```

### Deployment Issues

**Issue:** GitHub Pages not updating

1. Check the **Actions** tab for workflow errors
2. Ensure GitHub Pages is configured to use **GitHub Actions** (not branch)
3. Verify the workflow has appropriate permissions

**Issue:** Portfolio not updating

1. Verify PORTFOLIO_PAT secret is set correctly
2. Verify PORTFOLIO_REPO variable format: `username/repo-name`
3. Check that the PAT has `repo` scope permissions
4. Ensure portfolio has a workflow listening for `repository_dispatch` events

**Issue:** Styling not applied

- Ensure `_static/portfolio-sync.css` exists and is named correctly
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Rebuild locally using the hot-reload workflow ({ref}`hot-reload-workflow`)

**Issue:** Custom CSS/JS not loading

- Check `_config.yml` has correct paths in `html.extra_css` and `html.extra_js`
- Verify files are in `_static/` directory (not `_build/_static/`)
- Ensure files aren't listed in `exclude_patterns`

### iFrame Integration Issues

**Issue:** ScrollSpy not working in iframe

- This is expected with Bootstrap's default ScrollSpy
- The custom implementation in `portfolio-sync.js` should handle this
- Verify the script is loading: check browser console for errors

**Issue:** Theme not syncing between parent and iframe

- Check that parent origin is in the `TRUSTED_ORIGINS` array in `portfolio-sync.js`
- Verify `postMessage` is using the correct format:

  ```javascript
  iframe.contentWindow.postMessage(
    { type: "update-theme", theme: "dark" },
    "https://your-book-url.github.io"
  );
  ```

---

## 📚 Resources

- [Jupyter Book Documentation](https://jupyterbook.org/)
- [MyST Markdown Guide](https://myst-parser.readthedocs.io/)
- [Sphinx Design Components](https://sphinx-design.readthedocs.io/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## 📄 License

This template is open source and available for use in your projects.

---

## 🤝 Contributing

Improvements to this template are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## ✨ Example Projects

See this template in action:

- [Crime Hotspot Mapping Analysis](https://syed-a-naqvi.github.io/sample_jupyter_book/)

---

Happy documenting! 🚀📊

## References

```{bibliography}
```
