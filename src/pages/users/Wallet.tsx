import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  AiOutlineWallet,
  AiOutlinePlus,
  AiOutlineCreditCard,
  AiOutlineHistory,
  AiOutlineGift,
  AiOutlineArrowUp,
  AiOutlineArrowDown,
  AiOutlinePayCircle,
  AiOutlineBank
} from 'react-icons/ai'
import { BiBitcoin } from 'react-icons/bi'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Progress } from '../../components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tab'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { cn } from '../../lib/utils'

interface Transaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  movieName?: string
  date: string
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'debit',
    amount: 25.99,
    description: 'Movie Ticket Purchase',
    movieName: 'Dune: Part Two',
    date: '2024-03-10T14:30:00'
  },
  {
    id: '2',
    type: 'credit',
    amount: 100.00,
    description: 'Wallet Top Up',
    date: '2024-03-09T10:15:00'
  },
  {
    id: '3',
    type: 'debit',
    amount: 15.99,
    description: 'Movie Ticket Purchase',
    movieName: 'Poor Things',
    date: '2024-03-08T19:30:00'
  }
]

const Wallet = () => {
  const [balance, setBalance] = useState(149.99)
  const [rewardPoints, setRewardPoints] = useState(750)
  const [addAmount, setAddAmount] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)

  const handleAddMoney = () => {
    if (!addAmount || !selectedPaymentMethod) {
      toast.error("Please enter amount and select payment method")
      return
    }
    
    // Add money logic here
    setBalance(prev => prev + parseFloat(addAmount))
    toast.success("Money added successfully!", {
      description: `$${addAmount} has been added to your wallet`
    })
    setAddAmount('')
    setSelectedPaymentMethod(null)
  }

  return (
    <div className="space-y-8">
      {/* Balance Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AiOutlineWallet className="h-5 w-5" />
            <span>Your Balance</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-4xl font-bold">${balance.toFixed(2)}</span>
            <span className="text-muted-foreground">USD</span>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <AiOutlinePlus className="h-4 w-4 mr-2" /> Add Money
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Money to Wallet</DialogTitle>
                  <DialogDescription>
                    Choose your preferred payment method and enter amount
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className="text-lg"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'card', icon: AiOutlineCreditCard, label: 'Card' },
                      { id: 'paypal', icon: AiOutlinePayCircle, label: 'PayPal' },
                      { id: 'crypto', icon: BiBitcoin, label: 'Crypto' },
                      { id: 'bnpl', icon: AiOutlineBank, label: 'BNPL' },
                    ].map((method) => (
                      <Button
                        key={method.id}
                        variant={selectedPaymentMethod === method.id ? 'default' : 'outline'}
                        className="h-20"
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <method.icon className="h-6 w-6" />
                          <span>{method.label}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleAddMoney}
                    disabled={!addAmount || !selectedPaymentMethod}
                  >
                    Add Money
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              Withdraw
            </Button>
          </div>
        </CardContent>
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 -z-10" />
      </Card>

      {/* Rewards Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AiOutlineGift className="h-5 w-5" /> Rewards
          </CardTitle>
          <CardDescription>
            Earn points with every purchase and redeem for discounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">{rewardPoints}</span>
              <span className="text-muted-foreground">points</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to next tier</span>
                <span>750/1000</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <Button variant="outline" className="w-full">
              Redeem Points
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AiOutlineHistory className="h-5 w-5" /> Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTransactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {transaction.type === 'credit' ? (
                    <div className="p-2 rounded-full bg-green-500/10">
                      <AiOutlineArrowUp className="h-4 w-4 text-green-500" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-full bg-red-500/10">
                      <AiOutlineArrowDown className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    {transaction.movieName && (
                      <p className="text-sm text-muted-foreground">{transaction.movieName}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-medium",
                    transaction.type === 'credit' ? "text-green-500" : "text-red-500"
                  )}>
                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Wallet
