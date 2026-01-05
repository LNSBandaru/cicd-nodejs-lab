# FortiGate EC2 Provisioning with Pulumi

## Overview
This repository provides **Infrastructure as Code (IaC)** to provision an **AWS EC2 instance running FortiGate (FortiOS)** using **Pulumi**.  
The implementation is designed for **secure, repeatable, and environment-agnostic deployments**, aligned with enterprise cloud and SRE best practices on **AWS**.

---

## Purpose
- Provision a FortiGate firewall on EC2
- Standardize network security gateway deployments
- Enable controlled ingress/egress for VPC workloads
- Support dev, non-prod, and prod environments via Pulumi stacks

---

## High-Level Architecture
- **Compute**: EC2 (FortiGate AMI – BYOL or PAYG)
- **Networking**:
  - Existing VPC
  - Target Subnet (public or private, design-dependent)
  - Security Groups
  - Elastic Network Interface (ENI)
- **Access**:
  - SSH (CIDR-restricted)
  - Optional Elastic IP
- **IaC**:
  - Pulumi (TypeScript)

---

## Repository Structure
```
.
├── index.ts                # Pulumi entry point
├── ec2.ts                  # FortiGate EC2 & ENI provisioning
├── network.ts              # Security Groups & networking helpers
├── config.ts               # Centralized configuration mapping
├── Pulumi.yaml             # Pulumi project definition
├── Pulumi.dev.yaml         # Dev stack configuration
├── Pulumi.prod.yaml        # Prod stack configuration
└── README.md
```

---

## Prerequisites
- Node.js ≥ 18.x
- Pulumi CLI
- AWS CLI configured with appropriate IAM permissions
- Valid FortiGate AMI ID for the target AWS region
- Existing VPC and Subnet

---

## Configuration
All parameters are managed via Pulumi stack configuration.

Example:
```yaml
config:
  aws:region: ap-southeast-1
  fortigate:amiId: ami-xxxxxxxxxxxxxxxxx
  fortigate:instanceType: t3.medium
  fortigate:keyPairName: fortigate-keypair
  network:vpcId: vpc-xxxxxxxx
  network:subnetId: subnet-xxxxxxxx
  network:sshCidr: 10.0.0.0/16
```

---

## Deployment Workflow

### 1. Install Dependencies
```bash
npm install
```

### 2. Select Stack
```bash
pulumi stack select dev
```

### 3. Preview Changes
```bash
pulumi preview
```

### 4. Deploy Infrastructure
```bash
pulumi up
```

---

## Outputs
Typical stack outputs include:
- EC2 Instance ID
- Private IP
- Public IP / Elastic IP (if enabled)
- Security Group ID

---

## Security Considerations
- SSH access must be CIDR-restricted
- FortiGate management ports should never be exposed publicly without controls
- IAM permissions should follow least-privilege principles
- Production deployments should prefer private subnets with controlled routing

---

## Environment Strategy
- **Dev**: Open CIDR (restricted), minimal instance size
- **Non-Prod**: Closer to prod topology, limited exposure
- **Prod**: Private subnet, hardened security groups, monitored access

---

## Cleanup
To destroy all provisioned resources:
```bash
pulumi destroy
```

---

## Notes
- FortiGate licensing (BYOL vs PAYG) is determined by the AMI used
- This repository assumes networking primitives (VPC/Subnet) already exist
- Designed for extension into HA, multi-AZ, or transit-VPC architectures

---

## Ownership
Maintained as an **enterprise-grade IaC baseline** for FortiGate EC2 deployments using Pulumi.
