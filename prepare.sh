#!/bin/bash

# Enable error handling
set -e

# ANSI Color Codes
ESC=$(echo -e "\033")
INFO="${ESC}[94mINFO${ESC}[0m"
ERROR="${ESC}[31mERROR${ESC}[0m"
WARN="${ESC}[33mWARNING${ESC}[0m"
SUCCESS="${ESC}[32mSUCCESS${ESC}[0m"

# Header
echo -e "[${INFO}] ------------------------[ ${ESC}[94mConfigure project${ESC}[0m ]-------------------------"
echo -e "[${INFO}]"
echo -e "[${INFO}] Following operations will change file structure, update pom.xml, remove"
echo -e "[${INFO}] existing .git repository, reinitialize it and run ./mvnw verify!"
echo -e "[${INFO}]"

# Prompt for new project details
echo -e "[${INFO}] --- ${ESC}[32mEnter project metadata${ESC}[0m ---"
echo -e "[${INFO}]"
echo -e "[${INFO}] ${ESC}[33mSubmitting empty input defaults to value in brackets...${ESC}[0m"
echo -e "[${INFO}]"
read -p "[${INFO}] Enter Group ID [${ESC}[33mcom.yourcompany${ESC}[0m]: " groupId
groupId=${groupId:-com.yourcompany}

read -p "[${INFO}] Enter Artifact ID [${ESC}[33mexample${ESC}[0m]: " artifactId
artifactId=${artifactId:-example}

read -p "[${INFO}] Enter Version [${ESC}[33m0.0.1-SNAPSHOT${ESC}[0m]: " version
version=${version:-0.0.1-SNAPSHOT}

read -p "[${INFO}] Enter Project Name [${ESC}[33mExample Project${ESC}[0m]: " projectName
projectName=${projectName:-Example Project}

# Prompt for confirmation before proceeding
echo -e "[${INFO}]"
echo -e "[${INFO}]   ${ESC}[33mGroup ID:${ESC}[0m        $groupId"
echo -e "[${INFO}]   ${ESC}[33mArtifact ID:${ESC}[0m     $artifactId"
echo -e "[${INFO}]   Version:         $version"
echo -e "[${INFO}]   Project Name:    $projectName"
echo -e "[${INFO}]"
read -p "[${INFO}] ${ESC}[94mType Y to confirm, or N to exit: ${ESC}[0m" userInput
if [[ "${userInput,,}" != "y" ]]; then
    exit 0
fi

# Update pom.xml
echo -e "[${INFO}]"
echo -e "[${INFO}] Updating pom.xml and run configuration..."
echo -e "[${INFO}]"

sed -i "s|<groupId>com.github.havlli</groupId>|<groupId>${groupId}</groupId>|g; \
        s|<artifactId>bootleaf-starter</artifactId>|<artifactId>${artifactId}</artifactId>|g; \
        s|<version>0.0.1-SNAPSHOT</version>|<version>${version}</version>|g; \
        s|<name>BootLeaf Starter</name>|<name>${projectName}</name>|g" pom.xml

if [ $? -ne 0 ]; then
    echo -e "[${ERROR}] Failed to update pom.xml"
    exit 1
fi

# Update run configuration
sed -i "s/com.github.havlli.bootleafstarter/${groupId}.${artifactId}/g; s/bootleaf-starter/${artifactId}/g" .run/Application.run.xml
if [ $? -ne 0 ]; then
    echo -e "[${ERROR}] Failed to update run configuration"
    exit 1
fi

# Rename source directories
echo -e "[${INFO}] Initializing source directories and files..."
oldPackagePath="src/main/java/com/github/havlli/bootleafstarter"
newPackagePath="src/main/java/${groupId//.//}/${artifactId}"

mkdir -p "$newPackagePath"
cp -r "$oldPackagePath/"* "$newPackagePath/"
if [ $? -ne 0 ]; then
    echo -e "[${ERROR}] Error during initialization of source files"
    exit 1
fi

rm -rf "$oldPackagePath"
find "src/main/java/com" -type d -empty -delete

echo -e "[${INFO}] Source files successfully initialized"

# Remove old test directories
echo -e "[${INFO}]"
echo -e "[${INFO}] Initializing test directories and files..."
oldTestPackagePath="src/test/java/com/github/havlli/bootleafstarter"
newTestPackagePath="src/test/java/${groupId//.//}/${artifactId}"

mkdir -p "$newTestPackagePath"
cp -r "$oldTestPackagePath/"* "$newTestPackagePath/"
if [ $? -ne 0 ]; then
    echo -e "[${ERROR}] Error during initialization of test files"
    exit 1
fi

rm -rf "$oldTestPackagePath"
find "src/test/java/com" -type d -empty -delete

echo -e "[${INFO}] Test files successfully initialized"

# Remove the existing .git directory
echo -e "[${INFO}]"
echo -e "[${INFO}] --- ${ESC}[32mInitializing .git repository${ESC}[0m ---"
echo -e "[${INFO}]"
if [ -d ".git" ]; then
    rm -rf ".git"
    echo -e "[${INFO}] Cloned .git directory removed"
fi

# Initialize a new git repository
git init &>/dev/null
if [ $? -ne 0 ]; then
    echo -e "[${ERROR}] Failed to initialize new .git repository"
else
    echo -e "[${INFO}] Initialized empty .git repository"
fi

echo -e "[${INFO}]"
echo -e "[${INFO}] --- ${ESC}[32mStage files then commit${ESC}[0m ---"
echo -e "[${INFO}]"
# Add script files to .gitignore
echo "prepare" >> .gitignore
echo "prepare.*" >> .gitignore

# Stage files
git add . &>/dev/null
if [ $? -ne 0 ]; then
    echo -e "[${ERROR}] Failed to stage files!"
else
    echo -e "[${INFO}] Files staged successfully!"
fi

# Commit initial staged files
git commit -m "Initial commit with necessary files and configurations." &>/dev/null
if [ $? -ne 0 ]; then
    echo -e "[${ERROR}] Commit failed!"
else
   echo -e "[${INFO}] Committed initial state"
fi

# Run mvnw verify
echo -e "[${INFO}]"
echo -e "[${INFO}] --- ${ESC}[32mDelegating to Maven wrapper${ESC}[0m ---"
echo -e "[${INFO}]"
./mvnw verify

# Assuming all went well, delete the scripts to prevent rerun
echo -e "[${INFO}]"
echo -e "[${INFO}] --- ${ESC}[32mFinalizing setup and cleaning up${ESC}[0m ---"
echo -e "[${INFO}]"
echo -e "[${INFO}] Deleting initialization scripts..."
rm -f "prepare.cmd" "prepare"
echo -e "[${INFO}]"
echo -e "[${SUCCESS}] ${ESC}[32mProject configured successfully!${ESC}[0m"

# Delete the script itself
rm -- "$0"