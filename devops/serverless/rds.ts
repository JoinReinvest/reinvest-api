import { exportOutput, getAttribute, getResourceName, getResourceNameTag } from './utils';
import { getPrivateAZ, getPrivateSubnetRefs, getVpcCidr, getVpcRef } from './vpc';

export const RdsResources = {
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
      DBInstanceIdentifier: getResourceName('postgres'),
      AllocatedStorage: '${env:POSTGRESQL_AWS_DB_STORAGE_GB}',
      DBInstanceClass: '${env:POSTGRESQL_AWS_DB_INSTANCE}',
      Engine: 'postgresql',
      DBName: getResourceName('db', '_'),
      MasterUsername: '${env:POSTGRESQL_MAIN_USER}',
      MasterUserPassword: '${env:POSTGRESQL_MAIN_PASSWORD}',
      Tags: [getResourceNameTag('postgresql')],
      DBSubnetGroupName: { Ref: 'RdsPrivateSubnetsGroup' },
      VPCSecurityGroups: [{ Ref: 'RdsSecurityGroup' }],
    },
  },
};

export const RdsOutputs = {
  DatabaseName: {
    Value: getResourceName('db', '_'),
    Description: 'Database name',
    ...exportOutput('DatabaseName'),
  },
  DatabaseHost: {
    Value: getAttribute('RdsPostgresDBInstance', 'Endpoint.Address'),
    Description: 'Database host',
    ...exportOutput('DatabaseHost'),
  },
};
