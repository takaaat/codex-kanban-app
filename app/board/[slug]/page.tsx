"use client";
import dynamic from "next/dynamic";
import { use } from "react";

const BoardView = dynamic(() => import("./components/BoardView"), {
  ssr: false,
  loading: () => <div className="p-4 text-gray-500">Loading board...</div>,
});

type Props = { params: Promise<{ slug: string }> };

export default function Page({ params }: Props) {
  const p = use(params);
  return <BoardView slug={p.slug} />;
}
