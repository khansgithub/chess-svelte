import cssEscape from 'css.escape';
import { fireEvent } from '@testing-library/dom';
import { render, screen } from '@testing-library/svelte';
import { flushSync, mount, unmount } from 'svelte';
import { expect, test, it, describe, afterEach, beforeEach } from 'vitest';
import Chess from "../Chess.svelte";
import { ChessComponent } from "../Chess.script.svelte";
import type { DN } from '../modules/shared';
import type { Pawn, Piece, Queen } from '../modules/pieces.svelte';

/**
 * have to fucking mount the component every fucking test because of the auto cleanup in testing-library which i can't disable...
 * no clue how the fucking fixture or scoped shit works with vitest
 * this is so fucking frustrating ugh
 */

const board = render(Chess).container;
describe('asd', async () => {

    it("board should exist", {}, () => {
        const board = render(Chess).container;
        expect(board.getElementsByClassName("board")[0]).toBeInTheDocument();
    });

    it("left white pawn should exist at '1,2'", {}, () => {
        const board = render(Chess).container;
        const l_white_pawn = board.querySelector("#\\31\\,2") as HTMLDivElement;
        expect(l_white_pawn).not.toBeNull();
    });

    it("should have a `.piece` as the 2nd child element", () => {
        const board = render(Chess).container;
        const piece =get_square(board, "1,2").querySelector(".piece") as HTMLElement;
        expect(piece).not.toBeNull();
        expect(piece).toBeInstanceOf(HTMLDivElement);
        expect(piece!!.classList.contains("white-piece")).toBe(true);
    });

    it("should toggle be `selected` when a piece is cliked", async () => {
        const board = render(Chess).container;
        const piece =get_square(board, "5,2").querySelector(".piece") as HTMLElement;

        await fireEvent.click(piece);
        // test that the "selected" class is applied when the piece is clicked on
        expect(piece.classList.contains("selected")).toBeTruthy();

        const white_cells = [
            get_square(board, ("4,3")),
            get_square(board, ("6,3"))
        ]

        white_cells.forEach(white_cell => {
            // test that the attack cells are highlighted when the piece is clicked on
            expect(white_cell).not.toBeNull();
            expect(white_cell!!.classList.contains("white-marked-cell")).toBeTruthy();
        })

        await fireEvent.click(piece);

        white_cells.forEach(white_cell => {
            // test that the attack cells are unseclected after the piece is clicked on again
            expect(piece.classList.contains("selected")).not.toBeTruthy();
            expect(white_cell!!.classList.contains("white-marked-cell")).not.toBeTruthy();
        });

    });


    it("should mark the first opponent piece in line when a piece is toggled", async ()=>{
        const chess_component = ChessComponent.get_instance();
        // const queen = chess_component.g.get("d1" as DN) as Queen;
        const pawn_42 = chess_component.g.get("d2" as DN) as Pawn;
        chess_component.g.move_piece(pawn_42, "e3" as DN)

        const board = render(Chess).container;
        const queen = get_square(board, "4,1").querySelector(".piece") as HTMLElement;
        await fireEvent.click(queen);

        const opponent_pawn = get_square(board, "4,7");
        // test that the opponent pawn in line with the queen is vulnerable
        expect(opponent_pawn.classList.contains("vulnerable")).toBeTruthy();
    });


    // describe("piece test", async () => {})
});

function get_square(board: HTMLElement, xy: string): HTMLDivElement{
    return board.querySelector(`#${cssEscape(xy)}`) as HTMLDivElement
}

describe.skip("chess", () => {
    // Instantiate the component using Svelte's `mount` API
    const component = mount(Chess, {
        target: document.body, // `document` exists because of jsdom
        props: {}
    });

    test("board should exist", () => {
        const board = document.getElementsByClassName("board")[0];
        expect(board).toBeInTheDocument();
    })

    // describe('selected', () => {

    //     const chess_component = ChessComponent.get_instance();
    //     const l_white_pawn = document.getElementById("1,2");

    //     it("left white pawn should exist at '1,2'", () => {
    //         expect(l_white_pawn).toBeInTheDocument();
    //     })

    //     it("should have a `piece` as the 2nd child element", () => {
    //         const piece = l_white_pawn!!.querySelector(".piece");
    //         expect(piece).toBeInTheDocument();
    //         expect(piece).toBeInstanceOf(HTMLDivElement);
    //         expect(piece!!.classList.contains("white-piece")).toBe(true);
    //     })

    //     // it("should be `selected` when clicked", () => {
    //     //     const piece = l_white_pawn.querySelector(".piece") as HTMLDivElement;
    //     //     const click_event = new MouseEvent("click");
    //     //     piece.dispatchEvent(click_event);
    //     //     expect(piece.classList.contains("selected"));

    //     //     // it("should be unselected after clicking it again", () => {
    //     //     //     piece.dispatchEvent(click_event);
    //     //     //     expect(!piece.classList.contains("selected"));
    //     //     // })

    //     // })

    // })

    // expect(document.body.innerHTML).toBe('<button>0</button>');

    // // Click the button, then flush the changes so you can synchronously write expectations
    // document.body.querySelector('button')!!.click();
    // flushSync();

    // expect(document.body.innerHTML).toBe('<button>1</button>');

    // Remove the component from the DOM
    unmount(component);
});