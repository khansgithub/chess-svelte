import { SLIDE, JUMP, WHITE, PieceNames, type PieceType, type COLOUR, type VECTOR_TYPE, type DN, type XY } from './shared';
import {xy_to_dn} from './grid_util'

class Piece {
    public piece_type: PieceType = PieceNames.PAWN;
    public colour: COLOUR = WHITE;
    public position: XY = "" as XY;
    public vector_type: VECTOR_TYPE = SLIDE;
    static Vector: { [key: string]: XY[] };
    
    constructor(type: PieceType = PieceNames.PAWN, colour: COLOUR = WHITE) {
        this.piece_type = type;
        this.colour = colour;
    }

    public attack_squares() {
        throw ("Not implmemented for this generic Piece class");
    }

    public toString(): string {
        const r = `${this.piece_type.short}`;
        return this.colour == WHITE ? r.toUpperCase() : r.toLowerCase();
    }
}

class Pawn extends Piece {
    constructor(color: COLOUR) {
        super(PieceNames.PAWN, color);
        this.vector_type = JUMP;
    }

    override attack_squares(): DN[] {
        // letter + 1; letter - 1
        // y + 1
        // d2 -> e3, c3
        let [x, y]: number[] = this.position.split(",").map(s => parseInt(s));
        let attack_squares = [
            xy_to_dn(`${x + 1},${y + 1}` as XY),
            xy_to_dn(`${x - 1},${y + 1}` as XY),
        ];
        return attack_squares.filter(x => !!x) as DN[];
    }
}

class Rook extends Piece {
    private _this_class = Rook;
    static Vector: typeof Piece.Vector = {
        forward: Array<XY>(),
        backward: Array<XY>(),
        left: Array<XY>(),
        right: Array<XY>(),
    };
    
    constructor(colour: COLOUR) {
        super(PieceNames.ROOK, colour);
        this.vector_type = SLIDE;
    }

    override attack_squares(): typeof this._this_class.Vector {
        // d4   -> d[1...8]
        //      -> [a...h]4
        let vector =  { ...this._this_class.Vector };
        let [this_x, this_y]: number[] = this.position.split(",").map(x => parseInt(x));

        [...Array(8).keys()].map(k => k + 1).forEach(i => {
            let h: XY = `${i},${this_y}` as XY;
            if (i > this_x) vector.right.push(h);
            if (i < this_x) vector.left.unshift(h);

            let v: XY = `${this_x},${i}` as XY;
            if (i > this_y) vector.forward.push(v);
            if (i < this_y) vector.backward.unshift(v);
        });
        return vector;
    }
}

class Bishop extends Piece{
    private _this_class = Bishop;
    static Vector: typeof Piece.Vector = {
        ne: Array<XY>(),
        se: Array<XY>(),
        sw: Array<XY>(),
        nw: Array<XY>(),
    };
    
    constructor(colour: COLOUR) {
        super(PieceNames.BISHOP, colour);
        this.vector_type = SLIDE;
    }

    override attack_squares(): typeof this._this_class.Vector {
        // d4   -> e5, f6, g7, h8
    //             - (x + 1, y + 1)
    //          -> c5
    //             - (x - 1, y + 1)
    //          -> c4 
    //             - (x - 1, y - 1)
    //          -> c4
    //             - (x + 1, y - 1)
        const vector =  { ...this._this_class.Vector };
        const [this_x, this_y]: number[] = this.position.split(",").map(x => parseInt(x));

        function in_bounds(x: number, y: number): XY | null{
            if (1 > x || x > 8) return null;
            if (1 > y || y > 8) return null;
            return `${x},${y}` as XY;
        }

        [...Array(8).keys()].map(k => k + 1).forEach(i => {
            let values: {[key: string]: [number, number]} = {
                ne: [this_x + i, this_y + i],
                se: [this_x - i, this_y + i],
                sw: [this_x - i, this_y - i],
                nw: [this_x + i, this_y - i],
            };

            Object.keys(vector).forEach( vector_names => {
                const in_bound_value: XY | null = in_bounds(...values[vector_names]);
                if (in_bound_value) vector[vector_names].push(in_bound_value);
            });
            
        });
        return vector;
    }
}

class Knight extends Piece{
    private _this_class = Bishop;
    static Vector: typeof Piece.Vector = {
        ne: Array<XY>(),
        se: Array<XY>(),
        sw: Array<XY>(),
        nw: Array<XY>(),
    };
    
    constructor(colour: COLOUR) {
        super(PieceNames.BISHOP, colour);
        this.vector_type = SLIDE;
    }

    override attack_squares(): typeof this._this_class.Vector {
        // d4   -> e5, f6, g7, h8
    //             - (x + 1, y + 1)
    //          -> c5
    //             - (x - 1, y + 1)
    //          -> c4 
    //             - (x - 1, y - 1)
    //          -> c4
    //             - (x + 1, y - 1)
        const vector =  { ...this._this_class.Vector };
        const [this_x, this_y]: number[] = this.position.split(",").map(x => parseInt(x));

        function in_bounds(x: number, y: number): XY | null{
            if (1 > x || x > 8) return null;
            if (1 > y || y > 8) return null;
            return `${x},${y}` as XY;
        }

        [...Array(8).keys()].map(k => k + 1).forEach(i => {
            let values: {[key: string]: [number, number]} = {
                ne: [this_x + i, this_y + i],
                se: [this_x - i, this_y + i],
                sw: [this_x - i, this_y - i],
                nw: [this_x + i, this_y - i],
            };

            Object.keys(vector).forEach( vector_names => {
                const in_bound_value: XY | null = in_bounds(...values[vector_names]);
                if (in_bound_value) vector[vector_names].push(in_bound_value);
            });
            
        });
        return vector;
    }
}

export {
    Piece,
    Pawn,
    Rook,
    Bishop
};