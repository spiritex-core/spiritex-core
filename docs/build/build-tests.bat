@ECHO OFF

ECHO ## SpiritEx-Core Testing > tests.md
ECHO - %DATE% @ %TIME% >> tests.md
ECHO ``` >> tests.md

npx mocha -u bdd tests/**/*.tests.js --timeout 0 --slow 1000 >> tests.md
