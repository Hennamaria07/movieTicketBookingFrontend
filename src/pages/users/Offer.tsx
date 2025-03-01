import { useState } from 'react'
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { format, differenceInSeconds } from 'date-fns'
import { 
  AiOutlineClockCircle,
  AiOutlineUser,
  AiOutlineUsergroupAdd,
  AiOutlineGift,
  AiOutlineCrown,
  AiOutlineBank,
  AiOutlineEnvironment,
  AiOutlineCopy,
  AiOutlineCheck,
  AiOutlineThunderbolt
} from 'react-icons/ai'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tab'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

interface Offer {
  id: string
  title: string
  description: string
  code: string
  type: 'flash' | 'loyalty' | 'payment' | 'group' | 'referral' | 'subscription'
  discount: {
    type: 'percentage' | 'fixed' | 'cashback'
    value: number
  }
  validUntil: string
  minPurchase?: number
  maxDiscount?: number
  termsAndConditions: string[]
  gradient: string
  isPersonalized?: boolean
  isLocationBased?: boolean
  requiredLoyaltyPoints?: number
  groupSize?: number
  paymentPartner?: string
}

const mockOffers: Offer[] = [
  {
    id: '1',
    title: 'Flash Sale: 30% Off',
    description: 'Limited time offer on all movie tickets',
    code: 'FLASH30',
    type: 'flash',
    discount: {
      type: 'percentage',
      value: 30
    },
    validUntil: '2024-03-15T23:59:59',
    minPurchase: 200,
    maxDiscount: 150,
    termsAndConditions: [
      'Valid on all movie tickets',
      'Maximum discount of ₹150',
      'Cannot be combined with other offers'
    ],
    gradient: 'from-purple-600 to-blue-600',
    isPersonalized: true
  },
  // Add more offers...
]

