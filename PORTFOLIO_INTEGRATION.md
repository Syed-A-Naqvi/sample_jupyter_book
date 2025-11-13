# Portfolio Integration System

*Automated project synchronization using GitHub Repository Dispatch API*

---

## Overview

This Jupyter Book template includes a sophisticated portfolio integration system that automatically updates your portfolio website whenever you deploy a new project or update an existing one. The integration uses GitHub's Repository Dispatch API to trigger cross-repository workflows, enabling a fully automated project gallery management system.

**Key Features:**

- 🔄 **Automatic synchronization** - Projects appear in portfolio immediately after deployment
- 📊 **Metadata extraction** - Project information automatically pulled from `_config.yml`
- 🔐 **Secure communication** - Authenticated API requests using Personal Access Tokens
- ⚡ **Real-time updates** - Portfolio updates within seconds of book deployment
- 🎨 **Rich metadata** - Includes title, description, tags, logo, author, and deployment URL

---

## Architecture

### Communication Flow

```
┌─────────────────────────────────┐
│   Jupyter Book Repository       │
│                                 │
│  1. Push to main branch         │
│  2. GitHub Actions workflow     │
│  3. Build & Deploy book         │
│  4. Extract metadata            │
│  5. Send repository dispatch ────┐
└─────────────────────────────────┘│
                                   │
                                   ├── GitHub API
                                   │   (HTTPS POST)
                                   │
┌──────────────────────────────────▼┐
│   Portfolio Repository           │
│                                  │
│  6. Receive dispatch event       │
│  7. Trigger portfolio workflow   │
│  8. Update project gallery       │
│  9. Rebuild & deploy portfolio   │
└──────────────────────────────────┘
```

### Component Interaction

**Book Repository Components:**

- `_config.yml` - Source of truth for project metadata
- `scripts/send-metadata.py` - Extracts and sends metadata
- `.github/workflows/deploy.yml` - Orchestrates the process

**GitHub API:**

- `POST /repos/{owner}/{repo}/dispatches` - Repository dispatch endpoint
- Authentication via Personal Access Token (PAT)
- Event type: `project-updated`

**Portfolio Repository Components:**

- `.github/workflows/update-projects.yml` - Listens for dispatch events
- `projects.json` or similar - Project gallery data store
- Portfolio build system - Renders updated gallery

---

## Metadata Structure

### Source: _config.yml

The metadata is defined in your book's `_config.yml`:

```yaml
title: "My Data Science Project"
description: "A comprehensive analysis of customer churn patterns"
author: "Jane Smith"
logo: "logo.png"

project_metadata:
  tags: ["machine learning", "customer analytics", "python", "scikit-learn"]
```

### Extracted Metadata Payload

The `send-metadata.py` script constructs this JSON payload:

```json
{
  "event_type": "project-updated",
  "client_payload": {
    "title": "My Data Science Project",
    "description": "A comprehensive analysis of customer churn patterns",
    "author": "Jane Smith",
    "tags": ["machine learning", "customer analytics", "python", "scikit-learn"],
    "url": "https://jane-smith.github.io/customer-churn-analysis/",
    "logo_path": "https://jane-smith.github.io/customer-churn-analysis/_static/logo.png",
    "updated": "2025-11-13"
  }
}
```

### Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `event_type` | string | Identifies the dispatch event type | `"project-updated"` |
| `title` | string | Project title from `_config.yml` | `"Customer Churn Analysis"` |
| `description` | string | Brief project description | `"ML analysis of churn patterns"` |
| `author` | string | Project author name | `"Jane Smith"` |
| `tags` | array | List of project tags/keywords | `["ML", "Python", "Analytics"]` |
| `url` | string | **Full URL** to deployed book | `"https://user.github.io/repo/"` |
| `logo_path` | string | **Full URL** to project logo image | `"https://user.github.io/repo/_static/logo.png"` |
| `updated` | string | Date of deployment (YYYY-MM-DD) | `"2025-11-13"` |

