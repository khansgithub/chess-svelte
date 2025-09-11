import { Empty, Grid, type Square } from "./modules/grid.svelte";
import { xy_to_dn } from "./modules/grid_util";
import {
    Bishop,
    isPiece,
    Pawn,
    Piece,
    Rook,
} from "./modules/pieces.svelte";
import { type DN, PieceData, type XY } from "./modules/shared";


const css = {
    SELECTED: "selected",
    DRAGGING: "dragging",
    BLACK_SQUARE: "black",
    WHITE_SQUARE: "white",
    MARKED_SQAURE: "-marked",
    BOTH_MARKED_SQUARE: "-both",
    OPPONENT_SQUARE: "-opponent",
    VULNERABLE: "vulnerable"
} as const;


const DRAG_DELTA = 30;
export let mouse_move_listener: (e: MouseEvent) => void = () => { };
let mouse_is_down = false;
export let drag = $state({"state": false});
let drag_item: HTMLDivElement | null = null;
let drag_item_height: number = 0;
let drag_hover_cell: HTMLDivElement | null;
// public drag_hover_cell: string | null = null;
const G = new Grid();
const empty_closure = () => { };

export function onMount() {
    //@ts-ignore
    window.grid = ChessComponent.get_instance().g;
}


function reset_drag() {
    if (drag_item) {
        drag_item.classList.remove(css.DRAGGING);
        drag_item.style.removeProperty("left");
        drag_item.style.removeProperty("top");
        drag_item.style.removeProperty("height");
        // drag_item.style.pointerEvents = "auto";
        // drag_item.style.height = "100%";
        // drag_item.style.position = "static";
    }
    mouse_move_listener = empty_closure;
    drag_item = null;
    drag.state = false;
    // drag_hover_cell = null;
    mouse_is_down = false;
    console.debug("drag resetted");
}

// Event Handlers

export function window_click(e: MouseEvent){
    e.preventDefault();
    // console.log(e.button);
}

/**
 * onlick + onkeydown listener for div.piece
 * @param e
 */
export function toggle_show_attack_squares(e: Event) {
    console.debug("toggle_show_attack_squares", e.currentTarget)
    if (e instanceof KeyboardEvent)
        if (!["Enter", " "].includes(e.key)) return;

    const piece_div =  e.currentTarget as HTMLElement | null;
    const piece_div_img =  piece_div?.querySelector("img");
    const square = piece_div?.parentElement;
    if (!piece_div || !piece_div_img || !square)
        throw new Error(`Can't find square for ${piece_div}`);

    const dn = xy_to_dn(square.id as XY);
    const piece = G.get(dn);
    if (!isPiece(piece)) return;

    piece.selected = !piece_div_img.classList.contains(css.SELECTED);
    G.toggle_attack_squares(piece, piece.selected);
    piece.selected ? piece_div_img.classList.add(css.SELECTED) : piece_div_img.classList.remove(css.SELECTED);
}

/**
 * onmousemove listener for window
 * set drag.state to true after the piece is dragged a certain minimum distance (delta)
 * @param e
 */
function _mouse_move_listener(e: MouseEvent) {
    console.debug("_mouse_move_listener", e.currentTarget)

    //dragging
    if (drag.state) {
        // so if i understand correctly, drag_item MUST be valid if drag is true
        // shouldn't add a typeguard here because this is a constraint
        drag_item!.style.height = drag_item_height + "px";
        drag_item!.style.left = e.x - drag_item_height / 2 + "px";
        drag_item!.style.top = e.y - drag_item_height / 2 + "px";
        console.debug("moving dom");
        return;
    }

    // unexpected error
    if (!drag_item) {
        console.error(e.currentTarget);
        return;
    }
    
    // dragging on to ally selected piece
    if ((drag_item.firstChild as HTMLElement)?.classList.contains(css.SELECTED))
        // if (drag_item.parentElement?.classList.contains(SELECTED_SQUARE))
        return;

    const delta = e.offsetX > DRAG_DELTA || e.offsetY > DRAG_DELTA;
    // console.debug("NOT moving dom")
    // console.debug("delta: ", e.offsetX, e.offsetY )
    if (!delta) return;
    drag_item_height = drag_item.getBoundingClientRect().height;
    drag_item.style.height = drag_item_height + "px";
    drag_item.classList.add(css.DRAGGING);
    drag.state = true;
}

/**
 * mouse_down listener for div.piece
 * @param e
 */
export function mouse_down (e: MouseEvent) {
    console.debug("mouse down", e.currentTarget)
    if (e.button != 0 || !e.currentTarget) return;
    mouse_is_down = true;
    drag_item = e.currentTarget as HTMLDivElement;
    mouse_move_listener = _mouse_move_listener;
}

/**
 * onmouseup listener on window
 * @param e
 */
export function mouse_up  (e: Event) {
    console.debug("mouse up", e.currentTarget)
    console.log(drag.state)
    if (drag.state && drag_item && !drag_hover_cell!.isEqualNode(drag_item)){
        // add logic to capture enemy piece
        console.log("Hover elem:", drag_hover_cell);
        let dn = xy_to_dn(drag_item.parentElement!.id as XY);
        let piece = G.get(dn);
        if (!isPiece(piece)) {
            console.error(piece);
            return;
        }
        dn = xy_to_dn(drag_hover_cell!.id as XY);
        G.move_piece(piece, dn);
        reset_drag();
        return
    }
    reset_drag();
}

/**
 * mouse_over listener on div.cell
 * @param e
 */
export  function mouse_over (e: Event) {
    console.debug("mouse_over", e.currentTarget)
    if (!mouse_is_down || !e.currentTarget || !drag_item) return;
    drag_hover_cell = e.currentTarget as HTMLDivElement;
}

/**
 * mouse_over listener on div.cell
 * @param e
 */
export function mouse_leave (e: Event) {
    console.debug("mouse_leave", e.currentTarget)
    if (!drag.state) return;
    drag_hover_cell = null;
}

/**
 *  dummy function to wrap a reactive var with
 * @param x 
 * @param r 
 * @returns 
 */
function r(x: any, ...args:any): typeof x {
    return x;
}

interface TemplateData {
    piece: Piece | null,
    empty: Empty | null,
    cell_class: string, 
}

export function template_data (x: number, y: number): TemplateData {
    const coor: string = `${y + 1},${8 - x}`;
    const cell_colour = (x & 1) ^ (y & 1) ?  css.BLACK_SQUARE: css.WHITE_SQUARE;
    const square: Square = G.get(xy_to_dn(r(coor, G.reactive_board[coor]) as XY) as DN);
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