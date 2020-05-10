import TextBuffer from "./TextBuffer";
import Vector from "@common/Vector";

/**
 * TextStream handles to usage of several TextBuffers to split text up for
 * multi-line rendering.
 */
class TextStream {
  /**
   * Listing of all text lines
   *
   * @prop {string[]} _data
   */
  private _data: string[] = [];

  /**
   * Current text to display
   *
   * @prop {string} _fragment
   */
  private _fragment: string = "";

  /**
   * Index of the data that is currently rendering
   *
   * @prop {number} _index
   */
  private _index: number = 0;

  /**
   * Buffer of current data split for line-by-line rendering
   *
   * @prop {TextBuffer} _buffer
   */
  private _buffer: TextBuffer;

  /**
   * Create a new TextStream
   *
   * @param {string[]} data Listing of all text lines
   */
  constructor(data: string[]) {
    this._data = data;
  }

  /**
   * Get the current text fragment
   *
   * @return {string} fragment Current text fragment
   */
  get fragment(): string {
    return this._fragment;
  }

  /**
   * Determine if the buffer is empty
   *
   * @return {boolean} If the buffer is empty
   */
  get isEmpty(): boolean {
    return this._buffer ? this._buffer.isEmpty : true;
  }

  /**
   * Determine if the stream has completed
   *
   * @return {boolean} If the stream has completed
   */
  get isDone(): boolean {
    return (
      this._index + 1 >= this._data.length &&
      this._fragment === this._data[this._index]
    );
  }

  /**
   * Build a text buffer with the line-by-line data. Filling the text buffer
   * requires us have a render context to determine how much text can fit on a
   * line.
   *
   * @param {CanvasRenderingContext2D} ctx        Render context
   * @param {Vector}                   resolution Render area
   * @param {string}                   prefix     Prefix the current text line
   */
  public fillBuffer(
    ctx: CanvasRenderingContext2D,
    area: Vector,
    prefix: string = ""
  ) {
    let text = prefix + this._data[this._index];

    this._buffer = new TextBuffer(text);
    this._buffer.fill(ctx, area);
  }

  /**
   * Empty the buffer
   */
  public next() {
    this._buffer.clear();
    this._index++;
    this._fragment = "";
  }

  /**
   * Get contents of the buffer
   *
   * @return {string[]} Buffer contents
   */
  public read(): string[] {
    return this._buffer.read();
  }

  /**
   * Advance the current line of text to the next char(s)
   *
   * @param {number}  ticks Number of chars to advance
   *
   * @return {boolean}      If the current line is fully completed
   */
  public tick(ticks: number): boolean {
    let lineLength = this._data[this._index].length;
    let currentLength = ticks + this._fragment.length;
    let endCharIndex = Math.min(lineLength, currentLength) + 1;

    this._fragment = this._data[this._index].substring(0, endCharIndex);

    return this._fragment === this._data[this._index];
  }
}

export default TextStream;
