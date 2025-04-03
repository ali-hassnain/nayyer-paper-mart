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
import { roles } from "@/lib/constants";

const UserAvatarWithDropdown = ({ user }) => {
	const initials = user?.email?.[0];
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
						<a
							href={`/orders/sales/${user?.id}`}
							className='u__inherited-anchor'
						>
							<DropdownMenuItem className='cursor-pointer'>
								Sales
							</DropdownMenuItem>
						</a>
						<a
							href={`/orders/purchases/${user?.id}`}
							className='u__inherited-anchor'
						>
							<DropdownMenuItem className='cursor-pointer'>
								Purchases
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
