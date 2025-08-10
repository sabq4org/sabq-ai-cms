"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";
import { MediaPickerModal } from "./MediaPickerModal";

interface MediaPickerButtonProps {
  onSelect: (url: string) => void;
  buttonText?: string;
  acceptedTypes?: string[];
  className?: string;
}

export function MediaPickerButton({
  onSelect,
  buttonText = "إضافة من مكتبة الوسائط",
  acceptedTypes = ["image/"],
  className,
}: MediaPickerButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className={className}
      >
        <Image className="w-4 h-4 ml-2" />
        {buttonText}
      </Button>

      <MediaPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(asset) => {
          onSelect(asset.cloudinaryUrl);
          setOpen(false);
        }}
        title="اختر صورة من مكتبة الوسائط"
        acceptedTypes={acceptedTypes}
      />
    </>
  );
}
