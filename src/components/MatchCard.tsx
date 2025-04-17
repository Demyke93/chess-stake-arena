
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Match } from "@/types";
import { ChessBoard } from "@/components/ChessBoard";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";

interface MatchCardProps {
  match: Match;
  onViewDetails?: (match: Match) => void;
  onJoinMatch?: (match: Match) => void;
}

export const MatchCard = ({ match, onViewDetails, onJoinMatch }: MatchCardProps) => {
  const { user } = useAuth();
  const isUserInMatch = user && (match.whitePlayerId === user.id || match.blackPlayerId === user.id);
  const userIsWinner = user && match.winner === user.id;
  const userIsLoser = user && match.status === 'completed' && match.winner && match.winner !== user.id && isUserInMatch;
  
  const getStatusColor = () => {
    switch (match.status) {
      case 'active': return 'bg-blue-600';
      case 'completed': return 'bg-gray-600';
      case 'pending': return 'bg-amber-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Card className="overflow-hidden border-chess-brown/50 bg-chess-dark/90">
      <div className="relative">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className={`${getStatusColor()} text-white`}>
              {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
            </Badge>
            <div className="font-mono text-chess-accent font-bold">
              {match.stake} coins
            </div>
          </div>
          <CardTitle className="text-lg mt-2">
            {match.whiteUsername} vs {match.blackUsername}
          </CardTitle>
          <CardDescription>
            {match.timeControl} • {match.gameMode} • 
            {match.createdAt && ` ${formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="aspect-square w-full max-w-[200px] mx-auto my-2">
            <ChessBoard simplified />
          </div>
          
          {match.status === 'completed' && match.winner && (
            <div className="mt-3 text-center">
              <span className="text-gray-400">Winner: </span>
              <span className={`font-semibold ${userIsWinner ? 'text-chess-win' : ''}`}>
                {match.winner === match.whitePlayerId ? match.whiteUsername : match.blackUsername}
              </span>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {match.status === 'pending' && !isUserInMatch && onJoinMatch && (
            <Button onClick={() => onJoinMatch(match)} className="w-full">
              Join Match
            </Button>
          )}
          
          {match.status === 'pending' && isUserInMatch && (
            <Button disabled variant="outline" className="w-full">
              Waiting for opponent
            </Button>
          )}
          
          {match.status === 'active' && isUserInMatch && (
            <Button className="w-full bg-chess-accent hover:bg-chess-accent/80 text-black">
              Play Now
            </Button>
          )}
          
          {match.status !== 'pending' && onViewDetails && (
            <Button variant="outline" onClick={() => onViewDetails(match)} className="w-full">
              View Details
            </Button>
          )}
          
          {userIsWinner && (
            <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-chess-win text-white text-xs rounded-md">
              +{match.stake} coins
            </div>
          )}
          
          {userIsLoser && (
            <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-chess-loss text-white text-xs rounded-md">
              -{match.stake} coins
            </div>
          )}
        </CardFooter>
      </div>
    </Card>
  );
};
