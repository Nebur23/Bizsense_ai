import { Suspense } from "react";
import InputOTPForm from "./otp-form";

const Page = () => {
  return (
    <Suspense>
      <InputOTPForm />
    </Suspense>
  );
};

export default Page;
