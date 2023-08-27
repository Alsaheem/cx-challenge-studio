import { Template } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { ItemAPIFlow } from "../lib/constructs/items";

test("DynamoDB Table Created", () => {
  const stack = new cdk.Stack();
  // WHEN
  new ItemAPIFlow(stack, "MyTestConstruct", {
    bucket: new s3.Bucket(stack, "testBucket", {
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
    }),
    api: new apigw.RestApi(stack, "testApi", {
      restApiName: "CX Studio Items API",
      description: "Items API for Cx-Studio Challenge",
    }),
  });
  // THEN

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
});
