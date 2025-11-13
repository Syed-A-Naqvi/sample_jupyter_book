# Jupyter Book Template for Data Science Projects

**A Jupyter Book template for data science projects with GitHub Pages deployment and automated portfolio integration/updating using GitHub Actions.**

*Author: Arham Naqvi*

*Last Updated: November 13th, 2025*

---

## 🎯 Overview

This repository serves as a **production-ready template** for creating professional data science project documentation using Jupyter Book with advanced automation and portfolio integration capabilities.

### Core Features

**📘 Jupyter Book Foundation**

- Pre-configured Jupyter Book structure with best practices
- Support for Markdown, Jupyter Notebooks, and MyST syntax
- Interactive code execution and rich visualizations
- Built-in search functionality and citation management

**🎨 Enhanced Visual Integration**

- Custom CSS and JavaScript for professional styling
- Portfolio-synchronized theme system (light/dark mode)
- Responsive design optimized for all devices
- Seamless iframe embedding for portfolio websites

**🤖 Complete Automation**

- Automated GitHub Pages deployment via GitHub Actions
- Automatic README header updates with current date
- Portfolio metadata synchronization via repository dispatch
- Zero manual deployment steps required

**🔗 Portfolio Integration**

- Real-time project updates in portfolio gallery
- Cross-origin theme synchronization
- Secure postMessage API communication
- Metadata automatically extracted from configuration

### Documentation Guide

This README provides a quick start guide and basic usage instructions. For detailed technical documentation on specific features, see:

**🚀 Getting Started**

