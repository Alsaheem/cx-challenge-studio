#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CxStudioStack } from '../lib/cx-studio-stack';

const app = new cdk.App();
new CxStudioStack(app, 'CxStudioStack');
