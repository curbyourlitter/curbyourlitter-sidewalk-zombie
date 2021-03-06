#!/bin/bash

# Build and push to gh-pages
START_BRANCH=`git rev-parse --abbrev-ref HEAD`
PUBLISH_BRANCH=gh-pages
DEST_DIR=sidewalk-zombie-temp

npm install
gulp build
cd ..
rm -rf $DEST_DIR
git clone git@github.com:curbyourlitter/curbyourlitter-sidewalk-zombie.git $DEST_DIR
cd $DEST_DIR
git checkout $PUBLISH_BRANCH
rm -rf *
cp -r ../curbyourlitter-sidewalk-zombie/dist/* .
git add -A
git commit -am "Latest build"
git push origin $PUBLISH_BRANCH
