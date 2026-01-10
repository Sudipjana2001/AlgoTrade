import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

const DisclaimerBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-neutral/10 border-b border-neutral/20 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-neutral" />
          <p className="text-xs text-neutral">
            <strong>Disclaimer:</strong> This platform is for educational and research purposes only. 
            Past performance does not guarantee future results. Not SEBI registered. 
            Please consult a registered investment advisor before making investment decisions.
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-neutral hover:text-neutral/80 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default DisclaimerBanner;
