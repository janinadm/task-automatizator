import { g as useState } from './server.mjs';

let _nextId = 0;
const useToast = () => {
  const toasts = useState("toasts", () => []);
  function show(message, type = "info", duration = 4500) {
    const id = _nextId++;
    toasts.value = [...toasts.value, { id, message, type }];
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }
  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }
  const info = (msg, d) => show(msg, "info", d);
  const success = (msg, d) => show(msg, "success", d);
  const warning = (msg, d) => show(msg, "warning", d);
  const error = (msg, d) => show(msg, "error", d);
  return { toasts, show, dismiss, info, success, warning, error };
};

export { useToast as u };
//# sourceMappingURL=useToast-BbS4urR_.mjs.map
