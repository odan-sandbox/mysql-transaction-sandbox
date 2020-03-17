#!/bin/bash

LINE_TO_CONTAIN="mysqld: ready for connections."
SLEEP_TIME=1
echo 'Waiting for server to start'

until docker-compose logs | grep "${LINE_TO_CONTAIN}"
do
    echo "Waiting..."
    sleep ${SLEEP_TIME}
done