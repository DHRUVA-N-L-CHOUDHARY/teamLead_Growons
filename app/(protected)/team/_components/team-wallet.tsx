import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TeamWalletProps {
  balance: number;
}

export default function TeamWallet({ balance }: TeamWalletProps) {
  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Team Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">₹{balance.toFixed(2)}</p>
      </CardContent>
    </Card>
  )
}
