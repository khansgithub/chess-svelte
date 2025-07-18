import { dn_to_xy, dn_to_xy_arr, xy_to_dn, } from './grid_util';
import { Bishop, isPiece, King, Knight, Pawn, Piece, Queen, Rook } from './pieces.svelte';
import { BLACK, SLIDE, WHITE, type COLOUR, type DN, type XY } from './shared';

type Square = Piece | Empty;

class Empty {
    // private _mark: boolean = false;
    public mark_count = $state(0);
    public player_mark_count = $state(0);
    public opponent_mark_count = $state(0);

    public mark_or_unmark(colour: COLOUR, mark: boolean = false) {
        mark ? this.mark_square(colour) : this.unmark_square(colour);        
    }

    public mark_square(colour: COLOUR) {
        if (colour == WHITE) this.player_mark_count += 1;
        else this.opponent_mark_count += 1;
        this.mark_count++;
    }

    public unmark_square(colour: COLOUR) {
        if (colour == WHITE) this.player_mark_count -= 1;
        else this.opponent_mark_count -= 1;
        this.mark_count--;
    };

    public is_marked(): boolean { return this.mark_count > 0; };

    public reset(){
        this.mark_count = 0;
        this.player_mark_count = 0;
        this.opponent_mark_count = 0;
    }

    public toString(): string {
        return this.mark_count > 0 ? "X" : " ";
    }
}

class Grid {
    private _grid = new Map<XY, Square>();
    private _selected_pieces: Set<Piece> = new Set();
    public reactive_board: { [key: string]: string } = $state({});

    public WHITE_SIDE = this._side(WHITE);
    public BLACK_SIDE = this._side(BLACK);

    constructor() {
        const _set = this._grid.set.bind(this._grid);
        this._grid.set = (key: XY, value: Square): Map<XY, Square> => {
            this.reactive_board[key] = value.toString();
            return _set(key, value);
        }
        for (let x = 1; x <= 8; x++) {
            for (let y = 1; y <= 8; y++) {
                let square: Square;
                let _x = Math.max(x - 1, 0);
                switch (y) {
                    case 1:
                        square = this.WHITE_SIDE[Object.keys(this.WHITE_SIDE)[_x]] as Piece;
                        break;

                    case 2:
                        square = (this.WHITE_SIDE.PAWNS as Piece[])[_x];
                        break;

                    case 7:
                        square = (this.BLACK_SIDE.PAWNS as Piece[])[_x];
                        break;

                    case 8:
                        square = this.BLACK_SIDE[Object.keys(this.BLACK_SIDE)[_x]] as Piece;
                        break;

                    default:
                        square = new Empty();
                        break;
                }

                let coor: XY = `${x},${y}` as XY;
                if (isPiece(square)) square.position = coor;
                this._grid.set(coor, square);
            }
        }
    }

    public get get_grid(): typeof this._grid {
        return this._grid;
    }

    public move_piece(p: Piece, pos: DN) {
        let arr = dn_to_xy_arr(pos);
        let swap_to: XY = `${arr[0]},${arr[1]}` as XY;

        let swap_to_square = this._grid.get(swap_to);
        if (isPiece(swap_to_square)) return;
        
        const _temp_selected_pieces = Array.from(this._selected_pieces);
        _temp_selected_pieces.forEach(p => {
            this.toggle_attack_squares(p, false);
        });

        let temp_empty: Empty = this._grid.get(swap_to) as Empty;
        let temp_swap_from = p.position;
        this._grid.set(swap_to, p);
        p.position = swap_to;
        this._grid.set(temp_swap_from, temp_empty);
        temp_empty.reset();

        _temp_selected_pieces.forEach(p => {
            this.toggle_attack_squares(p, true);
        });

    }

    public show_board() {
        console.log("-------------------------");
        for (let x = 8; x > 0; x--) {
            let row = "";
            for (let y = 1; y <= 8; y++) {
                row += this._grid.get(`${y},${x}` as XY);
                row += " ";
            }
            console.log(row);
        }
        // console.log(Array.from({ length: 8 }, (_, i) => String.fromCharCode(97 + i).toUpperCase()).join('|'));
        console.log("-------------------------");
    }

    public get(dn: DN): Square {
        let xy = dn_to_xy(dn);
        let square = this._grid.get(xy);
        if (square === undefined) throw new Error("Invalid square: " + dn);
        return square;
    }

    public toggle_attack_squares(p: Piece, mark = false) {
        const attack_squares = p.attack_squares();
        Object.keys(attack_squares).forEach(vector_name => {
            let skip_vector = false;
            attack_squares[vector_name].forEach(s => {
                if (skip_vector) return;
                let dn = xy_to_dn(s);
                let square = this.get(dn);
                if (isPiece(square)){
                    if (square.colour !== p.colour) {
                        square.is_vulnerable = mark;
                    }
                    skip_vector = p.vector_type == SLIDE;
                } else {
                    square.mark_or_unmark(p.colour, mark);
                }
            });
        });
        mark ? this._selected_pieces.add(p) : this._selected_pieces.delete(p);
    }

    private _side(colour: COLOUR): { [key: string]: Piece | ReadonlyArray<Pawn> } {
        return {
            ROOK_L: new Rook(colour),
            KNIGHT_L: new Knight(colour),
            BISHOP_L: new Bishop(colour),
            QUEEN: new Queen(colour),
            KING: new King(colour),
            BISHOP_R: new Bishop(colour),
            KNIGHT_R: new Knight(colour),
            ROOK_R: new Rook(colour),
            PAWNS: ((() => { return Array.from({ length: 8 }, _ => new Pawn(colour)) })() as ReadonlyArray<Pawn>)
        };

    }

}

function main() {

    {
        // test dn_to_xy
        let test_input: DN[] = ["a1", "d5", "f5", "b4"] as DN[];
        let expect = [[1, 1], [4, 5], [6, 5], [2, 4]];
        test_input.forEach((input, i) => {
            console.log(`input: ${input}`)
            let result = dn_to_xy_arr(input);
            let _expect = expect[i];
            console.log(result, _expect);
            console.log(result[0] == _expect[0], result[1] == _expect[1]);

        });
    }

    {
        // test xy_to_dn
        let test_input: XY[] = ["1,1", "4,5", "6,5", "2,4"] as XY[];
        let expect: DN[] = ["a1", "d5", "f5", "b4"] as DN[];
        test_input.forEach((input, i) => {
            console.log(`input: ${input}`)
            let result = xy_to_dn(input);
            let _expect = expect[i];
            console.log(result, _expect);
            console.log(result == _expect)

        });
    }
}

function main2() {
    const g = new Grid();
    const pawns: Pawn[] = g.WHITE_SIDE.PAWNS as Pawn[];
    const rook = (g.WHITE_SIDE.ROOK_L as Rook);
    const bishop = (g.WHITE_SIDE.BISHOP_L as Bishop);
    g.move_piece(bishop, "d5" as DN);
    g.toggle_attack_squares(bishop);
    // g.move_piece(p, "b3" as DN);
    // g.show_board();

    // pawns.forEach( p => mark_attack_squares(p.attack_squares(), JUMP))
    // g.move_piece(rook, "d3" as DN);
    // g.mark_attack_squares(rook.attack_squares(), rook.vector_type);
    // g.move_piece((g.WHITE_SIDE.ROOK_L as Rook), "" as DN)
    g.show_board();
}

export {
    Empty,
    Grid, type Square
};

