// Lambda function for generating expense reports
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const EXPENSES_TABLE = process.env.EXPENSES_TABLE;
const REPORTS_BUCKET = process.env.REPORTS_BUCKET;

exports.handler = async (event) => {
  try {
    const { httpMethod, pathParameters } = event;
    const userId = pathParameters && pathParameters.userId;
    
    if (httpMethod !== 'GET' || !userId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Invalid request' })
      };
    }
    
    // Fetch user's expenses
    const params = {
      TableName: EXPENSES_TABLE,
      IndexName: 'UserIdIndex', // GSI for userId
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };
    
    const result = await dynamoDB.query(params).promise();
    
    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'No expenses found for this user' })
      };
    }
    
    // Generate CSV content
    const headers = 'Date,Amount,Category,Description\n';
    const rows = result.Items.map(expense => 
      `${expense.date},${expense.amount},${expense.category},${expense.description || ''}`
    ).join('\n');
    
    const csvContent = headers + rows;
    const fileName = `expense-report-${userId}-${new Date().toISOString()}.csv`;
    
    // Upload to S3
    const s3Params = {
      Bucket: REPORTS_BUCKET,
      Key: fileName,
      Body: csvContent,
      ContentType: 'text/csv',
      ContentDisposition: `attachment; filename="${fileName}"`,
      ACL: 'private' // Keep private and use presigned URL
    };
    
    await s3.putObject(s3Params).promise();
    
    // Generate presigned URL (valid for 60 minutes)
    const url = s3.getSignedUrl('getObject', {
      Bucket: REPORTS_BUCKET,
      Key: fileName,
      Expires: 3600 // 1 hour in seconds
    });
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
}; 