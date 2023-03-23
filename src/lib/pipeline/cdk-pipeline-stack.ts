import { Stack, StackProps } from 'aws-cdk-lib';
import * as cdkpipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { CdkPipelineStage } from './cdk-pipeline-stage';
import { tagResources } from '../../bin/tag-resources';


export class CdkPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);


    const cdkPipeline = new cdkpipelines.CodePipeline(this, 'cdkPipeline', {
      pipelineName: 'cdkPipeline',
      crossAccountKeys: true,
      // Where the source can be found
      synth: new cdkpipelines.ShellStep('Synth', {
        input: cdkpipelines.CodePipelineSource.connection(
          'andrewwint/cdk-compliant-aurora-nextjs',
          'main',
          { connectionArn: 'arn:aws:codestar-connections:us-east-1:790768631355:connection/25ca64e9-146a-4c1a-afca-85886e96af3b' },
        ),
        commands: [
          'npm install',
        ],
      }),
    });

    const awsAccount = new CdkPipelineStage(this, 'compliant-aurora-nextjs', {
      env: {
        account: '991080086825',
        region: 'us-east-1',
      },
      stage: 'prd',
    });

    // Tags all the resources in the target account
    tagResources(awsAccount, (stack) => ({
      stackName: stack.stackName,
      stage: awsAccount.stageName,
    }));

    // Creates a pipeline stage which deploys to the target account
    cdkPipeline.addStage(awsAccount);
  }
}
