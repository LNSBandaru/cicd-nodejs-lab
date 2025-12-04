import { Ec2Instance } from "./src/Ec2Instance";

process.env.EC2_NAME = "my-app-server";
process.env.AMI_ID = "ami-093a7f5fbae13ff67";
process.env.VPC_ID = "vpc-07984328f95df8565";
process.env.SUBNET_ID = "subnet-050a12e0c04ad8e5b";
process.env.INSTANCE_TYPE = "t2.micro";
process.env.INBOUND_IPS = "0.0.0.0/0";
process.env.VOLUME_SIZE = "20"


const ec2 = new Ec2Instance("Ec2Instance", {
    tags: { Project: "Ec2Instance" }
});

export const instanceId = ec2.instance.id;
export const publicIp = ec2.instance.publicIp;
