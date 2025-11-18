# GitHub Actions CI/CD Workflow

*Automated deployment pipeline for Jupyter Book projects with portfolio integration*

---

## Overview

The template includes a GitHub Actions workflow that automates deployment from code commit to portfolio notification. The workflow consists of three sequential jobs.

**Workflow File**: `.github/workflows/deploy.yml`

**Trigger**: Push to `main` branch

---

## Workflow Architecture

### Job Pipeline

```text
┌──────────┐
│  BUILD   │ ← Update README, build HTML
└────┬─────┘
     ↓
┌──────────┐
│  DEPLOY  │ ← Publish to GitHub Pages
└────┬─────┘
     ↓
┌──────────┐
│  NOTIFY  │ ← Send metadata to portfolio
└──────────┘
```

**Dependencies:**
- `deploy` waits for `build`
- `notify-portfolio` waits for `deploy`

---

## Job 1: Build

**Purpose**: Update documentation metadata and generate static HTML

**Runner**: `ubuntu-latest`

**Permissions**: `contents: write` (for README commits)

### Steps

#### 1. Checkout Repository

```yaml
- name: Checkout repository
  uses: actions/checkout@v5
```

Downloads repository code to runner.

#### 2. Set Up Python

```yaml
- name: Set up Python
  uses: actions/setup-python@v6
  with:
    python-version: '3.11'
```

Installs Python 3.11 on runner.

#### 3. Install Dependencies

```yaml
- name: Install dependencies
  run: |
    python -m pip install --upgrade pip
    pip install -r book_requirements.txt
    pip install -r scripts/script_requirements.txt
```

Installs Jupyter Book and script dependencies.

#### 4. Update README Header

```yaml
- name: Update README.md header
  run: python scripts/update-header.py
```

Executes `update-header.py` which:

1. Reads metadata from `_config.yml` (title, description, author)
2. Generates current date in readable format
3. Identifies README header (lines before first `---`)
4. Replaces header with updated metadata and date

**Example transformation:**

Before:
```markdown
# Old Title
*Author: Old Name*
*Last Updated: October 1st, 2025*
---
```

After:
```markdown
# New Title
*Author: New Name*
*Last Updated: November 13th, 2025*
---
```

#### 5. Commit Header Update

```yaml
- name: Commit header update
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git add .
    git diff --quiet && git diff --staged --quiet || \
      git commit -m "Update README header [skip ci]"
    git push
```

Commits README changes back to repository. The `[skip ci]` tag prevents infinite workflow loops.

#### 6. Build the Book

```yaml
- name: Build the book
  run: jupyter-book build .
```

Executes Jupyter Book build:

- Reads `_config.yml` and `_toc.yml`
- Processes Markdown and Notebook files
- Generates static HTML in `_build/html/`
- Copies static assets (CSS, JS, images)
- Creates search index and navigation

#### 7. Setup Pages & Upload Artifact

```yaml
- name: Setup Pages
  id: pages
  uses: actions/configure-pages@v5

- name: Upload artifact
  uses: actions/upload-pages-artifact@v4
  with:
    path: "_build/html"
```

Configures GitHub Pages and packages HTML for deployment.

---

## Job 2: Deploy

**Purpose**: Publish generated HTML to GitHub Pages

**Runner**: `ubuntu-latest`

**Dependencies**: `needs: build`

**Permissions**:
- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - OIDC authentication

**Environment**: `github-pages`

### Steps

#### Deploy to GitHub Pages

```yaml
- name: Deploy to GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v4
```

Downloads artifact from build job and deploys to GitHub Pages CDN. Generates deployment URL output.

#### Outputs Declaration

```yaml
outputs:
  page_url: ${{ steps.deployment.outputs.page_url }}
```

Makes deployment URL available to subsequent jobs (needed for portfolio notification).

---

## Job 3: Notify Portfolio

**Purpose**: Send project metadata to portfolio repository

**Runner**: `ubuntu-latest`

**Dependencies**: `needs: deploy`

### Steps

#### 1. Checkout, Setup Python, Install Dependencies

```yaml
- name: Checkout repository
  uses: actions/checkout@v4

- name: Set up Python
  uses: actions/setup-python@v6
  with:
    python-version: '3.11'

- name: Install dependencies
  run: |
    python -m pip install --upgrade pip
    pip install -r scripts/script_requirements.txt
```

Prepares environment for metadata script.

#### 2. Send Metadata to Portfolio

```yaml
- name: Send metadata to portfolio
  env:
    PORTFOLIO_REPO: ${{ vars.PORTFOLIO_REPO }}
    PORTFOLIO_PAT: ${{ secrets.PORTFOLIO_PAT }}
  run: |
    python scripts/send-metadata.py ${{ needs.deploy.outputs.page_url }}
```

Executes `send-metadata.py` with deployment URL. Script:

1. Loads `_config.yml`
2. Extracts metadata (title, description, author, tags, logo)
3. Constructs full URLs for book and logo
4. Sends POST request to GitHub API:
   ```text
   POST /repos/{PORTFOLIO_REPO}/dispatches
   ```
5. Includes metadata in request payload

**Environment variables:**

