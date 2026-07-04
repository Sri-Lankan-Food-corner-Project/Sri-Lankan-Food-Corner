<script lang="ts">
	import type { Component } from 'svelte';

	type Props = {
		label: string;
		value: string;
		hint?: string;
		icon?: Component;
		accent?: 'default' | 'green' | 'amber' | 'red' | 'blue';
		href?: string;
	};

	let { label, value, hint, icon: Icon, accent = 'default', href }: Props = $props();

	const accents: Record<NonNullable<Props['accent']>, string> = {
		default: 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400',
		green: 'text-green-700 bg-green-100 dark:bg-green-950/40 dark:text-green-300',
		amber: 'text-amber-700 bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300',
		red: 'text-red-700 bg-red-100 dark:bg-red-950/40 dark:text-red-300',
		blue: 'text-blue-700 bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300'
	};
</script>

{#snippet body()}
	<div class="bg-card flex flex-col gap-3 rounded-lg border p-4 transition {href ? 'hover:border-neutral-400 hover:shadow-sm' : ''}">
		<div class="flex items-start justify-between gap-2">
			<div class="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
				{label}
			</div>
			{#if Icon}
				<div class="flex size-8 shrink-0 items-center justify-center rounded-full {accents[accent]}">
					<Icon class="size-4" />
				</div>
			{/if}
		</div>
		<div class="text-2xl font-bold sm:text-3xl">{value}</div>
		{#if hint}
			<div class="text-muted-foreground text-xs">{hint}</div>
		{/if}
	</div>
{/snippet}

{#if href}
	<a {href} class="block">
		{@render body()}
	</a>
{:else}
	{@render body()}
{/if}
