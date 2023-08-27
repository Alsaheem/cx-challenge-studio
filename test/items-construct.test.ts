import * as cdk from "aws-cdk-lib";
import { Template, Capture } from "aws-cdk-lib/assertions";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { ItemAPIFlow } from "../lib/constructs/items";

test("Lambda Has Environment Variables", () => {
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
      restApiName: "test CX Studio Items API",
      description: "test Items API for Cx-Studio Challenge",
    }),
  });
  // THEN
  const template = Template.fromStack(stack);
  const envCapture = new Capture();
  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });

  expect(envCapture.asObject()).toEqual({
    Variables: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      BUCKET_NAME: { Ref: "testBucketDF4D7D1A" },
      PRIMARY_KEY: "id",
      TABLE_NAME: { Ref: "MyTestConstructcxStudioDataTableFAEA9912" },
    },
  });
});

