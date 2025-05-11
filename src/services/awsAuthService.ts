import { 
  signUp as amplifySignUp, 
  confirmSignUp as amplifyConfirmSignUp,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  getCurrentUser as amplifyGetCurrentUser,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword
} from 'aws-amplify/auth';

interface SignUpParams {
  username: string;
  password: string;
  email: string;
}

interface SignInParams {
  username: string;
  password: string;
}

export const signUp = async ({ username, password, email }: SignUpParams) => {
  try {
    console.log('Starting sign up process...');
    const result = await amplifySignUp({
      username,
      password,
      options: {
        userAttributes: {
          email
        },
        autoSignIn: true
      }
    });
    console.log('Sign up successful:', result);
    return result;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const confirmSignUp = async (username: string, code: string) => {
  try {
    return await amplifyConfirmSignUp({
      username,
      confirmationCode: code
    });
  } catch (error) {
    console.error('Error confirming sign up:', error);
    throw error;
  }
};

export const signIn = async ({ username, password }: SignInParams) => {
  try {
    const result = await amplifySignIn({
      username,
      password
    });
    console.log('Sign in result:', result);
    return result;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await amplifySignOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await amplifyGetCurrentUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const forgotPassword = async (username: string) => {
  try {
    return await resetPassword({ username });
  } catch (error) {
    console.error('Error initiating forgot password flow:', error);
    throw error;
  }
};

export const forgotPasswordSubmit = async (
  username: string,
  code: string,
  newPassword: string
) => {
  try {
    return await confirmResetPassword({
      username,
      confirmationCode: code,
      newPassword
    });
  } catch (error) {
    console.error('Error submitting new password:', error);
    throw error;
  }
};

export const isAuthenticated = async () => {
  try {
    const session = await fetchAuthSession();
    return session.tokens !== undefined;
  } catch (error) {
    return false;
  }
}; 