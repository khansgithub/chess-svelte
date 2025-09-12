import { Grid, type Square, Empty } from "./modules/grid.svelte";
import { xy_to_dn } from "./modules/grid_util";
import {
    Bishop,
    isPiece,
    Pawn,
    Piece,
    Rook,
} from "./modules/pieces.svelte";
import { BLACK, type DN, PieceData, type XY } from "./modules/shared";

export const css = {
    SELECTED: "selected",
    DRAGGING: "dragging",
    BLACK_SQUARE: "black",
    WHITE_SQUARE: "white",
    MARKED_SQAURE: "-marked",
    BOTH_MARKED_SQUARE: "-both",
    OPPONENT_SQUARE: "-opponent",
    VULNERABLE: "vulnerable",
    PIECE: "piece",
    BOARD: "board",
} as const;

const G = new Grid();
const DRAG_DELTA = 30;

let drag_item_height: number = 0;
let drag_hover_cell: HTMLDivElement | null;
let start_drag_position: [number, number] = [0,0];
export let capture_hover_cell: Record<string, HTMLDivElement | null> = $state({state:null});
export let drag = $state({ "state": false });
export let click_target: HTMLDivElement | null = null;

export function onMount() {
    //@ts-ignore
    window.grid = G;
}

/**
 * Invariant: `drag.state` must be true when this function is called.
 */
function reset_drag() {
    if(drag.state == false) throw new Error(); // constraint
    click_target!.classList.remove(css.DRAGGING);
    click_target!.style.removeProperty("left");
    click_target!.style.removeProperty("top");
    click_target!.style.removeProperty("height");
    // drag_item.style.pointerEvents = "auto";
        // drag_item.style.height = "100%";
        // drag_item.style.position = "static";
    click_target = null;
    capture_hover_cell.state = null;
    drag.state = false;
    start_drag_position = [0,0];
    // drag_hover_cell = null;
    console.debug("drag resetted");
}

// Event Handlers

export function window_click(e: MouseEvent) {
    e.preventDefault();
}

/**
 * onlick + onkeydown listener for div.piece
 * @param e
 */
export function toggle_show_attack_squares(e: Event) {
    console.debug("toggle_show_attack_squares", e.currentTarget)
    if (e instanceof KeyboardEvent)
        if (!["Enter", " "].includes(e.key)) return;

    const piece_div = e.currentTarget as HTMLDivElement | null;
    const piece_div_img = piece_div?.querySelector("img");
    const square = piece_div?.parentElement;
    if (!piece_div || !piece_div_img || !square)
        throw new Error(`Can't find square for ${piece_div}`);

    const dn = xy_to_dn(square.id as XY);
    const piece = G.get(dn).mustBe(Piece) as Piece;

    piece.set_select(!piece.is_selected()); // toggle
    G.toggle_attack_squares(piece, piece.is_selected());
    click_target = null;
    // piece.selected ? piece_div_img.classList.add(css.SELECTED) : piece_div_img.classList.remove(css.SELECTED);
}

/**
 * onmousemove listener for window
 * set drag.state to true after the piece is dragged a certain minimum distance (delta)
 * @param e
 */
export function mouse_move_listener(e: MouseEvent) {
    console.debug("_mouse_move_listener", e.currentTarget)
    console.debug("_mouse_move_listener", drag, click_target)

    //dragging
    if (drag.state) {
        // so if i understand correctly, drag_item MUST be valid if drag is true
        // shouldn't add a typeguard here because this is a constraint
        if(!click_target) throw new Error(); // constraint
        click_target!.style.height = drag_item_height + "px";
        click_target!.style.left = e.x - drag_item_height / 2 + "px";
        click_target!.style.top = e.y - drag_item_height / 2 + "px";
        console.debug("moving dom");
        return;
    }

    // Invariant: drag.state is False

    if(click_target == null) throw new Error(); // constraint

    // disable dragging pieces that are selected
    if (isSelected(click_target)){
        click_target = null;
        return
    }

    const delta = e.offsetX > DRAG_DELTA || e.offsetY > DRAG_DELTA;
    // console.debug("NOT moving dom")
    // console.debug("delta: ", e.offsetX, e.offsetY )
    if (!delta) return;
    drag_item_height = click_target.getBoundingClientRect().height;
    click_target.style.height = drag_item_height + "px";
    click_target.classList.add(css.DRAGGING);
    drag.state = true;
}

