#!/bin/bash

CONFIG=config.xml

case $CORDOVA_PLATFORMS in
  ios)
    echo "Modifying config.xml for ios..."
    sed -i .bak 's|<content src=".*"|<content src="http://localhost:12345"|' $CONFIG
    ;;
  android)
    echo "Modifying config.xml for android..."
    sed -i .bak 's|<content src=".*"|<content src="index.html"|' $CONFIG
    ;;
  *)
    echo "Do nothing here, keep going..."
esac
