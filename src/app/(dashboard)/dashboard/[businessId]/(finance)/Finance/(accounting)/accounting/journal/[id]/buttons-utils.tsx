"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ButtonUtils = () => {
  return (
    <>
      <Button variant='outline' onClick={() => window.print()}>
        Print Entry
      </Button>

      <Button variant='outline' onClick={() => window.history.back()}>
        <ArrowLeft /> Back
      </Button>
    </>
  );
};

export default ButtonUtils;
