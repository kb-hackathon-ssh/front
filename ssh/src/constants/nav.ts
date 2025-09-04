import { ROUTING_PATH } from "@/routes/path.constants";

export const MAIN_NAV = [
  { text: "홈", path: "/" },
  { text: "로그인", path: `/${ROUTING_PATH.landing}` },
  { text: "ATM 지도", path: `/${ROUTING_PATH.atmmap}` },
  { text: "보이스피싱", path: `/${ROUTING_PATH.voicephishing}` },
  { text: "챗봇", path: `/${ROUTING_PATH.chatbot}` },
  { text: "기부", path: `/${ROUTING_PATH.donation}` },
  { text: "설정", path: `/${ROUTING_PATH.setting}` },
] as const;
