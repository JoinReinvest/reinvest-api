#!/bin/bash

echo "Database Snapshot Restore Procedure:"
echo "0. Warning! This is a manual database recovery procedure. It is not automated and it is not part of the CI/CD pipeline."
echo "1. Copy file '.env.saas.dist' into '.env.$NODE_ENV' and use the same values as you use in the Github Actions variables for the $NODE_ENV environment"
echo "2. Change the database name in 'Amazon RDS/Databases/reinvest-$NODE_ENV-postgresql/Modify/DB instance identifier' (do not remove it! In other way the recreation will not work),"
echo "   ie: 'reinvest-$NODE_ENV-postgresql' to 'reinvest-$NODE_ENV-postgresql-old'. Remember choose option 'Apply immediately'"
echo "3. Go to 'Amazon RDS/Snapshots/System' and find the latest snapshot for the database 'reinvest-$NODE_ENV-postgresql'"
echo "3. Copy the snapshot ARN"
echo "5. Enter the ARN below and click 'Enter'"
echo "6. Wait for the database to be restored"

read -p "Enter the snapshot ARN: " snapshotArn

if [ -z "$snapshotArn" ]; then
  echo "Snapshot ARN is required"
  exit 1
fi

echo "Provided ARN: $snapshotArn"
POSTGRESQL_RDS_SNAPSHOT_IDENTIFIER=$snapshotArn serverless deploy -s $NODE_ENV --config serverless-saas.ts

echo "Database restore procedure completed. Validate manually if the database is restored correctly."
