import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { MessageState } from '../types';

interface MessageAlertProps {
  message: MessageState;
}

export function MessageAlert({ message }: MessageAlertProps) {
  return (
    <div
      className={`mb-6 p-4 rounded-lg flex items-center ${
        message.type === 'success'
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}
    >
      {message.type === 'success' ? (
        <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
      ) : (
        <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
      )}
      <span>{message.text}</span>
    </div>
  );
}
