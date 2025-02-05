// 폼 요소 선택
const form = document.querySelector('form');
const addressInput = document.querySelector('input[placeholder="주소를 입력하세요"]');
const priceInput = document.querySelector('input[placeholder="전세가 입력"]');
const roomCountInput = document.querySelector('input[placeholder="방 수 입력"]');
const roomTypeInputs = document.querySelectorAll('input[name="room_type"]');
const dealTypeInputs = document.querySelectorAll('input[name="deal_type"]');
const moveInInputs = document.querySelectorAll('input[name="move_in"]');
const maintenanceRadioInputs = document.querySelectorAll('input[name="maintenance"]');
const maintenanceFeeInput = document.querySelector('input[placeholder="관리비 입력 (원)"]');
const moveInDateInput = document.querySelector('input[type="date"]');
const floorInput = document.querySelector('input[placeholder="전체 층 수 입력"]');
const bathroomCountInput = document.querySelector('input[placeholder="욕실 수 입력"]');
const elevatorInputs = document.querySelectorAll('input[name="elevator"]');
const parkingInputs = document.querySelectorAll('input[name="parking"]');
const parkingSpacesInput = document.querySelector('input[placeholder="총 가능 주차 수 입력"]');
const heatingCheckboxInputs = document.querySelectorAll('input[name="heating"]');
const descriptionInput = document.querySelector('textarea');
const titleInput = document.querySelector('input[placeholder="제목 (40자 이내)"]');
const imageInput = document.querySelector('input[type="file"]');

// 폼 제출 이벤트 처리
form.addEventListener('submit', async function (e) {
  e.preventDefault(); // 폼 제출 시 페이지 리로드 방지

  // 폼 데이터 수집
  const formData = new FormData(form);
  const data = {};

  formData.forEach((value, key) => {
    // 체크박스나 라디오 버튼을 배열로 처리
    if (data[key]) {
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  });

  // 서버로 전송할 데이터
  const buildingData = {
    property_type: data.property_type || "",
    address: data.address || "",
    size: data.size || 0,
    room_count: data.room_count || 0,
    room_type: data.room_type || "",
    deal_type: data.deal_type || "",
    price: data.price || 0,
    maintenance_fee_included: data.maintenance === '있음' ? true : false,
    maintenance_fee: data.maintenance === '있음' ? (data.maintenance_fee || 0) : 0,
    move_in_type: data.move_in || "",
    move_in_date: data.move_in === '일자선택' ? data.move_in_date : null,
    total_floors: data.floor || 0,
    bathroom_count: data.bathroom || 0,
    elevator: data.elevator === '있음' ? true : false,
    parking_available: data.parking === '가능' ? true : false,
    parking_spaces: data.parking_spaces || 0,
    heating_type: data.heating || [],
    images: data.images || [],
    title: data.title || "",
    description: data.description || "",
  };

  // 이미지 파일 처리
  const imageFiles = imageInput.files;
  if (imageFiles.length > 0) {
    const imageUrls = await uploadImages(imageFiles); // 이미지 업로드 함수 호출
    buildingData.images = imageUrls; // 이미지 URL들 추가
  }

  // 서버로 데이터 전송 (POST 요청)
  try {
    const response = await fetch('/add-building', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildingData),
    });

    if (response.ok) {
      const result = await response.json();
      alert('매물 등록 성공');
      form.reset(); // 폼 초기화
    } else {
      throw new Error('매물 등록 실패');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('매물 등록 중 오류가 발생했습니다.');
  }
});

// 이미지 업로드 함수
async function uploadImages(files) {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  const response = await fetch('/upload-images', {
    method: 'POST',
    body: formData,
  });

  if (response.ok) {
    const result = await response.json();
    return result.imageUrls; // 서버에서 반환된 이미지 URL 배열
  } else {
    throw new Error('이미지 업로드 실패');
  }
}
