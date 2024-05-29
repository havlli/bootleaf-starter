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

# Ask for user confirmation before proceeding
echo "Are you sure you want run this bash script? (Y/N)"
echo "Following operations will remove existing .git repository, reinitialize it and run ./mvnw verify!"
read -r -n 1 -p "Enter Y to continue or N to abort: " response
echo

case "$response" in
    [yY])
        # If user agrees, continue with the script
        echo "Proceeding with script..."
        ;;
    *)
        # Any other input means no, so exit the script
        echo "Script aborted by user."
        exit 0
        ;;
esac

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