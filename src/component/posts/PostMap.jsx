import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api, { getApiErrorMessage } from "../../api";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const MAP_CATEGORIES = ["CARE_REQUEST", "CARE_OFFER"];
const CATEGORY_LABELS = {
  CARE_REQUEST: "돌봄이구인",
  CARE_OFFER: "돌봄이구직",
};

const hasValidCoordinates = (item) =>
  Number.isFinite(Number(item?.latitude)) &&
  Number.isFinite(Number(item?.longitude));

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const summarize = (value, maxLength = 45) => {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
};

const loadKakaoMap = () =>
  new Promise((resolve, reject) => {
    const finishLoading = () => {
      if (!window.kakao?.maps) {
        reject(new Error("카카오 지도 객체를 찾을 수 없습니다."));
        return;
      }

      if (typeof window.kakao.maps.load === "function") {
        window.kakao.maps.load(resolve);
      } else {
        resolve();
      }
    };

    if (window.kakao?.maps) {
      finishLoading();
      return;
    }

    const existingScript = document.querySelector(
      "script[src*='dapi.kakao.com/v2/maps/sdk.js']",
    );

    if (existingScript) {
      existingScript.addEventListener("load", finishLoading, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("카카오 지도 SDK를 불러오지 못했습니다.")),
        { once: true },
      );
      return;
    }

    const appKey = import.meta.env.VITE_KAKAO_MAP_KEY;
    if (!appKey) {
      reject(new Error("카카오 지도 키가 설정되지 않았습니다."));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.onload = finishLoading;
    script.onerror = () =>
      reject(new Error("카카오 지도 SDK를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });

const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("이 브라우저는 위치 기능을 지원하지 않습니다."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      reject,
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  });

const PostMap = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get("category");
  const category = MAP_CATEGORIES.includes(categoryParam)
    ? categoryParam
    : "CARE_REQUEST";
  const categoryLabel = CATEGORY_LABELS[category];
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    let cancelled = false;

    const initializeMap = async () => {
      setLoading(true);
      setMessage("");

      try {
        const [sdkResult, postsResult, locationResult] = await Promise.allSettled([
          loadKakaoMap(),
          api.get("/api/posts", {
            params: {
              category,
              page: 0,
              size: 100,
              sort: "modifiedAt,desc",
            },
          }),
          getCurrentPosition(),
        ]);

        if (cancelled) return;
        if (sdkResult.status === "rejected") {
          throw sdkResult.reason;
        }

        const responseData =
          postsResult.status === "fulfilled" ? postsResult.value.data : [];
        const posts = Array.isArray(responseData)
          ? responseData
          : responseData?.content || [];
        const postsWithLocation = posts.filter(
          (post) => post?.category === category && hasValidCoordinates(post),
        );

        const fallbackPost = postsWithLocation[0];
        const fallbackCenter = fallbackPost
          ? {
              lat: Number(fallbackPost.latitude),
              lng: Number(fallbackPost.longitude),
            }
          : DEFAULT_CENTER;
        const center =
          locationResult.status === "fulfilled"
            ? locationResult.value
            : fallbackCenter;

        if (!mapContainer.current) return;

        mapContainer.current.innerHTML = "";
        map.current = new window.kakao.maps.Map(mapContainer.current, {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level: 7,
          draggable: true,
          scrollwheel: true,
        });
        map.current.setDraggable(true);
        map.current.setZoomable(true);

        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = postsWithLocation.map((post) => {
          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(
              Number(post.latitude),
              Number(post.longitude),
            ),
            map: map.current,
          });
          const priceUnit =
            post.priceUnit === "PER_HOUR" ? "시간당" : "일당";
          const infoWindow = new window.kakao.maps.InfoWindow({
            disableAutoPan: true,
            content: `
              <div style="width:220px;padding:10px 12px;font-size:12px;line-height:1.5;color:#1e293b;text-align:left;">
                <strong style="display:block;margin-bottom:3px;font-size:14px;color:#0f172a;">
                  ${escapeHtml(post.title)}
                </strong>
                <span style="display:block;color:#64748b;">
                  ${escapeHtml(summarize(post.content) || "내용이 없습니다.")}
                </span>
                <span style="display:block;margin-top:5px;">
                  ${escapeHtml(post.region || "지역 미설정")}
                </span>
                <strong style="display:block;margin-top:2px;color:#16a34a;">
                  ${post.price != null ? `${Number(post.price).toLocaleString()}원 (${priceUnit})` : "금액 미정"}
                </strong>
                <span style="display:block;margin-top:5px;color:#2563eb;">
                  클릭하면 게시글로 이동합니다
                </span>
              </div>
            `,
          });

          window.kakao.maps.event.addListener(marker, "mouseover", () => {
            infoWindow.open(map.current, marker);
          });
          window.kakao.maps.event.addListener(marker, "mouseout", () => {
            infoWindow.close();
          });
          window.kakao.maps.event.addListener(marker, "click", () => {
            navigate(`/post/${post.id}`);
          });
          return marker;
        });

        if (locationResult.status === "rejected") {
          setMessage(
            fallbackPost
              ? "현재 위치를 확인할 수 없어 게시글 위치를 중심으로 표시했어요."
              : "현재 위치를 확인할 수 없어 서울 시청을 중심으로 표시했어요.",
          );
        } else if (postsResult.status === "rejected") {
          setMessage(
            getApiErrorMessage(
              postsResult.reason,
              "게시글은 불러오지 못했지만 현재 위치를 지도에 표시했어요.",
            ),
          );
        } else if (postsWithLocation.length === 0) {
          setMessage(`${categoryLabel} 지도에 표시할 게시글이 아직 없어요.`);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("지도 초기화 실패:", error);
          setMessage(error?.message || "지도를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initializeMap();

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [category, categoryLabel, navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>
        📍 {categoryLabel} 지도
      </h2>
      <div style={{ position: "relative" }}>
        <div
          ref={mapContainer}
          style={{
            width: "100%",
            height: "600px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            overflow: "hidden",
            touchAction: "none",
            cursor: "grab",
          }}
        />
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: "8px",
            }}
          >
            지도를 불러오는 중...
          </div>
        )}
      </div>
      {message && (
        <p style={{ marginTop: "10px", color: "#64748b" }}>{message}</p>
      )}
      {!loading && (
        <p style={{ marginTop: "8px", color: "#64748b", fontSize: "13px" }}>
          지도를 드래그해 이동하고, 마커에 마우스를 올려 게시글을 미리 볼 수
          있어요.
        </p>
      )}
    </div>
  );
};

export default PostMap;