**Important URL Considerations:**

- Both `url` and `logo_path` are **absolute URLs**, not relative paths
- Constructed from the deployment URL: `${{ needs.deploy.outputs.page_url }}`
- Logo path assumes logo is copied to `_build/html/_static/` during build
- Ensure logo file is **not** in `exclude_patterns` in `_config.yml`

---

## GitHub Repository Dispatch

### What is Repository Dispatch?

Repository Dispatch is a GitHub feature that allows external systems to trigger workflows in a repository via authenticated API calls. It's designed for cross-repository automation and CI/CD integration.

**Key characteristics:**

- **Trigger mechanism**: POST request to GitHub API endpoint
- **Authentication**: Requires Personal Access Token with `repo` scope
- **Event-driven**: Workflows listen for specific event types
- **Asynchronous**: API call returns immediately; workflow runs separately
- **Payload delivery**: Custom JSON data passed to workflow

### API Endpoint

```
POST https://api.github.com/repos/{owner}/{repo}/dispatches
```

**Parameters:**

- `{owner}` - Repository owner (username or organization)
- `{repo}` - Repository name

**Example:**

```
POST https://api.github.com/repos/jane-smith/portfolio/dispatches
```

### Authentication

Requires GitHub Personal Access Token in Authorization header:

```http
POST /repos/jane-smith/portfolio/dispatches
Host: api.github.com
Authorization: Bearer ghp_xxxxxxxxxxxxxxxxxxxx
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2022-11-28
Content-Type: application/json
```

**Required PAT permissions:**

- `repo` scope - Full control of repositories
  - Includes `repo:status`, `repo_deployment`, `public_repo`
  - Needed to trigger workflows via dispatch

### Request Payload

```json
{
  "event_type": "project-updated",
  "client_payload": {
    "title": "Project Title",
    "description": "Project description",
    "author": "Author Name",
    "tags": ["tag1", "tag2"],
    "url": "https://user.github.io/project/",
    "logo_path": "https://user.github.io/project/_static/logo.png",
    "updated": "2025-11-13"
  }
}
```

**Field constraints:**

- `event_type` - Required, max 100 characters, alphanumeric + hyphens
- `client_payload` - Optional, custom JSON object, max 65,535 characters

### Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 204 | Success - Dispatch created | ✅ Workflow triggered |
| 401 | Unauthorized - Invalid PAT | 🔐 Check token validity |
| 403 | Forbidden - Insufficient permissions | 🔑 Verify PAT has `repo` scope |
| 404 | Not Found - Repository doesn't exist | 📂 Check repository name |
| 422 | Unprocessable Entity - Invalid payload | 📝 Verify JSON structure |

### Example API Call

**Using Python (urllib):**

```python
import json
from urllib import request, error

def send_repository_dispatch(repo, token, metadata):
    api_url = f"https://api.github.com/repos/{repo}/dispatches"
    
    payload = {
        "event_type": "project-updated",
        "client_payload": metadata
    }
    
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
    }
    
    req = request.Request(
        api_url,
        data=json.dumps(payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    
    with request.urlopen(req) as response:
        if response.status == 204:
            print("✓ Dispatch sent successfully")
        else:
            print(f"⚠ Unexpected response: {response.status}")
```

**Using curl:**

```bash
curl -X POST \
  https://api.github.com/repos/jane-smith/portfolio/dispatches \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ghp_xxxxxxxxxxxxxxxxxxxx" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d '{
    "event_type": "project-updated",
    "client_payload": {
      "title": "My Project",
      "url": "https://jane-smith.github.io/my-project/"
    }
  }'
```

---

## Portfolio Repository Setup

### Prerequisites

Your portfolio repository must:

1. ✅ Be a GitHub repository (public or private)
2. ✅ Have GitHub Actions enabled
3. ✅ Have a workflow that listens for `repository_dispatch` events
4. ✅ Have a system for storing and rendering project data

### Required Workflow

Create `.github/workflows/update-projects.yml` in your portfolio repository:

