import { StackProps, CfnOutput } from 'aws-cdk-lib';
import * as config from 'aws-cdk-lib/aws-config';
import { Construct } from 'constructs';

export interface ConfigComplianceHipaaProps extends StackProps {
  readonly projectName?: string;
  readonly roleArn?: string;
}

export class ConfigComplianceHipaa extends Construct {
  constructor(scope: Construct, id: string, props?: ConfigComplianceHipaaProps) {
    super(scope, id);


    const configCompliance = new config.CfnConfigurationRecorder(this, 'ConfigCompliance', {
      name: 'ConfigCompliance',
      recordingGroup: {
        allSupported: true,
        includeGlobalResourceTypes: true,
      },
      roleArn: <string>props?.roleArn,
    });

    // Set up AWS Config rules for SOC 2 compliance

    // - EBS volumes attached to EC2 instances are encrypted
    // - RDS instances are encrypted
    // - S3 buckets have logging enabled

    const hipaaRules = [
      // Rules related to security, availability, processing integrity, confidentiality, and privacy
      {
        name: 'EBS Volume Encryption',
        description: 'Checks that EBS volumes attached to EC2 instances are encrypted',
        inputParameters: {},
        maximumExecutionFrequency: 'TwentyFour_Hours',
        complianceResourceId: 'AWS::EC2::Volume',
        complianceResourceTypes: [
          'AWS::EC2::Volume',
        ],
        owner: 'AWS',
        sourceDetails: [
          {
            eventSource: 'aws.config',
            messageType: 'ConfigurationItemChangeNotification',
            sourceIdentifier: 'AWS_EBS_VOLUME_ENCRYPTION',
          },
        ],
      },
      {
        name: 'RDS Encryption',
        description: 'Checks that RDS instances are encrypted',
        inputParameters: {},
        maximumExecutionFrequency: 'TwentyFour_Hours',
        complianceResourceId: 'AWS::RDS::DBInstance',
        complianceResourceTypes: [
          'AWS::RDS::DBInstance',
        ],
        owner: 'AWS',
        sourceDetails: [
          {
            eventSource: 'aws.config',
            messageType: 'ConfigurationItemChangeNotification',
            sourceIdentifier: 'AWS_RDS_ENCRYPTION',
          },
        ],
      },
      {
        name: 'S3 Bucket Logging',
        description: 'Checks that S3 buckets have logging enabled',
        inputParameters: {},
        maximumExecutionFrequency: 'TwentyFour_Hours',
        complianceResourceId: 'AWS::S3::Bucket',
        complianceResourceTypes: [
          'AWS::S3::Bucket',
        ],
        owner: 'AWS',
        sourceDetails: [
          {
            eventSource: 'aws.config',
            messageType: 'ConfigurationItemChangeNotification',
            sourceIdentifier: 'AWS_S3_BUCKET_LOGGING',
          },
        ],
      },
    ];

    for (const rule of hipaaRules) {
      new config.CfnConfigRule(this, `HipaaRule-${rule.name}`, {
        configRuleName: `HipaaRule-${rule.name}`,
        description: rule.description,
        inputParameters: rule.inputParameters,
        maximumExecutionFrequency: rule.maximumExecutionFrequency,
        scope: {
          complianceResourceId: rule.complianceResourceId,
          complianceResourceTypes: rule.complianceResourceTypes,
        },
        source: {
          owner: rule.owner,
          sourceDetails: rule.sourceDetails,
          sourceIdentifier: rule.sourceDetails[0].sourceIdentifier,
        },
      });
    }

    new CfnOutput(this, 'AwsConfigName', {
      value: configCompliance.ref,
    });

  }
}

export default ConfigComplianceHipaa;
