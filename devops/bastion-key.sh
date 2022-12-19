#!/bin/bash

aws ec2 create-key-pair \
    --key-name lukaszd \
    --key-type rsa \
    --key-format pem \
    --query "KeyMaterial" \
    --output text > lukaszd.pem