```yaml
name: Update Project Gallery

on:
  repository_dispatch:
    types:
      - project-updated

permissions:
  contents: write    # Needed to update project data and commit changes
  pages: write       # Needed to deploy updated portfolio
  id-token: write    # Needed for GitHub Pages OIDC

jobs:
  update-gallery:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout portfolio repository
        uses: actions/checkout@v5
      
      - name: Set up Python
        uses: actions/setup-python@v6
        with:
          python-version: '3.11'
      
      - name: Display received metadata
        run: |
          echo "Event type: ${{ github.event.action }}"
          echo "Project title: ${{ github.event.client_payload.title }}"
          echo "Project URL: ${{ github.event.client_payload.url }}"
          echo "Author: ${{ github.event.client_payload.author }}"
          echo "Tags: ${{ join(github.event.client_payload.tags, ', ') }}"
          echo "Updated: ${{ github.event.client_payload.updated }}"
      
      - name: Update project gallery data
        run: |
          python scripts/update-gallery.py \
            --title "${{ github.event.client_payload.title }}" \
            --description "${{ github.event.client_payload.description }}" \
            --author "${{ github.event.client_payload.author }}" \
            --url "${{ github.event.client_payload.url }}" \
            --logo "${{ github.event.client_payload.logo_path }}" \
            --tags "${{ join(github.event.client_payload.tags, ',') }}" \
            --updated "${{ github.event.client_payload.updated }}"
      
      - name: Commit updated gallery data
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add .
          git diff --quiet && git diff --staged --quiet || \
            git commit -m "Update project: ${{ github.event.client_payload.title }}"
          git push
      
      - name: Build portfolio
        run: |
          # Your portfolio build command (examples below)
          # For static site generators:
          npm install && npm run build
          # For Jekyll:
          # bundle install && bundle exec jekyll build
          # For Hugo:
          # hugo
      
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

### Accessing Dispatch Event Data

In portfolio workflows, access metadata via `github.event.client_payload`:

| Expression | Value |
|------------|-------|
| `${{ github.event.action }}` | `"project-updated"` |
| `${{ github.event.client_payload.title }}` | `"My Project"` |
| `${{ github.event.client_payload.description }}` | `"Project description"` |
| `${{ github.event.client_payload.author }}` | `"Author Name"` |
| `${{ github.event.client_payload.url }}` | `"https://user.github.io/repo/"` |
| `${{ github.event.client_payload.logo_path }}` | `"https://user.github.io/repo/_static/logo.png"` |
| `${{ github.event.client_payload.tags }}` | `["tag1", "tag2"]` (array) |
| `${{ github.event.client_payload.updated }}` | `"2025-11-13"` |

**Working with arrays:**

```yaml
# Join array into comma-separated string
${{ join(github.event.client_payload.tags, ', ') }}
# Result: "tag1, tag2, tag3"

# Access first element (not recommended, use iteration in scripts)
${{ github.event.client_payload.tags[0] }}
```

### Project Gallery Data Store

**Option 1: JSON file (Recommended)**

`projects.json`:

```json
{
  "projects": [
    {
      "title": "Customer Churn Analysis",
      "description": "ML analysis of churn patterns",
      "author": "Jane Smith",
      "tags": ["machine learning", "python"],
      "url": "https://jane-smith.github.io/churn-analysis/",
      "logo": "https://jane-smith.github.io/churn-analysis/_static/logo.png",
      "updated": "2025-11-13"
    },
    {
      "title": "Sales Forecasting Dashboard",
      "description": "Interactive time series forecasting",
      "author": "Jane Smith",
      "tags": ["time series", "dashboard"],
      "url": "https://jane-smith.github.io/sales-forecast/",
      "logo": "https://jane-smith.github.io/sales-forecast/_static/logo.png",
      "updated": "2025-10-20"
    }
  ]
}
```

**Option 2: YAML file**

`_data/projects.yml`:

```yaml
projects:
  - title: "Customer Churn Analysis"
    description: "ML analysis of churn patterns"
    author: "Jane Smith"
    tags: ["machine learning", "python"]
    url: "https://jane-smith.github.io/churn-analysis/"
    logo: "https://jane-smith.github.io/churn-analysis/_static/logo.png"
    updated: "2025-11-13"
