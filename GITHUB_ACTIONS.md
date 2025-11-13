# GitHub Actions CI/CD Workflow

*Automated deployment pipeline for Jupyter Book projects with portfolio integration*

---

## Overview

This Jupyter Book template includes a sophisticated GitHub Actions workflow that automates the entire deployment process from code commit to portfolio notification. The workflow consists of three sequential jobs that handle documentation updates, HTML generation, GitHub Pages deployment, and portfolio synchronization.

**Workflow File**: `.github/workflows/deploy.yml`

**Trigger**: Automatic execution on every push to the `main` branch

---

## Workflow Architecture

### Job Pipeline

The workflow consists of three jobs that execute in sequence:

```
┌─────────────┐
│    BUILD    │ ← Updates README, builds HTML
└──────┬──────┘
       ↓
┌─────────────┐
│   DEPLOY    │ ← Publishes to GitHub Pages
└──────┬──────┘
       ↓
┌─────────────┐
│   NOTIFY    │ ← Sends metadata to portfolio
└─────────────┘
```

**Job Dependencies:**

- `deploy` depends on `build` (waits for HTML generation)
- `notify-portfolio` depends on `deploy` (needs deployment URL)

---

## Job 1: Build

**Purpose**: Update documentation metadata and generate static HTML files

**Runner**: `ubuntu-latest`

**Permissions Required:**

- `contents: write` - Needed to commit README header updates back to repository

### Steps Breakdown

#### 1. Checkout Repository

```yaml
- name: Checkout repository
  uses: actions/checkout@v5
```

- Downloads the repository code to the runner
- Uses version 5 of the official GitHub checkout action
- Provides full git history for commit operations

#### 2. Set Up Python Environment

```yaml
- name: Set up Python
  uses: actions/setup-python@v6
  with:
    python-version: '3.11'
```

- Installs Python 3.11 on the runner
- Python 3.11 is chosen for stability and compatibility with `jupyter-book<2.0`
- Makes `python` and `pip` commands available

#### 3. Install Dependencies

```yaml
- name: Install dependencies
  run: |
    python -m pip install --upgrade pip
    pip install -r book_requirements.txt
    pip install -r scripts/script_requirements.txt
```

**Two requirement files:**

- `book_requirements.txt` - Jupyter Book and documentation dependencies
- `scripts/script_requirements.txt` - Dependencies for automation scripts (PyYAML, requests)

**Why separate files?**

- Local development only needs `book_requirements.txt`
- GitHub Actions needs both for automation

#### 4. Update README Header

```yaml
- name: Update README.md header
  run: |
    python scripts/update-header.py
```

**What this does:**

Executes the `update-header.py` script which:

1. Reads project metadata from `_config.yml`:
   - `title` - Project title
   - `description` - Project description
   - `author` - Author name
2. Generates current date in human-readable format (e.g., "November 13th, 2025")
3. Identifies the README header (all lines before first `---`)
4. Replaces the header with updated metadata and current date

**Example transformation:**

**Before:**

```markdown
# Old Project Title

**Old description**

*Author: Old Name*
*Last Updated: October 1st, 2025*

---

## Content starts here...
```

**After:**

```markdown
# Your Project Title

**A Jupyter Book template for data science projects**

*Author: Arham Naqvi*
*Last Updated: November 13th, 2025*

---

## Content starts here...
```

**Why this matters:**

- Ensures README always shows current deployment date
- Maintains single source of truth for metadata (`_config.yml`)
- Eliminates manual date/metadata updates

#### 5. Commit Header Update

```yaml
- name: Commit header update
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git add .
    git diff --quiet && git diff --staged --quiet || git commit -m "Auto-update: README header [skip ci]"
    git push
```

**Line-by-line explanation:**

1. **Configure git identity**: Sets the committer as the GitHub Actions bot
2. **Stage all changes**: `git add .` stages the modified README.md
3. **Conditional commit**: Only commits if there are actual changes
   - `git diff --quiet` - Returns 0 if no unstaged changes
   - `git diff --staged --quiet` - Returns 0 if no staged changes
   - `||` - If either command returns non-zero (changes exist), execute commit
4. **Commit message includes `[skip ci]`**: **Critical** - prevents recursive workflow triggers
5. **Push changes**: Sends commit back to repository

**Why `[skip ci]` is essential:**

Without it, the workflow would trigger itself infinitely:

```
1. User pushes code → Workflow runs
2. Workflow updates README → Commits change
3. Commit triggers workflow → Workflow runs again
4. Workflow updates README → Commits change
5. [INFINITE LOOP]
```