- `PORTFOLIO_REPO` - Target repository (format: `owner/repo`)
- `PORTFOLIO_PAT` - Personal Access Token for authentication

**API Request:**

```http
POST /repos/owner/portfolio/dispatches
Authorization: Bearer {PORTFOLIO_PAT}
Content-Type: application/json

{
  "event_type": "project-updated",
  "client_payload": {
    "title": "Project Title",
    "description": "Description",
    "author": "Author Name",
    "tags": ["tag1", "tag2"],
    "url": "https://user.github.io/repo/",
    "logo_path": "https://user.github.io/repo/_static/logo.png",
    "updated": "2025-11-13"
  }
}
```

**Response:**
- `204 No Content` - Success, portfolio workflow triggered
- `401 Unauthorized` - Invalid PAT
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Repository doesn't exist

---

## Workflow Configuration

### Repository Secrets

Required secrets in repository Settings → Secrets and variables → Actions:

| Secret | Description | Format |
|--------|-------------|--------|
| `PORTFOLIO_PAT` | GitHub Personal Access Token | `ghp_xxxxxxxxxxxxxxxxxxxx` |

**Creating PAT:**

1. Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Copy token and add as repository secret

### Repository Variables

Required variables in Settings → Secrets and variables → Actions:

| Variable | Description | Format |
|----------|-------------|--------|
| `PORTFOLIO_REPO` | Portfolio repository identifier | `owner/repository-name` |

**Example:** `jane-smith/portfolio` (not `https://github.com/jane-smith/portfolio`)

### GitHub Pages Settings

Enable GitHub Pages:

1. Repository Settings → Pages
2. Source: "GitHub Actions"
3. Save

First successful workflow run will create deployment.

---

## Workflow Execution Timeline

Typical execution timeline:

```text
Time    Action
─────────────────────────────────────
0:00    Workflow triggered (push to main)
0:05    Build job starts
0:10    README header updated
0:15    README committed
0:20    Jupyter Book build starts
2:00    Build complete
2:05    Artifact uploaded
2:10    Deploy job starts
2:15    Deployment to GitHub Pages
3:00    Deployment complete
3:05    Notify job starts
3:10    Metadata sent to portfolio
3:15    Portfolio workflow triggered
3:20    Workflow complete
```

**Total time:** 3-4 minutes for typical projects.

---

## Monitoring and Debugging

### Viewing Workflow Runs

1. Repository → Actions tab
2. Click workflow run to view details
3. Click job name to view logs
4. Expand steps to see detailed output

### Common Issues

**Build fails: "File not found"**

- Ensure file is listed in `_toc.yml`
- Check file path is correct
- Verify file exists in repository

**Deployment fails: "Pages not enabled"**

- Settings → Pages → Source: "GitHub Actions"
- Wait 2-3 minutes after enabling
- Re-run workflow

**Notify fails: "PORTFOLIO_PAT not set"**

- Verify secret exists in Settings → Secrets and variables → Actions
- Check secret name is exactly `PORTFOLIO_PAT`
- Ensure PAT has `repo` scope

**Notify succeeds but portfolio doesn't update**

- Check portfolio workflow exists: `.github/workflows/update-projects.yml`
- Verify event type matches: `types: [project-updated]`
- Check portfolio Actions tab for triggered workflow
- Review portfolio workflow logs for errors

---

## Customization

### Trigger on Multiple Branches

```yaml
on:
  push:
    branches:
      - main
      - develop
```

### Add Manual Trigger

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:  # Enables manual trigger
```

### Conditional Portfolio Notification

```yaml
- name: Send metadata to portfolio
  if: github.ref == 'refs/heads/main'
  env:
    PORTFOLIO_REPO: ${{ vars.PORTFOLIO_REPO }}
    PORTFOLIO_PAT: ${{ secrets.PORTFOLIO_PAT }}
  run: python scripts/send-metadata.py ${{ needs.deploy.outputs.page_url }}
```

### Custom Build Command

```yaml
- name: Build the book
  run: |
    jupyter-book build .
    # Add custom post-processing
    python scripts/post-process.py _build/html
```

---

## Security Considerations

### Secrets Management

- Never commit secrets to repository
- Rotate PATs regularly (every 90 days recommended)
- Use minimum required scope (`repo` for dispatch)
- Monitor secret usage in GitHub settings

### Workflow Permissions

The workflow uses principle of least privilege:

- Build job: `contents: write` (only for README commit)
- Deploy job: `pages: write`, `id-token: write` (only for deployment)
- Notify job: No special permissions (uses provided secrets)

### Preventing Infinite Loops

The `[skip ci]` tag in README commit messages prevents the workflow from triggering itself:

```yaml
git commit -m "Update README header [skip ci]"
```

Without this, the commit would trigger the workflow again, creating an infinite loop.

---

## Summary

The GitHub Actions workflow provides:

✅ **Automated deployment** - Push to main triggers full pipeline  
✅ **Metadata updates** - README header always current  
✅ **Static site generation** - Professional HTML output  
✅ **Portfolio integration** - Automatic project synchronization  
✅ **Fast execution** - 3-4 minutes typical runtime  
✅ **Reliable** - Proven GitHub infrastructure  

The three-job architecture ensures proper sequencing while maintaining separation of concerns.
