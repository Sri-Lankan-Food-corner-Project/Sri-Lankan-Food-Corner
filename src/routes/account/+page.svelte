<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	let { data } = $props();
</script>

<div class="mx-auto max-w-3xl px-4 py-8">
	<h1 class="text-2xl font-bold">My Account</h1>
	<div class="mt-6 grid gap-6 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Profile</Card.Title>
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
	</div>
</div>