The `[skip ci]` tag tells GitHub Actions to ignore this commit as a workflow trigger.

#### 6. Build the Book

```yaml
- name: Build the book
  run: |
    jupyter-book build .
```

**What this does:**

- Executes `jupyter-book build` command in the repository root
- Reads `_config.yml` and `_toc.yml` for configuration
- Processes all Markdown and Notebook files listed in `_toc.yml`
- Generates static HTML files in `_build/html/` directory
- Copies static assets (CSS, JS, images) to `_build/html/_static/`
- Creates search index and navigation structure

**Build Output Structure:**

```
_build/html/
├── index.html              ← Landing page from README.md
├── *.html                  ← One HTML file per chapter/section
├── _static/                ← CSS, JS, images
│   ├── portfolio-sync.css  ← Custom styling
│   └── portfolio-sync.js   ← Custom ScrollSpy + theme sync
├── _images/                ← Book images
└── search.html             ← Built-in search functionality
```

#### 7. Setup Pages

```yaml
- name: Setup Pages
  id: pages
  uses: actions/configure-pages@v5
```

- Configures the runner for GitHub Pages deployment
- Sets necessary environment variables
- Prepares the Pages deployment context

#### 8. Upload Artifact

```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v4
  with:
    path: _build/html
```

**What this does:**

- Packages the `_build/html/` directory as a deployment artifact
- Compresses the files for efficient transfer
- Stores the artifact temporarily for the `deploy` job to use

**Why use artifacts instead of direct deploy?**

- Separates build and deployment concerns
- Allows deployment retries without rebuilding
- Enables artifact inspection for debugging

---

## Job 2: Deploy

**Purpose**: Publish the generated HTML to GitHub Pages

**Runner**: `ubuntu-latest`

**Dependencies**: `needs: build` (waits for build job completion)

**Permissions Required:**

- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - OIDC authentication for Pages

**Environment:**

- `name: github-pages` - Uses the GitHub Pages deployment environment
- `url: ${{ steps.deployment.outputs.page_url }}` - Makes deployment URL available

### Steps Breakdown

#### 1. Deploy to GitHub Pages

```yaml
- name: Deploy to GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v4
```

**What this does:**

- Downloads the artifact uploaded by the build job
- Deploys contents to GitHub Pages
- Generates deployment URL (e.g., `https://username.github.io/repo-name/`)
- Outputs the URL via `steps.deployment.outputs.page_url`

**Deployment mechanism:**

GitHub Pages deployment doesn't use git branches (like the old `gh-pages` branch method). Instead:

1. Artifact is uploaded to GitHub's CDN
2. Content is served directly from CDN
3. Updates are nearly instantaneous (no git push delays)

#### 2. Outputs Declaration

```yaml
outputs:
  page_url: ${{ steps.deployment.outputs.page_url }}
```

**Critical for portfolio integration:**

- Makes the deployment URL available to subsequent jobs
- The `notify-portfolio` job accesses this via `needs.deploy.outputs.page_url`
- Enables dynamic metadata generation with correct URL

---

## Job 3: Notify Portfolio

**Purpose**: Send project metadata to portfolio repository for gallery updates

**Runner**: `ubuntu-latest`

**Dependencies**: `needs: deploy` (requires deployment URL)

**Environment Variables Required:**

- `PORTFOLIO_REPO` - Repository variable (format: `owner/repo-name`)
- `PORTFOLIO_PAT` - Repository secret (GitHub Personal Access Token)

### Steps Breakdown

#### 1. Checkout Repository

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
```

- Re-downloads repository (each job starts with clean environment)
- Needed to access `_config.yml` and `send-metadata.py`

#### 2. Set Up Python

```yaml
- name: Set up Python
  uses: actions/setup-python@v6
  with:
    python-version: '3.11'
```

- Same as build job - installs Python 3.11

#### 3. Install Script Dependencies

```yaml
- name: Install dependencies
  run: |
    python -m pip install --upgrade pip
    pip install -r scripts/script_requirements.txt
```

**Note:** Only installs `script_requirements.txt` (no need for Jupyter Book here)

**Required dependencies:**

- `PyYAML` - Parse `_config.yml`
- `urllib` (built-in) - HTTP requests for repository dispatch API

#### 4. Send Metadata to Portfolio

```yaml
- name: Send metadata to portfolio
  env:
    PORTFOLIO_REPO: ${{ vars.PORTFOLIO_REPO }}
    PORTFOLIO_PAT: ${{ secrets.PORTFOLIO_PAT }}
  run: |
    python scripts/send-metadata.py ${{ needs.deploy.outputs.page_url }}
