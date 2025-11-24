// 초대장 데이터
const inviteData = {
    babyName: "유나",
    eventDate: "2026-01-24T12:00:00+09:00",
    venue: {
        name: "앞산주택택",
        address: "대구광역시 남구 대명동 526-33",
        lat: 37.5665,
        lng: 126.9780
    },
    parents: {
        father: "이상석",
        mother: "최혜정",
        fatherContact: "010-9888-3766",
        motherContact: "010-4112-9947"
    },
    gallery: [
        // 추후 사진 URL만 채우면 됨
        // 예: "/static/images/baby1.jpg",
        //     "/static/images/baby2.jpg",
    ],
    message: "첫 생일 자리에 함께해 주세요."
};

// Vue 3 앱 생성
const { createApp, ref, computed, onMounted } = Vue;

createApp({
    setup() {
        const countdown = ref(null);
        const kakaoMapUrl = ref('');

        // 날짜 포맷팅
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
            const dayName = dayNames[date.getDay()];
            const hours = date.getHours();
            const minutes = date.getMinutes();
            
            return `${year}년 ${month}월 ${day}일 (${dayName}) ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        };

        // D-Day 계산
        const calculateCountdown = () => {
            const eventDate = new Date(inviteData.eventDate);
            const now = new Date();
            
            // 한국 시간으로 변환 (UTC+9)
            const koreaOffset = 9 * 60; // 분 단위
            const nowKorea = new Date(now.getTime() + (now.getTimezoneOffset() + koreaOffset) * 60000);
            const eventKorea = new Date(eventDate.getTime() + (eventDate.getTimezoneOffset() + koreaOffset) * 60000);
            
            // 날짜만 비교 (시간 제외)
            const today = new Date(nowKorea.getFullYear(), nowKorea.getMonth(), nowKorea.getDate());
            const event = new Date(eventKorea.getFullYear(), eventKorea.getMonth(), eventKorea.getDate());
            
            const diffTime = event - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays >= 0) {
                countdown.value = {
                    days: diffDays,
                    hours: Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))
                };
            } else {
                countdown.value = {
                    days: 0
                };
            }
        };

        // 카카오맵 URL 생성
        const generateKakaoMapUrl = () => {
            const { lat, lng, address } = inviteData.venue;
            kakaoMapUrl.value = `https://map.kakao.com/link/map/${address},${lat},${lng}`;
        };

        // 카카오맵 초기화
        const initKakaoMap = () => {
            if (typeof kakao === 'undefined') {
                console.warn('카카오맵 API가 로드되지 않았습니다. API 키를 확인해주세요.');
                return;
            }

            const { lat, lng, name, address } = inviteData.venue;
            const container = document.getElementById('map');
            
            if (!container) return;

            const options = {
                center: new kakao.maps.LatLng(lat, lng),
                level: 3
            };

            const map = new kakao.maps.Map(container, options);

            // 마커 생성
            const markerPosition = new kakao.maps.LatLng(lat, lng);
            const marker = new kakao.maps.Marker({
                position: markerPosition
            });
            marker.setMap(map);

            // 인포윈도우 생성
            const infowindow = new kakao.maps.InfoWindow({
                content: `<div style="padding: 10px; font-size: 14px;"><strong>${name}</strong><br>${address}</div>`
            });
            infowindow.open(map, marker);
        };

        // IntersectionObserver를 사용한 스크롤 애니메이션
        const setupScrollAnimations = () => {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        // 한 번만 애니메이션 실행
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            // 모든 fade-on-scroll 요소 관찰
            document.querySelectorAll('.fade-on-scroll').forEach(el => {
                observer.observe(el);
            });
        };

        // 컴포넌트 마운트 시 실행
        onMounted(() => {
            calculateCountdown();
            generateKakaoMapUrl();
            
            // 카카오맵 API가 로드될 때까지 대기
            if (typeof kakao !== 'undefined') {
                initKakaoMap();
            } else {
                // 카카오맵 API 로드 대기
                const checkKakao = setInterval(() => {
                    if (typeof kakao !== 'undefined') {
                        initKakaoMap();
                        clearInterval(checkKakao);
                    }
                }, 100);
                
                // 5초 후 타임아웃
                setTimeout(() => {
                    clearInterval(checkKakao);
                }, 5000);
            }
            
            setupScrollAnimations();
            
            // D-Day 카운트다운 업데이트 (1분마다)
            setInterval(calculateCountdown, 60000);
        });

        return {
            inviteData,
            countdown,
            kakaoMapUrl,
            formatDate
        };
    }
}).mount('#app');

