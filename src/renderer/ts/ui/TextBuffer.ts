import Vector from "@common/Vector";

/**
 * TextBuffer uses a canvas context to split a string of text into multiple
 * lines preventing horizontal overflow when rendering.
 */
class TextBuffer {
  /**
   * The inner array buffer
   *
   * @prop {string[]} _buffer
   */
  private _buffer: string[] = [];

  /**
   * Target text
   *
   * @prop {string} _text
   */
  private _text: string;

  /**
   * Create a new TextBuffer instance
   *
   * @param {string} text Target text
   */
  constructor(text: string) {
    this._text = text;
  }

  /**
   * Fill the buffer with the line-by-line data. Filling the text buffer
   * requires us have a render context to determine how much text can fit on a
   * line.
   *
   * @param  {CanvasRenderingContext2D} ctx        Render context
   * @param  {Vector}                   resolution Render area
   *
   * @return {string[]}                            Buffer content
   */
  public fill(ctx: CanvasRenderingContext2D, area: Vector): string[] {
    let words = this._text.split(/\s+/);

    this.clear();

    while (words.length) {
      let wordsPerLine = 0;

      for (let i = 0; i < words.length; i++) {
        let tempText = words.slice(0, i + 1).join(" ");
        let textWidth = ctx.measureText(tempText).width;

        if (textWidth > area.x) {
          this._buffer.push(words.slice(0, i).join(" "));
          break;
        } else if (i === words.length - 1) {
          this._buffer.push(words.join(" "));
          wordsPerLine++;
          break;
        }

        wordsPerLine++;
      }

      words = words.slice(wordsPerLine);
    }

    return this._buffer;
  }

  /**
   * Determine if the buffer is empty
   *
   * @return {boolean} If the buffer is empty
   */
  get isEmpty(): boolean {
    return this._buffer.length === 0;
  }

  /**
   * Clear the text buffer
   */
  public clear() {
    this._buffer = [];
  }

  /**
   * Read the text buffer
   *
   * @return {string[]} Text buffer contents
   */
  public read(): string[] {
    return this._buffer;
  }
}

export default TextBuffer;
