<script lang="ts">
    import { onMount } from "svelte";
    import { PieceData, type XY } from "./modules/shared";
    import { ChessComponent } from "./Chess.script.svelte";
    import { xy_to_dn } from "./modules/grid_util";

    const c = ChessComponent.get_instance();
    onMount(c.onMount);
</script>

<svelte:window onmousemove={c.mouse_move_listener} onmouseup={c.mouse_up} />
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
            {@const template_data = c.template_functions.template_data(x, y)}
            <div
                class={template_data.cell_class}
                id="{y + 1},{8 - x}"
                onmouseover={c.mouse_over}
                onmouseleave={c.mouse_leave}
                onfocus={null}
                role="none"
            >
                <!-- <p>{`${y + 1},${8 - x}`} / {xy_to_dn(`${y + 1},${8 - x}` as XY)}</p> -->
                 <p>{template_data.empty?.mark_count}</p>
                {#if template_data.piece}
                    <div
                        class="piece {template_data.piece.colour}-piece"
                        onclick={c.toggle_show_attack_squares}
                        onkeydown={c.toggle_show_attack_squares}
                        onmousedown={c.mouse_down}
                        role="button"
                        tabindex="0"
                    >
                        <p>{PieceData[template_data.piece.piece_type].img}</p>
                    </div>
                {/if}
            </div>
        {/each}
    {/each}
</div>

<style>
    :root {
        --white-cell: hsl(0, 0%, 83%);
        --marked_opponent: 20;

        --chessdotcom-board-white: #d3d4bb;
        --chessdotcom-board-black: #5c7842;
        --chessdotcom-piece-black: #53504e;
        --chessdotcom-piece-white: #e0e0e0;
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
        /* transform: scale(2); */
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
        position: relative;
        text-align: center;
        transition:
            box-shadow 0.15s cubic-bezier(0.5, 1.5, 0.5, 1),
            transform 0.15s cubic-bezier(0.5, 1.5, 0.5, 1),        
            background-color 0.2s ease;
        user-select: none; /* Standard syntax */
    }

    .cell > p:first-of-type{
        position: absolute;
        left: 0;
        top: 0;
        background: rgba(255,255,255,0.9);
        font-weight: bold;
        padding: 5px;
    }

    .black-cell {
        background-color: hsl(from var(--white-cell) h s 60%);
        background-color: var(--chessdotcom-board-black);
    }

    .black-marked-cell {
        background-color: hsl(from var(--white-cell) h 100% 75%);
    }

    .black-marked-opponent-cell {
        background-color: hsl(
            from var(--white-cell) calc(h + var(--marked_opponent)) 100% 75%
        );
        background-color: hsl(
            from var(--chessdotcom-board-black) calc(h + var(--marked_opponent))
                100% 75%
        );
    }

    .black-marked-both-cell {
        background-color: hsl(
            from var(--white-cell) calc(h + var(--marked_opponent) * 7) 100% 75%
        );
        background-color: hsl(
            from var(--chessdotcom-board-black)
                calc(h + var(--marked_opponent) * 7) 100% 75%
        );
    }

    .white-cell {
        background-color: var(--white-cell);
        background-color: var(--chessdotcom-board-white);
    }

    .white-marked-cell {
        background-color: hsl(from var(--white-cell) h 100% l);
    }

    .white-marked-opponent-cell {
        background-color: hsl(
            from var(--chessdotcom-board-white) calc(h + var(--marked_opponent))
                100% l
        );
    }

    .white-marked-both-cell {
        background-color: hsl(
            from var(--chessdotcom-board-white)
                calc(h + calc(var(--marked_opponent) * 7)) 100% l
        );
    }

    .piece {
        aspect-ratio: 1/1;
        height: 100%;
        border-radius: 100%;
        display: flex;
        justify-content: center;
        transition:
            box-shadow 0.2s ease,
            background-color 0.2s ease,
            border-color 0.2s ease,
            transform 0.15s cubic-bezier(0.5, 1.5, 0.5, 1);
        border: 1px solid #252521;
        box-shadow: inset 0px 0px 2px 1px rgb(0 0 0 / 72%);
        margin: 1vw;
        /* border: 5px solid green; */
    }

    .piece p {
        margin: auto 0 auto 0;
        font-size: clamp(1rem, 10vw, 4rem);
    }

    .selected {
        /* border-radius: 3px; */
        box-shadow:
            inset 0px 0px 40px 4px white,
            0px 0px 4px 4px white !important;
        border-color: white !important;
        transform: scale(0.97);
        /* transform: scale(1) !important; */
    }

    .white-piece {
        background-color: white;
        background-color: var(--chessdotcom-piece-white);
        color: var(--chessdotcom-piece-black);
    }

    .black-piece {
        background-color: black;
        background-color: var(--chessdotcom-piece-black);
        color: var(--chessdotcom-piece-white);
    }

    .vulnerable {
        background-color: hsl(
            from var(--chessdotcom-piece-white)
                calc(h + var(--marked_opponent) * 14.25) 100% 75%
        );
    }

    .dragging{
        pointer-events: none;
        position: fixed;
        z-index: 99;
    }
</style>
