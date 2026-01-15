import { useEffect, useState } from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';

interface SuccessAnimationProps {
  title: string;
  message: string;
  onComplete?: () => void;
  duration?: number;
}

const SuccessAnimation = ({ 
  title, 
  message, 
  onComplete, 
  duration = 3000 
}: SuccessAnimationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer1 = setTimeout(() => setIsVisible(true), 100);
    const timer2 = setTimeout(() => setShowContent(true), 600);
    
    // Auto-complete after duration
    const timer3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete, duration]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className={`
        relative bg-card border border-border rounded-2xl p-8 max-w-md mx-4 text-center
        transform transition-all duration-700 ease-out
        ${isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
      `}>
        {/* Sparkle Effects */}
        <div className="absolute -top-2 -right-2">
          <Sparkles className={`
            w-6 h-6 text-primary transition-all duration-1000 delay-300
            ${showContent ? 'opacity-100 rotate-12' : 'opacity-0 rotate-0'}
          `} />
        </div>
        <div className="absolute -bottom-2 -left-2">
          <Sparkles className={`
            w-4 h-4 text-primary/60 transition-all duration-1000 delay-500
            ${showContent ? 'opacity-100 -rotate-12' : 'opacity-0 rotate-0'}
          `} />
        </div>

        {/* Success Icon */}
        <div className={`
          relative mx-auto mb-6 w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 
          flex items-center justify-center transition-all duration-500 delay-200
          ${isVisible ? 'scale-100' : 'scale-0'}
        `}>
          <CheckCircle className={`
            w-12 h-12 text-green-600 dark:text-green-400 transition-all duration-300 delay-700
            ${showContent ? 'scale-100' : 'scale-0'}
          `} />
          
          {/* Pulse Ring */}
          <div className={`
            absolute inset-0 rounded-full border-2 border-green-400 transition-all duration-1000 delay-400
            ${showContent ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}
          `} />
        </div>

        {/* Content */}
        <div className={`
          transition-all duration-500 delay-800
          ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}>
          <h2 className="text-2xl font-serif mb-3 text-foreground">
            {title}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-full bg-muted rounded-full h-1 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r from-primary to-primary/60 transition-all ease-linear ${
              isVisible ? 'w-full' : 'w-0'
            }`}
            style={{ 
              transitionDuration: `${duration}ms` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SuccessAnimation;
