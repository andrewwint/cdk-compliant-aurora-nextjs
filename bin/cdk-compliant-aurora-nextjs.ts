#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkCompliantAuroraNextjsStack } from "../lib/cdk-compliant-aurora-nextjs-stack";

const app = new cdk.App();
new CdkCompliantAuroraNextjsStack(app, "CdkCompliantAuroraNextjsStack", {
  projectName: "patient-portal",
  emailSubscription: "from@email.com",
  domainName: "patient-portal.com",
  instanceSize: "small",
  repositoryName: "nextjs-prisma-webapp",
  repositoryOwner: "andrewwint",
});
