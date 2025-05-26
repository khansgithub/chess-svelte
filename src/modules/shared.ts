import { PAWN_SVG } from "./svg";
import wp from "../assets/wp.png";
import bp from "../assets/bp.png";
import wk from "../assets/wk.png";
import bk from "../assets/bk.png";
import wq from "../assets/wq.png";
import bq from "../assets/bq.png";
import wn from "../assets/wn.png";
import bn from "../assets/bn.png";
import wr from "../assets/wr.png";
import br from "../assets/br.png";
import wb from "../assets/wb.png";
import bb from "../assets/bb.png";
const BLACK = "black" as const;
const WHITE = "white" as const;
type COLOUR = typeof BLACK | typeof WHITE;

function isBlack(colour: COLOUR): colour is typeof BLACK {
    return colour == BLACK;
}
function isWhite(colour: COLOUR): colour is typeof WHITE {
    return colour == BLACK;
}

const createPiece = <N extends string, S extends string, IMG extends object>(name: N, short: S, img_b: string, img_w: string) => ({ name, short, img: {black: img_b, white: img_w} }) as const;

const PieceData = {
    KING: createPiece("king", "K", bk, wk),
    QUEEN: createPiece("queen", "Q", bq, wq),
    ROOK: createPiece("rook", "R", br, wr),
    BISHOP: createPiece("bishop", "B", bb, wb),
    KNIGHT: createPiece("knight", "N", bn, wn),
    PAWN: createPiece("pawn", "P", bp, wp),
} as const;


type PieceType = keyof typeof PieceData;
const PieceNames = Object.fromEntries(Object.keys(PieceData).map(k => [k, `${k}`])) as {[K in PieceType]: PieceType};

function identify<Type>(arg: unknown, field: string): arg is Type {
    return (arg as any)[field] !== undefined;
}

const JUMP = "jump" as const;
const SLIDE = "slide" as const;
type VECTOR_TYPE = typeof JUMP | typeof SLIDE;

type DN = string & { readonly __brand: unique symbol }
type XY = string & { readonly __brand: unique symbol }


export {
    BLACK, identify, isBlack, isWhite, JUMP, PieceData, PieceNames, SLIDE, WHITE, type COLOUR, type DN, type PieceType, type VECTOR_TYPE, type XY
};