// Add these animation variants
const floatingTicketVariants = {
  initial: { y: 0, x: 0, rotate: 0, scale: 0 },
  animate: { 
    y: [-20, 20, -20], 
    x: [-10, 10, -10],
    rotate: [-5, 5, -5],
    scale: 1,
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

const floatingDiscountVariants = {
  initial: { scale: 0, rotate: 0 },
  animate: {
    scale: [1, 1.2, 1],
    rotate: [0, 360],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

const Offer = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [referralCode, setReferralCode] = useState('')

  const { data: offers, isLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockOffers
    }
  })

  const filteredOffers = offers?.filter(offer => {
    if (activeTab === 'all') return true
    return offer.type === activeTab
  })

  return (
    <div className="max-w-screen min-h-screen space-y-6 pt-4">
      {/* Enhanced Hero Section */}
      <section className="relative h-[250px] sm:h-[350px] -mt-4 -mx-4 sm:-mx-6 mb-8 overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600"
          animate={{
            backgroundPosition: ['0%', '100%', '0%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

        {/* Floating Discount Circles */}
        <motion.div
          className="absolute left-[10%] top-[20%] w-32 h-32 rounded-full border-4 border-dashed border-white/20"
          variants={floatingDiscountVariants}
          initial="initial"
          animate="animate"
        />
        <motion.div
          className="absolute right-[15%] bottom-[15%] w-24 h-24 rounded-full border-4 border-dashed border-white/20"
          variants={floatingDiscountVariants}
          initial="initial"
          animate="animate"
          style={{ animationDelay: "2s" }}
        />

        {/* Floating Tickets */}
        <motion.div
          className="absolute left-[20%] top-[30%] bg-white/10 backdrop-blur-sm p-3 rounded-lg shadow-xl"
          variants={floatingTicketVariants}
          initial="initial"
          animate="animate"
        >
          <div className="text-white/80 text-sm font-semibold">
            30% OFF
          </div>
        </motion.div>
        <motion.div
          className="absolute right-[25%] top-[40%] bg-white/10 backdrop-blur-sm p-3 rounded-lg shadow-xl"
          variants={floatingTicketVariants}
          initial="initial"
          animate="animate"
          style={{ animationDelay: "1s" }}
        >
          <div className="text-white/80 text-sm font-semibold">
            FLASH DEAL
          </div>
        </motion.div>
        <motion.div
          className="absolute left-[30%] bottom-[25%] bg-white/10 backdrop-blur-sm p-3 rounded-lg shadow-xl"
          variants={floatingTicketVariants}
          initial="initial"
          animate="animate"
          style={{ animationDelay: "2s" }}
        >
          <div className="text-white/80 text-sm font-semibold">
            FREE TICKET
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-white p-6">
          <motion.h1 
            className="text-3xl sm:text-5xl font-bold text-center mb-2 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Exclusive Movie Offers
          </motion.h1>
          <motion.p 
            className="text-sm sm:text-lg text-center max-w-2xl text-white/80"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Discover amazing deals and discounts on your favorite movies
          </motion.p>

          {/* Sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Referral Section */}
      <motion.section 
        className="bg-card rounded-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative p-4 sm:p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                <AiOutlineGift className="h-5 w-5 text-primary" />
                Refer & Earn
              </h3>
              <p className="text-sm text-muted-foreground">
                Share your referral code and earn ₹100 for each friend who signs up
              </p>
            </div>
            <div className="w-full sm:w-auto flex gap-2">
              <Input
                value={referralCode}
                placeholder="Enter referral code"
                className="h-9 bg-background/50"
              />
              <Button className="h-9 relative overflow-hidden group">
                <span className="relative z-10">Apply Code</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full h-auto flex flex-wrap gap-2 p-1 bg-muted/50">
          <TabsTrigger value="all" className="h-8 text-xs sm:text-sm">All Offers</TabsTrigger>
          <TabsTrigger value="flash" className="h-8 text-xs sm:text-sm">Flash Deals</TabsTrigger>
          <TabsTrigger value="loyalty" className="h-8 text-xs sm:text-sm">Loyalty Rewards</TabsTrigger>
          <TabsTrigger value="payment" className="h-8 text-xs sm:text-sm">Payment Offers</TabsTrigger>
          <TabsTrigger value="group" className="h-8 text-xs sm:text-sm">Group Discounts</TabsTrigger>
          <TabsTrigger value="subscription" className="h-8 text-xs sm:text-sm">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="wait">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <OfferCardSkeleton key={i} />
                ))
              ) : (
                filteredOffers?.map((offer, index) => (
                  <OfferCard 
                    key={offer.id} 
                    offer={offer}
                    index={index}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface OfferCardProps {
  offer: Offer
  index: number
}

const OfferCard = ({ offer, index }: OfferCardProps) => {
  const [copied, setCopied] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const radius = useMotionValue(0)
  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.15), transparent 80%)`
  const secondsLeft = differenceInSeconds(new Date(offer.validUntil), new Date())
  const hoursLeft = Math.floor(secondsLeft / 3600)
  const minutesLeft = Math.floor((secondsLeft % 3600) / 60)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
    radius.set(200)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(offer.code)
    setCopied(true)
    toast.success("Code Copied!", {
      description: "Paste the code at checkout"
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => radius.set(0)}
      className={cn(
        "group relative bg-gradient-to-r p-4 sm:p-6 rounded-lg text-white overflow-hidden cursor-pointer",
        offer.gradient
      )}
    >
      <motion.div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background }}
      />
      {/* Offer Type Icon */}
      <div className="absolute top-4 right-4">
        {offer.type === 'flash' && <AiOutlineThunderbolt className="h-6 w-6 opacity-50" />}
        {offer.type === 'loyalty' && <AiOutlineCrown className="h-6 w-6 opacity-50" />}
        {offer.type === 'payment' && <AiOutlineBank className="h-6 w-6 opacity-50" />}
        {offer.type === 'group' && <AiOutlineUsergroupAdd className="h-6 w-6 opacity-50" />}
        {offer.type === 'referral' && <AiOutlineGift className="h-6 w-6 opacity-50" />}
        {offer.type === 'subscription' && <AiOutlineUser className="h-6 w-6 opacity-50" />}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        {offer.isPersonalized && (
          <Badge variant="secondary" className="bg-white/20">Personalized</Badge>
        )}
        {offer.isLocationBased && (
          <Badge variant="secondary" className="bg-white/20">
            <AiOutlineEnvironment className="h-3 w-3 mr-1" />
            Near You
          </Badge>
        )}
      </div>

      <h3 className="text-lg sm:text-xl font-semibold mb-2">{offer.title}</h3>
      <p className="text-sm text-white/80 mb-4">{offer.description}</p>

      {/* Offer Details */}
      <div className="space-y-2 mb-4">
        {offer.minPurchase && (
          <p className="text-xs text-white/70">
            Min. Purchase: ₹{offer.minPurchase}
          </p>
        )}
        {offer.maxDiscount && (
          <p className="text-xs text-white/70">
            Max. Discount: ₹{offer.maxDiscount}
          </p>
        )}
        {secondsLeft > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <AiOutlineClockCircle className="h-3 w-3" />
            <span>Expires in: {hoursLeft}h {minutesLeft}m</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button 
          variant="secondary" 
          className="bg-white/20 hover:bg-white/30 h-8 sm:h-9 text-xs sm:text-sm"
          onClick={handleCopyCode}
        >
          {offer.code}
          {copied ? (
            <AiOutlineCheck className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          ) : (
            <AiOutlineCopy className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          )}
        </Button>
        <Button 
          variant="secondary" 
          className="bg-white/20 hover:bg-white/30 h-8 sm:h-9 text-xs sm:text-sm"
        >
          View Details
        </Button>
      </div>
    </motion.div>
  )
}

const OfferCardSkeleton = () => (
  <div className="bg-card rounded-lg p-6 space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-1/4" />
      <Skeleton className="h-3 w-1/3" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-9 w-32" />
    </div>
  </div>
)

export default Offer
