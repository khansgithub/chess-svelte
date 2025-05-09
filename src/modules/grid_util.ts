import { type DN, type XY } from './shared';


function letter_to_x(letter: string): number | null {
    let i = letter.charCodeAt(0) - 97;
    // if (i < 1 || i > 8 ) throw ("cannot get x for invalid letter");
    if (i < 0 || i > 8) return null;
    return i > -1 ? i : 0;
}

function dn_to_xy_arr(dn: DN): [number, number] | [null, null] {
    let dn_arr: string[] = dn.split("");
    if (dn_arr.length != 2) throw ("invalid dn: " + dn);

    let x = (letter_to_x(dn_arr[0]) ?? -10) + 1;
    if (x < 1) return [null, null];
    let y = parseInt(dn_arr[1]);

    return [x, y];
}

function dn_to_xy(dn: DN): XY | null {
    const r = dn_to_xy_arr(dn);
    if (r[0] === null) return null;
    return r.join(",") as XY;
}

function xy_to_dn(xy: XY): DN | null {
    let _x = parseInt(xy[0]);
    if (_x < 1 || _x > 8) return null;
    return (" abcdefgh"[_x] + xy[2]) as DN;
}

export {
    letter_to_x,
    dn_to_xy_arr,
    dn_to_xy,
    xy_to_dn
};