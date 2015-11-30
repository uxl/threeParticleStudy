# README for XMASS CARD

Yo Webapp scaffold with buildcontrol deploy to gh-pages

## Third-Party Dependencies

*(HTML/CSS/JS/Images/etc)*

Third-party dependencies are managed with [grunt-wiredep](https://github.com/stephenplusplus/grunt-wiredep). Add new dependencies using **Bower** and then run the **Grunt** task to load them:

#####install node and npm - recipe is no SUDO version of node
1. ```
brew install node --without-npm
mkdir "${HOME}/.npm-packages"
echo NPM_PACKAGES="${HOME}/.npm-packages" >> ${HOME}/.bashrc
echo prefix=${HOME}/.npm-packages >> ${HOME}/.npmrc
curl -L https://www.npmjs.org/install.sh | sh
echo NODE_PATH=\"\$NPM_PACKAGES/lib/node_modules:\$NODE_PATH\" >> ${HOME}/.bashrc
echo PATH=\"\$NPM_PACKAGES/bin:\$PATH\" >> ${HOME}/.bashrc
echo source "~/.bashrc" >> ${HOME}/.bash_profile
source ~/.bashrc
```
2. `npm install -g bower` install bower
3. `npm install -g grunt-cli` install grunt command line ( might need sudo )

## Development
1. `git clone git@github.com:uxl/xmasscard.git`
2. 'cd xmasscard'
3. `bower install` will install dependencies
4. `npm install` will install grunt and node modules
5. `grunt server` will build and initiate watch along with Livereload

## Deployment
``` sh
grunt build
grunt deploy
```

#Build Tools

* Grunt
* Yeoman
* Yeoman Webapp-Generator
* Bower

##Contributing

Features and fixes should be submitted as a Pull Request. These will be reviewed and merged as they are ready.

