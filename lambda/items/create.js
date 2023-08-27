const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require("uuid");

exports.handler = async (event) => {
  try {
    // Get environment variables
    const bucketName = process.env.BUCKET_NAME;
    const tableName = process.env.TABLE_NAME;

    // Extract file content from the event body
    const requestData = JSON.parse(event.body);
    const fileContentBuffer = Buffer.from(requestData.fileContent, "base64");

    // Build params needed for s3
    const params = {
      Bucket: bucketName,
      Key: requestData.fileName,
      Body: fileContentBuffer,
      ContentEncoding: "base64",
    };

    // Upload the file content to S3
    await s3.putObject(params).promise();

    const uuid = uuidv4();
    const fileContentData = fileContentBuffer.toString();
    // Insert data into DynamoDB
    await dynamodb
      .put({
        TableName: tableName,
        Item: {
          id: uuid,
          username: requestData.username,
          fileName: requestData.fileName,
          fileContent: fileContentData,
          fileUrl: `https://${bucketName}.s3.ap-southeast-2.amazonaws.com/${requestData.fileName}`,
        },
      })
      .promise();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify("Item successfully created"),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify("An error occurred."),
    };
  }
};
