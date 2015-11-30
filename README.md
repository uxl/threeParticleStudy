# README for XMASS CARD

Yo Webapp scaffold with buildcontrol deploy to gh-pages

#### Third-Party Dependencies

*(HTML/CSS/JS/Images/etc)*

Third-party dependencies are managed with [grunt-wiredep](https://github.com/stephenplusplus/grunt-wiredep). Add new dependencies using **Bower** and then run the **Grunt** task to load them:

```sh
$ bower install --save jquery
$ grunt wiredep
```

## Development
1. `git clone git@github.com:uxl/xmasscard.git`
2. `bower install` will install dependencies.
3. `grunt server` will build and initiate watch along with Livereload

## Deployment
``` sh
$grunt build
$grunt deploy
```

#Build Tools

* Grunt
* Yeoman
* Yeoman Webapp-Generator
* Bower

##Contributing

Features and fixes should be submitted as a Pull Request. These will be reviewed and merged as they are ready.