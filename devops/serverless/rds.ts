import {getResourceName, getResourceNameTag} from "./utils";
import {getPrivateAZ, getPrivateSubnetRefs, getVpcCidr, getVpcRef} from "./vpc";

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
            VpcId: getVpcRef()
        }
    },
    RdsPrivateSubnetsGroup: {
        Type: 'AWS::RDS::DBSubnetGroup',
        Properties: {
            DBSubnetGroupName: getResourceName('rds-private-subnet-group'),
            DBSubnetGroupDescription: getResourceName('rds-private-subnet-group'),
            SubnetIds: [
                ...getPrivateSubnetRefs(),
            ],
        }
    },
    RdsPostgresDBInstance: {
        Type: 'AWS::RDS::DBInstance',
        DeletionPolicy: 'Delete', // TODO change to Snapshot
        UpdateReplacePolicy: 'Delete', // TODO change to Snapshot
        Properties: {
            AvailabilityZone: getPrivateAZ(),
            DBInstanceIdentifier: getResourceName('postgresql'),
            AllocatedStorage: '5', // in GB
            DBInstanceClass: 'db.t3.micro', // the smallest one for tests!
            Engine: 'postgres',
            DBName: getResourceName('db', '_'),
            MasterUsername: 'executive', // use envs!
            MasterUserPassword: 'password', // use envs!
            Tags: [getResourceNameTag('postgresql')],
            DBSubnetGroupName: {Ref: 'RdsPrivateSubnetsGroup'},
            VPCSecurityGroups: [{Ref: 'RdsSecurityGroup'}],
        }
    }
}