```

**Environment variables:**

- `vars.PORTFOLIO_REPO` - Retrieved from repository variables
- `secrets.PORTFOLIO_PAT` - Retrieved from repository secrets (encrypted)

**Command-line argument:**

- `${{ needs.deploy.outputs.page_url }}` - Deployment URL from deploy job

**What `send-metadata.py` does:**

1. Reads `_config.yml` to extract project metadata
2. Constructs metadata payload with deployment URL
3. Sends POST request to GitHub repository dispatch API
4. Triggers `project-updated` event in portfolio repository

**Metadata payload structure:**

```json
{
  "event_type": "project-updated",
  "client_payload": {
    "title": "Your Book Title",
    "description": "Project description",
    "author": "Author Name",
    "tags": ["tag1", "tag2"],
    "url": "https://username.github.io/project-name/",
    "logo_path": "https://username.github.io/project-name/_static/logo.png",
    "updated": "2025-11-13"
  }
}
```

**API Endpoint:**

```
POST https://api.github.com/repos/{PORTFOLIO_REPO}/dispatches
Authorization: Bearer {PORTFOLIO_PAT}
```

**Error Handling:**

- If `PORTFOLIO_REPO` or `PORTFOLIO_PAT` is not set, the script logs a warning and exits gracefully
- Deployment succeeds even if portfolio notification fails
- This is intentional: book deployment should not depend on portfolio availability

---

## Configuration Setup

### Required: GitHub Pages Source

**Location:** Repository Settings → Pages → Source

**Configuration:**

1. Navigate to your repository settings
2. Click "Pages" in the sidebar
3. Under "Source", select **"GitHub Actions"**
4. Save the configuration

**Why this matters:**

- Old method used `gh-pages` branch deployment
- New method uses GitHub Actions artifacts (faster, more reliable)
- **Must** be set to "GitHub Actions" or deployment will fail

### Optional: Portfolio Integration

**Location:** Repository Settings → Secrets and variables → Actions

#### Create Repository Secret: PORTFOLIO_PAT

1. Navigate to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. **Name**: `PORTFOLIO_PAT`
4. **Value**: Your GitHub Personal Access Token

**How to generate PAT:**

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Set expiration (recommend: 90 days or 1 year)
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - This includes `repo:status`, `repo_deployment`, `public_repo`
5. Generate token and copy immediately (won't be shown again)
6. Store securely in password manager

**Security considerations:**

- PAT grants access to your portfolio repository
- Use repository secrets (encrypted at rest and in transit)
- Rotate tokens periodically
- Limit token scope to minimum required permissions

#### Create Repository Variable: PORTFOLIO_REPO

1. Navigate to Settings → Secrets and variables → Actions
2. Click "Variables" tab
3. Click "New repository variable"
4. **Name**: `PORTFOLIO_REPO`
5. **Value**: `your-username/your-portfolio-repo` (format: `owner/repo`)

**Example:**

- If your portfolio is at `https://github.com/john-doe/portfolio`
- Set `PORTFOLIO_REPO` to `john-doe/portfolio`

**Why use variables instead of hardcoding?**

- Reusable across multiple book projects
- Easy to update without modifying workflow file
- Clear separation of configuration and code

---

## Workflow Permissions

The workflow requires specific permissions to function correctly:

```yaml
permissions:
  contents: write     # Commit README updates back to repository
  pages: write        # Deploy to GitHub Pages
  id-token: write     # OIDC authentication for Pages deployment
```

**Permission Scope:**

- `GITHUB_TOKEN` (automatic) - Used for repository operations
- Scoped to the specific workflow run
- Automatically revoked after workflow completes

**Why these permissions?**

- `contents: write` - Build job commits README header changes
- `pages: write` - Deploy job publishes to GitHub Pages
- `id-token: write` - Required for secure Pages deployment (OIDC)

---

## Troubleshooting

### Workflow Not Triggering

**Symptom:** Push to main branch, but workflow doesn't run

**Solutions:**

1. **Check workflow file location**: Must be in `.github/workflows/deploy.yml`
2. **Verify branch name**: Workflow triggers on `main` branch
   - If your default branch is `master`, change trigger:
     ```yaml
     on:
       push:
         branches:
           - master
     ```
3. **Check commit message**: If it contains `[skip ci]`, workflow won't run
4. **Verify repository actions**: Settings → Actions → General → "Allow all actions"

### Build Job Fails

#### Error: "jupyter-book: command not found"

**Cause:** Jupyter Book not installed or wrong version

