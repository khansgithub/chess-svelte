import { PAWN_SVG } from "./svg";

const createPiece = <N extends string, S extends string, SVG extends string>(name: N, short: S, svg: SVG) => ({ name, short, svg }) as const;

const PieceData = {
    KING: createPiece("king", "K", ""),
    QUEEN: createPiece("queen", "Q", ""),
    ROOK: createPiece("rook", "R", ""),
    BISHOP: createPiece("bishop", "B", ""),
    KNIGHT: createPiece("knight", "N", ""),
    PAWN: createPiece("pawn", "P", PAWN_SVG)
} as const;
type PieceType = keyof typeof PieceData;
const PieceNames = Object.fromEntries(Object.keys(PieceData).map(k => [k, `${k}`])) as {[K in PieceType]: PieceType};

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
    PieceData,
    BLACK,
    WHITE,
    JUMP,
    SLIDE,
    identify,
    isWhite,
    isBlack
};