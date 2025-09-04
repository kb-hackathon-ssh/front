import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

const ACCENT = '#A8BFE4';
const HEADER = 'var(--app-header-h, 64px)';
const TOP_OFFSET = `calc(${HEADER} + env(safe-area-inset-top, 0px))`;
const GAP = '1.25rem';
const FOOTER = 'var(--app-footer-h, 0px)';
const BOTTOM_OFFSET = `calc(${FOOTER} + env(safe-area-inset-bottom, 0px))`;

declare global {
  interface Window {
    kakao: any;
  }
}

const ATMS = [
  {
    id: 'atm-1',
    brand: 'KB국민은행',
    name: '아미고_삼성중앙역점',
    address: '서울 강남구 봉은사로 471',
    lat: 37.51064,
    lng: 127.0583,
    fee: 0,
  },
  {
    id: 'atm-2',
    brand: 'KB국민은행',
    name: '대명텔레콤_코엑스몰점',
    address: '서울 강남구 영동대로 513',
    lat: 37.5113,
    lng: 127.0589,
    fee: 1100,
  },
  {
    id: 'atm-3',
    brand: 'KB국민은행',
    name: '예당 논현점',
    address: '서울 강남구 학동로 331',
    lat: 37.5139,
    lng: 127.0335,
    fee: 0,
  },
];

