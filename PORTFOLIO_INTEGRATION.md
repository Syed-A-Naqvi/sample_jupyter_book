# Portfolio Integration System

*Automated project synchronization using GitHub Repository Dispatch API*

---

## Overview

The template implements automatic portfolio synchronization using GitHub's Repository Dispatch API. When a Jupyter Book deploys, metadata is extracted from `_config.yml` and sent to a portfolio repository, triggering an automated gallery update.

---

## Architecture

### Communication Flow

```text
┌────────────────────────────────┐
│   Jupyter Book Repository      │
│  1. Push to main               │
│  2. Build & Deploy             │
│  3. Send repository dispatch ─────┐
└────────────────────────────────┘  │
                                    │
┌─────────────────────────────────┐ │
│   Portfolio Repository          │◄┘
│  4. Receive dispatch event      │
│  5. Update project gallery      │
│  6. Rebuild & deploy            │
└─────────────────────────────────┘
```

### Components

**Book Repository:**
- `_config.yml` - Project metadata source
- `scripts/send-metadata.py` - Metadata extraction and transmission
- `.github/workflows/deploy.yml` - Deployment orchestration

**GitHub API:**
- Endpoint: `POST /repos/{owner}/{repo}/dispatches`
- Authentication: Personal Access Token
- Event type: `project-updated`

**Portfolio Repository:**
- `.github/workflows/update-projects.yml` - Dispatch event listener
- `projects.json` - Project gallery data store

---

## Metadata Structure

### Source Configuration

Metadata is defined in `_config.yml`:

```yaml
title: "Data Science Project"
description: "Analysis of customer churn patterns"
author: "Jane Smith"
logo: "logo.png"

project_metadata:
  tags: ["machine learning", "python", "analytics"]
```

### Extracted Payload

The `send-metadata.py` script constructs this JSON payload:

```json
{
  "event_type": "project-updated",
  "client_payload": {
    "title": "Data Science Project",
    "description": "Analysis of customer churn patterns",
    "author": "Jane Smith",
    "tags": ["machine learning", "python", "analytics"],
    "url": "https://user.github.io/repo/",
    "logo_path": "https://user.github.io/repo/_static/logo.png",
    "updated": "2025-11-13"
  }
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `event_type` | string | Dispatch event identifier |
| `title` | string | Project title from `_config.yml` |
| `description` | string | Project description |
| `author` | string | Project author name |
| `tags` | array | Project keywords |
| `url` | string | Full URL to deployed book |
| `logo_path` | string | Full URL to logo image |
| `updated` | string | Deployment date (YYYY-MM-DD) |

**Note:** Both `url` and `logo_path` must be absolute URLs constructed from the deployment URL.

---

## GitHub Repository Dispatch

### Overview

Repository Dispatch allows external systems to trigger workflows via authenticated API calls. It's designed for cross-repository automation.

### API Endpoint

```text
POST https://api.github.com/repos/{owner}/{repo}/dispatches
```

Parameters:
- `{owner}` - Repository owner (username or organization)
- `{repo}` - Repository name

### Authentication

Requires Personal Access Token in Authorization header:

```http
POST /repos/owner/portfolio/dispatches
Host: api.github.com
Authorization: Bearer ghp_xxxxxxxxxxxxxxxxxxxx
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2022-11-28
Content-Type: application/json
```

Required PAT permissions:
- `repo` scope - Full control of repositories

### Request Payload

```json
{
  "event_type": "project-updated",
  "client_payload": {
    "title": "Project Title",
    "description": "Project description",
    "url": "https://user.github.io/project/",
    "logo_path": "https://user.github.io/project/_static/logo.png"
  }
}
```

Constraints:
- `event_type` - Required, max 100 characters
- `client_payload` - Optional, max 65,535 characters

### Response Codes

| Code | Meaning |
|------|---------|
| 204 | Success - Workflow triggered |
| 401 | Unauthorized - Invalid PAT |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Repository doesn't exist |
| 422 | Unprocessable - Invalid payload |

### Example API Call

**Python:**

```python
import json
from urllib import request

def send_dispatch(repo, token, metadata):
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
        return response.status == 204
```

**curl:**

```bash
curl -X POST \
  https://api.github.com/repos/owner/portfolio/dispatches \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ghp_xxxxxxxxxxxxxxxxxxxx" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d '{"event_type": "project-updated", "client_payload": {...}}'
```

---

## Portfolio Repository Setup

### Prerequisites

The portfolio repository must have:
1. GitHub Actions enabled
2. A workflow listening for `repository_dispatch` events
3. A system for storing and rendering project data

### Required Workflow

Create `.github/workflows/update-projects.yml`:

```yaml
name: Update Project Gallery

on:
  repository_dispatch:
    types: [project-updated]

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  update-gallery:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v5
      
      - name: Set up Python
        uses: actions/setup-python@v6
        with:
          python-version: '3.11'
      
      - name: Update gallery
        run: |
          python scripts/update-gallery.py \
            --title "${{ github.event.client_payload.title }}" \
            --url "${{ github.event.client_payload.url }}" \
            --logo "${{ github.event.client_payload.logo_path }}" \
            --tags "${{ join(github.event.client_payload.tags, ',') }}"
      
      - name: Commit changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add .
          git diff --quiet && git diff --staged --quiet || \
            git commit -m "Update: ${{ github.event.client_payload.title }}"
          git push
      
      - name: Deploy
        uses: actions/deploy-pages@v4
