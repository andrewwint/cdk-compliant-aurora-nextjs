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

    // Set up AWS Config rules for GDPR compliance
    const gdprRules = [
      {
        name: 'EC2_Instance_Metadata_Protection',
        description: 'Checks that EC2 instances have metadata protection enabled',
        maximumExecutionFrequency: 'TwentyFour_Hours',
        owner: 'AWS',
        sourceIdentifier: 'INSTANCE_METADATA_SERVICE_ENABLED',
      },
      {
        name: 'S3_Bucket_Encryption',
        description: 'Checks that S3 buckets have server-side encryption enabled',
        maximumExecutionFrequency: 'TwentyFour_Hours',
        owner: 'AWS',
        sourceIdentifier: 'S3_BUCKET_SERVER_SIDE_ENCRYPTION_ENABLED',
      },
      {
        name: 'Lambda_Function_Logging',
        description: 'Checks that Lambda functions have logging enabled',
        maximumExecutionFrequency: 'TwentyFour_Hours',
        owner: 'AWS',
        sourceIdentifier: 'LAMBDA_FUNCTION_LOGGING_ENABLED',
      },
    ];

    for (const rule of gdprRules) {
      new config.CfnConfigRule(this, `MyGdprRule-${rule.name}`, {
        configRuleName: `MyGdprRule-${rule.name}`,
        description: rule.description,
        maximumExecutionFrequency: rule.maximumExecutionFrequency,
        scope: {
          complianceResourceTypes: [
            'AWS::EC2::Instance',
            'AWS::S3::Bucket',
            'AWS::Lambda::Function',
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

export default ConfigComplianceGdpr;
