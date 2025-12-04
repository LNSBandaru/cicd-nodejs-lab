import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as crypto from "crypto";
// @ts-ignore
import * as sshpk from "sshpk";


export interface Ec2InstanceArgs {
    tags?: Record<string, string>;
}

export class Ec2Instance extends pulumi.ComponentResource {
    public readonly securityGroup: aws.ec2.SecurityGroup;
    public readonly instance: aws.ec2.Instance;
    public readonly instanceRole: aws.iam.Role;
    public readonly instanceProfile: aws.iam.InstanceProfile;
    public readonly keyPair: aws.ec2.KeyPair;
    public readonly privateKeySecret: aws.secretsmanager.Secret;

    constructor(name: string, args: Ec2InstanceArgs = {}, opts?: pulumi.ComponentResourceOptions) {
        super("custom:components:Ec2InstanceComponent", name, {}, opts);
        // -------------------------------------------------------
        // Environment variables
        // -------------------------------------------------------
        const ec2_name = process.env.EC2_NAME;
        const amiId = process.env.AMI_ID;
        const instanceType = process.env.INSTANCE_TYPE;
        const enableDetailedMonitoringEnv = process.env.ENABLE_DETAILED_MONITORING || "false";
        const vpcId = process.env.VPC_ID;
        const subnetId = process.env.SUBNET_ID;

        const inboundIps = process.env.INBOUND_IPS || "";
        const volumeSize = parseInt(process.env.VOLUME_SIZE || "20", 10);


        const enableDetailedMonitoring = enableDetailedMonitoringEnv?.toLowerCase() === "true" ? true : false;
        const inboundCidrs = inboundIps.split(",").map(ip => ip.trim()).filter(ip => ip.length > 0);


        const { tags = {} } = args;

        // -------------------------------------------------------------------
        // 1. SECURE KEY GENERATION
        // -------------------------------------------------------------------
        // generate RSA keypair (PEM)
        const { publicKey: pubPem, privateKey: privPem } = crypto.generateKeyPairSync("rsa", {
            modulusLength: 4096,
            publicKeyEncoding: { type: "spki", format: "pem" }, // spki is suitable here
            privateKeyEncoding: { type: "pkcs1", format: "pem" },
        });

        // convert PEM -> OpenSSH public key (example: "ssh-rsa AAAA....")
        const parsed = sshpk.parseKey(pubPem, "pem");
        const opensshPublic = parsed.toString("ssh");

        // Store privPem in Secrets Manager and use opensshPublic for KeyPair
        this.privateKeySecret = new aws.secretsmanager.Secret(`${ec2_name}-ssh-private-key`, {
            recoveryWindowInDays: 0
        }, { parent: this });

        new aws.secretsmanager.SecretVersion(`${ec2_name}-ssh-private-key-version`, {
            secretId: this.privateKeySecret.id,
            secretString: privPem,
        }, { parent: this });

        // Create AWS EC2 KeyPair Using PUBLIC KEY
        this.keyPair = new aws.ec2.KeyPair(`${ec2_name}-keypair`, {
            publicKey: opensshPublic
        }, { parent: this });

        // -----------------------------------------------------------------------------
        // IAM Role for EC2 — SSM Session Manager + CloudWatch Logs
        // -----------------------------------------------------------------------------
        
        this.instanceRole = new aws.iam.Role(`${ec2_name}-role`, {
            assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
                Service: "ec2.amazonaws.com",
            })
        }, { parent: this });

        new aws.iam.RolePolicy(`${ec2_name}-policy`, {
            role: this.instanceRole.id,
            policy: pulumi.output({
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Action: [
                            "ssm:*",
                            "ssmmessages:*",
                            "ec2messages:*"
                        ],
                        Resource: "*"
                    },
                    {
                        Effect: "Allow",
                        Action: [
                            "logs:CreateLogGroup",
                            "logs:CreateLogStream",
                            "logs:PutLogEvents"
                        ],
                        Resource: "*"
                    }
                ]
            })
        }, { parent: this });

        this.instanceProfile = new aws.iam.InstanceProfile(`${ec2_name}-profile`, {
            role: this.instanceRole.name
        }, { parent: this });
        
        // -------------------------------------------------------
        // SECURITY GROUP
        // -------------------------------------------------------

        this.securityGroup = new aws.ec2.SecurityGroup(`${ec2_name}-sg`, {
            vpcId: vpcId,

            description: `Security group for EC2 instance: ${ec2_name}`,
            ingress: inboundCidrs.map((cidr) => ({
                protocol: "tcp",
                fromPort: 22,
                toPort: 22,
                cidrBlocks: [cidr],
            })),
            egress: [
                {
                    protocol: "-1",
                    fromPort: 0,
                    toPort: 0,
                    cidrBlocks: ["0.0.0.0/0"],
                },
            ],
            tags: {
                Name: `${ec2_name}-sg`,
                ...tags,
            }
        }, { parent: this });
        // -------------------------------------------------------
        // EC2 Instance
        // -------------------------------------------------------
        this.instance = new aws.ec2.Instance(`${ec2_name}-ec2`, {
            ami: amiId,
            instanceType: instanceType,
            keyName: this.keyPair.keyName,
            monitoring: enableDetailedMonitoring,
            subnetId: subnetId,
            vpcSecurityGroupIds: [this.securityGroup.id],
            iamInstanceProfile: this.instanceProfile,

            metadataOptions: {
                httpTokens: "required",
                httpEndpoint: "enabled",
            },
            rootBlockDevice: {
                encrypted: true,
                volumeType: "gp3",
                volumeSize: volumeSize 
            },

            tags: {
                Name: `${ec2_name}-ec2`,
                ManagedBy: "Pulumi",
                Environment: pulumi.getStack(),
                ...tags,
            },
        }, { parent: this });

        this.registerOutputs({
            instanceId: this.instance.id,
            volumeSize,
            privateIp: this.instance.privateIp,
            publicIp: this.instance.publicIp,
            securityGroupId: this.securityGroup.id,
            keyPairName: this.keyPair.keyName,
        })
    }
}
