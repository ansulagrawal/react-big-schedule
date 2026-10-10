// Native <dialog> based replacements for window.alert / window.confirm, plus a tiny toast.
interface Action {
  label: string;
  primary?: boolean;
  onClick?: () => void;
}

const openDialog = (title: string, content: string, actions: Action[]) => {
  const dialog = document.createElement('dialog');
  dialog.className = 'ex-dialog';

  const heading = document.createElement('h3');
  heading.textContent = title;
  const body = document.createElement('p');
  body.textContent = content;
  const footer = document.createElement('div');
  footer.className = 'ex-dialog-actions';

  for (const action of actions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `ex-btn${action.primary ? ' ex-btn-primary' : ''}`;
    button.textContent = action.label;
    button.addEventListener('click', () => {
      dialog.close();
      action.onClick?.();
    });
    footer.append(button);
  }

  dialog.append(heading, body, footer);
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
};

export const showInfo = (content: string) => openDialog('Info', content, [{ label: 'OK', primary: true }]);

export const confirmAction = (content: string, onOk: () => void) =>
  openDialog('Please confirm', content, [{ label: 'No' }, { label: 'Yes', primary: true, onClick: onOk }]);

export const toast = (text: string) => {
  let host = document.querySelector<HTMLElement>('.ex-toasts');
  if (!host) {
    host = document.createElement('div');
    host.className = 'ex-toasts';
    document.body.append(host);
  }
  const item = document.createElement('div');
  item.className = 'ex-toast';
  item.textContent = text;
  host.append(item);
  setTimeout(() => item.remove(), 3000);
};
