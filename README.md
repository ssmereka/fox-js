# Fox 

Light-framework and boilerplate code to quickly build scalable web apps using JavaScript. The Node.js server is configured to handle authentication and CRUD operations on data models you create. It even has some basic ones already defined such as users. The Angular.js client is configured to communicate with the server's API and ready to be extended.

**Current Status:** In Development.

# Getting Started

0. [Install Node.js & NPM](https://github.com/ssmereka/foxjs/wiki/Getting-Started#installNode)
1. [Install dependencies](https://github.com/ssmereka/foxjs/wiki/Getting-Started#installDependencies): [Git](http://git-scm.com/), [Make](http://en.wikipedia.org/wiki/Make_(software)), and [G++](http://gcc.gnu.org/).

    **Ubuntu:**  `sudo apt-get install git make g++`

2. [Install Fox](https://github.com/ssmereka/foxjs/wiki/Getting-Started#installFox)

    `npm -g install foxjs`

3. Create and start a new project.

   `fox new "My Project Name"`
    
Your server is now started and you can start coding.  As you save changes the server will automatically restart!

# Documentation

All documentation can be found in the [wiki](https://github.com/ssmereka/foxjs/wiki).

<a name="cli" />
# Command Line Interface

You can control your server using the command line interface.  After fox is installed, you can type fox to show a list of commands.
```bash
info: Usage:  fox <command> <options>

info: Commands:
info:   new <name>               Create a new server with a specified name.
info:   start                    Start the server.
info:   stop                     Stop the server.
info:   restart                  Restart the server.
info:   reload                   Restart the server with zero downtime.
info:   clear                    Stop the server and clear all logs and history.
info:   logs                     Show server logs

info: Options:
info:   -v                       Enable verbose or debug mode.
info:   -n                       Start server using plain old node.js and local mode.
info:   -l                       Start in local environment mode.
info:   -d                       Start in development environment mode.
info:   -p                       Start in production environment mode.

info: Info:
info:   Author                   Scott Smereka
info:   Version                  0.1.0
```
[Back to Index](#cliIndex)


###[MIT License](http://www.tldrlegal.com/license/mit-license "MIT License")
