import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Lock, Mail, User, Shield } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full border shadow-lg glassmorphism transition-all duration-300 hover:shadow-xl">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 rounded-lg"></div>
      <CardHeader className="space-y-1">
        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center mb-2 shadow-lg">
          <User className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          {showConfirmation 
            ? 'Verify Your Account' 
            : activeTab === 'login' ? 'Welcome Back' : 'Create Account'
          }
        </CardTitle>
        <CardDescription className="text-center">
          {showConfirmation 
            ? 'Enter the verification code sent to your email' 
            : activeTab === 'login' ? 'Enter your credentials to access your account' : 'Fill in your details to get started'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showConfirmation ? (
          <form onSubmit={handleConfirmSignUp} className="space-y-4">
            <div className="space-y-2">
              <div className="relative group">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <Input
                  id="confirmation-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="pl-10 transition-all focus:border-primary"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative group">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <Input
                  id="confirmation-code"
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="Enter verification code"
                  className="pl-10 transition-all focus:border-primary"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full font-semibold bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 transition-all duration-300" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Account'}
            </Button>
          </form>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-4">
                  <div className="relative group">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                      id="login-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="pl-10 transition-all focus:border-primary dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="pl-10 transition-all focus:border-primary dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground"
                      disabled={isLoading}
                      required
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 transition-all duration-300" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-4">
                  <div className="relative group">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                      id="signup-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      className="pl-10 transition-all focus:border-primary dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="pl-10 transition-all focus:border-primary dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Choose a password"
                      className="pl-10 transition-all focus:border-primary dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground"
                      disabled={isLoading}
                      required
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                      id="signup-confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="pl-10 transition-all focus:border-primary dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 transition-all duration-300" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground pt-0">
        <p className="w-full">
          {activeTab === 'login' 
            ? 'Securely manage your campus expenses with us' 
            : 'Your data is encrypted and secure with us'}
        </p>
      </CardFooter>
    </Card>
  );
};

export default AuthForm; 