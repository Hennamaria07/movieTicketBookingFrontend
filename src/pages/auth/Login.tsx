import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { FormInput } from '../../components/ui/form-input';
import { authService } from '../../utils/services';
import { useAuth } from '../../contexts/AuthContext';
import { LoginData } from '../../types/user';
import { API_BASE_URL } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import {
  AiOutlineGoogle,
  AiOutlineFacebook,
  AiOutlineApple,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineLock,
  AiOutlineMail,
  AiOutlineMoon,
  AiOutlineSun
} from 'react-icons/ai';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check system preference or localStorage
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    // Apply theme class to document
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Handle token from social auth callback
  useEffect(() => {
    const handleSocialAuthCallback = async () => {
      const token = searchParams.get('token');
      if (token) {
        try {
          setIsLoading(true);
          // Verify the token
          const response = await authService.verifySocialToken(token);
          // Login the user
          login(token);
          navigate('/dashboard');
        } catch (err: any) {
          setError(err.response?.data?.message || 'Authentication failed');
        } finally {
          setIsLoading(false);
        }
      }
      
      // Check for error in URL
      const urlError = searchParams.get('error');
      if (urlError) {
        setError(decodeURIComponent(urlError));
      }
    };
    
    handleSocialAuthCallback();
  }, [searchParams, login, navigate]);

  const onSubmit = async (data: LoginData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login(data);
      login(response.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social login redirects
  const handleSocialLogin = (provider: string) => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const formVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 transition-colors duration-300",
      isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
    )}>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={formVariants}
        className={cn(
          "max-w-md w-full p-8 rounded-xl shadow-lg",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}
      >
        <div className="flex items-center justify-between mb-8">
          <motion.h1 
            variants={itemVariants}
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600"
          >
            MovieHub
          </motion.h1>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            )}
          >
            {isDarkMode ? (
              <AiOutlineSun className="h-5 w-5 text-yellow-300" />
            ) : (
              <AiOutlineMoon className="h-5 w-5 text-purple-600" />
            )}
          </motion.button>
        </div>

        {location.state?.message && (
          <motion.div 
            variants={itemVariants}
            className="p-3 mb-4 bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 rounded"
          >
            {location.state.message}
          </motion.div>
        )}
        
        {error && (
          <motion.div 
            variants={itemVariants}
            className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 rounded"
          >
            {error}
          </motion.div>
        )}
        
        <motion.form 
          onSubmit={handleSubmit(onSubmit)} 
          className="space-y-4"
          variants={formVariants}
        >
          <motion.div variants={itemVariants}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <AiOutlineMail className="h-5 w-5" />
              </span>
              <input
                id="email"
                type="email"
                placeholder="Email"
                {...register("email")}
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none",
                  isDarkMode 
                    ? "bg-gray-700 text-white border-gray-600 focus:ring-purple-500 focus:border-purple-500" 
                    : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-purple-500 focus:border-purple-500",
                  errors.email ? "border-red-500" : "border"
                )}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <AiOutlineLock className="h-5 w-5" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password")}
                className={cn(
                  "w-full pl-10 pr-10 py-3 rounded-lg focus:outline-none",
                  isDarkMode 
                    ? "bg-gray-700 text-white border-gray-600 focus:ring-purple-500 focus:border-purple-500" 
                    : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-purple-500 focus:border-purple-500",
                  errors.password ? "border-red-500" : "border"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible className="h-5 w-5" />
                ) : (
                  <AiOutlineEye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className={cn(
                  "h-4 w-4 rounded",
                  isDarkMode 
                    ? "bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500" 
                    : "bg-gray-100 border-gray-300 text-purple-600 focus:ring-purple-500"
                )}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <Link 
                to="/forgot-password" 
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                Forgot password?
              </Link>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-3 px-4 rounded-lg text-white transition-colors",
                "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
                isDarkMode && "focus:ring-offset-gray-800",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </motion.div>
        </motion.form>
        
        <motion.div variants={itemVariants} className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={cn(
                "w-full border-t",
                isDarkMode ? "border-gray-700" : "border-gray-300"
              )}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={cn(
                "px-2",
                isDarkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"
              )}>Or continue with</span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-3">
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => handleSocialLogin('google')}
              className={cn(
                "w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-colors",
                isDarkMode 
                  ? "border-gray-700 bg-gray-700 text-white hover:bg-gray-600" 
                  : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
              )}
            >
              <AiOutlineGoogle className="h-5 w-5" />
            </motion.button>
            
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className={cn(
                "w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-colors",
                isDarkMode 
                  ? "border-gray-700 bg-gray-700 text-white hover:bg-gray-600" 
                  : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
              )}
            >
              <AiOutlineFacebook className="h-5 w-5" />
            </motion.button>
            
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => handleSocialLogin('apple')}
              className={cn(
                "w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-colors",
                isDarkMode 
                  ? "border-gray-700 bg-gray-700 text-white hover:bg-gray-600" 
                  : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
              )}
            >
              <AiOutlineApple className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="mt-6 text-center"
        >
          <p className={cn(
            "text-sm",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-purple-600 hover:text-purple-500">
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginForm;