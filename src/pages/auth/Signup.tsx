import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { authService } from '../../utils/services';
import { cn } from '../../lib/utils';
import {
  AiOutlineUser,
  AiOutlineMail,
  AiOutlineLock,
  AiOutlinePhone,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineUpload,
  AiOutlineMoon,
  AiOutlineSun
} from 'react-icons/ai';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Form validation schema
const schema = yup.object().shape({
  userId: yup.string().required('User ID is required').min(4, 'User ID must be at least 4 characters'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must include uppercase, lowercase, number and special character'
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  phone: yup
    .string()
    .matches(/^\+?[0-9]{10,15}$/, 'Phone number is not valid')
    .required('Phone number is required'),
  avatar: yup
    .mixed()
    .required('Profile picture is required')
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      return value && value[0] && value[0].size <= 5000000;
    })
    .test('fileType', 'Only image files are allowed', (value) => {
      return value && value[0] && ['image/jpeg', 'image/png', 'image/gif'].includes(value[0].type);
    }),
});

const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('userId', data.userId);
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('phone', data.phone);
      formData.append('role', 'user');
      formData.append('avatar', data.avatar[0]);

      await authService.signup(formData);
      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

        <motion.h2 
          variants={itemVariants}
          className="text-xl font-semibold mb-6 text-center"
        >
          Create your account
        </motion.h2>

        <motion.form 
          onSubmit={handleSubmit(onSubmit)} 
          className="space-y-4"
          variants={formVariants}
          encType="multipart/form-data"
        >

          {/* Avatar Upload */}
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-4">
            <div className="relative w-24 h-24 mb-2">
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2",
                isDarkMode ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-100",
                errors.avatar && "border-red-500"
              )}>
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <AiOutlineUser className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <label 
                htmlFor="avatar"
                className={cn(
                  "absolute bottom-0 right-0 p-1 rounded-full cursor-pointer",
                  isDarkMode ? "bg-gray-700 text-purple-400 hover:bg-gray-600" : "bg-white text-purple-500 hover:bg-gray-100"
                )}
              >
                <AiOutlineUpload className="h-5 w-5" />
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                {...register("avatar")}
                onChange={(e) => {
                  handleAvatarChange(e);
                  register("avatar").onChange(e);
                }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Upload profile picture (required)</span>
            {errors.avatar && (
              <p className="mt-1 text-sm text-red-500">{errors.avatar.message}</p>
            )}
          </motion.div>

          {/* First Name and Last Name */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <AiOutlineUser className="h-5 w-5" />
                </span>
                <input
                  id="firstName"
                  placeholder="First Name"
                  {...register("firstName")}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none",
                    isDarkMode 
                      ? "bg-gray-700 text-white border-gray-600 focus:ring-purple-500 focus:border-purple-500" 
                      : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-purple-500 focus:border-purple-500",
                    errors.firstName ? "border-red-500" : "border"
                  )}
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            
            {/* Last Name */}
            <div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <AiOutlineUser className="h-5 w-5" />
                </span>
                <input
                  id="lastName"
                  placeholder="Last Name"
                  {...register("lastName")}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none",
                    isDarkMode 
                      ? "bg-gray-700 text-white border-gray-600 focus:ring-purple-500 focus:border-purple-500" 
                      : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-purple-500 focus:border-purple-500",
                    errors.lastName ? "border-red-500" : "border"
                  )}
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </motion.div>
          
          {/* User ID */}
          <motion.div variants={itemVariants}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <AiOutlineUser className="h-5 w-5" />
              </span>
              <input
                id="userId"
                placeholder="User ID"
                {...register("userId")}
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none",
                  isDarkMode 
                    ? "bg-gray-700 text-white border-gray-600 focus:ring-purple-500 focus:border-purple-500" 
                    : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-purple-500 focus:border-purple-500",
                  errors.userId ? "border-red-500" : "border"
                )}
              />
            </div>
            {errors.userId && (
              <p className="mt-1 text-sm text-red-500">{errors.userId.message}</p>
            )}
          </motion.div>

          {/* Email */}
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

          {/* Phone */}
          <motion.div variants={itemVariants}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <AiOutlinePhone className="h-5 w-5" />
              </span>
              <input
                id="phone"
                placeholder="Phone Number"
                {...register("phone")}
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none",
                  isDarkMode 
                    ? "bg-gray-700 text-white border-gray-600 focus:ring-purple-500 focus:border-purple-500" 
                    : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-purple-500 focus:border-purple-500",
                  errors.phone ? "border-red-500" : "border"
                )}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
            )}
          </motion.div>

          {/* Password */}
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

          {/* Confirm Password */}
          <motion.div variants={itemVariants}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <AiOutlineLock className="h-5 w-5" />
              </span>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                {...register("confirmPassword")}
                className={cn(
                  "w-full pl-10 pr-10 py-3 rounded-lg focus:outline-none",
                  isDarkMode 
                    ? "bg-gray-700 text-white border-gray-600 focus:ring-purple-500 focus:border-purple-500" 
                    : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-purple-500 focus:border-purple-500",
                  errors.confirmPassword ? "border-red-500" : "border"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible className="h-5 w-5" />
                ) : (
                  <AiOutlineEye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </motion.div>

          {/* Password strength indicator */}
          {watch("password") && (
            <motion.div variants={itemVariants}>
              <div className="mt-2 space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">Password strength:</div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-300",
                      watch("password").length < 6 ? "w-1/4 bg-red-500" 
                      : watch("password").length < 8 ? "w-2/4 bg-yellow-500"
                      : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(watch("password")) ? "w-3/4 bg-blue-500"
                      : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(watch("password")) ? "w-full bg-green-500"
                      : "w-2/4 bg-yellow-500"
                    )}
                  ></div>
                </div>
                <ul className="text-xs space-y-1 pl-5 list-disc">
                  <li className={watch("password").length >= 8 ? "text-green-500" : "text-gray-500 dark:text-gray-400"}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(watch("password")) ? "text-green-500" : "text-gray-500 dark:text-gray-400"}>
                    At least one uppercase letter
                  </li>
                  <li className={/[a-z]/.test(watch("password")) ? "text-green-500" : "text-gray-500 dark:text-gray-400"}>
                    At least one lowercase letter
                  </li>
                  <li className={/\d/.test(watch("password")) ? "text-green-500" : "text-gray-500 dark:text-gray-400"}>
                    At least one number
                  </li>
                  <li className={/[@$!%*?&]/.test(watch("password")) ? "text-green-500" : "text-gray-500 dark:text-gray-400"}>
                    At least one special character
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </motion.div>
        </motion.form>

        <motion.div 
          variants={itemVariants}
          className="mt-6 text-center"
        >
          <p className={cn(
            "text-sm",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupForm;