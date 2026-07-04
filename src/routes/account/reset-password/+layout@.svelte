<script lang="ts">
	// Break out of /account/*'s auth-required layout — this page is by design
	// visited by signed-OUT users clicking a link from their email.
	// The `@` filename suffix resets layout inheritance to the root.
	let { children } = $props();
</script>

{@render children()}
