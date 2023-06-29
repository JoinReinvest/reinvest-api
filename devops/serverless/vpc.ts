import { exportOutput, getAttribute, getResourceName, getResourceNameTag, importOutput } from './utils';

export const getVpcRef = () => ({ Ref: 'Vpc' });
export const getVpcCidr = () => '10.0.0.0/16';
export const getPrivateAZ = () => '${aws:region}a';
export const getSecondaryPrivateAZ = () => '${aws:region}b';
export const getPublicAZ = () => '${aws:region}c';
export const getPrivateSubnetRefs = () => [{ Ref: 'PrivateSubnetA' }, { Ref: 'PrivateSubnetB' }];
export const getPublicSubnetRef = () => ({ Ref: 'PublicSubnetC' });
export const importVpcRef = () => importOutput('VpcRef');
export const importPrivateSubnetRefs = () => [importOutput('PrivateSubnetA'), importOutput('PrivateSubnetB')];
export const importPublicSubnetRef = () => importOutput('PublicSubnetC');

export const VpcOutputs = {
  VpcRef: {
    Value: { Ref: 'Vpc' },
    Description: 'The Vpc Ref',
    ...exportOutput('VpcRef'),
  },
  PrivateSubnetA: {
    Value: { Ref: 'PrivateSubnetA' },
    Description: 'PrivateSubnetA Ref',
    ...exportOutput('PrivateSubnetA'),
  },
  PrivateSubnetB: {
    Value: { Ref: 'PrivateSubnetB' },
    Description: 'PrivateSubnetB Ref',
    ...exportOutput('PrivateSubnetB'),
  },
  PublicSubnetC: {
    Value: { Ref: 'PublicSubnetC' },
    Description: 'PublicSubnetC Ref',
    ...exportOutput('PublicSubnetC'),
  },
};

