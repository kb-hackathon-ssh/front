// 공통 채팅 타입 (모든 컴포넌트가 이걸 import)
export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  text: string;
  audioUrl?: string;
  videoUrl?: string;
  // 필요하면 createdAt?: number; 등 추가
};
