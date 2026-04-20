import { IconHeart } from "@tabler/icons-react";

const Favorites = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full py-20 px-4 text-center">
      <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 max-w-md w-full">
        <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <IconHeart size={32} stroke={2} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Favorites Coming Soon</h2>
        <p className="text-slate-500">
          We are currently working on the favorites feature. You'll soon be able to bookmark your preferred vehicles!
        </p>
      </div>
    </div>
  );
};

export default Favorites;
