<script lang="ts">
    import { writable, type Writable } from 'svelte/store';
    import { Empty, Grid } from "./modules/grid.svelte";
    import { dn_to_xy, isError, xy_to_dn } from "./modules/grid_util";
    import { Bishop, isPiece, Pawn, Piece, Rook } from "./modules/pieces";
    import { type XY, type DN, identify, WHITE, PieceData, BLACK } from "./modules/shared";

    const DRAG_DELTA = 30;
    const SELECTED_SQUARE = "selected";
    let mouse_is_down = false;
    let mouse_move_listener: (e:MouseEvent)=>void=  $state(()=>{});
    let drag = false;
    let drag_item: HTMLDivElement | null = null;
    let drag_item_height: number = 0;
    let drag_hover_cell: string | null = null;
    const empty_closure = ()=>{};

    const g = new Grid();
    const pawns: Pawn[] = g.WHITE_SIDE.PAWNS as Pawn[];
    const rook = (g.WHITE_SIDE.ROOK_L as Rook);
    const bishop = (g.WHITE_SIDE.BISHOP_L as Bishop);
    // g.move_piece(bishop, "d5" as DN);

    function click_f(e: Event){
        g.move_piece(bishop, "d5" as DN);
    }


    function toggle_show_attack_squares(e: Event){
        try{
            if(e instanceof KeyboardEvent) if(!["Enter", " "].includes(e.key)) return;

            const square = (e.currentTarget as HTMLElement)?.parentElement;
            if (!square) throw new Error(`Can't find square for ${e.currentTarget}`);
            
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
    
    function reset_drag(){
        if(drag_item){
            drag_item.style.pointerEvents = "auto";
            drag_item.style.height = "100%";
            drag_item.style.position = "static";
        }
        drag = false;
        drag_item = null;
        drag_item_height = 0;
        drag_hover_cell = null;
        console.debug("drag resetted");
    }

    function _mouse_move_listener(e: MouseEvent){
        // console.debug("drag_item", drag_item);
        if (drag && drag_item && mouse_is_down){
            drag_item.style.pointerEvents = "none";
            drag_item.style.height = drag_item_height + "px";
            drag_item.style.position = "absolute";
            drag_item.style.left = e.x - drag_item_height/2 +  "px";
            drag_item.style.top = e.y - drag_item_height/2 + "px";
            console.debug("moving dom");
            return
        }
        if (!drag_item) {
            console.error(e.currentTarget);
            return
        }
        if (drag_item.parentElement?.classList.contains(SELECTED_SQUARE)) return
        const delta = e.offsetX > DRAG_DELTA || e.offsetY > DRAG_DELTA;
        // console.debug("NOT moving dom")
        // console.debug("delta: ", e.offsetX, e.offsetY )
        if (!delta) return
        drag_item_height = drag_item.getBoundingClientRect().height;
        drag = true;
    }

    /**
     * mouse_down listener for div.piece
     * @param e
     */
    function mouse_down(e: MouseEvent){
        console.debug("onmosuedown");
        if (!e.currentTarget) return;
        mouse_is_down = true;
        drag_item = e.currentTarget as HTMLDivElement;
        mouse_move_listener = _mouse_move_listener;
    }

    /**
     * mouse_up listener on window
     * @param e
     */
    function mouse_up(e: Event){
        console.debug("mouse up");
        mouse_move_listener = empty_closure;
        mouse_is_down = false;

        if (!drag_item || !drag_hover_cell || !drag){
            reset_drag();
            return
        }

        let dn = xy_to_dn(drag_item.parentElement!.id as XY);
        if (isError(dn)) throw new Error(dn.message)

        let piece = g.get(dn);
        if (!isPiece(piece)){
            console.error(piece);
            return;
        }
    
        dn = xy_to_dn(drag_hover_cell as XY);
        if (isError(dn)) throw new Error(dn.message)

        g.move_piece(piece, dn);
        
        reset_drag();
        
    }

    /**
     * mouse_over listener on div.cell
     * @param e
     */
    function mouse_over(e: Event){  
        // console.log("mouse over", "----------------");
        if (!mouse_is_down || !e.currentTarget || !drag_item) return
        
        const hover_square = e.currentTarget as HTMLElement;
        if (hover_square.id === drag_item.parentElement!.id) return
        drag_hover_cell = hover_square.id;
    }

    /**
     * mouse_over listener on div.cell
     * @param e
     */
    function mouse_leave(e: Event){
        if (!drag) return
        drag_hover_cell = null;
    }

    function r(x: any, r: any): typeof x{
        // dummy function to trigger reactivity
        return x;
    }

</script>
<svelte:window onmousemove={mouse_move_listener} onmouseup={mouse_up} />
<!-- <div
    id="foo"
    style="position: fixed; top: 200px; left: 465px; height: auto; width: auto; background: darkgreen;"
>
    <button onclick={click_f}> <h1>click</h1> </button>
     <p>
        {Object.entries(g.reactive_board)}
     </p>
</div> -->
<div class="board" style:background-color="black">
    {#each Array(8) as _, x}
        {#each Array(8) as _, y}
            {@const coor: string =`${y + 1},${8 - x}`}
            <!-- {@const square: Piece | Empty = g.get(xy_to_dn(`${coor}${g.reactive_board[coor]}`.slice(0,-1) as XY) as DN)} -->
            {@const square: Piece | Empty = g.get(xy_to_dn(r(coor, g.reactive_board[coor]) as XY) as DN)}
            {@const marked = !isPiece(square) ? square.is_marked() : null}
            {@const empty = square as Empty}
            {@const piece = isPiece(square) ? (square as Piece) : null}
            {@const marked_class = marked ? '-marked' : ''}
            {@const marked_opponent = marked ? empty.player_mark_count == 0 && empty.opponent_mark_count > 0 ? "-opponent": '' : ''}
            {@const marked_both = marked ? empty.player_mark_count > 0 && empty.opponent_mark_count > 0 ? "-both": '' : ''}
            {@const cell_colour =  x&1 ^ y&1 ? 'black' : 'white' }

            <!-- <p> {">" +  g.get(xy_to_dn(coor as XY) as DN) + test} </p> -->
            <!-- <p> { square }</p> -->
            <!-- onclick={click} -->
            <div
            class="cell {cell_colour}{marked_class}{marked_opponent}{marked_both}-cell {marked ? piece ? 'foo' : '' : '' }"
            id="{y + 1},{8 - x}"
            onmouseover={mouse_over}
            onmouseleave={mouse_leave}
            onfocus={null}
            role="none"
            >
                <!-- <p>{`${y + 1},${8 - x}`}</p> -->
                <!-- {square.opponent_mark_count}
                {square.player_mark_count}
                {square.mark_count}
                {marked_both} -->
                {@render piece_snippet(square)}
            </div>
        {/each}
    {/each}
</div>

{#snippet piece_snippet(square : Piece | Empty)}
    {#if isPiece(square)}
    <!-- onclick={toggle_show_attack_squares}     -->
    <!-- onmouseup={mouse_up} -->
        <div
        class="piece {(square as Piece).colour}-piece"
        onclick={toggle_show_attack_squares}
        onkeydown={toggle_show_attack_squares}
        onmousedown={mouse_down}
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
        --marked_opponent: 20;
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

    .black-marked-opponent-cell{
        background-color: hsl(from var(--white-cell) calc(h + var(--marked_opponent)) 100% 75%);
    }

    .black-marked-cell{
        background-color: hsl(from var(--white-cell) h 100% 75%);
    }

    .white-marked-opponent-cell{
        background-color: hsl(from var(--white-cell) calc(h + var(--marked_opponent)) 100% l);
    }

    .white-marked-cell{
        background-color: hsl(from var(--white-cell) h 100% l)
    }

    .white-marked-both-cell{
        background-color: hsl(from var(--white-cell) calc(h + calc(var(--marked_opponent) * 7 )) 100% l);
    }

    .black-marked-both-cell{
        background-color: hsl(from var(--white-cell) calc(h + var(--marked_opponent) * 7) 100% 75%);
    }

    .piece{
        aspect-ratio: 1/1;
        height: 100%;
        border-radius: 100%;
        display: flex;
        justify-content: center;
        /* border: 5px solid green; */
    }

    .piece p {
        margin: auto 0 auto 0;
    }

    .white-piece {
        background-color: white;
        color: black;
    }

    .black-piece {
        background-color: black;
        color: white;
    }

    .foo{
        background-color: purple;
    }
</style>
