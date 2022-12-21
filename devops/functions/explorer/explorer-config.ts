import {getPrivateSubnetRefs, getVpcRef} from "../../serverless/vpc";
import {getAttribute, getResourceName} from "../../serverless/utils";
import {CloudwatchPolicies} from "../../serverless/cloudwatch";

export const ExplorerLambdaFunction = {
    handler: `devops/functions/explorer/handler.main`,
    role: 'ExplorerLambdaRole',
    timeout: 10,
    vpc: {
        securityGroupIds: [
            getAttribute('ExplorerSecurityGroup', 'GroupId')
        ],
        subnetIds: [...getPrivateSubnetRefs()]
    },
    events: [
        {
            httpApi: {
                method: 'GET',
                path: '/explorer'

            },
        },
    ],
}

export const ExplorerLambdaResources = {
    ExplorerLambdaRole: {
        Type: 'AWS::IAM::Role',
        Properties: {
            RoleName: getResourceName('ExplorerLambdaRole'),
            AssumeRolePolicyDocument: {
                Statement: [
                    {
                        Effect: 'Allow',
                        Action: 'sts:AssumeRole',
                        Principal: {
                            Service: 'lambda.amazonaws.com',
                        },
                    },
                ],
            },
            Policies: [
                {
                    PolicyName: 'ExplorerLambdaPolicy',
                    PolicyDocument: {
                        Statement: [
                            ...CloudwatchPolicies,
                        ],
                    },
                },
            ],
        },
    },
    ExplorerSecurityGroup: {
        Type: 'AWS::EC2::SecurityGroup',
        Properties: {
            GroupName: getResourceName('sg-explorer-lambda'),
            GroupDescription: getResourceName('sg-explorer-lambda'),
            VpcId: getVpcRef()
        }
    },
}