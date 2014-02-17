# Fox JS [![Build Status](https://secure.travis-ci.org/ssmereka/fox-js.png)](http://travis-ci.org/ssmereka/fox-js)

Light-framework and boilerplate code to quickly build scalable web apps using javascript.  The backend is a standalone node server with authenticaiton, users, and anything else all API's need.  The frontend is a standalone angular framework already setup to communicate with the backend.

## Getting Started

1. Install fox-js

    sudo npm -g install foxjs

2. Create a new project

    fox new "My Project Name"

3. Start the server and start coding!  No need to restart the server, changes will be live after saving a file.

    fox start

Restart the server with zero downtime.

	fox reload

## Configuration




### Libraries

* [send](#send)

<a name="each" />
### send

Send a response, error, and/or anything else you might want to a requestor.  The send library handles formatting responses so they can be reliablely parsed.  In addition helper methods are provided for sending other things, such as emails.

__send__





## [MIT License](http://www.tldrlegal.com/license/mit-license "MIT License")