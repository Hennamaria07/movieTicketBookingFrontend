import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AiOutlineHome,
  AiOutlineBank,
  AiOutlineMessage,
  AiOutlineTag,
  AiOutlineWallet,
  AiOutlineGift,
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineDashboard,
  AiOutlineSetting,
  AiOutlineBarChart,
  AiOutlineDollar
} from 'react-icons/ai';
import { BiMoviePlay, BiCameraMovie } from 'react-icons/bi';
import { TbTicket } from 'react-icons/tb';
import { useTheme } from './ui/theme-provider';
import { lightTheme, darkTheme } from '../lib/themes';
import { FaFilm } from 'react-icons/fa';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userType: 'theater' | 'customer';
  brandName?: string;
}

const theaterNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/theater/dashboard', icon: <AiOutlineDashboard size={20} /> },
  // { title: 'Theaters Management', href: '/theater/management', icon: <BiMoviePlay size={20} /> },
  { title: 'Manage Shows', href: '/theater/shows', icon: <BiCameraMovie size={20} /> },
  { title: 'Seat Pricing', href: '/theater/pricing', icon: <AiOutlineDollar size={20} /> },
  { title: "Booking Management", href: '/theater/bookings', icon: <AiOutlineBank size={20} /> },
  { title: 'Reports', href: '/theater/reports', icon: <AiOutlineBarChart size={20} /> },
  { title: ' Feedback & Reviews', href: '/theater/reviews', icon: <AiOutlineMessage size={20} /> },
  { title: 'Offers', href: '/theater/offers', icon: <AiOutlineTag size={20} /> },
  { title: 'Settings', href: '/theater/settings', icon: <AiOutlineSetting size={20} /> }
];

const customerNavItems: NavItem[] = [
  { title: 'Home', href: '/', icon: <AiOutlineHome size={20} /> },
  { title: 'Movies', href: '/movies', icon: <FaFilm size={20} /> },
  { title: 'Theaters', href: '/theaters', icon: <AiOutlineBank size={20} /> },
  { title: 'My Tickets', href: '/tickets', icon: <TbTicket size={20} /> },
  { title: 'Reviews', href: '/reviews', icon: <AiOutlineMessage size={20} /> },
  { title: 'Offers', href: '/offers', icon: <AiOutlineTag size={20} /> },
  { title: 'Wallet', href: '/wallet', icon: <AiOutlineWallet size={20} /> },
  { title: 'Loyalty & Rewards', href: '/rewards', icon: <AiOutlineGift size={20} /> },
  { title: 'Profile', href: '/profile', icon: <AiOutlineUser size={20} /> }
];

const menuItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const sidebarVariants = {
  open: {
    width: "16rem",
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  closed: {
    width: "5rem",
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  mobile: {
    x: 0,
    transition: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 }
  },
  mobileHidden: {
    x: "-100%",
    transition: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 }
  }
};

export const Sidebar = ({ isOpen, setIsOpen, userType, brandName = "MovieHub" }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navItems = userType === 'theater' ? theaterNavItems : customerNavItems;
  const navigate = useNavigate();
  const { theme } = useTheme();
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setIsOpen(false);
      } else {
        setIsMobile(false);
        setIsOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen, setIsOpen]);

  const handleLogOut = () => {
    // Implement logout logic here
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!isOpen && isMobile) {
    return (
      <motion.button
        className={cn(
          "fixed top-4 left-4 z-50 p-2 rounded-lg",
          theme === 'dark' ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-800"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
      >
        <AiOutlineMenu className="h-6 w-6" />
      </motion.button>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      <motion.div
        id="sidebar"
        variants={sidebarVariants}
        initial={isMobile ? "mobileHidden" : "open"}
        animate={
          isMobile
            ? isOpen ? "mobile" : "mobileHidden"
            : collapsed ? "closed" : "open"
        }
        className={cn(
          "flex flex-col h-screen z-50 p-4 sticky top-0",
          theme === 'dark' 
            ? "bg-gray-900 text-gray-100" 
            : "bg-white text-gray-800 border-r border-gray-200"
        )}
      >
        <div className="flex items-center justify-between mb-8">
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={cn(
                  "text-xl font-bold bg-clip-text text-transparent",
                  theme === 'dark'
                    ? "bg-gradient-to-r from-purple-400 to-purple-600"
                    : "bg-gradient-to-r from-purple-600 to-blue-500"
                )}
              >
                {brandName}
              </motion.h1>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => isMobile ? setIsOpen(false) : setCollapsed(!collapsed)}
            className={cn(
              "p-2 rounded-lg",
              theme === 'dark' 
                ? "hover:bg-gray-800" 
                : "hover:bg-gray-100"
            )}
          >
            {isMobile ? (
              <AiOutlineClose className="h-5 w-5" />
            ) : (
              <AiOutlineMenu className="h-5 w-5" />
            )}
          </motion.button>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              variants={menuItemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.href}
                onClick={() => isMobile && setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative",
                  location.pathname === item.href 
                    ? currentTheme.accent.primary + " text-white"
                    : theme === 'dark'
                      ? "hover:bg-gray-800"
                      : "hover:bg-gray-100",
                  collapsed && !isMobile && "justify-center"
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {item.icon}
                </motion.div>
                <AnimatePresence>
                  {(!collapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          ))}
        </nav>

        <motion.div
          className={cn(
            "border-t pt-4 space-y-4",
            theme === 'dark' ? "border-gray-800" : "border-gray-200"
          )}
          variants={menuItemVariants}
          initial="hidden"
          animate="visible"
        >
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full text-red-500 hover:text-red-400",
              theme === 'dark' ? "hover:bg-red-900/20" : "hover:bg-red-100/60",
              collapsed && !isMobile && "px-0"
            )}
          >
            {collapsed && !isMobile ? (
              <AiOutlineLogout className="h-5 w-5" />
            ) : (
              <div onClick={handleLogOut} className="flex items-center gap-3">
                <AiOutlineLogout className="h-5 w-5" />
                <span>Logout</span>
              </div>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </>
  );
};