<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import {
		User,
		Package,
		LogOut,
		ChevronDown,
		ShieldCheck,
		Heart
	} from '@lucide/svelte';
	import { signOut } from '$lib/auth-client';
	import { goto, invalidateAll } from '$app/navigation';

	type HeaderUser = { email: string; role?: string | null | undefined };
	let { user }: { user: HeaderUser } = $props();

	async function handleSignOut() {
		await signOut();
		await invalidateAll();
		await goto('/');
	}

	const itemClass =
		'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm !text-neutral-700 cursor-pointer focus:!bg-[#F6EEDC] focus:!text-neutral-900 outline-none transition-colors';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<button
				{...props}
				class="flex items-center gap-1.5 transition-colors hover:text-white"
			>
				<User class="size-3.5" />
				My Account
				<ChevronDown class="size-3" />
			</button>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content
		align="end"
		sideOffset={12}
		class="!min-w-64 !rounded-xl !border !border-black/5 !bg-white !p-0 !text-neutral-800 !shadow-xl !ring-0 overflow-hidden"
	>
		<div class="border-b border-black/5 bg-[#F6EEDC] px-4 py-3">
			<p class="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
				Signed in as
			</p>
			<p class="truncate text-sm font-medium text-neutral-900">{user.email}</p>
		</div>

		<div class="p-1.5">
			<DropdownMenu.Item class={itemClass}>
				{#snippet child({ props })}
					<a href="/account" {...props}>
						<User class="size-4 text-neutral-500" /> Profile
					</a>
				{/snippet}
			</DropdownMenu.Item>

			<DropdownMenu.Item class={itemClass}>
				{#snippet child({ props })}
					<a href="/account/orders" {...props}>
						<Package class="size-4 text-neutral-500" /> Orders
					</a>
				{/snippet}
			</DropdownMenu.Item>

			<DropdownMenu.Item class={itemClass}>
				{#snippet child({ props })}
					<a href="/account/wishlist" {...props}>
						<Heart class="size-4 text-neutral-500" /> Wishlist
					</a>
				{/snippet}
			</DropdownMenu.Item>

			{#if user.role === 'admin'}
				<div class="my-1.5 h-px bg-black/5"></div>
				<DropdownMenu.Item class={itemClass}>
					{#snippet child({ props })}
						<a href="/admin" {...props}>
							<ShieldCheck class="size-4 text-[#2B4B1F]" />
							<span class="font-medium text-[#2B4B1F]">Admin Panel</span>
						</a>
					{/snippet}
				</DropdownMenu.Item>
			{/if}

			<div class="my-1.5 h-px bg-black/5"></div>

			<DropdownMenu.Item
				onSelect={handleSignOut}
				class="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm !text-red-600 outline-none transition-colors focus:!bg-red-50 focus:!text-red-700"
			>
				<LogOut class="size-4" /> Sign out
			</DropdownMenu.Item>
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>
