rem Building things with nw-gyp requires a working install of python 2.7, a working c++ compiler (installing Visual Studio C++ 2012 for desktop will do)

set nw-version=0.8.6

call npm install nw-gyp -g

cd src
call npm install

rem rebuild the installed packages with nw-gyp to allow them to work with node-webkit

cd node_modules

cd dota2\node_modules\protobuf
call nw-gyp rebuild --target=%nw-version%

cd ..\..\..\steam\node_modules\protobuf
call nw-gyp rebuild --target=%nw-version%

cd ..\ref
call nw-gyp rebuild --target=%nw-version%

cd ..\ursa
call nw-gyp configure --target=%nw-version%
call nw-gyp build --target=%nw-version%
call node install.js

cd ../../..

cd ../../