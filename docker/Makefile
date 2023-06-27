.DEFAULT_GOAL := start

DOCKER_COMPOSE = docker-compose \
	--file docker-compose.yml

ifneq ("$(wildcard docker-compose.local.yml)","")
	DOCKER_COMPOSE := ${DOCKER_COMPOSE} \
		--file docker-compose.local.yml
endif

build:
	${DOCKER_COMPOSE} build

down:
	${DOCKER_COMPOSE} down

push:
	${DOCKER_COMPOSE} build
	${DOCKER_COMPOSE} push

start:
	${DOCKER_COMPOSE} pull
	${DOCKER_COMPOSE} up --detach --no-build

up:
	${DOCKER_COMPOSE} up