```

**Option 3: Markdown front matter (Jekyll)**

`_projects/churn-analysis.md`:

```markdown
---
title: "Customer Churn Analysis"
description: "ML analysis of churn patterns"
author: "Jane Smith"
tags: ["machine learning", "python"]
url: "https://jane-smith.github.io/churn-analysis/"
logo: "https://jane-smith.github.io/churn-analysis/_static/logo.png"
updated: "2025-11-13"
---

Additional project details here...
```

### Update Script Example

`scripts/update-gallery.py`:

```python
#!/usr/bin/env python3
"""Update portfolio project gallery with new project data."""

import json
import argparse
from datetime import datetime

def load_projects(file_path='projects.json'):
    """Load existing projects from JSON file."""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"projects": []}

def save_projects(data, file_path='projects.json'):
    """Save projects to JSON file."""
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

def update_project(projects, new_project):
    """Update existing project or add new one."""
    # Find existing project by URL (unique identifier)
    for i, project in enumerate(projects['projects']):
        if project['url'] == new_project['url']:
            # Update existing project
            projects['projects'][i] = new_project
            print(f"Updated existing project: {new_project['title']}")
            return projects
    
    # Add new project
    projects['projects'].append(new_project)
    print(f"Added new project: {new_project['title']}")
    
    # Sort by updated date (newest first)
    projects['projects'].sort(key=lambda x: x['updated'], reverse=True)
    
    return projects

def main():
    parser = argparse.ArgumentParser(description='Update portfolio project gallery')
    parser.add_argument('--title', required=True, help='Project title')
    parser.add_argument('--description', required=True, help='Project description')
    parser.add_argument('--author', required=True, help='Project author')
    parser.add_argument('--url', required=True, help='Project URL')
    parser.add_argument('--logo', required=True, help='Logo image URL')
    parser.add_argument('--tags', required=True, help='Comma-separated tags')
    parser.add_argument('--updated', required=True, help='Update date (YYYY-MM-DD)')
    
    args = parser.parse_args()
    
    # Parse tags
    tags = [tag.strip() for tag in args.tags.split(',')]
    
    # Create project object
    new_project = {
        'title': args.title,
        'description': args.description,
        'author': args.author,
        'url': args.url,
        'logo': args.logo,
        'tags': tags,
        'updated': args.updated
    }
    
    # Update gallery
    projects = load_projects()
    projects = update_project(projects, new_project)
    save_projects(projects)
    
    print(f"✓ Gallery updated successfully ({len(projects['projects'])} total projects)")

if __name__ == '__main__':
    main()
```

---

## Configuration Setup (Book Repository)

### Step 1: Create Personal Access Token (PAT)

**Navigate to GitHub Settings:**

1. Click your profile photo → **Settings**
2. Scroll down to **Developer settings** (bottom of left sidebar)
3. Click **Personal access tokens** → **Tokens (classic)**
4. Click **Generate new token** → **Generate new token (classic)**

**Configure token:**

1. **Note**: `Portfolio Integration Token` (descriptive name)
2. **Expiration**: Select duration
   - Recommended: 90 days or 1 year
   - **Note**: You'll need to regenerate and update the secret when it expires
3. **Select scopes**:
   - ✅ `repo` - Full control of private repositories
     - This includes all sub-scopes (status, deployment, public_repo)
   - ❌ Other scopes not needed
4. Click **Generate token**
5. **Important**: Copy token immediately (won't be shown again)
6. Store securely in password manager

**Token format:**

```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Security best practices:**

- Never commit token to repository
- Don't share token in issues, pull requests, or comments
- Regenerate if compromised
- Use different tokens for different purposes
- Rotate tokens regularly (every 90 days recommended)

