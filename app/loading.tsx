import { Spin } from "antd";

export default function Loading() {
  return (
    <main>
      <h1>Movie Search</h1>
      <Spin size="large" description="Loading movies..." />
    </main>
  );
}
