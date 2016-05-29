#!/bin/sh
find ./test -name '*.js' | xargs mocha --opts resources/mocha.opts
