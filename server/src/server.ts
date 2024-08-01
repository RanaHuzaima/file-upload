import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 4400;

app.use(bodyParser.json({ limit: '25mb' }));
app.use(bodyParser.urlencoded({ limit: '25mb', extended: true }));
app.use(express.static('uploads'));
const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "*",
    Credential: true,
}
app.use(cors(corsOptions))
app.use(express.static("public"));

app.post('/upload', (req, res) => {
    const { productName, des, imagesBlob } = req.body;
  
    if (!productName || !des || !imagesBlob) {
      return res.status(400).send('Missing required fields');
    }
  
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
  
    imagesBlob.forEach((image: { order: number; data: string }, index: number) => {
      const imageBuffer = Buffer.from(image.data, 'base64');
      const imagePath = path.join(uploadPath, `image-${image.order}.png`);
      fs.writeFileSync(imagePath, imageBuffer);
    });
  
    res.send({
      message: 'Files uploaded successfully',
      filePaths: imagesBlob.map((image: { order: number }) => `uploads/image-${image.order}.png`),
    });
  });

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
