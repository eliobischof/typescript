"use client";

import { useRouter } from "next/navigation";
import { Button, ButtonVariants } from "./Button";

export default function BackButton() {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.back()}
      type="button"
      variant={ButtonVariants.Secondary}
    >
      back
    </Button>
  );
}
