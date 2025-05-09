<script lang="ts">
    import { Grid } from "./modules/grid";

    const log = console.log;

    const g = new Grid();
    const _grid = g.get_grid();

    const grid_keys = Array.from(_grid.keys());

    log(grid_keys);
</script>

<div class="board">
    {#each new Array(grid_keys.length) as _, i}
        <div class="cell {i & 2 ? 'white' : 'black'}" id="{grid_keys[i]} "></div>
    {/each}
</div>

<style>
    .board {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        width: 100%;
        height: 100%;
        aspect-ratio: 1/1;
        background-color: bisque;
    }

    .cell{
        background-color: lightblue;
        /* aspect-ratio: 1/1; */
    }

    .white-cell{
        background-color: darkkhaki;
    }

    .black-cell{
        background-color: darkred;
    }
</style>
