#!/bin/bash

# Enable error handling
set -e

# Check if the script has already been run by looking for a flag file
if [ -f prepare.flag ]; then
    echo "This bash script has already been run."
    echo "To run script again remove the prepare.flag file."
    echo "Note: Script contains operation for deleting existing .git directory and initiating of a new one!"
    exit 0
fi

# Define the base path
basePath="src/main/resources/static"

# Define the subdirectories
subdirs=("css" "images" "js" "lib" "svg")

# Create directories if they do not exist
for dir in "${subdirs[@]}"; do
    fullPath="$basePath/$dir"
    if [ ! -d "$fullPath" ]; then
        mkdir -p "$fullPath"
        echo "Created directory: $fullPath"
    else
        echo "Directory already exists: $fullPath"
    fi
done

# Remove the existing .git directory
if [ -d ".git" ]; then
    rm -rf ".git"
    echo ".git directory removed"
fi

# Initialize a new git repository
git init
echo "prepare" >> .gitignore
echo "./prepare.*" >> .gitignore
git add .
git commit -m "Initial commit with necessary files and configurations."
echo "Initialized a new git repository and committed initial state."

# Run mvnw verify
./mvnw verify

# Create a flag file to indicate that the script has run
echo "prepare script already ran" > prepare.flag
echo "Flag file created. This script will not run again."