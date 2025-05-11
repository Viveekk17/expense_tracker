import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as authService from '../../services/awsAuthService';
import { isAuthenticated } from '../../services/awsAuthService';

const AuthForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Add immediate redirect after login
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (loginSuccess) {
          // Force navigation to homepage
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    };

    checkAuthStatus();
  }, [loginSuccess, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await authService.signIn({ username, password });
      
      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        toast({
          title: 'Verification required',
          description: 'Please verify your account with the code sent to your email.',
          variant: 'default',
        });
        setShowConfirmation(true);
        setIsLoading(false);
        return;
      }
      
      toast({
        title: 'Login successful',
        description: 'You are now logged in!',
        variant: 'default',
      });
      
      // Set login success flag to trigger redirect
      setLoginSuccess(true);
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'There was an error logging in.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !email || !confirmPassword) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'The passwords you entered do not match.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await authService.signUp({ username, password, email });
      console.log('Sign up result:', result);
      
      if (!result.isSignUpComplete) {
        toast({
          title: 'Sign up successful',
          description: 'Please check your email for a verification code.',
          variant: 'default',
        });
        setShowConfirmation(true);
      } else {
        // If auto sign-in is enabled and successful
        toast({
          title: 'Account created successfully',
          description: 'You are now logged in!',
          variant: 'default',
        });
        // Set login success flag to trigger redirect
        setLoginSuccess(true);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Sign up failed',
        description: error.message || 'There was an error signing up.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !confirmationCode) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await authService.confirmSignUp(username, confirmationCode);
      console.log('Confirmation result:', result);
      
      toast({
        title: 'Verification successful',
        description: 'Your account has been verified. You can now log in.',
        variant: 'default',
      });
      setActiveTab('login');
      setShowConfirmation(false);
    } catch (error: any) {
      toast({
        title: 'Verification failed',
        description: error.message || 'There was an error verifying your account.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {showConfirmation 
            ? 'Verify Your Account' 
            : activeTab === 'login' ? 'Login to Your Account' : 'Create an Account'
          }
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showConfirmation ? (
          <form onSubmit={handleConfirmSignUp} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="confirmation-username" className="text-sm font-medium">Username</label>
              <Input
                id="confirmation-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmation-code" className="text-sm font-medium">Confirmation Code</label>
              <Input
                id="confirmation-code"
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="Enter the code sent to your email"
                disabled={isLoading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Account'}
            </Button>
          </form>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="login-username" className="text-sm font-medium">Username</label>
                  <Input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="login-password" className="text-sm font-medium">Password</label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="signup-username" className="text-sm font-medium">Username</label>
                  <Input
                    id="signup-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium">Email</label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium">Password</label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a password"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-confirm-password" className="text-sm font-medium">Confirm Password</label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing up...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthForm; 