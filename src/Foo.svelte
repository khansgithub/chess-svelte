<script lang="ts">
	import { writable, get } from 'svelte/store';
    
	let items = Array.from({ length: 5 }, (_, i) => writable({ id: i + 1, value: i*i }));
	let _w2 = writable({id: -1, value: -1});
	let _w = writable($_w2);

	let obj = {id: 10, value: 10};
	let items_two = writable(obj);

	function asd(i: number){
		_w2 = items[i];
		_w.set($_w2);
	}

	function increment(e: Event) {
		let target = e.currentTarget as HTMLElement | null;
		let index = parseInt(target?.id ?? "-1");
		index -= 1;
		if (index < 0) console.error(target);
		console.log(index)
        console.log(get(items[index]));
		items[index].update(item => ({ ...item, value: item.value + 1 }));
        console.log(get(items[index]));
	}
</script>

<div>
	{#each items as itemStore, index}
		{#await itemStore then item}
			{asd(index)}
			<div>
				<p style="display:inline-block;">{Object.entries($_w)}</p>
				<button onclick={increment} id="{`${$_w.id}`}"> + </button>
			</div>
			<!-- {@const _item = get(item)} -->
			<!-- Item {_item.id}: {_item.value} -->
			<!-- Item {$item.id}: {_item.value} -->
			<!-- <button on:click={() => increment(index)}>+</button> -->
		{/await}
	{/each}
	<hr/>
		<div>
			<p style="display:inline-block;">{Object.entries($items_two)}</p>
			<button onclick={_ => items_two.set({...$items_two, value: 99})} id="{`${$_w.id}`}"> + </button>
		</div>
</div>
