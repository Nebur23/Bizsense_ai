//import { ReceiptScanner } from "./(components)/recipt-scanner";
import AddTransactionForm from "./addTransactionForm";

const AddTransactionPage = async () => {
  return (
    <div className='flex w-full flex-1 flex-col gap-8 px-5 sm:px-8 py-7 lg:py-12'>
      <div className='max-w-3xl mx-auto px-5'>
        <div className='flex justify-center md:justify-normal mb-3'>
          <h1 className='text-5xl gradient-title '>Add Transaction</h1>
        </div>

        {/* Ai Recipt Scanner */}

        {/* <ReceiptScanner /> */}

        <AddTransactionForm />
      </div>
    </div>
  );
};

export default AddTransactionPage;
