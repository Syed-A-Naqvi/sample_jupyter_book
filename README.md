# Jupyter Book Portfolio Project Template

A professional, automated Jupyter Book template for creating data science projects with seamless GitHub Pages deployment and automated portfolio integration.

---

## 🎯 Overview

This repository serves as a **template** for creating professional data science project documentation using Jupyter Book. Clone this repository to quickly set up new projects with:

- ✅ Pre-configured Jupyter Book structure
- ✅ Modified styling and functionality via custom css and js
- ✅ Automated GitHub Pages deployment
- ✅ Automatic metadata synchronization with portfolio website
- ✅ Date auto-update on deployment

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

Edit `overview.md` (the `root:` file in `toc.yml`) as required using the `title`, `author` and `description` key values from the `_config.yml` file in the header portion.

**NOTE:** The line `*Last Updated: [Auto-updated by GitHub Actions]*` should **NOT BE MODIFIED** and should appear somewhere in the header for auto-dating functionality.

```markdown
# Your Project Title

**Brief description**

*Author Name*  
*Last Updated: [Auto-updated by GitHub Actions]*
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
   ```
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
	author = {Holdgraf, Christopher Ramsay and de Heer, Wendy and Pasley, Brian N. and Rieger, Jochem W. and Crone, Nathan and Lin, Jack J. and Knight, Robert T. and Theunissen, Frédéric E.},
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

```
jupyter-book-root/
├── overview.md                 # Main landing page (edit this)
├── _config.yml                 # Project metadata (edit this)
├── _toc.yml                    # Table of contents structure
├── logo.jpg                    # Project logo (replace this)
├── requirements.txt            # Python dependencies (optional)
├── *.md                        # Additional markdown pages
├── *.ipynb                     # Jupyter notebooks
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

### Auto Theme Toggle via POST Request

When the book is displayed through an `iframe` nested within another trusted webpage, the parent website can send `POST` requests to the `iframe` and toggle dark/light themes for the book.

All relevant `js` is in the file `portfolio-sync.js`.

---

## 🔧 Building Locally with Hot-Reload Functionality

### Prerequisites

```bash
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Update pip
python -m pip install --upgrade pip

# Install dependencies
pip install jupyter-book
pip install sphinx
# If you have additional dependencies:
# pip install -r requirements.txt
```

### Build Commands

Execute commands in jupyter-book root directory:

```bash
# Clean previous builds (if needed)
jupyter-book clean . --all

# Build the book
jupyter-book build .

# Generate sphinx config
jupyter-book config sphinx .

# View the book live in browser at port 127.0.0.1:8000
sphinx-autobuild . _build/html --open-browser
```

---

## 🚢 Deployment Workflow

### Automated GitHub Pages Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically:

1. **Updates Date** - Updates the "Last Updated" date in `overview.md` to the current date
2. **Builds HTML** - Runs `jupyter-book build .` to generate static HTML
3. **Deploys to GitHub Pages** - Publishes the book to `https://your-username.github.io/your-project-name`
4. **Notifies Portfolio** - Sends project metadata to your portfolio repository via repository dispatch

### Workflow Trigger

The workflow runs automatically on every push to the `main` branch:

```yaml
on:
  push:
    branches:
      - main
```

### Setup GitHub Pages

1. Go to your repository **Settings** → **Pages**
2. Under "Source", select **GitHub Actions**
3. The workflow will automatically deploy on the next push

---

## 🔗 Portfolio Integration

### How It Works

When your Jupyter Book deploys, the `send_metadata.py` script automatically sends project information to your portfolio website repository using GitHub's **repository dispatch** feature.

### Metadata Sent

The following data from `_config.yml` is sent to your portfolio:

```json
{
  "title": "Your Book Title",
  "description": "Brief book description/caption/subtitle",
  "author": "Your Name",
  "tags": ["tag1", "tag2", "tag3"],
  "url": "https://your-username.github.io/your-project-name",
  "logo_path": "full URL to logo image file at the hosted github pages site",
  "date": "current data (YYYY-MM-DD)"
}
```

### Portfolio Setup (To Be Implemented)

Your portfolio repository should:

1. Listen for the `project-updated` repository dispatch event
2. Extract the metadata payload
3. Update the portfolio project gallery
4. Regenerate the portfolio website

**Note:** The portfolio listener implementation is currently in development. The dispatch mechanism will use GitHub's repository dispatch API to trigger updates.

---

## 🐛 Troubleshooting

### Build Errors

**Issue:** `jupyter-book` command not found

```bash
# Ensure virtual environment is activated
source venv/bin/activate
pip install jupyter-book
```

**Issue:** YAML syntax errors in `_config.yml`

- Check indentation (use spaces, not tabs)
- Validate YAML syntax online: https://www.yamllint.com/

### Deployment Issues

**Issue:** GitHub Pages not updating

1. Check Actions tab for workflow errors
2. Ensure GitHub Pages is configured to use **GitHub Actions**
3. Check repository permissions: Settings → Actions → General → Workflow permissions

**Issue:** Styling not applied

- Ensure `_static/portfolio-sync.css` is referenced in `_config.yml`
- Clear browser cache
- Rebuild with `jupyter-book clean . && jupyter-book build .`

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

**Happy documenting! 🚀📊**

## References

```{bibliography}
```
