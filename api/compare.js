// api/compare.js

const fetch = require('node-fetch');
const { diffLines } = require('diff');

module.exports = async (req, res) => {
  const { repo1, repo2 } = req.query;

  try {
    // Fetch files from repo1
    const files1 = await fetchFiles(repo1);

    // Fetch files from repo2
    const files2 = await fetchFiles(repo2);

    // Compare files and find differences
    const differences = compareFiles(files1, files2);

    // Send response with differences
    res.status(200).json({ differences });
  } catch (error) {
    console.error('Error fetching and comparing files:', error);
    res.status(500).json({ error: 'Failed to fetch and compare files' });
  }
};

async function fetchFiles(repo) {
  const baseUrl = `https://api.github.com/repos/${repo}/contents`;
  const response = await fetch(baseUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch files from ${repo}`);
  }
  const files = await response.json();
  return files;
}

function compareFiles(files1, files2) {
  const differences = [];

  // Compare files in repo1 with repo2
  for (const file1 of files1) {
    const found = files2.find(file2 => file2.name === file1.name);
    if (!found || found.sha !== file1.sha) {
      differences.push({
        name: file1.name,
        location: file1.path,
        repository: file1.repository.full_name
      });
    }
  }

  // Compare files in repo2 with repo1
  for (const file2 of files2) {
    const found = files1.find(file1 => file1.name === file2.name);
    if (!found || found.sha !== file2.sha) {
      differences.push({
        name: file2.name,
        location: file2.path,
        repository: file2.repository.full_name
      });
    }
  }

  return differences;
}
