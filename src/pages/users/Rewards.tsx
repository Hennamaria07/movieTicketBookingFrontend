import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  AiOutlineCrown, 
  AiOutlineUserAdd,
  AiOutlineStar,
  AiOutlineTrophy,
  AiOutlineLink,
  AiOutlineCopy,
  AiOutlineCheck
} from 'react-icons/ai'
import { BiMoviePlay } from 'react-icons/bi'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { cn } from '../../lib/utils'

const tiers = [
  {
    name: 'Silver',
    points: 0,
    perks: ['Basic Rewards', 'Birthday Bonus', 'Newsletter Updates']
  },
  {
    name: 'Gold',
    points: 1000,
    perks: ['Priority Booking', '10% Extra Points', 'Exclusive Previews']
  },
  {
    name: 'Platinum',
    points: 5000,
    perks: ['VIP Access', 'Free Upgrades', 'Dedicated Support']
  }
]

const earnMethods = [
  {
    icon: BiMoviePlay,
    title: 'Book Tickets',
    description: 'Earn 100 points per ticket',
    points: 100
  },
  {
    icon: AiOutlineStar,
    title: 'Write Reviews',
    description: 'Earn 50 points per review',
    points: 50
  },
  {
    icon: AiOutlineUserAdd,
    title: 'Refer Friends',
    description: 'Earn 200 points per referral',
    points: 200
  }
]


const Rewards = () => {
  const [points] = useState(750)
  const [currentTier] = useState('Silver')
  const [referralCode] = useState('MOVIE123')
  const [copied, setCopied] = useState(false)

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    toast.success('Referral code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Points Summary Card */}
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AiOutlineCrown className="h-6 w-6" />
            {currentTier} Member
          </CardTitle>
          <CardDescription>
            Keep earning to unlock more benefits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{points}</span>
              <span className="text-muted-foreground">points</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Gold</span>
                <span>{points}/1000</span>
              </div>
              <Progress value={(points / 1000) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 -z-10" />
      </Card>

      {/* Earn Points Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Earn Points</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {earnMethods.map((method) => (
            <motion.div
              key={method.title}
              whileHover={{ scale: 1.02 }}
              className="bg-card p-6 rounded-lg space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <method.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{method.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  +{method.points} points
                </span>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Membership Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((tier) => (
            <Card 
              key={tier.name}
              className={cn(
                "relative overflow-hidden",
                currentTier === tier.name && "border-primary"
              )}
            >
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.points} points required</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <AiOutlineTrophy className="h-4 w-4 text-primary" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Referral Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AiOutlineUserAdd className="h-5 w-5" />
            Refer Friends
          </CardTitle>
          <CardDescription>
            Share your referral code and earn points when friends join
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted p-3 rounded-lg font-mono">
              {referralCode}
            </div>
            <Button variant="outline" onClick={handleCopyReferral}>
              {copied ? (
                <AiOutlineCheck className="h-4 w-4" />
              ) : (
                <AiOutlineCopy className="h-4 w-4" />
              )}
            </Button>
            <Button>
              <AiOutlineLink className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Rewards
