import { Alert } from '@/app/components';
import { MessageState } from '../types';

interface MessageAlertProps {
  message: MessageState;
}

export function MessageAlert({ message }: MessageAlertProps) {
  return (
    <div className="mb-6">
      <Alert
        tipo={message.type}
        mensaje={message.text}
      />
    </div>
  );
}
