import { Template } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { SimpleGetAPI } from "../lib/constructs/simple-get-api";

test("Lambda Function Created", () => {
  const stack = new cdk.Stack();
  // WHEN
  new SimpleGetAPI(stack, "testSimpleAPi", {
    api: new apigw.RestApi(stack, "testCxStudioApi", {
      restApiName: "test CX Studio Items API",
      description: "test Items API for Cx-Studio Challenge",
    }),
    handler: "test.handler",
    apiPath: "test",
  });
  // THEN

  const template = Template.fromStack(stack);
  console.log(template);
  template.resourceCountIs("AWS::Lambda::Function", 1);
});
