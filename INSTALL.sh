#!/bin/bash

set -e -o pipefail  # Exit on error and handle errors in pipelines

# If binary already exists at .ara/bin/ara, exit
if [ -f ./.ara/bin/ara ]; then
    echo "ARA is already installed. Please remove the existing installation and try again."
    exit 1
fi

# Check if jq is installed, ask if want to install if not found.
if ! command -v jq &> /dev/null
then
    echo "jq could not be found"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        read -p "Do you want to install jq? [y/n]: " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]
        then
            brew install jq
        else
            echo "Please install jq and try again."
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        read -p "Do you want to install jq? [y/n]: " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]
        then
            sudo apt-get install jq -y
        else
            echo "Please install jq and try again."
            exit 1
        fi
    else
        echo "Unsupported operating system"
        exit 1
    fi
fi

DOWNLOAD_LINK="https://api.github.com/repos/blaquewithaq/ara-cli/releases/latest"
EXTRACT_DIR="./.ara"

# Ensure the extract directory exists
mkdir -p "$EXTRACT_DIR"

# Download package info from GitHub release
PACKAGE_INFO=$(curl -s "$DOWNLOAD_LINK")

# Download package from GitHub release & extract package
VERSION=$(echo "$PACKAGE_INFO" | jq -r '.tag_name')

# Determine the platform and architecture
PLATFORM=""
ARCH=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="darwin"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="linux"
else
    echo "Unsupported operating system"
    exit 1
fi

ARCH=$(uname -m)
if [ "$ARCH" == "x86_64" ]; then
    ARCH="x64"
elif [ "$ARCH" == "aarch64" ]; then
    ARCH="arm64"
fi

DOWNLOAD_URL=$(echo "$PACKAGE_INFO" | jq -r --arg PLATFORM "$PLATFORM" --arg ARCH "$ARCH" '.assets[] | select(.name | endswith($PLATFORM + "-" + $ARCH + ".tar.gz")) | .browser_download_url')
PACKAGE_NAME=$(echo "$PACKAGE_INFO" | jq -r --arg PLATFORM "$PLATFORM" --arg ARCH "$ARCH" '.assets[] | select(.name | endswith($PLATFORM + "-" + $ARCH + ".tar.gz")) | .name')

echo "Downloading ARA: $PACKAGE_NAME..."

curl -sL "$DOWNLOAD_URL" | tar -xz -C "$EXTRACT_DIR"

# Ask to create a symbolic link
if [ ! -f ./ara ]; then
    read -p "Do you want to create a symbolic link to ARA in the root directory? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        ln -s "$EXTRACT_DIR/ara" ./ara
    fi
fi

echo -e "\nInstallation successful."
