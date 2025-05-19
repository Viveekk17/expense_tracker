# Walence - AWS Deployment Guide

This guide will walk you through the steps required to deploy the Walence application on AWS services. The application uses AWS Cognito for authentication, API Gateway and Lambda for the backend, DynamoDB for the database, and S3 for report storage.

## Prerequisites

1. AWS Account (free tier eligible)
2. AWS CLI installed and configured on your machine
3. Node.js (v14+) and npm
4. Git

## Step 1: Create AWS Resources

### Option 1: Using CloudFormation (Recommended)

1. Log in to your AWS Management Console
2. Go to the CloudFormation service
3. Click "Create stack" > "With new resources (standard)"
4. Select "Upload a template file" and upload the `cloudformation.yaml` file from this repository
5. Click "Next"
6. Enter a Stack name (e.g., `walence`)
7. Keep the default Stage as `dev` (or change to `prod` if desired)
8. Click "Next", "Next" again, and then "Create stack"
9. Wait for the stack creation to complete (takes about 5-10 minutes)
10. Go to the "Outputs" tab of your stack and note down the values (you'll need them in Step 3)

### Option 2: Manual Setup

If you prefer to set up each service manually:

1. **Cognito User Pool**:
   - Go to Amazon Cognito in the AWS Console
   - Click "Create user pool"
   - Follow prompts to create a user pool with email sign-in and verification
   - Create an app client (without a client secret)
   - Note the User Pool ID and App Client ID

2. **DynamoDB Tables**:
   - Create a table named `Walence-Users-dev` with partition key `userId` (string)
   - Create a table named `Walence-Expenses-dev` with partition key `expenseId` (string)
   - Add a GSI named `UserIdIndex` with partition key `userId` to the expenses table

3. **S3 Bucket**:
   - Create a bucket for storing reports (e.g., `walence-reports-dev-YOUR_ACCOUNT_ID`)
   - Configure CORS to allow access from your web app

4. **Lambda Functions**:
   - Create three Lambda functions for users, expenses, and reports
   - Upload the code from the `lambda` directory
   - Configure environment variables to point to your DynamoDB tables and S3 bucket

5. **API Gateway**:
   - Create a REST API
   - Set up resources and methods to match the paths used in the app
   - Connect the methods to your Lambda functions
   - Deploy the API and note the endpoint URL

## Step 2: Update Configuration in Frontend App

1. Open the `src/config/aws-config.ts` file in your project
2. Replace the placeholder values with your actual AWS resource values:

```typescript
const awsConfig = {
  Auth: {
    region: 'YOUR_AWS_REGION', // e.g., 'us-east-1'
    userPoolId: 'YOUR_USER_POOL_ID',
    userPoolWebClientId: 'YOUR_APP_CLIENT_ID',
  },
  API: {
    endpoints: [
      {
        name: 'expenseApi',
        endpoint: 'YOUR_API_GATEWAY_ENDPOINT', // e.g., 'https://abc123.execute-api.us-east-1.amazonaws.com/dev'
        region: 'YOUR_AWS_REGION',
      },
    ],
  },
  Storage: {
    AWSS3: {
      bucket: 'YOUR_S3_BUCKET_NAME',
      region: 'YOUR_AWS_REGION',
    }
  }
};
```

## Step 3: Deploy Lambda Functions

This step is only needed if you used CloudFormation, as the Lambda functions in the template contain placeholder code.

1. Navigate to the Lambda service in AWS Console
2. For each function (Users, Expenses, Reports):
   - Select the function
   - In the "Code" tab, scroll down to find the code editor
   - Replace the placeholder code with the corresponding code from the `lambda` directory
   - Click "Deploy" to save the changes

## Step 4: Build and Deploy Frontend

### Option 1: Deploy to AWS Amplify (Recommended)

1. Install the AWS Amplify CLI:
   ```
   npm install -g @aws-amplify/cli
   ```

2. Build your application:
   ```
   npm run build
   ```

3. Deploy with Amplify:
   ```
   amplify init
   amplify add hosting
   amplify publish
   ```

4. Follow the prompts to complete the deployment
5. Amplify will provide a URL for your deployed application

### Option 2: Deploy to S3 with CloudFront

1. Build your application:
   ```
   npm run build
   ```

2. Create an S3 bucket for hosting
3. Upload the contents of the `dist` directory to your S3 bucket
4. Configure the bucket for static website hosting
5. (Optional) Set up a CloudFront distribution for better performance and HTTPS

## Step 5: Test Your Deployed Application

1. Open the URL provided by Amplify or your S3 website endpoint
2. Create a new account by signing up
3. Verify your email using the confirmation code sent to you
4. Log in and start using the expense tracker

## Troubleshooting

### CORS Issues

If you encounter CORS issues:

1. Go to API Gateway in AWS Console
2. Select your API
3. Go to "Resources"
4. Select "Actions" > "Enable CORS"
5. Click "Enable CORS and replace existing CORS headers"
6. Deploy your API again

### Authentication Issues

1. Make sure your Cognito User Pool is configured correctly
2. Check that the User Pool ID and App Client ID are correct in your aws-config.ts file
3. Ensure you've confirmed your user account with the verification code

### Lambda Function Issues

1. Test your Lambda functions directly in the AWS Console
2. Check CloudWatch Logs for error messages
3. Verify that environment variables are set correctly

## Free Tier Usage Limits

To stay within AWS Free Tier limits:

- **Cognito**: Free tier includes 50,000 MAUs
- **Lambda**: Free tier includes 1M requests per month and 400,000 GB-seconds of compute time
- **API Gateway**: Free tier includes 1M API calls per month
- **DynamoDB**: Free tier includes 25 GB of storage and 25 WCU/RCU
- **S3**: Free tier includes 5GB of standard storage and 20,000 GET/PUT requests

Monitor your usage in the AWS Billing Dashboard to avoid unexpected charges.

## Maintenance

1. Regularly update your dependencies to keep the application secure
2. Monitor CloudWatch Logs for errors
3. Set up CloudWatch Alarms to be notified of high usage or errors

For more information, consult the official AWS documentation. 