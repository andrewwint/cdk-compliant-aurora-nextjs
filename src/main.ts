import * as cdk from 'aws-cdk-lib';
import { CdkPipelineStack } from './lib/pipeline';

const app = new cdk.App();

new CdkPipelineStack(app, 'cdkPipelineStack', {
  env: {
    account: '790768631355',
    region: 'us-east-1',
  },
});

/* These tags only apply to the pipeline stack, not the
stacks that are deployed through the pipeline stages */
cdk.Tags.of(app).add('type', 'cdk-deployment-pipeline');

app.synth();
