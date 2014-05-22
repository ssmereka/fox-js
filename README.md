# Fox JS 

Light-framework and boilerplate code to quickly build scalable web apps using javascript.  The backend is a standalone node server with authenticaiton, users, and anything else all API's need.  The frontend is a standalone angular framework already setup to communicate with the backend.

**Current Status:** In Development.

# Getting Started

1. Install fox-js

    `sudo npm -g install foxjs`

2. Create and start a new project.

   `fox new "My Project Name"`
    
Your server is now started and you can start coding.  As you save changes the server will automatically restart!

# Documentation

All documentation can be found in the [wiki](https://github.com/ssmereka/fox-js/wiki).

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




## [MIT License](http://www.tldrlegal.com/license/mit-license "MIT License")
