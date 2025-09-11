import type { ChatMessage } from '@/pages/Chatbot/components/chat/types';

export type DecoratedMsg = ChatMessage & {
  time?: string;
  showAvatar?: boolean;
  showTail?: boolean;
  stackPosition?: 'single' | 'top' | 'mid' | 'bottom';
  dateKey: string;
};

const sameSender = (a: ChatMessage, b: ChatMessage) => a.role === b.role;

export function decorateMessages(
  items: ChatMessage[],
  opts?: { locale?: string },
): Array<{ type: 'date'; dateKey: string } | { type: 'msg'; item: DecoratedMsg }> {
  const out: Array<{ type: 'date'; dateKey: string } | { type: 'msg'; item: DecoratedMsg }> = [];
  const locale = opts?.locale ?? 'ko-KR';

  const fmtTime = () =>
    new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(new Date());
  const fmtDateKey = (d: Date) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);

  let prevDateKey = '';

  items.forEach((m, i) => {
    const dateKey = fmtDateKey(new Date()); // TODO: 실제 메시지 시간으로 교체
    if (dateKey !== prevDateKey) {
      out.push({ type: 'date', dateKey });
      prevDateKey = dateKey;
    }

    const prev = items[i - 1];
    const next = items[i + 1];
    const isTop = !prev || !sameSender(prev, m);
    const isBottom = !next || !sameSender(next, m);
    const stackPosition =
      isTop && isBottom ? 'single' : isTop ? 'top' : isBottom ? 'bottom' : 'mid';

    const showAvatar = isBottom;
    const showTail = isBottom;

    out.push({
      type: 'msg',
      item: {
        ...m,
        time: fmtTime(),
        showAvatar,
        showTail,
        stackPosition,
        dateKey,
      },
    });
  });

  return out;
}
