import { Button } from "./ui/button"
import { useTheme } from "./ui/theme-provider"
import { Sun, Moon, Bell } from "lucide-react"
import { cn } from "../lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { lightTheme, darkTheme } from "../lib/themes"

interface HeaderProps {
  isSidebarOpen: boolean
}

const headerVariants = {
  initial: { y: -20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 }
}

export const Header = ({ isSidebarOpen }: HeaderProps) => {
  const { theme, setTheme } = useTheme()
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={cn(
        "h-16 fixed top-0 right-0 z-30 flex items-center justify-between px-6",
        "w-full transition-all duration-300",
        currentTheme.header,
        isSidebarOpen ? "lg:pl-64" : "lg:pl-20"
      )}
    >
      <div className="flex-1" />
      
      <motion.div 
        className="flex items-center gap-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div 
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.9 }}
          className="relative"
        >
          <Button
            variant="ghost"
            size="icon"
            className={cn("relative", currentTheme.button.ghost)}
          >
            <Bell className="h-5 w-5" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "absolute top-1 right-1 w-2 h-2 rounded-full",
                currentTheme.accent.primary
              )}
            />
          </Button>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.9 }}
          className="relative"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={currentTheme.button.ghost}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-blue-500" />
                )}
              </motion.div>
            </AnimatePresence>
          </Button>
        </motion.div>

        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              currentTheme.accent.primary
            )}
          >
            <span className="text-sm font-medium text-white">JD</span>
          </motion.div>
          <AnimatePresence>
            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.p 
                className={cn("text-sm font-medium", currentTheme.foreground)}
                whileHover={{ y: -2 }}
              >
                John Doe
              </motion.p>
              <motion.p 
                className={cn("text-xs", currentTheme.muted)}
                whileHover={{ y: -2 }}
              >
                john@example.com
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.header>
  )
} 