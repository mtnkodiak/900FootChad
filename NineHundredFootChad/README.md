

# NineHundredFootChad



## Usage

Default setup is for canary Chad.  To run in production mode, on the 9FA server, use the following:

`$ export NODE_ENV=production
`
before running the app via node.js.

## Developing

Eventually, when the docker.io repo is made public, you will obtain the server code by using the following command:
`docker pull mtnkodiak/9fachad`

#### UNTIL THEN:
And until we handle secrets better... Obtain the contents of the config dir (config/default.json and config/production.json) from CJ.  These files contain bot tokens etc.

Grab the latest code from the branch you want:

`git clone --branch dockerize https://github.com/mtnkodiak/900FootChad.git`

Make sure you are in the directory `900FootChad/NineHundredFootChad`.

To run the docker implementation of this bot, use the following commands in this directory (top-level project dir):

`docker-compose down` //if currently running

`docker-compose -f ./docker-compose.dev.yml up chad` //dev

OR

`docker-compose up chad` //production

If you get an error like:

`Could not login!  Error: Error: Configuration property "Chad.discordApiToken" is not defined`

then you have not created the config dir and its Secret contents.  

The config files live in the config dir.  The `default.json` config file is meant for development.  The `production.json` overrides some of the settings in default.json to turn on production settings.


### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.
