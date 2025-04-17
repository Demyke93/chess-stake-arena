
import { Card, CardContent } from "@/components/ui/card";

export const CoinConversionInfo = () => {
  return (
    <Card className="bg-chess-dark/90 border-chess-brown/50">
      <CardContent className="pt-6 space-y-2">
        <h3 className="font-semibold text-lg">Currency Conversion</h3>
        <div className="space-y-1 text-sm text-gray-400">
          <p>• ₦1,000 = 1 coin</p>
          <p>• Minimum deposit: ₦1,000</p>
          <p>• Minimum withdrawal: ₦1,000</p>
          <p>• Example: Depositing ₦5,000 will give you 5 coins</p>
        </div>
      </CardContent>
    </Card>
  );
};
