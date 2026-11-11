// 【 】で囲んだ部分をマーカー強調にするための分解（純粋関数）。

export type Segment = { text: string; marked: boolean };

// 改行をまたがない、閉じた【 】の組だけを強調にする
const PATTERN = /【([^【】\n]*)】/g;

/**
 * 文章を「ふつうの部分」と「強調する部分」に分ける。【 】の記号自体は返さない。
 * 閉じていない「【」や対応のない「】」は、そのまま文字として残す。
 * 中身が空の「【】」は何も返さない。
 */
export function parseHighlight(text: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(PATTERN)) {
    const start = match.index;
    if (start > last) segments.push({ text: text.slice(last, start), marked: false });
    if (match[1] !== "") segments.push({ text: match[1], marked: true });
    last = start + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last), marked: false });
  return segments;
}
