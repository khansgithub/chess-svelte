import { type DN, type XY } from './shared';

type UtilError =  
    | {type: "Error"; message: string};

function letter_to_x(letter: string): number | UtilError {
    let i = letter.charCodeAt(0) - 97;
    // if (i < 1 || i > 8 ) throw ("cannot get x for invalid letter");
    if (i < 0 || i > 8) return return_error(`letter=${letter} is out of bounds`);
    return i > -1 ? i : 0;
}

function dn_to_xy_arr(dn: DN): [number, number] | UtilError {
    let dn_arr: string[] = (dn as string).split("");
    if (dn_arr.length != 2) return return_error(`dn=${dn} is an invalid value`)

    let x = letter_to_x(dn_arr[0]);
    if(isError(x)) return x;

    x += 1;
    if (x < 1) return return_error(`x=${x} is out of bounds`);
    let y = parseInt(dn_arr[1]);

    return [x, y];
}

function dn_to_xy(dn: DN): XY | UtilError {
    const r = dn_to_xy_arr(dn);
    if(isError(r)) return r;
    if (r[0] === null) return return_error(`${r} is an invalid array`);
    return r.join(",") as XY;
}

function xy_to_dn(xy: XY): DN | UtilError {
    let _x = parseInt(xy[0]);
    if (_x < 1 || _x > 8) return return_error(`_x=${_x} is out of bounds`);
    return (" abcdefgh"[_x] + xy[2]) as DN;
}

function return_error(msg: string): UtilError{
    return {type: "Error", message: msg};
}

function isError(obj: unknown): obj is UtilError{
    return (obj as UtilError).type !== undefined;
}

export {
    letter_to_x,
    dn_to_xy_arr,
    dn_to_xy,
    xy_to_dn,
    return_error,
    isError,
    type UtilError
};