### Step 2: Add Secret to Book Repository

**Navigate to repository settings:**

1. Go to your Jupyter Book repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions** (in left sidebar)
4. Click **Secrets** tab (if not already selected)

**Create secret:**

1. Click **New repository secret**
2. **Name**: `PORTFOLIO_PAT` (exact name, case-sensitive)
3. **Secret**: Paste your Personal Access Token
4. Click **Add secret**

**Verification:**

- Secret should appear in list as `PORTFOLIO_PAT`
- Value will be hidden (shows as `***`)
- Can update or delete, but cannot view value

### Step 3: Add Variable to Book Repository

**Navigate to variables:**

1. Still in Settings → Secrets and variables → Actions
2. Click **Variables** tab
3. Click **New repository variable**

**Create variable:**

1. **Name**: `PORTFOLIO_REPO` (exact name, case-sensitive)
2. **Value**: `your-username/your-portfolio-repo`
   - Format: `owner/repository-name`
   - Example: `jane-smith/portfolio`
   - **Not** `https://github.com/jane-smith/portfolio`
   - **Not** `jane-smith/portfolio.git`
3. Click **Add variable**

**Common mistakes:**

```
❌ https://github.com/jane-smith/portfolio
❌ jane-smith/portfolio.git
❌ github.com/jane-smith/portfolio
✅ jane-smith/portfolio
```

### Step 4: Verify Configuration

**Check workflow file:**

Ensure `.github/workflows/deploy.yml` includes the notify-portfolio job:

```yaml
notify-portfolio:
  runs-on: ubuntu-latest
  needs: deploy
  
  steps:
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
    
    - name: Send metadata to portfolio
      env:
        PORTFOLIO_REPO: ${{ vars.PORTFOLIO_REPO }}
        PORTFOLIO_PAT: ${{ secrets.PORTFOLIO_PAT }}
      run: |
        python scripts/send-metadata.py ${{ needs.deploy.outputs.page_url }}
```

**Check script dependencies:**

Verify `scripts/script_requirements.txt` includes:

```
PyYAML>=6.0
```

**Test configuration:**

1. Make a small change to your book (e.g., edit README.md)
2. Commit and push to main branch
3. Go to **Actions** tab in book repository
4. Watch workflow execute
5. Check portfolio repository **Actions** tab for triggered workflow

---

## End-to-End Integration Flow

### Complete Workflow Execution

**Phase 1: Book Repository (Automated)**

1. **Developer action**: Push code to main branch
2. **GitHub trigger**: Workflow starts (`deploy.yml`)
3. **Update README**: Python script updates header with current date
4. **Commit changes**: README committed back to repository
5. **Build book**: Jupyter Book generates HTML files
6. **Upload artifact**: HTML packaged for deployment
7. **Deploy to Pages**: Book published to GitHub Pages
8. **Extract metadata**: Python script reads `_config.yml`
9. **Send dispatch**: POST request to GitHub API

**Phase 2: GitHub API (Instantaneous)**

10. **Authenticate**: Verify Personal Access Token
11. **Validate payload**: Check event type and structure
12. **Queue event**: Add to repository dispatch queue
13. **Return response**: HTTP 204 (no content) on success

**Phase 3: Portfolio Repository (Automated)**

14. **Receive event**: Portfolio workflow triggered by dispatch
15. **Extract payload**: Access project metadata from event
16. **Update gallery**: Python script modifies `projects.json`
17. **Commit changes**: Updated gallery data committed
18. **Build portfolio**: Static site generator runs
19. **Deploy portfolio**: Updated portfolio published

**Total time**: 3-6 minutes (book) + 2-4 minutes (portfolio) = 5-10 minutes end-to-end

### Visual Timeline

