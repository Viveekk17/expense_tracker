# Campus Expense Compass

A comprehensive expense tracking application designed specifically for students to manage their finances. The application helps students track their expenses, set monthly budgets, categorize spending, and generate reports.

## Features

- **User Authentication**: Secure login and signup via AWS Cognito
- **Expense Tracking**: Add, view, and manage your expenses
- **Budget Management**: Set and track your monthly budget
- **Categorization**: Organize expenses by categories like Food, Travel, Rent, etc.
- **Reports**: Generate and download expense reports in CSV format
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React with TypeScript
- Vite for fast development
- shadcn-ui components
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching

### Backend (AWS)
- Amazon Cognito for authentication
- Amazon API Gateway for REST API
- AWS Lambda for serverless functions
- Amazon DynamoDB for database
- Amazon S3 for file storage

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- AWS Account (free tier eligible)

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd campus-expense-compass
```

2. Install dependencies:
```bash
npm install
```

3. Configure AWS services:
   - Follow the instructions in `DEPLOYMENT_GUIDE.md` to set up your AWS resources
   - Update `src/config/aws-config.ts` with your AWS credentials

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

This will create a production-ready build in the `dist` directory.

## Deployment

See the detailed deployment guide in `DEPLOYMENT_GUIDE.md` for step-by-step instructions on deploying the application to AWS.

## Project Structure

```
campus-expense-compass/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API and service functions
│   ├── lib/            # Utility functions
│   ├── config/         # Configuration files
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Entry point
├── lambda/             # AWS Lambda function code
├── public/             # Static assets
├── cloudformation.yaml # AWS CloudFormation template
└── DEPLOYMENT_GUIDE.md # AWS deployment instructions
```

## AWS Free Tier Usage

This application is designed to stay within AWS Free Tier limits:

- **Cognito**: Free tier includes 50,000 MAUs
- **Lambda**: Free tier includes 1M requests and 400,000 GB-seconds
- **API Gateway**: Free tier includes 1M API calls
- **DynamoDB**: Free tier includes 25 GB of storage and 25 WCU/RCU
- **S3**: Free tier includes 5GB of storage and 20,000 GET/PUT requests

Monitor your AWS usage to avoid unexpected charges.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
#   e x p e n s e _ t r a c k e r  
 