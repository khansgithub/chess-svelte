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

        if (!identify<Piece>(square, "piece_type")) return "";
        return square.piece_type.name;
        // console.log(piece_name);
        // return piece_name;
    }

    function foo(x: number, y: number) {
        let r = "";
        if (x % 2) {
            if (y % 2) {
                r = "black";
            } else {
                r = "white";
            }
        } else {
            if (y - (1 % 2)) {
                r = "black";
            } else {
                r = "white";
            }
        }
        console.log(x, y, ": ", "x mod: ", x % 2, "y mod :", y % 2);
        console.log(r);
        return r; 
    }

    log(grid_keys);
</script>

<div class="board">
    {#each Array(8) as _, x}
        {#each Array(8) as _, y}
            <!-- <div class="cell {(i ^ (i >> 3)) & 1 ? 'white' : 'black'}-cell" id={xy}> -->
            <div class="cell {foo(x, y)}-cell">
                <p>{x}, {y}</p>
                <!-- {g.get(xy_to_dn(`${y + 1},${8 - x}` as XY) as DN)} -->
            </div>
        {/each}
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
