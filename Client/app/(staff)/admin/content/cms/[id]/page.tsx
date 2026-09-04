"use client";

import { useParams } from "next/navigation";
import { CmsEditorPage } from "@/components/admin/AdminContentPages";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <CmsEditorPage id={id} />;
}
