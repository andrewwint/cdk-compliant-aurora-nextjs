import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Stack,
  StackProps,
  Duration,
  RemovalPolicy,
  CfnOutput,
} from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as budgets from "aws-cdk-lib/aws-budgets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import { InstanceType } from "aws-cdk-lib/aws-ec2";
import * as kms from "aws-cdk-lib/aws-kms";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { NextjsAppHosting } from "./apps/nextjs-app-hosting";
import {
  CloudWatchDashboard,
  ConfigComplianceHipaa,
  ConfigComplianceSoc2,
  ConfigComplianceGdpr,
  Pinpoint,
} from "./constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface CdkCompliantAuroraNextjsStackProps extends StackProps {
  readonly projectName: string;
  readonly emailSubscription?: string | undefined;
  readonly instanceSize?: "small" | "medium" | "large";
  readonly removalPolicy?: RemovalPolicy | undefined;
  readonly domainName: string;
  readonly repositoryName?: string | undefined;
  readonly repositoryOwner?: string | undefined;
}

export class CdkCompliantAuroraNextjsStack extends cdk.Stack {
  public readonly db: rds.DatabaseCluster;
  public readonly dbName: string;

  constructor(
    scope: Construct,
    id: string,
    props?: CdkCompliantAuroraNextjsStackProps
  ) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkCompliantAuroraNextjsQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // CONFIGURATION
    const instanceType = props?.instanceSize || "small";
    const projectName = props?.projectName || "patient-portal";
    const dbName = projectName + "-db" || "patient-portal-db";
    const dbUsername: string = "admin";
    this.dbName = dbName;
    const budgetLimit = 500;
    const budgetCurrency = "USD";
    const budgetNotificationEmail = "support@email.com";
    const emailSubscription = props?.emailSubscription || undefined;
    const domainName = props?.domainName;
    const repositoryName = props?.repositoryName || undefined;
    const repositoryOwner = props?.repositoryOwner || undefined;

    // BUDGET CONFIGURATION
    // Budget Limit and Notification

    const budget = new budgets.CfnBudget(this, "Budget", {
      budget: {
        budgetLimit: {
          amount: budgetLimit || 500,
          unit: budgetCurrency || "USD",
        },
        budgetName: projectName + "-db" || "patient-portal-db",
        budgetType: "COST",
        costFilters: { Service: ["AmazonRDS"] },
        timeUnit: "MONTHLY",
      },
      notificationsWithSubscribers: [
        {
          notification: {
            comparisonOperator: "GREATER_THAN",
            notificationType: "ACTUAL",
            threshold: budgetLimit,
            thresholdType: "PERCENTAGE",
          },
          subscribers: [
            {
              subscriptionType: "EMAIL",
              address: budgetNotificationEmail,
            },
          ],
        },
      ],
    });

