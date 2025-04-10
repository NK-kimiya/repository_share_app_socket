const express = require('express');
const http = require('http');//httpsサーバー機能のモジュール
const { Server } = require('socket.io');
const cors = require('cors');//CORSを許可するためのミドルウェア
const mongoose = require('mongoose');



mongoose.connect(
  'mongodb+srv://kinarishige26:test1234@cluster0.upwnupu.mongodb.net/chat-app?retryWrites=true&w=majority&appName=Cluster0',
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => {
  console.log('MongoDB Atlas 接続成功');
}).catch((err) => {
  console.error('MongoDB Atlas 接続失敗:', err);
});

//モデルの作成
const ReadStatusSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  readCount: {
    type: Number,
    default: 0
  }
});

// roomId と username の組み合わせでユニーク制約を付ける（1ユーザー1レコードに）
ReadStatusSchema.index({ roomId: 1, username: 1 }, { unique: true });

const ReadStatus = mongoose.model('ReadStatus', ReadStatusSchema);
module.exports = ReadStatus;



//expressでサーバーアプリを作成
const app = express();
const server = http.createServer(app);

//Socket.ioのサーバーインスタンスを作成
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // ReactアプリのURL
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
//新しいクライアントが接続されたときの処理
io.on('connection', (socket) => {
  console.log('クライアント接続:', socket.id);//接続したクライアントの表示
  
  //クライアントからデータが送られた時
  socket.on('send_message', async(data) => {
    console.log('📩 メッセージ受信:', data);

  try {
    // readCount を +1 更新
    await ReadStatus.updateMany(
      { roomId: data.repository },
      { $inc: { readCount: 1 } }
    );

    // 🔽 変更後の readCount を再取得（今回は1ユーザー1 roomId なので findOne でOK）
    const updatedStatus = await ReadStatus.findOne({
      roomId: data.repository,
      username: data.user_name // ← ユーザーごとのレコードにするため必要！
    });

    // 🔼 readCount を data に追加
    data.readCount = updatedStatus?.readCount ?? 0;

  } catch (err) {
    console.error('📛 MongoDBの更新/取得に失敗:', err);
    data.readCount = 0; // エラー時は0を返しておく
  }

  // クライアント全体に送信
  io.emit('receive_message', data);
  });

  //クライアントがブラウザを閉じたり、接続を切ったとき
  socket.on('disconnect', () => {
    console.log('クライアント切断:', socket.id);
  });
});

// JSON形式のリクエストボディをパースする
app.use(express.json());

// テスト用のデータを挿入するルート
app.post('/create-read-status', async (req, res) => {
  const { roomId, username, readCount } = req.body;

  if (!Array.isArray(roomId)) {
    return res.status(400).json({ error: 'roomIdは配列である必要があります' });
  }

  const createdStatuses = [];

  for (const id of roomId) {
    try {
      const existing = await ReadStatus.findOne({ roomId: id, username });

      if (!existing) {
        const newStatus = new ReadStatus({ roomId: id, username, readCount });
        const saved = await newStatus.save();
        createdStatuses.push(saved);
      } else {
        console.log(`既に存在: roomId=${id}, username=${username}`);
      }
    } catch (err) {
      console.error(`作成中にエラー: roomId=${id}`, err);
    }
  }

  res.status(201).json({
    message: '作成処理完了',
    createdCount: createdStatuses.length,
    created: createdStatuses
  });
});



app.post('/read_count_filter', async (req, res) => {
  const { repository_ids, username } = req.body;

  console.log('📩 受信したユーザー名:', username);
  console.log('📦 repository_ids:', repository_ids);

  try {
    const results = await ReadStatus.find({
      roomId: { $in: repository_ids },
      username: username
    }).select('roomId readCount -_id');

    res.status(200).json({
      message: '一致するroomIdのreadCount一覧を返します',
      data: results
    });
  } catch (error) {
    console.error('📛 MongoDB検索エラー:', error);
    res.status(500).json({ error: '検索エラー' });
  }
});
server.listen(4000, () => {
  console.log('サーバー起動: http://localhost:4000');
});
