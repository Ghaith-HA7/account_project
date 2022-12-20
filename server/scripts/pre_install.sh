#!/usr/bin/env bash

cd /home/ec2-user/muslims

if [ -f ./globalInstalled.checked ]; then
    echo "global is installed ok"
    npm install --production
else
    echo "install global"
    # update instance
    yum -y update

    # add nodejs to yum
    curl --silent --location https://rpm.nodesource.com/setup_14.x | bash -
    yum -y install nodejs

    # install pm2 module globaly
    npm install -g pm2
    pm2 update

    npm install # save && dev

    # install nc ,, used in validate.sh
    yum -y install nmap-ncat
    touch ./globalInstalled.checked
fi
