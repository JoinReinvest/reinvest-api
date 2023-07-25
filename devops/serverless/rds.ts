import { exportOutput, getAttribute, getResourceName, getResourceNameTag } from './utils';
import { getPrivateAZ, getPrivateSubnetRefs, getVpcCidr, getVpcRef } from './vpc';

const RdsResourcesConfiguration = {
  RdsSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-rds'),
      GroupDescription: getResourceName('sg-rds'),
      SecurityGroupIngress: [
        {
          CidrIp: getVpcCidr(),
          IpProtocol: 'tcp',
          FromPort: 5432,
          ToPort: 5432,
        },
      ],
      VpcId: getVpcRef(),
    },
  },
  RdsPrivateSubnetsGroup: {
    Type: 'AWS::RDS::DBSubnetGroup',
    Properties: {
      DBSubnetGroupName: getResourceName('rds-private-subnet-group'),
      DBSubnetGroupDescription: getResourceName('rds-private-subnet-group'),
      SubnetIds: [...getPrivateSubnetRefs()],
    },
  },
  RdsPostgresDBInstance: {
    Type: 'AWS::RDS::DBInstance',
    DeletionPolicy: '${env:POSTGRESQL_AWS_DB_RETENTION_POLICY}',
    UpdateReplacePolicy: '${env:POSTGRESQL_AWS_DB_RETENTION_POLICY}',
    Properties: {
      StorageEncrypted: true,
      BackupRetentionPeriod: 7,
      PreferredBackupWindow: '01:00-02:00',
      PreferredMaintenanceWindow: 'Sat:02:00-Sat:03:00',
      DeletionProtection: true,
      AvailabilityZone: getPrivateAZ(),
      AllocatedStorage: '${env:POSTGRESQL_AWS_DB_STORAGE_GB}',
      DBInstanceClass: '${env:POSTGRESQL_AWS_DB_INSTANCE}',
      Engine: 'postgres',
      DBName: getResourceName('db', '_'),
      MasterUsername: '${env:POSTGRESQL_MAIN_USER}',
      MasterUserPassword: '${env:POSTGRESQL_MAIN_PASSWORD}',
      Tags: [getResourceNameTag('postgresql')],
      DBSubnetGroupName: { Ref: 'RdsPrivateSubnetsGroup' },
      VPCSecurityGroups: [{ Ref: 'RdsSecurityGroup' }],
    },
  },
};

//@ts-ignore
if (process.env.POSTGRESQL_RDS_SNAPSHOT_IDENTIFIER && process.env.POSTGRESQL_RDS_SNAPSHOT_IDENTIFIER != 0) {
  console.log('RDS snapshot identifier is set, so we will restore from snapshot: ', process.env.POSTGRESQL_RDS_SNAPSHOT_IDENTIFIER);
  // @ts-ignore
  RdsResourcesConfiguration.RdsPostgresDBInstance.Properties['DBSnapshotIdentifier'] = process.env.POSTGRESQL_RDS_SNAPSHOT_IDENTIFIER;
  // @ts-ignore
  delete RdsResourcesConfiguration.RdsPostgresDBInstance.Properties['DBName'];
}

export const RdsResources = RdsResourcesConfiguration;

// do not use these outputs in other stacks! In other way the snapshot restore will not work!
export const RdsOutputs = {
  DatabaseName: {
    Value: getResourceName('db', '_'),
    Description: 'Database name - do not use this output in other stacks! In other way the snapshot restore will not work!',
    ...exportOutput('DatabaseName'),
  },
  DatabaseHost: {
    Value: getAttribute('RdsPostgresDBInstance', 'Endpoint.Address'),
    Description: 'Database host - do not use this output in other stacks! In other way the snapshot restore will not work!',
    ...exportOutput('DatabaseHost'),
  },
};