function loadKakaoScript(appKey: string, libraries: string[] = ['services']) {
  return new Promise<void>((resolve, reject) => {
    if (window.kakao && window.kakao.maps) return resolve();
    const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-sdk="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (e) => reject(e));
      return;
    }
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=${libraries.join(',')}`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-kakao-sdk', 'true');
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', (e) => reject(e));
    document.head.appendChild(script);
  });
}

const BRANDS = ['전체', 'KB국민은행'];
const FEE_CHIPS: { label: string; value: 'all' | 'free' | 'paid' }[] = [
  { label: '전체', value: 'all' },
  { label: '무료', value: 'free' },
  { label: '유료', value: 'paid' },
];

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const UI = { border: '#e5e7eb', muted: '#6b7280' };

const Container = styled.div`
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;
const MapContainer = styled.div`
  position: fixed;
  top: ${TOP_OFFSET};
  left: 0;
  right: 0;
  bottom: ${BOTTOM_OFFSET};
  width: 100vw;
  height: calc(100vh - ${TOP_OFFSET} - ${BOTTOM_OFFSET});
  background: #eef2ff;
  z-index: 1;
`;
const Panel = styled.div`
  position: fixed;
  top: calc(${TOP_OFFSET} + ${GAP});
  left: ${GAP};
  bottom: calc(${BOTTOM_OFFSET} + ${GAP});

  width: min(420px, calc(100vw - (${GAP} * 2)));

  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(168, 191, 228, 0.28), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(16px) saturate(125%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 2;
`;
const PanelHeader = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
`;
const FilterBar = styled.div`
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SegBar = styled.div`
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SelectBox = styled.select`
  appearance: none;
  padding: 0.5rem 2rem 0.5rem 0.875rem; /* extra right padding for caret */
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  font-weight: 700;
  font-size: 13px;
  color: #111;
  outline: none;
  backdrop-filter: blur(8px);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
  background-image: url('data:image/svg+xml;utf8,\
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>');
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px 16px;
  &:focus {
    outline: 2px solid ${ACCENT};
    outline-offset: 2px;
  }
`;

const SegButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 0.875rem;
  border-radius: 9999px;
  border: 1px solid ${(p) => (p.$active ? ACCENT : 'rgba(255, 255, 255, 0.55)')};
  background: ${(p) => (p.$active ? ACCENT : 'rgba(255, 255, 255, 0.6)')};
  color: ${(p) => (p.$active ? '#fff' : '#111')};
  box-shadow: ${(p) =>
    p.$active ? '0 4px 12px rgba(168,191,228,0.35)' : '0 2px 6px rgba(0, 0, 0, 0.08)'};
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  outline: none;
  backdrop-filter: blur(8px);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
  &:focus-visible {
    outline: 2px solid ${ACCENT};
    outline-offset: 2px;
  }
`;
const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.875rem;
  border-radius: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.35);
  outline: none;
  font-size: 1rem;
`;
const ListWrap = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
`;
const ListGrid = styled.ul`
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
`;
const ListItem = styled.li<{ $selected: boolean }>`
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 0.875rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  ${(p) => (p.$selected ? `box-shadow: 0 0 0 2px rgba(168,191,228,0.9);` : '')}
  &:focus-visible {
    outline: 2px solid ${ACCENT};
    outline-offset: 2px;
  }
`;
const ItemTitle = styled.div`
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 4px;
`;
const ItemAddress = styled.div`
  font-size: 12px;
  color: rgba(17, 24, 39, 0.7);
  margin-bottom: 6px;
`;
const ItemFee = styled.div`
  font-size: 12px;
`;
const Fab = styled.button`
  position: fixed;
  right: ${GAP};
  bottom: calc(${BOTTOM_OFFSET} + ${GAP});
  width: 52px;
  height: 52px;
  border-radius: 9999px;
  border: 1px solid #e5e7eb;
  background: white;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 25;
  font-size: 22px;
  line-height: 1;
`;
const ErrSdk = styled.div`
  position: fixed;
  left: ${GAP};
  top: calc(${TOP_OFFSET} + 0.75rem);
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 0.375rem 0.625rem;
  border-radius: 0.375rem;
  z-index: 40;
  font-size: 14px;
`;
const ErrGeo = styled.div`
  position: fixed;
  left: ${GAP};
  top: calc(${TOP_OFFSET} + 2.5rem);
  background-color: #fef3c7;
  border: 1px solid #fde68a;
  color: #78350f;
  padding: 0.375rem 0.625rem;
  border-radius: 0.375rem;
  z-index: 40;
  font-size: 14px;
`;

function safeRelayout(mapInstance: any, lat?: number, lng?: number) {
  if (!mapInstance || !window.kakao?.maps) return;
  try {
    if (typeof mapInstance.relayout === 'function') {
      mapInstance.relayout();
    } else {
      window.kakao.maps.event.trigger(mapInstance, 'resize');
    }
    if (typeof lat === 'number' && typeof lng === 'number') {
      mapInstance.setCenter(new window.kakao.maps.LatLng(lat, lng));
    }
  } catch {}
}

const AtmMapPage = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const kakaoMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userCircleRef = useRef<any | null>(null);

  const [brand, setBrand] = useState('전체');
  const [feeFilter, setFeeFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const hasUserLocation = userLat !== null && userLng !== null;

  const [geoError, setGeoError] = useState<string | null>(null);
  const [sdkError, setSdkError] = useState<string | null>(null);

  const getKakaoKey = () => (import.meta as any).env?.VITE_KAKAO_MAP_KEY as string | undefined;

  const filteredWithDistance = useMemo(() => {
    const base = ATMS.filter((a) => {
      const matchBrand = brand === '전체' ? true : a.brand === brand;
      const matchFee = feeFilter === 'all' ? true : feeFilter === 'free' ? a.fee === 0 : a.fee > 0;
      const matchQ = q ? `${a.name} ${a.address}`.toLowerCase().includes(q.toLowerCase()) : true;
      return matchBrand && matchFee && matchQ;
    });
    if (!hasUserLocation) return base.map((a) => ({ ...a, distanceKm: null as number | null }));
    return base
      .map((a) => ({ ...a, distanceKm: getDistanceKm(userLat!, userLng!, a.lat, a.lng) }))
      .sort((x, y) => x.distanceKm! - y.distanceKm!);
  }, [brand, feeFilter, q, userLat, userLng, hasUserLocation]);

  const selected = useMemo(() => {
    const found = filteredWithDistance.find((a) => a.id === selectedId);
    return found || filteredWithDistance[0] || { lat: 37.51064, lng: 127.0583 };
  }, [filteredWithDistance, selectedId]);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const appKey = getKakaoKey();
      if (!appKey) {
        setSdkError('환경변수 VITE_KAKAO_MAP_KEY가 없습니다.');
        return;
      }
      try {
        await loadKakaoScript(appKey);
        if (cancelled) return;
        window.kakao.maps.load(() => {
          if (cancelled || !mapRef.current) return;
          const center = new window.kakao.maps.LatLng(selected.lat, selected.lng);
          kakaoMapRef.current = new window.kakao.maps.Map(mapRef.current, { center, level: 5 });
          renderMarkers();
          renderUserCircle();
          requestAnimationFrame(() =>
            safeRelayout(kakaoMapRef.current, selected.lat, selected.lng),
          );
        });
      } catch (e) {
        setSdkError('카카오맵 SDK 로드 중 오류가 발생했습니다. (도메인/키/네트워크 확인)');
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const el = mapRef.current;
    const onResize = () => {
      if (!kakaoMapRef.current) return;
      safeRelayout(kakaoMapRef.current, selected.lat, selected.lng);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [selected.lat, selected.lng]);

  useEffect(() => {
    if (!window.kakao?.maps || !kakaoMapRef.current) return;
    renderMarkers();
    renderUserCircle();
    kakaoMapRef.current.panTo(new window.kakao.maps.LatLng(selected.lat, selected.lng));
    safeRelayout(kakaoMapRef.current, selected.lat, selected.lng);
  }, [filteredWithDistance, selected, hasUserLocation, userLat, userLng]);

  function renderMarkers() {
    if (!window.kakao?.maps || !kakaoMapRef.current) return;
    markersRef.current.forEach((m) => m.setMap && m.setMap(null));
    markersRef.current = [];
    filteredWithDistance.forEach((a) => {
      const pos = new window.kakao.maps.LatLng(a.lat, a.lng);
      const marker = new window.kakao.maps.Marker({ position: pos });
      marker.setMap(kakaoMapRef.current);
      markersRef.current.push(marker);
    });
  }

  function renderUserCircle() {
    if (!window.kakao?.maps || !kakaoMapRef.current) return;
    if (userCircleRef.current) userCircleRef.current.setMap(null);
    if (hasUserLocation) {
      const centerUser = new window.kakao.maps.LatLng(userLat!, userLng!);
      userCircleRef.current = new window.kakao.maps.Circle({
        center: centerUser,
        radius: 120,
        strokeWeight: 3,
        strokeColor: ACCENT,
        strokeOpacity: 0.9,
        strokeStyle: 'shortdash',
        fillColor: ACCENT,
        fillOpacity: 0.15,
      });
      userCircleRef.current.setMap(kakaoMapRef.current);
    }
  }

  const requestUserLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('브라우저가 위치 정보를 지원하지 않음');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
      },
      (err) => {
        setGeoError('위치 정보를 가져올 수 없음');
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const flyToUser = () => {
    if (!hasUserLocation) {
      requestUserLocation();
      return;
    }
    if (!window.kakao?.maps || !kakaoMapRef.current) return;
    kakaoMapRef.current.panTo(new window.kakao.maps.LatLng(userLat!, userLng!));
  };

  return (
    <Container>
      <MapContainer ref={mapRef} />
      <Panel>
        <PanelHeader>
          <SearchInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="지역명, 지점명 검색"
            aria-label="지역명, 지점명 검색"
          />
          <FilterBar>
            <FilterRow>
              <SelectBox
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                aria-label="은행 브랜드 선택"
              >
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </SelectBox>
            </FilterRow>
            <FilterRow>
              <SegBar role="group" aria-label="수수료 필터">
                {FEE_CHIPS.map((c) => (
                  <SegButton
                    key={c.value}
                    $active={feeFilter === c.value}
                    onClick={() => setFeeFilter(c.value)}
                  >
                    {c.label}
                  </SegButton>
                ))}
              </SegBar>
            </FilterRow>
          </FilterBar>
        </PanelHeader>
        <ListWrap>
          <ListGrid>
            {filteredWithDistance.map((a) => (
              <ListItem
                key={a.id}
                $selected={selectedId === a.id}
                onClick={() => setSelectedId(a.id)}
                role="button"
                tabIndex={0}
              >
                <ItemTitle>{a.name}</ItemTitle>
                <ItemAddress>{a.address}</ItemAddress>
                <ItemFee>
                  {a.fee === 0 ? '수수료 무료' : `수수료 ${a.fee.toLocaleString()}원`}
                </ItemFee>
              </ListItem>
            ))}
          </ListGrid>
        </ListWrap>
      </Panel>
      <Fab
        type="button"
        onClick={flyToUser}
        aria-label={hasUserLocation ? '내 위치로 이동' : '내 위치 사용하기'}
        title={hasUserLocation ? '내 위치로 이동' : '내 위치 사용하기'}
      >
        📍
      </Fab>
      {sdkError && <ErrSdk>{sdkError}</ErrSdk>}
      {geoError && <ErrGeo>{geoError}</ErrGeo>}
    </Container>
  );
};

export default AtmMapPage;
