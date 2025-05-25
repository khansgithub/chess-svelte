import { SLIDE, JUMP, WHITE, PieceData, PieceNames, type PieceType, type COLOUR, type VECTOR_TYPE, type DN, type XY, BLACK } from './shared';
import { xy_to_dn } from './grid_util'

class Piece {
    public piece_type: PieceType = PieceNames.PAWN;
    public colour: COLOUR = WHITE;
    public position: XY = "" as XY;
    public vector_type: VECTOR_TYPE = SLIDE;
    public selected = false;
    public is_vulnerable = $state(false);
    static Vector: { [key: string]: XY[] };

    constructor(type: PieceType = PieceNames.PAWN, colour: COLOUR = WHITE) {
        this.piece_type = type;
        this.colour = colour;
    }

    public attack_squares(): typeof Piece.Vector {
        throw new Error("Not implmemented for this generic Piece class");
    }

    public toString(): string {
        const r = `${PieceData[this.piece_type].short}`;
        return this.colour == WHITE ? r.toUpperCase() : r.toLowerCase();
    }
}

class Pawn extends Piece {
    constructor(colour: COLOUR) {
        super(PieceNames.PAWN, colour);
        this.vector_type = JUMP;
    }

    override attack_squares(): typeof Piece.Vector {
        // letter + 1; letter - 1
        // y + 1
        // d2 -> e3, c3
        let [x, y]: number[] = this.position.split(",").map(s => parseInt(s));
        if (this.colour == BLACK) y -= 2; // invert direction for black piece
        let arr: [number, number][] = [
            [x + 1, y + 1],
            [x - 1, y + 1],
        ];
        return {
            "": arr.flatMap((v) => in_bounds(...v)).filter(x => !!x) as XY[]
        }
    }
}

namespace Rook {
    export type Vector = {
        forward: Array<XY>,
        backward: Array<XY>,
        left: Array<XY>,
        right: Array<XY>,
    } & typeof Piece.Vector;
}

class Rook extends Piece {
    private _cls = Rook;
    static Vector: Rook.Vector;
    private Vector = this._cls.Vector;

    private new_vector(): typeof this.Vector {
        return {
            forward: new Array<XY>,
            backward: new Array<XY>,
            left: new Array<XY>,
            right: new Array<XY>,
        };
    }

    constructor(colour: COLOUR) {
        super(PieceNames.ROOK, colour);
        this.vector_type = SLIDE;
    }

