@echo off
setlocal enabledelayedexpansion

:: ANSI Color Codes
set "ESC=["
set "INFO=%ESC%94mINFO%ESC%0m"
set "ERROR=%ESC%31mERROR%ESC%0m"
set "WARN=%ESC%33mWARNING%ESC%0m"
set "SUCCESS=%ESC%32mSUCCESS%ESC%0m"

:: Header
echo [%INFO%] ------------------------[ %ESC%94mConfigure project%ESC%0m ]-------------------------
echo [%INFO%]
echo [%INFO%] Following operations will change file structure, update pom.xml, remove
echo [%INFO%] existing .git repository, reinitialize it and run ./mvnw verify!
echo [%INFO%]

:: Prompt for new project details
echo [%INFO%] --- %ESC%32mEnter project metadata%ESC%0m ---
echo [%INFO%]
echo [%INFO%] %ESC%33mSubmitting empty input defaults to value in brackets...%ESC%0m
echo [%INFO%]
set /p groupId="[%INFO%] Enter Group ID [%ESC%33mcom.yourcompany%ESC%0m]: "
if "!groupId!"=="" set groupId=com.yourcompany

set /p artifactId="[%INFO%] Enter Artifact ID [%ESC%33mexample%ESC%0m]: "
if "!artifactId!"=="" set artifactId=example

set /p version="[%INFO%] Enter Version [%ESC%33m0.0.1-SNAPSHOT%ESC%0m]: "
if "!version!"=="" set version=0.0.1-SNAPSHOT

set /p projectName="[%INFO%] Enter Project Name [%ESC%33mExample Project%ESC%0m]: "
if "!projectName!"=="" set projectName=Example Project

:: Prompt for confirmation before proceeding
echo [%INFO%]
echo [%INFO%]   %ESC%33mGroup ID:%ESC%0m        !groupId!
echo [%INFO%]   %ESC%33mArtifact ID:%ESC%0m     !artifactId!
echo [%INFO%]   Version:         !version!
echo [%INFO%]   Project Name:    !projectName!
echo [%INFO%]
set /p UserInput="[%INFO%] %ESC%94mType Y to confirm, or N to exit: %ESC%0m"
if /I "%UserInput%" neq "Y" goto end_script

:: Update pom.xml
echo [%INFO%]
echo [%INFO%] --- %ESC%32mInitialize project files and directories%ESC%0m ---
echo [%INFO%]
echo [%INFO%] Updating pom.xml and run configuration...
echo [%INFO%]
powershell -Command "$xml = [xml](Get-Content pom.xml); if($xml.project.groupId) { $xml.project.groupId = '%groupId%'; }; if($xml.project.artifactId) { $xml.project.artifactId = '%artifactId%'; }; if($xml.project.version) { $xml.project.version = '%version%'; }; if($xml.project.name) { $xml.project.name = '%projectName%'; }; $xml.Save('pom.xml')"
if %ERRORLEVEL% neq 0 (
    echo [%ERROR%] Failed to update pom.xml
    goto end_script
)

:: Update run configuration
powershell -Command "(Get-Content '.run\Application.run.xml') -replace 'com.github.havlli.bootleafstarter', '%groupId%.%artifactId%' -replace 'bootleaf-starter', '%artifactId%' | Set-Content '.run\Application.run.xml'"
if %ERRORLEVEL% neq 0 (
    echo [%ERROR%] Failed to update run configuration
    goto end_script
)

:: Rename source directories
echo [%INFO%] Initializing source directories and files...
set "oldPackagePath=src\main\java\com\github\havlli\bootleafstarter"
set "newPackagePath=src\main\java\%groupId:\=\\%\%artifactId%"

if not exist "%newPackagePath%" mkdir "%newPackagePath%"
xcopy /E /H /C /I "%oldPackagePath%\*" "%newPackagePath%\" >nul 2>&1
if errorlevel 1 (
    echo [%ERROR%] Error during initialization of source files
    goto end_script
) else (
    rd /s /q "%oldPackagePath%"
    for %%d in ("%oldPackagePath%\..", "%oldPackagePath%\..\..", "%oldPackagePath%\..\..\..") do (
        dir "%%d" | find "File(s)" >nul && rd "%%d"
    )
    echo [%INFO%] Source files successfully initialized
)

:: Rename test directories
echo [%INFO%]
echo [%INFO%] Initializing test directories and files...
set "oldTestPackagePath=src\test\java\com\github\havlli\bootleafstarter"
set "newTestPackagePath=src\test\java\%groupId:\=\\%\%artifactId%"

if not exist "%newTestPackagePath%" mkdir "%newTestPackagePath%"
xcopy /E /H /C /I "%oldTestPackagePath%\*" "%newTestPackagePath%\" >nul 2>&1
if errorlevel 1 (
    echo [%ERROR%] Error during initialization of test files
    goto end_script
) else (
    rd /s /q "%oldTestPackagePath%"
    for %%d in ("%oldTestPackagePath%\..", "%oldTestPackagePath%\..\..", "%oldTestPackagePath%\..\..\..") do (
        dir "%%d" | find "File(s)" >nul && rd "%%d"
    )
    echo [%INFO%] Test files successfully initialized
)

:: Update package in Java files
for /R src %%f in (*.java) do (
    powershell -Command "(Get-Content '%%f') -replace 'com.github.havlli.bootleafstarter', '%groupId%.%artifactId%' | Set-Content '%%f'"
)

echo [%INFO%]
echo [%INFO%] --- %ESC%32mInitialize .git repository%ESC%0m ---
echo [%INFO%]
:: Remove the existing .git directory
if exist ".git" (
    rmdir /s /q ".git"
    echo [%INFO%] Cloned .git directory removed
)

:: Initialize a new git repository
git init >nul 2>&1
if errorlevel 1 (
    echo [%ERROR%] Failed to initialize new .git repository
) else (
    echo [%INFO%] Initialized empty .git repository
)

echo [%INFO%]
echo [%INFO%] --- %ESC%32mStage files then commit%ESC%0m ---
echo [%INFO%]
:: Add script files to .gitignore
echo prepare >> .gitignore
echo prepare.* >> .gitignore

:: Stage files
git add . >nul 2>&1
if errorlevel 1 (
    echo [%ERROR%] Failed to stage files!
) else (
    echo [%INFO%] Files staged successfully!
)

:: Commit initial staged files
git commit -m "Initial commit with necessary files and configurations." >nul 2>&1
if errorlevel 1 (
    echo [%ERROR%] Commit failed!
) else (
    echo [%INFO%] Commited initial state
)

:: Run mvnw verify
echo [%INFO%]
echo [%INFO%] --- %ESC%32mDelegate to Maven wrapper%ESC%0m ---
echo [%INFO%]
call ./mvnw verify

:: Assuming all went well, delete the scripts to prevent rerun
echo [%INFO%]
echo [%INFO%] --- %ESC%32mFinalize setup and clean up%ESC%0m ---
echo [%INFO%]
echo [%INFO%] Deleting initialization scripts...
del "prepare.sh"
del "prepare"
echo [%INFO%]
echo [%SUCCESS%] %ESC%32mProject configured successfully!%ESC%0m
start /b "" cmd /c del "%~f0" & exit /b
:end_script
endlocal
