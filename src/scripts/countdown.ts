export function initCountdown(selector: string = '.countdown') {
  const deadline = new Date('2027-01-01T00:00:00');
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  document.querySelectorAll(selector).forEach((el) => {
    if (days > 0) {
      el.textContent = `Only ${days} days remaining!`;
    }
  });
}
