import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CdkCompliantAuroraNextjsStack } from '../../lib/cdk-compliant-aurora-nextjs-stack';

// Define an interface for CdkPipelineStage properties
export interface CdkPipelineStageProps extends StageProps {
  readonly stageShort?: string;
  readonly stage?: string;
}

/**
 * CdkPipelineStage class represents a stage in the CDK pipeline.
 * It can be used to create different stages for deploying different stacks.
 */
export class CdkPipelineStage extends Stage {
  constructor(scope: Construct, id: string, props?: CdkPipelineStageProps) {
    super(scope, id, props);

    /**
     * Instantiate the CdkCompliantAuroraNextjsStack with specific properties.
     * This is where you can add stacks to be deployed in the target accounts.
     */
    new CdkCompliantAuroraNextjsStack(this, `CdkCompliantAuroraNextjsStack-${props?.stage}`, {
      projectName: 'patientportal', // Can only contain alphanumeric characters.
      emailSubscription: 'from@email.com',
      domainName: 'patient-portal.com',
      instanceSize: 'small',
      repositoryName: 'nextjs-prisma-webapp',
      repositoryOwner: 'andrewwint',
    });
  }
}
