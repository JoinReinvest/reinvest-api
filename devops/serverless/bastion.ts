import {exportOutput, getAttribute, getResourceName} from "./utils";
import {getPublicSubnetRef, getVpcRef} from "./vpc";

export const BastionResources = {
    BastionSecurityGroup: {
        Type: "AWS::EC2::SecurityGroup",
        Properties: {
            GroupName: getResourceName("sg-bastion"),
            GroupDescription: getResourceName("sg-bastion"),
            SecurityGroupIngress: [
                {
                    CidrIp: "0.0.0.0/0",
                    IpProtocol: "tcp",
                    FromPort: 22,
                    ToPort: 22,
                },
            ],
            VpcId: getVpcRef(),
        },
    },
    BastionEc2: {
        Type: "AWS::EC2::Instance",
        Properties: {
            ImageId: "ami-0b0ea68c435eb488d",
            KeyName: "reinvest-${sls:stage}",
            InstanceType: "t2.micro",
            SubnetId: getPublicSubnetRef(),
            SecurityGroupIds: [{Ref: "BastionSecurityGroup"}],
        },
    },
};

export const BastionOutputs = {
    RequiredBastionKey: {
        Value: "reinvest-${sls:stage}.pem",
        Description: "Pem key required to connect via SSH (the username is: ubuntu). Ask your admin for that",
        ...exportOutput('RequiredBastionKey')
    },
    BastionHostName: {
        Value: getAttribute('BastionEc2', 'PublicIp'),
        Description: "Bastion hostname to connect via SSH",
        ...exportOutput('BastionHostName')
    },
}