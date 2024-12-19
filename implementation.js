// Import required dependencies
import { Octokit } from '@octokit/rest';
import { marked } from 'marked';

/**
 * Analyzes GitHub repository documentation and provides suggestions for improvement.
 * @param {Object} params - The parameters for the function
 * @param {string} params.owner - GitHub repository owner
 * @param {string} params.repo - GitHub repository name
 * @param {string} params.action - Action to perform: analyze, suggest, or search
 * @param {string} [params.query] - Search query when action is 'search'
 * @param {Object} userSettings - User settings containing GitHub token
 * @param {string} userSettings.githubToken - GitHub Personal Access Token
 * @returns {Promise<Object>} Analysis results or suggestions
 */
async function analyze_github_documentation(params, userSettings) {
  const { owner, repo, action, query } = params;
  const { githubToken } = userSettings;

  if (!githubToken) {
    throw new Error('GitHub token is required');
  }

  try {
    const octokit = new Octokit({ auth: githubToken });

    switch (action) {
      case 'analyze':
        return await analyzeDocumentation(octokit, owner, repo);
      case 'suggest':
        return await suggestImprovements(octokit, owner, repo);
      case 'search':
        if (!query) {
          throw new Error('Search query is required for search action');
        }
        return await findRelatedDocs(octokit, owner, repo, query);
      default:
        throw new Error('Invalid action specified');
    }
  } catch (error) {
    throw new Error(`Failed to analyze documentation: ${error.message}`);
  }
}

/**
 * Analyzes documentation structure of a repository
 * @param {Octokit} octokit - GitHub API client
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Documentation analysis results
 */
async function analyzeDocumentation(octokit, owner, repo) {
  const { data: repoContent } = await octokit.repos.getContent({
    owner,
    repo,
    path: ''
  });

  const structure = {
    overallScore: 0,
    issues: []
  };

  // Analyze README
  const readme = repoContent.find(file => file.name.toLowerCase() === 'readme.md');
  if (readme) {
    structure.readme = await analyzeReadme(readme);
  } else {
    structure.issues.push({
      severity: 'high',
      description: 'Missing README.md file',
      suggestion: 'Create a README.md file with project description and setup instructions'
    });
  }

  // Calculate overall score
  structure.overallScore = calculateOverallScore(structure);

  return structure;
}

/**
 * Analyzes README file content
 * @param {Object} readme - README file content from GitHub API
 * @returns {Promise<Object>} README analysis results
 */
async function analyzeReadme(readme) {
  const content = Buffer.from(readme.content, 'base64').toString();
  const tokens = marked.lexer(content);
  
  return {
    exists: true,
    quality: assessMarkdownQuality(tokens),
    suggestions: generateReadmeSuggestions(tokens)
  };
}

/**
 * Assesses markdown content quality
 * @param {Array} tokens - Marked lexer tokens
 * @returns {number} Quality score (0-100)
 */
function assessMarkdownQuality(tokens) {
  let score = 0;
  
  if (hasSection(tokens, 'description')) score += 20;
  if (hasSection(tokens, 'installation')) score += 20;
  if (hasSection(tokens, 'usage')) score += 20;
  if (hasSection(tokens, 'contributing')) score += 20;
  if (hasCodeExamples(tokens)) score += 20;

  return score;
}

/**
 * Checks if markdown content has a specific section
 * @param {Array} tokens - Marked lexer tokens
 * @param {string} sectionName - Section name to look for
 * @returns {boolean} Whether section exists
 */
function hasSection(tokens, sectionName) {
  return tokens.some(token => 
    token.type === 'heading' && 
    token.text.toLowerCase().includes(sectionName)
  );
}

/**
 * Checks if markdown content has code examples
 * @param {Array} tokens - Marked lexer tokens
 * @returns {boolean} Whether code examples exist
 */
function hasCodeExamples(tokens) {
  return tokens.some(token => token.type === 'code');
}

/**
 * Generates suggestions for documentation improvement
 * @param {Array} tokens - Marked lexer tokens
 * @returns {Array<string>} List of suggestions
 */
function generateReadmeSuggestions(tokens) {
  const suggestions = [];

  if (!hasSection(tokens, 'description')) {
    suggestions.push('Add a project description section');
  }
  if (!hasSection(tokens, 'installation')) {
    suggestions.push('Add installation instructions');
  }
  if (!hasSection(tokens, 'usage')) {
    suggestions.push('Add usage examples');
  }
  if (!hasCodeExamples(tokens)) {
    suggestions.push('Include code examples');
  }

  return suggestions;
}

/**
 * Calculates overall documentation quality score
 * @param {Object} structure - Documentation structure
 * @returns {number} Overall quality score (0-100)
 */
function calculateOverallScore(structure) {
  let score = 0;
  let weight = 0;

  if (structure.readme) {
    score += structure.readme.quality * 0.6;
    weight += 0.6;
  }

  return weight > 0 ? score / weight : 0;
}

/**
 * Suggests improvements for documentation structure
 * @param {Octokit} octokit - GitHub API client
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Array<string>>} List of suggestions for improvement
 */
async function suggestImprovements(octokit, owner, repo) {
  const structure = await analyzeDocumentation(octokit, owner, repo);
  const suggestions = [];

  if (!structure.readme) {
    suggestions.push('Add a comprehensive README.md file');
  } else if (structure.readme.quality < 60) {
    suggestions.push('Improve README.md content quality');
  }

  structure.issues.forEach(issue => {
    if (issue.severity === 'high') {
      suggestions.push(issue.suggestion);
    }
  });

  return suggestions;
}

/**
 * Finds related documentation and context
 * @param {Octokit} octokit - GitHub API client
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} query - Search query
 * @returns {Promise<Array>} Related documentation and context
 */
async function findRelatedDocs(octokit, owner, repo, query) {
  const { data: searchResults } = await octokit.search.code({
    q: `${query} repo:${owner}/${repo}`,
    per_page: 10
  });

  return searchResults.items.map(item => ({
    path: item.path,
    url: item.html_url,
    score: item.score,
    context: item.text_matches?.[0]?.fragment || ''
  }));
}
