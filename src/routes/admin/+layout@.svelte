<script lang="ts">
	import { Menu } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import AdminSidebar from '$lib/components/admin/AdminSidebar.svelte';

	let { data, children } = $props();

	let mobileOpen = $state(false);
</script>

<div class="bg-background text-foreground flex min-h-screen">
	<!-- Desktop sidebar -->
	<aside
		class="border-sidebar-border sticky top-0 hidden h-screen w-64 shrink-0 border-r md:block"
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

	<!-- Main content -->
	<main class="min-w-0 flex-1 px-4 pt-16 pb-6 md:px-8 md:pt-8">
		{@render children()}
	</main>
</div>
