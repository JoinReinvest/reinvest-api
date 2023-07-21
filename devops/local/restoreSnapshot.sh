#!/bin/bash

echo "Database Snapshot Restore Procedure:"
echo "0. Warning! This is a manual database recovery procedure. It is not automated and it is not part of the CI/CD pipeline."
echo "1. Copy file '.env.saas.dist' into '.env.$NODE_ENV' and use the same values as you use in the Github Actions variables for the $NODE_ENV environment"
echo "2. Go to the 'Amazon RDS/Snapshots/System' and find the latest snapshot for the database 'reinvest-$NODE_ENV-<randomized-string>'"
echo "3. Copy the snapshot ARN"
echo "4. Enter the ARN below and click 'Enter'"
echo "5. Wait for the database to be restored"
echo "6. Go to the 'AWS/Cloudformation/Stacks/reinvest-${NODE_ENV}/Outputs. Find 'DatabaseHost' variable. Copy the value and replace Github Actions '${NODE_ENV}_POSTGRESQL_HOST' variable with it in Github/reinvest-api/Settings/Security/Secrets and variables/Actions"
echo "7. Run the functions pipeline to deploy the functions with the new database host"

read -p "Enter the snapshot ARN: " snapshotArn

if [ -z "$snapshotArn" ]; then
  echo "Snapshot ARN is required"
  exit 1
fi

echo "Provided ARN: $snapshotArn"
POSTGRESQL_RDS_SNAPSHOT_IDENTIFIER=$snapshotArn serverless deploy -s $NODE_ENV --config serverless-saas.ts

echo "Database restore procedure completed. Validate manually if the database is restored correctly. Do not forget of steps 6-7!"
