
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BulkUploadModal } from './BulkUploadModal';
import { Upload } from 'lucide-react';

interface BulkUploadButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function BulkUploadButton({ 
  variant = 'outline', 
  size = 'default',
  className 
}: BulkUploadButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={`border-purple-500 text-purple-400 hover:bg-purple-500/10 ${className}`}
      >
        <Upload className="h-4 w-4 mr-2" />
        Bulk Upload
      </Button>

      <BulkUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
