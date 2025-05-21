import { type DN, type XY } from './shared';

class UtilError extends Error{}
// type UtilError = {type: "Error"; message: string};

    /**
     * 
     * @param letter 
     * @returns 
     * @throws {UtilError} if the letter is out of A-H range
     */
function letter_to_number(letter: string): number {
    let i = letter.charCodeAt(0) - 97;
    if (i < 0 || i > 8) throw util_error(`letter=${letter} is out of bounds`);
    return i > -1 ? i : 0;
}

/**
 * 
 * @param dn 
 * @returns 
 * @throws {UtilError} if DN is malformed or has values out of range
 */
function dn_to_xy_arr(dn: DN): [number, number] {
    if(!/^[a-h][1-8]$/.test(dn)) throw util_error(`dn=${dn} is malformed`);
    let dn_arr: string[] = (dn as string).split("");
    let x = letter_to_number(dn_arr[0]) + 1;
    let y = parseInt(dn_arr[1]);
    return [x, y];
}

/**
 * 
 * @param dn 
 * @returns 
 * @throws {UtilError} if DN is malformed or has values out of range
 */
function dn_to_xy(dn: DN): XY {
    return dn_to_xy_arr(dn).join(",") as XY;
}

/**
 * 
 * @param xy 
 * @returns 
 * @throws {UtilError} if XY is malformed
 */
function xy_to_dn(xy: XY): DN {
    if(!/^[1-8],[1-8]$/.test(xy)) throw util_error(`xy=${xy} is malformed`);

    let x = parseInt(xy[0]);
    return (" abcdefgh"[x] + xy[2]) as DN;
}


function util_error(msg: string): UtilError{
    return new UtilError(msg);
}

export {
    letter_to_number as letter_to_x,
    dn_to_xy_arr,
    dn_to_xy,
    xy_to_dn,
    type UtilError
};