    // COMPLIANCE CONFIGURATION
    // Config Compliance managed by AWS Config
    const configRole = new iam.Role(this, "ConfigRole", {
      assumedBy: new iam.ServicePrincipal("config.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSConfigRole"
        ),
      ],
    });

    // SOC2 Compliance rules
    const configComplianceSoc2 = new ConfigComplianceSoc2(
      this,
      "ConfigComplianceSoc2",
      {
        projectName: props?.projectName,
        roleArn: configRole.roleArn,
      }
    );

    // HIPAA Compliance rules
    const configComplianceHipaa = new ConfigComplianceHipaa(
      this,
      "ConfigComplianceHipaa",
      {
        projectName: props?.projectName,
        roleArn: configRole.roleArn,
      }
    );

    // GDPR Compliance rules
    const configComplianceGdpr = new ConfigComplianceGdpr(
      this,
      "ConfigComplianceGdpr",
      {
        projectName: props?.projectName,
        roleArn: configRole.roleArn,
      }
    );

    // NETWORKING CONFIGURATION
    // Create VPC with 2 AZs
    const vpc = new ec2.Vpc(this, "VPC", { maxAzs: 2 });

    // Aurora DB Key
    const kmsKey = new kms.Key(this, "AuroraDatabaseKey", {
      enableKeyRotation: true,
      alias: dbName,
    });

    // DATABASE CLUSTER CONFIGURATIONS
    // Database Credentials Secret Manager
    const auroraClusterSecret = new secretsmanager.Secret(
      this,
      "AuroraClusterCredentials",
      {
        secretName: dbUsername + "AuroraClusterCredentials",
        description: dbUsername + "AuroraClusterCrendetials",
        encryptionKey: kmsKey,
        generateSecretString: {
          excludeCharacters: "\"@/\\ '",
          generateStringKey: "password",
          passwordLength: 30,
          secretStringTemplate: `{"username":${dbUsername}}`,
        },
      }
    );

    // aurora credentials
    const auroraClusterCrendentials = rds.Credentials.fromSecret(
      auroraClusterSecret,
      dbUsername
    );

    // Database Security Group
    // Allow external access to the database cluster
    // See: https://vercel.com/guides/how-to-allowlist-deployment-ip-address for more information
    const dbSecurityGroup = new ec2.SecurityGroup(this, "DbSecurityGroup", {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: dbName + "-sg",
      description: "Security Group for " + dbName,
    });

    // add ingress rule to allow access to the database from the VPC from any IP
    dbSecurityGroup.addIngressRule(
      ec2.Peer.ipv4("0.0.0.0/0"),
      ec2.Port.tcp(3306),
      "Allow access to the database from the VPC from any IP"
    );

    // Instance Type factory
    const instanceTypeFactory = (instanceType: string) => {
      switch (instanceType) {
        case "small":
          return InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL);
        case "medium":
          return InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM);
        case "large":
          return InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE);
        default:
          return InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL);
      }
    };

    const accessLogsBucket = new s3.Bucket(this, "AccessLogsBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      serverAccessLogsPrefix: "logs",
      versioned: true,
    });

    // S3 Bucket for Database Backups
    const exportBucket = new s3.Bucket(this, "ExportBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketName: dbName + "-bucket",
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: kmsKey,
      serverAccessLogsBucket: accessLogsBucket,
      serverAccessLogsPrefix: "logs",
      versioned: true,
    });

    // DATABASE CLUSTER
    // Aurora Database Cluster with KMS Key password rules and rules
    const databaseCluster = new rds.DatabaseCluster(this, "AuroraDatabase", {
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_3_03_0,
      }),
      instances: 1, // Number of instances in the database cluster default is 2
      instanceProps: {
        instanceType: instanceTypeFactory(instanceType),
        vpc,
        securityGroups: [dbSecurityGroup],
        deleteAutomatedBackups: true, // TODO: Check if this is needed for HIPAA or GDPR
      },
      monitoringInterval: Duration.seconds(30), // Monitoring interval for the database cluster
      storageEncrypted: true, // Encrypts the database cluster for HIPAA or GDPR regulations
      storageEncryptionKey: kmsKey, // KMS Key for encryption
      backup: {
        // Retention period for the database cluster backups
        retention: Duration.days(35),
        preferredWindow: "01:00-02:00",
      },
      cloudwatchLogsExports: ["error", "general", "audit"], // Cloudwatch logs for the database cluster
      deletionProtection: true, // Prevents accidental deletion of the database cluster aling with HIPAA or GDPR regulations
      defaultDatabaseName: dbName || "patient-portal-db", // Database name for the database cluster
      credentials: auroraClusterCrendentials, // Credentials for the database cluster
      iamAuthentication: true, // IAM Authentication for the database cluster
      instanceIdentifierBase: "patient-portal-db", // Database cluster identifier
      preferredMaintenanceWindow: "sun:01:00-sun:02:00", // Preferred maintenance window for the database cluster
      removalPolicy: RemovalPolicy.DESTROY, // Destroy the database cluster when the stack is destroyed. Regarding compliance with HIPAA, GDPR, or SOC 2, it is generally recommended to follow the principle of least privilege and minimize the attack surface of your infrastructure.
      s3ExportBuckets: [exportBucket], // S3 Bucket for database backups for HIPAA or GDPR regulations and ease of management
    });

    this.db = databaseCluster;
    // Rotate the database cluster credentials every 30 days
    databaseCluster.addRotationSingleUser({
      automaticallyAfter: Duration.days(30),
      excludeCharacters: "\"@/\\ '",
    });

    const githubOauthToken = Buffer.from("github-token").toString("base64"); // Github Oauth Token for the repository stub

    // Nextjs App Hosting Stack
    const amplify = new NextjsAppHosting(this, "NextjsAppHosting", {
      // Name given to plaintext secret in secretsManager.
      // When creating the token scope on Github, only the admin:repo_hook scope is needed
      githubOauthTokenName: githubOauthToken,
      domainName: domainName || "my-nextjs-app.com",
      // swap for your github username
      owner: repositoryOwner || "bobsmith",
      // swap for your github frontend repo
      repositoryName: repositoryName || "simple-nextjs",
      //pass in any envVars from the above stacks here
      environmentVariables: {
        DATABASE_READ_HOST: databaseCluster.clusterReadEndpoint.hostname,
        DATABASE_READ_WRITE_HOST: databaseCluster.clusterEndpoint.hostname,
        DATABASE_NANE: dbName,
        DATABASE_PORT: `${databaseCluster.clusterEndpoint.port}`,
      },
    });

    // PIMPOINT CONFIGURATION
    // Create Pinpoint App if emailSubscription is defined
    if (emailSubscription) {
      const pinpoint = new Pinpoint(this, "Pinpoint", {
        projectName: projectName,
        emailSubscription: emailSubscription,
      });
    }
    // Create Cloudwatch Dashboard
    const dashboard = new CloudWatchDashboard(this, "Dashboard", {
      projectName: projectName,
      dbCluster: databaseCluster,
    });

    // Output the database cluster endpoint
    new CfnOutput(this, "DatabaseClusterEndpoint", {
      exportName: "DatabaseClusterEndpoint",
      value: databaseCluster.clusterEndpoint.hostname,
    });

    // Output the database cluster read endpoint
    new CfnOutput(this, "DatabaseClusterReadEndpoint", {
      exportName: "DatabaseClusterReadEndpoint",
      value: databaseCluster.clusterReadEndpoint.hostname,
    });

    // Output the database cluster port
    new CfnOutput(this, "DatabaseClusterPort", {
      exportName: "DatabaseClusterPort",
      value: databaseCluster.clusterEndpoint.port.toString(),
    });

    // Output the database cluster username
    new CfnOutput(this, "DatabaseClusterUsername", {
      exportName: "DatabaseClusterUsername",
      value: dbUsername,
    });

    // Output the database cluster password
    new CfnOutput(this, "DatabaseClusterPassword", {
      exportName: "DatabaseClusterPassword",
      value: auroraClusterSecret.secretValue.unsafeUnwrap().toString(),
    });
  }
}
