<script lang="ts">
    import { writable, type Writable } from 'svelte/store';
    import { Empty, Grid } from "./modules/grid.svelte";
    import { dn_to_xy, isError, xy_to_dn } from "./modules/grid_util";
    import { Bishop, isPiece, Pawn, Piece, Rook } from "./modules/pieces";
    import { type XY, type DN, identify, WHITE, PieceData } from "./modules/shared";

    let mouse_is_down = false;
    let mouse_move_listener: (e:Event)=>void=  $state(()=>{});
    let drag = false;
    let drag_item: HTMLElement | null;
    let drag_item_height: number = 0;
    const empty_closure = ()=>{};

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
    
    function reset_drag(){
        if(drag_item){
            drag_item.style.pointerEvents = "auto";
            drag_item.style.height = "100%";
            drag_item.style.position = "static";
        }
        drag = false;
        drag_item = null;
        drag_item_height = 0;
    }

    function _mouse_move_listener(e: Event){
        // console.log("drag_item", drag_item);
        const e_ = e as MouseEvent;
        if (!drag_item) {
            reset_drag();
            return
        }
        const box = drag_item.getBoundingClientRect();
        const in_bound = e_.x > box.left || e_.x < box.right || e_.y > box.top || e_.y < box.bottom;
        const delta = e_.offsetX > 20 && e_.offsetY > 20;
        if (!delta) return;
        // console.log("mouse_is_down", mouse_is_down);
        // console.log("drag", drag);
        // console.log("in_bound", in_bound);
        // console.log("delta", delta);
        if (
            mouse_is_down &&
            drag 
            // in_bound &&
            // delta
        ){
            drag_item.style.pointerEvents = "none";
            drag_item.style.height = drag_item_height + "px";
            drag_item.style.position = "absolute";
            drag_item.style.left = e_.x - drag_item_height/2 +  "px";
            drag_item.style.top = e_.y - drag_item_height/2 + "px";
        } else {
            reset_drag();
            return
        }
        // let [offset_x, offset_y] = [Math.abs(e_.offsetX), Math.abs(e_.offsetY)];
    }

    function mouse_down(e: Event){
        // console.log("onmosuedown")
        mouse_is_down = true;
        mouse_move_listener = _mouse_move_listener;
        drag = true;
        drag_item = e.currentTarget as HTMLElement ?? null;
        drag_item_height = drag_item.getBoundingClientRect().height;
    }

    function mouse_up(e: Event){
        // console.log("onmouseup");
        mouse_move_listener = empty_closure;
        reset_drag();
    }

    function mouse_over(e: Event){
        console.log("mouse over");
        console.log((e.currentTarget as HTMLElement).parentElement?.id);
        if (!drag) return;
    }

</script>
<svelte:window onmousemove={mouse_move_listener} />
<div
    id="foo"
    style="position: fixed; top: 200px; left: 465px; height: 100px; width: 100px; background: blue;"
>
</div>
<div class="board">
    {#each Array(8) as _, x}
        {#each Array(8) as _, y}
            {@const square: Piece | Empty = g.get(xy_to_dn(`${y + 1},${8 - x}` as XY) as DN)}
            {@const marked = !isPiece(square) ? square.is_marked() : null}
            <div
            class="cell {x&1 ^ y&1 ? 'black' : 'white' }{marked ? '-marked' : null}-cell"
            id="{y + 1},{8 - x}"
            onmouseover={mouse_over}
            onfocus={null}
            >
                <!-- <p>{`${y + 1},${8 - x}`}</p> -->
                {@render piece_snippet(square)}
            </div>
        {/each}
    {/each}
</div>

{#snippet piece_snippet(square : Piece | Empty)}
    {#if isPiece(square)}
    <!-- onclick={toggle_show_attack_squares}     -->
        <div
        class="piece {(square as Piece).colour}-piece"
        
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
        /* border: 5px solid green; */
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
