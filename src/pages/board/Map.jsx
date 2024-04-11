import useCustomAxios from '@hooks/useCustomAxios.mjs';
import { useEffect, useRef } from 'react';
const { kakao } = window;
import { useQuery } from '@tanstack/react-query';

function Map() {
  const mapRef = useRef(null);
  const infowindowRef = useRef(null);
  const axios = useCustomAxios();

  const { data } = useQuery({
    queryKey: ['products'],
    queryFn: () => axios.get(`/products`),
    select: response => response.data,
    suspense: true,
  });

  useEffect(() => {
    const container = document.getElementById('map'); // 지도를 표시할 div
    const options = {
      center: new kakao.maps.LatLng(36.994147680093334, 127.12684159248758), // 지도의 중심좌표
      level: 2, // 지도의 확대 레벨
    };

    const map = new kakao.maps.Map(container, options);
    mapRef.current = map;

    const markerImageSrc = `${import.meta.env.VITE_API_SERVER}/files/${
      import.meta.env.VITE_CLIENT_ID
    }/M766aDPww.png`;
    const coffeeMarkers = [];
    createCoffeeMarkers();

    // 마커이미지의 주소와, 크기, 옵션으로 마커 이미지를 생성하여 리턴하는 함수입니다
    function createMarkerImage(src, size, options) {
      const markerImage = new kakao.maps.MarkerImage(src, size, options);
      return markerImage;
    }

    // 좌표와 마커이미지를 받아 마커를 생성하여 리턴하는 함수입니다
    function createMarker(position, image) {
      const marker = new kakao.maps.Marker({
        position: position,
        image: image,
      });

      return marker;
    }
    let infowindowArray = []; //마커 클릭시 인포윈도우 온 오프 기능을 위한 배열
    // 커피숍 마커를 생성하고 커피숍 마커 배열에 추가하는 함수입니다
    function createCoffeeMarkers() {
      for (let i = 0; i < positions.length; i++) {
        const imageSize = new kakao.maps.Size(22, 26),
          imageOptions = {
            spriteOrigin: new kakao.maps.Point(0, 0),
            spriteSize: new kakao.maps.Size(20, 20),
          };

        // 마커이미지와 마커를 생성합니다
        const markerImage = createMarkerImage(
            markerImageSrc,
            imageSize,
            imageOptions,
          ),
          marker = createMarker(positions[i].lating, markerImage);
        // 인포윈도우를 생성합니다
        let infowindow = new kakao.maps.InfoWindow({
          content: positions[i].content,
          removable: true,
        });
        infowindowRef.current = infowindow;

        // 생성된 마커를 커피숍 마커 배열에 추가합니다
        coffeeMarkers.push(marker);
        // 마커에 마우스클릭 이벤트를 등록합니다
        kakao.maps.event.addListener(
          marker,
          'click',
          makeClickListener(mapRef.current, marker, infowindow),
        );
      }
    }

    function makeClickListener(map, marker, infowindow) {
      return function () {
        //마커 클릭시 인포윈도우 열고 닫기

        if (infowindowArray.length !== 0) {
          infowindow.close(map, marker);
          infowindowArray = [];
        } else {
          infowindow.open(map, marker);
          infowindowArray.push(infowindow);
        }
        // console.log(infowindowArray);
      };
    }

    // 커피숍 마커들의 지도 표시 여부를 설정하는 함수입니다
    function setCoffeeMarkers(map) {
      for (let i = 0; i < coffeeMarkers.length; i++) {
        coffeeMarkers[i].setMap(map);
      }
    }

    setCoffeeMarkers(mapRef.current);
  }, [data]);

  console.log(data);
  // data를 받아 지도 핀에 뿌려 줄 정보를 담은 positions 배열을 만든다.
  const positions = data?.item?.map(item => ({
    content: `
    <a href="/boards/cafeDetail/${item._id}">
    <div style="padding:5px;">
    <h1>${item.name} </h1>
    <img style="width:100px;" src=${import.meta.env.VITE_API_SERVER}/files/${
      import.meta.env.VITE_CLIENT_ID
    }/${item.mainImages[0].name} alt="${data.item.name} 사진"
    />
    <p>카페 소개글</P>
    </div>
    </a>
    `,
    lating: new kakao.maps.LatLng(
      item.extra.location[0],
      item.extra.location[1],
    ),
  }));
  console.log(positions);

  function handleCurrentLocation() {
    // HTML5의 geolocation으로 사용할 수 있는지 확인
    if (navigator.geolocation) {
      // GeoLocation을 이용해서 접속 위치를 얻음
      navigator.geolocation.getCurrentPosition(function (position) {
        const lat = position.coords.latitude; // 위도
        const lon = position.coords.longitude; // 경도
        const locPosition = new kakao.maps.LatLng(lat, lon); // geolocation으로 얻어온 좌표
        mapRef.current.panTo(locPosition); // geolocation으로 얻어온 좌표로 이동
      });
    } else {
      // HTML5의 GeoLocation을 사용할 수 없을때 처리
      alert('현재 위치를 찾을 수 없습니다.');
    }
  }

  function handleSelectLocation() {
    const cafePosition = new kakao.maps.LatLng(
      data?.item[1].extra.location[0],
      data?.item[1].extra.location[1],
    );
    mapRef.current.panTo(cafePosition);
  }
  //카페 리스트 받아오기
  const cafeList = data?.item?.map(item => (
    <li key={item._id} onClick={handleSelectLocation}>
      {item.name}
      <img
        src={
          import.meta.env.VITE_API_SERVER +
          '/files/05-cagong/' +
          item.mainImages[0].name
        }
        alt="카페사진"
      />
    </li>
  ));
  return (
    <>
      <div>
        <div id="map" style={{ width: '355px', height: '355px' }} />
        <button onClick={handleCurrentLocation}>현재 위치</button>
      </div>
      <h1>카페 리스트</h1>
      <ul>{cafeList}</ul>
    </>
  );
}

export default Map;
