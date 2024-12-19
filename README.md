# GitHub Documentation Monitor Plugin

A TypingMind plugin that helps monitor and improve GitHub repository documentation quality.

## Overview

This plugin analyzes GitHub repository documentation, providing quality metrics and suggestions for improvement. It can:

- Analyze documentation structure and quality
- Suggest improvements for documentation
- Search through documentation for specific information

## Installation

1. Install the plugin in your TypingMind environment
2. Configure your GitHub Personal Access Token in the plugin settings
3. Start using the plugin in your conversations

## Usage

The plugin can be used in three ways:

1. **Analyze Documentation**:
   ```
   Can you analyze the documentation quality of owner/repo?
   ```

2. **Get Improvement Suggestions**:
   ```
   What improvements can be made to owner/repo documentation?
   ```

3. **Search Documentation**:
   ```
   Find documentation about "feature" in owner/repo
   ```

## Configuration

The plugin requires a GitHub Personal Access Token with `repo` scope access. You can create one at [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens).

## Features

- Documentation quality scoring
- README.md analysis
- Documentation structure evaluation
- Improvement suggestions
- Documentation search functionality

## Security

- Your GitHub token is stored securely and only used for API requests
- All API requests are made using official GitHub API endpoints
- No sensitive data is logged or stored

## Limitations

- Only public repositories can be analyzed unless the GitHub token has private repository access
- Analysis is limited to repository contents accessible via GitHub API
- Some documentation formats may not be fully analyzed

## Support

For issues or feature requests, please visit the [GitHub repository](https://github.com/hardspoon/typingmind-doc-monitor).