    override attack_squares(): typeof this.Vector {
        // d4   -> d[1...8]
        //      -> [a...h]4
        const vector = this.new_vector();
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

namespace Bishop {
    export type Vector = {
        ne: Array<XY>,
        se: Array<XY>,
        sw: Array<XY>,
        nw: Array<XY>,
    } & typeof Piece.Vector;
}

class Bishop extends Piece {
    private _cls = Bishop;
    static Vector: Bishop.Vector;
    private vector = this._cls.Vector;

    private new_vector(): typeof this.vector {
        return {
            ne: Array<XY>(),
            se: Array<XY>(),
            sw: Array<XY>(),
            nw: Array<XY>(),
        };
    }

    constructor(colour: COLOUR) {
        super(PieceNames.BISHOP, colour);
        this.vector_type = SLIDE;
    }

    override attack_squares(): typeof this.vector {
        // d4   -> e5, f6, g7, h8
        //             - (x + 1, y + 1)
        //          -> c5
        //             - (x - 1, y + 1)
        //          -> c4 
        //             - (x - 1, y - 1)
        //          -> c4
        //             - (x + 1, y - 1)
        const vector = this.new_vector();
        const [this_x, this_y]: number[] = this.position.split(",").map(x => parseInt(x));


        [...Array(8).keys()].map(k => k + 1).forEach(i => {
            let values: { [key: string]: [number, number] } = {
                ne: [this_x + i, this_y + i],
                se: [this_x - i, this_y + i],
                sw: [this_x - i, this_y - i],
                nw: [this_x + i, this_y - i],
            };

            Object.keys(vector).forEach(vector_names => {
                const in_bound_value: XY | null = in_bounds(...values[vector_names]);
                if (in_bound_value) vector[vector_names].push(in_bound_value);
            });
        });
        return vector;
    }
}

class Knight extends Piece {
    constructor(colour: COLOUR) {
        super(PieceNames.KNIGHT, colour);
        this.vector_type = JUMP;
    }

    override attack_squares(): typeof Piece.Vector {
        let [x, y]: number[] = this.position.split(",").map(s => parseInt(s));
               
        let arr: [number, number][] = [
            [x + 2, y - 1],
            [x + 2, y + 1],
            [x - 2, y - 1],
            [x - 2, y + 1],
            [x - 1, y + 2],
            [x + 1, y + 2],
            [x - 1, y - 2],
            [x + 1, y - 2],
        ];

        return {
            "": arr.flatMap((v) => in_bounds(...v)).filter(x => !!x) as XY[]
            // "": arr.filter(x => !!x) as XY[]
        }
    }
}

namespace Queen {
    export type Vector = {
        n: Array<XY>,
        ne: Array<XY>,
        e: Array<XY>,
        se: Array<XY>,
        s: Array<XY>,
        sw: Array<XY>,
        w: Array<XY>,
        nw: Array<XY>,
    } & typeof Piece.Vector;
}

class Queen extends Piece {
    private _cls = Queen;
    static Vector: Queen.Vector;
    private vector = this._cls.Vector;

    private new_vector(): typeof this.vector {
        return {
            n: Array<XY>(),
            ne: Array<XY>(),
            e: Array<XY>(),
            se: Array<XY>(),
            s: Array<XY>(),
            sw: Array<XY>(),
            w: Array<XY>(),
            nw: Array<XY>(),
        };
    }

    constructor(colour: COLOUR) {
        super(PieceNames.QUEEN, colour);
        this.vector_type = SLIDE;
    }

    override attack_squares(): typeof this.vector {
        const vector = this.new_vector();
        const [this_x, this_y]: number[] = this.position.split(",").map(x => parseInt(x));

        [...Array(8).keys()].map(k => k + 1).forEach(i => {
            let values: { [key: string]: [number, number] } = {
                n: [this_x, this_y + i],
                ne: [this_x + i, this_y + i],
                e: [this_x + i, this_y],
                se: [this_x + i, this_y - i],
                s: [this_x, this_y - i],
                sw: [this_x - i, this_y - i],
                w: [this_x - i, this_y],
                nw: [this_x - i, this_y + i],
            };

            Object.keys(vector).forEach(vector_names => {
                const in_bound_value: XY | null = in_bounds(...values[vector_names]);
                if (in_bound_value) vector[vector_names].push(in_bound_value);
            });
        });
        return vector;
    }
}

namespace King {
    export type Vector = {
        n: Array<XY>,
        ne: Array<XY>,
        e: Array<XY>,
        se: Array<XY>,
        s: Array<XY>,
        sw: Array<XY>,
        w: Array<XY>,
        nw: Array<XY>,
    } & typeof Piece.Vector;
}

class King extends Piece {
    private _cls = King;
    static Vector: King.Vector;
    private vector = this._cls.Vector;

    private new_vector(): typeof this.vector {
        return {
            n: Array<XY>(),
            ne: Array<XY>(),
            e: Array<XY>(),
            se: Array<XY>(),
            s: Array<XY>(),
            sw: Array<XY>(),
            w: Array<XY>(),
            nw: Array<XY>(),
        };
    }

    constructor(colour: COLOUR) {
        super(PieceNames.KING, colour);
        this.vector_type = SLIDE;
    }

    override attack_squares(): typeof this.vector {
        const vector = this.new_vector();
        const [this_x, this_y]: number[] = this.position.split(",").map(x => parseInt(x));

        let i = 1;
        let values: { [key: string]: [number, number] } = {
            n: [this_x, this_y + i],
            ne: [this_x + i, this_y + i],
            e: [this_x + i, this_y],
            se: [this_x + i, this_y - i],
            s: [this_x, this_y - i],
            sw: [this_x - i, this_y - i],
            w: [this_x - i, this_y],
            nw: [this_x - i, this_y + i],
        };

        Object.keys(vector).forEach(vector_names => {
            const in_bound_value: XY | null = in_bounds(...values[vector_names]);
            if (in_bound_value) vector[vector_names].push(in_bound_value);
        });

        return vector;
    }
}

function in_bounds(x: number, y: number): XY | null {
    if (1 > x || x > 8) return null;
    if (1 > y || y > 8) return null;
    return `${x},${y}` as XY;
}

function isPiece(foo: unknown): foo is Piece {
    if(foo == null || foo == undefined) throw new Error("this typeguard should not be getting null");
    return (foo as Piece)?.piece_type !== undefined;
}
export {
    Piece,
    Pawn,
    Rook,
    Bishop,
    Knight,
    Queen,
    King,
    isPiece
};