import * as cdk from 'aws-cdk-lib';
import { CdkPipelineStack } from './lib/pipeline';

// Instantiate a new CDK app
const app = new cdk.App();

// Create a new CdkPipelineStack with the specified AWS account and region
new CdkPipelineStack(app, 'cdkPipelineStack', {
  env: {
    account: '790768631355',
    region: 'us-east-1',
  },
});

/**
 * Add a tag to the app. This tag will only apply to the pipeline stack
 * and not to the stacks that are deployed through the pipeline stages.
 */
cdk.Tags.of(app).add('type', 'cdk-deployment-pipeline');

// Synthesize the app (generate CloudFormation templates)
app.synth();