- **[Quick Start](#-quick-start)** - Clone, configure, and deploy your first book (this page)
- **[Jupyter Book Basics](#-jupyter-book-basics)** - MyST syntax, citations, and formatting (this page)

**⚙️ System Architecture**

- **[GitHub Actions Workflow](GITHUB_ACTIONS.md)** - Complete CI/CD pipeline documentation
  - Build, deploy, and notify jobs explained
  - Secret configuration and troubleshooting
  - Performance optimization strategies

- **[Portfolio Integration](PORTFOLIO_INTEGRATION.md)** - Automated project synchronization
  - Repository dispatch API deep-dive
  - Portfolio setup requirements
  - End-to-end integration flow
  - Metadata structure and validation

**🎨 Advanced Features**

- **[Theme Synchronization](THEME_SYNC.md)** - Cross-iframe theme coordination
  - postMessage API implementation
  - Security and origin validation
  - Portfolio controller setup

- **[Custom ScrollSpy](SCROLLSPY_EXPLANATION.md)** - Table of contents navigation
  - Technical implementation details
  - Bootstrap ScrollSpy failure analysis
  - IntersectionObserver solution
  - Responsive design considerations

**📚 Additional Resources**

- **[Troubleshooting](#-troubleshooting)** - Common issues and solutions (this page)
- **[Repository Structure](#-repository-structure)** - Project organization (this page)
- **[Building Locally](#-building-locally-with-hot-reload-functionality)** - Development workflow (this page)

---

## 🚀 Quick Start

### 1. Clone This Template

```bash
# Clone this repository for your new project
git clone https://github.com/Syed-A-Naqvi/sample_jupyter_book.git your-project-name
cd your-project-name

# Remove the original remote and add your own
git remote remove origin
git remote add origin https://github.com/your-username/your-project-name.git
```

### 2. Customize Project Metadata

Edit `_config.yml` with your project information:

```yaml
title: "Your Project Title"
description: "Brief one-line description of your project"
author: "Your Name"
logo: "logo.jpg"  # Path MUST be relative to project root

project_metadata:
  tags: ["tag1", "tag2", "tag3", "Python", "Data Science"]
```

**Important:** All metadata (title, description, author, tags, logoURL) is managed in `_config.yml`. This data will be:

- Displayed in your Jupyter Book

- Automatically sent to your portfolio website on deployment

### 3. Replace Logo

Replace `logo.jpg` with your project logo (recommended size: 200x200px).

### 4. Customize Book Landing Page

The `README.md` is set as `root:` in the `toc.yml` file and serves as the book landing page. The *header* comprises all lines before the first `---` and is automatically updated by *github actions* using the current date and the `title`, `author` and `description` key values from the `_config.yml` file.

```markdown
# Your Project Title

**Brief description**

*Author: [Author Name]*  
*Last Updated: [d-m-y]*
```

### 5. Add Your Content

#### Jupyter Book Source Files

- Add Markdown files (`.md`) for documentation pages
- Add Jupyter Notebooks (`.ipynb`) for interactive analysis
- Update `_toc.yml` to organize your table of contents (see Jupyter Book Basics below)

#### Project Assets & Files

If you have a project with source code, figures, videos, or other assets that you want to reference in your Jupyter Book:

**Recommended Approach:**

1. **Create a dedicated directory** (e.g., `assets/` or `project/`) at the root of your Jupyter Book
2. **Organize your assets** within this directory:

   ```bash
   Jupyter-Book-Root/
   ├── assets/
   │   ├── figures/
   │   │   ├── figure1.png
   │   │   └── figure2.jpg
   │   ├── videos/
   │   │   └── demo.mp4
   │   ├── data/
   │   │   └── results.csv
   │   └── code/
   │       └── analysis.py
   ```

3. **Reference assets using relative paths** in your `.md` or `.ipynb` files:

   **In Markdown:**

   ```markdown
   ![Figure 1](assets/figures/figure1.png)
   
   <video width="640" height="480" controls>
     <source src="assets/videos/demo.mp4" type="video/mp4">
   </video>
   
   [Download Results](assets/data/results.csv)
   ```

   **In Jupyter Notebooks:**

   ```python
   from IPython.display import Image, Video
   Image('assets/figures/figure1.png')
   Video('assets/videos/demo.mp4')
   ```

4. **DO NOT add the assets directory to `exclude_patterns`** in `_config.yml`
   - Jupyter Book will copy the entire directory to `_build/html/` during the build
   - Your relative paths will work correctly in the deployed site
   - Only exclude directories you don't want in the final build (e.g., `scripts/`, raw data processing code)

**What to Exclude:**

```yaml
# In _config.yml
exclude_patterns: 
  - "scripts/*"           # Automation scripts not for display
  - "raw_data/*"          # Unprocessed data files
  - ".github/*"           # GitHub workflows
  - "venv/*"              # Virtual environment
```

**What NOT to Exclude:**

- Asset directories (`assets/`, `project/`, `figures/`, etc.)

- Any files you want to reference or display in your book

- Static files like `_static/` (needed for custom CSS/JS)

---

## 📖 Jupyter Book Basics

### Table of Contents Structure (`_toc.yml`)

The `_toc.yml` file defines your book's structure with chapters and sections:

```yaml
format: jb-book
root: overview              # Landing page (overview.md)
chapters:
  - file: intro             # Chapter 1: intro.md
  - file: methodology       # Chapter 2: methodology.md
    sections:               # Subsections under methodology
      - file: data-collection
      - file: preprocessing
  - file: analysis          # Chapter 3: analysis.ipynb
    sections:
      - file: exploratory
      - file: modeling
  - file: results           # Chapter 4: results.md
  - file: conclusion        # Chapter 5: conclusion.md
```

**Key Points:**

- `root` is your landing page (usually `overview.md` or `intro.md`)

- Each `file` entry omits the `.md` or `.ipynb` extension

- Use `sections` to create subsections under a chapter

- Files are listed in the order they appear in the navigation

### MyST Markdown Directives

#### Admonitions (Callout Boxes)

```markdown
:::{note}
This is a note admonition.
:::

:::{warning}
This is a warning!
:::

:::{tip}
Helpful tip here.
:::

:::{important}
Important information.
:::
```

:::{note}
This is a note admonition.
:::

:::{warning}
This is a warning!
:::

:::{tip}
Helpful tip here.
:::

:::{important}
Important information.
:::

**Available types:** `note`, `warning`, `tip`, `important`, `attention`, `caution`, `danger`, `error`, `hint`, `seealso`

#### Dropdown Sections

```markdown
:::{dropdown} Click to expand
Hidden content goes here.
:::
```

:::{dropdown} Click to expand
Hidden content goes here.
:::

#### Tabbed Content

````markdown
::::{tab-set}
:::{tab-item} Python

```python
print("Hello from Python")
```

:::

:::{tab-item} R

```r
print("Hello from R")
```

:::
::::
````

::::{tab-set}
:::{tab-item} Python

```python
print("Hello from Python")
```

:::

:::{tab-item} R

```r
print("Hello from R")
```

:::
::::

#### Figures with Captions

```markdown
:::{figure} assets/figures/plot.png
:name: fig-plot
:width: 80%

This is the figure caption. You can reference this as {numref}`fig-plot`.
:::
```

:::{figure} modelfit_animation.gif
:name: fig-plot
:width: 80%

This is the figure caption. You can reference this as {numref}`fig-plot`.
:::

#### Math Equations

**Inline math:** `$E = mc^2$` $\rightarrow E = mc^2$

**Block math:**

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

#### Code Blocks with Options

````markdown
```{code-block} python
:linenos:
:emphasize-lines: 2,3
:caption: Example code

import pandas as pd
df = pd.read_csv('data.csv')
print(df.head())
```
````

```{code-block} python
:linenos:
:emphasize-lines: 2,3
:caption: Example code

import pandas as pd
df = pd.read_csv('data.csv')
print(df.head())
```

#### Cross-References

To create a reference target:

```markdown
(section-label)=
##### My Section Title
```

(section-label)=
##### My Section Title

To refer to targets:

```markdown
See {ref}`section-label` for more details.

Check out {numref}`fig-plot` and {numref}`table-results`.
```

See {ref}`section-label` for more details.

Check out {numref}`fig-plot` and {numref}`table-results`.

### Citations & Bibliography

#### Setup `references.bib`

Create or edit `references.bib` in your project root:

```bibtex

@inproceedings{holdgraf_evidence_2014,
  address = {Brisbane, Australia, Australia},
  title = {Evidence for {Predictive} {Coding} in {Human} {Auditory} {Cortex}},
  booktitle = {International {Conference} on {Cognitive} {Neuroscience}},
  publisher = {Frontiers in Neuroscience},
  author = {Holdgraf, Christopher Ramsay and de Heer, Wendy and Pasley, Brian N. and Knight, Robert T.},
  year = {2014}
}

@article{holdgraf_rapid_2016,
  title = {Rapid tuning shifts in human auditory cortex enhance speech intelligibility},
  volume = {7},
  issn = {2041-1723},
  url = {http://www.nature.com/doifinder/10.1038/ncomms13654},
  doi = {10.1038/ncomms13654},
  number = {May},
  journal = {Nature Communications},
  author = {Holdgraf, Christopher Ramsay and de Heer, Wendy and Pasley, Brian N. and Rieger, Jochem W. and Crone, Nathan  and Lin, Jack J. and Knight, Robert T. and Theunissen, Frédéric E.},
  year = {2016},
  pages = {13654},
  file = {Holdgraf et al. - 2016 - Rapid tuning shifts in human auditory cortex enhance speech intelligibility.pdf:C\:\\Users\\chold\\Zotero\\storage\\MDQP3JWE\\Holdgraf et al. - 2016 - Rapid tuning shifts in human auditory cortex enhance speech intelligibility.pdf:application/pdf}
}

@book{ruby,
  title     = {The Ruby Programming Language},
  author    = {Flanagan, David and Matsumoto, Yukihiro},
  year      = {2008},
  publisher = {O'Reilly Media}
}
```

#### Configure in `_config.yml`

```yaml
bibtex_bibfiles:
  - references.bib
```

#### Generate Bibliography

Add a bibliography section at the end of your document (**required for proper citation resolution**):

````markdown
## References

```{bibliography}
```

````

**Filter by citation:**

````markdown

```{bibliography}
:filter: cited
```

````

#### Cite in Your Content

**Single citation:**

```markdown
According to book {cite}`ruby`, there is a programming language called `ruby`.
```

According to book {cite}`ruby`, there is a programming language called `ruby`.

**Multiple citations:**

```markdown
Multiple studies {cite}`holdgraf_rapid_2016,holdgraf_evidence_2014` support this claim.
```

Multiple studies {cite}`holdgraf_rapid_2016,holdgraf_evidence_2014` support this claim.

**Narrative citation:**

```markdown
{cite:t}`holdgraf_rapid_2016` found that...
```

{cite:t}`holdgraf_rapid_2016` found that...

### Jupyter Notebook Integration

#### Cell Tags for Control

Add tags to notebook cells to control execution and display:

- `remove-input` - Hide code, show output
- `remove-output` - Show code, hide output  
- `remove-cell` - Hide entire cell
- `hide-input` - Collapsible code cell
- `hide-output` - Collapsible output

In Jupyter: View → Cell Toolbar → Tags

#### Execute Notebooks on Build

Configure in `_config.yml`:

```yaml
execute:
  execute_notebooks: auto    # auto, force, cache, or off
  timeout: 100               # Max seconds per cell
  exclude_patterns:
    - 'notebooks/draft/*'    # Don't execute these
```

**Options:**

- `auto` - Execute notebooks without outputs

- `cache` - Use cached outputs, execute if missing

- `off` - Never execute (use saved outputs)

- `force` - Always re-execute

#### Notebook Metadata

Add cell metadata for MyST features:

```json
{
  "tags": ["hide-input"],
  "mystnb": {
    "image": {
      "width": "80%",
      "align": "center"
    }
  }
}
```

### Useful Resources

- **[Official Jupyter Book Documentation](https://jupyterbook.org/)** - Comprehensive guide

- **[MyST Markdown Guide](https://myst-parser.readthedocs.io/)** - MyST syntax reference

- **[Sphinx Design](https://sphinx-design.readthedocs.io/)** - Advanced components (cards, grids, tabs)

- **[MyST-NB](https://myst-nb.readthedocs.io/)** - Notebook-specific features

---

## 📁 Repository Structure

```bash
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

This template is designed to work seamlessly when embedded in an iframe on your portfolio website. The custom JavaScript (`_static/portfolio-sync.js`) provides several iframe-specific enhancements that create a cohesive user experience across your portfolio.

#### Theme Synchronization

Portfolio websites can control the book's theme in real-time using the postMessage API:

**From Portfolio:**

```javascript
iframe.contentWindow.postMessage(
  { type: "update-theme", theme: "dark" },
  "https://username.github.io"
);
```

**Book Response:**

- Validates message origin against trusted whitelist
- Applies theme to book instantly
- Persists preference to localStorage
- Supports both light and dark modes

**Security Features:**

- Origin validation prevents unauthorized theme control
- Only pre-configured trusted origins accepted
- Invalid messages silently ignored

**For complete theme sync documentation:** See [Theme Synchronization](THEME_SYNC.md) including:

- postMessage API implementation details
- Security and origin validation
- Portfolio controller script examples
- Bidirectional communication patterns
- Browser compatibility information

#### Custom ScrollSpy Implementation

Bootstrap's native ScrollSpy fails in iframe contexts due to scroll event propagation issues. This template includes a custom IntersectionObserver-based ScrollSpy that:

**Features:**

- ✅ **Works reliably** in both standalone and iframe contexts
- ✅ **Monitors section visibility** using IntersectionObserver API
- ✅ **Maintains hierarchical states** (parent sections active when child is active)
- ✅ **Provides smooth scrolling** when clicking TOC links
- ✅ **Adapts to viewport size** with responsive rootMargin calculations
- ✅ **O(1) per-scroll performance** regardless of document size

**Technical Highlights:**

- IntersectionObserver-based visibility detection (not scroll events)
- Responsive rootMargin that adapts to mobile, tablet, and desktop
- Debounced resize handling for live responsive testing
- Automatic observer disable/enable during programmatic scrolling

**For complete ScrollSpy documentation:** See [Custom ScrollSpy Implementation](SCROLLSPY_EXPLANATION.md) including:

- Bootstrap ScrollSpy failure analysis
- IntersectionObserver solution architecture  
- Time complexity analysis (O(n) initialization, O(1) per-scroll)
- Responsive rootMargin calculations
- Production deployment considerations
- Browser compatibility and performance metrics

#### UI Cleanup

When loaded in an iframe, the script automatically:

- **Removes theme toggle buttons** (theme controlled by parent)
- **Removes fullscreen buttons** (not relevant in iframe context)
- **Prevents horizontal scrolling** for better iframe display
- **Applies iframe-specific CSS** for optimal embedding

**Context Detection:**

```javascript
const isIframe = window.self !== window.top;
if (isIframe) {
    // Enable iframe-specific features
    // Remove unnecessary UI elements
    // Initialize custom ScrollSpy
}
```

All iframe integration code is self-contained in `_static/portfolio-sync.js` for easy maintenance and updates.

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

**Detailed setup instructions:** See [Portfolio Integration](PORTFOLIO_INTEGRATION.md#configuration-setup-book-repository) for step-by-step token generation and configuration.

**Note:** If you don't have a portfolio to integrate with, the deployment will still work but the metadata notification step will fail (this is expected and won't prevent deployment).

### Automated Deployment Pipeline

The repository includes a comprehensive GitHub Actions workflow that automates the entire deployment process:

**Pipeline Stages:**

1. **📝 Update Documentation** - README header updated with current date and metadata
2. **💾 Commit Changes** - Changes committed back to repository (with `[skip ci]` to prevent loops)
3. **🔨 Build Book** - Jupyter Book generates static HTML
4. **🚀 Deploy Pages** - Book published to GitHub Pages
5. **📤 Notify Portfolio** - Metadata sent to portfolio via repository dispatch

**For complete workflow documentation:** See [GitHub Actions Workflow](GITHUB_ACTIONS.md) including:

- Detailed job breakdown and dependencies
- Secret configuration and security best practices  
- Troubleshooting workflow failures
- Performance optimization strategies
- Advanced customization options

### Workflow Trigger

The workflow runs automatically on every push to the `main` branch:

```yaml
on:
  push:
    branches:
      - main
```

**Time to deployment:** Typically 3-6 minutes from push to live website.

---

## 🔗 Portfolio Integration

This template includes a sophisticated portfolio integration system that automatically updates your portfolio website whenever you deploy a project. The system uses GitHub's Repository Dispatch API for secure cross-repository communication.

### How It Works

After the book is deployed to GitHub Pages, the workflow executes `scripts/send-metadata.py` to send project metadata to your portfolio repository:

**Communication Flow:**

```
Jupyter Book Repo → GitHub API → Portfolio Repo
     (deploy)       (dispatch)     (workflow trigger)
```

1. **Book deploys** to GitHub Pages
2. **Metadata extracted** from `_config.yml`
3. **Repository dispatch** sent to portfolio repo
4. **Portfolio workflow** triggered automatically
5. **Gallery updated** with new/updated project
6. **Portfolio redeploys** with changes

**For complete integration documentation:** See [Portfolio Integration](PORTFOLIO_INTEGRATION.md) including:

- Repository dispatch API deep-dive
- Portfolio workflow setup requirements
- Metadata structure and validation
- Security best practices
- End-to-end integration flow
- Troubleshooting guide

### Metadata Sent

The following data is extracted from `_config.yml` and sent to your portfolio:

```json
{
  "title": "Your Book Title",
  "description": "Brief book description/caption/subtitle",
  "author": "Your Name",
  "tags": ["tag1", "tag2", "tag3"],
  "url": "https://your-username.github.io/your-project-name",
  "logo_path": "https://your-username.github.io/your-project-name/_static/logo.png",
  "updated": "2025-11-13"
}
```

**Important Fields:**

- `logo_path`: Full URL to the logo image at the deployed site
- `url`: The live GitHub Pages URL for the deployed book
- `updated`: Current date in YYYY-MM-DD format (auto-generated on deployment)

### Portfolio Requirements

Your portfolio repository must:

1. ✅ Have a GitHub Actions workflow listening for `repository_dispatch` events
2. ✅ Process `project-updated` event type
3. ✅ Update gallery data (JSON, YAML, or database)
4. ✅ Rebuild and redeploy portfolio with updated projects

**Example portfolio workflow snippet:**

```yaml
on:
  repository_dispatch:
    types:
      - project-updated

jobs:
  update-gallery:
    runs-on: ubuntu-latest
    steps:
      - name: Extract metadata
        run: |
          echo "Title: ${{ github.event.client_payload.title }}"
          echo "URL: ${{ github.event.client_payload.url }}"
      # ... update gallery data and redeploy ...
```

**Complete portfolio setup guide:** See [Portfolio Integration > Portfolio Repository Setup](PORTFOLIO_INTEGRATION.md#portfolio-repository-setup)

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
