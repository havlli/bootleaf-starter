@echo off
SETLOCAL EnableDelayedExpansion

REM Check if the script has already been run by looking for a flag file
if exist prepare.flag (
    echo This cmd script has already been run.
    echo To run script again remove the prepare.flag file.
    echo Note: Script contains operation for deleting existing .git directory and initiating of new one!
    exit /b
)

REM Prompt for confirmation before proceeding
echo Are you sure you want run this command line script? (Y/N)
echo Following operations will remove existing .git repository, reinitialize it and run ./mvnw verify!
set /p UserInput=Type Y to continue, or N to exit:
if /I "%UserInput%" neq "Y" goto end_script
echo

REM Remove the existing .git directory
if exist ".git" (
    rmdir /s /q ".git"
    echo .git directory removed
)

REM Initialize a new git repository
git init
echo prepare >> .gitignore
echo prepare.* >> .gitignore
git add .
echo Initialized a new git repository.
git commit -m "Initial commit with necessary files and configurations."
echo Commited initial state.

REM Run mvnw verify
call ./mvnw verify

REM Create a flag file to indicate that the script has run
echo prepare script already ran > prepare.flag
echo Flag file created. This script will not run again.

:end_script
ENDLOCAL