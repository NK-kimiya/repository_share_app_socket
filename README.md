# 制作物：CodeBridge（コードブリッジ）

## 🎯 目的・背景

ハッカソンに出場した際、私は「チームメンバーのスキルを把握するまでに時間がかかる」という課題を感じました。  
また、ChatGPTなど生成AIの進化により、GitHubのリポジトリを読み解きながら実装や学習を行うスタイルが、以前よりも取りやすくなってきたとも実感しました。

そこで私は、「リポジトリを共有し、質問や議論ができるWebアプリ」を開発しました。  
このアプリでは、チーム開発におけるスキル共有の円滑化と、学習者同士が技術知識を共有し合える環境の実現を目指して制作しました。

アプリの名前は **「CodeBridge（コードブリッジ）」** です。  
その由来は、“プログラミング（コード）を通じて、人と人とをつなぐ架け橋になりたい” という想いから名付けました。

## 🛠 使用した技術スタック

- **フロントエンド**：React  
- **バックエンド**：Django REST Framework、Express.js  
- **データベース**：SQLite（Django側）、MongoDB（Express/Socket側）  
- **リアルタイム通信**：Socket.io（Express）  
- **認証方式**：JWT（JSON Web Token）  
- **AIモデル**：PyTorch（BERTによる文章分類）


## 📦 このリポジトリ（Expressサーバー側）で実装されている主な機能

### 🎯 目的

React側の「リアルタイム掲示板」に対して：

- **Socket.io** でリアルタイムにメッセージを配信  
- **MongoDB** で「誰がどのルームで何件のメッセージを既読か」を記録・管理

---

### 🚀 機能一覧

| 機能名                    | 説明                                                                 |
|---------------------------|----------------------------------------------------------------------|
| 🔌 `send_message` イベント | Socket経由で受信したメッセージを全クライアントに配信。readCount（既読数）も更新 |
| 📥 `/create-read-status`   | 初回アクセス時にユーザーとroomIdの既読ドキュメントを作成                        |
| 📊 `/read_count_filter`    | 指定ユーザー・複数リポジトリ（roomId）に対する readCount を返すAPI             |
| 🗑 `/delete_count`         | 特定のユーザー・リポジトリに対する readCount を 0 にリセット                   |

---

## 📚 使用技術・ライブラリ

| ライブラリ名   | 用途                                        |
|----------------|---------------------------------------------|
| `express`      | HTTPサーバーの構築                          |
| `socket.io`    | WebSocketを使ったリアルタイム通信           |
| `mongoose`     | MongoDBと接続し、既読情報をスキーマ管理     |
| `cors`         | フロントエンド（React）からのアクセス許可  |



## 🗃 使用データベース：MongoDB（Atlas）

MongoDB Atlas のクラスタに接続し、下記のようなスキーマを使用しています：

```js
{
  roomId: String,     // 各リポジトリのID（room単位）
  username: String,   // 利用者の名前
  readCount: Number   // 既読件数（新規投稿が来るたび+1）
}
```



## ⚙️ セットアップ方法（Node.js / Express サーバー）

このプロジェクトは、Socket.io + MongoDB を使ったリアルタイム通知APIを提供する Express サーバーです。以下の手順でローカルで動作確認が可能です。　

・動作確認環境　

node.js → v22.14.0　
npm　→　v10.9.2

### 1. リポジトリをクローン

```bash
git clone https://github.com/NK-kimiya/repository_share_app_socket.git
cd repository_share_app_socket
```

### 2. MongoDB 接続URLの設定

※まだMongoDBを持っていない場合は、MongoDB Atlasに無料登録してクラスタを作成することで接続URIを取得できます。
https://www.mongodb.com/ja-jp/docs/atlas/getting-started/

このプロジェクトでは、MongoDB Atlas に接続するために、以下のように接続URLを指定します。

`server.js` の以下の部分の `"MONGO_URL"` を、**自分のMongoDB接続URIに置き換えてください**：

```js
mongoose.connect('MONGO_URL', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
});
```


### 3. 依存パッケージのインストール
npm install

### 4. サーバーの起動
npm start



