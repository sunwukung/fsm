#!/bin/bash
./node_modules/webpack-dev-server/bin/webpack-dev-server.js \
  --config ./resources/webpack/config.js \
  --colors \
  --progress \
  --port 8778 \
  --hot
