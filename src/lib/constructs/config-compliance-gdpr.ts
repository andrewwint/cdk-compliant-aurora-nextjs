import { StackProps, CfnOutput } from 'aws-cdk-lib';
import * as config from 'aws-cdk-lib/aws-config';
import { Construct } from 'constructs';

export interface ConfigComplianceGdpr2Props extends StackProps {
  readonly projectName?: string;
  readonly roleArn?: string;
}

export class ConfigComplianceGdpr extends Construct {
  constructor(scope: Construct, id: string, props?: ConfigComplianceGdpr2Props) {
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
    // - EC2 instances have metadata protection enabled
    // - S3 buckets have server-side encryption enabled
    // - Lambda functions have logging enabled

    const gdprRules = [
      // Rules related to security, availability, processing integrity, confidentiality, and privacy
      {
        name: 'EC2 Instance Metadata Protection',
        description: 'Checks that EC2 instances have metadata protection enabled',
        inputParameters: { maxAccessKeyAge: 60 },
        maximumExecutionFrequency: 'TwentyFour_Hours',
        complianceResourceId: 'AWS::EC2::Instance',
        complianceResourceTypes: [
          'AWS::EC2::Instance',
        ],
        owner: 'AWS',
        sourceDetails: [
          {
            eventSource: 'aws.config',
            messageType: 'ConfigurationItemChangeNotification',
            sourceIdentifier: 'AWS_EC2_METADATA_PROTECTION',
          },
        ],
      },
      {
        name: 'S3 Bucket Encryption',
        description: 'Checks that S3 buckets have server-side encryption enabled',
        inputParameters: { maxAccessKeyAge: 60 },
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
            sourceIdentifier: 'AWS_S3_BUCKET_ENCRYPTION',
          },
        ],
      },
      {
        name: 'Lambda Function Logging',
        description: 'Checks that Lambda functions have logging enabled',
        inputParameters: { maxAccessKeyAge: 60 },
        maximumExecutionFrequency: 'TwentyFour_Hours',
        complianceResourceId: 'AWS::Lambda::Function',
        complianceResourceTypes: [
          'AWS::Lambda::Function',
        ],
        owner: 'AWS',
        sourceDetails: [
          {
            eventSource: 'aws.config',
            messageType: 'ConfigurationItemChangeNotification',
            sourceIdentifier: 'AWS_LAMBDA_FUNCTION_LOGGING',
          },
        ],
      },
    ];

    for (const rule of gdprRules) {
      new config.CfnConfigRule(this, `MyGdprRule-${rule.name}`, {
        configRuleName: `MyGdprRule-${rule.name}`,
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

export default ConfigComplianceGdpr;
