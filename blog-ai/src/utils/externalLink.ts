let stylesInjected = false;

function ensureConfirmStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = `
    .ai-confirm-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: rgba(15, 23, 42, 0.38);
      backdrop-filter: blur(10px);
    }
    .ai-confirm-dialog {
      width: min(92vw, 440px);
      padding: 1.15rem 1.15rem 1rem;
      border-radius: 18px;
      border: 1px solid color-mix(in srgb, var(--color-border, #e2e8f0) 88%, transparent);
      background: var(--color-bg, #ffffff);
      color: var(--color-text, #1e293b);
      box-shadow:
        0 18px 48px rgba(15, 23, 42, 0.18),
        0 2px 8px rgba(15, 23, 42, 0.08);
    }
    .ai-confirm-title {
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.4;
      letter-spacing: -0.01em;
    }
    .ai-confirm-content {
      margin-top: .6rem;
      font-size: .875rem;
      line-height: 1.7;
      color: var(--color-text-muted, #64748b);
      word-break: break-all;
    }
    .ai-confirm-url {
      margin-top: .5rem;
      padding: .7rem .8rem;
      border-radius: 12px;
      background: var(--color-bg-soft, #f8fafc);
      border: 1px solid color-mix(in srgb, var(--color-border, #e2e8f0) 90%, transparent);
      font-size: .8125rem;
      line-height: 1.6;
      color: var(--color-text, #1e293b);
      word-break: break-all;
    }
    .ai-confirm-actions {
      margin-top: 1rem;
      display: flex;
      justify-content: flex-end;
      gap: .75rem;
    }
    .ai-confirm-btn {
      height: 36px;
      padding: 0 .95rem;
      border-radius: 10px;
      border: 1px solid transparent;
      font: inherit;
      font-size: .875rem;
      font-weight: 600;
      cursor: pointer;
      transition: background .18s ease, border-color .18s ease, color .18s ease, transform .18s ease;
    }
    .ai-confirm-btn--ghost {
      background: var(--color-bg, #ffffff);
      color: var(--color-text-muted, #64748b);
      border-color: var(--color-border, #e2e8f0);
    }
    .ai-confirm-btn--primary {
      background: var(--color-primary, #6366f1);
      color: #fff;
    }
    .ai-confirm-btn:hover {
      transform: translateY(-1px);
    }
    .ai-confirm-btn--ghost:hover {
      background: var(--color-bg-soft, #f8fafc);
      color: var(--color-text, #1e293b);
    }
    .ai-confirm-btn--primary:hover {
      background: var(--color-primary-dark, #4f46e5);
    }
  `;
  document.head.appendChild(style);
  stylesInjected = true;
}

function openConfirmDialog(title: string, content: string) {
  ensureConfirmStyles();

  return new Promise<boolean>((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'ai-confirm-overlay';
    overlay.innerHTML = `
      <div class="ai-confirm-dialog" role="dialog" aria-modal="true" aria-label="${title}">
        <div class="ai-confirm-title">${title}</div>
        <div class="ai-confirm-content">即将离开当前页面并打开以下地址：</div>
        <div class="ai-confirm-url">${content}</div>
        <div class="ai-confirm-actions">
          <button type="button" class="ai-confirm-btn ai-confirm-btn--ghost" data-action="cancel">取消</button>
          <button type="button" class="ai-confirm-btn ai-confirm-btn--primary" data-action="ok">继续访问</button>
        </div>
      </div>
    `;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cleanup(false);
    };

    const cleanup = (value: boolean) => {
      document.removeEventListener('keydown', handleKeydown);
      overlay.remove();
      resolve(value);
    };

    overlay.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null;
      if (target === overlay) cleanup(false);
      if (target?.dataset.action === 'cancel') cleanup(false);
      if (target?.dataset.action === 'ok') cleanup(true);
    });

    document.addEventListener('keydown', handleKeydown);
    document.body.appendChild(overlay);
  });
}

export function openExternalLink(url: string, label = '目标页面') {
  const target = url.trim();
  if (!target) return;

  void openConfirmDialog('即将跳转外部网站', `${label}：${target}`).then((confirmed) => {
    if (!confirmed) return;
    window.open(target, '_blank', 'noopener,noreferrer');
  });
}
