#!/bin/sh
find ./src ./test -name '*.js' | xargs mocha --opts resources/mocha.opts
