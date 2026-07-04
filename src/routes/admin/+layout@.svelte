<script lang="ts">
	import { Menu } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import AdminSidebar from '$lib/components/admin/AdminSidebar.svelte';

	let { data, children } = $props();

	let mobileOpen = $state(false);
</script>

<div class="bg-background text-foreground min-h-screen">
	<!-- Desktop sidebar — fixed to the viewport so it never scrolls with content.
	     `sticky` doesn't work reliably here because the root <body> has
	     `overflow-x: hidden` (added for iOS back-swipe), which creates a scroll
	     context that breaks sticky positioning. -->
	<aside
		class="border-sidebar-border fixed inset-y-0 left-0 z-30 hidden w-64 border-r md:block"
	>
		<AdminSidebar user={data.user} />
	</aside>

	<!-- Mobile: floating hamburger + Sheet -->
	<Sheet.Root bind:open={mobileOpen}>
		<Sheet.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="outline"
					size="icon"
					class="bg-card fixed top-3 left-3 z-50 shadow-md md:hidden"
					aria-label="Open menu"
				>
					<Menu class="size-5" />
				</Button>
			{/snippet}
		</Sheet.Trigger>
		<Sheet.Content side="left" class="w-64 p-0">
			<Sheet.Header class="sr-only">
				<Sheet.Title>Admin menu</Sheet.Title>
			</Sheet.Header>
			<AdminSidebar user={data.user} onNavigate={() => (mobileOpen = false)} />
		</Sheet.Content>
	</Sheet.Root>

	<!-- Main content — `md:ml-64` reserves horizontal space for the fixed sidebar. -->
	<main class="min-w-0 px-4 pt-16 pb-6 md:ml-64 md:px-8 md:pt-8">
		{@render children()}
	</main>
</div>
