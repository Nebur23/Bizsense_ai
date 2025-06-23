import { Suspense } from "react";
import MyForm from "./form";

const Page = () => {
  return (
    <div>
      <Suspense fallback={<p>Loading ...</p>}>
        <MyForm />
      </Suspense>
    </div>
  );
};

export default Page;
