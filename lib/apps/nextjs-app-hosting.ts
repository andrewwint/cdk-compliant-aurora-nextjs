// Contrust for hosting NextJS 13 app on AWS Amplify
// https://aws.amazon.com/blogs/mobile/deploy-a-nextjs-13-application-to-amplify-with-the-aws-cdk/

import { CfnOutput, SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import {
  App,
  GitHubSourceCodeProvider,
  RedirectStatus,
} from "@aws-cdk/aws-amplify-alpha";

export interface NextjsAppHostingProps extends StackProps {
  readonly projectName?: string;
  readonly owner: string;
  readonly domainName: string;
  readonly repositoryName: string;
  readonly githubOauthTokenName: string;
  readonly environmentVariables?: { [name: string]: string };
}

export class NextjsAppHosting extends Stack {
  constructor(scope: Construct, id: string, props?: NextjsAppHostingProps) {
    super(scope, id, props);

    const projectName = props?.projectName || "nextjs-aws-amplify";
    const environmentVariables = props?.environmentVariables || {};
    const owner = props?.owner || "johndoe";
    const repository = props?.repositoryName || "nextjs-aws-amplify";
    const domainName = props?.domainName || "example.com";
    const githubOauthTokenName =
      props?.githubOauthTokenName || "github-oauth-token";

    const amplifyApp = new App(this, "WebApp", {
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: owner,
        repository: repository,
        oauthToken: SecretValue.secretsManager(githubOauthTokenName),
      }),
      customRules: [
        {
          source: "/<*>",
          target: "	/index.html",
          status: RedirectStatus.NOT_FOUND_REWRITE,
        },
      ],
      environmentVariables: environmentVariables,

      // Alternatively add a `amplify.yml` to the repository root
      // buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml')
      buildSpec: codebuild.BuildSpec.fromObjectToYaml({
        version: 1,
        frontend: {
          phases: {
            preBuild: {
              commands: ["npm ci"],
            },
            build: {
              commands: ["npm run build"],
            },
          },
          artifacts: {
            baseDirectory: ".next",
            files: ["**/*"],
          },
          cache: {
            paths: ["node_modules/**/*"],
          },
        },
      }),
    });

    const main = amplifyApp.addBranch("main", { stage: "PRODUCTION" });

    // Add domain and map to main branch
    // See Example Test for more details on how to use this construct:
    // https://github.com/aws/aws-cdk/blob/v2.69.0/packages/%40aws-cdk/aws-amplify/test/domain.test.ts

    if (domainName) {
      const domain = amplifyApp.addDomain(domainName, {
        enableAutoSubdomain: true,
      });
      domain.mapRoot(main);
      domain.mapSubDomain(main, "www");
    }
  }
}

export default NextjsAppHosting;
