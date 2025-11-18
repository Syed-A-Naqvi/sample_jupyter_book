# Jupyter Book Template for Data Science Projects

**A Jupyter Book template for data science projects with GitHub Pages deployment and automated portfolio integration using GitHub Actions.**

*Author: Arham Naqvi*

*Last Updated: November 13th, 2025*

---

## Overview

A production-ready template for creating professional data science project documentation using Jupyter Book with automation and portfolio integration capabilities.

### Core Features

**Jupyter Book Foundation:**
- Pre-configured structure supporting Markdown, Jupyter Notebooks, and MyST syntax
- Interactive code execution and visualizations
- Built-in search and citation management

**Enhanced Visual Integration:**
- Custom CSS/JS for portfolio-synchronized themes
- Light/dark mode synchronization
- Responsive design for all devices

**Automation:**
- GitHub Pages deployment via GitHub Actions
- Automatic README header updates with current date
- Automatic portfolio updates via POST requests on GitHub pushes

**Portfolio Integration:**
- Real-time project updates reflected in portfolio gallery
- Cross-origin theme synchronization
- Secure postMessage API communication
- Metadata automatically extracted from `_config.yml`

### Documentation Guide

**Getting Started:**
- **[Quick Start](#-quick-start)** - Clone, configure, and deploy
- **[Jupyter Book Basics](#-jupyter-book-basics)** - MyST syntax and formatting

**System Architecture:**
- **[GitHub Actions Workflow](GITHUB_ACTIONS.md)** - CI/CD pipeline documentation
- **[Portfolio Integration](PORTFOLIO_INTEGRATION.md)** - Automated project synchronization

**Advanced Features:**
- **[Theme Synchronization](THEME_SYNC.md)** - Cross-iframe theme coordination
- **[Custom ScrollSpy](SCROLLSPY_EXPLANATION.md)** - Table of contents navigation

**Additional Resources:**
- **[Troubleshooting](#-troubleshooting)** - Common issues and solutions
- **[Repository Structure](#-repository-structure)** - Project organization
- **[Building Locally](#-building-locally)** - Development workflow

---

## Quick Start

### 1. Clone Template

```bash
git clone https://github.com/Syed-A-Naqvi/sample_jupyter_book.git project-name
cd project-name

# Remove original remote and add new
git remote remove origin
git remote add origin https://github.com/username/project-name.git
```

### 2. Customize Project Metadata

Edit `_config.yml`:

```yaml
title: "Project Title"
description: "Brief one-line description"
author: "Author Name"
logo: "logo.jpg"  # Path relative to project root

project_metadata:
  tags: ["tag1", "tag2", "Python", "Data Science"]
```

All metadata is managed in `_config.yml` and automatically sent to the portfolio on deployment.

### 3. Replace Logo

Replace `logo.jpg` with the project logo (recommended: 150x150px).

### 4. Customize Landing Page

The `README.md` is set as `root:` in `toc.yml` and serves as the book's landing page. The header (all lines before the first `---`) is automatically updated by GitHub Actions using current date and metadata from `_config.yml`.

### 5. Add Content

#### Jupyter Book Source Files

- Add Markdown files (`.md`) for documentation
- Add Jupyter Notebooks (`.ipynb`) for interactive analysis
- Update `_toc.yml` to organize table of contents

#### Project Assets & Files

For projects with source code, figures, videos, or other assets:

1. **Create dedicated directory** (e.g., `assets/` or `project/`) at project root
2. **Organize assets** within this directory:

   ```text
   assets/
   ├── figures/
   │   ├── plot1.png
   │   └── plot2.png
   ├── data/
   │   └── sample.csv
   └── videos/
       └── demo.mp4
   ```

3. **Reference using relative paths** in `.md` or `.ipynb` files:

   ```markdown
   ![Plot](assets/figures/plot1.png)
   
   <video src="assets/videos/demo.mp4" controls></video>
   ```

4. **DO NOT add assets directory to `exclude_patterns`** in `_config.yml`
   - Jupyter Book copies the entire directory to `_build/html/` during build
   - Only exclude directories not wanted in final build (e.g., `scripts/`, raw data processing code)

---

## Jupyter Book Basics

### Table of Contents Structure

The `_toc.yml` file defines the book's structure:

```yaml
format: jb-book
root: README                # Landing page (README.md)
chapters:
  - file: intro             # Chapter 1: intro.md
  - file: methodology       # Chapter 2: methodology.md
    sections:
      - file: data          # Subsection: data.md
      - file: models        # Subsection: models.md
  - file: results           # Chapter 3: results.md
  - file: conclusion        # Chapter 4: conclusion.md
```

Key points:
- `root` is the landing page (must always be `README.md` in this template)
- Each `file` entry omits the `.md` or `.ipynb` extension
- Use `sections` to create subsections under a chapter
- Files appear in navigation in listed order

### MyST Markdown Directives

#### Admonitions (Callout Boxes)

```markdown
:::{note}
This is a note admonition.
:::

:::{warning}
This is a warning.
:::

:::{tip}
Helpful tip here.
:::

:::{important}
Important information.
:::
```

Available types: `note`, `warning`, `tip`, `important`, `attention`, `caution`, `danger`, `error`, `hint`, `seealso`

#### Code Blocks with Syntax Highlighting

````markdown
```python
def calculate_mean(data):
    return sum(data) / len(data)
```

```javascript
const greeting = "Hello, world!";
console.log(greeting);
```
````

Supports Python, JavaScript, Java, C++, R, SQL, Bash, YAML, JSON, and more.

#### Math Equations (LaTeX)

```markdown
Inline equation: $E = mc^2$

Block equation:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

#### Citations and References

1. **Define references in `references.bib`:**

   ```bibtex
   @article{smith2023,
     author = {Smith, John},
     title = {Machine Learning Fundamentals},
     journal = {Data Science Review},
     year = {2023}
   }
   ```

2. **Cite in content:**

   ```markdown
   Research shows {cite}`smith2023` that...
   ```

3. **Add bibliography section:**

   ```markdown
   ## References
   
   ```{bibliography}
   ```
   ```

#### Cross-References

```markdown
## Introduction {#intro}

As discussed in [the introduction](#intro)...
```

#### Figures and Images

```markdown
:::{figure} path/to/image.png
:name: fig-results
:alt: Results visualization
:width: 600px

Caption describing the figure.
:::

Reference the figure: {ref}`fig-results`
```

#### Tables

```markdown
| Model | Accuracy | Precision | Recall |
|-------|----------|-----------|--------|
| A     | 0.95     | 0.93      | 0.94   |
| B     | 0.92     | 0.90      | 0.91   |
```

#### Dropdown Sections

```markdown
:::{dropdown} Click to expand
Hidden content goes here.
:::
```

#### Tabs

````markdown
::::{tab-set}

:::{tab-item} Python
```python
print("Hello, Python!")
```
:::

:::{tab-item} JavaScript
```javascript
console.log("Hello, JavaScript!");
```
:::

::::
````

---

## Repository Structure

```text
.
├── _config.yml                # Main configuration file
├── _toc.yml                   # Table of contents structure
├── README.md                  # Landing page (auto-updated header)
├── logo.jpg                   # Project logo
├── references.bib             # Bibliography entries
├── book_requirements.txt      # Python dependencies for Jupyter Book
├── *.md                       # Additional Markdown pages
├── *.ipynb                    # Jupyter Notebook files
├── _static/                   # Custom CSS/JS files
│   ├── portfolio-sync.css     # Custom styling
│   └── portfolio-sync.js      # ScrollSpy + theme sync
├── _build/                    # Generated HTML (created by build)
│   └── html/
│       ├── index.html
│       ├── *.html
│       ├── _static/
│       └── _images/
├── scripts/                   # Automation scripts (excluded from build)
│   ├── update-header.py       # Updates README header
│   ├── send-metadata.py       # Sends metadata to portfolio
│   └── script_requirements.txt
└── .github/
    └── workflows/
        └── deploy.yml         # GitHub Actions workflow
```

**Key Files:**

- **`_config.yml`** - Book configuration and project metadata
- **`_toc.yml`** - Navigation structure
- **`README.md`** - Landing page (root in toc.yml)
- **`_static/`** - Custom CSS/JS (not excluded from build)
- **`scripts/`** - Helper scripts (excluded from build)
- **`.github/workflows/deploy.yml`** - Automated deployment pipeline

---

## Building Locally

### Initial Setup

```bash
# Install Python dependencies
pip install -r book_requirements.txt

# First build
jupyter-book build .
```

### Development with Live Reload

```bash
# Install sphinx-autobuild
pip install sphinx-autobuild

# Start live reload server
sphinx-autobuild . _build/html --open-browser

# Server runs at http://127.0.0.1:8000
# Changes auto-rebuild and refresh browser
```

**Live reload behavior:**

- Watches for changes to `.md`, `.ipynb`, `.yml`, `.css`, `.js` files
- Automatically rebuilds affected pages
- Refreshes browser automatically
- Preserves scroll position when possible

**Stopping the server:**

Press `Ctrl+C` in the terminal.

### Clean Build

```bash
# Remove old build files
jupyter-book clean .

# Rebuild from scratch
jupyter-book build .
```

### View Built Site

After building:

```bash
# Open in browser (macOS)
open _build/html/index.html

# Linux
xdg-open _build/html/index.html

# Windows
start _build/html/index.html
```

---

## GitHub Actions Deployment

The template includes a complete CI/CD pipeline in `.github/workflows/deploy.yml`.

### Workflow Triggers

Automatically runs on:

- Push to `main` branch
- Manual trigger via Actions tab

### Workflow Jobs

1. **Build** - Updates README, builds HTML, uploads artifact
2. **Deploy** - Publishes to GitHub Pages
3. **Notify** - Sends metadata to portfolio repository

### Enabling GitHub Pages

1. Go to repository Settings → Pages
2. Source: "GitHub Actions"
3. Save

First deployment creates the `gh-pages` environment and publishes the site.

### Viewing Deployment

- **Actions tab** - Monitor workflow progress
- **Environments** - View deployment history
- **Site URL** - `https://username.github.io/repository-name/`

See [GITHUB_ACTIONS.md](GITHUB_ACTIONS.md) for detailed workflow documentation.

---

## Portfolio Integration

The template automatically sends project metadata to a portfolio repository on each deployment.

### Setup Requirements

1. **Personal Access Token (PAT)**
   - Create at: Settings → Developer settings → Personal access tokens
   - Scope: `repo`
   - Add as repository secret: `PORTFOLIO_PAT`

2. **Portfolio Repository**
   - Add as repository variable: `PORTFOLIO_REPO` (format: `owner/repo`)
   - Create workflow in portfolio: `.github/workflows/update-projects.yml`

3. **Metadata Configuration**
   - All metadata in `_config.yml` (title, description, author, tags)
   - Automatically extracted and sent on deployment

See [PORTFOLIO_INTEGRATION.md](PORTFOLIO_INTEGRATION.md) for complete setup guide.

---

## Theme Synchronization

When embedded in an iframe, the book synchronizes its theme (light/dark mode) with the parent portfolio website.

### How It Works

- Portfolio controls theme via `postMessage` API
- Book receives message and applies theme
- Origin validation ensures security
- Theme preference stored in localStorage

### Implementation

The `_static/portfolio-sync.js` script:

- Listens for theme update messages
- Validates sender origin
- Applies theme to document
- Removes theme toggle buttons in iframe context

See [THEME_SYNC.md](THEME_SYNC.md) for technical details.

---

## Custom ScrollSpy

The template includes a custom ScrollSpy implementation for iframe contexts where Bootstrap's ScrollSpy fails.

### Features

- Uses IntersectionObserver API (browser-native)
- Works reliably in iframe embedding
- Responsive design with adaptive thresholds
- Hierarchical navigation support

### Technical Details

Implementation in `_static/portfolio-sync.js`:

- Observes all content sections
- Updates active TOC links based on viewport intersection
- Handles smooth scrolling with observer disabling
- Adapts to viewport size changes

See [SCROLLSPY_EXPLANATION.md](SCROLLSPY_EXPLANATION.md) for implementation details.

---

## Troubleshooting

### Build Errors

**Error: `_config.yml` not found**

- Ensure running command from project root
- Verify `_config.yml` exists

**Error: File not in `_toc.yml`**

- Add file to `_toc.yml` under `chapters:` or `sections:`
- File must be listed to appear in build

**Error: Invalid YAML syntax**

- Check indentation (use spaces, not tabs)
- Validate YAML at yamllint.com

### Deployment Issues

**GitHub Pages not publishing**

- Settings → Pages → Source: "GitHub Actions"
- Check workflow runs in Actions tab
- View job logs for errors

**404 on deployed site**

- Wait 2-3 minutes after first deployment
- Check deployment URL format: `https://username.github.io/repo/`
- Verify `index.html` exists in `_build/html/`

### Portfolio Integration

**Metadata not sending**

- Verify `PORTFOLIO_PAT` secret exists
- Verify `PORTFOLIO_REPO` variable exists
- Check workflow logs in Actions tab

**Portfolio workflow not triggering**

- Verify workflow exists: `.github/workflows/update-projects.yml`
- Check event type matches: `types: [project-updated]`
- Confirm Actions enabled in portfolio Settings

See individual documentation files for detailed troubleshooting.

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Contributing

Contributions welcome. Please open issues or pull requests for improvements.

---

## Contact

**Author:** Arham Naqvi

**Repository:** [github.com/Syed-A-Naqvi/sample_jupyter_book](https://github.com/Syed-A-Naqvi/sample_jupyter_book)
