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

export class ChessComponent {
    private static instance: ChessComponent;

    readonly DRAG_DELTA = 30;
    readonly SELECTED_SQUARE = "selected";
    public mouse_move_listener: (e: MouseEvent) => void = $state(() => { });
    public mouse_is_down = false;
    public drag = false;
    public drag_item: HTMLDivElement | null = null;
    public drag_item_height: number = 0;
    public drag_hover_cell: string | null = null;
    public readonly g: Grid;
    public readonly template_functions = TemplateFunctions.get_instance();
    readonly empty_closure = () => { };

    private constructor(grid: Grid) {
        this.g = grid;
    }

    public static get_instance(grid?: Grid): ChessComponent {
        if (this.instance) return this.instance
        this.instance = new ChessComponent(grid ? grid : new Grid());
        return this.instance;
    }

    public onMount() {
        //@ts-ignore
        window.grid = ChessComponent.get_instance().g;
    }


    public reset_drag = () => {
        if (this.drag_item) {
            this.drag_item.style.pointerEvents = "auto";
            this.drag_item.style.height = "100%";
            this.drag_item.style.position = "static";
        }
        this.drag = false;
        this.drag_item = null;
        this.drag_item_height = 0;
        this.drag_hover_cell = null;
        console.debug("drag resetted");
    }

    /**
     * onlick + onkeydown listener for div.piece
     * @param e
     */
    public toggle_show_attack_squares = (e: Event) => {
        if (e instanceof KeyboardEvent)
            if (!["Enter", " "].includes(e.key)) return;

        const square = (e.currentTarget as HTMLElement)?.parentElement;
        if (!square)
            throw new Error(`Can't find square for ${e.currentTarget}`);

        const dn = xy_to_dn(square.id as XY);

        const piece = this.g.get(dn);
        if (!isPiece(piece)) return;

        this.g.toggle_attack_squares(piece, piece.selected);
        (e.currentTarget as HTMLElement).classList.toggle("selected");
        // square.classList.toggle("selected");
        piece.selected = !piece.selected;
    }

    /**
     * onmousemove listener for window
     * @param e
     */
    public _mouse_move_listener = (e: MouseEvent) => {
        // console.debug("this.drag_item", this.drag_item);
        if (this.drag && this.drag_item && this.mouse_is_down) {
            this.drag_item.style.pointerEvents = "none";
            this.drag_item.style.height = this.drag_item_height + "px";
            this.drag_item.style.position = "absolute";
            this.drag_item.style.left = e.x - this.drag_item_height / 2 + "px";
            this.drag_item.style.top = e.y - this.drag_item_height / 2 + "px";
            console.debug("moving dom");
            return;
        }
        if (!this.drag_item) {
            console.error(e.currentTarget);
            return;
        }
        if (this.drag_item.classList.contains(this.SELECTED_SQUARE))
            // if (this.drag_item.parentElement?.classList.contains(SELECTED_SQUARE))
            return;
        const delta = e.offsetX > this.DRAG_DELTA || e.offsetY > this.DRAG_DELTA;
        // console.debug("NOT moving dom")
        // console.debug("delta: ", e.offsetX, e.offsetY )
        if (!delta) return;
        this.drag_item_height = this.drag_item.getBoundingClientRect().height;
        this.drag = true;
    }

    /**
     * mouse_down listener for div.piece
     * @param e
     */
    public mouse_down = (e: MouseEvent) => {
        console.debug("onmosuedown");
        if (!e.currentTarget) return;
        this.mouse_is_down = true;
        this.drag_item = e.currentTarget as HTMLDivElement;
        this.mouse_move_listener = this._mouse_move_listener;
    }

    /**
     * onmouseup listener on window
     * @param e
     */
    public mouse_up = (e: Event) => {
        console.debug("mouse up");
        this.mouse_move_listener = this.empty_closure;
        this.mouse_is_down = false;

        if (!this.drag_item || !this.drag_hover_cell || !this.drag) {
            this.reset_drag();
            return;
        }

        let dn = xy_to_dn(this.drag_item.parentElement!.id as XY);
        let piece = this.g.get(dn);
        if (!isPiece(piece)) {
            console.error(piece);
            return;
        }

        dn = xy_to_dn(this.drag_hover_cell as XY);
        this.g.move_piece(piece, dn);
        this.reset_drag();
    }

    /**
     * mouse_over listener on div.cell
     * @param e
     */
    public mouse_over = (e: Event) => {
        // console.log("mouse over", "----------------");
        if (!this.mouse_is_down || !e.currentTarget || !this.drag_item) return;

        const hover_square = e.currentTarget as HTMLElement;
        if (hover_square.id === this.drag_item.parentElement!.id) return;
        this.drag_hover_cell = hover_square.id;
    }

    /**
     * mouse_over listener on div.cell
     * @param e
     */
    public mouse_leave = (e: Event) => {
        if (!this.drag) return;
        this.drag_hover_cell = null;
    }

    public r(x: any, r: any): typeof x {
        // dummy function to trigger reactivity
        return x;
    }
}


class TemplateFunctions {
    private static instance: TemplateFunctions;
    private constructor(){};
    public static get_instance(): TemplateFunctions {
        if (this.instance) return this.instance;
        this.instance = new TemplateFunctions();
        return this.instance;
    }

    public template_data (x: number, y: number) {
        const that = ChessComponent.get_instance();
        const coor: string = `${y + 1},${8 - x}`;
        const cell_colour = (x & 1) ^ (y & 1) ? "black" : "white";
        const square: Square = that.g.get(xy_to_dn(that.r(coor, that.g.reactive_board[coor]) as XY) as DN);
        const piece = isPiece(square) ? square as Piece : null;
        const empty = !piece ? square as Empty : null;
        const marked = empty && empty.is_marked();
        const marked_class = marked ? "-marked" : "";
        const marked_opponent = empty && empty.player_mark_count == 0 && empty.opponent_mark_count > 0 ? "-opponent" : ""
        const marked_both = empty && empty.player_mark_count > 0 && empty.opponent_mark_count > 0 ? "-both" : ""
        const is_vulnerable = piece?.is_vulnerable ? 'vulnerable' : '';                          
        const cell_class = `cell ${cell_colour}${marked_class}${marked_opponent}${marked_both}-cell ${is_vulnerable}`
        return {
            piece: piece,
            cell_class: cell_class
        }
    }
}