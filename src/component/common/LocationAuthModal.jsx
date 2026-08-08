import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Button, HelperText } from "../../styles/ui";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 12px;
`;

const ModalPanel = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
  width: min(900px, 95vw);
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadow.lg};
`;

const MapArea = styled.div`
  width: 100%;
  height: 520px;
  min-height: 320px;
  flex: 1;
`;

const Footer = styled.div`
  padding: 14px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 720px) {
    flex-direction: column;
  }
`;

const Info = styled.div`
  flex: 1;
`;

const Label = styled.p`
  margin: 0 0 8px 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const Address = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const LocationAuthModal = ({ isOpen, onClose, onConfirm }) => {
  const DEFAULT_LAT = 37.5665;
  const DEFAULT_LNG = 126.978;
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [currentLocation, setCurrentLocation] = useState({
    lat: null,
    lng: null,
    address: "",
    province: "",
    city: "",
    district: "",
  });
  const markerRef = useRef(null);
  const markerDragListenerRef = useRef(null);
  const mapClickListenerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hasKakaoMap = () =>
    typeof window !== "undefined" && !!window.kakao && !!window.kakao.maps;
  const hasKakaoServices = () => hasKakaoMap() && !!window.kakao.maps.services;

  const waitForKakaoReady = () =>
    new Promise((resolve, reject) => {
      if (!hasKakaoMap()) {
        reject(new Error("카카오 객체가 없습니다."));
        return;
      }

      if (typeof window.kakao.maps.load === "function") {
        window.kakao.maps.load(() => resolve());
        return;
      }

      resolve();
    });

  const ensureKakaoSdk = () =>
    new Promise((resolve, reject) => {
      if (hasKakaoMap()) {
        waitForKakaoReady().then(resolve).catch(reject);
        return;
      }

      const existing = document.querySelector(
        "script[data-kakao-map='true'], script[src*='dapi.kakao.com/v2/maps/sdk.js']"
      );
      if (existing) {
        existing.addEventListener(
          "load",
          () => waitForKakaoReady().then(resolve).catch(reject),
          { once: true }
        );
        existing.addEventListener("error", () => reject(new Error("카카오 지도 SDK 로드 실패")), {
          once: true,
        });
        if (hasKakaoMap()) {
          waitForKakaoReady().then(resolve).catch(reject);
        }
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://dapi.kakao.com/v2/maps/sdk.js?appkey=0fb0c1e7506cf3c5eb5f5c8a72dbea08&autoload=false&libraries=services";
      script.async = true;
      script.dataset.kakaoMap = "true";
      script.onload = () => waitForKakaoReady().then(resolve).catch(reject);
      script.onerror = () => reject(new Error("카카오 지도 SDK 로드 실패"));
      document.head.appendChild(script);
    });

  const updateMarker = (lat, lng) => {
    if (!hasKakaoMap() || !map.current) return;
    if (markerRef.current && markerDragListenerRef.current) {
      window.kakao.maps.event.removeListener(
        markerRef.current,
        "dragend",
        markerDragListenerRef.current
      );
    }
    if (markerRef.current) markerRef.current.setMap(null);

    markerRef.current = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(lat, lng),
      map: map.current,
      draggable: true,
    });

    markerDragListenerRef.current = () => {
      const position = markerRef.current.getPosition();
      const nextLat = position.getLat();
      const nextLng = position.getLng();

      setCurrentLocation((prev) => ({
        ...prev,
        lat: nextLat,
        lng: nextLng,
        address: "위치 이동됨, 주소 변환 중...",
      }));
      setLoading(true);
      setErrorMessage("");
      resolveAddressFast(nextLat, nextLng);
    };

    window.kakao.maps.event.addListener(
      markerRef.current,
      "dragend",
      markerDragListenerRef.current
    );

    map.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
  };

  const resolveAddressFast = (lat, lng) => {
    if (!hasKakaoServices()) {
      setCurrentLocation((prev) => ({
        ...prev,
        lat,
        lng,
        address: "주소 서비스를 불러오지 못했습니다.",
      }));
      setLoading(false);
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    // 1) 빠른 행정동 변환 (속도 우선)
    geocoder.coord2RegionCode(lng, lat, (regionResult, regionStatus) => {
      if (regionStatus === window.kakao.maps.services.Status.OK && regionResult?.length) {
        const hRegion =
          regionResult.find((item) => item.region_type === "H") || regionResult[0];

        const province = hRegion?.region_1depth_name || "";
        const city = hRegion?.region_2depth_name || "";
        const district = hRegion?.region_3depth_name || "";

        setCurrentLocation((prev) => ({
          ...prev,
          lat,
          lng,
          province,
          city,
          district,
          address: [province, city, district].filter(Boolean).join(" "),
        }));
        setLoading(false);

        // 2) 상세 주소는 뒤에서 보강 (UI는 이미 사용 가능)
        geocoder.coord2Address(lng, lat, (addrResult, addrStatus) => {
          if (addrStatus === window.kakao.maps.services.Status.OK && addrResult?.[0]?.address) {
            setCurrentLocation((prev) => ({
              ...prev,
              address: addrResult[0].address.address_name || prev.address,
            }));
          }
        });
        return;
      }

      // region 변환 실패 시 address 변환 fallback
      geocoder.coord2Address(lng, lat, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result?.[0]?.address) {
          const address = result[0].address;
          setCurrentLocation({
            lat,
            lng,
            address: address.address_name,
            province: address.region_1depth_name || "",
            city: address.region_2depth_name || "",
            district: address.region_3depth_name || "",
          });
        } else {
          setCurrentLocation((prev) => ({
            ...prev,
            lat,
            lng,
            address: "주소를 가져올 수 없습니다.",
          }));
        }
        setLoading(false);
      });
    });
  };

  const requestCurrentLocation = () => {
    const getCurrentPositionAsync = (options) =>
      new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

    const run = async () => {
      setLoading(true);
      setErrorMessage("");

      if (!navigator.geolocation) {
        setErrorMessage("이 브라우저는 위치 기능을 지원하지 않습니다.");
        setLoading(false);
        return;
      }

      const optionQueue = [
        // 1) 캐시 허용 + 넉넉한 타임아웃 (최초 성공률 우선)
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
        // 2) 더 넉넉하게 한 번 더 시도
        { enableHighAccuracy: false, timeout: 22000, maximumAge: 600000 },
        // 3) 마지막으로 고정밀 시도
        { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 },
      ];

      let lastError = null;

      for (const options of optionQueue) {
        try {
          const position = await getCurrentPositionAsync(options);
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setCurrentLocation((prev) => ({
            ...prev,
            lat,
            lng,
            address: "위치는 확인됨, 주소 변환 중...",
          }));
          updateMarker(lat, lng);
          resolveAddressFast(lat, lng);
          return;
        } catch (error) {
          lastError = error;
          // 권한 거부는 즉시 중단
          if (error?.code === 1) break;
        }
      }

      const message =
        lastError?.code === 1
          ? "위치 권한이 거부되었습니다. 브라우저에서 위치 권한을 허용해주세요."
          : lastError?.code === 3
          ? "위치 조회 시간이 초과되었습니다. 네트워크/GPS 상태를 확인해주세요."
          : `GPS 위치를 가져올 수 없습니다: ${lastError?.message || "알 수 없는 오류"}`;

      setErrorMessage(message);
      setLoading(false);
    };

    run();
  };

  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;
    let relayoutTimer;
    let relayoutTimer2;

    const initMap = async () => {
      try {
        await ensureKakaoSdk();
        if (isCancelled) return;

        let retry = 0;
        while (!mapContainer.current && retry < 20 && !isCancelled) {
          // 모달/DOM 렌더 타이밍 대기
          // eslint-disable-next-line no-await-in-loop
          await new Promise((resolve) => setTimeout(resolve, 30));
          retry += 1;
        }
        if (isCancelled || !mapContainer.current) {
          setErrorMessage("지도 컨테이너를 찾을 수 없습니다.");
          return;
        }

        // 모달 재오픈 시 이전 지도 DOM 정리
        mapContainer.current.innerHTML = "";

        setErrorMessage("");
        const options = {
          center: new window.kakao.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG),
          level: 4,
        };
        map.current = new window.kakao.maps.Map(mapContainer.current, options);
        updateMarker(DEFAULT_LAT, DEFAULT_LNG);

        if (mapClickListenerRef.current) {
          window.kakao.maps.event.removeListener(
            map.current,
            "click",
            mapClickListenerRef.current
          );
        }
        mapClickListenerRef.current = (mouseEvent) => {
          const latLng = mouseEvent.latLng;
          const nextLat = latLng.getLat();
          const nextLng = latLng.getLng();

          if (markerRef.current) {
            markerRef.current.setPosition(latLng);
          } else {
            updateMarker(nextLat, nextLng);
          }

          setCurrentLocation((prev) => ({
            ...prev,
            lat: nextLat,
            lng: nextLng,
            address: "위치 이동됨, 주소 변환 중...",
          }));
          setLoading(true);
          setErrorMessage("");
          resolveAddressFast(nextLat, nextLng);
        };
        window.kakao.maps.event.addListener(
          map.current,
          "click",
          mapClickListenerRef.current
        );

        relayoutTimer = setTimeout(() => {
          if (map.current && map.current.relayout) {
            map.current.relayout();
            map.current.setCenter(new window.kakao.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG));
          }
        }, 0);

        relayoutTimer2 = setTimeout(() => {
          if (map.current && map.current.relayout) {
            map.current.relayout();
            const lat = currentLocation.lat || DEFAULT_LAT;
            const lng = currentLocation.lng || DEFAULT_LNG;
            map.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
          }
        }, 300);

        requestCurrentLocation();
      } catch (e) {
        if (!isCancelled) {
          setErrorMessage("카카오 지도 SDK를 불러오지 못했습니다.");
        }
      }
    };

    initMap();

    return () => {
      isCancelled = true;
      clearTimeout(relayoutTimer);
      clearTimeout(relayoutTimer2);
      if (map.current && mapClickListenerRef.current) {
        window.kakao.maps.event.removeListener(
          map.current,
          "click",
          mapClickListenerRef.current
        );
      }
      if (markerRef.current && markerDragListenerRef.current) {
        window.kakao.maps.event.removeListener(
          markerRef.current,
          "dragend",
          markerDragListenerRef.current
        );
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(currentLocation.lat, currentLocation.lng, currentLocation.province, currentLocation.city, currentLocation.district);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Overlay>
      <ModalPanel>
        <MapArea ref={mapContainer} />

        <Footer>
          <Info>
            <Label>현재 위치</Label>
            <Address>
              {loading ? "위치를 가져오는 중..." : currentLocation.address || "주소를 가져올 수 없습니다."}
            </Address>
            {!!errorMessage && <HelperText danger>{errorMessage}</HelperText>}
            {currentLocation.province && (
              <HelperText>
                지역: {currentLocation.province} {currentLocation.city} {currentLocation.district}
              </HelperText>
            )}
            <HelperText>
              마커 드래그 또는 지도 클릭으로 세부 위치를 조정할 수 있어요.
            </HelperText>
          </Info>

          <Actions>
            <Button
              onClick={requestCurrentLocation}
              disabled={loading}
              style={{ width: "auto" }}
            >
              다시 시도
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || !currentLocation.lat}
              style={{ width: "auto", backgroundColor: "#16a34a" }}
            >
              확인
            </Button>
            <Button
              onClick={onClose}
              style={{ width: "auto" }}
            >
              취소
            </Button>
          </Actions>
        </Footer>
      </ModalPanel>
    </Overlay>
  );
};

export default LocationAuthModal;
