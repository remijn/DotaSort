rem zip all files without git to zip archive -2 compression methods - fast (-mx0) or strong (-mx9)
mkdir win32
7za.exe a -tzip win32\dotasort.nw ..\src\* -xr!?git\* -mx9
rem copy nw.pak from current build node-webkit to current (%~dp0) folder
copy ..\node-webkit\nw.pak win32\nw.pak
rem copy icudt.dll from current build node-webkit
copy ..\node-webkit\icudt.dll win32\icudt.dll
rem compilation to executable form
copy /b ..\node-webkit\nw.exe+win32\dotasort.nw win32\nw.exe
rem remove win32\dotasort.nw
del win32\dotasort.nw