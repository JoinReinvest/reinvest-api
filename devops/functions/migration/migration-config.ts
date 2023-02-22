import {CloudwatchPolicies} from "../../serverless/cloudwatch";
import {getAttribute, getResourceName} from "../../serverless/utils";
import {
    EniPolicies,
    importPrivateSubnetRefs,
    importVpcRef,
} from "../../serverless/vpc";

export const MigrationLambdaFunction = {
    handler: `devops/functions/migration/handler.main`,
    role: "MigrationLambdaRole",
    timeout: 10,
    vpc: {
        securityGroupIds: [getAttribute("MigrationSecurityGroup", "GroupId")],
        subnetIds: [...importPrivateSubnetRefs()],
    }
};

export const MigrationLambdaResources = {
    MigrationLambdaRole: {
        Type: "AWS::IAM::Role",
        Properties: {
            RoleName: getResourceName("MigrationLambdaRole"),
            AssumeRolePolicyDocument: {
                Statement: [
                    {
                        Effect: "Allow",
                        Action: "sts:AssumeRole",
                        Principal: {
                            Service: "lambda.amazonaws.com",
                        },
                    },
                ],
            },
            Policies: [
                {
                    PolicyName: "MigrationLambdaPolicy",
                    PolicyDocument: {
                        Statement: [...CloudwatchPolicies, ...EniPolicies],
                    },
                },
            ],
        },
    },
    MigrationSecurityGroup: {
        Type: "AWS::EC2::SecurityGroup",
        Properties: {
            GroupName: getResourceName("sg-migration-lambda"),
            GroupDescription: getResourceName("sg-migration-lambda"),
            VpcId: importVpcRef()
        },
    },
    // MigrationInvoker: {
    //     Type: "AWS::CloudFormation::CustomResource",
    //     Properties: {
    //         ServiceToken: getAttribute('MigrationLambdaFunction', 'Arn'),
    //     }
    // }
};
