<script lang="ts">
	import AdminSidebar from '$lib/components/admin/AdminSidebar.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-screen">
	<AdminSidebar />
	<main class="flex-1 p-6">
		{@render children()}
	</main>
</div>
