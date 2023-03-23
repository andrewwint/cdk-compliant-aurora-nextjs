// AWS Pinpoint Construct Library
// See: https://docs.aws.amazon.com/pinpoint/latest/developerguide/welcome.html
// Path: lib/constructs/pinpoint.ts

import { StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as pinpoint from 'aws-cdk-lib/aws-pinpoint';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

export interface PinpointProps extends StackProps {
  readonly projectName: string;
  readonly emailSubscription?: string;
}

export class Pinpoint extends Construct {
  constructor(scope: Construct, id: string, props: PinpointProps) {
    super(scope, id);
    const projectName = props.projectName;
    const emailSubscription = props?.emailSubscription || 'support@company.com';

    // Aurora DB Key
    new pinpoint.CfnApp(this, 'PinpointApp', {
      name: props.projectName || 'patient-portal',
    });

    // Create IAM Role for Pinpoint
    new iam.Role(this, 'PinpointRole', {
      assumedBy: new iam.ServicePrincipal('pinpoint.amazonaws.com'),
    });

    const topic = new sns.Topic(this, 'Topic', {
      topicName: projectName + '-topic',
      displayName: projectName + '-topic',
      masterKey: new kms.Key(this, 'TopicKey', {
        enableKeyRotation: true,
      }),
    });

    // Allow SNS to communicate with Pinpoint
    topic.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('pinpoint.amazonaws.com')],
        actions: ['SNS:Publish'],
        resources: [topic.topicArn],
      }),
    );

    // Add Email Subscription to the SNS Topic
    topic.addSubscription(
      new subscriptions.EmailSubscription(emailSubscription),
    );
  }
}

export default Pinpoint;
