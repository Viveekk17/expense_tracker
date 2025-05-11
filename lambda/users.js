// Lambda function for user operations
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.USERS_TABLE;

exports.handler = async (event) => {
  try {
    const { httpMethod, path, body, pathParameters } = event;
    const userId = pathParameters ? pathParameters.userId : null;

    // GET user by ID
    if (httpMethod === 'GET' && userId) {
      const params = {
        TableName: TABLE_NAME,
        Key: { userId }
      };
      
      const result = await dynamoDB.get(params).promise();
      
      if (!result.Item) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'User not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.Item)
      };
    }
    
    // POST - create new user
    if (httpMethod === 'POST') {
      const user = JSON.parse(body);
      
      if (!user.userId || !user.email) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Missing required fields' })
        };
      }
      
      // Check if user already exists
      const existingUserParams = {
        TableName: TABLE_NAME,
        Key: { userId: user.userId }
      };
      
      const existingUser = await dynamoDB.get(existingUserParams).promise();
      
      if (existingUser.Item) {
        return {
          statusCode: 409,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'User already exists' })
        };
      }
      
      // Set default values
      user.monthlyBudget = user.monthlyBudget || 0;
      user.createdAt = user.createdAt || new Date().toISOString();
      
      const params = {
        TableName: TABLE_NAME,
        Item: user
      };
      
      await dynamoDB.put(params).promise();
      
      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      };
    }
    
    // PUT - update user
    if (httpMethod === 'PUT' && userId) {
      const updates = JSON.parse(body);
      
      // Get existing user first
      const existingUserParams = {
        TableName: TABLE_NAME,
        Key: { userId }
      };
      
      const existingUser = await dynamoDB.get(existingUserParams).promise();
      
      if (!existingUser.Item) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'User not found' })
        };
      }
      
      // Update only allowed fields
      const updatedUser = {
        ...existingUser.Item,
        ...(updates.monthlyBudget !== undefined && { monthlyBudget: updates.monthlyBudget })
      };
      
      const params = {
        TableName: TABLE_NAME,
        Item: updatedUser
      };
      
      await dynamoDB.put(params).promise();
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      };
    }
    
    // Method not allowed
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Method not allowed' })
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