```
Time    Book Repository              GitHub API    Portfolio Repository
─────────────────────────────────────────────────────────────────────
0:00    Push to main                                
0:05    Update README header                        
0:10    Commit changes                              
0:15    Build Jupyter Book                          
2:00    Build complete                              
2:05    Upload artifact                             
2:10    Deploy to GitHub Pages                      
3:00    Deployment complete                         
3:05    Extract metadata                            
3:10    Send dispatch request    ─────→ Receive     
3:11                                     Validate   
3:12                                     Queue      
3:13                                                Workflow triggered
3:15                                                Extract metadata
3:20                                                Update gallery data
3:25                                                Commit changes
3:30                                                Build portfolio
5:00                                                Deploy portfolio
5:30                                                ✓ Complete
```

---

## Troubleshooting

### Book Repository Issues

#### Error: "PORTFOLIO_PAT environment variable not set"

**Cause:** Repository secret not configured

**Solution:**

1. Settings → Secrets and variables → Actions → Secrets
2. Verify `PORTFOLIO_PAT` exists
3. If missing, create secret with your Personal Access Token
4. If exists, regenerate PAT and update secret

#### Error: "PORTFOLIO_REPO environment variable not set"

**Cause:** Repository variable not configured

**Solution:**

1. Settings → Secrets and variables → Actions → Variables
2. Verify `PORTFOLIO_REPO` exists
3. If missing, create variable with `owner/repo` format
4. If exists, verify format is correct (no URL, no `.git`)

#### Error: "404 Not Found" when sending dispatch

**Causes:**

1. Portfolio repository doesn't exist
2. Repository name misspelled in `PORTFOLIO_REPO`
3. Repository is private and PAT lacks permissions

**Solutions:**

1. Verify repository exists: `https://github.com/owner/repo`
2. Check `PORTFOLIO_REPO` variable: Should be `owner/repo`
3. For private repositories:
   - PAT must have `repo` scope (not just `public_repo`)
   - Verify PAT is authorized for the organization (if applicable)

#### Error: "403 Forbidden" when sending dispatch

**Causes:**

1. PAT expired or revoked
2. PAT lacks `repo` scope
3. PAT not authorized for organization

**Solutions:**

1. **Check PAT validity:**
   - Go to Settings → Developer settings → Personal access tokens
   - Find your token, check expiration
   - If expired, regenerate
2. **Verify scope:**
   - Token must have `repo` scope
   - Regenerate with correct scope if needed
3. **Organization authorization:**
   - If portfolio is in organization, PAT must be authorized
   - Settings → Developer settings → Personal access tokens
   - Click token → Configure SSO → Authorize organization

#### Dispatch sent but portfolio workflow doesn't trigger

**Causes:**

1. Portfolio workflow doesn't exist
2. Workflow not listening for correct event type
3. Workflow has syntax errors
4. Actions disabled in portfolio repository

**Solutions:**

1. **Verify workflow exists:**
   - Check `.github/workflows/` in portfolio repository
   - Workflow file must be on default branch (usually `main`)
2. **Check event type:**
   ```yaml
   on:
     repository_dispatch:
       types:
         - project-updated  # Must match exactly
   ```
3. **Validate workflow syntax:**
   - Copy workflow to https://www.yamllint.com/
   - Fix any YAML syntax errors
4. **Check Actions settings:**
   - Portfolio Settings → Actions → General
   - Ensure "Allow all actions" is selected

### Portfolio Repository Issues

#### Workflow triggered but fails

**Check workflow logs:**

1. Portfolio repository → Actions tab
2. Click failed workflow run
3. Expand steps to see error messages

**Common errors:**

1. **"Expression evaluation error":**
   - Accessing undefined payload field
   - Solution: Add null checks or use default values
   ```yaml
   ${{ github.event.client_payload.title || 'Untitled Project' }}
   ```

2. **"Script not found":**
   - Update script path incorrect
   - Solution: Verify path in workflow matches actual location

3. **"Permission denied":**
   - Insufficient workflow permissions
   - Solution: Add required permissions to workflow
   ```yaml
   permissions:
     contents: write
     pages: write
   ```

#### Gallery not updating after successful workflow

**Causes:**

