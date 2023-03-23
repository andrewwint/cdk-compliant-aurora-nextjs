import { Stack, Aspects, TagManager, IResource } from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * Tag all supported resources within an application.
 *
 * CDK will propagate tags too all resources that support it.
 */
export function tagResources(scope: Construct, tags: (stack: Stack) => Record<string, string>): void {
  Aspects.of(scope).add({
    visit(construct: IResource) {
      if (TagManager.isTaggable(construct)) {
        // We pick the last stack in chain to support stages where
        // there are multiple stacks.
        const allStacks = construct.node.scopes.filter((it): it is Stack => Stack.isStack(it));

        const stack = allStacks.length > 0 ? allStacks[allStacks.length - 1] : undefined;
        if (stack != null) {
          for (const [key, value] of Object.entries(tags(stack))) {
            construct.tags.setTag(key, value, 100, true);
          }
        }
      }
    },
  });
}
