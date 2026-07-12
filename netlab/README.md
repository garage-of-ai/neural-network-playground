# netlab

Frontend của [netlab](../README.md), một sân chơi trực quan hóa neural network lấy cảm hứng từ [TensorFlow Playground](https://playground.tensorflow.org/). Toàn bộ phần dựng mạng, huấn luyện và tính toán (matrix, forward/backward, optimizer...) chạy thẳng trong trình duyệt bằng TypeScript, không phụ thuộc backend hay TensorFlow.

Khu vực chứa mã nguồn chính của ứng dụng, bao gồm cả frontend và backend. Tức là không chỉ phần giao diện, mà toàn bộ phần xây dựng mạng, huấn luyện và tính toán ma trận sẽ được biết bằng TypeScript để chạy thẳng trên trình duyệt mà không phụ thuộc một server backend.

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev): dev server & build
- [@xyflow/react](https://reactflow.dev): vẽ kiến trúc mạng dạng đồ thị
- [motion](https://motion.dev): animation
- [Oxlint](https://oxc.rs): lint

## Bắt đầu

```bash
npm install
npm run dev      # dev server tại http://localhost:5173
```

Các lệnh khác:

```bash
npm run build    # build production vào dist/
npm run preview  # preview bản build
npm run lint     # chạy oxlint
```

## Cấu trúc thư mục

```
src/
├── engine/        # Lõi tính toán
├── components/
│   ├── architectures/  # Phần giao diện cho kiến trúc mạng
│   ├── datasets/       # Phần giao diện tập dữ liệu
│   ├── training/       # Phần giao diện huấn luyện và xem quá trình
│   └── layouts/        # Các phần giao diện khác
├── context/       # Các context react
├── i18n/          # Bản dịch song ngữ Việt-Anh
└── types.ts       # Định nghĩa kiểu dùng chung
```