```

### Accessing Event Data

Access metadata via `github.event.client_payload`:

| Expression | Value |
|------------|-------|
| `${{ github.event.action }}` | `"project-updated"` |
| `${{ github.event.client_payload.title }}` | Project title |
| `${{ github.event.client_payload.url }}` | Project URL |
| `${{ github.event.client_payload.tags }}` | Array of tags |

### Data Store Example

`projects.json`:

```json
{
  "projects": [
    {
      "title": "Customer Churn Analysis",
      "description": "ML analysis of churn patterns",
      "url": "https://user.github.io/churn-analysis/",
      "logo": "https://user.github.io/churn-analysis/_static/logo.png",
      "tags": ["machine learning", "python"],
      "updated": "2025-11-13"
    }
  ]
}
```

### Update Script Example

`scripts/update-gallery.py`:

```python
#!/usr/bin/env python3
import json
import argparse

def load_projects(path='projects.json'):
    try:
        with open(path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"projects": []}

def save_projects(data, path='projects.json'):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

def update_project(projects, new_project):
    # Update existing or add new
    for i, project in enumerate(projects['projects']):
        if project['url'] == new_project['url']:
            projects['projects'][i] = new_project
            return projects
    
    projects['projects'].append(new_project)
    projects['projects'].sort(key=lambda x: x['updated'], reverse=True)
    return projects

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--title', required=True)
    parser.add_argument('--url', required=True)
    parser.add_argument('--logo', required=True)
    parser.add_argument('--tags', required=True)
    args = parser.parse_args()
    
    new_project = {
        'title': args.title,
        'url': args.url,
        'logo': args.logo,
        'tags': [t.strip() for t in args.tags.split(',')],
        'updated': '2025-11-13'
    }
    
    projects = load_projects()
    projects = update_project(projects, new_project)
    save_projects(projects)

if __name__ == '__main__':
    main()
```

---

## Configuration (Book Repository)

### Step 1: Create Personal Access Token

1. Navigate to: Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Configure:
   - **Note**: `Portfolio Integration Token`
   - **Expiration**: 90 days or 1 year
   - **Scopes**: ✅ `repo`
4. Generate and copy token (format: `ghp_xxxx...`)

### Step 2: Add Repository Secret

1. Navigate to book repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add secret:
   - **Name**: `PORTFOLIO_PAT`
   - **Secret**: Paste Personal Access Token

### Step 3: Add Repository Variable

1. In Settings → Secrets and variables → Actions, click "Variables" tab
2. Click "New repository variable"
3. Add variable:
   - **Name**: `PORTFOLIO_REPO`
   - **Value**: `owner/repository-name` (e.g., `jane-smith/portfolio`)

### Step 4: Verify Workflow

Ensure `.github/workflows/deploy.yml` includes:

```yaml
notify-portfolio:
  runs-on: ubuntu-latest
  needs: deploy
  
  steps:
    - name: Checkout
      uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v6
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: pip install -r scripts/script_requirements.txt
    
    - name: Send metadata
      env:
        PORTFOLIO_REPO: ${{ vars.PORTFOLIO_REPO }}
        PORTFOLIO_PAT: ${{ secrets.PORTFOLIO_PAT }}
      run: python scripts/send-metadata.py ${{ needs.deploy.outputs.page_url }}
```

---

## Troubleshooting

### Common Errors

**"PORTFOLIO_PAT environment variable not set"**
- Verify secret exists in Settings → Secrets and variables → Actions
- Ensure secret name is exactly `PORTFOLIO_PAT`

**"404 Not Found" when sending dispatch**
- Verify `PORTFOLIO_REPO` format is `owner/repo` (no URL, no `.git`)
- Confirm portfolio repository exists
- For private repos, ensure PAT has `repo` scope

**"403 Forbidden" when sending dispatch**
- PAT may be expired or revoked
- Regenerate token and update secret
- For org repos, authorize PAT for organization

**Dispatch sent but workflow doesn't trigger**
- Verify `.github/workflows/update-projects.yml` exists in portfolio
- Confirm event type matches: `types: [project-updated]`
- Check Actions are enabled in portfolio Settings

---

## Security Best Practices

### Token Management
- Never commit PATs to repository
- Use repository secrets for storage
- Rotate tokens every 90 days
- Use separate tokens for different integrations
- Monitor token usage in GitHub settings

### Payload Validation

In portfolio update script:

```python
def validate_metadata(data):
    required = ['title', 'url', 'logo']
    for field in required:
        if field not in data:
            raise ValueError(f"Missing: {field}")
    
    if not data['url'].startswith('https://'):
        raise ValueError(f"Invalid URL: {data['url']}")
    
    from html import escape
    data['title'] = escape(data['title'])
    return data
```

---

## Summary

The portfolio integration system provides automated project synchronization from book deployment to portfolio gallery update. Key components:

- **Book Repository**: Extracts metadata and sends dispatch
- **GitHub API**: Routes authenticated requests to portfolio
- **Portfolio Repository**: Updates gallery and redeploys

Total sync time: 5-10 minutes from push to live portfolio update.
