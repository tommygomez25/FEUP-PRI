#!/bin/bash

# Create a container 
#docker run --name moviehut_solr -p 8983:8983 solr:9.3

# if core already exists, delete it
docker exec moviehut_solr bin/solr delete -c movies
docker exec moviehut_solr bin/solr delete -c actors
docker exec moviehut_solr bin/solr delete -c conversations

# Create 3 Cores, define their schemas and populate them
docker exec moviehut_solr bin/solr create_core -c movies

curl -X POST -H 'Content-type:application/json' \
    --data-binary "@movie_schema.json" \
    http://localhost:8983/solr/movies/schema

curl -X POST -H 'Content-type:application/json' \
    --data-binary "@movies.json" \
    http://localhost:8983/solr/movies/update?commit=true


#-----------------#

docker exec moviehut_solr bin/solr create_core -c actors

docker cp namesynonyms.txt moviehut_solr:/var/solr/data/actors/namesynonyms.txt

curl -X POST -H 'Content-type:application/json' \
    --data-binary "@complex_actors_schema.json" \
    http://localhost:8983/solr/actors/schema

curl -X POST -H 'Content-type:application/json' \
    --data-binary "@actors.json" \
    http://localhost:8983/solr/actors/update?commit=true

#-----------------#

docker exec moviehut_solr bin/solr create_core -c conversations

curl -X POST -H 'Content-type:application/json' \
    --data-binary "@conversation_schema.json" \
    http://localhost:8983/solr/conversations/schema

curl -X POST -H 'Content-type:application/json' \
    --data-binary "@conversations.json" \
    http://localhost:8983/solr/conversations/update?commit=true
