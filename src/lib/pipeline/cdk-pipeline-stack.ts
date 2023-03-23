import { Stack, StackProps } from 'aws-cdk-lib';
import * as cdkpipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { CdkPipelineStage } from './cdk-pipeline-stage';
import { tagResources } from '../../bin/tag-resources';

// Define a class CdkPipelineStack that extends the Stack class from AWS CDK
export class CdkPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a new CDK pipeline instance
    const cdkPipeline = new cdkpipelines.CodePipeline(this, 'cdkPipeline', {
      pipelineName: 'cdkPipeline',
      crossAccountKeys: true,
      // Define the source code and build stage
      synth: new cdkpipelines.ShellStep('Synth', {
        // Define the source code repository and branch
        input: cdkpipelines.CodePipelineSource.connection(
          'andrewwint/cdk-compliant-aurora-nextjs',
          'main',
          { connectionArn: 'arn:aws:codestar-connections:us-east-1:790768631355:connection/25ca64e9-146a-4c1a-afca-85886e96af3b' },
        ),
        // Define commands to install dependencies
        installCommands: [
          'npm install',
        ],
        // Define commands to synthesize the CDK app
        commands: [
          'npx cdk synth',
        ],
      }),
    });

    // Create a new CDK pipeline stage for deploying the resources in the target AWS account
    const awsAccount = new CdkPipelineStage(this, 'compliant-aurora-nextjs', {
      env: {
        account: '991080086825',
        region: 'us-east-1',
      },
      stage: 'prd',
    });

    // Tag all resources in the target AWS account
    tagResources(awsAccount, (stack) => ({
      stackName: stack.stackName,
      stage: awsAccount.stageName,
    }));

    // Add the created pipeline stage to the CDK pipeline
    cdkPipeline.addStage(awsAccount);
  }
}
