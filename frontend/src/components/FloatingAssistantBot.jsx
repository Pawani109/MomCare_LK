import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import assistantBotVideo from '../assets/videos/assistant-bot.mp4';

const FloatingAssistantBot = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const openAssistant = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (window.location.pathname === '/') {
      const assistant = document.getElementById('momcare-assistant');
      if (assistant) {
        assistant.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.history.replaceState(null, '', '#momcare-assistant');
        window.setTimeout(() => {
          document.getElementById('momcare-assistant-input')?.focus();
        }, 550);
        return;
      }
    }

    navigate('/#momcare-assistant');
  };

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-7 sm:right-7 z-[80] flex items-end gap-2 sm:gap-3">
      {/* Speech bubble */}
      <div className="relative mb-4 hidden max-w-[220px] rounded-[22px] border border-pink-100 bg-white px-4 py-3 text-sm font-medium leading-5 text-gray-700 shadow-xl sm:block">
        {user
          ? "Hi! I'm MomCare 💗 How can I help you today?"
          : "Hi! I'm MomCare 💗 Sign in and I'll be ready to help."}
        <span className="absolute -right-2 bottom-5 h-4 w-4 rotate-45 border-r border-t border-pink-100 bg-white" />
      </div>

      {/* Bot button */}
      <button
        type="button"
        onClick={openAssistant}
        aria-label={user ? 'Open MomCare Assistant' : 'Sign in to use MomCare Assistant'}
        title={user ? 'Open MomCare Assistant' : 'Sign in to use MomCare Assistant'}
        className="group relative flex h-[82px] w-[82px] items-center justify-center overflow-visible rounded-full border-4 border-white bg-pink-100 shadow-2xl transition duration-200 hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-200 sm:h-[94px] sm:w-[94px]"
      >
        <span className="absolute -top-3 -left-2 z-20 inline-block origin-bottom-right momcare-wave text-2xl drop-shadow-sm sm:text-3xl">
          👋
        </span>

        <video
          src={assistantBotVideo}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full rounded-full object-cover"
        />

        <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-pink-200" />
        <span className="absolute -bottom-1 right-0 h-5 w-5 rounded-full border-2 border-white bg-green-400 shadow" />
      </button>

      {/* Mobile mini bubble */}
      <div className="pointer-events-none absolute -top-12 right-0 whitespace-nowrap rounded-full border border-pink-100 bg-white px-3 py-1.5 text-[11px] font-semibold text-pink-600 shadow-lg sm:hidden">
        Ask MomCare 💗
      </div>
    </div>
  );
};

export default FloatingAssistantBot;
