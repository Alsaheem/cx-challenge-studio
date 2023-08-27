import { Stack, StackProps } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { TableViewer } from "cdk-dynamo-table-viewer";
import { ItemAPIFlow } from "./constructs/items";
import { SimpleGetAPI } from "./constructs/simple-get-api";

export class CxStudioStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create an S3 bucket
    const bucket = new s3.Bucket(this, "fileUploadBucket", {
      bucketName: "cx-studio-items-bucket",
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
    });

    // Create API Gateway
    const api = new apigw.RestApi(this, "cxStudioApi", {
      restApiName: "CX Studio Items API",
      description: "Items API for Cx-Studio Challenge",
    });

    // this construct contains everything needed to create the items API
    const itemsAPI = new ItemAPIFlow(this, "ItemsAPI", {
      bucket: bucket,
      api: api,
    });

    // Dynamodb table viewer
    new TableViewer(this, "viewDynammoData", {
      title: "Cx Studio Data Dump",
      table: itemsAPI.table,
    });

    // health Api stack
    new SimpleGetAPI(this, "healthCheckApi", {
      api: api,
      handler: "health.handler",
      apiPath: "health",
    });

    // welcome Api
    new SimpleGetAPI(this, "welcomeApi", {
      api: api,
      handler: "welcome.handler",
      apiPath: "",
    });
  }
}