**Solution:**

```yaml
# In book_requirements.txt, ensure:
jupyter-book<2.0
```

**Why `<2.0`?**

- Jupyter Book 2.0+ has breaking changes
- This template is tested with 1.x versions
- Pin to stable version to prevent surprises

#### Error: "No module named 'yaml'"

**Cause:** PyYAML not installed

**Solution:**

```yaml
# In scripts/script_requirements.txt, ensure:
PyYAML>=6.0
```

#### Error: "Build failed: Error parsing _config.yml"

**Cause:** Invalid YAML syntax in `_config.yml`

**Solutions:**

1. Validate YAML syntax: <https://www.yamllint.com/>
2. Common issues:
   - Mixed tabs and spaces (use spaces only)
   - Missing colons after keys
   - Incorrect indentation
   - Special characters not quoted

**Example fix:**

```yaml
# Wrong
title: My Book: A Guide
tags: [tag1, tag2: subtag]

# Correct
title: "My Book: A Guide"
tags: ["tag1", "tag2-subtag"]
```

### Commit Loop (Recursive Triggers)

**Symptom:** Workflow runs infinitely, creating commits rapidly

**Cause:** Missing `[skip ci]` in commit message

**Solution:**

Verify commit message in build job:

```yaml
git commit -m "Auto-update: README header [skip ci]"
```

**Emergency fix:**

1. Go to Actions tab
2. Click "Cancel workflow"
3. Fix the workflow file to include `[skip ci]`
4. Push the fix

### Deploy Job Fails

#### Error: "Authentication failed"

**Cause:** Missing or incorrect permissions

**Solution:**

Verify workflow permissions:

```yaml
permissions:
  contents: write
  pages: write
  id-token: write
```

#### Error: "Pages deployment disabled"

**Cause:** GitHub Pages not enabled or wrong source selected

**Solution:**

1. Go to Settings → Pages
2. Under "Source", select **"GitHub Actions"**
3. Save and re-run workflow

#### Error: "Artifact not found"

**Cause:** Build job didn't complete successfully or upload failed

**Solution:**

1. Check build job logs for errors
2. Verify artifact upload step succeeded:
   ```yaml
   - name: Upload artifact
     uses: actions/upload-pages-artifact@v4
     with:
       path: _build/html
   ```
3. Ensure `_build/html` directory exists after build

### Portfolio Notification Fails

#### Error: "PORTFOLIO_REPO environment variable not set"

**Cause:** Repository variable not configured

**Solution:**

1. Settings → Secrets and variables → Actions → Variables
2. Create variable named `PORTFOLIO_REPO`
3. Set value to `owner/repo-name` format

#### Error: "PORTFOLIO_PAT environment variable not set"

**Cause:** Repository secret not configured

**Solution:**

1. Settings → Secrets and variables → Actions → Secrets
2. Create secret named `PORTFOLIO_PAT`
3. Set value to your Personal Access Token

#### Error: "404 Not Found" when sending repository dispatch

**Cause:** PORTFOLIO_REPO doesn't exist or PAT lacks permissions

**Solutions:**

1. Verify repository exists and is accessible
2. Check PORTFOLIO_REPO format: `owner/repo` (no `.git`, no URL)
3. Verify PAT has `repo` scope
4. Check PAT hasn't expired
5. Ensure PAT is authorized for the portfolio repository

#### Error: "403 Forbidden" when sending repository dispatch

**Cause:** PAT lacks required permissions

**Solution:**

Generate new PAT with `repo` scope:

1. GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select `repo` scope
4. Update PORTFOLIO_PAT secret with new token

#### Portfolio workflow not triggered

**Cause:** Portfolio repository doesn't have workflow listening for dispatch events

**Solution:**

Portfolio repository must have workflow with:

```yaml
on:
  repository_dispatch:
    types:
      - project-updated
```

---

## Advanced Customization

### Change Trigger Conditions

**Current behavior:** Runs on every push to main

**Custom triggers:**

```yaml
# Run on multiple branches
on:
  push:
    branches:
      - main
      - develop

# Run on pull requests
on:
  pull_request:
    branches:
      - main

# Run on manual trigger
on:
  workflow_dispatch:

# Run on schedule (daily at midnight UTC)
on:
  schedule:
    - cron: '0 0 * * *'

# Combine multiple triggers
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  workflow_dispatch:
```

### Add Deployment Notifications

Send notifications on successful deployment:

```yaml
- name: Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v2
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Jupyter Book deployed successfully!",
        "url": "${{ needs.deploy.outputs.page_url }}"
      }
```

