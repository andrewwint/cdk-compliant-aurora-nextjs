import { StackProps, CfnOutput } from 'aws-cdk-lib';
import * as config from 'aws-cdk-lib/aws-config';
import { Construct } from 'constructs';


export interface ConfigComplianceSoc2Props extends StackProps {
  readonly projectName?: string;
  readonly roleArn?: string;
}

export class ConfigComplianceSoc2 extends Construct {
  constructor(scope: Construct, id: string, props?: ConfigComplianceSoc2Props) {
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
    const soc2Rules = [
      // Rules related to security, availability, processing integrity, confidentiality, and privacy
      {
        name: 'EC2_Instance_Security_Group_Ingress_Rules',
        description: 'Checks that the security groups attached to EC2 instances allow only necessary ingress traffic',
        inputParameters: { portNumber: 80, protocol: 'TCP', allowedCIDRs: '0.0.0.0/0' },
        maximumExecutionFrequency: 'TwentyFour_Hours',
        owner: 'AWS',
        sourceIdentifier: 'AWS_EC2_SECURITY_GROUP_INGRESS_RULES',
      },
      {
        name: 'S3_Bucket_Public_Access',
        description: 'Checks that S3 buckets do not allow public access',
        inputParameters: { maxAccessKeyAge: 60 },
        maximumExecutionFrequency: 'TwentyFour_Hours',
        owner: 'AWS',
        sourceIdentifier: 'AWS_S3_BUCKET_PUBLIC_ACCESS',
      },
      {
        name: 'RDS_Snapshot_Encryption',
        description: 'Checks that RDS snapshots are encrypted',
        inputParameters: { maxAccessKeyAge: 60 },
        maximumExecutionFrequency: 'TwentyFour_Hours',
        owner: 'AWS',
        sourceIdentifier: 'AWS_RDS_SNAPSHOT_ENCRYPTION',
      },
    ];

    for (const rule of soc2Rules) {
      new config.CfnConfigRule(this, `Soc2Rule-${rule.name}`, {
        configRuleName: `Soc2Rule-${rule.name}`,
        description: rule.description,
        inputParameters: rule.inputParameters,
        maximumExecutionFrequency: rule.maximumExecutionFrequency,
        scope: {
          complianceResourceTypes: [
            'AWS::EC2::Instance',
            'AWS::S3::Bucket',
            'AWS::RDS::DBSnapshot',
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

export default ConfigComplianceSoc2;
