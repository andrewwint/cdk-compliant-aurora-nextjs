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

    // Set up AWS Config rules for HIPAA compliance
    const hipaaRules = [
      {
        name: 'EBS_Volume_Encryption',
        description: 'Checks that EBS volumes attached to EC2 instances are encrypted',
        inputParameters: {},
        maximumExecutionFrequency: 'TwentyFour_Hours',
        owner: 'AWS',
        sourceIdentifier: 'EBS_ENCRYPTED_VOLUMES',
      },
      {
        name: 'RDS_Encryption',
        description: 'Checks that RDS instances are encrypted',
        inputParameters: {},
        maximumExecutionFrequency: 'TwentyFour_Hours',
        owner: 'AWS',
        sourceIdentifier: 'RDS_STORAGE_ENCRYPTED',
      },
      {
        name: 'S3_Bucket_Logging',
        description: 'Checks that S3 buckets have logging enabled',
        inputParameters: {},
        maximumExecutionFrequency: 'TwentyFour_Hours',
        owner: 'AWS',
        sourceIdentifier: 'S3_BUCKET_LOGGING_ENABLED',
      },
    ];

    for (const rule of hipaaRules) {
      new config.CfnConfigRule(this, `HipaaRule-${rule.name}`, {
        configRuleName: `HipaaRule-${rule.name}`,
        description: rule.description,
        inputParameters: rule.inputParameters,
        maximumExecutionFrequency: rule.maximumExecutionFrequency,
        scope: {
          complianceResourceTypes: [
            'AWS::EC2::Volume',
            'AWS::RDS::DBInstance',
            'AWS::S3::Bucket',
          ],
        },
        source: {
          owner: rule.owner,
          sourceIdentifier: rule.sourceIdentifier,
        },
      });
    }

    new CfnOutput(this, 'AwsConfigName', {
      value: configCompliance.ref,
    });

  }
}

export default ConfigComplianceHipaa;
