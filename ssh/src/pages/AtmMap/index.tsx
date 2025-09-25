import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

const ACCENT = '#A8BFE4';
const HEADER = 'var(--app-header-h, 64px)';
const TOP_OFFSET = `calc(${HEADER} + env(safe-area-inset-top, 0px))`;
const GAP = '1.25rem';
const FOOTER = 'var(--app-footer-h, 0px)';
const BOTTOM_OFFSET = `calc(${FOOTER} + env(safe-area-inset-bottom, 0px))`;

const SEARCH_HERE_THRESHOLD_KM = 0.05;

declare global {
  interface Window {
    kakao: any;
  }
}
type Atm = {
  id: string;
  brand: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'ATM' | 'BRANCH' | 'OTHER';
};
type Bounds = { swLat: number; swLng: number; neLat: number; neLng: number };

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

function buildUserMarkerDataUrl() {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <defs>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#000000" flood-opacity="0.25"/>
      </filter>
    </defs>
    <g filter="url(#shadow)">
      <circle cx="18" cy="18" r="10" fill="#ffffff"/>
      <path d="M18 10.2a3.3 3.3 0 1 1 0 6.6a3.3 3.3 0 0 1 0-6.6zm-5.3 11.8c0-2.6 2.4-4.3 5.3-4.3s5.3 1.7 5.3 4.3v2.4H12.7V22z" fill="${ACCENT}"/>
    </g>
  </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

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
const ItemTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 4px;
`;
const ItemName = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemTypePill = styled.span`
  margin-left: 6px;
  padding: 2px 6px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  background: ${ACCENT};
  color: #fff;
`;
const ItemAddress = styled.div`
  font-size: 12px;
  color: rgba(17, 24, 39, 0.7);
  margin-bottom: 6px;
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

const SearchHereBtn = styled.button`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  top: calc(${TOP_OFFSET} + 8px);
  z-index: 30;
  padding: 0.5rem 0.875rem;
  border-radius: 9999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
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
  const userMarkerRef = useRef<any | null>(null);

  const [brand, setBrand] = useState('전체');
  const [q, setQ] = useState('');

  const [placeFilter, setPlaceFilter] = useState<'all' | 'branch' | 'atm'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<Atm[]>([]);

  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 37.51064,
    lng: 127.0583,
  });

  const [viewCenter, setViewCenter] = useState<{ lat: number; lng: number }>({
    lat: 37.51064,
    lng: 127.0583,
  });
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [ready, setReady] = useState(false);

  const [dirty, setDirty] = useState<boolean>(false);

  const abortRef = useRef<AbortController | null>(null);

  const idleTimerRef = useRef<number | undefined>(undefined);
  const safeItems = useMemo<Atm[]>(() => (Array.isArray(items) ? items : []), [items]);

  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const hasUserLocation = userLat !== null && userLng !== null;

  const [geoError, setGeoError] = useState<string | null>(null);
  const [sdkError, setSdkError] = useState<string | null>(null);

  const getKakaoKey = () => (import.meta as any).env?.VITE_KAKAO_MAP_KEY as string | undefined;

  const isAtmPlace = (a: Atm) => {
    if (a.type === 'ATM') return true;
    if (a.type === 'BRANCH') return false;
    const hay = `${a.name} ${a.address}`.toLowerCase();
    return /atm|무인|자동화|현금|cd|지급기/.test(hay);
  };
  const isBranchPlace = (a: Atm) => {
    if (a.type === 'BRANCH') return true;
    if (a.type === 'ATM') return false;
    const hay = `${a.name} ${a.address}`.toLowerCase();
    return /(지점|영업점|은행)/.test(hay) && !/atm|무인|자동화|현금|cd|지급기/.test(hay);
  };
  const filteredWithDistance = useMemo(() => {
    const base = safeItems.filter((a) => {
      const matchBrand = brand === '전체' ? true : a.brand === brand;
      const matchQ = q ? `${a.name} ${a.address}`.toLowerCase().includes(q.toLowerCase()) : true;
      const matchPlace =
        placeFilter === 'all' ? true : placeFilter === 'atm' ? isAtmPlace(a) : isBranchPlace(a);
      return matchBrand && matchQ && matchPlace;
    });
    if (!hasUserLocation) return base.map((a) => ({ ...a, distanceKm: null as number | null }));
    return base
      .map((a) => ({ ...a, distanceKm: getDistanceKm(userLat!, userLng!, a.lat, a.lng) }))
      .sort((x, y) => x.distanceKm! - y.distanceKm!);
  }, [brand, placeFilter, q, userLat, userLng, hasUserLocation, safeItems]);

  const selected = useMemo(() => {
    const found = filteredWithDistance.find((a) => a.id === selectedId);
    return found || filteredWithDistance[0] || { lat: 37.51064, lng: 127.0583 };
  }, [filteredWithDistance, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    if (typeof selected.lat === 'number' && typeof selected.lng === 'number') {
      setCenter({ lat: selected.lat, lng: selected.lng });
      setDirty(false);
      setViewCenter({ lat: selected.lat, lng: selected.lng });
    }
  }, [selectedId, selected.lat, selected.lng]);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams({
      lat: String(center.lat),
      lng: String(center.lng),
      brand,
      q,
    });
    if (bounds) {
      params.set('swLat', String(bounds.swLat));
      params.set('swLng', String(bounds.swLng));
      params.set('neLat', String(bounds.neLat));
      params.set('neLng', String(bounds.neLng));
    } else {
      params.set('radius', '1500');
    }
    const url = `/api/atms/nearby?${params.toString()}`;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const ac = new AbortController();
    abortRef.current = ac;

    fetch(url, { signal: ac.signal, headers: { Accept: 'application/json' } })
      .then(async (r) => {
        const ct = r.headers.get('content-type') || '';
        if (!r.ok) {
          const text = await r.text().catch(() => '');
          throw new Error(`HTTP ${r.status} ${r.statusText} | ${text.slice(0, 160)}`);
        }
        if (!ct.includes('application/json')) {
          const text = await r.text().catch(() => '');
          throw new Error(`Unexpected content-type: ${ct}. First 160 chars: ${text.slice(0, 160)}`);
        }
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data as Atm[]);
        } else {
          console.error('ATM API returned non-array payload:', data);
          setItems([]);
        }
      })
      .catch((e: any) => {
        if (e?.name === 'AbortError') return;
        console.error('ATM fetch failed:', e);
      })
      .finally(() => {
        if (abortRef.current === ac) {
          abortRef.current = null;
        }
      });

    return () => {
      ac.abort();
    };
  }, [ready, center.lat, center.lng, brand, q, bounds]);

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
          const b0 = captureBounds();
          if (b0) setBounds(b0);
          setReady(true);
          renderMarkers();
          renderUserMarker();
          requestAnimationFrame(() =>
            safeRelayout(kakaoMapRef.current, selected.lat, selected.lng),
          );
        });
      } catch (_) {
        setSdkError('카카오맵 SDK 로드 중 오류가 발생했습니다. (도메인/키/네트워크 확인)');
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!window.kakao?.maps || !kakaoMapRef.current) return;

    const onIdle = () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => {
        const c = kakaoMapRef.current!.getCenter();
        const next = { lat: c.getLat(), lng: c.getLng() };
        setViewCenter(next);
        const movedKm = getDistanceKm(center.lat, center.lng, next.lat, next.lng);
        setDirty(movedKm >= SEARCH_HERE_THRESHOLD_KM);
      }, 250);
    };

    window.kakao.maps.event.addListener(kakaoMapRef.current, 'idle', onIdle);
    return () => {
      window.kakao.maps.event.removeListener(kakaoMapRef.current!, 'idle', onIdle);
    };
  }, [center.lat, center.lng, kakaoMapRef.current]);

  useEffect(() => {
    setDirty(false);
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!mapRef.current) return;
    const el = mapRef.current;
    const onResize = () => {
      if (!kakaoMapRef.current) return;
      safeRelayout(kakaoMapRef.current);
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
    renderUserMarker();
    if (selectedId) {
      kakaoMapRef.current.panTo(new window.kakao.maps.LatLng(selected.lat, selected.lng));
    }
    safeRelayout(kakaoMapRef.current);
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

  function renderUserMarker() {
    if (!window.kakao?.maps || !kakaoMapRef.current) return;

    if (!hasUserLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      return;
    }

    const pos = new window.kakao.maps.LatLng(userLat!, userLng!);
    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition(pos);
      userMarkerRef.current.setMap(kakaoMapRef.current);
      return;
    }

    const imgSrc = buildUserMarkerDataUrl();
    const size = new window.kakao.maps.Size(36, 36);
    const offset = new window.kakao.maps.Point(18, 32);
    const markerImage = new window.kakao.maps.MarkerImage(imgSrc, size, { offset });

    const marker = new window.kakao.maps.Marker({
      position: pos,
      image: markerImage,
      zIndex: 999,
      clickable: false,
    });
    marker.setMap(kakaoMapRef.current);
    userMarkerRef.current = marker;
  }
  function captureBounds(): Bounds | null {
    if (!window.kakao?.maps || !kakaoMapRef.current) return null;
    try {
      const b = kakaoMapRef.current.getBounds();
      const sw = b.getSouthWest();
      const ne = b.getNorthEast();
      return { swLat: sw.getLat(), swLng: sw.getLng(), neLat: ne.getLat(), neLng: ne.getLng() };
    } catch {
      return null;
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
      (_) => {
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

  const handleSearchHere = () => {
    const b = captureBounds();
    if (b) setBounds(b);
    setCenter({ lat: viewCenter.lat, lng: viewCenter.lng });
  };

  return (
    <Container>
      <MapContainer ref={mapRef} />
      {dirty && (
        <SearchHereBtn type="button" onClick={handleSearchHere} aria-label="이 지역 검색하기">
          이 지역 검색하기
        </SearchHereBtn>
      )}
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
              <SegBar role="group" aria-label="유형 필터">
                {[
                  { label: '전체', value: 'all' },
                  { label: '지점', value: 'branch' },
                  { label: 'ATM', value: 'atm' },
                ].map((c) => (
                  <SegButton
                    key={c.value}
                    $active={placeFilter === c.value}
                    onClick={() => setPlaceFilter(c.value as 'all' | 'branch' | 'atm')}
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
                <ItemTitleRow>
                  <ItemName>{a.name}</ItemName>
                  <ItemTypePill>
                    {a.type === 'ATM' ? 'ATM' : a.type === 'BRANCH' ? '지점' : '기타'}
                  </ItemTypePill>
                </ItemTitleRow>
                <ItemAddress>{a.address}</ItemAddress>
              </ListItem>
            ))}
          </ListGrid>
        </ListWrap>
      </Panel>
      <Fab
        type="button"
        onClick={flyToUser}
        aria-label={hasUserLocation ? '내 위치로 이동' : '내 위치 사용하기'}
        title={hasUserLocation ? '위치로 이동' : '위치 사용하기'}
      >
        📍
      </Fab>
      {sdkError && <ErrSdk>{sdkError}</ErrSdk>}
      {geoError && <ErrGeo>{geoError}</ErrGeo>}
    </Container>
  );
};

export default AtmMapPage;
