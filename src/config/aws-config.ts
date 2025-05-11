import { Amplify } from 'aws-amplify';

// Proper format for Amplify v6
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_wNpTnoRxF',
      userPoolClientId: 'q87iitd1tceeikp0jkn0chm02',
      loginWith: {
        username: true,
        email: false
      }
    },
    region: 'us-east-1'
  },
  API: {
    REST: {
      'CampusExpenseCompassAPI': {
        endpoint: 'https://i6nn3gptzh.execute-api.us-east-1.amazonaws.com/dev',
        region: 'us-east-1',
        custom_header: async () => {
          return {
            'Content-Type': 'application/json'
          };
        }
      }
    }
  },
  Storage: {
    S3: {
      bucket: 'expensetrackapp1105',
      region: 'us-east-1'
    }
  }
};

export const configureAws = () => {
  try {
    console.log('Configuring Amplify with client ID:', awsConfig.Auth.Cognito.userPoolClientId);
    console.log('API configuration:', JSON.stringify(awsConfig.API, null, 2));
    Amplify.configure(awsConfig);
    console.log('Amplify configured successfully');
  } catch (error) {
    console.error('Error configuring Amplify:', error);
  }
};

export default awsConfig; 