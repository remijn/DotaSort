DotaSort
=========

You can download a prebuilt version of the application [Here](https://github.com/TheKillerremijn/DotaSort/raw/gui/prebuilt.zip)

##Usage
Extract the zip file, and run nw.exe, this will start the program.
at this point, you will have to log into steam, since the only elegant way to change item positions inside of Dota2 is by emulating a Dota client
This application does not in any way store, or distribute your password or any other personal information

##Building

###Windows
1. Run the `get-node-webkit.bat` File, this will download the required version of node-webkit, and place it in the right directories
2. Run `build-deps.bat`, this will download the nodejs modules needed to interface with the dota2 game servers, and will build them to be used with node-webkit
3. Run `build/build.bat` this will package the application together as a .exe, and place it in the build/win32 directory

Currently, because of a bug with node-webkit the application needs to be named nw.exe or it will fail to load some required files

###Linux
Linux is currently not officially supported right now, however there is nothing stopping the program from running on linux, you would just need to change the build mechanism
If anybody wants to work on this, i suggest having a look at [nw-gyp](https://github.com/rogerwang/nw-gyp) It is the program that compiles the nodejs modules for use with node-webkit

##Dependencies

- nodejs
- npm


- **Windows**
    - [Visual studio 2012 or later](http://www.visualstudio.com/products/visual-studio-community-vs)
    - [Python 2.7](https://www.python.org/downloads/)
    - [OpenSSL (x86) (not light)](http://slproweb.com/products/Win32OpenSSL.html)
    - [Visual C++ 2008 Redistributables (x86)](http://slproweb.com/products/Win32OpenSSL.html)

- **Linux**
    - Linux is currently not officially supported, however there is nothing stopping the program from running on linux, you would just need to change the build mechanism
