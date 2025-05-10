<script lang="ts">
    import { writable, type Writable } from 'svelte/store';
    import { Empty, Grid } from "./modules/grid.svelte";
    import { dn_to_xy, isError, xy_to_dn } from "./modules/grid_util";
    import { Bishop, isPiece, Pawn, Piece, Rook } from "./modules/pieces";
    import { type XY, type DN, identify, WHITE } from "./modules/shared";

    const g = new Grid();
    const pawns: Pawn[] = g.WHITE_SIDE.PAWNS as Pawn[];
    const rook = (g.WHITE_SIDE.ROOK_L as Rook);
    const bishop = (g.WHITE_SIDE.BISHOP_L as Bishop);
    g.move_piece(bishop, "d5" as DN);

    function toggle_show_attack_squares(e: Event){
        try{
            if(e instanceof KeyboardEvent) if(!["Enter", " "].includes(e.key)) return;

            const target = e.currentTarget as HTMLElement | null;
            if (target === null) return;
            
            let dn = xy_to_dn(target.id as XY);
            if(isError(dn)) throw new Error(dn.message);
            
            const piece = g.get(dn);
            if(!isPiece(piece)) return;
            
            g.toggle_attack_squares(piece, piece.selected);
            target.classList.toggle("selected")
            piece.selected =! piece.selected;
        } catch (e){
            console.trace(e)
        }
    }

</script>

<div class="board">
    {#each Array(8) as _, x}
        {#each Array(8) as _, y}
            <div
            class="cell {x&1 ^ y&1 ? 'black' : 'white' }-cell"
            id="{y + 1},{8 - x}"
            onclick={toggle_show_attack_squares}
            onkeydown={toggle_show_attack_squares}
            role="button"
            tabindex="0"
            >
                <p>{`${y + 1},${8 - x}`}</p>
                {@render piece(g.get(xy_to_dn(`${y + 1},${8 - x}` as XY) as DN))}
            </div>
        {/each}
    {/each}
</div>

{#snippet piece(square : Piece | Empty)}
    {#if isPiece(square)}
        <div class="piece {(square as Piece).colour}-piece"></div>
        <p>{(square as Piece).piece_type.name}</p>
        <!-- <p>{(square as Piece).position}</p> -->
    {:else}
        <div class="{square.is_marked() ? 'mark' : null}"></div>
    {/if}
{/snippet}

<style>
    .board {
        /* width: 100%; */
        aspect-ratio: 1/1;
        background-color: black;
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        height: 100%;
    }

    .cell {
        -ms-user-select: none; /* IE 10 and IE 11 */
        -webkit-user-select: none; /* Safari */
        /* width: 100%; */
        align-items: center;
        aspect-ratio: 1/1;
        background-color: lightblue;
        color: black;
        display: flex;
        flex-direction: column;
        font-size: clamp(1px, 1rem, 2rem);
        justify-content: center;
        overflow: hidden;
        text-align: center;
        user-select: none; /* Standard syntax */
        /* box-sizing: border-box; */
    }

    /* hack for svelte to not purge this rule */
    :global(.selected){
        box-shadow: inset 0px 0px 40px 4px #888888;
    }

    .white-cell {
        background-color: lightgrey;
    }

    .black-cell {
        background-color: darkgray;
    }

    .piece{
        aspect-ratio: 1/1;
        height: 50%;
    }

    .white-piece {
        background-color: white;
        border: 1px solid black;
    }

    .black-piece {
        background-color: black;
        border: 1px solid black;
    }

    .mark{
        width: 100%;
        height: 100%;
        background-color: rgba(255,0,0,0.3);
    }
</style>
