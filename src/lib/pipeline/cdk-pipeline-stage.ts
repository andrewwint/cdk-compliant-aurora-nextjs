import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CdkCompliantAuroraNextjsStack } from '../../lib/cdk-compliant-aurora-nextjs-stack';


export interface CdkPipelineStageProps extends StageProps {
  readonly stageShort?: string;
  readonly stage?: string;
}

/**
 * Here we can create different stages that are used to deploy different stacks.
 */
export class CdkPipelineStage extends Stage {
  constructor(scope: Construct, id: string, props?: CdkPipelineStageProps) {
    super(scope, id, props);

    /**  Here you can add your stacks which you want to deploy on the target accounts */
    new CdkCompliantAuroraNextjsStack(this, `CdkCompliantAuroraNextjsStack-${props?.stage}`, {
      projectName: 'patient-portal',
      emailSubscription: 'from@email.com',
      domainName: 'patient-portal.com',
      instanceSize: 'small',
      repositoryName: 'nextjs-prisma-webapp',
      repositoryOwner: 'andrewwint',
    });
  }
}
