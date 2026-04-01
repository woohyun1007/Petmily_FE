import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api";

const PostMap = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "CARE_REQUEST";
  const [posts, setPosts] = useState([]);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get(`/api/posts?category=${category}`);
        setPosts(response.data);
      } catch (error) {
        console.error("게시글 로딩 실패: ", error);
      }
    };
    fetchPosts();
  }, [category]);

  useEffect(() => {
    if (!mapContainer.current || posts.length === 0) return;

    // 지도 초기화 (첫 게시글 위치로 센터)
    const firstPost = posts.find(p => p.latitude && p.longitude);
    const centerLat = firstPost ? firstPost.latitude : 37.5665;
    const centerLng = firstPost ? firstPost.longitude : 126.978;

    const options = {
      center: new window.kakao.maps.LatLng(centerLat, centerLng),
      level: 7,
    };

    map.current = new window.kakao.maps.Map(mapContainer.current, options);

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 게시글 마커 추가
    posts.forEach(post => {
      if (post.latitude && post.longitude) {
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(post.latitude, post.longitude),
          map: map.current,
        });

        // 인포윈도우
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `
            <div style="padding:5px;font-size:12px;">
              <strong>${post.title}</strong><br>
              ${post.region}<br>
              ${post.price}원 (${post.priceUnit === 'PER_HOUR' ? '시간당' : '일당'})
            </div>
          `,
        });

        window.kakao.maps.event.addListener(marker, "click", () => {
          infowindow.open(map.current, marker);
        });

        markersRef.current.push(marker);
      }
    });
  }, [posts]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📍 {category === "CARE_REQUEST" ? "돌봄이구인" : "돌봄이구직"} 지도</h2>
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "600px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      />
    </div>
  );
};

export default PostMap;