export const VpcResources = {
  Vpc: {
    Type: 'AWS::EC2::VPC',
    Properties: {
      CidrBlock: getVpcCidr(),
      Tags: [getResourceNameTag('VPC')],
      EnableDnsHostnames: true,
      EnableDnsSupport: true,
      InstanceTenancy: 'default',
    },
  },

  // subnets declarations
  PrivateSubnetA: {
    Type: 'AWS::EC2::Subnet',
    Properties: {
      AvailabilityZone: getPrivateAZ(),
      CidrBlock: '10.0.0.0/20',
      VpcId: getVpcRef(),
      Tags: [getResourceNameTag('Private-SubnetA')],
    },
  },
  PrivateSubnetB: {
    Type: 'AWS::EC2::Subnet',
    Properties: {
      AvailabilityZone: getSecondaryPrivateAZ(),
      CidrBlock: '10.0.16.0/20',
      VpcId: getVpcRef(),
      Tags: [getResourceNameTag('Private-SubnetB')],
    },
  },
  PublicSubnetC: {
    Type: 'AWS::EC2::Subnet',
    Properties: {
      AvailabilityZone: getPublicAZ(),
      CidrBlock: '10.0.32.0/20',
      VpcId: getVpcRef(),
      MapPublicIpOnLaunch: true,
      Tags: [getResourceNameTag('Public-SubnetC')],
    },
  },

  // private subnets configuration
  NatStaticIP: {
    Type: 'AWS::EC2::EIP',
    Properties: {
      Domain: 'vpc',
      Tags: [getResourceNameTag('NatIP')],
    },
  },
  NatGateway: {
    Type: 'AWS::EC2::NatGateway',
    Properties: {
      AllocationId: getAttribute('NatStaticIP', 'AllocationId'),
      SubnetId: { Ref: 'PublicSubnetC' },
      Tags: [getResourceNameTag('NatGateway')],
    },
  },
  PrivateRouteTable: {
    Type: 'AWS::EC2::RouteTable',
    Properties: {
      VpcId: getVpcRef(),
      Tags: [getResourceNameTag('PrivateRouteTable')],
    },
  },
  PrivateRoute: {
    Type: 'AWS::EC2::Route',
    Properties: {
      RouteTableId: { Ref: 'PrivateRouteTable' },
      DestinationCidrBlock: '0.0.0.0/0',
      NatGatewayId: { Ref: 'NatGateway' },
    },
  },
  PrivateSubnetARouteTableAssociation: {
    Type: 'AWS::EC2::SubnetRouteTableAssociation',
    Properties: {
      SubnetId: { Ref: 'PrivateSubnetA' },
      RouteTableId: { Ref: 'PrivateRouteTable' },
    },
  },
  PrivateSubnetBRouteTableAssociation: {
    Type: 'AWS::EC2::SubnetRouteTableAssociation',
    Properties: {
      SubnetId: { Ref: 'PrivateSubnetB' },
      RouteTableId: { Ref: 'PrivateRouteTable' },
    },
  },

  // public subnet configuration
  InternetGateway: {
    Type: 'AWS::EC2::InternetGateway',
  },
  VpcGatewayAttachment: {
    Type: 'AWS::EC2::VPCGatewayAttachment',
    Properties: {
      VpcId: getVpcRef(),
      InternetGatewayId: { Ref: 'InternetGateway' },
    },
  },
  PublicRouteTable: {
    Type: 'AWS::EC2::RouteTable',
    Properties: {
      VpcId: getVpcRef(),
      Tags: [getResourceNameTag('PublicRouteTable')],
    },
  },
  PublicRoute: {
    Type: 'AWS::EC2::Route',
    Properties: {
      RouteTableId: { Ref: 'PublicRouteTable' },
      DestinationCidrBlock: '0.0.0.0/0',
      GatewayId: { Ref: 'InternetGateway' },
    },
  },
  PublicSubnetCRouteTableAssociation: {
    Type: 'AWS::EC2::SubnetRouteTableAssociation',
    Properties: {
      SubnetId: { Ref: 'PublicSubnetC' },
      RouteTableId: { Ref: 'PublicRouteTable' },
    },
  },

  SQSSecurityGroup: {
    Type: 'AWS::EC2::SecurityGroup',
    Properties: {
      GroupName: getResourceName('sg-sqs'),
      GroupDescription: getResourceName('sg-sqs'),
      SecurityGroupEgress: [
        {
          IpProtocol: '-1',
          CidrIp: getVpcCidr(),
        },
      ],
      SecurityGroupIngress: [
        {
          IpProtocol: '-1',
          CidrIp: getVpcCidr(),
        },
      ],
      VpcId: getVpcRef(),
    },
  },
  SQSPrivateEndpoint: {
    Type: 'AWS::EC2::VPCEndpoint',
    Properties: {
      VpcId: getVpcRef(),
      VpcEndpointType: 'Interface',
      SecurityGroupIds: [getAttribute('SQSSecurityGroup', 'GroupId')],
      ServiceName: { 'Fn::Join': ['.', ['com.amazonaws', { Ref: 'AWS::Region' }, 'sqs']] },
      SubnetIds: [...getPrivateSubnetRefs(), getPublicSubnetRef()],
      PrivateDnsEnabled: false,
      PolicyDocument: {
        Statement: [
          {
            Action: ['sqs:SendMessage'],
            Effect: 'Allow',
            Resource: 'arn:aws:sqs:us-east-2:*:*',
            Principal: {
              Service: 'lambda.amazonaws.com',
            },
          },
        ],
      },
    },
  },
};

export const EniPolicies = [
  {
    // allow to create ENI to access VPC
    Effect: 'Allow',
    Action: ['ec2:CreateNetworkInterface', 'ec2:DeleteNetworkInterface', 'ec2:AssignPrivateIpAddresses', 'ec2:UnassignPrivateIpAddresses'],
    Resource: 'arn:aws:ec2:*:*:*',
  },
  {
    // allow to describe ENI (works only on all Resources -https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html)
    Effect: 'Allow',
    Action: ['ec2:DescribeNetworkInterfaces'],
    Resource: '*',
  },
];

export const SecurityGroupEgressRules = [
  {
    IpProtocol: 'TCP',
    CidrIp: '0.0.0.0/0',
    ToPort: 443,
    FromPort: 443,
  },
  {
    IpProtocol: 'TCP',
    CidrIp: '0.0.0.0/0',
    ToPort: 5432,
    FromPort: 5432,
  },
  {
    IpProtocol: '-1',
    CidrIp: getVpcCidr(),
  },
];
export const SecurityGroupIngressRules = [
  {
    IpProtocol: '-1',
    CidrIp: getVpcCidr(),
  },
];
