import { Vector } from "excalibur";

/** Splits a string of text into multiple lines */
class TextBuffer {
  /** The inner array buffer */
  private _buffer: string[] = [];

  /** Create a new TextBuffer instance */
  constructor(private _text: string) {}

  /**
   * Fill the buffer with the line-by-line data
   *
   * Filling the text buffer requires us have a render context to determine how
   * much text can fit on a line.
   *
   * @param ctx        - render context
   * @param resolution - render area
   *
   * @return buffer content
   */
  public fill(ctx: CanvasRenderingContext2D, area: Vector): string[] {
    let words = this._text.split(/\s+/);

    this.clear();

    while (words.length) {
      let wordsPerLine = 0;

      for (let i = 0; i < words.length; i++) {
        const tempText = words.slice(0, i + 1).join(" ");
        const textWidth = ctx.measureText(tempText).width;

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

  /** Determine if the buffer is empty */
  get isEmpty(): boolean {
    return this._buffer.length === 0;
  }

  /** Clear the text buffer */
  public clear() {
    this._buffer = [];
  }

  /**
   * Read the text buffer
   *
   * @return text buffer contents
   */
  public read(): string[] {
    return this._buffer;
  }
}

export default TextBuffer;