1. Script updates data but doesn't commit
2. Cache preventing updates from showing
3. Portfolio not rebuilding after data update

**Solutions:**

1. **Verify commit step:**
   ```yaml
   - name: Commit updated gallery
     run: |
       git config user.name "github-actions[bot]"
       git config user.email "github-actions[bot]@users.noreply.github.com"
       git add .
       git diff --quiet && git diff --staged --quiet || git commit -m "..."
       git push
   ```

2. **Clear browser cache:**
   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - Verify changes in repository files directly

3. **Check portfolio build:**
   - Workflow should rebuild site after updating data
   - Verify build step exists and succeeds

### Metadata Issues

#### Logo not displaying in portfolio

**Causes:**

1. Logo file excluded from build
2. Logo path incorrect
3. CORS issues (unlikely with GitHub Pages)

**Solutions:**

1. **Verify logo in build:**
   - Check `_build/html/_static/logo.png` exists locally
   - Verify logo URL returns 200: Open in browser

2. **Check exclude patterns:**
   ```yaml
   # In _config.yml
   exclude_patterns:
     # - "logo.png"  # Don't exclude!
   ```

3. **Verify logo path construction:**
   ```python
   # In send-metadata.py
   logo_path = f"{deployed_url}_static/{config.get('logo')}"
   # Should produce: https://user.github.io/repo/_static/logo.png
   ```

#### Tags not appearing correctly

**Cause:** Tags format mismatch between book and portfolio

**Solution:**

Ensure consistent tag format in `_config.yml`:

```yaml
# Correct
project_metadata:
  tags: ["machine learning", "python", "data science"]

# Also correct
project_metadata:
  tags:
    - machine learning
    - python
    - data science

# Incorrect (not a list)
project_metadata:
  tags: "machine learning, python, data science"
```

#### Date format issues

**Cause:** Portfolio expects different date format

**Solutions:**

1. **In send-metadata.py**, change date format:
   ```python
   # Current format: YYYY-MM-DD
   current_date = datetime.now().strftime("%Y-%m-%d")
   
   # Alternative formats:
   # Month DD, YYYY
   current_date = datetime.now().strftime("%B %d, %Y")
   # DD/MM/YYYY
   current_date = datetime.now().strftime("%d/%m/%Y")
   ```

2. **In portfolio**, parse date consistently:
   ```javascript
   // Parse YYYY-MM-DD format
   const date = new Date(project.updated);
   ```

---

## Advanced Customization

### Multiple Portfolio Repositories

Send updates to multiple portfolios:

```yaml
- name: Send to personal portfolio
  env:
    PORTFOLIO_REPO: ${{ vars.PERSONAL_PORTFOLIO }}
    PORTFOLIO_PAT: ${{ secrets.PERSONAL_PAT }}
  run: |
    python scripts/send-metadata.py ${{ needs.deploy.outputs.page_url }}

- name: Send to team portfolio
  env:
    PORTFOLIO_REPO: ${{ vars.TEAM_PORTFOLIO }}
    PORTFOLIO_PAT: ${{ secrets.TEAM_PAT }}
  run: |
    python scripts/send-metadata.py ${{ needs.deploy.outputs.page_url }}
```

### Conditional Portfolio Notification

Only notify portfolio for specific branches:

```yaml
- name: Send metadata to portfolio
  if: github.ref == 'refs/heads/main'
  env:
    PORTFOLIO_REPO: ${{ vars.PORTFOLIO_REPO }}
    PORTFOLIO_PAT: ${{ secrets.PORTFOLIO_PAT }}
  run: |
    python scripts/send-metadata.py ${{ needs.deploy.outputs.page_url }}
```

### Custom Event Types

Send different event types based on conditions:

```python
# In send-metadata.py
event_type = "project-updated"
if is_new_project:
    event_type = "project-created"
elif is_major_update:
    event_type = "project-major-update"

payload = {
    "event_type": event_type,
    "client_payload": metadata
}
```

Portfolio workflow:

