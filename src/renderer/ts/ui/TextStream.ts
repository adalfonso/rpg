import Vector from "@common/Vector";

class TextStream {
  /**
   * Listing of all text lines
   *
   * @prop {string[]} data
   */
  private data: string[] = [];

  /**
   * Current text to display
   *
   * @prop {string} fragment
   */
  private _fragment: string = "";

  /**
   * Index of the data that is currently rendering
   *
   * @prop {number} index
   */
  private index: number = 0;

  /**
   * Buffer of current data split for line-by-line rendering
   */
  private buffer: string[] = [];

  /**
   * Create a new TextStream
   *
   * @param {string[]} data Listing of all text lines
   */
  constructor(data: string[]) {
    this.data = data;
  }

  /**
   * Get the current text fragment
   *
   * @return {string} fragment Current text fragment
   */
  get fragment() {
    return this._fragment;
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
    let text = prefix + this.data[this.index];
    let words = text.split(/\s+/);

    while (words.length) {
      let wordsPerLine = 0;

      for (let i = 0; i < words.length; i++) {
        let tempText = words.slice(0, i + 1).join(" ");
        let textWidth = ctx.measureText(tempText).width;

        if (textWidth > area.x) {
          this.buffer.push(words.slice(0, i).join(" "));
          break;
        } else if (i === words.length - 1) {
          this.buffer.push(words.join(" "));
          wordsPerLine++;
          break;
        }

        wordsPerLine++;
      }

      words = words.slice(wordsPerLine);
    }
  }

  /**
   * Determine if the buffer is empty
   *
   * @return {boolean} If the buffer is empty
   */
  public isEmpty(): boolean {
    return this.buffer.length === 0;
  }

  /**
   * Determine if the stream has completed
   *
   * @return {boolean} If the stream has completed
   */
  public isDone(): boolean {
    return (
      this.index + 1 >= this.data.length &&
      this._fragment === this.data[this.index]
    );
  }

  /**
   * Empty the buffer
   */
  public next() {
    this.buffer = [];
    this.index++;
    this._fragment = "";
  }

  /**
   * Get contents of the buffer
   *
   * @return {string[]} Buffer contents
   */
  public read() {
    return this.buffer;
  }

  /**
   * Advance the current line of text to the next char(s)
   *
   * @param {number}  ticks Number of chars to advance
   *
   * @return {boolean}      If the current line is fully completed
   */
  public tick(ticks: number): boolean {
    let lineLength = this.data[this.index].length;
    let currentLength = ticks + this._fragment.length;
    let endCharIndex = Math.min(lineLength, currentLength) + 1;

    this._fragment = this.data[this.index].substring(0, endCharIndex);

    return this._fragment === this.data[this.index];
  }
}

export default TextStream;
