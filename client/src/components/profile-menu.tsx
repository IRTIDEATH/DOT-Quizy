import { Link } from '@tanstack/react-router';
import {
	LogOut,
	Menu,
	User as UserDecoration,
	UserRoundCog,
} from 'lucide-react';
import type { User } from '@/account';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';

type Props = {
	user: User;
};

const ProfileMenu = ({ user }: Props) => {
	const handleLogout = async () => {
		await authClient.signOut();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="outline-none">
				<Avatar className="size-9">
					<AvatarImage src={user.image ?? ''} alt={user.name} />
					<AvatarFallback className="overflow-hidden border border-primary bg-transparent">
						<UserDecoration className="mt-2.5" size={36} />
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel className="flex items-center gap-2">
					<Menu size={16} />
					Menu
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link to="/">
						<UserRoundCog size={16} />
						My Profile
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
					<LogOut size={16} />
					<span>Logout</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ProfileMenu;
