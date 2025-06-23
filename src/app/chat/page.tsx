import Chat from "./(components)/Chat";

export default function Page() {
  return (
    <div>
      <div className='container'>
        <div className='flex h-7 bg-slate-700 justify-between px-2'>
          <div>Logo</div>
          <div>
            To <span className='text-purple-500'>BizSense Ai</span>
          </div>
        </div>

        <Chat />
      </div>
    </div>
  );
}
