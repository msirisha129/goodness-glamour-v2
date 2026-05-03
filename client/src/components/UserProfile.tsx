import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserData {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  isVerified: boolean;
}

export default function UserProfile() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Redirect to login
    setLocation('/login');
  };

  if (!user) {
    return (
      <Button
        onClick={() => setLocation('/login')}
        className="bg-[#8B7D6B] hover:bg-[#9D8E7C] text-white"
      >
        <User className="h-4 w-4 mr-2" />
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profilePicture} alt={user.name} />
            <AvatarFallback className="bg-[#8B7D6B] text-white">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setLocation('/my-bookings')}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>My Bookings</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocation('/profile')}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
