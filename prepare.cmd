@echo off
SETLOCAL EnableDelayedExpansion

REM Check if the script has already been run by looking for a flag file
if exist prepare.flag (
    echo This cmd script has already been run.
    echo To run script again remove the prepare.flag file.
    echo Note: Script contains operation for deleting existing .git directory and initiating of new one!
    exit /b
)

REM Define the base path
SET "basePath=src\main\resources\static"

REM Define the subdirectories
SET "subdirs=css images js lib svg"

REM Create directories if they do not exist
FOR %%d IN (%subdirs%) DO (
    SET "fullPath=%basePath%\%%d"
    IF NOT EXIST "!fullPath!" (
        mkdir "!fullPath!"
        echo Created directory: !fullPath!
    ) ELSE (
        echo Directory already exists: !fullPath!
    )
)

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

ENDLOCAL