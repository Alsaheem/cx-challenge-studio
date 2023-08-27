import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import path = require("path");
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";

export interface ItemApiProps {
  bucket: s3.IBucket;
  api: apigw.IRestApi;
}

export class ItemAPIFlow extends Construct {
  public readonly handler: lambda.Function;
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: ItemApiProps) {
    super(scope, id);

    // Create DynamoDB Table
    this.table = new dynamodb.Table(this, "cxStudioDataTable", {
      tableName: "cx-studio-db",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          "aws-sdk", // Use the 'aws-sdk' available in the Lambda runtime
        ],
      },
      depsLockFilePath: path.join(
        "lambda/items/",
        "package-lock.json"
      ),
      environment: {
        PRIMARY_KEY: "id",
        BUCKET_NAME: props.bucket.bucketName,
        TABLE_NAME: this.table.tableName,
      },
      runtime: lambda.Runtime.NODEJS_16_X,
    };
    // Create a Lambda function for each of the CRUD operations
    const createOnelambda = new NodejsFunction(this, "createOneItemFunction", {
      entry: path.join("lambda/items/", "create.js"), 
      ...nodeJsFunctionProps,
    });
    const getOneLambda = new NodejsFunction(this, "getOneItemFunction", {
      entry: path.join("lambda/items/", "get-one.js"),
      ...nodeJsFunctionProps,
    });
    const getAllLambda = new NodejsFunction(this, "getAllItemsFunction", {
      entry: path.join("lambda/items/", "get-all.js"),
      ...nodeJsFunctionProps,
    });
    const deleteOneLambda = new NodejsFunction(this, "deleteItemFunction", {
      entry: path.join("lambda/items/", "delete-one.js"),
      ...nodeJsFunctionProps,
    });

    // Grant the Lambda function read access to the DynamoDB table
    this.table.grantReadData(getAllLambda);
    this.table.grantReadData(getOneLambda);
    this.table.grantReadWriteData(deleteOneLambda);
    props.bucket.grantReadWrite(createOnelambda);
    this.table.grantReadWriteData(createOnelambda);

    // Integrate the Lambda functions with the API Gateway resource
    const getAllIntegration = new apigw.LambdaIntegration(getAllLambda);
    const getOneIntegration = new apigw.LambdaIntegration(getOneLambda);
    const createOneIntegration = new apigw.LambdaIntegration(createOnelambda);
    const deleteOneIntegration = new apigw.LambdaIntegration(deleteOneLambda);

    const items = props.api.root.addResource("items");
    items.addMethod("GET", getAllIntegration);
    items.addMethod("POST", createOneIntegration);

    const singleItem = items.addResource("{id}");
    singleItem.addMethod("GET", getOneIntegration);
    singleItem.addMethod("DELETE", deleteOneIntegration);
  }
}
