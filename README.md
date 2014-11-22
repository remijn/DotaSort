###Building DotaSort

#Dependencies

- [NodeJS and NPM](http://nodejs.org/)

- Linux
  - Nothing!
- Windows 8
  - One of the later versions of visual studio, you can get the Express version [here](http://www.visualstudio.com/products/visual-studio-community-vs)
  - Visual c++ 2008 Redistributable files [x64](http://www.microsoft.com/en-us/download/details.aspx?id=15336) [x86](http://www.microsoft.com/en-us/download/details.aspx?id=29)
  - [OpenSSL](http://slproweb.com/products/Win32OpenSSL.html) (has to be the same architecture as your NodeJS, x86 node and x64 openssl do not work together)


#Usage

First, we must build DotaSort, open run the following commands in the projects root directory

To fetch and build the dependencies:
```
npm install
```

Then, we can configure the user settings, we do this by editing config.js
Edit config.steam_user to your Steam username, this is the username you use to log into steam, not the one people see on your profile
Then Set config.steam_pass to your Steam password, this is required because the app emulates a dota client, and this cannot be done without logging into steam first, hence, the password requirement

if you want, you can set config.rowSpace to space the rows differently, this changes the spacing between rows in the sorted inventory

Run the application by using the following command,
```
node dotasort
```

The first time you run the application, you might get a Error: Logon fail: 64, this is because steam requires a Steam guard code to log in with a new application. You will recieve a email from steam containg the steam guard code
Enter this code in the config.steam_guard_code section.
When you now run the application, it should start up just fine, and sort your items.
In the end, it will List all the items sorted, including their new position in your inventory and send it to the Game Coordinator

When the Game Coordinator is done setting the item positions, a message will pop up saying Dota2 fromGC: 570, 26
This will indicate that the item positions have been set.