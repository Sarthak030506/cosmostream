#!/bin/bash

curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetVideo($id: ID!) { video(id: $id) { id title status manifestUrl thumbnailUrl } }",
    "variables": {
      "id": "bdaf99d3-11ad-4822-a4ea-65a02c7bbaf5"
    }
  }'
