# CDK-Compliant-Aurora-Next.js: A Compliant IaC Solution for Deploying Next.js Web Apps on AWS with Aurora MySQL and Amplify CI/CD

This project aims to designed to build a compliant application stack that aims to pass SOC 2, GDPR, and HIPAA controls. It leverages AWS Config and CloudWatch for monitoring and alerting and uses AWS services such as Next.js and Aurora MySQL to provide a scalable and secure architecture.

[![Known Vulnerabilities](https://snyk.io/test/github/andrewwint/cdk-compliant-aurora-nextjs/badge.svg)](https://snyk.io/test/github/andrewwint/cdk-compliant-aurora-nextjs)

[![Infrastructure Tests](https://www.bridgecrew.cloud/badges/github/andrewwint/cdk-compliant-aurora-nextjs/general)](https://www.bridgecrew.cloud/link/badge?vcs=github&fullRepo=andrewwint%2Fcdk-compliant-aurora-nextjs&benchmark=INFRASTRUCTURE+SECURITY)

[![Infrastructure Tests](https://www.bridgecrew.cloud/badges/github/andrewwint/nextjs-prisma-webapp/hipaa)](https://www.bridgecrew.cloud/link/badge?vcs=github&fullRepo=andrewwint%2Fnextjs-prisma-webapp&benchmark=HIPAA)

[![Infrastructure Tests](https://www.bridgecrew.cloud/badges/github/andrewwint/nextjs-prisma-webapp/soc2)](https://www.bridgecrew.cloud/link/badge?vcs=github&fullRepo=andrewwint%2Fnextjs-prisma-webapp&benchmark=SOC2)

[![Infrastructure Tests](https://www.bridgecrew.cloud/badges/github/andrewwint/nextjs-prisma-webapp/nist)](https://www.bridgecrew.cloud/link/badge?vcs=github&fullRepo=andrewwint%2Fnextjs-prisma-webapp&benchmark=NIST-800-53)

[![Infrastructure Tests](https://www.bridgecrew.cloud/badges/github/andrewwint/nextjs-prisma-webapp/cis_aws_13)](https://www.bridgecrew.cloud/link/badge?vcs=github&fullRepo=andrewwint%2Fnextjs-prisma-webapp&benchmark=CIS+AWS+V1.3)

[![Infrastructure Tests](https://www.bridgecrew.cloud/badges/github/andrewwint/nextjs-prisma-webapp/pci)](https://www.bridgecrew.cloud/link/badge?vcs=github&fullRepo=andrewwint%2Fnextjs-prisma-webapp&benchmark=PCI-DSS+V3.2)

## CdkCompliantAuroraNextjsStack

![alt](./assets/AuroraPinpointStack.template.json.png)

## CdkCompliantAuroraNextjsStack/**NextjsAppHosting**

<img src="https://velog.velcdn.com/images/sinclairr/post/fb146ca7-654e-41df-8b26-33e01ffffe7b/image.png" width="473">

## Getting Started

To get started with this project, follow the steps below:

1. Clone the repository to your local machine.
2. Install the AWS CLI and configure your credentials.
3. Install the AWS CDK CLI.
4. Install the project dependencies by running `npm install` in the project directory.
5. Update the project configuration in `cdk.json` to match your AWS account settings.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Building and Deploying the Stack

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

## Project Structure

The project is structured as follows:

- `./cdk.json`: Configuration file for the AWS CDK v2 uses.
- `./lib/`: Contains the TypeScript code for the AWS CDK stack.
- `./lib/cdk-compliant-aurora-nextjs-stack.ts`: CDK construct for creating an Aurora MySQL database cluster.
- `./lib/apps/nextjs-app-hosting.ts`: CDK app for creating a Next.js application stack.
- `./lib/constructs/config-compliance[gdpr,hippa,soc].ts`: CDK construct for enabling AWS Config.
- `./lib/constructs/clouldwatch-dashboard..ts`: CDK construct for enabling CloudWatch monitoring and alerts.

## Compliance Controls

This project is designed to comply with SOC 2, GDPR, and HIPAA controls. The following controls are implemented:

- Data encryption at rest and in transit
- Access controls using IAM roles and policies
- Continuous monitoring using AWS Config and CloudWatch
- Auditing and logging of all application activity
- Automatic backups and disaster recovery using Aurora Serverless
- Secure email communication using Pinpoint (optional)

### Features

- [ ] Sets budgets email alerts
- [ ] SOC 2 Compliance rules
- [ ] HIPAA Compliance rules
- [ ] GDPR Compliance rules
- [ ] Create an appropriate VPC
- [ ] Properly Managed Credentials Management with Secret Manager
- [ ] Key Management including Rotation
- [ ] Database Security Group configuration while allowing access from anywhere
- [ ] Database InstanceType management to prevent over provisioning
- [ ] Aurora Database Cluster creation with good practices
- [ ] Next.js 13 Webapp CI/D triggered by a merge from a pull request to main
- [ ] Next.js receives database connection values as environment variables from Aurora Database Cluster stack
- [ ] Add secure domain name to hosted Next.js
- [ ] Cloudwatch dashboard creation with appropriate alerts

## Manual Steps for Run-books Play-Books

1. **Create an AWS account:** Users will need to manually create a new AWS account before using the CDK.
2. **Manage IAM roles and permissions:** Users will need to manually manage their IAM roles and permissions as necessary, such as adding or removing users from roles or adjusting permissions.
3. **Configure DNS settings:** The CDK can create and manage resources such as EC2 instances, RDS instances, and S3 buckets, but it cannot configure DNS settings.
4. **Set up SSL/TLS certificates:** Users will need to manually obtain and configure SSL/TLS certificates for their resources.
5. **Configure custom domain names:** Users will need to manually configure custom domain names for their resources.
6. **Migrate data:** While the CDK can create and manage databases, it cannot migrate data from existing databases.
7. **Configure Secrets Manager:** Users will need to manually set up and configure their Secrets Manager secrets.
8. **GitHub Secret permissioning:** Users will need to manually set up and configure permissions for GitHub secrets, such as allowing CodeBuild to access the secrets.



## Congifuration

```js
const app = new App();
new CdkCompliantAuroraNextjsStack(app, "CdkCompliantAuroraNextjsStack", {
  projectName: "patient-portal",
  emailSubscription: "from@email.com",
  domainName: "patient-portal.com",
  instanceSize: "small",
  repositoryName: "nextjs-prisma-webapp",
  repositoryOwner: "andrewwint",
});
```

## Checkov Static Code Analysis Tool

Checkov is a static code analysis tool for scanning infrastructure as code (IaC) files for misconfigurations that may lead to security or compliance problems. Checkov includes more than 750 predefined policies to check for common misconfiguration issues.

```shell
cdk synth
checkov -f checkov -f ./cdk.out/CdkCompliantAuroraNextjsStack.template.json -f ./cdk.out/CdkCompliantAuroraNextjsStackNextjsAppHosting955FDA38.template.json

[ kubernetes framework ]: 100%|████████████████████|[2/2], Current File Scanned=cdk.out/CdkCompliantAuroraNextjsStackNextjsAppHosting955FDA38.temp
[ cloudformation framework ]: 100%|████████████████████|[2/2], Current File Scanned=/cdk.out/CdkCompliantAuroraNextjsStackNextjsAppHosting955FDA38
[ secrets framework ]: 100%|████████████████████|[2/2], Current File Scanned=./cdk.out/CdkCompliantAuroraNextjsStackNextjsAppHosting955FDA38.templ


       _               _              
   ___| |__   ___  ___| | _______   __
  / __| '_ \ / _ \/ __| |/ / _ \ \ / /
 | (__| | | |  __/ (__|   < (_) \ V / 
  \___|_| |_|\___|\___|_|\_\___/ \_/  
                                      
By bridgecrew.io | version: 2.3.90 
Update available 2.3.90 -> 2.3.96
Run pip3 install -U checkov to update 


cloudformation scan results:

Passed checks: 83, Failed checks: 0, Skipped checks: 0
Check: CKV_AWS_108: "Ensure IAM policies does not allow data exfiltration"
        PASSED for resource: AWS::IAM::Role.ConfigRoleF94F46B6
        File: /cdk.out/CdkCompliantAuroraNextjsStack.template.json:42-75
        Guide: https://docs.bridgecrew.io/docs/ensure-iam-policies-do-not-allow-data-exfiltration
Check: CKV_AWS_111: "Ensure IAM policies does not allow write access without constraints"
        PASSED for resource: AWS::IAM::Role.ConfigRoleF94F46B6
        File: /cdk.out/CdkCompliantAuroraNextjsStack.template.json:42-75
```
