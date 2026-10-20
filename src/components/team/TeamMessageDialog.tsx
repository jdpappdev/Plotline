import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Copy, ExternalLink, Mail } from 'lucide-react';
import { TeamMember } from '../../domain/types';
import { Dialog } from '../../ui/Dialog';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidRecipientEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_PATTERN.test(email.trim());
}

export function buildMailtoUrl(recipient: string, subject: string, body: string): string {
  const cleanRecipient = recipient.trim();
  const params: string[] = [];
  params.push(`subject=${encodeURIComponent(subject)}`);
  params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${cleanRecipient}?${params.join('&')}`;
}

export function formatEmailClipboardText(recipient: string, subject: string, body: string): string {
  return `To: ${recipient.trim()}\nSubject: ${subject}\n\n${body}`;
}

export interface TeamMessageDialogProps {
  member: TeamMember | null;
  onClose: () => void;
  onPushToast: (title: string, subtitle?: string) => void;
}

export function TeamMessageDialog({ member, onClose, onPushToast }: TeamMessageDialogProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [clipboardError, setClipboardError] = useState<string | null>(null);
  const mailtoAnchorRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (member) {
      setSubject(`Plotline coordination — ${member.department}`);
      setBody(
        `Hi ${member.name.split(' ')[0]},\n\nFollowing up on our current ${member.department} deliverables.\n\nBest,`
      );
      setClipboardError(null);
    }
  }, [member]);

  if (!member) return null;

  const rawEmail = typeof member.email === 'string' ? member.email.trim() : '';
  const hasValidEmail = isValidRecipientEmail(rawEmail);
  const mailtoUrl = hasValidEmail ? buildMailtoUrl(rawEmail, subject, body) : '';

  const handleCopyEmail = async () => {
    if (!hasValidEmail) {
      setClipboardError('Cannot copy email: recipient email address is missing or invalid.');
      return;
    }

    const formattedText = formatEmailClipboardText(rawEmail, subject, body);

    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(formattedText);
      setClipboardError(null);
      onPushToast('Email copied to clipboard', `Ready to paste for ${member.name}`);
    } catch {
      const errorMsg = 'Clipboard access failed. Please copy the message fields manually.';
      setClipboardError(errorMsg);
    }
  };

  const handleOpenEmailApp = () => {
    if (!hasValidEmail) return;
    mailtoAnchorRef.current?.click();
  };

  return (
    <Dialog
      isOpen={Boolean(member)}
      onClose={onClose}
      eyebrow="Direct Message"
      title={`Message ${member.name}`}
      subtitle={`${member.role} · ${member.department}`}
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 min-h-[44px] sm:min-h-0 rounded-full text-xs font-semibold text-[var(--ink-secondary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCopyEmail}
            disabled={!hasValidEmail}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 rounded-full text-xs font-semibold bg-[var(--surface-elevated)] text-[var(--ink-primary)] border border-[var(--border-strong)] hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy email</span>
          </button>

          <button
            type="button"
            onClick={handleOpenEmailApp}
            disabled={!hasValidEmail}
            style={{ backgroundColor: 'var(--accent)' }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 rounded-full text-xs font-semibold text-white hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in email app</span>
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="message-recipient-input"
            className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
          >
            To
          </label>
          <div className="relative flex items-center">
            <Mail className="w-3.5 h-3.5 text-[var(--ink-muted)] absolute left-3 pointer-events-none" />
            <input
              id="message-recipient-input"
              type="email"
              readOnly
              value={rawEmail}
              placeholder="No email address available"
              aria-invalid={!hasValidEmail}
              className="w-full h-10 pl-8 pr-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-hairline)] text-sm text-[var(--ink-secondary)] cursor-default select-all focus:outline-2 focus:outline-[var(--accent)]"
            />
          </div>
          {!hasValidEmail && (
            <p
              role="alert"
              className="mt-1.5 text-xs text-[#C9352B] flex items-center gap-1.5 font-medium"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Recipient email address is missing or invalid.</span>
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="message-subject-input"
            className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
          >
            Subject
          </label>
          <input
            id="message-subject-input"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject"
            className="w-full h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)] focus:bg-[var(--surface-elevated)]"
          />
        </div>

        <div>
          <label
            htmlFor="message-body-input"
            className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
          >
            Body
          </label>
          <textarea
            id="message-body-input"
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message..."
            className="w-full p-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)] focus:bg-[var(--surface-elevated)] resize-y"
          />
        </div>

        {clipboardError && (
          <div
            role="alert"
            className="p-2.5 rounded-[var(--radius-sm)] bg-[#FBECEE] border border-[#F5C2C7] text-xs text-[#C9352B] flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{clipboardError}</span>
          </div>
        )}

        <a
          ref={mailtoAnchorRef}
          href={hasValidEmail ? mailtoUrl : undefined}
          data-testid="message-mailto-link"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        >
          Open in email app
        </a>
      </div>
    </Dialog>
  );
}
