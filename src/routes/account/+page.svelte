<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();
</script>

<div class="mx-auto max-w-3xl px-4 py-8">
	<h1 class="text-2xl font-bold">My Account</h1>
	<div class="mt-6 grid gap-6 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					Profile
					{#if data.user?.role === 'admin'}
						<Badge>Admin</Badge>
					{/if}
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2 text-sm">
				<p><span class="text-muted-foreground">Name:</span> {data.user?.name}</p>
				<p><span class="text-muted-foreground">Email:</span> {data.user?.email}</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Orders</Card.Title>
				<Card.Description>Track and revisit your purchases.</Card.Description>
			</Card.Header>
			<Card.Content>
				<a href="/account/orders" class="text-sm underline">View order history →</a>
			</Card.Content>
		</Card.Root>

		{#if data.user?.role === 'admin'}
			<Card.Root class="md:col-span-2 border-primary/40">
				<Card.Header>
					<Card.Title>Admin Panel</Card.Title>
					<Card.Description>Manage products, categories, and orders.</Card.Description>
				</Card.Header>
				<Card.Content>
					<a href="/admin" class="text-sm underline">Go to admin dashboard →</a>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
</div>
