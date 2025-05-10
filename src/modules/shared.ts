const PieceNames = {
    KING: {
        name: "king",
        short: "K"
    },
    QUEEN: {
        name: "queen",
        short: "Q"
    },
    ROOK: {
        name: "rook",
        short: "R"
    },
    BISHOP: {
        name: "bishop",
        short: "B"
    },
    KNIGHT: {
        name: "knight",
        short: "N"
    },
    PAWN: {
        name: "pawn",
        short: "P"
    }
} as const;
type PieceType = typeof PieceNames[keyof typeof PieceNames];

const BLACK = "black" as const;
const WHITE = "white" as const;
type COLOUR = typeof BLACK | typeof WHITE;
function isBlack(colour: COLOUR): colour is typeof BLACK {
    return colour == BLACK;
}
function isWhite(colour: COLOUR): colour is typeof WHITE {
    return colour == BLACK;
}

function identify<Type>(arg: unknown, field: string): arg is Type {
    return (arg as any)[field] !== undefined;
}

const JUMP = "jump" as const;
const SLIDE = "slide" as const;
type VECTOR_TYPE = typeof JUMP | typeof SLIDE;

type DN = string & { readonly __brand: unique symbol }
type XY = string & { readonly __brand: unique symbol }


export {
    type PieceType,
    type COLOUR,
    type VECTOR_TYPE,
    type DN,
    type XY,
    PieceNames,
    BLACK,
    WHITE,
    JUMP,
    SLIDE,
    identify
};