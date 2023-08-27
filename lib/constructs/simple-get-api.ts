import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import path = require("path");

export interface SimpleGetAPIProps {
  api: apigw.IRestApi;
  apiPath: string;
  handler: string;
}

export class SimpleGetAPI extends Construct {
  public readonly handler: lambda.Function;

  constructor(scope: Construct, id: string, props: SimpleGetAPIProps) {
    super(scope, id);

    const lambdaFn = new lambda.Function(this, id, {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: props.handler,
      code: lambda.Code.fromAsset(path.join("lambda")),
    });
    // Connect Create Lambda to ApiGateway
    const apiIntegration = new apigw.LambdaIntegration(lambdaFn);
    if (props.apiPath != "") {
      const healthCheckApi = props.api.root.addResource(props.apiPath);
      healthCheckApi.addMethod("GET", apiIntegration);
    } else {
      props.api.root.addMethod("GET", apiIntegration);
    }
  }
}
