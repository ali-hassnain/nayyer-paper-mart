import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import { POST__signOut } from "@/services/actions";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { roles } from "../../lib/constants";

const UserAvatarWithDropdown = ({ user }) => {
	const initials = user?.first_name?.[0];
	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<div>
						<UserAvatar initials={initials} />
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent className='w-56 c__lib__dropdown-menu'>
					<DropdownMenuGroup>
						<a href={`/orders/${user?.id}`} className='u__inherited-anchor'>
							<DropdownMenuItem className='cursor-pointer'>
								{user?.role === roles.SALES
									? "My Orders"
									: user?.role === roles.PURCHASER
									? "My Purchases"
									: null}
							</DropdownMenuItem>
						</a>
						<Link href={`/`} className='u__inherited-anchor'>
							<DropdownMenuItem className='cursor-pointer'>
								Sales management
							</DropdownMenuItem>
						</Link>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className='cursor-pointer'
						onClick={() => POST__signOut()}
					>
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};

export default UserAvatarWithDropdown;
