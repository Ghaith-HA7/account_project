#!/usr/bin/env bash
sleep 9 # wait database connection

cd /home/ec2-user/muslims

export PORT=$(cat .env | grep PORT | cut -b 6-)
echo 'validate PORT'
echo $PORT
nc -zv 127.0.0.1 $PORT
