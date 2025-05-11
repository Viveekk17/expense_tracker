// Lambda function for expense operations
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.EXPENSES_TABLE;

exports.handler = async (event) => {
  try {
    const { httpMethod, path, body, pathParameters } = event;
    const expenseId = pathParameters && pathParameters.expenseId;
    const userId = pathParameters && pathParameters.userId;
    
    // GET expense by ID
    if (httpMethod === 'GET' && expenseId) {
      const params = {
        TableName: TABLE_NAME,
        Key: { expenseId }
      };
      
      const result = await dynamoDB.get(params).promise();
      
      if (!result.Item) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Expense not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.Item)
      };
    }
    
    // GET expenses by user ID
    if (httpMethod === 'GET' && userId) {
      const params = {
        TableName: TABLE_NAME,
        IndexName: 'UserIdIndex', // GSI for userId
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      };
      
      const result = await dynamoDB.query(params).promise();
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.Items)
      };
    }
    
    // POST - create new expense
    if (httpMethod === 'POST') {
      const expense = JSON.parse(body);
      
      if (!expense.userId || !expense.expenseId || !expense.amount || !expense.category || !expense.date) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Missing required fields' })
        };
      }
      
      const params = {
        TableName: TABLE_NAME,
        Item: expense
      };
      
      await dynamoDB.put(params).promise();
      
      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      };
    }
    
    // PUT - update expense
    if (httpMethod === 'PUT' && expenseId) {
      const updates = JSON.parse(body);
      
      // Get existing expense first
      const existingExpenseParams = {
        TableName: TABLE_NAME,
        Key: { expenseId }
      };
      
      const existingExpense = await dynamoDB.get(existingExpenseParams).promise();
      
      if (!existingExpense.Item) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Expense not found' })
        };
      }
      
      // Check if user is authorized (expense belongs to user)
      if (updates.userId && existingExpense.Item.userId !== updates.userId) {
        return {
          statusCode: 403,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Not authorized to update this expense' })
        };
      }
      
      // Update allowed fields
      const updatedExpense = {
        ...existingExpense.Item,
        ...(updates.amount !== undefined && { amount: updates.amount }),
        ...(updates.category && { category: updates.category }),
        ...(updates.date && { date: updates.date }),
        ...(updates.description !== undefined && { description: updates.description })
      };
      
      const params = {
        TableName: TABLE_NAME,
        Item: updatedExpense
      };
      
      await dynamoDB.put(params).promise();
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedExpense)
      };
    }
    
    // DELETE - delete expense
    if (httpMethod === 'DELETE' && expenseId) {
      // Get existing expense first to check ownership
      const existingExpenseParams = {
        TableName: TABLE_NAME,
        Key: { expenseId }
      };
      
      const existingExpense = await dynamoDB.get(existingExpenseParams).promise();
      
      if (!existingExpense.Item) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Expense not found' })
        };
      }
      
      // Delete the expense
      const params = {
        TableName: TABLE_NAME,
        Key: { expenseId }
      };
      
      await dynamoDB.delete(params).promise();
      
      return {
        statusCode: 204,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Expense deleted successfully' })
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