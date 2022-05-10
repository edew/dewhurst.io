const path = require('path');
const fs = require('fs/promises');
const os = require('os');
const childProcess = require('child_process');
const hogan = require('hogan.js');
const marked = require('marked');

const buildDirectoryPath = path.join(__dirname, 'build');
const postsDirectoryPath = path.join(__dirname, 'posts');
const templateDirectoryPath = path.join(__dirname, 'templates');
const staticDirectoryPath = path.join(__dirname, 'static');
const blogTitle = 'Ed\'s Blog';

if (require.main === module) {
  build();
}

async function build() {
  try {
    await fs.rm(buildDirectoryPath, { recursive: true });
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e
    }
  } finally {
    await fs.mkdir(buildDirectoryPath);
  }

  const posts = await readPosts(postsDirectoryPath);
  await writePosts(posts);
  await writeIndex(posts);
  await copyStaticFiles();
}

async function readPosts(postsDirectoryPath) {
  const postPaths = await fs.readdir(postsDirectoryPath);
  const posts = [];

  for (const relativePostPath of postPaths) {
    const absolutePostPath = path.resolve(postsDirectoryPath, relativePostPath);
    const postFileContent = await fs.readFile(absolutePostPath, { encoding: 'utf8' });
    const isoDateString = await readMostRecentCommitDateForFile(absolutePostPath);
    console.log(absolutePostPath, isoDateString);
    posts.push(postFromString(postFileContent, isoDateString));
  }

  // newest first
  posts.sort((a, b) => b.timestamp - a.timestamp);

  return posts;
}

function readMostRecentCommitDateForFile(filePath) {
  return new Promise((resolve, reject) => {
    childProcess.exec(`git log --format="%aI" -n 1 master ${path.resolve(filePath)}`, (err, stdout) => {
      if (err) {
        reject(err);
      }
  
      resolve(stdout.split(os.EOL).filter(x => x !== '')[0]);
    });
  });
}

async function writePosts(posts) {
  const links = [
    { href: '/', text: 'All posts' },
  ];
  
  for await (const post of posts) {
    const data = { blogTitle, post, links };
    const postHtml = await renderTemplate('post', data);
    const postHtmlPath = path.join(buildDirectoryPath, post.path);
    await fs.mkdir(postHtmlPath);
    await fs.writeFile(path.join(postHtmlPath, 'index.html'), postHtml);
  }
}

async function writeIndex(posts) {
  const indexHtml = await renderTemplate('index', { blogTitle, posts });
  const indexHtmlPath = path.join(buildDirectoryPath, 'index.html');
  await fs.writeFile(indexHtmlPath, indexHtml);
}

async function copyStaticFiles() {
  const staticFilePaths = await fs.readdir(staticDirectoryPath);
  for (const staticFilePath of staticFilePaths) {
    const copyFromPath = path.join(staticDirectoryPath, staticFilePath);
    const copyToPath = path.join(buildDirectoryPath, staticFilePath);
    await fs.cp(copyFromPath, copyToPath);
  }
}

async function renderTemplate(template, data) {
  const templateFilePath = path.join(templateDirectoryPath, `${template}.mustache`);
  const templateFileContent = await fs.readFile(templateFilePath, { encoding: 'utf8' });
  const compiledTemplate = hogan.compile(templateFileContent);

  const layoutFilePath = path.join(templateDirectoryPath, 'layout.mustache');
  const layoutFileContent = await fs.readFile(layoutFilePath, { encoding: 'utf8' });
  const compiledLayoutTemplate = hogan.compile(layoutFileContent);

  return compiledLayoutTemplate.render(data, { body: compiledTemplate });
}

function snakeCase(string) {
  return string.replaceAll(/\s/g, '_').replaceAll(/\W/g, '').toLowerCase();
}

function postFromString(string, isoDateString) {
  const markdownTokens = marked.marked.lexer(string);
  const titleToken = markdownTokens.find(x => x.type === 'heading');

  if (titleToken === undefined) {
    throw new Error('blimey this post dont got no title mate');
  }

  const postDate = new Date(isoDateString);
  return {
    title: titleToken.text,
    path: snakeCase(titleToken.text),
    html: marked.marked.parser(markdownTokens),
    timestamp: postDate.getTime(),
    dateString: postDate.toLocaleString('en-GB', { month: 'long', year: 'numeric', day: 'numeric' }),
  }
}

module.exports = { snakeCase, postFromString };
