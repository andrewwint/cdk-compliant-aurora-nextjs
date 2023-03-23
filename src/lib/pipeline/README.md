# CDK Pipeline Documentation

The CDK pipeline is a continuous delivery pipeline that allows you to automatically deploy AWS CDK applications to different environments or accounts. This pipeline is built using the AWS CDK, which is a software development framework for defining cloud infrastructure in code and provisioning it through AWS CloudFormation.

## How the pipeline works

The pipeline consists of multiple stages, where each stage is responsible for deploying a specific stack or a group of stacks. The pipeline starts by checking out the source code from the specified repository and branch. It then builds and synthesizes the AWS CDK app, generating CloudFormation templates. After that, the pipeline proceeds to deploy the stacks in each stage to the corresponding environments or accounts.

When you commit changes to the main branch, the pipeline will automatically trigger a new build and deployment process. The pipeline will update the infrastructure as needed, based on the changes in the AWS CDK app.

## Adding new stacks to the stages for deployment

To add a new stack to a stage for deployment, follow these steps:

1. Create a new AWS CDK stack class that defines the resources you want to deploy. You can use the existing stack classes in the lib folder as a reference.
2. In the lib/pipeline/cdk-pipeline-stage.ts file, import the new stack class you created.
3. Inside the CdkPipelineStage constructor, instantiate the new stack class and provide the necessary properties. You can use the existing stack instantiation as an example.

```typescript
Copy code
new YourNewStack(this, `YourNewStack-${props?.stage}`, {
  // Your stack properties go here
});
```

4. Commit and push your changes to the main branch. The pipeline will automatically detect the changes and start the deployment process.

## What happens when you commit to the main branch

When you commit changes to the main branch, the pipeline will automatically be triggered to deploy the updated infrastructure. The process includes the following steps:

1. The pipeline checks out the latest source code from the main branch of the specified repository.
2. It builds and synthesizes the AWS CDK app, generating CloudFormation templates for each stack.
3. The pipeline proceeds to deploy the stacks in each stage to the corresponding environments or accounts. It deploys the stacks in the order they were added to the pipeline.
4. Once the deployment is complete, the updated infrastructure will be live, and any resources that were modified, added, or removed will be updated accordingly.

By using this CDK pipeline, you can ensure that your infrastructure is always up-to-date and in sync with your application code, making it easy to manage and maintain your AWS resources.