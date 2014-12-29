mkdir node-webkit
rem Download node-webkit
bitsadmin /Transfer "Downloading node-webkit 0.8.6" http://dl.node-webkit.org/v0.8.6/node-webkit-v0.8.6-win-ia32.zip "%cd%\node-webkit\nw.zip"
rem Extract the files
build\7za.exe e node-webkit\nw.zip -onode-webkit
rem Delete the downloaded zip file
del node-webkit\nw.zip