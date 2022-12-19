import {getAttribute, getResourceNameTag} from "./utils";

export const getVpcRef = () => ({Ref: 'Vpc'});
export const getVpcCidr = () => '10.0.0.0/16';
export const getPrivateAZ = () => '${aws:region}a';
export const getSecondaryPrivateAZ = () => '${aws:region}b';
export const getPublicAZ = () => '${aws:region}c';
export const getPrivateSubnetRefs = () => [
    {Ref: 'PrivateSubnetA'},
    {Ref: 'PrivateSubnetB'},
]
export const getPublicSubnetRef = () => ({Ref: 'PublicSubnetC'});


export const VpcResources = {
    Vpc: {
        Type: 'AWS::EC2::VPC',
        Properties: {
            CidrBlock: getVpcCidr(),
            Tags: [getResourceNameTag('VPC')],
            EnableDnsHostnames: true,
            EnableDnsSupport: true,
            InstanceTenancy: 'default',
        }
    },

    // subnets declarations
    PrivateSubnetA: {
        Type: 'AWS::EC2::Subnet',
        Properties: {
            AvailabilityZone: getPrivateAZ(),
            CidrBlock: '10.0.0.0/20',
            VpcId: getVpcRef(),
            Tags: [getResourceNameTag('Private-SubnetA')]
        }
    },
    PrivateSubnetB: {
        Type: 'AWS::EC2::Subnet',
        Properties: {
            AvailabilityZone: getSecondaryPrivateAZ(),
            CidrBlock: '10.0.16.0/20',
            VpcId: getVpcRef(),
            Tags: [getResourceNameTag('Private-SubnetB')]
        }
    },
    PublicSubnetC: {
        Type: 'AWS::EC2::Subnet',
        Properties: {
            AvailabilityZone: getPublicAZ(),
            CidrBlock: '10.0.32.0/20',
            VpcId: getVpcRef(),
            MapPublicIpOnLaunch: true,
            Tags: [getResourceNameTag('Public-SubnetC')]
        }
    },

    // private subnets configuration
    NatStaticIP: {
        Type: 'AWS::EC2::EIP',
        Properties: {
            Domain: 'vpc',
            Tags: [getResourceNameTag('NatIP')]
        }
    },
    NatGateway: {
        Type: 'AWS::EC2::NatGateway',
        Properties: {
            AllocationId: getAttribute('NatStaticIP', 'AllocationId'),
            SubnetId: {Ref: 'PublicSubnetC'},
            Tags: [getResourceNameTag('NatGateway')]
        }
    },
    PrivateRouteTable: {
        Type: 'AWS::EC2::RouteTable',
        Properties: {
            VpcId: getVpcRef(),
            Tags: [getResourceNameTag('PrivateRouteTable')]
        }
    },
    PrivateRoute: {
        Type: 'AWS::EC2::Route',
        Properties: {
            RouteTableId: {Ref: 'PrivateRouteTable'},
            DestinationCidrBlock: '0.0.0.0/0',
            NatGatewayId: {Ref: 'NatGateway'},
        }
    },
    PrivateSubnetARouteTableAssociation: {
        Type: 'AWS::EC2::SubnetRouteTableAssociation',
        Properties: {
            SubnetId: {Ref: 'PrivateSubnetA'},
            RouteTableId: {Ref: 'PrivateRouteTable'},
        }
    },
    PrivateSubnetBRouteTableAssociation: {
        Type: 'AWS::EC2::SubnetRouteTableAssociation',
        Properties: {
            SubnetId: {Ref: 'PrivateSubnetB'},
            RouteTableId: {Ref: 'PrivateRouteTable'},
        }
    },

    // public subnet configuration
    InternetGateway: {
        Type: 'AWS::EC2::InternetGateway'
    },
    VpcGatewayAttachment: {
        Type: 'AWS::EC2::VPCGatewayAttachment',
        Properties: {
            VpcId: getVpcRef(),
            InternetGatewayId: {Ref: 'InternetGateway'},
        }
    },
    PublicRouteTable: {
        Type: 'AWS::EC2::RouteTable',
        Properties: {
            VpcId: getVpcRef(),
            Tags: [getResourceNameTag('PublicRouteTable')]
        }
    },
    PublicRoute: {
        Type: 'AWS::EC2::Route',
        Properties: {
            RouteTableId: {Ref: 'PublicRouteTable'},
            DestinationCidrBlock: '0.0.0.0/0',
            GatewayId: {Ref: 'InternetGateway'},
        }
    },
    PublicSubnetCRouteTableAssociation: {
        Type: 'AWS::EC2::SubnetRouteTableAssociation',
        Properties: {
            SubnetId: {Ref: 'PublicSubnetC'},
            RouteTableId: {Ref: 'PublicRouteTable'},
        }
    },
}
