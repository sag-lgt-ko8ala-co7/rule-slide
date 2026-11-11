import type { Metadata } from "next";
import { GameForm } from "@/components/GameForm";

export const metadata: Metadata = {
  title: "新規作成 | ルール説明スライド",
};

export default function NewGamePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">新規作成</h1>
      <GameForm />
    </div>
  );
}
