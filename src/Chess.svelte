<script lang="ts">
    import { Empty, Grid } from "./modules/grid";
    import { dn_to_xy, xy_to_dn } from "./modules/grid_util";
    import { Piece } from "./modules/pieces";
    import { type XY, type DN, identify } from "./modules/shared";

    const log = console.log;

    const g = new Grid();
    const _grid = g.get_grid();

    const grid_keys = Array.from(_grid.keys());

    function get_piece_type(xy: XY): string {
        const dn = xy_to_dn(xy);
        if (!dn) {
            console.error("could not get dn of xy value: ", xy);
            return "error";
        }
        const square = g.get(dn);
        function isPiece(f: Piece | Empty): f is Piece {
            return (f as Piece).piece_type !== undefined;
        }

        if (!identify<Piece>(square, "piece_type")) return ""
        return square.piece_type.name;
        // console.log(piece_name);
        // return piece_name;
    }

    log(grid_keys);
</script>

<div class="board">
    {#each grid_keys as xy, i}
        <!-- this is so dumb. it works but idk why i just did it on intuition ((Math.floor(i/8) % 2) + i) % 2-->
        <div class="cell {(i ^ (i >> 3)) & 1 ? 'white' : 'black'}-cell" id={xy}>
            <p>{get_piece_type(xy)}</p>
            <p>{xy}</p>
        </div>
    {/each}
</div>

<style>
    .board {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        /* width: 100%; */
        height: 100%;
        aspect-ratio: 1/1;
        background-color: black;
    }

    .cell {
        /* width: 100%; */
        display: flex;
        background-color: lightblue;
        color: black;
        text-align: center;
        /* aspect-ratio: 1/1; */
    }

    .cell > * {
        margin: auto auto auto auto;
    }

    .white-cell {
        background-color: lightgrey;
    }

    .black-cell {
        background-color: darkgray;
    }
</style>
