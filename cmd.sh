#!/bin/bash
set -e

if [ "$ENV" = 'TEST' ]; then
  echo "Running Test Server"
  exec npm test
else
  echo "Running Production Server"
  exec npm start
fi
