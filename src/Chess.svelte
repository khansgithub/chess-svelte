<script lang="ts">
    import { writable, type Writable } from 'svelte/store';
    import { Empty, Grid } from "./modules/grid.svelte";
    import { dn_to_xy, isError, xy_to_dn } from "./modules/grid_util";
    import { Bishop, isPiece, Pawn, Piece, Rook } from "./modules/pieces";
    import { type XY, type DN, identify, WHITE, PieceData } from "./modules/shared";

    let mouse_is_down = false;

    const g = new Grid();
    const pawns: Pawn[] = g.WHITE_SIDE.PAWNS as Pawn[];
    const rook = (g.WHITE_SIDE.ROOK_L as Rook);
    const bishop = (g.WHITE_SIDE.BISHOP_L as Bishop);
    g.move_piece(bishop, "d5" as DN);

    function toggle_show_attack_squares(e: Event){
        console.log("onclick")
        try{
            if(e instanceof KeyboardEvent) if(!["Enter", " "].includes(e.key)) return;

            const target = e.currentTarget as HTMLElement | null;
            if (target === null) return;

            const square = target.parentElement;
            if (square === null) throw new Error(`Can't find square for ${target}`);
            
            const dn = xy_to_dn(square.id as XY);
            if(isError(dn)) throw new Error(dn.message);
            
            const piece = g.get(dn);
            if(!isPiece(piece)) return;
            
            g.toggle_attack_squares(piece, piece.selected);
            square.classList.toggle("selected")
            piece.selected =! piece.selected;
        } catch (e){
            console.trace(e)
        }
    }

    function mouse_down(e: Event){
        console.log("onmosuedown")
        mouse_is_down = true; console.log(mouse_is_down);
    }

    function mouse_up(e: Event){
        console.log("onmouseup")
    }

    function mouse_move(e: Event){
        // console.log((e as MouseEvent).movementX);
        // console.log((e as MouseEvent).movementY);
    }

</script>
<svelte:window onmousemove={mouse_move} />
<div class="board">
    {#each Array(8) as _, x}
        {#each Array(8) as _, y}
            {@const square: Piece | Empty = g.get(xy_to_dn(`${y + 1},${8 - x}` as XY) as DN)}
            {@const marked = !isPiece(square) ? square.is_marked() : null}
            <div
            class="cell {x&1 ^ y&1 ? 'black' : 'white' }{marked ? '-marked' : null}-cell"
            id="{y + 1},{8 - x}"
            >
                <!-- <p>{`${y + 1},${8 - x}`}</p> -->
                {@render piece_snippet(square)}
            </div>
        {/each}
    {/each}
</div>

{#snippet piece_snippet(square : Piece | Empty)}
    {#if isPiece(square)}
        <div
        class="piece {(square as Piece).colour}-piece"
        onclick={toggle_show_attack_squares}
        onkeydown={toggle_show_attack_squares}
        onmousedown={mouse_down}
        onmouseup={mouse_up}
        role="button"
        tabindex="0"
        >
            {@html PieceData[square.piece_type].svg}
            <p>{PieceData[(square as Piece).piece_type].name}</p>
        </div>
        <!-- <p>{(square as Piece).position}</p> -->
    <!-- {:else}
        <div class="{square.is_marked() ? 'mark' : null}"></div> -->
    {/if}
{/snippet}

<style>
    :root{
        --white-cell: hsl(0, 0%, 83%) ;
    }
    .board {
        /* width: 100%; */
        aspect-ratio: 1/1;
        background-color: pink;
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
        /* transform: scale(2); */
        transition: box-shadow 0.15s cubic-bezier(0.5, 1.5, 0.5, 1),
                    transform 0.15s cubic-bezier(0.5, 1.5, 0.5, 1),
                    background-color 0.2s ease;

    }

    /* hack for svelte to not purge this rule */
    :global(.selected){
        border-radius: 3px;
        box-shadow: inset 0px 0px 40px 4px #888, 0px 0px 4px 4px #7d7d7d;
        transform: scale(0.97);
        /* transform: scale(1) !important; */
    }

    .white-cell {
        background-color: var(--white-cell);
    }

    .black-cell {
        background-color: hsl(from var(--white-cell) h s 60%);
    }

    .black-marked-cell{
        background-color:hsl(from var(--white-cell) h 100% 75%);
    }

    .white-marked-cell{
        background-color: hsl(from var(--white-cell) h 100% l)
    }    

    .piece{
        aspect-ratio: 1/1;
        height: 100%;
        border: 5px solid green;
    }

    .white-piece {
        background-color: white;
        color: black;
    }

    .black-piece {
        background-color: black;
        color: white;
    }
</style>
