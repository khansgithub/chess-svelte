import { SLIDE, JUMP, WHITE, BLACK, PieceNames, type COLOUR, type VECTOR_TYPE, type DN, type XY } from './shared';
import { Piece, Rook, Pawn, Bishop } from './pieces';
import { xy_to_dn, dn_to_xy, dn_to_xy_arr, } from './grid_util';
class Empty {
    private _mark: boolean = false;

    public mark_square() { this._mark = true };
    public unmark_square() { this._mark = false };
    public is_marked(): boolean { return !!this._mark };

    public toString(): string {
        return this._mark ? "X" : " ";
    }
}

class Grid {
    private _grid = new Map<XY, Piece | Empty>();

    public WHITE_SIDE = this._side(WHITE);
    public BLACK_SIDE = this._side(BLACK);

    constructor() {
        for (let x = 1; x <= 8; x++) {
            for (let y = 1; y <= 8; y++) {
                let square: Piece | Empty;
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
                if (square instanceof Piece) square.position = coor;
                this._grid.set(coor, square);
            }
        }
    }

    public move(notation: string) {
        //TODO
        throw("Not implemented");
        if (notation.length == 2) {
            // move pawn
        }
    }

    public get_grid(): typeof this._grid{
        return this._grid;
    }

    public move_piece(p: Piece, pos: DN) {
        let [x, y] = dn_to_xy_arr(pos);
        if (x === null || y === null) throw (`Invalid move: ${pos}, ${[x, y]}`);
        let new_pos: XY = `${x},${y}` as XY;
        this._grid.set(p.position, new Empty());
        this._grid.set(new_pos, p);
        p.position = new_pos;
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

    public get(dn: DN): Piece | Empty {
        let square = this._grid.get(dn_to_xy(dn) ?? "" as XY);
        if (square === undefined) throw ("Invalid square: " + dn);
        return square;
    }

    public mark_attack_squares(attack_squares: { [key: string]: XY[] } | DN[], vector_type: VECTOR_TYPE) {
        if (vector_type === SLIDE) {
            const a_s = attack_squares as { [key: string]: XY[] };
            Object.keys(a_s).forEach(vector_name => {
                let skip_vector = false;
                a_s[vector_name].forEach(s => {
                    if (skip_vector) return;
                    let square = this.get(xy_to_dn(s) ?? "" as DN);
                    if (square instanceof Empty) {
                        square.mark_square();
                    } else {
                        skip_vector = true;
                    }
                });
            });
        }
    
        if (vector_type === JUMP) {
            const a_s = attack_squares as DN[];
            a_s.forEach(s => {
                if (s === null) return;
                let square = this.get(s);
                if (square instanceof Empty) {
                    square.mark_square();
                }
            });
        }
    }

    private _side(colour: COLOUR): { [key: string]: Piece | Piece[] } {
        return {
            ROOK_L: new Rook(colour),
            KNIGHT_L: new Piece(PieceNames.KNIGHT, colour),
            BISHOP_L: new Bishop(colour),
            QUEEN: new Piece(PieceNames.QUEEN, colour),
            KING: new Piece(PieceNames.KING, colour),
            BISHOP_R: new Bishop(colour),
            KNIGHT_R: new Piece(PieceNames.KNIGHT, colour),
            ROOK_R: new Rook(colour),
            PAWNS: Array.from({ length: 8 }, _ => new Pawn(colour))
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
    g.mark_attack_squares(bishop.attack_squares(), bishop.vector_type);
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
    Grid
};