```yaml
on:
  repository_dispatch:
    types:
      - project-created
      - project-updated
      - project-major-update
      - project-deleted
```

### Extended Metadata

Add custom fields to metadata:

```yaml
# In _config.yml
project_metadata:
  tags: ["python", "ML"]
  category: "Data Science"
  difficulty: "Intermediate"
  duration: "2 weeks"
  status: "complete"
```

```python
# In send-metadata.py
project_meta = config.get("project_metadata", {})
metadata = {
    "title": title,
    "description": description,
    # ... standard fields ...
    "category": project_meta.get("category", "General"),
    "difficulty": project_meta.get("difficulty", "Not specified"),
    "duration": project_meta.get("duration"),
    "status": project_meta.get("status", "ongoing")
}
```

---

## Security Best Practices

### Token Management

1. **Use repository secrets** - Never commit PATs to repository
2. **Limit scope** - Only grant `repo` scope (minimum required)
3. **Rotate regularly** - Regenerate tokens every 90 days
4. **Use different tokens** - Separate tokens for different integrations
5. **Monitor usage** - Check GitHub settings for token activity

### Access Control

1. **Private repositories** - Ensure PAT has access to private repos if needed
2. **Organization approval** - Get org admin to approve PAT for org repos
3. **Team access** - Grant workflow permissions to appropriate teams only

### Payload Validation

In portfolio update script:

```python
def validate_metadata(data):
    """Validate incoming metadata for security and correctness."""
    required_fields = ['title', 'description', 'url', 'author']
    
    # Check required fields
    for field in required_fields:
        if field not in data or not data[field]:
            raise ValueError(f"Missing required field: {field}")
    
    # Validate URL format
    if not data['url'].startswith(('http://', 'https://')):
        raise ValueError(f"Invalid URL format: {data['url']}")
    
    # Sanitize HTML in text fields
    from html import escape
    data['title'] = escape(data['title'])
    data['description'] = escape(data['description'])
    
    return data
```

### Audit Trail

Log all dispatch events in portfolio:

```yaml
- name: Log dispatch event
  run: |
    echo "$(date -Iseconds) | project-updated | ${{ github.event.client_payload.title }}" \
      >> .github/dispatch-log.txt
    git add .github/dispatch-log.txt
    git commit -m "Log: Project update event"
```

---

## Performance Considerations

### API Rate Limits

GitHub API rate limits for authenticated requests:

- **5,000 requests per hour** per token
- Repository dispatch counts as 1 request
- Typical usage: ~1-5 requests per day (very low)

**Best practices:**

- Don't dispatch on every commit (only on deployments)
- Implement exponential backoff for retries
- Monitor rate limit headers in responses

### Workflow Efficiency

**Optimize portfolio workflow:**

1. **Cache dependencies:**
   ```yaml
   - name: Cache npm packages
     uses: actions/cache@v4
     with:
       path: ~/.npm
       key: ${{ runner.os }}-npm-${{ hashFiles('package-lock.json') }}
   ```

2. **Conditional builds:**
   ```yaml
   - name: Build portfolio
     if: steps.update-gallery.outputs.changed == 'true'
     run: npm run build
   ```

3. **Parallel jobs:**
   ```yaml
   jobs:
     update-data:
       # Update gallery data
     
     notify-slack:
       needs: update-data
       # Send notification (doesn't block deployment)
     
     deploy:
       needs: update-data
       # Deploy portfolio
   ```

---

## Summary

The portfolio integration system provides:

✅ **Seamless automation** - Zero manual updates required  
✅ **Reliable communication** - Authenticated API calls with error handling  
✅ **Flexible metadata** - Extensible structure for custom fields  
✅ **Secure architecture** - Token-based auth with encrypted secrets  
✅ **Fast updates** - Portfolio syncs within seconds of deployment  
✅ **Scalable design** - Supports multiple projects and portfolios  

**Key Achievement:** Complete project lifecycle automation from book deployment to portfolio gallery update—one push to main branch updates everything automatically.