### Cache Dependencies

Speed up workflow by caching pip packages:

```yaml
- name: Cache pip packages
  uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-

- name: Install dependencies
  run: |
    pip install -r book_requirements.txt
    pip install -r scripts/script_requirements.txt
```

**Benefits:**

- Faster workflow execution (30-60 seconds saved)
- Reduced bandwidth usage
- More reliable (less dependent on PyPI availability)

### Matrix Testing

Test book build with multiple Python versions:

```yaml
build:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      python-version: ['3.9', '3.10', '3.11']
  steps:
    - uses: actions/checkout@v5
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v6
      with:
        python-version: ${{ matrix.python-version }}
    # ... rest of build steps
```

---

## Workflow Best Practices

### 1. Use Semantic Versioning for Actions

```yaml
# Good: Pin to major version (receives patches and minor updates)
uses: actions/checkout@v5

# Better: Pin to specific version (most reproducible)
uses: actions/checkout@v5.2.0

# Avoid: Using @main (unpredictable changes)
uses: actions/checkout@main
```

### 2. Always Check for Changes Before Committing

```yaml
# Good: Conditional commit
git diff --quiet && git diff --staged --quiet || git commit -m "..."

# Bad: Unconditional commit (fails if no changes)
git commit -m "..."
```

### 3. Use Secrets for Sensitive Data

```yaml
# Good: Use secrets
PORTFOLIO_PAT: ${{ secrets.PORTFOLIO_PAT }}

# Bad: Hardcoded tokens
PORTFOLIO_PAT: ghp_xxxxxxxxxxxxxxxxxxxx
```

### 4. Set Appropriate Timeouts

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 30  # Prevent infinite runs
```

### 5. Use Descriptive Step Names

```yaml
# Good: Clear purpose
- name: Update README.md header with current date and metadata

# Bad: Vague
- name: Run script
```

---

## Monitoring and Debugging

### View Workflow Runs

1. Navigate to repository **Actions** tab
2. Click on specific workflow run
3. Expand job to see individual step logs
4. Download logs for offline analysis

### Debug Mode

Enable debug logging for detailed output:

1. Settings → Secrets and variables → Actions → Variables
2. Create variable: `ACTIONS_STEP_DEBUG` = `true`
3. Re-run workflow

**Warning:** Debug logs are **very verbose**. Use only for troubleshooting.

### Common Debug Commands

Add debugging steps to workflow:

```yaml
- name: Debug environment
  run: |
    echo "Working directory: $(pwd)"
    echo "Python version: $(python --version)"
    echo "Pip version: $(pip --version)"
    echo "Directory contents:"
    ls -la

- name: Debug git status
  run: |
    git status
    git log -1

- name: Debug artifact contents
  run: |
    ls -la _build/html
    find _build/html -type f | head -20
```

---

## Performance Optimization

### Current Workflow Timing

**Typical execution time:**

- Build job: 2-3 minutes
- Deploy job: 1-2 minutes
- Notify job: 30 seconds
- **Total: 3-6 minutes**

### Optimization Strategies

1. **Cache pip packages** (saves 30-60 seconds)
2. **Use smaller Docker images** if using containers
3. **Parallelize independent jobs** (not applicable here due to dependencies)
4. **Reduce artifact size** by excluding unnecessary files
5. **Use `GITHUB_TOKEN` instead of PAT** where possible (faster auth)

---

## Security Considerations

### Secret Management

- **Never** commit secrets to repository
- Rotate PAT tokens every 90 days
- Use minimum required permissions
- Monitor secret usage in Actions logs

### Token Scopes

**PORTFOLIO_PAT minimal required scopes:**

- ✅ `repo` (for repository dispatch)
- ❌ `workflow` (not needed)
- ❌ `admin:org` (not needed)

### Workflow Permissions

Follow principle of least privilege:

```yaml
# Current (permissive)
permissions:
  contents: write
  pages: write
  id-token: write

# Alternative (minimal) - only if not committing README updates
permissions:
  pages: write
  id-token: write
```

---

## Summary

The GitHub Actions workflow in this template provides:

✅ **Automated metadata management** - README always current  
✅ **One-click deployment** - Push to main, deployed in minutes  
✅ **Portfolio integration** - Projects automatically appear in portfolio  
✅ **Robust error handling** - Graceful failures, clear error messages  
✅ **Security best practices** - Secrets encrypted, minimal permissions  
✅ **Maintainability** - Clear job separation, extensive documentation  

**Key Achievement:** Complete automation from code commit to live website with portfolio notification—zero manual intervention required.
