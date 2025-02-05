const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 8080;

// MongoDB 연결 설정
require('dotenv').config(); // dotenv 설정

const uri = process.env.MONGODB_URI; // .env에서 MongoDB URI 가져오기
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB 연결에 성공했습니다!');
}).catch((err) => {
  console.error('MongoDB 연결 오류:', err);
});

// uploads 디렉터리 존재하지 않으면 생성
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const buildingSchema = new mongoose.Schema({
  property_type: String,
  address: String,
  size: Number,
  room_count: Number,
  room_type: String,
  deal_type: String,
  price: Number,
  maintenance_fee_included: Boolean,
  maintenance_fee: Number,
  move_in_type: String,
  move_in_date: Date,
  total_floors: Number,
  bathroom_count: Number,
  elevator: Boolean,
  parking_available: Boolean,
  parking_spaces: Number,
  heating_type: [String],
  images: [String],        // 업로드된 이미지
  image_urls: [String],    // 외부 URL 이미지
  title: String,
  description: String,
  longitude: Number,
  latitude: Number,
}, {
  timestamps: true
});

const Building = mongoose.model('Building', buildingSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage
});

app.use(express.json());
app.use(express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0 }));

// 제품등록페이지
app.get('/product_add', (req, res) => {
  res.sendFile(path.join(__dirname, 'testSell.html'));
});

// 이미지 업로드 처리
app.post('/upload-images', upload.array('files'), (req, res) => {
  const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
  res.json({ imageUrls });
});

// 매물 등록 처리
app.post('/api/add-building', upload.array('images', 5), async (req, res) => {
  try {
    const {
      property_type,
      address,
      size,
      room_count,
      room_type,
      deal_type,
      price,
      maintenance_fee_included,
      maintenance_fee,
      move_in_type,
      move_in_date,
      total_floors,
      bathroom_count,
      elevator,
      parking_available,
      parking_spaces,
      heating_type,
      title,
      description,
      latitude,
      longitude,
      image_urls // 추가된 부분
    } = req.body;

    if (!property_type || !address || !size || !price || !title) {
      return res.status(400).json({ message: '필수 입력 값을 확인해주세요.' });
    }

    const elevatorBoolean = elevator === "있음";
    const parsedMoveInDate = move_in_date ? new Date(move_in_date) : null;
    const uploadedImageUrls = req.files.map(file => `/uploads/${file.filename}`);

    // 최대 4개의 URL만 저장
    const imageUrlsFromInput = image_urls ? image_urls.split(',').slice(0, 4) : [];

    const building = new Building({
      property_type,
      address,
      size,
      room_count,
      room_type,
      deal_type,
      price,
      maintenance_fee_included,
      maintenance_fee,
      move_in_type,
      move_in_date: parsedMoveInDate,
      total_floors,
      bathroom_count,
      elevator: elevatorBoolean,
      parking_available,
      parking_spaces,
      heating_type: heating_type ? heating_type.split(',') : [],
      images: uploadedImageUrls,
      image_urls: imageUrlsFromInput,
      title,
      description,
      latitude,
      longitude,
    });

    await building.save();
    res.status(201).json({ message: '매물 등록 성공' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '매물 등록 실패', error: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 매물 상세 정보 조회 API
app.get('/api/building/:id', async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({ message: '매물을 찾을 수 없습니다.' });
    }
    res.json(building);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

app.get('/testDetail', (req, res) => {
  res.sendFile(path.join(__dirname, 'testDetail.html'));
});

// 상세 페이지 라우트 추가
app.get('/building/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'buildingDetail.html'));
});

// mainpage 최신 매물 정보
const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
});

const Property = mongoose.model('Property', propertySchema);

// 최신 매물 가져오기 API
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 }).limit(5);
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: '데이터를 불러오는 중 오류 발생' });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
