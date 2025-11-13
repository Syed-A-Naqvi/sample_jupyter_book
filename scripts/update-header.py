from datetime import datetime
import sys
import yaml

def extract_metadata() -> dict[str, str]:
    """Extract project metadata from config."""

    try:

        with open("_config.yml", "r") as f:
        
            config = yaml.safe_load(f)
            # Get basic info
            title = config.get("title", "No Title")
            description = config.get("description", "No Description")
            author = config.get("author", "No Author")
            # Get current date
            current_date = datetime.now().strftime("%d-%m-%Y")
            
            return {
                "title": title,
                "description": description,
                "author": author,
                "updated": current_date
            }
        
    except FileNotFoundError:

        print("Error: _config.yml not found")
        sys.exit(1)

    except yaml.YAMLError as e:

        print(f"Error parsing _config.yml: {e}")
        sys.exit(1)


def update_readme(metadata: dict[str, str]) -> None:
    """Update README.md with project metadata."""

    try:
        with open("README.md", "r") as f:
            # get all lines in the file
            lines = f.readlines()
            for line in lines:
                if line.strip() == "---":
                    break
                lines.remove(line)
            
            # Insert metadata at the top
            lines.insert(0, f"*Last Updated: {metadata['updated']}*\n\n")
            lines.insert(0, f"*Author: {metadata['author']}*\n\n")
            lines.insert(0, f"**{metadata['description']}**\n\n")
            lines.insert(0, f"# {metadata['title']}\n\n")
        
        # Write back to README.md
        with open("README.md", "w") as f:
            f.writelines(lines)
        
        print("README.md updated successfully.")

    except FileNotFoundError:
        print("Error: README.md not found")
        sys.exit(1)

if __name__ == "__main__":
    metadata = extract_metadata()
    update_readme(metadata)