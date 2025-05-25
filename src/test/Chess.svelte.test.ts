import cssEscape from 'css.escape';
import { fireEvent } from '@testing-library/dom';
import { render, screen } from '@testing-library/svelte';
import { flushSync, mount, unmount } from 'svelte';
import { expect, test, it, describe, afterEach, beforeEach } from 'vitest';
import Chess from "../Chess.svelte";
import { ChessComponent } from "../Chess.script.svelte";

/**
 * have to fucking mount the component every fucking test because of the auto cleanup in testing-library which i can't disable...
 * no clue how the fucking fixture or scoped shit works with vitest
 * this is so fucking frustrating ugh
 */

const container = render(Chess).container;
describe('chess', async() => {

    it("board should exist", {}, () => {
        const container = render(Chess).container;
        expect(container.getElementsByClassName("board")[0]).toBeInTheDocument();
    })

    it("left white pawn should exist at '1,2'", {}, () => {
        const container = render(Chess).container;
        const l_white_pawn = container.querySelector("#\\31\\,2") as HTMLDivElement;
        expect(l_white_pawn).not.toBeNull();
    })

    it("should have a `.piece` as the 2nd child element", () => {
        const container = render(Chess).container;
        const piece = (container.querySelector(`#${cssEscape("1,2")}`) as HTMLDivElement)!!.querySelector(".piece") as HTMLElement;
        expect(piece).not.toBeNull();
        expect(piece).toBeInstanceOf(HTMLDivElement);
        expect(piece!!.classList.contains("white-piece")).toBe(true);
    })

    it("should toggle `selected` when a piece is cliked", async () => {
        const container = render(Chess).container;
        const piece = (container.querySelector(`#${cssEscape("1,2")}`) as HTMLDivElement)?.querySelector(".piece") as HTMLElement;

        await fireEvent.click(piece);            
        expect(piece.classList.contains("selected")).toBeTruthy();

        const white_cell = container.querySelector(`#${cssEscape("2,3")}`)

        expect(white_cell).not.toBeNull();
        expect(white_cell!!.classList.contains("white-marked-cell")).toBeTruthy();

        await fireEvent.click(piece);            
        expect(piece.classList.contains("selected")).not.toBeTruthy();

        expect(white_cell!!.classList.contains("white-marked-cell")).not.toBeTruthy();
    })

    // describe("piece test", async () => {})
});

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