/**
 * mouse_down listener for div.piece
 * @param e
 */
export function mouse_down(e: MouseEvent) {
    console.debug("mouse down", e.currentTarget)
    if (e.button != 0 || !e.currentTarget) return;
    click_target = e.currentTarget as HTMLDivElement;
    start_drag_position = [e.x, e.y];
}

/**
 * onmouseup listener on window
 * Invarant: this handler fires only when `drag.state` is true. so all over variables are valid.
 * @param e
 */
export function mouse_up(e: Event) {
    if(drag.state == false) throw new Error(); // constraint
    console.debug("mouse up", e.currentTarget)

    // reset the piece if it hasn't moved to a different square
    if (drag_hover_cell === click_target) {
        reset_drag();
        return
    } else if(isOpponent(drag_hover_cell!, click_target!)) {
        // drag_hover_cell
    }

    let dn = xy_to_dn(click_target!.parentElement!.id as XY);
    let piece = G.get(dn).mustBe(Piece) as Piece;
    dn = xy_to_dn(drag_hover_cell!.id as XY);
    G.move_piece(piece, dn);
    reset_drag();
}

/**
 * mouse_over listener on div.cell
 * Invariant: `click_target` must be truthy
 * @param e
 */
export function mouse_over(e: Event) {
    console.debug("mouse_over", e.currentTarget)
    if (!click_target) throw new Error("click_target should exist");
    if (!e.currentTarget) return;
    drag_hover_cell = e.currentTarget as HTMLDivElement;
    capture_hover_cell.state = null;
    if (drag_hover_cell.firstElementChild?.tagName.toLowerCase() == "div"){
        if (isOpponent(drag_hover_cell.firstElementChild as HTMLDivElement, click_target)){
            console.log("capture hover")
            capture_hover_cell.state = drag_hover_cell;
        }
    }
}

/**
 * mouse_over listener on div.cell
 * @param e
 */
export function mouse_leave(e: Event) {
    console.debug("mouse_leave", e.currentTarget)
    if (!drag.state) return;
    drag_hover_cell = null;
}

/**
 * Is the Piece selected / Does the .piece class have the 'selected' class
 * @param drag_item The DIV/.piece element that is clicked to be dragged
 * @returns 
 */
function isSelected(piece_div: HTMLDivElement): boolean {
    if (!piece_div.classList.contains(css.PIECE)) throw new Error("Not a valid Piece dom");
    return piece_div.firstElementChild!.classList.contains(css.SELECTED);
}

/**
 * Is the `player` piece a different colour to the `opponent` piece
 * @param opponent a .piece div
 * @param player  a different .piece div
 * @returns boolean
 */
function isOpponent(opponent: HTMLDivElement, player: HTMLDivElement): boolean{
    const r = [opponent, player].map(p => p.classList.contains(`${BLACK}-${css.PIECE}`));
    return r[0] != r[1];
}

/**
 *  dummy function to wrap a reactive var with
 * @param x 
 * @param r 
 * @returns 
 */
function r(x: any, ...args: any): typeof x {
    return x;
}

interface TemplateData {
    piece: Piece | null,
    empty: Empty | null,
    cell_class: string,
}

export function template_data(x: number, y: number): TemplateData {
    const coor: string = `${y + 1},${8 - x}`;
    const cell_colour = (x & 1) ^ (y & 1) ? css.BLACK_SQUARE : css.WHITE_SQUARE;
    const square: Square = G.get(xy_to_dn(coor as XY) as DN);
    // const square: Square = G.get(xy_to_dn(r(coor, G.reactive_board[coor]) as XY) as DN);
    const piece = isPiece(square) ? square as Piece : null;
    const empty = !piece ? square as Empty : null;
    const marked = empty && empty.is_marked();
    const marked_class = marked ? css.MARKED_SQAURE : "";
    const marked_opponent = empty && empty.player_mark_count == 0 && empty.opponent_mark_count > 0 ? css.OPPONENT_SQUARE : ""
    const marked_both = empty && empty.player_mark_count > 0 && empty.opponent_mark_count > 0 ? css.BOTH_MARKED_SQUARE : ""
    const is_vulnerable = piece?.is_vulnerable ? css.VULNERABLE : '';
    const cell_class = `cell ${cell_colour}${marked_class}${marked_opponent}${marked_both}-cell ${is_vulnerable}`
    return {
        piece: piece,
        cell_class: cell_class,
        empty: empty
    }
}