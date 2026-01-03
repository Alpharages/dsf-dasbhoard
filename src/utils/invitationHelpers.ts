import { InvitationStatus } from '@/types/invitation';

/**
 * Generate the full registration URL for an invite token
 * @param inviteToken - The unique invitation token
 * @returns Full URL string
 */
export const generateInviteLink = (inviteToken: string): string => {
    // robustly handle trailing/leading slashes if simpler concatenation was used,
    // but window.location.origin usually has no trailing slash, and we want /register
    return `${window.location.origin}/register/${inviteToken}`;
};

/**
 * Copy text to clipboard with fallback
 * @param text - Text to copy
 * @returns Promise that resolves when copied
 */
export const copyToClipboard = async (text: string): Promise<void> => {
    if (navigator.clipboard && window.isSecureContext) {
        // Navigator clipboard api method'
        return navigator.clipboard.writeText(text);
    } else {
        // Text area method
        const textArea = document.createElement("textarea");
        textArea.value = text;
        // make the textarea out of viewport
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        return new Promise((resolve, reject) => {
            // here the magic happens
            try {
                document.execCommand('copy');
                textArea.remove();
                resolve();
            } catch (error) {
                textArea.remove();
                reject(new Error('Failed to copy to clipboard'));
            }
        });
    }
};

/**
 * Get status label and color for badges
 * (Optional utility, duplicates some logic in table but robust for reuse)
 */
export const getStatusColor = (status: InvitationStatus): string => {
    switch (status) {
        case InvitationStatus.PENDING: return 'text-yellow-500 bg-yellow-500/20';
        case InvitationStatus.ACCEPTED: return 'text-green-500 bg-green-500/20';
        case InvitationStatus.EXPIRED: return 'text-red-500 bg-red-500/20';
        case InvitationStatus.REVOKED: return 'text-slate-500 bg-slate-500/20';
        default: return 'text-slate-500 bg-slate-500/20';
    }
};
