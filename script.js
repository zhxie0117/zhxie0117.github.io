const filters = document.querySelector('.filter-bar');
const buttons = [...document.querySelectorAll('[data-filter]')];
const papers = [...document.querySelectorAll('[data-category]')];
filters.hidden = false;
buttons.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  let count = 0;
  papers.forEach(paper => {
    paper.hidden = category !== 'all' && paper.dataset.category !== category;
    if (!paper.hidden) count++;
  });
  document.querySelector('#result-count').textContent = `${count} publication${count === 1 ? '' : 's'}`;
}));
