import './loading-animation.css';

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Main Fashion Brand Logo Animation */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin duration-3000 opacity-80"></div>
          
          {/* Middle rotating ring (opposite direction) */}
          <div className="absolute inset-2 border-2 border-transparent border-b-primary border-l-primary rounded-full animate-spin-reverse duration-4000 opacity-60"></div>
          
          {/* Inner circle */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="text-2xl font-serif tracking-widest text-primary animate-pulse">
              HC
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h3 className="font-serif text-lg tracking-[0.1em] text-foreground">
            HEZAL THE LABEL
          </h3>
          <div className="flex justify-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mt-3">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
