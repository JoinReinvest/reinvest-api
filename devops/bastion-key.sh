#!/bin/bash

aws ec2 create-key-pair \
    --key-name reinvest \
    --key-type rsa \
    --key-format pem \
    --query "KeyMaterial" \
    --output text > reinvest.pem