#!/usr/bin/env bash

set -e -o pipefail

if [[ -z "${GITHUB_OAUTH_TOKEN}" ]]; then
  echo "Stopping because GITHUB_OAUTH_TOKEN might not be set"
  exit 1
fi

if [[ -z "${USER_NAME}" ]]; then
  echo "Stopping because USER_NAME might not be set"
  exit 1
fi

if [[ -z "${USER_EMAIL}" ]]; then
  echo "Stopping because USER_EMAIL might not be set"
  exit 1
fi

git fetch origin
MASTER_HEAD_HASH=$(git show-ref --heads --hash master)
git checkout gh-pages
find . -mindepth 1 -maxdepth 1 -not \( -name build -o -name ".git" \) -exec rm -rf {} \;
cp -r build/* .
rm -rf build
git config user.name "$USER_NAME"
git config user.email "$USER_EMAIL"
git add .
git commit -m "Update gh-pages branch from $MASTER_HEAD_HASH"
git push origin
