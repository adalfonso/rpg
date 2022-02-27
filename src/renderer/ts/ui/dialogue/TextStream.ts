import TextBuffer from "./TextBuffer";
import Vector from "@common/Vector";

/**
 * Handles to usage of several TextBuffers
 */
class TextStream {
  /**
   * Current text to display
   */
  private _fragment = "";

  /**
   * Index of the data that is currently rendering
   */
  private _index = 0;

  /**
   * Buffer of current data split for line-by-line rendering
   */
  private _buffer: TextBuffer;

  /**
   * Create a new TextStream
   *
   * @param data - listing of all text lines
   */
  constructor(private _data: string[]) {}

  /**
   * Get the current text fragment
   */
  get fragment(): string {
    return this._fragment;
  }

  /**
   * Determine if the buffer is empty
   */
  get isEmpty(): boolean {
    return this._buffer ? this._buffer.isEmpty : true;
  }

  /**
   * Determine if the stream has completed
   */
  get isDone(): boolean {
    return (
      this._index + 1 >= this._data.length &&
      this._fragment === this._data[this._index]
    );
  }

  /**
   * Build a text buffer with the line-by-line data
   *
   * Filling the text buffer requires us have a render context to determine how
   * much text can fit on a line.
   *
   * @param ctx        - render context
   * @param resolution - render area
   * @param prefix     - prefix the current text line
   */
  public fillBuffer(ctx: CanvasRenderingContext2D, area: Vector, prefix = "") {
    this._data[this._index] = prefix + this._data[this._index];

    this._buffer = new TextBuffer(this._data[this._index]);
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
   * @return buffer contents
   */
  public read(): string[] {
    return this._buffer.read();
  }

  /**
   * Advance the current line of text to the next char(s)
   *
   * @param ticks - number of chars to advance
   *
   * @return if the current line is fully completed
   */
  public tick(ticks: number): boolean {
    const lineLength = this._data[this._index].length;
    const currentLength = ticks + this._fragment.length;
    const endCharIndex = Math.min(lineLength, currentLength) + 1;

    this._fragment = this._data[this._index].substring(0, endCharIndex);

    return this._fragment === this._data[this._index];
  }
}

export default TextStream;
