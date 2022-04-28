const path = require('path');
const fs = require('fs/promises');
const os = require('os');
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

  postPaths.sort().reverse();

  for (const postPath of postPaths) {
    const postFileContent = await fs.readFile(path.join(postsDirectoryPath, postPath), { encoding: 'utf8' });
    posts.push(postFromString(postFileContent));
  }

  return posts;
}

async function writePosts(posts) {
  for await (const post of posts) {
    const postHtml = await renderTemplate('post', { blogTitle, post });
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

function postFromString(string) {
  const markdownTokens = marked.marked.lexer(string);
  const titleToken = markdownTokens.find(x => x.type === 'heading');

  if (titleToken === undefined) {
    throw new Error('blimey this post dont got no title mate');
  }

  return {
    title: titleToken.text,
    path: snakeCase(titleToken.text),
    html: marked.marked.parser(markdownTokens), 
  }
}

module.exports = { snakeCase, postFromString };
