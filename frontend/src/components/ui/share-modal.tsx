import { useState } from 'react';
import { X, Copy, Check, Facebook, Twitter, Mail, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productUrl: string;
}

export const ShareModal = ({ isOpen, onClose, productName, productUrl }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareText = `Check out ${productName}`;
  const encodedUrl = encodeURIComponent(productUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-blue-50 hover:text-blue-600',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      color: 'hover:bg-sky-50 hover:text-sky-600',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      color: 'hover:bg-green-50 hover:text-green-600',
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodedText}&body=${encodedUrl}`,
      color: 'hover:bg-gray-50 hover:text-gray-600',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif">Share Product</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Copy Link Section */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Product Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={productUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-border rounded bg-secondary text-sm"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Options */}
        <div>
          <label className="text-sm font-medium mb-3 block">Share via</label>
          <div className="grid grid-cols-2 gap-3">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 p-3 border border-border rounded transition-colors ${link.color}`}
              >
                <link.icon size={20} />
                <span className="text-sm font-medium">{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
